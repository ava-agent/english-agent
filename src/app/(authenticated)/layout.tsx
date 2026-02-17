import { BottomNav } from "@/components/layout/bottom-nav";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-background pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
