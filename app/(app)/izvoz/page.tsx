"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Odeljenje { id: number; naziv: string; }

export default function IzvozPage() {
  const [odeljenja, setOdeljenja] = useState<Odeljenje[]>([]);
  const [tip, setTip] = useState<"odeljenje" | "svi">("odeljenje");
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [odeljenjeId, setOdeljenjeId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/odeljenja").then((r) => r.json()).then(setOdeljenja);
  }, []);

  async function handleExport() {
    setLoading(true);
    const url = format === "pdf" ? "/api/izvoz/pdf" : "/api/izvoz/excel";
    const body = tip === "odeljenje"
      ? { odeljenjeId, tip: "odeljenje" }
      : { tip: "svi" };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const cd = res.headers.get("Content-Disposition") ?? "";
      a.download = cd.match(/filename="(.+)"/)?.[1] ?? "izvoz";
      a.click();
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900 mb-6">Izvoz podataka</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg space-y-5">
        {/* Tip izvoza */}
        <div>
          <div className="text-sm font-semibold text-brand-900 mb-2">Šta izvoziti?</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "odeljenje", label: "📋 Spisak odeljenja", desc: "Sva polja, jedno odeljenje" },
              { value: "svi", label: "👥 Svi učenici", desc: "Kompletna baza" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTip(opt.value as "odeljenje" | "svi")}
                className={`border-2 rounded-xl p-3 text-left transition-all ${
                  tip === opt.value
                    ? "border-brand-600 bg-brand-50"
                    : "border-brand-100 hover:border-brand-300"
                }`}
              >
                <div className="text-sm font-semibold text-brand-900">{opt.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Odeljenje (samo za tip=odeljenje) */}
        {tip === "odeljenje" && (
          <div>
            <div className="text-sm font-semibold text-brand-900 mb-2">Odeljenje</div>
            <select
              value={odeljenjeId}
              onChange={(e) => setOdeljenjeId(e.target.value)}
              className="w-full border border-brand-200 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="">Izaberi odeljenje...</option>
              {odeljenja.map((o) => (
                <option key={o.id} value={o.id}>{o.naziv}</option>
              ))}
            </select>
          </div>
        )}

        {/* Format */}
        <div>
          <div className="text-sm font-semibold text-brand-900 mb-2">Format</div>
          <div className="flex gap-2">
            {[
              { value: "pdf", label: "📄 PDF" },
              { value: "excel", label: "📊 Excel (.xlsx)" },
            ].map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFormat(f.value as "pdf" | "excel")}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  format === f.value
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-slate-700 border-brand-200 hover:border-brand-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={loading || (tip === "odeljenje" && !odeljenjeId)}
          className="w-full bg-brand-600 hover:bg-brand-700"
        >
          {loading ? "Generisanje..." : "⬇ Preuzmi fajl"}
        </Button>
      </div>
    </div>
  );
}
