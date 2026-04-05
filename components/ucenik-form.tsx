"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Odeljenje { id: number; naziv: string; }

interface UcenikFormProps {
  odeljenja: Odeljenje[];
  defaultValues?: Partial<UcenikData>;
  ucenikId?: number;
}

interface UcenikData {
  pol: string;
  ime: string;
  prezime: string;
  datumRodjenja: string;
  mestoRodjenja: string;
  imeRoditelja: string;
  adresa: string;
  telefonUcenika: string;
  telefonRoditelja: string;
  izborni: string;
  straniJezik: string;
  maternji: string;
  napomena: string;
  odeljenjeId: number;
}

export function UcenikForm({ odeljenja, defaultValues = {}, ucenikId }: UcenikFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    data.odeljenjeId = Number(data.odeljenjeId) as unknown as string;

    const url = ucenikId ? `/api/ucenici/${ucenikId}` : "/api/ucenici";
    const method = ucenikId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const saved = await res.json();
      router.push(`/ucenici/${saved.id}`);
      router.refresh();
    } else {
      const err = await res.json();
      setError(err.error || "Greška pri čuvanju");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Lični podaci */}
        <div>
          <h2 className="text-base font-bold text-brand-900 pb-3 border-b border-slate-100 mb-4">Lični podaci</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "ime", label: "Ime", required: true },
              { name: "prezime", label: "Prezime", required: true },
            ].map(({ name, label, required }) => (
              <div key={name}>
                <Label className="text-xs text-slate-500">{label}{required ? " *" : ""}</Label>
                <Input name={name} defaultValue={(defaultValues as Record<string, string>)[name] ?? ""} className="mt-1 border-brand-200" required={required} />
              </div>
            ))}
            <div>
              <Label className="text-xs text-slate-500">Pol *</Label>
              <select name="pol" defaultValue={defaultValues.pol ?? "MUSKO"} className="mt-1 w-full border border-brand-200 rounded-md px-3 py-2 text-sm" required>
                <option value="MUSKO">Muško</option>
                <option value="ZENSKO">Žensko</option>
              </select>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Datum rođenja *</Label>
              <Input name="datumRodjenja" defaultValue={defaultValues.datumRodjenja ?? ""} placeholder="DD.MM.GGGG." className="mt-1 border-brand-200" required />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Mesto rođenja</Label>
              <Input name="mestoRodjenja" defaultValue={defaultValues.mestoRodjenja ?? ""} className="mt-1 border-brand-200" />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Ime roditelja</Label>
              <Input name="imeRoditelja" defaultValue={defaultValues.imeRoditelja ?? ""} className="mt-1 border-brand-200" />
            </div>
            <div className="col-span-3">
              <Label className="text-xs text-slate-500">Adresa stanovanja</Label>
              <Input name="adresa" defaultValue={defaultValues.adresa ?? ""} className="mt-1 border-brand-200" />
            </div>
          </div>
        </div>

        {/* Kontakt i predmeti */}
        <div>
          <h2 className="text-base font-bold text-brand-900 pb-3 border-b border-slate-100 mb-4">Kontakt i predmeti</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-slate-500">Telefon učenika</Label>
              <Input name="telefonUcenika" defaultValue={defaultValues.telefonUcenika ?? ""} className="mt-1 border-brand-200" />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Telefon roditelja</Label>
              <Input name="telefonRoditelja" defaultValue={defaultValues.telefonRoditelja ?? ""} className="mt-1 border-brand-200" />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Odeljenje *</Label>
              <select name="odeljenjeId" defaultValue={defaultValues.odeljenjeId ?? ""} className="mt-1 w-full border border-brand-200 rounded-md px-3 py-2 text-sm" required>
                <option value="">Izaberi odeljenje...</option>
                {odeljenja.map((o) => (
                  <option key={o.id} value={o.id}>{o.naziv}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Izborni predmet</Label>
              <select name="izborni" defaultValue={defaultValues.izborni ?? ""} className="mt-1 w-full border border-brand-200 rounded-md px-3 py-2 text-sm">
                <option value="">—</option>
                <option>Verska I.</option>
                <option>Verska P.</option>
                <option>Građansko</option>
              </select>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Strani jezik</Label>
              <select name="straniJezik" defaultValue={defaultValues.straniJezik ?? ""} className="mt-1 w-full border border-brand-200 rounded-md px-3 py-2 text-sm">
                <option value="">—</option>
                <option>Engleski</option>
                <option>Francuski</option>
                <option>Nemački</option>
                <option>Ruski</option>
              </select>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Maternji jezik</Label>
              <select name="maternji" defaultValue={defaultValues.maternji ?? ""} className="mt-1 w-full border border-brand-200 rounded-md px-3 py-2 text-sm">
                <option value="">—</option>
                <option>Srpski</option>
                <option>Bosanski</option>
              </select>
            </div>
            <div className="col-span-3">
              <Label className="text-xs text-slate-500">Napomena</Label>
              <textarea name="napomena" defaultValue={defaultValues.napomena ?? ""} className="mt-1 w-full border border-brand-200 rounded-md px-3 py-2 text-sm resize-y min-h-[70px]" />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => router.back()}>Otkaži</Button>
          <Button type="submit" disabled={loading} className="bg-brand-600 hover:bg-brand-700">
            {loading ? "Čuvanje..." : "💾 Sačuvaj"}
          </Button>
        </div>
      </div>
    </form>
  );
}
