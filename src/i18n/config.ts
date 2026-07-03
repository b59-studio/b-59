/**
 * Locale configuration shared by server and client. Pure constants only — no
 * server-only imports — so this is safe to import anywhere (incl. tests).
 */

export const locales = ["en", "es", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Native language names for the switcher (always shown in their own script). */
export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
};

/** Cookie that persists the visitor's explicit language choice. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
