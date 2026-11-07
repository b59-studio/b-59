import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/config";
import { ProjectMark, type ProjectKey } from "@/components/ProjectMark";
import { CONTACT_HREF, ContactClosing } from "@/components/ContactClosing";
import { RowArrow } from "@/components/RowArrow";

export const metadata: Metadata = {
  title: { absolute: "B-59 Studio" },
  description:
    "Deliberate design for imperfect systems. B-59 is a design and strategy studio in Austin, Texas, building civic platforms, publishing Texas election research, and advising on complex decisions. Human-centered. Public-first.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "B-59 — Deliberate design for imperfect systems",
    description:
      "Designing democracy. Digital infrastructure for public servants. We build civic technology and advise on complex decisions.",
    url: "/",
  },
};

type Research = { href: string; title: string; blurb: string };
type Product = { href: string; project: ProjectKey; name: ReactNode; blurb: string };

export default async function Home() {
  const [locale, t, nav, studio, research] = await Promise.all([
    getLocale(),
    getTranslations("home"),
    getTranslations("nav"),
    getTranslations("studio"),
    getTranslations("research"),
  ]);

  // The research is published in English only, so other locales say so once,
  // and the list carries that note to anyone moving through it link by link.
  const englishOnly = locale !== defaultLocale;

  const latest: Research[] = [
    { href: "/research/2026-results", title: nav("results2026Texas"), blurb: nav("results2026Sub") },
    { href: "/research/2026-election-analysis", title: nav("electionAnalysis2026Texas"), blurb: nav("electionAnalysis2026Sub") },
    { href: "/research/2026-polls", title: nav("polls2026Texas"), blurb: nav("polls2026Sub") },
  ];

  const products: Product[] = [
    {
      href: "/solutions/ready2vote",
      project: "ready2vote",
      name: (
        <>
          ready<span className="text-b59-blue">2</span>vote
        </>
      ),
      blurb: studio("ready2voteBlurb"),
    },
    { href: "/solutions/hotline", project: "hotline", name: "Hotline", blurb: studio("hotlineBlurb") },
  ];

  return (
    <div className="home">
      <div className="home-hero">
        <div className="home-hero-lead">
          <h1 id="home-title" className="home-title">
            {t.rich("heading", { blue: (chunks) => <span className="text-b59-blue">{chunks}</span> })}
          </h1>
          <p className="home-lede">{t("lede")}</p>
          <div className="home-actions">
            <a href={CONTACT_HREF} className="btn-secondary">
              {t("ctaPrimary")}
            </a>
            <Link href="/studio" className="home-text-action">
              {t("ctaSecondary")}
              <RowArrow />
            </Link>
          </div>
        </div>

        <section className="home-latest" aria-labelledby="home-latest-heading">
          <h2 id="home-latest-heading" className="home-section-heading">
            {t("researchHeading")}
          </h2>
          {englishOnly && (
            <p id="home-latest-language" className="home-meta">
              {research("englishOnly")}
            </p>
          )}
          <ul className="home-list" aria-describedby={englishOnly ? "home-latest-language" : undefined}>
            {latest.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="home-row home-row--compact" hrefLang="en">
                  <span className="home-row-body">
                    <span className="home-row-title">{item.title}</span>
                    <span className="home-meta">{item.blurb}</span>
                  </span>
                  <RowArrow />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="home-section" aria-labelledby="home-products-heading">
        <h2 id="home-products-heading" className="home-section-heading">
          {t("productsHeading")}
        </h2>
        <ul className="home-list">
          {products.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="home-row home-product">
                <ProjectMark project={item.project} size={48} />
                <span className="home-product-name">{item.name}</span>
                <span className="home-product-blurb">{item.blurb}</span>
                <RowArrow />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ContactClosing id="home-closing-heading" />
    </div>
  );
}
