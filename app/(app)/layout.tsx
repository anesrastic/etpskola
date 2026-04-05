import { Nav } from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-50">
      <Nav />
      <main className="container mx-auto px-3 sm:px-5 py-4 sm:py-6 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
