"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { generateGreeting, extractVocabulary } from "@/lib/chat-ai";
import type {
  ChatConversation,
  ChatMessage,
  VocabularyHighlight,
} from "@/types/database";

// Guest user ID for trial mode
const GUEST_USER_ID = "00000000-0000-0000-0000-000000000001";

// Check if user is in guest mode
async function isGuestMode(): Promise<boolean> {
  const cookieStore = await cookies();
  const guestCookie = cookieStore.get("guestMode");
  return guestCookie?.value === "true";
}

// Get authenticated user ID (null for guests)
async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Get user ID (authenticated or guest)
async function getUserId(): Promise<string | null> {
  const authId = await getAuthUserId();
  if (authId) return authId;
  if (await isGuestMode()) return GUEST_USER_ID;
  return null;
}

// ============================================
// Get user's conversations
// ============================================

export async function getConversations(): Promise<ChatConversation[]> {
  const authId = await getAuthUserId();
  if (!authId) return []; // Guests don't have persisted conversations

  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("user_id", authId)
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

  const isGuest = userId === GUEST_USER_ID;

  // Generate AI greeting
  const greeting = await generateGreeting(characterId, destination, scenario);

  // Guest mode: return mock conversation without DB
  if (isGuest) {
    const mockConversation: ChatConversation = {
      id: `guest-${crypto.randomUUID()}`,
      user_id: GUEST_USER_ID,
      character_id: characterId,
      destination,
      scenario,
      status: "active",
      vocabulary_learned: [],
      message_count: 1,
      created_at: new Date().toISOString(),
      ended_at: null,
      duration_seconds: null,
      greeting,
    };
    return { success: true, conversation: mockConversation };
  }

  // Authenticated user: persist to DB
  const supabase = await createClient();

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
  const authId = await getAuthUserId();
  if (!authId) return { conversation: null, messages: [] };

  const supabase = await createClient();

  const [convResult, msgResult] = await Promise.all([
    supabase
      .from("chat_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", authId)
      .single(),
    supabase
      .from("chat_conversation_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", authId)
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
  conversationId: string,
  clientMessages?: ChatMessage[]
): Promise<{
  success: boolean;
  vocabulary?: VocabularyHighlight[];
  error?: string;
}> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "未登录" };

  const isGuest = userId === GUEST_USER_ID;

  // For guests, use client-provided messages
  if (isGuest) {
    if (!clientMessages || clientMessages.length === 0) {
      return { success: false, error: "暂无消息" };
    }
    const vocabulary = await extractVocabulary(clientMessages);
    return { success: true, vocabulary };
  }

  // Authenticated user: read from DB
  const supabase = await createClient();

  const { data: messages } = await supabase
    .from("chat_conversation_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (!messages || messages.length === 0) {
    return { success: false, error: "暂无消息" };
  }

  const vocabulary = await extractVocabulary(messages as ChatMessage[]);

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

  await supabase
    .from("chat_conversations")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
    })
    .eq("id", conversationId)
    .eq("user_id", userId);

  return { success: true, vocabulary };
}
