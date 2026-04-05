import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const odeljenja = await db.odeljenje.findMany({
    orderBy: [{ razred: "asc" }, { naziv: "asc" }],
    include: { _count: { select: { ucenici: true } } },
  });
  return NextResponse.json(odeljenja);
}
