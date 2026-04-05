"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface Odeljenje {
  id: number; naziv: string; smer: string; stepen: string;
  jezik: string; razredni: string; skolskaGodina: string;
}

export default function UrediOdeljenjePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [odeljenje, setOdeljenje] = useState<Odeljenje | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/odeljenja/${params.id}`)
      .then((r) => r.json())
      .then(setOdeljenje);
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());

    const res = await fetch(`/api/odeljenja/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push(`/odeljenja/${params.id}`);
      router.refresh();
    } else {
      const err = await res.json();
      setError(err.error || "Greška");
    }
    setLoading(false);
  }

  if (!odeljenje) return <div className="text-slate-500 p-6">Učitavanje...</div>;

  return (
    <div>
      <div className="text-sm text-slate-500 mb-5">
        <Link href={`/odeljenja/${params.id}`} className="text-brand-600 hover:underline">← {odeljenje.naziv}</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-brand-900">Uredi odeljenje</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-slate-500">Naziv odeljenja</Label>
            <Input name="naziv" defaultValue={odeljenje.naziv} className="mt-1 border-brand-200" required />
          </div>
          <div>
            <Label className="text-xs text-slate-500">Razredni starešina</Label>
            <Input name="razredni" defaultValue={odeljenje.razredni} className="mt-1 border-brand-200" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs text-slate-500">Smer / Profil</Label>
            <Input name="smer" defaultValue={odeljenje.smer} className="mt-1 border-brand-200" />
          </div>
          <div>
            <Label className="text-xs text-slate-500">Stepen</Label>
            <select name="stepen" defaultValue={odeljenje.stepen} className="mt-1 w-full border border-brand-200 rounded-md px-3 py-2 text-sm">
              <option value="III">III stepen</option>
              <option value="IV">IV stepen</option>
            </select>
          </div>
          <div>
            <Label className="text-xs text-slate-500">Jezik nastave</Label>
            <select name="jezik" defaultValue={odeljenje.jezik} className="mt-1 w-full border border-brand-200 rounded-md px-3 py-2 text-sm">
              <option>Srpski</option>
              <option>Bosanski</option>
            </select>
          </div>
          {error && <p className="col-span-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded border border-red-200">{error}</p>}
          <div className="col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => router.back()}>Otkaži</Button>
            <Button type="submit" disabled={loading} className="bg-brand-600 hover:bg-brand-700">
              {loading ? "Čuvanje..." : "💾 Sačuvaj"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
