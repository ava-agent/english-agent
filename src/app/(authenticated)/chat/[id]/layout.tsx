export default function ChatConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Override parent layout's pb-20 and hide bottom nav for full-screen chat
  return (
    <div className="fixed inset-0 z-[60] bg-background">
      {children}
    </div>
  );
}
