import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { UpisIspisForm } from "@/components/upis-ispis-form";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
}

export default async function UpisIspisPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const filter = (sp.filter ?? "sve") as "sve" | "upisani" | "ispisani";
  const page = parseInt(sp.page ?? "1");
  const limit = 25;

  const where: Record<string, unknown> = {};
  if (q) where.OR = [
    { ime: { contains: q, mode: "insensitive" } },
    { prezime: { contains: q, mode: "insensitive" } },
  ];
  if (filter === "upisani") where.datumUpisa = { not: null };
  if (filter === "ispisani") where.datumIspisa = { not: null };

  const [unosi, total] = await Promise.all([
    db.upisIspis.findMany({
      where,
      orderBy: { kreiran: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.upisIspis.count({ where }),
  ]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <h1 className="text-2xl font-bold text-brand-900">Upis / Ispis</h1>
        <UpisIspisForm />
      </div>

      {/* Toolbar */}
      <form className="flex flex-wrap gap-2 mb-5">
        <input name="q" defaultValue={q} placeholder="🔍 Pretraži..." className="flex-1 min-w-[160px] border border-brand-200 rounded-md px-3 py-2 text-sm" />
        <select name="filter" defaultValue={filter} className="border border-brand-200 rounded-md px-3 py-2 text-sm bg-white">
          <option value="sve">Sve</option>
          <option value="upisani">Samo upisani</option>
          <option value="ispisani">Samo ispisani</option>
        </select>
        <Button type="submit" variant="outline" className="border-brand-200">Filtriraj</Button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-50 border-b border-brand-100">
              <th className="px-4 py-3 text-left text-slate-500 font-medium">Ime i prezime</th>
              <th className="px-4 py-3 text-left text-slate-500 font-medium">Odeljenje</th>
              <th className="px-4 py-3 text-left text-slate-500 font-medium">Datum upisa</th>
              <th className="px-4 py-3 text-left text-slate-500 font-medium">Datum ispisa</th>
              <th className="px-4 py-3 text-left text-slate-500 font-medium">Napomena</th>
            </tr>
          </thead>
          <tbody>
            {unosi.map((u, i) => (
              <tr key={u.id} className={`border-t border-slate-50 ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                <td className="px-4 py-2 font-semibold text-brand-800">{u.prezime} {u.ime}</td>
                <td className="px-4 py-2 text-slate-600">{u.odeljenje || "—"}</td>
                <td className="px-4 py-2 text-green-600 font-medium">{u.datumUpisa || "—"}</td>
                <td className="px-4 py-2 text-red-500 font-medium">{u.datumIspisa || "—"}</td>
                <td className="px-4 py-2 text-slate-500 text-xs">{u.napomena || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-slate-500">
        <span>{total} unosa ukupno</span>
      </div>
    </div>
  );
}
