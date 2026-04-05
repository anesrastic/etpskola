"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Ucenik {
  id: number;
  ime: string;
  prezime: string;
  datumRodjenja: string;
  telefonUcenika: string | null;
  straniJezik: string | null;
  izborni: string | null;
  redniBroj: number;
  odeljenje?: { naziv: string };
  odeljenjeId?: number;
}

interface UcenikTableProps {
  ucenici: Ucenik[];
  showOdeljenje?: boolean;
}

export function UcenikTable({ ucenici, showOdeljenje = true }: UcenikTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-brand-50 border-b border-brand-100">
            {!showOdeljenje && <th className="px-4 py-3 text-left text-slate-500 font-medium w-10">Br.</th>}
            <th className="px-4 py-3 text-left text-slate-500 font-medium">Ime i prezime</th>
            {showOdeljenje && <th className="px-4 py-3 text-left text-slate-500 font-medium">Odeljenje</th>}
            <th className="px-4 py-3 text-left text-slate-500 font-medium">Datum rođenja</th>
            <th className="px-4 py-3 text-left text-slate-500 font-medium">Telefon</th>
            <th className="px-4 py-3 text-left text-slate-500 font-medium">Strani jezik</th>
            <th className="px-4 py-3 text-left text-slate-500 font-medium">Izborni</th>
            <th className="px-4 py-3 text-center text-slate-500 font-medium">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {ucenici.map((u, i) => (
            <tr key={u.id} className={`border-t border-slate-50 hover:bg-brand-50/40 ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
              {!showOdeljenje && <td className="px-4 py-2 text-slate-400">{u.redniBroj}</td>}
              <td className="px-4 py-2 font-semibold text-brand-800">{u.prezime} {u.ime}</td>
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
                  <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs border-brand-200">
                    <Link href={`/ucenici/${u.id}`}>👁 Pregled</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs border-brand-200">
                    <Link href={`/ucenici/${u.id}/uredi`}>✏️</Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
