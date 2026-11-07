import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Brand } from "@/components/Brand";
import { NavGlyph } from "@/components/NavGlyph";
import { ProjectMark } from "@/components/ProjectMark";
import { IndexPage, IndexSection, type IndexEntry } from "@/components/IndexList";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "The work of B-59 Studio, Austin, Texas, in one place — the civic products we build and run: ready2vote and Hotline.",
  alternates: { canonical: "/studio" },
  openGraph: {
    title: "Our Work | B-59",
    description:
      "The civic products we build and run — all in one place.",
    url: "/studio",
  },
};

const blue = (chunks: ReactNode) => <span className="text-b59-blue">{chunks}</span>;

export default async function Studio() {
  const [locale, t, nav] = await Promise.all([getLocale(), getTranslations("studio"), getTranslations("nav")]);

  const solutions: IndexEntry[] = [
    {
      href: "/solutions/ready2vote",
      mark: <ProjectMark project="ready2vote" size={40} />,
      title: (
        <>
          ready<span className="text-b59-blue">2</span>vote
        </>
      ),
      meta: t("tagVoting"),
      blurb: t("ready2voteBlurb"),
    },
    {
      href: "/solutions/hotline",
      mark: <ProjectMark project="hotline" size={40} />,
      title: "Hotline",
      meta: t("tagAdministrative"),
      blurb: t("hotlineBlurb"),
    },
  ];

  const services: IndexEntry[] = [
    {
      href: "/studio/political-consulting",
      mark: <NavGlyph glyph="organizing" size={40} />,
      title: nav("politicalConsulting"),
      blurb: nav("politicalConsultingSub"),
    },
    {
      href: "/studio/ballot-measures",
      mark: <NavGlyph glyph="petition" size={40} />,
      title: nav("ballotMeasures"),
      blurb: nav("ballotMeasuresSub"),
    },
  ];

  // Case studies are held back for now. The pages themselves still build and
  // resolve; they are simply unlinked, as the portfolio is. When they return,
  // they are one more IndexSection here, numbered on from the services:
  // travis-county-vdr, voter-registration-palooza and brand-design/merch, with
  // the tagClientWork / tagBrandDesign metas and their *Blurb strings.

  return (
    <IndexPage title={t("heading")} lede={t.rich("intro", { brand: () => <Brand />, blue })}>
      <IndexSection id="work-solutions" heading={t("solutionsHeading")} entries={solutions} locale={locale} />
      <IndexSection
        id="work-services"
        heading={nav("services")}
        entries={services}
        locale={locale}
        start={solutions.length + 1}
      />
    </IndexPage>
  );
}
