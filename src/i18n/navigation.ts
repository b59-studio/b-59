import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

// Locale-aware navigation helpers. Use these (`Link`, `redirect`, `useRouter`,
// `usePathname`) instead of the next/navigation equivalents so the active
// locale prefix is preserved across links and redirects.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
