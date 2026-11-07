import { getTranslations } from "next-intl/server";

export const CONTACT_HREF = "mailto:contact@b-59.com";

/** The page's last word: one question and the one way to answer it. */
export async function ContactClosing({ id }: { id: string }) {
  const t = await getTranslations("home");

  return (
    <section className="home-section home-closing" aria-labelledby={id}>
      <h2 id={id} className="home-closing-title">
        {t("closingHeading")}
      </h2>
      <p className="home-lede">{t("closingBody")}</p>
      <div className="home-actions">
        <a href={CONTACT_HREF} className="btn-secondary">
          {t("ctaPrimary")}
        </a>
      </div>
    </section>
  );
}
