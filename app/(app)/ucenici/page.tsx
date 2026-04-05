import { db } from "@/lib/db";
import { Pol } from "@prisma/client";
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
  searchParams: Promise<{
    q?: string;
    odeljenjeId?: string;
    razred?: string;
    pol?: string;
    izborni?: string;
    straniJezik?: string;
    maternji?: string;
    starost?: string;
    page?: string;
    sort?: string;
    dir?: string;
  }>;
}

export default async function UceniciPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const odeljenjeId = sp.odeljenjeId ? parseInt(sp.odeljenjeId) : undefined;
  const razred = sp.razred ? parseInt(sp.razred) : undefined;
  const pol = sp.pol === "MUSKO" ? Pol.MUSKO : sp.pol === "ZENSKO" ? Pol.ZENSKO : undefined;
  const izborni = sp.izborni ?? "";
  const straniJezik = sp.straniJezik ?? "";
  const maternji = sp.maternji ?? "";
  const starost = sp.starost ? parseInt(sp.starost) : undefined;
  const page = parseInt(sp.page ?? "1");
  const sort = sp.sort ?? "prezime";
  const dir = (sp.dir === "desc" ? "desc" : "asc") as "asc" | "desc";
  const limit = 25;

  const noPagination = !!odeljenjeId;
  const needsMemory = sort === "datumRodjenja" || starost !== undefined || noPagination;

  const where: Record<string, unknown> = {};
  if (q) where.OR = [
    { ime: { contains: q, mode: "insensitive" } },
    { prezime: { contains: q, mode: "insensitive" } },
  ];
  if (odeljenjeId) where.odeljenjeId = odeljenjeId;
  if (razred) where.odeljenje = { razred };
  if (pol !== undefined) where.pol = pol;
  if (izborni) where.izborni = { contains: izborni, mode: "insensitive" };
  if (straniJezik) where.straniJezik = { contains: straniJezik, mode: "insensitive" };
  if (maternji) where.maternji = { contains: maternji, mode: "insensitive" };

  const dbOrderBy = sort === "ime"
    ? [{ ime: dir }, { prezime: dir }]
    : [{ prezime: dir as "asc" | "desc" }, { ime: dir as "asc" | "desc" }];

  const [odeljenja, izborniVrednosti, stranJeziciVrednosti, maternjVrednosti, fetched] = await Promise.all([
    db.odeljenje.findMany({ orderBy: [{ razred: "asc" }, { naziv: "asc" }] }),
    db.ucenik.findMany({ distinct: ["izborni"], select: { izborni: true }, where: { izborni: { not: null } }, orderBy: { izborni: "asc" } }),
    db.ucenik.findMany({ distinct: ["straniJezik"], select: { straniJezik: true }, where: { straniJezik: { not: null } }, orderBy: { straniJezik: "asc" } }),
    db.ucenik.findMany({ distinct: ["maternji"], select: { maternji: true }, where: { maternji: { not: null } }, orderBy: { maternji: "asc" } }),
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

  // Helper: builds URLSearchParams from all active filters + overrides
  function params(overrides: Record<string, string | number> = {}) {
    const base: Record<string, string> = {};
    if (q) base.q = q;
    if (odeljenjeId) base.odeljenjeId = String(odeljenjeId);
    if (razred) base.razred = String(razred);
    if (pol) base.pol = pol;
    if (izborni) base.izborni = izborni;
    if (straniJezik) base.straniJezik = straniJezik;
    if (maternji) base.maternji = maternji;
    if (starost !== undefined) base.starost = String(starost);
    base.sort = sort;
    base.dir = dir;
    return new URLSearchParams({ ...base, ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])) }).toString();
  }

  // Base href for sort links (filters only, no sort/dir/page)
  const filterBase: Record<string, string> = {};
  if (q) filterBase.q = q;
  if (odeljenjeId) filterBase.odeljenjeId = String(odeljenjeId);
  if (razred) filterBase.razred = String(razred);
  if (pol) filterBase.pol = pol;
  if (izborni) filterBase.izborni = izborni;
  if (straniJezik) filterBase.straniJezik = straniJezik;
  if (maternji) filterBase.maternji = maternji;
  if (starost !== undefined) filterBase.starost = String(starost);
  const filterStr = new URLSearchParams(filterBase).toString();
  const baseHref = `/ucenici${filterStr ? `?${filterStr}` : ""}`;

  const hasFilters = !!(q || odeljenjeId || razred || pol || izborni || straniJezik || maternji || starost !== undefined);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-brand-900">Učenici</h1>
        <LinkButton href="/ucenici/novi" className="bg-brand-600 hover:bg-brand-700">
          + Novi učenik
        </LinkButton>
      </div>

      {/* Toolbar */}
      <form className="space-y-2 mb-5">
        {/* Red 1: pretraga i odeljenje */}
        <div className="flex gap-3">
          <Input
            name="q"
            defaultValue={q}
            placeholder="🔍 Pretraži po imenu ili prezimenu..."
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
        </div>

        {/* Red 2: napredni filteri */}
        <div className="flex gap-3 flex-wrap">
          <select
            name="pol"
            defaultValue={sp.pol ?? ""}
            className="border border-brand-200 rounded-md px-3 py-2 text-sm bg-white text-slate-700"
          >
            <option value="">Oba pola</option>
            <option value="MUSKO">Muško</option>
            <option value="ZENSKO">Žensko</option>
          </select>
          <select
            name="izborni"
            defaultValue={izborni}
            className="border border-brand-200 rounded-md px-3 py-2 text-sm bg-white text-slate-700 min-w-[160px]"
          >
            <option value="">Svi izborni</option>
            {izborniVrednosti.map((r) => (
              <option key={r.izborni!} value={r.izborni!}>{r.izborni}</option>
            ))}
          </select>
          <select
            name="straniJezik"
            defaultValue={straniJezik}
            className="border border-brand-200 rounded-md px-3 py-2 text-sm bg-white text-slate-700"
          >
            <option value="">Svi strani jezici</option>
            {stranJeziciVrednosti.map((r) => (
              <option key={r.straniJezik!} value={r.straniJezik!}>{r.straniJezik}</option>
            ))}
          </select>
          <select
            name="maternji"
            defaultValue={maternji}
            className="border border-brand-200 rounded-md px-3 py-2 text-sm bg-white text-slate-700"
          >
            <option value="">Svi maternji jezici</option>
            {maternjVrednosti.map((r) => (
              <option key={r.maternji!} value={r.maternji!}>{r.maternji}</option>
            ))}
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
          <Button type="submit" className="bg-brand-600 hover:bg-brand-700">Filtriraj</Button>
          {hasFilters && (
            <LinkButton href="/ucenici" variant="outline" className="border-slate-200 text-slate-500">
              ✕ Resetuj
            </LinkButton>
          )}
        </div>
      </form>

      <UcenikTable ucenici={ucenici} showOdeljenje sort={sort} dir={dir} baseHref={baseHref} />

      {/* Paginacija */}
      <div className="flex justify-between items-center mt-4 text-sm text-slate-500">
        <span>Ukupno {total} učenika</span>
        {!noPagination && pages > 1 && (
          <div className="flex gap-1">
            {page > 1 && (
              <LinkButton href={`/ucenici?${params({ page: page - 1 })}`} variant="outline" size="sm" className="border-brand-200">
                ← Preth.
              </LinkButton>
            )}
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const p = page <= 4 ? i + 1 : page - 3 + i;
              if (p < 1 || p > pages) return null;
              return (
                <LinkButton
                  key={p}
                  href={`/ucenici?${params({ page: p })}`}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className={p === page ? "bg-brand-600" : "border-brand-200"}
                >
                  {p}
                </LinkButton>
              );
            })}
            {page < pages && (
              <LinkButton href={`/ucenici?${params({ page: page + 1 })}`} variant="outline" size="sm" className="border-brand-200">
                Sled. →
              </LinkButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
