import type OpenAI from "openai";
import {
  getCharacter,
  getDestination,
  getScenario,
} from "./chat-constants";
import type { ChatMessage, VocabularyHighlight } from "@/types/database";
import { ARK_CHAT_MODEL, createArkClient, parseJsonFromModel } from "@/lib/ark";

// ============================================
// System Prompt Builder
// ============================================

export function buildSystemPrompt(
  characterId: string,
  destination: string,
  scenario: string
): string {
  const char = getCharacter(characterId);
  const dest = getDestination(destination);
  const scn = getScenario(scenario);

  if (!char || !dest || !scn) {
    return "You are a friendly English conversation partner.";
  }

  return `You are ${char.name}, ${char.background}.

PERSONALITY: ${char.personality}
SPEAKING STYLE: ${char.speaking_style}

CONTEXT: You and the user are in ${dest.name} (${dest.nameZh}). You are in a "${scn.name}" scenario: ${scn.description}.

YOUR ROLE:
- Stay in character as ${char.name} throughout the conversation
- Speak primarily in English, naturally introducing useful vocabulary
- When you use a word or phrase that's good for the learner to know, wrap it in **bold** markers
- Keep your responses conversational, 2-4 sentences per message
- If the user writes in Chinese, gently encourage them to try in English, but translate what they said to help
- If the user makes a grammar or vocabulary mistake, naturally rephrase it correctly in your response (don't lecture, just model the correct usage)
- Occasionally add a brief Chinese translation in parentheses for key vocabulary, like: "the **concierge** (礼宾员) can help with that"
- Drive the conversation forward by asking questions and suggesting activities relevant to the scenario
- Make the conversation feel like a real social interaction, not a lesson
- Suggested vocabulary to naturally work in: ${scn.suggestedTopics.join(", ")}

IMPORTANT FORMATTING:
- Bold (**word**) any vocabulary worth learning — ONLY English words/phrases inside bold markers, NEVER Chinese characters
- Include Chinese hints in parentheses OUTSIDE bold markers, like: **concierge** (礼宾员)
- Keep messages short and natural (like texting a friend)
- Use casual punctuation and occasional emoji to feel friendly`;
}

// ============================================
// Greeting Message
// ============================================

export function buildGreetingPrompt(
  characterId: string,
  destination: string,
  scenario: string
): string {
  const char = getCharacter(characterId);
  const dest = getDestination(destination);
  const scn = getScenario(scenario);

  if (!char || !dest || !scn) {
    return "Say hello and introduce yourself briefly.";
  }

  return `Generate your opening message to start the conversation. You're meeting the user for the first time in this ${scn.name} scenario in ${dest.name}. Introduce yourself briefly as ${char.name} and set the scene. Keep it natural and friendly, 2-3 sentences. Bold any useful vocabulary.`;
}

// ============================================
// Streaming Chat
// ============================================

export async function streamChatResponse(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): Promise<ReadableStream<Uint8Array>> {
  const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map(
      (m) =>
        ({
          role: m.role,
          content: m.content,
        }) as OpenAI.ChatCompletionMessageParam
    ),
    { role: "user", content: userMessage },
  ];

  const response = await createArkClient().chat.completions.create({
    model: ARK_CHAT_MODEL,
    messages: chatMessages,
    temperature: 0.85,
    stream: true,
    max_tokens: 300,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

// ============================================
// Generate greeting (non-streaming)
// ============================================

export async function generateGreeting(
  characterId: string,
  destination: string,
  scenario: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(characterId, destination, scenario);
  const greetingPrompt = buildGreetingPrompt(characterId, destination, scenario);

  try {
    const response = await createArkClient().chat.completions.create({
      model: ARK_CHAT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: greetingPrompt },
      ],
      temperature: 0.9,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content ?? "Hey there! Ready to explore? 😊";
  } catch (error) {
    console.error("Failed to generate greeting:", error);
    return "Hey! Nice to meet you! Ready for an adventure? 😊";
  }
}

// ============================================
// Extract vocabulary from conversation
// ============================================

export async function extractVocabulary(
  messages: ChatMessage[]
): Promise<VocabularyHighlight[]> {
  const assistantMessages = messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.content)
    .join("\n");

  // Extract **bolded** words from assistant messages (English only)
  const boldPattern = /\*\*([^*]+)\*\*/g;
  const words = new Set<string>();
  let match;
  while ((match = boldPattern.exec(assistantMessages)) !== null) {
    const word = match[1].trim();
    // Only keep entries that contain English letters
    if (/[a-zA-Z]/.test(word)) {
      words.add(word.toLowerCase());
    }
  }

  if (words.size === 0) return [];

  // Ask LLM to provide definitions for extracted words
  const wordList = [...words].join(", ");

  try {
    const response = await createArkClient().chat.completions.create({
      model: ARK_CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: "Return only valid JSON. Do not wrap the response in markdown.",
        },
        {
          role: "user",
          content: `Provide brief definitions for these English words/phrases. Return ONLY valid JSON array:
Words: ${wordList}

Format:
[{"word": "...", "definition": "brief English definition", "definition_zh": "中文翻译", "pronunciation": "IPA"}]`,
        },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = parseJsonFromModel(content);
    const itemSource = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object"
        ? ((parsed as { vocabulary?: unknown; words?: unknown }).words ??
          (parsed as { vocabulary?: unknown; words?: unknown }).vocabulary)
        : [];
    const items = Array.isArray(itemSource) ? itemSource : [];

    return items.map((item) => {
      const record = item as Record<string, string>;
      return {
        word: record.word ?? "",
        definition: record.definition ?? "",
        definition_zh: record.definition_zh ?? "",
        pronunciation: record.pronunciation,
      };
    });
  } catch (error) {
    console.error("Failed to extract vocabulary:", error);
    // Fallback: return words without definitions
    return [...words].map((w) => ({
      word: w,
      definition: "",
      definition_zh: "",
    }));
  }
}
