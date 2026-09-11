import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { Brand } from "@/components/Brand";
import { ProjectMark, type ProjectKey } from "@/components/ProjectMark";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "The work of B-59 Studio in one place — the civic products we build and run. ready2vote and Hotline.",
  alternates: { canonical: "/studio" },
  openGraph: {
    title: "Our Work | B-59",
    description:
      "The civic products we build and run — all in one place.",
    url: "/studio",
  },
};

type WorkItem = {
  tag: string;
  project: ProjectKey;
  title: ReactNode;
  href: string;
  blurb: string;
};

function WorkGrid({ items }: { items: WorkItem[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="portfolio-card portfolio-card--marked">
            <ProjectMark project={item.project} size={32} className="portfolio-card-mark" />
            <span className="portfolio-card-body">
              <span className="portfolio-card-tag">{item.tag}</span>
              <h3 className="heading-sm">{item.title}</h3>
              <p className="body-md">{item.blurb}</p>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

export default async function Studio() {
  const t = await getTranslations("studio");

  const solutions: WorkItem[] = [
    {
      tag: t("tagVoting"),
      project: "ready2vote",
      title: (
        <>
          ready<span className="text-b59-blue">2</span>vote
        </>
      ),
      href: "/solutions/ready2vote",
      blurb: t("ready2voteBlurb"),
    },
    {
      tag: t("tagAdministrative"),
      project: "hotline",
      title: "Hotline",
      href: "/solutions/hotline",
      blurb: t("hotlineBlurb"),
    },
  ];

  // Case studies are held back for now. The pages themselves still build and
  // resolve; they are simply unlinked, as the portfolio is.
  // const caseStudies: WorkItem[] = [
  //   {
  //     tag: t("tagClientWork"),
  //     project: "travis-county-vdr",
  //     title: "Travis County VDR Toolkit",
  //     href: "/solutions/travis-county-vdr",
  //     blurb: t("travisCountyVdrBlurb"),
  //   },
  //   {
  //     tag: t("tagClientWork"),
  //     project: "voter-registration-palooza",
  //     title: "Voter Registration Palooza",
  //     href: "/solutions/voter-registration-palooza",
  //     blurb: t("voterRegistrationPaloozaBlurb"),
  //   },
  //   {
  //     tag: t("tagBrandDesign"),
  //     project: "merch",
  //     title: t("merchTitle"),
  //     href: "/solutions/brand-design/merch",
  //     blurb: t("merchBlurb"),
  //   },
  // ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <h1 className="heading-xl mb-6">{t("heading")}</h1>
          <p className="body-lg max-w-2xl">{t.rich("intro", { brand: () => <Brand />, blue })}</p>
        </section>

        <section>
          <h2 className="heading-md mb-4">{t("solutionsHeading")}</h2>
          <WorkGrid items={solutions} />
        </section>

        {/* <section>
          <h2 className="heading-md mb-4">{t("caseStudiesHeading")}</h2>
          <WorkGrid items={caseStudies} />
        </section> */}
      </div>
    </div>
  );
}
