import { db } from "@/lib/db";
import { UcenikTable } from "@/components/ucenik-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; odeljenjeId?: string; razred?: string; page?: string }>;
}

export default async function UceniciPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const odeljenjeId = sp.odeljenjeId ? parseInt(sp.odeljenjeId) : undefined;
  const razred = sp.razred ? parseInt(sp.razred) : undefined;
  const page = parseInt(sp.page ?? "1");
  const limit = 25;

  const where: Record<string, unknown> = {};
  if (q) where.OR = [
    { ime: { contains: q, mode: "insensitive" } },
    { prezime: { contains: q, mode: "insensitive" } },
  ];
  if (odeljenjeId) where.odeljenjeId = odeljenjeId;
  if (razred) where.odeljenje = { razred };

  const [ucenici, total, odeljenja] = await Promise.all([
    db.ucenik.findMany({
      where,
      include: { odeljenje: { select: { naziv: true } } },
      orderBy: [{ prezime: "asc" }, { ime: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.ucenik.count({ where }),
    db.odeljenje.findMany({ orderBy: [{ razred: "asc" }, { naziv: "asc" }] }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-brand-900">Učenici</h1>
        <Button asChild className="bg-brand-600 hover:bg-brand-700">
          <Link href="/ucenici/novi">+ Novi učenik</Link>
        </Button>
      </div>

      {/* Toolbar */}
      <form className="flex gap-3 mb-5">
        <Input
          name="q"
          defaultValue={q}
          placeholder="🔍 Pretraži po imenu, prezimenu..."
          className="flex-1 border-brand-200"
        />
        <select
          name="odeljenjeId"
          defaultValue={odeljenjeId ?? ""}
          className="border border-brand-200 rounded-md px-3 py-2 text-sm bg-white text-slate-700 min-w-[140px]"
        >
          <option value="">Sva odeljenja</option>
          {odeljenja.map((o) => (
            <option key={o.id} value={o.id}>{o.naziv}</option>
          ))}
        </select>
        <select
          name="razred"
          defaultValue={razred ?? ""}
          className="border border-brand-200 rounded-md px-3 py-2 text-sm bg-white text-slate-700"
        >
          <option value="">Svi razredi</option>
          <option value="1">I razred</option>
          <option value="2">II razred</option>
          <option value="3">III razred</option>
          <option value="4">IV razred</option>
        </select>
        <Button type="submit" variant="outline" className="border-brand-200">Filtriraj</Button>
      </form>

      <UcenikTable ucenici={ucenici} showOdeljenje />

      {/* Paginacija */}
      <div className="flex justify-between items-center mt-4 text-sm text-slate-500">
        <span>Prikazano {(page - 1) * limit + 1}–{Math.min(page * limit, total)} od {total} učenika</span>
        <div className="flex gap-1">
          {page > 1 && (
            <Button asChild variant="outline" size="sm" className="border-brand-200">
              <Link href={`/ucenici?q=${q}&page=${page - 1}`}>← Preth.</Link>
            </Button>
          )}
          {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              asChild
              variant={p === page ? "default" : "outline"}
              size="sm"
              className={p === page ? "bg-brand-600" : "border-brand-200"}
            >
              <Link href={`/ucenici?q=${q}&page=${p}`}>{p}</Link>
            </Button>
          ))}
          {page < pages && (
            <Button asChild variant="outline" size="sm" className="border-brand-200">
              <Link href={`/ucenici?q=${q}&page=${page + 1}`}>Sled. →</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
