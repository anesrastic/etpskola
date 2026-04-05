import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateUcenikData } from "@/lib/validate";
import { Pol } from "@prisma/client";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const ucenik = await db.ucenik.findUnique({
    where: { id },
    include: { odeljenje: true },
  });
  if (!ucenik) return NextResponse.json({ error: "Nije pronađen" }, { status: 404 });
  return NextResponse.json(ucenik);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const data = await request.json();

  const error = validateUcenikData(data);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const ucenik = await db.ucenik.update({
    where: { id },
    data: {
      pol: data.pol as Pol,
      ime: data.ime.trim(),
      prezime: data.prezime.trim(),
      datumRodjenja: data.datumRodjenja.trim(),
      mestoRodjenja: data.mestoRodjenja?.trim() || null,
      imeRoditelja: data.imeRoditelja?.trim() || null,
      adresa: data.adresa?.trim() || null,
      telefonUcenika: data.telefonUcenika?.trim() || null,
      telefonRoditelja: data.telefonRoditelja?.trim() || null,
      izborni: data.izborni?.trim() || null,
      straniJezik: data.straniJezik?.trim() || null,
      maternji: data.maternji?.trim() || null,
      napomena: data.napomena?.trim() || null,
      odeljenjeId: data.odeljenjeId,
    },
  });
  return NextResponse.json(ucenik);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  await db.ucenik.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
