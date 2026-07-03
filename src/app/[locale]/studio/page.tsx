import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "The work of B-59 Studio in one place — the civic products we build and run, and selected client case studies. ready2vote, Hotline, and the Travis County VDR Toolkit.",
  alternates: { canonical: "/studio" },
  openGraph: {
    title: "Our Work | B-59",
    description:
      "Civic products we build and run, plus selected client work — all in one place.",
    url: "/studio",
  },
};

type WorkItem = {
  tag: string;
  title: ReactNode;
  href: string;
  blurb: string;
};

function WorkGrid({ items }: { items: WorkItem[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="portfolio-card">
            <span className="portfolio-card-tag">{item.tag}</span>
            <h3 className="heading-sm">{item.title}</h3>
            <p className="body-md">{item.blurb}</p>
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
      title: "Hotline",
      href: "/solutions/hotline",
      blurb: t("hotlineBlurb"),
    },
  ];

  const caseStudies: WorkItem[] = [
    {
      tag: t("tagClientWork"),
      title: "Travis County VDR Toolkit",
      href: "/solutions/travis-county-vdr",
      blurb: t("travisCountyVdrBlurb"),
    },
  ];

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

        <section>
          <h2 className="heading-md mb-4">{t("caseStudiesHeading")}</h2>
          <WorkGrid items={caseStudies} />
        </section>
      </div>
    </div>
  );
}
