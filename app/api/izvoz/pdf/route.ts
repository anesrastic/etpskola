import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildPdfOdeljenje } from "@/lib/export/pdf";

export async function POST(request: NextRequest) {
  const { odeljenjeId } = await request.json();

  if (!odeljenjeId) {
    return NextResponse.json({ error: "odeljenjeId je obavezan" }, { status: 400 });
  }

  const odeljenje = await db.odeljenje.findUnique({
    where: { id: parseInt(odeljenjeId) },
    include: { ucenici: { orderBy: { redniBroj: "asc" } } },
  });

  if (!odeljenje) {
    return NextResponse.json({ error: "Odeljenje nije pronađeno" }, { status: 404 });
  }

  const buf = await buildPdfOdeljenje(odeljenje.ucenici, {
    naziv: odeljenje.naziv,
    smer: odeljenje.smer,
    jezik: odeljenje.jezik,
    razredni: odeljenje.razredni,
    stepen: odeljenje.stepen,
    skolskaGodina: odeljenje.skolskaGodina,
  });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Odeljenje-${odeljenje.naziv}.pdf"`,
    },
  });
}
