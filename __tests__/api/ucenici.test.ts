// Testira validacijsku logiku odvojeno od HTTP sloja
import { validateUcenikData } from "@/lib/validate";

describe("validateUcenikData", () => {
  const valid = {
    pol: "MUSKO",
    ime: "Marko",
    prezime: "Marković",
    datumRodjenja: "01.01.2010.",
    odeljenjeId: 1,
  };

  it("prihvata validne podatke", () => {
    expect(validateUcenikData(valid)).toBeNull();
  });

  it("odbija bez imena", () => {
    expect(validateUcenikData({ ...valid, ime: "" })).toMatch(/ime/i);
  });

  it("odbija bez prezimena", () => {
    expect(validateUcenikData({ ...valid, prezime: "" })).toMatch(/prezime/i);
  });

  it("odbija bez odeljenja", () => {
    expect(validateUcenikData({ ...valid, odeljenjeId: 0 })).toMatch(/odeljenje/i);
  });
});
