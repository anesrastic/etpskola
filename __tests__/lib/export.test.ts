import { buildExcelUcenici } from "@/lib/export/excel";

describe("buildExcelUcenici", () => {
  it("vraća Buffer za listu učenika", () => {
    const ucenici = [
      {
        redniBroj: 1, pol: "ZENSKO", ime: "Ana", prezime: "Anić",
        datumRodjenja: "01.01.2010.", mestoRodjenja: "Beograd",
        imeRoditelja: "Marko", adresa: "ul. 1",
        telefonUcenika: "060111", telefonRoditelja: "060222",
        izborni: "Verska P.", straniJezik: "Engleski",
        maternji: "Srpski", napomena: null,
      },
    ];
    const buf = buildExcelUcenici(ucenici, { naziv: "I-1", smer: "Test", jezik: "Srpski", razredni: "Ime" });
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
  });
});
