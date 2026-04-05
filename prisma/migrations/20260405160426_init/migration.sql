-- CreateEnum
CREATE TYPE "Pol" AS ENUM ('MUSKO', 'ZENSKO');

-- CreateEnum
CREATE TYPE "Stepen" AS ENUM ('III', 'IV');

-- CreateTable
CREATE TABLE "Odeljenje" (
    "id" SERIAL NOT NULL,
    "naziv" TEXT NOT NULL,
    "razred" INTEGER NOT NULL,
    "smer" TEXT NOT NULL,
    "stepen" "Stepen" NOT NULL DEFAULT 'IV',
    "jezik" TEXT NOT NULL,
    "razredni" TEXT NOT NULL,
    "skolskaGodina" TEXT NOT NULL DEFAULT '2025/2026',
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Odeljenje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ucenik" (
    "id" SERIAL NOT NULL,
    "redniBroj" INTEGER NOT NULL,
    "pol" "Pol" NOT NULL,
    "ime" TEXT NOT NULL,
    "prezime" TEXT NOT NULL,
    "datumRodjenja" TEXT NOT NULL,
    "mestoRodjenja" TEXT,
    "imeRoditelja" TEXT,
    "adresa" TEXT,
    "telefonUcenika" TEXT,
    "telefonRoditelja" TEXT,
    "izborni" TEXT,
    "straniJezik" TEXT,
    "maternji" TEXT,
    "napomena" TEXT,
    "odeljenjeId" INTEGER NOT NULL,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ucenik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpisIspis" (
    "id" SERIAL NOT NULL,
    "ime" TEXT NOT NULL,
    "prezime" TEXT NOT NULL,
    "odeljenje" TEXT,
    "datumRodjenja" TEXT,
    "datumUpisa" TEXT,
    "datumIspisa" TEXT,
    "napomena" TEXT,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpisIspis_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ucenik" ADD CONSTRAINT "Ucenik_odeljenjeId_fkey" FOREIGN KEY ("odeljenjeId") REFERENCES "Odeljenje"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
