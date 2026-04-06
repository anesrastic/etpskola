import * as XLSX from "xlsx";
import * as path from "path";
import { PrismaClient, Pol } from "@prisma/client";

const db = new PrismaClient();

const EXCEL_PATH = path.join(__dirname, "../../eTPŠkola.xlsx");

const CLASS_SHEETS = [
  "I-1","I-2","I-3","I-4","I-5","I-6",
  "II-1","II-2","II-3","II-4","II-5","II-6",
  "III-1","III-2","III-3","III-4","III-5","III-6",
  "IV-1","IV-2","IV-3","IV-4",
];

const razredMap: Record<string, number> = { "I": 1, "II": 2, "III": 3, "IV": 4 };

const SMER_NORMALIZACIJA: Record<string, string> = {
  "Mehaničar motornih vozila / Bravar zavarivač": "Mehaničar motornih vozila / Bravar-zavarivač",
  "Veterinraski tehničar": "Veterinarski tehničar",
};

function extractSmer(row0: unknown[]): string {
  for (const cell of row0) {
    if (typeof cell === "string" && cell.trim().length > 3 && cell.trim() !== "-") {
      const smer = cell.replace(/\s*\([^)]+\)\s*$/, "").trim();
      return SMER_NORMALIZACIJA[smer] ?? smer;
    }
  }
  return "";
}

function extractJezik(row0: unknown[]): string {
  for (const cell of row0) {
    if (typeof cell === "string") {
      const match = cell.match(/\((srpski|bosanski)\)/i);
      if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    }
  }
  return "Srpski";
}

function extractRazredni(row1: unknown[]): string {
  for (const cell of row1) {
    if (typeof cell === "string" && cell.startsWith("Razredni:")) {
      return cell.replace("Razredni:", "").trim();
    }
  }
  return "";
}

function parsePol(value: string | null | undefined): Pol {
  if (!value) return Pol.MUSKO;
  return value.toLowerCase().trim() === "žensko" ? Pol.ZENSKO : Pol.MUSKO;
}

function cleanStr(value: unknown): string | null {
  if (!value) return null;
  const str = String(value).trim();
  return str.length > 0 && str !== "-" && str !== "-----" ? str : null;
}

const IZBORNI_NORMALIZACIJA: Record<string, string> = {
  "verska i": "Verska I.",
  "verska i.": "Verska I.",
  "verska i ": "Verska I.",
  "verska p": "Verska P.",
  "verska p.": "Verska P.",
  "građansko": "Građansko",
  "gradjansko": "Građansko",
};

function normalizujIzborni(value: string | null): string | null {
  if (!value) return null;
  return IZBORNI_NORMALIZACIJA[value.toLowerCase().trim()] ?? value;
}

function cleanPhone(value: unknown): string | null {
  if (!value) return null;
  const str = String(value).trim();
  return str.length > 3 && str !== "-----" && str !== "-" ? str : null;
}

function excelDateToStr(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "number") {
    const d = new Date((value - 25569) * 86400 * 1000);
    const day = d.getUTCDate();
    const month = d.getUTCMonth() + 1;
    const year = d.getUTCFullYear();
    return `${day}.${month}.${year}.`;
  }
  if (typeof value === "string") return value.trim() || null;
  return null;
}

async function importSheet(wb: XLSX.WorkBook, sheetName: string) {
  const ws = wb.Sheets[sheetName];
  if (!ws) {
    console.warn(`Sheet ${sheetName} ne postoji, preskačem.`);
    return;
  }

  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const row0 = rows[0] ?? [];
  const row1 = rows[1] ?? [];

  const smer = extractSmer(row0);
  const jezik = extractJezik(row0);
  const razredni = extractRazredni(row1);
  const razredKey = sheetName.split("-")[0];
  const razredNum = razredMap[razredKey] ?? 1;

  console.log(`Uvozim ${sheetName}: ${smer} (${jezik}), razredni: ${razredni}`);

  const odeljenje = await db.odeljenje.create({
    data: {
      naziv: sheetName,
      razred: razredNum,
      smer,
      jezik,
      razredni,
      skolskaGodina: "2025/2026",
    },
  });

  // Headeri su u redu 2 (index 2), podaci od reda 3 (index 3)
  let redniBroj = 1;
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row[0] == null) continue;
    if (isNaN(Number(row[0]))) continue;

    let col = 0;
    col++; // BR
    const pol = parsePol(row[col++] as string);
    const ime = (row[col++] as string)?.trim() ?? "";
    const prezime = (row[col++] as string)?.trim() ?? "";
    if (!ime || !prezime) continue;

    const datumRodjenja = cleanStr(row[col++]) ?? "";
    const mestoRodjenja = cleanStr(row[col++]);
    const imeRoditelja = cleanStr(row[col++]);
    const adresa = cleanStr(row[col++]);
    const telefonUcenika = cleanPhone(row[col++]);
    const telefonRoditelja = cleanPhone(row[col++]);
    const izborni = normalizujIzborni(cleanStr(row[col++]));
    const straniJezik = cleanStr(row[col++]);
    const maternji = cleanStr(row[col++]);
    const napomena = cleanStr(row[col++]);

    await db.ucenik.create({
      data: {
        redniBroj,
        pol,
        ime,
        prezime,
        datumRodjenja,
        mestoRodjenja,
        imeRoditelja,
        adresa,
        telefonUcenika,
        telefonRoditelja,
        izborni,
        straniJezik,
        maternji,
        napomena,
        odeljenjeId: odeljenje.id,
      },
    });
    redniBroj++;
  }

  console.log(`  ✓ Uvezeno ${redniBroj - 1} učenika za ${sheetName}`);
}

async function importUpisIspis(wb: XLSX.WorkBook) {
  const ws = wb.Sheets["UPIS-ISPIS"];
  if (!ws) return;

  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  let count = 0;
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[1]) continue;

    const ime = (row[1] as string)?.trim() ?? "";
    const prezime = (row[2] as string)?.trim() ?? "";
    if (!ime || !prezime) continue;

    // Kolona "odeljenje" može biti Excel serijski datum — konvertujemo u string
    const odeljenjeRaw = row[3];
    const odeljenje = typeof odeljenjeRaw === "number"
      ? excelDateToStr(odeljenjeRaw)
      : cleanStr(odeljenjeRaw);

    const datumRodjenja = cleanStr(row[4]);
    const datumUpisa = cleanStr(row[5]);
    const datumIspisa = cleanStr(row[6]);
    const napomena = cleanStr(row[7]);

    await db.upisIspis.create({
      data: { ime, prezime, odeljenje, datumRodjenja, datumUpisa, datumIspisa, napomena },
    });
    count++;
  }
  console.log(`✓ Uvezeno ${count} unosa iz UPIS-ISPIS`);
}

async function main() {
  console.log("Učitavam Excel fajl...");
  const wb = XLSX.readFile(EXCEL_PATH);

  await db.ucenik.deleteMany();
  await db.upisIspis.deleteMany();
  await db.odeljenje.deleteMany();
  console.log("Baza očišćena.");

  for (const sheetName of CLASS_SHEETS) {
    await importSheet(wb, sheetName);
  }

  await importUpisIspis(wb);

  const ukupnoUcenika = await db.ucenik.count();
  const ukupnoOdeljenja = await db.odeljenje.count();
  console.log(`\n✅ Uvoz završen: ${ukupnoOdeljenja} odeljenja, ${ukupnoUcenika} učenika.`);
  console.log("⚠️  Ručno provjeri stepen (III/IV) za svako odeljenje u aplikaciji!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
