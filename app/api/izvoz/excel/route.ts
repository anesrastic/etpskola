import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildExcelUcenici, buildExcelSviUcenici } from "@/lib/export/excel";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { tip, odeljenjeId } = await request.json();

  if (tip === "odeljenje" && odeljenjeId) {
    const odeljenje = await db.odeljenje.findUnique({
      where: { id: parseInt(odeljenjeId) },
      include: { ucenici: { orderBy: { redniBroj: "asc" } } },
    });
    if (!odeljenje) return NextResponse.json({ error: "Nije pronađeno" }, { status: 404 });

    const buf = buildExcelUcenici(odeljenje.ucenici, {
      naziv: odeljenje.naziv,
      smer: odeljenje.smer,
      jezik: odeljenje.jezik,
      razredni: odeljenje.razredni,
      skolskaGodina: odeljenje.skolskaGodina,
    });

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Odeljenje-${odeljenje.naziv}.xlsx"`,
      },
    });
  }

  // Svi učenici
  const sviUcenici = await db.ucenik.findMany({
    include: { odeljenje: { select: { naziv: true } } },
    orderBy: [{ odeljenje: { razred: "asc" } }, { prezime: "asc" }],
  });

  const buf = buildExcelSviUcenici(
    sviUcenici.map((u) => ({ ...u, odeljenjeNaziv: u.odeljenje.naziv }))
  );

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="Svi-ucenici.xlsx"',
    },
  });
}
