import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteUcenikButton } from "@/components/delete-ucenik-button";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-sm font-medium text-slate-800">{value || "—"}</div>
    </div>
  );
}

export default async function UcenikPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ucenik = await db.ucenik.findUnique({
    where: { id: parseInt(id) },
    include: { odeljenje: true },
  });
  if (!ucenik) notFound();

  const initials = `${ucenik.prezime[0]}${ucenik.ime[0]}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div className="text-sm text-slate-500">
          <Link href="/ucenici" className="text-brand-600 hover:underline">← Učenici</Link>
          <span className="mx-2">/</span>
          <span className="text-brand-900 font-semibold">{ucenik.prezime} {ucenik.ime}</span>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/ucenici/${ucenik.id}/uredi`} variant="outline" className="border-brand-200">
            ✏️ Uredi podatke
          </LinkButton>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-900 to-brand-600 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <div className="text-xl font-bold text-white">{ucenik.prezime} {ucenik.ime}</div>
            <div className="text-sm text-green-300">
              Odeljenje {ucenik.odeljenje.naziv} · {ucenik.odeljenje.skolskaGodina}
            </div>
          </div>
          <div className="ml-auto bg-white/15 rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-green-300">Red. br.</div>
            <div className="text-2xl font-bold text-white">{ucenik.redniBroj}</div>
          </div>
        </div>

        {/* Polja */}
        <div className="p-6 grid grid-cols-3 gap-5">
          <Field label="Pol" value={ucenik.pol === "MUSKO" ? "Muško" : "Žensko"} />
          <Field label="Datum rođenja" value={ucenik.datumRodjenja} />
          <Field label="Mesto rođenja" value={ucenik.mestoRodjenja} />
          <Field label="Ime roditelja" value={ucenik.imeRoditelja} />
          <div className="col-span-2">
            <Field label="Adresa stanovanja" value={ucenik.adresa} />
          </div>
          <Field label="Telefon učenika" value={ucenik.telefonUcenika} />
          <Field label="Telefon roditelja" value={ucenik.telefonRoditelja} />
          <Field label="Odeljenje" value={ucenik.odeljenje.naziv} />
          <Field label="Izborni predmet" value={ucenik.izborni} />
          <Field label="Strani jezik" value={ucenik.straniJezik} />
          <Field label="Maternji jezik" value={ucenik.maternji} />
          <div className="col-span-3">
            <Field label="Napomena" value={ucenik.napomena} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Poslednja izmena: {ucenik.azuriran.toLocaleDateString("sr-Latn-RS")}
          </span>
          <DeleteUcenikButton id={ucenik.id} />
        </div>
      </div>
    </div>
  );
}
