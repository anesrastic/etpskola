import { db } from "@/lib/db";
import { StatsCard } from "@/components/stats-card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    ukupnoUcenika,
    ukupnoOdeljenja,
    upisani,
    ispisani,
    odeljenja,
    stranijezici,
    izborni,
  ] = await Promise.all([
    db.ucenik.count(),
    db.odeljenje.count(),
    db.upisIspis.count({ where: { datumUpisa: { not: null }, datumIspisa: null } }),
    db.upisIspis.count({ where: { datumIspisa: { not: null } } }),
    db.odeljenje.findMany({
      orderBy: [{ razred: "asc" }, { naziv: "asc" }],
      include: { _count: { select: { ucenici: true } } },
    }),
    db.ucenik.groupBy({ by: ["straniJezik"], _count: true, orderBy: { _count: { straniJezik: "desc" } } }),
    db.ucenik.groupBy({ by: ["izborni"], _count: true, orderBy: { _count: { izborni: "desc" } } }),
  ]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Pregled škole</h1>
          <p className="text-sm text-slate-500">Školska godina 2025/2026</p>
        </div>
        <Link
          href="/ucenici"
          className="self-start sm:self-auto bg-white border border-brand-200 rounded-lg px-4 py-2 text-sm text-slate-600 hover:border-brand-400 transition-colors"
        >
          🔍 Pretraži učenike
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatsCard label="Ukupno učenika" value={ukupnoUcenika} />
        <StatsCard label="Odeljenja" value={ukupnoOdeljenja} />
        <StatsCard label="Upisani" value={`+${upisani}`} color="green" />
        <StatsCard label="Ispisani" value={`−${ispisani}`} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-brand-900 text-sm">Odeljenja po razredu</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-50">
                  <th className="px-4 py-2 text-left text-slate-500 font-medium">Odeljenje</th>
                  <th className="px-4 py-2 text-left text-slate-500 font-medium">Smer</th>
                  <th className="px-4 py-2 text-right text-slate-500 font-medium">Učenici</th>
                </tr>
              </thead>
              <tbody>
                {odeljenja.map((o) => (
                  <tr key={o.id} className="border-t border-slate-50 hover:bg-brand-50/50">
                    <td className="px-4 py-2">
                      <Link href={`/odeljenja/${o.id}`} className="font-semibold text-brand-800 hover:text-brand-600">
                        {o.naziv}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-500 truncate max-w-[140px]">{o.smer}</td>
                    <td className="px-4 py-2 text-right font-semibold text-brand-900">{o._count.ucenici}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-brand-900 text-sm mb-3">Strani jezici</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stranijezici.map((g) => (
                <div key={g.straniJezik} className="bg-brand-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500">{g.straniJezik || "—"}</div>
                  <div className="text-xl font-bold text-brand-900">{g._count}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-brand-900 text-sm mb-3">Izborni predmet</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {izborni.map((g) => (
                <div key={g.izborni} className="bg-brand-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500">{g.izborni || "—"}</div>
                  <div className="text-xl font-bold text-brand-900">{g._count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
