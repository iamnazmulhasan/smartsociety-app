export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This div now handles both the black background and the centering
    // for the login and register pages, without affecting the card shapes.
    <div className="bg-black min-h-screen flex items-center justify-center p-4">
      {children}
    </div>
  );
}