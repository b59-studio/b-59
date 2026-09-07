/**
 * Locale configuration shared by server and client. Pure constants only — no
 * server-only imports — so this is safe to import anywhere (incl. tests).
 */

export const locales = ["en", "es", "zh", "he", "hi"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Native language names for the switcher (always shown in their own script). */
export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  he: "עברית",
  hi: "हिन्दी",
};

export type TextDirection = "ltr" | "rtl";

const rtlLocales: ReadonlySet<Locale> = new Set<Locale>(["he"]);

/** Writing direction for `<html dir>`. Hebrew runs right-to-left; everything else left-to-right. */
export function textDirection(locale: Locale): TextDirection {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}

/** Cookie that persists the visitor's explicit language choice. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
