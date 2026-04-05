"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "📊 Pregled" },
  { href: "/ucenici", label: "👥 Učenici" },
  { href: "/odeljenja", label: "🏫 Odeljenja" },
  { href: "/upis-ispis", label: "📋 Upis / Ispis" },
  { href: "/izvoz", label: "📄 Izvoz" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-brand-900 h-13 px-5 flex items-center gap-1">
      <span className="text-white font-bold text-base mr-6 shrink-0">
        🏫 eTPŠkola
      </span>
      <div className="flex gap-1 flex-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm px-4 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-green-300 hover:text-white hover:bg-brand-800"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <button
        onClick={handleLogout}
        className="text-xs text-green-400 hover:text-white transition-colors px-3 py-1"
      >
        Odjavi se
      </button>
    </nav>
  );
}
