import { getConversations } from "@/app/actions/chat";
import { ChatPageClient } from "./client";

export default async function ChatPage() {
  const conversations = await getConversations();

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold">情景对话</h1>
        <p className="text-sm text-muted-foreground">
          选择目的地，开始模拟英语社交
        </p>
      </div>

      <ChatPageClient initialConversations={conversations} />
    </div>
  );
}
