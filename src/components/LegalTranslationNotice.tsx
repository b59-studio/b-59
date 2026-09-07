import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/config";

/**
 * Shown on legal pages when viewing in a non-default locale: states that the
 * translation is a best-effort convenience and the English version is binding,
 * with a one-click link to it (standard 33). Renders nothing for English.
 */
export async function LegalTranslationNotice({ enHref }: { enHref: string }) {
  const locale = await getLocale();
  if (locale === defaultLocale) return null;

  const t = await getTranslations("legal");

  return (
    <div role="note" className="callout-blue text-start mb-10">
      <p className="body-sm mb-2">{t("notice.body")}</p>
      <Link href={enHref} locale={defaultLocale} className="text-link font-semibold body-sm">
        {t("notice.viewEnglish")}
      </Link>
    </div>
  );
}
