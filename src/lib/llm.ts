import OpenAI from "openai";
import { z } from "zod";

// GLM-4 via OpenAI-compatible API
const client = new OpenAI({
  apiKey: process.env.ZHIPU_API_KEY ?? "",
  baseURL: process.env.ZHIPU_BASE_URL ?? "https://open.bigmodel.cn/api/paas/v4",
});

// ============================================
// Schemas
// ============================================

const ExampleSentenceSchema = z.object({
  en: z.string(),
  zh: z.string(),
  context: z.string(),
});

const DialogueLineSchema = z.object({
  speaker: z.string(),
  text: z.string(),
});

const VocabularyItemSchema = z.object({
  word: z.string(),
  pronunciation: z.string(),
  definition: z.string(),
  definition_zh: z.string(),
  is_phrase: z.boolean(),
  example_sentences: z.array(ExampleSentenceSchema),
  contextual_dialogue: z.object({
    scenario: z.string(),
    lines: z.array(DialogueLineSchema),
  }),
});

const VocabularyGenerationSchema = z.object({
  vocabulary: z.array(VocabularyItemSchema),
});

const PracticeItemSchema = z.object({
  type: z.literal("fill_in_blank"),
  sentence: z.string(),
  answer: z.string(),
  options: z.array(z.string()),
  vocabulary_id: z.string(),
  word: z.string(),
});

const PracticeGenerationSchema = z.object({
  exercises: z.array(PracticeItemSchema),
});

export type GeneratedVocabulary = z.infer<typeof VocabularyItemSchema>;
export type GeneratedPractice = z.infer<typeof PracticeItemSchema>;

// ============================================
// Vocabulary Generation
// ============================================

const CATEGORY_CONTEXT: Record<string, string> = {
  travel: "travelers visiting English-speaking countries",
  software: "software engineers working in international teams",
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  airport: "Airport & Air Travel",
  hotel: "Hotel & Accommodation",
  restaurant: "Restaurant & Food",
  transportation: "Transportation (taxi, bus, train)",
  directions: "Directions & Navigation",
  shopping: "Shopping & Money",
  emergency: "Emergencies & Health",
  sightseeing: "Sightseeing & Tourism",
  social: "Small Talk & Social",
  booking: "Planning & Booking",
  weather: "Weather & Nature",
  technology: "Technology (WiFi, phone, SIM)",
  technical: "Technical Programming Concepts",
  code_review: "Code Review & Pull Requests",
  meeting: "Meetings & Standup",
  communication: "Slack & Email Communication",
  project_management: "Project Management & Agile",
  client_facing: "Client-Facing Communication",
  documentation: "Technical Documentation",
};

export async function generateVocabulary(params: {
  category: "travel" | "software";
  subcategory: string;
  count: number;
  difficultyTier: number;
  excludeWords: string[];
}): Promise<GeneratedVocabulary[]> {
  const { category, subcategory, count, difficultyTier, excludeWords } = params;

  const prompt = `You are an English vocabulary teacher for Chinese-speaking learners.
Generate exactly ${count} vocabulary items for the category "${SUBCATEGORY_LABELS[subcategory] ?? subcategory}".

Requirements:
- Each word/phrase should be practical for ${CATEGORY_CONTEXT[category]}
- Difficulty level: ${difficultyTier} (1=beginner, 2=intermediate, 3=advanced)
- Do NOT include these words (already learned): ${excludeWords.join(", ") || "none"}
- Vary parts of speech (nouns, verbs, adjectives, phrases)

For each vocabulary item, provide:
1. word: the English word or phrase
2. pronunciation: IPA pronunciation
3. definition: clear English definition (1-2 sentences)
4. definition_zh: Chinese translation
5. is_phrase: true if multi-word phrase
6. example_sentences: exactly 3 examples, each with:
   - en: English sentence using the word naturally
   - zh: Chinese translation
   - context: brief context label
7. contextual_dialogue: a short 4-6 line dialogue using the word, with:
   - scenario: description of the situation
   - lines: array of {speaker, text} objects

Respond ONLY with valid JSON matching this structure:
{
  "vocabulary": [
    {
      "word": "...",
      "pronunciation": "...",
      "definition": "...",
      "definition_zh": "...",
      "is_phrase": false,
      "example_sentences": [{"en": "...", "zh": "...", "context": "..."}],
      "contextual_dialogue": {"scenario": "...", "lines": [{"speaker": "...", "text": "..."}]}
    }
  ]
}`;

  try {
    const response = await client.chat.completions.create({
      model: "glm-4-plus",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    const validated = VocabularyGenerationSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data.vocabulary;
    }

    console.error("LLM output validation failed:", validated.error);
    return [];
  } catch (error) {
    console.error("LLM vocabulary generation error:", error);
    return [];
  }
}

// ============================================
// Practice Generation
// ============================================

export async function generatePracticeItems(
  words: { id: string; word: string; definition: string }[],
  count: number
): Promise<GeneratedPractice[]> {
  if (words.length === 0) return [];

  const wordList = words
    .map((w) => `- "${w.word}" (${w.definition}) [id: ${w.id}]`)
    .join("\n");

  const prompt = `Create ${count} fill-in-the-blank exercises using these vocabulary words:
${wordList}

For each exercise:
1. Write a natural English sentence with the target word replaced by "____"
2. The correct answer is the target word
3. Provide 4 options (including the correct answer) - make wrong options plausible but clearly wrong
4. Include the vocabulary_id and word from the list above

Respond ONLY with valid JSON:
{
  "exercises": [
    {
      "type": "fill_in_blank",
      "sentence": "Please have your ____ ready before boarding.",
      "answer": "boarding pass",
      "options": ["boarding pass", "passport", "ticket", "luggage tag"],
      "vocabulary_id": "the-id-from-above",
      "word": "boarding pass"
    }
  ]
}`;

  try {
    const response = await client.chat.completions.create({
      model: "glm-4-plus",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    const validated = PracticeGenerationSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data.exercises;
    }

    console.error("Practice generation validation failed:", validated.error);
    return [];
  } catch (error) {
    console.error("LLM practice generation error:", error);
    return [];
  }
}
