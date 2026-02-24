import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt, streamChatResponse } from "@/lib/chat-ai";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, message } = await request.json();

  if (!conversationId || !message || typeof message !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Get conversation
  const { data: conversation } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  if (conversation.status !== "active") {
    return NextResponse.json({ error: "Conversation ended" }, { status: 400 });
  }

  // Save user message
  await supabase.from("chat_conversation_messages").insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: "user",
    content: message.trim(),
    metadata: {},
  });

  // Get recent message history (last 20 for context)
  const { data: history } = await supabase
    .from("chat_conversation_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  const messageHistory = (history ?? [])
    .filter((m: { role: string }) => m.role !== "system")
    .map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  // Build system prompt
  const systemPrompt = buildSystemPrompt(
    conversation.character_id,
    conversation.destination,
    conversation.scenario
  );

  // Stream AI response
  const stream = await streamChatResponse(
    systemPrompt,
    messageHistory,
    message.trim()
  );

  // Collect full response while streaming to client
  const [clientStream, collectorStream] = stream.tee();

  // Save the full AI response after streaming completes
  const saveResponse = async () => {
    const reader = collectorStream.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value, { stream: true });
      }

      if (fullContent) {
        await supabase.from("chat_conversation_messages").insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: "assistant",
          content: fullContent,
          metadata: {},
        });

        // Update message count
        await supabase
          .from("chat_conversations")
          .update({ message_count: (conversation.message_count ?? 0) + 2 })
          .eq("id", conversationId);
      }
    } catch (error) {
      console.error("Failed to save AI response:", error);
    }
  };

  // Fire and forget the save operation
  saveResponse();

  return new Response(clientStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
