import { locales, textDirection } from "./config";

describe("textDirection", () => {
  it("runs Hebrew right-to-left", () => {
    expect(textDirection("he")).toBe("rtl");
  });

  it("runs every other locale left-to-right", () => {
    for (const locale of locales) {
      if (locale !== "he") expect(textDirection(locale)).toBe("ltr");
    }
  });
});
