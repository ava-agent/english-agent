"use server";

import { createClient } from "@/lib/supabase/server";
import { generateGreeting, extractVocabulary } from "@/lib/chat-ai";
import { createUserCard } from "@/app/actions/review";
import { Rating, type Grade } from "@/lib/srs";
import type {
  ChatConversation,
  ChatMessage,
  VocabularyHighlight,
} from "@/types/database";

// ============================================
// Get user's conversations
// ============================================

export async function getConversations(): Promise<ChatConversation[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []) as ChatConversation[];
}

// ============================================
// Start a new conversation
// ============================================

export async function startConversation(
  characterId: string,
  destination: string,
  scenario: string
): Promise<{ success: boolean; conversation?: ChatConversation; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "未登录" };

  // Generate AI greeting
  const greeting = await generateGreeting(characterId, destination, scenario);

  // Create conversation
  const { data: conversation, error: convError } = await supabase
    .from("chat_conversations")
    .insert({
      user_id: user.id,
      character_id: characterId,
      destination,
      scenario,
      status: "active",
      vocabulary_learned: [],
      message_count: 1,
    })
    .select()
    .single();

  if (convError || !conversation) {
    return { success: false, error: convError?.message ?? "创建对话失败" };
  }

  // Save greeting message
  await supabase.from("chat_conversation_messages").insert({
    conversation_id: conversation.id,
    user_id: user.id,
    role: "assistant",
    content: greeting,
    metadata: {},
  });

  return { success: true, conversation: conversation as ChatConversation };
}

// ============================================
// Get conversation with messages
// ============================================

export async function getConversationMessages(
  conversationId: string
): Promise<{ conversation: ChatConversation | null; messages: ChatMessage[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { conversation: null, messages: [] };

  const [convResult, msgResult] = await Promise.all([
    supabase
      .from("chat_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("chat_conversation_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  return {
    conversation: (convResult.data as ChatConversation) ?? null,
    messages: (msgResult.data ?? []) as ChatMessage[],
  };
}

// ============================================
// End conversation & extract vocabulary
// ============================================

export async function endConversation(
  conversationId: string
): Promise<{
  success: boolean;
  vocabulary?: VocabularyHighlight[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "未登录" };

  // Get all messages
  const { data: messages } = await supabase
    .from("chat_conversation_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (!messages || messages.length === 0) {
    return { success: false, error: "No messages found" };
  }

  // Extract vocabulary from conversation
  const vocabulary = await extractVocabulary(messages as ChatMessage[]);

  // Get conversation start time for duration
  const { data: conversation } = await supabase
    .from("chat_conversations")
    .select("created_at")
    .eq("id", conversationId)
    .single();

  const durationSeconds = conversation
    ? Math.round(
        (Date.now() - new Date(conversation.created_at).getTime()) / 1000
      )
    : 0;

  // Update conversation
  await supabase
    .from("chat_conversations")
    .update({
      status: "completed",
      vocabulary_learned: vocabulary,
      message_count: messages.length,
      duration_seconds: durationSeconds,
      completed_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  // Add vocabulary to SRS system
  for (const vocab of vocabulary) {
    if (!vocab.word || !vocab.definition) continue;

    // Check if word exists in vocabulary table
    const { data: existing } = await supabase
      .from("vocabulary")
      .select("id")
      .ilike("word", vocab.word)
      .single();

    let vocabularyId: string;

    if (existing) {
      vocabularyId = existing.id;
    } else {
      // Insert new vocabulary
      const { data: inserted } = await supabase
        .from("vocabulary")
        .insert({
          word: vocab.word,
          definition: vocab.definition,
          definition_zh: vocab.definition_zh || null,
          pronunciation: vocab.pronunciation || null,
          category: "travel" as const,
          subcategory: "social",
          difficulty_tier: 1,
          example_sentences: [],
          tags: ["chat-learned"],
          is_phrase: vocab.word.includes(" "),
          source: "llm_generated" as const,
        })
        .select("id")
        .single();

      if (!inserted) continue;
      vocabularyId = inserted.id;
    }

    // Create user card with "Good" rating
    await createUserCard(
      vocabularyId,
      Rating.Good as Grade,
      null,
      0
    );
  }

  return { success: true, vocabulary };
}
