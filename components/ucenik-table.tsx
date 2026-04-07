"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";

interface Ucenik {
  id: number;
  ime: string;
  prezime: string;
  datumRodjenja: string;
  telefonUcenika: string | null;
  straniJezik: string | null;
  izborni: string | null;
  napomena: string | null;
  redniBroj: number;
  odeljenje?: { naziv: string };
  odeljenjeId?: number;
}

const NAPOMENA_UPOZORENJE = /ispisan|preminuo|prešao na vanredno|presao na vanredno/i;

function isUcenik(napomena: string | null): boolean {
  return !!napomena && NAPOMENA_UPOZORENJE.test(napomena);
}

interface UcenikTableProps {
  ucenici: Ucenik[];
  showOdeljenje?: boolean;
  sort?: string;
  dir?: "asc" | "desc";
  baseHref?: string;
}

function SortHeader({ label, column, sort, dir, baseHref }: {
  label: string;
  column: string;
  sort?: string;
  dir?: "asc" | "desc";
  baseHref?: string;
}) {
  if (!baseHref) return <th className="px-4 py-3 text-left text-slate-500 font-medium">{label}</th>;

  const isActive = sort === column;
  const nextDir = isActive && dir === "asc" ? "desc" : "asc";
  const sep = baseHref.includes("?") ? "&" : "?";
  const href = `${baseHref}${sep}sort=${column}&dir=${nextDir}`;
  const arrow = isActive ? (dir === "asc" ? " ↑" : " ↓") : " ↕";

  return (
    <th className="px-4 py-3 text-left font-medium">
      <Link href={href} className={`hover:text-brand-700 ${isActive ? "text-brand-700" : "text-slate-500"}`}>
        {label}{arrow}
      </Link>
    </th>
  );
}

export function UcenikTable({ ucenici, showOdeljenje = true, sort, dir, baseHref }: UcenikTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-brand-50 border-b border-brand-100">
            {!showOdeljenje && <th className="px-4 py-3 text-left text-slate-500 font-medium w-10">Br.</th>}
            <SortHeader label="Prezime" column="prezime" sort={sort} dir={dir} baseHref={baseHref} />
            <SortHeader label="Ime" column="ime" sort={sort} dir={dir} baseHref={baseHref} />
            {showOdeljenje && <SortHeader label="Odeljenje" column="odeljenje" sort={sort} dir={dir} baseHref={baseHref} />}
            <SortHeader label="Datum rođenja" column="datumRodjenja" sort={sort} dir={dir} baseHref={baseHref} />
            <th className="px-4 py-3 text-left text-slate-500 font-medium">Telefon</th>
            <th className="px-4 py-3 text-left text-slate-500 font-medium">Strani jezik</th>
            <th className="px-4 py-3 text-left text-slate-500 font-medium">Izborni</th>
            <th className="px-4 py-3 text-center text-slate-500 font-medium">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {ucenici.length === 0 && (
            <tr>
              <td colSpan={showOdeljenje ? 8 : 8} className="px-4 py-8 text-center text-slate-400">
                Nema učenika koji odgovaraju kriterijumima pretrage.
              </td>
            </tr>
          )}
          {ucenici.map((u, i) => (
            <tr key={u.id} className={`border-t border-slate-50 ${isUcenik(u.napomena) ? "bg-red-100 hover:bg-red-100" : `hover:bg-brand-50/40 ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}`}>
              {!showOdeljenje && <td className="px-4 py-2 text-slate-400">{u.redniBroj}</td>}
              <td className="px-4 py-2 font-semibold text-brand-800">{u.prezime}</td>
              <td className="px-4 py-2 text-slate-700">{u.ime}</td>
              {showOdeljenje && u.odeljenje && (
                <td className="px-4 py-2">
                  <Badge className="bg-brand-100 text-brand-800 hover:bg-brand-200">
                    {u.odeljenje.naziv}
                  </Badge>
                </td>
              )}
              <td className="px-4 py-2 text-slate-600">{u.datumRodjenja}</td>
              <td className="px-4 py-2 text-slate-600">{u.telefonUcenika || "—"}</td>
              <td className="px-4 py-2 text-slate-600">{u.straniJezik || "—"}</td>
              <td className="px-4 py-2 text-slate-600">{u.izborni || "—"}</td>
              <td className="px-4 py-2 text-center">
                <div className="flex gap-1 justify-center">
                  <LinkButton href={`/ucenici/${u.id}`} size="sm" variant="outline" className="h-7 px-2 text-xs border-brand-200">
                    👁 Pregled
                  </LinkButton>
                  <LinkButton href={`/ucenici/${u.id}/uredi`} size="sm" variant="outline" className="h-7 px-2 text-xs border-brand-200">
                    ✏️
                  </LinkButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
