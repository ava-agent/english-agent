"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { generateGreeting, extractVocabulary } from "@/lib/chat-ai";
import type {
  ChatConversation,
  ChatMessage,
  VocabularyHighlight,
} from "@/types/database";

// Guest user ID for trial mode (not exported - server actions only allow async function exports)
const GUEST_USER_ID = "00000000-0000-0000-0000-000000000001";

// Check if user is in guest mode
async function isGuestMode(): Promise<boolean> {
  const cookieStore = await cookies();
  const guestCookie = cookieStore.get("guestMode");
  return guestCookie?.value === "true";
}

// Get user ID (authenticated or guest)
async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return user.id;

  // Check for guest mode
  if (await isGuestMode()) {
    return GUEST_USER_ID;
  }

  return null;
}

// ============================================
// Get user's conversations
// ============================================

export async function getConversations(): Promise<ChatConversation[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("user_id", userId)
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
  const userId = await getUserId();
  if (!userId) return { success: false, error: "未登录" };

  const supabase = await createClient();

  // Generate AI greeting
  const greeting = await generateGreeting(characterId, destination, scenario);

  // Create conversation
  const { data: conversation, error: convError } = await supabase
    .from("chat_conversations")
    .insert({
      user_id: userId,
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
    user_id: userId,
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
  const userId = await getUserId();
  if (!userId) return { conversation: null, messages: [] };

  const supabase = await createClient();

  const [convResult, msgResult] = await Promise.all([
    supabase
      .from("chat_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single(),
    supabase
      .from("chat_conversation_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
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
  const userId = await getUserId();
  if (!userId) return { success: false, error: "未登录" };

  const supabase = await createClient();

  // Get all messages
  const { data: messages } = await supabase
    .from("chat_conversation_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (!messages || messages.length === 0) {
    return { success: false, error: "暂无消息" };
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

  // Update conversation status
  await supabase
    .from("chat_conversations")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
    })
    .eq("id", conversationId)
    .eq("user_id", userId);

  // Note: Vocabulary card saving is skipped for now
  // In guest mode, we just display the vocabulary without persisting

  return {
    success: true,
    vocabulary,
  };
}
