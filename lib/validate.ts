interface UcenikInput {
  pol?: string;
  ime?: string;
  prezime?: string;
  datumRodjenja?: string;
  odeljenjeId?: number;
  [key: string]: unknown;
}

export function validateUcenikData(data: UcenikInput): string | null {
  if (!data.ime?.trim()) return "Ime je obavezno";
  if (!data.prezime?.trim()) return "Prezime je obavezno";
  if (!data.pol) return "Pol je obavezan";
  if (!data.datumRodjenja?.trim()) return "Datum rođenja je obavezan";
  if (!data.odeljenjeId || data.odeljenjeId < 1) return "Odeljenje je obavezno";
  return null;
}
