// /app/(main)/layout.tsx
// This is a nested layout and must be minimal.

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}