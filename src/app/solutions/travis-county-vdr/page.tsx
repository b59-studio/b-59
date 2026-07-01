import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travis County VDR Toolkit",
  description:
    "A civic project by B-59. We rebuilt the Travis County Voter Registration Toolkit — the resource hub for Volunteer Deputy Registrars — migrating a legacy site into a fast, accessible, installable web app.",
  alternates: { canonical: "/solutions/travis-county-vdr" },
  openGraph: {
    title: "Travis County VDR Toolkit | B-59",
    description:
      "Built by B-59. A modern, accessible rebuild of the Travis County Voter Registration Toolkit for Volunteer Deputy Registrars.",
    url: "/solutions/travis-county-vdr",
  },
};

export default function TravisCountyVdr() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <h1 className="heading-xl mb-6">Travis County VDR Toolkit</h1>
          <div className="body-lg space-y-4">
            <p>
              The Travis County Voter Registration Toolkit is the resource hub
              for <strong>Volunteer Deputy Registrars</strong> (VDRs) — the
              trained volunteers who register their neighbors and help keep
              Travis County over 90% registered. It gathers the training,
              programs, events, and materials a VDR needs in one place.
            </p>
            <p>
              The program had outgrown its original website. B-59 rebuilt it from
              the ground up: we migrated every page of the legacy site into a
              fast, accessible, installable web app, and organized the content so
              the office can keep it current without touching code.
            </p>
          </div>
        </section>

        <section>
          <h2 className="heading-md mb-4">What we did</h2>
          <ul className="body-md space-y-3 list-disc pl-5">
            <li>
              Migrated the full content library and restructured it as typed data
              — so editing a page means editing content, not markup.
            </li>
            <li>
              Designed a calm, non-partisan civic identity in Travis County
              navy and Texas gold, built on our shared civic design system.
            </li>
            <li>
              Built to <strong>WCAG 2.2 AA</strong> accessibility, with a
              published accessibility statement.
            </li>
            <li>
              Shipped it as a <strong>Progressive Web App</strong> — installable
              to a phone&apos;s home screen and usable offline.
            </li>
            <li>
              Recovered and curated the program&apos;s original artwork and
              infographics, and documented a clear media and content hand-off.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="heading-md mb-4">How it relates to ready2vote</h2>
          <div className="body-lg space-y-4">
            <p>
              The two projects serve different people. <strong>ready2vote</strong>{" "}
              helps an individual voter complete their own registration
              application. The <strong>VDR Toolkit</strong> serves the volunteers
              who register <em>other</em> people — training, programs, and field
              resources. Together they cover both sides of getting Texans
              registered.
            </p>
          </div>
          <a
            href="https://travis-county-vdr.vercel.app"
            className="btn-secondary mt-8"
            target="_blank"
            rel="noopener noreferrer"
          >
            View the live site
          </a>
        </section>
      </div>
    </div>
  );
}
