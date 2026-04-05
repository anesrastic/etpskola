import { db } from "@/lib/db";
import { UcenikForm } from "@/components/ucenik-form";
import Link from "next/link";

export default async function NoviUcenikPage() {
  const odeljenja = await db.odeljenje.findMany({
    orderBy: [{ razred: "asc" }, { naziv: "asc" }],
  });

  return (
    <div>
      <div className="text-sm text-slate-500 mb-5">
        <Link href="/ucenici" className="text-brand-600 hover:underline">← Učenici</Link>
        <span className="mx-2">/</span>
        <span className="text-brand-900 font-semibold">Novi učenik</span>
      </div>
      <UcenikForm odeljenja={odeljenja} />
    </div>
  );
}
