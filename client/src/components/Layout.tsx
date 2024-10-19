import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-screen flex flex-col futuristic-bg">
      {/* Header with futuristic glow */}
      <Header />

      {/* Main Content with glassmorphism */}
      <main className="flex-1 flex justify-center items-center p-4 futuristic-content">
        <div className="glassmorphism-container rounded-2xl p-8 w-full max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
