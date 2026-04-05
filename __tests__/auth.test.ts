import bcrypt from "bcryptjs";

describe("auth: password verification", () => {
  const APP_PASSWORD = "skolalozinka123";

  it("accepts correct password", async () => {
    const hash = await bcrypt.hash(APP_PASSWORD, 10);
    const result = await bcrypt.compare(APP_PASSWORD, hash);
    expect(result).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await bcrypt.hash(APP_PASSWORD, 10);
    const result = await bcrypt.compare("pogresna", hash);
    expect(result).toBe(false);
  });
});
