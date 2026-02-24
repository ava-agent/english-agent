import { getConversationMessages } from "@/app/actions/chat";
import { redirect } from "next/navigation";
import { ChatView } from "@/components/chat/chat-view";

export default async function ChatConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
