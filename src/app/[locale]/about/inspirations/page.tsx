import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AboutSectionNav } from "@/components/AboutSectionNav";
import { RowArrow } from "@/components/RowArrow";

export const metadata: Metadata = {
  title: "Our Inspirations",
  description:
    "What B-59 aspires to. Audrey Tang went from civic hacker and protester to Taiwan's first digital minister by building better government websites, and met COVID with open data. 18F made US agencies more usable by putting a design perspective in the room, and its shutdown in 2025 did not take its methods with it.",
  alternates: { canonical: "/about/inspirations" },
  openGraph: {
    title: "Our Inspirations | B-59",
    description:
      "Audrey Tang, g0v and Taiwan's open-data COVID response; 18F and the work that outlived its shutdown. The two examples B-59 takes its bearings from.",
    url: "/about/inspirations",
  },
};

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

type Translate = Awaited<ReturnType<typeof getTranslations<"inspirations">>>;
type Key = Parameters<Translate>[0];

/**
 * A picture of the work, with the credit its license asks for. Photos come
 * from Wikimedia Commons; screenshots are of US government work, which is
 * public domain. Files live in `public/inspirations/`, all 1600px wide.
 */
type Figure = { src: string; height: number; caption: Key; credit: Key; source: string };

/** The thing itself, linked where it lives. Titles are proper names; meta says why it matters. */
type Work = { title: Key; meta: Key; href: string };

const tang: { figures: Figure[]; work: Work[] } = {
  figures: [
    {
      src: "/inspirations/sunflower-legislature.jpg",
      height: 1066,
      caption: "figSunflower",
      credit: "figSunflowerCredit",
      source: "https://commons.wikimedia.org/wiki/File:Sunflower_Movement_27DB8715.jpg",
    },
    {
      src: "/inspirations/g0v-hackathon.jpg",
      height: 1066,
      caption: "figG0v",
      credit: "figG0vCredit",
      source: "https://commons.wikimedia.org/wiki/File:G0v_hackathon_13_(16588433834).jpg",
    },
  ],
  work: [
    { title: "g0vTitle", meta: "g0vMeta", href: "https://g0v.tw/" },
    { title: "maskTitle", meta: "maskMeta", href: "https://g0v.hackmd.io/@kiang/mask-info" },
    { title: "vtaiwanTitle", meta: "vtaiwanMeta", href: "https://vtaiwan.tw/" },
    { title: "transcriptsTitle", meta: "transcriptsMeta", href: "https://archive.tw/" },
    { title: "pluralityTitle", meta: "pluralityMeta", href: "https://www.plurality.net/" },
  ],
};

const eighteenF: { figures: Figure[]; work: Work[] } = {
  figures: [
    {
      src: "/inspirations/18f-uswds.jpg",
      height: 1000,
      caption: "figUswds",
      credit: "figUswdsCredit",
      source: "https://designsystem.digital.gov/",
    },
    {
      src: "/inspirations/18f-methods.jpg",
      height: 1000,
      caption: "figMethods",
      credit: "figMethodsCredit",
      source: "https://guides.18f.org/methods/",
    },
  ],
  work: [
    { title: "methodsTitle", meta: "methodsMeta", href: "https://guides.18f.org/methods/" },
    { title: "uswdsTitle", meta: "uswdsMeta", href: "https://designsystem.digital.gov/" },
    { title: "contentGuideTitle", meta: "contentGuideMeta", href: "https://guides.18f.org/content-guide/" },
    { title: "directFileTitle", meta: "directFileMeta", href: "https://github.com/IRS-Public/direct-file" },
    { title: "alumniTitle", meta: "alumniMeta", href: "https://18f.org/" },
  ],
};

function Figures({ t, figures }: { t: Translate; figures: Figure[] }) {
  return (
    <div className="inspiration-figures">
      {figures.map((figure) => (
        <figure key={figure.src} className="inspiration-figure">
          <Image
            src={figure.src}
            alt=""
            width={1600}
            height={figure.height}
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            className="inspiration-figure-image"
          />
          <figcaption className="home-meta">
            {t(figure.caption)}{" "}
            <a href={figure.source} className="inspiration-credit" target="_blank" rel="noopener noreferrer">
              {t(figure.credit)}
              <span className="sr-only">{t("opensNewWindow")}</span>
            </a>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function WorkList({ t, work, labelledBy }: { t: Translate; work: Work[]; labelledBy: string }) {
  return (
    <div className="inspiration-work">
      <h3 id={labelledBy} className="about-principle-title">
        {t("workHeading")}
      </h3>
      <ul className="home-list" aria-labelledby={labelledBy}>
        {work.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="home-row" target="_blank" rel="noopener noreferrer">
              <span className="home-row-body">
                <span className="home-row-title">{t(item.title)}</span>
                <span className="home-meta">{t(item.meta)}</span>
              </span>
              <span className="sr-only">{t("opensNewWindow")}</span>
              <RowArrow />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function OurInspirations() {
  const t = await getTranslations("inspirations");

  return (
    <div className="home about">
      <AboutSectionNav current="inspirations" />

      <div className="home-hero">
        <div className="home-hero-lead">
          <h1 className="home-title">{t("heading")}</h1>
          <p className="home-lede">{t("lede")}</p>
        </div>
      </div>

      <section id="tang" className="home-section about-chapter" aria-labelledby="inspirations-tang">
        <h2 id="inspirations-tang" className="about-chapter-title">
          {t("tangHeading")}
        </h2>
        <div className="about-prose">
          <p>{t.rich("tang1", { blue })}</p>
          <p>{t("tang2")}</p>
          <p>{t.rich("tang3", { blue })}</p>
        </div>
        <Figures t={t} figures={tang.figures} />
        <WorkList t={t} work={tang.work} labelledBy="inspirations-tang-work" />
      </section>

      <section id="18f" className="home-section about-chapter" aria-labelledby="inspirations-18f">
        <h2 id="inspirations-18f" className="about-chapter-title">
          {t("eighteenFHeading")}
        </h2>
        <div className="about-prose">
          <p>{t("eighteenF1")}</p>
          <p>{t("eighteenF2")}</p>
          <p>{t.rich("eighteenF3", { blue })}</p>
        </div>
        <Figures t={t} figures={eighteenF.figures} />
        <WorkList t={t} work={eighteenF.work} labelledBy="inspirations-18f-work" />
      </section>

      <section className="home-section about-chapter" aria-labelledby="inspirations-take">
        <h2 id="inspirations-take" className="home-section-heading">
          {t("takeHeading")}
        </h2>
        <div>
          <p className="about-statement">{t("take1")}</p>
          <p className="about-statement">{t("take2")}</p>
        </div>
      </section>

      <section className="home-section" aria-label={t("cta")}>
        <ul className="home-list">
          <li>
            <Link href="/about/team" className="home-row">
              <span className="about-row-title">{t("cta")}</span>
              <RowArrow />
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
