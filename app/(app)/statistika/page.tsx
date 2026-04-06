import { db } from "@/lib/db";
import { Pol } from "@prisma/client";
import { StatsTable } from "@/components/stats-table";

export const dynamic = "force-dynamic";

function parseDatum(s: string | null | undefined): Date | null {
  if (!s) return null;
  const match = s.replace(/\.$/, "").match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;
  return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
}

const today = new Date();

function getAge(datumRodjenja: string): number | null {
  const d = parseDatum(datumRodjenja);
  if (!d) return null;
  let age = today.getFullYear() - d.getFullYear();
  if (today.getMonth() < d.getMonth() ||
    (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) age--;
  return age;
}

function ageBucket(datumRodjenja: string): string | null {
  const age = getAge(datumRodjenja);
  if (age === null || age < 14) return null;
  if (age >= 19) return "19+";
  return String(age);
}

const RAZREDI = [1, 2, 3, 4] as const;
const RAZRED_LABEL = ["I", "II", "III", "IV"];
const AGE_LABELS = ["14", "15", "16", "17", "18", "19+"];

export default async function StatistikaPage() {
  const [odeljenja, ucenici] = await Promise.all([
    db.odeljenje.findMany({
      select: { id: true, razred: true, smer: true },
    }),
    db.ucenik.findMany({
      include: { odeljenje: { select: { razred: true, smer: true } } },
    }),
  ]);

  // ── Sekcija 1: Odeljenja i učenici po razredu ──────────────────────────
  const s1 = RAZREDI.map((r) => {
    const ukupno = ucenici.filter((u) => u.odeljenje.razred === r).length;
    const ucenice = ucenici.filter((u) => u.odeljenje.razred === r && u.pol === Pol.ZENSKO).length;
    return [RAZRED_LABEL[r - 1], odeljenja.filter((o) => o.razred === r).length, ukupno, ucenice];
  });
  const s1Total = [
    "Ukupno",
    odeljenja.length,
    ucenici.length,
    ucenici.filter((u) => u.pol === Pol.ZENSKO).length,
  ];

  // ── Sekcija 2: Učenici po profilu i razredu ────────────────────────────
  const smeri = [...new Set(odeljenja.map((o) => o.smer))].sort();
  const s2 = smeri.map((smer) => {
    const poRazredu = RAZREDI.map((r) =>
      ucenici.filter((u) => u.odeljenje.smer === smer && u.odeljenje.razred === r).length
    );
    return [smer, ...poRazredu, ucenici.filter((u) => u.odeljenje.smer === smer).length];
  });
  const s2Total = [
    "Ukupno",
    ...RAZREDI.map((r) => ucenici.filter((u) => u.odeljenje.razred === r).length),
    ucenici.length,
  ];

  // ── Sekcija 3: Strani jezici ───────────────────────────────────────────
  const jezici = [...new Set(ucenici.map((u) => u.straniJezik).filter(Boolean))].sort() as string[];
  const s3 = jezici.map((j) => [j, ucenici.filter((u) => u.straniJezik === j).length]);

  // ── Sekcija 4: Starosna struktura ──────────────────────────────────────
  const s4 = AGE_LABELS.map((label) => {
    const grupa = ucenici.filter((u) => ageBucket(u.datumRodjenja) === label);
    return [label, grupa.length, grupa.filter((u) => u.pol === Pol.ZENSKO).length];
  });
  const s4Total = [
    "Ukupno",
    ucenici.length,
    ucenici.filter((u) => u.pol === Pol.ZENSKO).length,
  ];

  // ── Sekcija 5: Maternji jezik ──────────────────────────────────────────
  const matJezici = [...new Set(ucenici.map((u) => u.maternji).filter(Boolean))].sort() as string[];
  const s5 = matJezici.map((j) => {
    const grupa = ucenici.filter((u) => u.maternji === j);
    return [j, grupa.length, grupa.filter((u) => u.pol === Pol.ZENSKO).length];
  });

  // ── Sekcija 6: Izborni predmeti ────────────────────────────────────────
  const izborniList = [...new Set(ucenici.map((u) => u.izborni).filter(Boolean))].sort() as string[];
  const s6 = izborniList.map((p) => {
    const grupa = ucenici.filter((u) => u.izborni === p);
    return [p, grupa.length, grupa.filter((u) => u.pol === Pol.ZENSKO).length];
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900">Statistički pregled</h1>
        <p className="text-sm text-slate-500 mt-1">
          Podaci za školsku godinu — automatski izračunato iz baze
        </p>
      </div>

      <div className="space-y-6">
        <StatsTable
          title="1. Odeljenja i učenici po razredu"
          headers={["Razred", "Odeljenja", "Učenici ukupno", "Učenice"]}
          rows={s1}
          totalRow={s1Total}
        />

        <StatsTable
          title="2. Učenici po profilu (smeru) i razredu"
          headers={["Smer / Profil", "I razred", "II razred", "III razred", "IV razred", "Ukupno"]}
          rows={s2}
          totalRow={s2Total}
        />

        <StatsTable
          title="3. Strani jezici"
          headers={["Jezik", "Učenici"]}
          rows={s3}
        />

        <StatsTable
          title="4. Starosna struktura (učenici po godištu)"
          headers={["Starost", "Ukupno", "Učenice"]}
          rows={s4}
          totalRow={s4Total}
        />

        <StatsTable
          title="5. Maternji jezik"
          headers={["Maternji jezik", "Učenici", "Učenice"]}
          rows={s5}
        />

        <StatsTable
          title="6. Izborni predmeti"
          headers={["Predmet", "Učenici", "Učenice"]}
          rows={s6}
        />
      </div>
    </div>
  );
}
