import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const filter = searchParams.get("filter") ?? "sve"; // "sve" | "upisani" | "ispisani"
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 25;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { ime: { contains: q, mode: "insensitive" } },
      { prezime: { contains: q, mode: "insensitive" } },
    ];
  }
  if (filter === "upisani") where.datumUpisa = { not: null };
  if (filter === "ispisani") where.datumIspisa = { not: null };

  const [unosi, total] = await Promise.all([
    db.upisIspis.findMany({
      where,
      orderBy: { kreiran: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.upisIspis.count({ where }),
  ]);

  return NextResponse.json({ unosi, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  if (!data.ime?.trim() || !data.prezime?.trim()) {
    return NextResponse.json({ error: "Ime i prezime su obavezni" }, { status: 400 });
  }

  const unos = await db.upisIspis.create({
    data: {
      ime: data.ime.trim(),
      prezime: data.prezime.trim(),
      odeljenje: data.odeljenje?.trim() || null,
      datumRodjenja: data.datumRodjenja?.trim() || null,
      datumUpisa: data.datumUpisa?.trim() || null,
      datumIspisa: data.datumIspisa?.trim() || null,
      napomena: data.napomena?.trim() || null,
    },
  });
  return NextResponse.json(unos, { status: 201 });
}
