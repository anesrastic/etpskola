import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [
    ukupnoUcenika,
    ukupnoOdeljenja,
    upisani,
    ispisani,
    stranijezici,
    izborni,
    maternji,
  ] = await Promise.all([
    db.ucenik.count(),
    db.odeljenje.count(),
    db.upisIspis.count({ where: { datumUpisa: { not: null }, datumIspisa: null } }),
    db.upisIspis.count({ where: { datumIspisa: { not: null } } }),
    db.ucenik.groupBy({ by: ["straniJezik"], _count: true }),
    db.ucenik.groupBy({ by: ["izborni"], _count: true }),
    db.ucenik.groupBy({ by: ["maternji"], _count: true }),
  ]);

  return NextResponse.json({
    ukupnoUcenika,
    ukupnoOdeljenja,
    upisani,
    ispisani,
    stranijezici,
    izborni,
    maternji,
  });
}
