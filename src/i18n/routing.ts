import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "@/i18n/config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Default locale (en) has no prefix (/about); others are prefixed (/es/about).
  localePrefix: "as-needed",
});
