"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <nav className="bg-brand-900">
      {/* Top bar */}
      <div className="px-5 h-13 flex items-center gap-1">
        <span className="text-white font-bold text-base mr-6 shrink-0 flex-1 md:flex-none">
          🏫 eTPŠkola
        </span>

        {/* Desktop nav links */}
        <div className="hidden md:flex gap-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm px-4 py-2 rounded-md transition-colors",
                isActive(item.href)
                  ? "bg-brand-600 text-white"
                  : "text-green-300 hover:text-white hover:bg-brand-800"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop logout */}
        <button
          onClick={handleLogout}
          className="hidden md:block text-xs text-green-400 hover:text-white transition-colors px-3 py-1"
        >
          Odjavi se
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-white p-2 rounded-md hover:bg-brand-800 transition-colors"
          aria-label="Otvori meni"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden border-t border-brand-800 px-3 pb-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block text-sm px-4 py-3 rounded-md transition-colors mt-1",
                isActive(item.href)
                  ? "bg-brand-600 text-white"
                  : "text-green-300 hover:text-white hover:bg-brand-800"
              )}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="block w-full text-left text-sm px-4 py-3 mt-1 rounded-md text-green-400 hover:text-white hover:bg-brand-800 transition-colors"
          >
            🚪 Odjavi se
          </button>
        </div>
      )}
    </nav>
  );
}
