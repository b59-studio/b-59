import type { Metadata } from "next";
import Image from "next/image";
import { getFormatter, getTranslations } from "next-intl/server";
import { AboutSectionNav } from "@/components/AboutSectionNav";
import { ContactClosing } from "@/components/ContactClosing";
import { RowArrow } from "@/components/RowArrow";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Team",
  description: "The people behind B-59 Studio. Jonathon Reise, principal — civic technology from Austin, Texas.",
  alternates: { canonical: "/about/team" },
  openGraph: {
    title: "Team | B-59",
    description: "Who you'll be working with at B-59 Studio.",
    url: "/about/team",
  },
};

/**
 * A member's portrait, once there is one to show. Until then the entry is
 * name, role and bio — no silhouette standing in for a face. To add one, drop
 * the file in `public/team/` and set `photo` on the member below.
 */
type Photo = { src: string; width: number; height: number };

/** Writing published elsewhere. Linked, never republished: the publisher's page carries its own disclaimer. */
type Piece = { key: "writingOrganize" | "writingChange"; href: string; date: string };

const jon: { photo?: Photo; linkedIn: string; writing: Piece[] } = {
  linkedIn: "https://www.linkedin.com/in/jonvthon",
  writing: [
    { key: "writingChange", href: "https://www.pfadc.org/pfront-porch/we-can-change", date: "2026-11-06" },
    { key: "writingOrganize", href: "https://www.pfadc.org/pfront-porch/when-we-organize", date: "2026-04-30" },
  ],
};

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;
const brand = () => <Brand />;

export default async function Team() {
  const t = await getTranslations("team");
  const format = await getFormatter();

  return (
    <div className="home about">
      <AboutSectionNav current="team" />

      <div className="home-hero">
        <div className="home-hero-lead">
          <h1 className="home-title">{t("heading")}</h1>
          <p className="home-lede">{t.rich("intro", { brand })}</p>
        </div>
      </div>

      <section className="home-section about-chapter" aria-labelledby="team-jon">
        <div className="team-member-intro">
          {jon.photo && (
            <Image
              src={jon.photo.src}
              alt={t("jonName")}
              width={jon.photo.width}
              height={jon.photo.height}
              sizes="(min-width: 640px) 200px, 100vw"
              className="team-member-photo"
            />
          )}
          <h2 id="team-jon" className="about-chapter-title">
            {t("jonName")}
          </h2>
          <p className="home-meta">{t("jonRole")}</p>
        </div>
        <div className="about-prose">
          <p>{t.rich("jonBio1", { brand, blue })}</p>
          <p>{t.rich("jonBio2", { brand })}</p>
          <a href={jon.linkedIn} className="home-text-action" target="_blank" rel="noopener noreferrer">
            {t("jonLinkedIn")}
            <span className="sr-only">{t("opensNewWindow")}</span>
            <RowArrow />
          </a>
        </div>
        <div className="team-writing">
          <h3 className="about-principle-title">{t("writingHeading")}</h3>
          <ul className="home-list">
            {jon.writing.map((piece) => (
              <li key={piece.key}>
                <a href={piece.href} className="home-row" target="_blank" rel="noopener noreferrer">
                  <span className="home-row-body">
                    <span className="home-row-title">{t(piece.key)}</span>
                    <span className="home-meta">
                      {t("writingSource")} · {format.dateTime(new Date(`${piece.date}T12:00:00`), { dateStyle: "long" })}
                    </span>
                  </span>
                  <span className="sr-only">{t("opensNewWindow")}</span>
                  <RowArrow />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactClosing id="team-closing" />
    </div>
  );
}
