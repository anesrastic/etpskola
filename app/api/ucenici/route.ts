import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateUcenikData } from "@/lib/validate";
import { Pol } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const odeljenjeId = searchParams.get("odeljenjeId");
  const razred = searchParams.get("razred");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 25;

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { ime: { contains: q, mode: "insensitive" } },
      { prezime: { contains: q, mode: "insensitive" } },
    ];
  }
  if (odeljenjeId) where.odeljenjeId = parseInt(odeljenjeId);
  if (razred) where.odeljenje = { razred: parseInt(razred) };

  const [ucenici, total] = await Promise.all([
    db.ucenik.findMany({
      where,
      include: { odeljenje: { select: { naziv: true } } },
      orderBy: [{ prezime: "asc" }, { ime: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.ucenik.count({ where }),
  ]);

  return NextResponse.json({ ucenici, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  const error = validateUcenikData(data);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const maxBroj = await db.ucenik.aggregate({
    where: { odeljenjeId: data.odeljenjeId },
    _max: { redniBroj: true },
  });

  const ucenik = await db.ucenik.create({
    data: {
      redniBroj: (maxBroj._max.redniBroj ?? 0) + 1,
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
  return NextResponse.json(ucenik, { status: 201 });
}
