import { db } from "@/lib/db";
import { UcenikTable } from "@/components/ucenik-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";

export const dynamic = "force-dynamic";

function parseDatum(s: string | null | undefined): Date | null {
  if (!s) return null;
  const match = s.replace(/\.$/, "").match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;
  return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
}

function calcAge(datumRodjenja: string): number | null {
  const d = parseDatum(datumRodjenja);
  if (!d) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  if (today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) age--;
  return age;
}

interface PageProps {
  searchParams: Promise<{ q?: string; odeljenjeId?: string; razred?: string; page?: string; sort?: string; dir?: string; starost?: string }>;
}

export default async function UceniciPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const odeljenjeId = sp.odeljenjeId ? parseInt(sp.odeljenjeId) : undefined;
  const razred = sp.razred ? parseInt(sp.razred) : undefined;
  const page = parseInt(sp.page ?? "1");
  const sort = sp.sort ?? "prezime";
  const dir = (sp.dir === "desc" ? "desc" : "asc") as "asc" | "desc";
  const starost = sp.starost ? parseInt(sp.starost) : undefined;
  const limit = 25;

  // No pagination when a specific class is selected (show all students)
  const noPagination = !!odeljenjeId;

  // Date sorting and age filter require in-memory processing
  const needsMemory = sort === "datumRodjenja" || starost !== undefined || noPagination;

  const where: Record<string, unknown> = {};
  if (q) where.OR = [
    { ime: { contains: q, mode: "insensitive" } },
    { prezime: { contains: q, mode: "insensitive" } },
  ];
  if (odeljenjeId) where.odeljenjeId = odeljenjeId;
  if (razred) where.odeljenje = { razred };

  const dbOrderBy = sort === "ime"
    ? [{ ime: dir }, { prezime: dir }]
    : [{ prezime: dir as "asc" | "desc" }, { ime: dir as "asc" | "desc" }];

  const [odeljenja, fetched] = await Promise.all([
    db.odeljenje.findMany({ orderBy: [{ razred: "asc" }, { naziv: "asc" }] }),
    db.ucenik.findMany({
      where,
      include: { odeljenje: { select: { naziv: true } } },
      orderBy: needsMemory ? [{ prezime: "asc" }, { ime: "asc" }] : dbOrderBy,
      ...(needsMemory ? {} : { skip: (page - 1) * limit, take: limit }),
    }),
  ]);

  let processed = fetched;

  if (needsMemory) {
    if (sort === "datumRodjenja") {
      processed = [...fetched].sort((a, b) => {
        const da = parseDatum(a.datumRodjenja)?.getTime() ?? 0;
        const db2 = parseDatum(b.datumRodjenja)?.getTime() ?? 0;
        return dir === "asc" ? da - db2 : db2 - da;
      });
    }
    if (starost !== undefined) {
      processed = processed.filter(u => calcAge(u.datumRodjenja) === starost);
    }
  }

  const total = needsMemory ? processed.length : await db.ucenik.count({ where });
  const ucenici = needsMemory ? processed.slice((page - 1) * limit, page * limit) : processed;
  const pages = Math.ceil(total / limit);

  // Base href for sort links (preserves all filters, resets page)
  const filterParams = new URLSearchParams();
  if (q) filterParams.set("q", q);
  if (odeljenjeId) filterParams.set("odeljenjeId", String(odeljenjeId));
  if (razred) filterParams.set("razred", String(razred));
  if (starost !== undefined) filterParams.set("starost", String(starost));
  const filterStr = filterParams.toString();
  const baseHref = `/ucenici${filterStr ? `?${filterStr}` : ""}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-brand-900">Učenici</h1>
        <LinkButton href="/ucenici/novi" className="bg-brand-600 hover:bg-brand-700">
          + Novi učenik
        </LinkButton>
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
        <Input
          name="starost"
          type="number"
          min="14"
          max="25"
          defaultValue={starost ?? ""}
          placeholder="Starost (god.)"
          className="w-36 border-brand-200"
        />
        <Button type="submit" variant="outline" className="border-brand-200">Filtriraj</Button>
        {(q || odeljenjeId || razred || starost !== undefined) && (
          <LinkButton href="/ucenici" variant="outline" className="border-slate-200 text-slate-500">✕</LinkButton>
        )}
      </form>

      <UcenikTable ucenici={ucenici} showOdeljenje sort={sort} dir={dir} baseHref={baseHref} />

      {/* Paginacija — sakrivena kada je odabrano konkretno odeljenje */}
      <div className="flex justify-between items-center mt-4 text-sm text-slate-500">
        <span>Ukupno {total} učenika</span>
        {!noPagination && (
          <div className="flex gap-1">
            {page > 1 && (
              <LinkButton href={`/ucenici?${new URLSearchParams({ q, sort, dir, page: String(page - 1), ...(razred ? { razred: String(razred) } : {}), ...(starost !== undefined ? { starost: String(starost) } : {}) })}`} variant="outline" size="sm" className="border-brand-200">
                ← Preth.
              </LinkButton>
            )}
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
              <LinkButton
                key={p}
                href={`/ucenici?${new URLSearchParams({ q, sort, dir, page: String(p), ...(razred ? { razred: String(razred) } : {}), ...(starost !== undefined ? { starost: String(starost) } : {}) })}`}
                variant={p === page ? "default" : "outline"}
                size="sm"
                className={p === page ? "bg-brand-600" : "border-brand-200"}
              >
                {p}
              </LinkButton>
            ))}
            {page < pages && (
              <LinkButton href={`/ucenici?${new URLSearchParams({ q, sort, dir, page: String(page + 1), ...(razred ? { razred: String(razred) } : {}), ...(starost !== undefined ? { starost: String(starost) } : {}) })}`} variant="outline" size="sm" className="border-brand-200">
                Sled. →
              </LinkButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
