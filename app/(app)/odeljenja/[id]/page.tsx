import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      <div className="flex justify-between items-center mb-5">
        <div className="text-sm text-slate-500">
          <Link href="/odeljenja" className="text-brand-600 hover:underline">← Odeljenja</Link>
          <span className="mx-2">/</span>
          <span className="text-brand-900 font-semibold">{odeljenje.naziv}</span>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="border-brand-200">
            <Link href={`/izvoz?odeljenjeId=${odeljenje.id}`}>📄 Izvezi spisak</Link>
          </Button>
          <Button asChild className="bg-brand-600 hover:bg-brand-700">
            <Link href={`/odeljenja/${odeljenje.id}/uredi`}>✏️ Uredi odeljenje</Link>
          </Button>
        </div>
      </div>

      {/* Info kartica */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-brand-900 to-brand-600 p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center font-bold text-white text-xl">
            {odeljenje.naziv}
          </div>
          <div>
            <div className="text-xl font-bold text-white">Odeljenje {odeljenje.naziv}</div>
            <div className="text-sm text-green-300">{odeljenje.skolskaGodina} · {odeljenje._count.ucenici} učenika</div>
          </div>
        </div>
        <div className="p-5 grid grid-cols-4 gap-5">
          <div className="col-span-2">
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
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Razredni starešina</div>
            <div className="text-sm font-medium text-slate-800">{odeljenje.razredni}</div>
          </div>
        </div>
      </div>

      {/* Učenici */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-brand-900">Učenici odeljenja</h2>
        <Button asChild size="sm" className="bg-brand-600 hover:bg-brand-700">
          <Link href={`/ucenici/novi?odeljenjeId=${odeljenje.id}`}>+ Dodaj učenika</Link>
        </Button>
      </div>
      <UcenikTable ucenici={odeljenje.ucenici.map((u) => ({ ...u, odeljenje: { naziv: odeljenje.naziv } }))} showOdeljenje={false} />
    </div>
  );
}
