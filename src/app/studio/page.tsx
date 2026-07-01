import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

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

const solutions: WorkItem[] = [
  {
    tag: "Voting",
    title: (
      <>
        ready<span className="text-b59-blue">2</span>vote
      </>
    ),
    href: "/solutions/ready2vote",
    blurb:
      "The first online tool that helps Texans complete their voter registration application and have it mailed to their county.",
  },
  {
    tag: "Administrative",
    title: "Hotline",
    href: "/solutions/hotline",
    blurb:
      "Scheduling for civic and public-interest teams — hand-pick a few times, share one link, confirm in a single tap.",
  },
];

const caseStudies: WorkItem[] = [
  {
    tag: "Client work",
    title: "Travis County VDR Toolkit",
    href: "/solutions/travis-county-vdr",
    blurb:
      "A mobile-first, installable rebuild of the Travis County Voter Registration Toolkit for Volunteer Deputy Registrars.",
  },
];

function WorkGrid({ items }: { items: WorkItem[] }) {
  return (
    <ul className="portfolio-grid">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="portfolio-card h-full">
            <span className="portfolio-card-tag">{item.tag}</span>
            <h3 className="heading-sm">{item.title}</h3>
            <p className="body-md">{item.blurb}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Studio() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <h1 className="heading-xl mb-6">Our Work</h1>
          <p className="body-lg max-w-2xl">
            Everything B-59 Studio makes, in one place{" "}
            <span className="text-b59-blue">—</span> the civic products we build
            and run, and selected client work.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-1">Solutions</h2>
          <p className="body-md text-b59-gray mb-6">
            Civic products we build and run.
          </p>
          <WorkGrid items={solutions} />
        </section>

        <section>
          <h2 className="heading-md mb-1">Case Studies</h2>
          <p className="body-md text-b59-gray mb-6">Selected client work.</p>
          <WorkGrid items={caseStudies} />
        </section>
      </div>
    </div>
  );
}
