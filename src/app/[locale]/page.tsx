import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/config";
import { CONTACT_HREF, ContactClosing } from "@/components/ContactClosing";
import { NavGlyph, type GlyphKey } from "@/components/NavGlyph";
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

type Research = { href: string; glyph: GlyphKey; title: string; blurb: string };
type Screen = { src: string; width: number; height: number };
type Product = { href: string; meta: string; name: ReactNode; blurb: string; desktop: Screen; phone: Screen };
type Practice = { href: string; glyph: GlyphKey; name: string; blurb: string };

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
    { href: "/research/austin-petitions", glyph: "petition", title: nav("austinPetitions"), blurb: nav("austinPetitionsSub") },
    { href: "/research/2026-results", glyph: "results", title: nav("results2026Texas"), blurb: nav("results2026Sub") },
    {
      href: "/research/2026-election-analysis",
      glyph: "turnout",
      title: nav("electionAnalysis2026Texas"),
      blurb: nav("electionAnalysis2026Sub"),
    },
    { href: "/research/2026-polls", glyph: "polls", title: nav("polls2026Texas"), blurb: nav("polls2026Sub") },
  ];

  const products: Product[] = [
    {
      href: "/solutions/ready2vote",
      meta: studio("tagVoting"),
      name: (
        <>
          ready<span className="text-b59-blue">2</span>vote
        </>
      ),
      blurb: studio("ready2voteBlurb"),
      desktop: { src: "/products/ready2vote/home.webp", width: 1600, height: 1025 },
      phone: { src: "/products/ready2vote/application-phone.webp", width: 780, height: 1688 },
    },
    {
      href: "/solutions/hotline",
      meta: studio("tagAdministrative"),
      name: "Hotline",
      blurb: studio("hotlineBlurb"),
      desktop: { src: "/products/hotline/plate.webp", width: 1600, height: 1025 },
      phone: { src: "/products/hotline/plate-phone.webp", width: 780, height: 1688 },
    },
  ];

  const practices: Practice[] = [
    {
      href: "/studio/political-consulting",
      glyph: "organizing",
      name: nav("politicalConsulting"),
      blurb: t("consultingBlurb"),
    },
    {
      href: "/studio/ballot-measures",
      glyph: "petition",
      name: nav("ballotMeasures"),
      blurb: nav("ballotMeasuresSub"),
    },
  ];

  return (
    <div className="home">
      <div className="home-hero">
        <div className="home-hero-lead home-hero-lead--framed">
          {/* The index pages' ring, drawn larger: it frames the title on a
              phone, where the hero would otherwise be text alone. */}
          <span className="index-orbit home-orbit" aria-hidden={true} />
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

      </div>

      {/* Each product is shown by its own screens, cropped by the tile's edge.
          The pictures are decorative: the name and summary beside them say
          what the link is, so they carry no alt text of their own. */}
      <section className="home-section" aria-labelledby="home-products-heading">
        <h2 id="home-products-heading" className="home-section-heading">
          {t("productsHeading")}
        </h2>
        <ul className="home-showcase">
          {products.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="home-tile home-tile--product">
                <span className="home-tile-copy">
                  <span className="home-tile-meta">{item.meta}</span>
                  <h3 className="home-tile-name">{item.name}</h3>
                  <span className="home-tile-blurb">{item.blurb}</span>
                  <RowArrow />
                </span>
                <span className="home-tile-stage" aria-hidden={true}>
                  <span className="home-tile-screen">
                    <Image
                      src={item.desktop.src}
                      alt=""
                      width={item.desktop.width}
                      height={item.desktop.height}
                      sizes="(min-width: 768px) 40rem, 110vw"
                    />
                  </span>
                  <span className="home-tile-phone">
                    <Image src={item.phone.src} alt="" width={item.phone.width} height={item.phone.height} sizes="8rem" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* The campaign practices have no screens to show, so each is drawn
          around its own mark, oversized and cut off by the tile's corner. */}
      <section className="home-section" aria-labelledby="home-campaigns-heading">
        <h2 id="home-campaigns-heading" className="home-section-heading">
          {t("campaignsHeading")}
        </h2>
        <ul className="home-showcase">
          {practices.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="home-tile home-tile--practice">
                <span className="home-tile-art" aria-hidden={true}>
                  <span className="home-tile-disc" />
                  <NavGlyph glyph={item.glyph} size={240} className="home-tile-glyph" />
                </span>
                <span className="home-tile-copy">
                  <h3 className="home-tile-name">{item.name}</h3>
                  <span className="home-tile-blurb">{item.blurb}</span>
                  <RowArrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* The research comes after the work: it is what the studio publishes,
          not what most visitors came for. Each entry is a small tile around
          its own mark, the same shape as the campaign tiles above, so the
          page reads as one run of work rather than work and then a list. */}
      <section className="home-section" aria-labelledby="home-latest-heading">
        <h2 id="home-latest-heading" className="home-section-heading">
          {t("researchHeading")}
        </h2>
        {englishOnly && (
          <p id="home-latest-language" className="home-meta home-section-note">
            {research("englishOnly")}
          </p>
        )}
        <ul
          className="home-showcase home-showcase--research"
          aria-describedby={englishOnly ? "home-latest-language" : undefined}
        >
          {latest.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="home-tile home-tile--research" hrefLang="en">
                <span className="home-tile-art" aria-hidden={true}>
                  <span className="home-tile-disc" />
                  <NavGlyph glyph={item.glyph} size={160} className="home-tile-glyph" />
                </span>
                <span className="home-tile-copy">
                  <h3 className="home-tile-name">{item.title}</h3>
                  <span className="home-tile-blurb">{item.blurb}</span>
                  <RowArrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ContactClosing id="home-closing-heading" />
    </div>
  );
}
