import { getConversationMessages } from "@/app/actions/chat";
import { redirect } from "next/navigation";
import { ChatView } from "@/components/chat/chat-view";
import { GuestChatLoader } from "./guest-loader";

export default async function ChatConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Guest conversations are handled client-side
  if (id.startsWith("guest-")) {
    return <GuestChatLoader conversationId={id} />;
  }

  const { conversation, messages } = await getConversationMessages(id);

  if (!conversation) {
    redirect("/chat");
  }

  return (
    <ChatView
      conversation={conversation}
      initialMessages={messages}
    />
  );
}
