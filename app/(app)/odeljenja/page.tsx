import { db } from "@/lib/db";
import { OdeljenjeCard } from "@/components/odeljenje-card";

export const dynamic = "force-dynamic";

export default async function OdeljenjaPage() {
  const odeljenja = await db.odeljenje.findMany({
    orderBy: [{ razred: "asc" }, { naziv: "asc" }],
    include: { _count: { select: { ucenici: true } } },
  });

  const poRazredu = [1, 2, 3, 4].map((r) => ({
    razred: r,
    naziv: ["I razred", "II razred", "III razred", "IV razred"][r - 1],
    odeljenja: odeljenja.filter((o) => o.razred === r),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900 mb-6">Odeljenja</h1>
      {poRazredu.map(({ razred, naziv, odeljenja: lista }) => (
        lista.length > 0 && (
          <div key={razred} className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{naziv}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {lista.map((o) => (
                <OdeljenjeCard
                  key={o.id}
                  id={o.id}
                  naziv={o.naziv}
                  smer={o.smer}
                  stepen={o.stepen}
                  jezik={o.jezik}
                  razredni={o.razredni}
                  brojUcenika={o._count.ucenici}
                />
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
