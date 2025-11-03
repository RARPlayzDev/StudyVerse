// Version 1.0 Final Push

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-950 via-slate-900 to-purple-950">
      {children}
    </main>
  );
}
