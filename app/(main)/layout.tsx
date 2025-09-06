// /app/(main)/layout.tsx
import Header from "@/components/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen">
      <Header />
      <div className="pt-24">{children}</div>
    </div>
  );
}