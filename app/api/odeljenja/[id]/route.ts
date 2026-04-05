import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Stepen } from "@prisma/client";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const odeljenje = await db.odeljenje.findUnique({
    where: { id },
    include: {
      ucenici: { orderBy: { redniBroj: "asc" } },
      _count: { select: { ucenici: true } },
    },
  });
  if (!odeljenje) return NextResponse.json({ error: "Nije pronađeno" }, { status: 404 });
  return NextResponse.json(odeljenje);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const data = await request.json();

  const odeljenje = await db.odeljenje.update({
    where: { id },
    data: {
      naziv: data.naziv,
      smer: data.smer,
      stepen: data.stepen as Stepen,
      jezik: data.jezik,
      razredni: data.razredni,
    },
  });
  return NextResponse.json(odeljenje);
}
