import * as XLSX from "xlsx";

interface UcenikRow {
  redniBroj: number;
  pol: string;
  ime: string;
  prezime: string;
  datumRodjenja: string;
  mestoRodjenja?: string | null;
  imeRoditelja?: string | null;
  adresa?: string | null;
  telefonUcenika?: string | null;
  telefonRoditelja?: string | null;
  izborni?: string | null;
  straniJezik?: string | null;
  maternji?: string | null;
  napomena?: string | null;
}

interface OdeljenjeInfo {
  naziv: string;
  smer: string;
  jezik: string;
  razredni: string;
  stepen?: string;
  skolskaGodina?: string;
}

export function buildExcelUcenici(
  ucenici: UcenikRow[],
  odeljenje: OdeljenjeInfo,
  skolskaGodina = "2025/2026"
): Buffer {
  const wb = XLSX.utils.book_new();

  const rows: (string | number | null)[][] = [];

  // Zaglavlje (3 reda — kao originalni Excel)
  rows.push([null, null, null, `${odeljenje.smer} (${odeljenje.jezik.toLowerCase()})`, null, null, null, null, null, null, null, null, null, skolskaGodina]);
  rows.push([`Razred ${odeljenje.naziv.split("-")[0]}`, null, null, `Odeljenje ${odeljenje.naziv.split("-")[1]}`, null, null, `Razredni: ${odeljenje.razredni}`, null, "Telefon"]);
  rows.push(["BR", "Pol", "Ime", "Prezime", "Datum rođenja", "Mesto rođenja", "Ime roditelja", "Adresa stanovanja", "Učenik", "Roditelj", "Izborni", "Strani jezik", "Maternji", "Napomena"]);

  // Podaci
  for (const u of ucenici) {
    rows.push([
      u.redniBroj,
      u.pol === "ZENSKO" ? "žensko" : "muško",
      u.ime,
      u.prezime,
      u.datumRodjenja,
      u.mestoRodjenja ?? "",
      u.imeRoditelja ?? "",
      u.adresa ?? "",
      u.telefonUcenika ?? "",
      u.telefonRoditelja ?? "",
      u.izborni ?? "",
      u.straniJezik ?? "",
      u.maternji ?? "",
      u.napomena ?? "",
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, odeljenje.naziv);

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

export function buildExcelSviUcenici(
  ucenici: (UcenikRow & { odeljenjeNaziv: string })[],
): Buffer {
  const wb = XLSX.utils.book_new();

  const rows: (string | number | null)[][] = [];
  rows.push(["BR", "Pol", "Ime", "Prezime", "Odeljenje", "Datum rođenja", "Mesto rođenja", "Ime roditelja", "Adresa", "Tel. učenika", "Tel. roditelja", "Izborni", "Strani jezik", "Maternji", "Napomena"]);

  for (const u of ucenici) {
    rows.push([
      u.redniBroj, u.pol === "ZENSKO" ? "žensko" : "muško",
      u.ime, u.prezime, u.odeljenjeNaziv,
      u.datumRodjenja, u.mestoRodjenja ?? "", u.imeRoditelja ?? "",
      u.adresa ?? "", u.telefonUcenika ?? "", u.telefonRoditelja ?? "",
      u.izborni ?? "", u.straniJezik ?? "", u.maternji ?? "", u.napomena ?? "",
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Svi učenici");
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}
