"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function UpisIspisForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());

    const res = await fetch("/api/upis-ispis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const err = await res.json();
      setError(err.error || "Greška");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand-600 hover:bg-brand-700">+ Dodaj unos</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novi unos — Upis / Ispis</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Ime *</Label>
              <Input name="ime" className="mt-1 border-brand-200" required />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Prezime *</Label>
              <Input name="prezime" className="mt-1 border-brand-200" required />
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-500">Odeljenje</Label>
            <Input name="odeljenje" placeholder="npr. I-2" className="mt-1 border-brand-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Datum upisa</Label>
              <Input name="datumUpisa" placeholder="DD.MM.GGGG." className="mt-1 border-brand-200" />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Datum ispisa</Label>
              <Input name="datumIspisa" placeholder="DD.MM.GGGG." className="mt-1 border-brand-200" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-500">Napomena</Label>
            <textarea name="napomena" className="mt-1 w-full border border-brand-200 rounded-md px-3 py-2 text-sm resize-none h-16" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Otkaži</Button>
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700">Sačuvaj</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
