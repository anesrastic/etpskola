import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { UcenikTable } from "@/components/ucenik-table";

export const dynamic = "force-dynamic";

export default async function OdeljenjeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const odeljenje = await db.odeljenje.findUnique({
    where: { id: parseInt(id) },
    include: {
      ucenici: { orderBy: { redniBroj: "asc" } },
      _count: { select: { ucenici: true } },
    },
  });
  if (!odeljenje) notFound();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <div className="text-sm text-slate-500">
          <Link href="/odeljenja" className="text-brand-600 hover:underline">← Odeljenja</Link>
          <span className="mx-2">/</span>
          <span className="text-brand-900 font-semibold">{odeljenje.naziv}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <LinkButton href={`/izvoz?odeljenjeId=${odeljenje.id}`} variant="outline" className="border-brand-200">
            📄 Izvezi spisak
          </LinkButton>
          <LinkButton href={`/odeljenja/${odeljenje.id}/uredi`} className="bg-brand-600 hover:bg-brand-700">
            ✏️ Uredi odeljenje
          </LinkButton>
        </div>
      </div>

      {/* Info kartica */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-brand-900 to-brand-600 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center font-bold text-white text-base sm:text-xl shrink-0">
            {odeljenje.naziv}
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white">Odeljenje {odeljenje.naziv}</div>
            <div className="text-sm text-green-300">{odeljenje.skolskaGodina} · {odeljenje._count.ucenici} učenika</div>
          </div>
        </div>
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="sm:col-span-2">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Smer / Profil</div>
            <div className="text-sm font-medium text-slate-800">{odeljenje.smer}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Stepen</div>
            <Badge className="bg-brand-100 text-brand-800">{odeljenje.stepen}° stepen</Badge>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Jezik nastave</div>
            <div className="text-sm font-medium text-slate-800">{odeljenje.jezik}</div>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Razredni starešina</div>
            <div className="text-sm font-medium text-slate-800">{odeljenje.razredni}</div>
          </div>
        </div>
      </div>

      {/* Učenici */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-brand-900">Učenici odeljenja</h2>
        <LinkButton href={`/ucenici/novi?odeljenjeId=${odeljenje.id}`} size="sm" className="bg-brand-600 hover:bg-brand-700">
          + Dodaj učenika
        </LinkButton>
      </div>
      <UcenikTable ucenici={odeljenje.ucenici.map((u) => ({ ...u, odeljenje: { naziv: odeljenje.naziv } }))} showOdeljenje={false} />
    </div>
  );
}
