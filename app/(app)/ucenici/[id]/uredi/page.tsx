import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { UcenikForm } from "@/components/ucenik-form";
import Link from "next/link";

export default async function UrediUcenikPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ucenik, odeljenja] = await Promise.all([
    db.ucenik.findUnique({ where: { id: parseInt(id) } }),
    db.odeljenje.findMany({ orderBy: [{ razred: "asc" }, { naziv: "asc" }] }),
  ]);
  if (!ucenik) notFound();

  return (
    <div>
      <div className="text-sm text-slate-500 mb-5">
        <Link href={`/ucenici/${ucenik.id}`} className="text-brand-600 hover:underline">
          ← {ucenik.prezime} {ucenik.ime}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-brand-900 font-semibold">Uredi podatke</span>
      </div>
      <UcenikForm
        odeljenja={odeljenja}
        defaultValues={{
          pol: ucenik.pol as string,
          ime: ucenik.ime,
          prezime: ucenik.prezime,
          datumRodjenja: ucenik.datumRodjenja,
          odeljenjeId: ucenik.odeljenjeId,
          mestoRodjenja: ucenik.mestoRodjenja ?? undefined,
          imeRoditelja: ucenik.imeRoditelja ?? undefined,
          adresa: ucenik.adresa ?? undefined,
          telefonUcenika: ucenik.telefonUcenika ?? undefined,
          telefonRoditelja: ucenik.telefonRoditelja ?? undefined,
          izborni: ucenik.izborni ?? undefined,
          straniJezik: ucenik.straniJezik ?? undefined,
          maternji: ucenik.maternji ?? undefined,
          napomena: ucenik.napomena ?? undefined,
        }}
        ucenikId={ucenik.id}
      />
    </div>
  );
}
