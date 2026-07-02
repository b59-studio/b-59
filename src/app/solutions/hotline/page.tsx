import type { Metadata } from "next";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";

// Hotline's wordmark is set in Space Grotesk — load it so the name renders in-brand.
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: "700" });

export const metadata: Metadata = {
  title: "Hotline",
  description:
    "Hotline is a scheduling product by B-59 for civic and public-interest teams, whose calendars are sensitive. Instead of exposing your whole calendar, hand-pick a few times and share one link — the other person taps one. Works with iCloud or Outlook, no Google required. Visit hotlinecal.com.",
  alternates: { canonical: "/solutions/hotline" },
  openGraph: {
    title: "Hotline | B-59",
    description:
      "Built by B-59. Scheduling for civic and public-interest teams: share a few times, not your whole calendar. Works with iCloud or Outlook, no Google required. Visit hotlinecal.com.",
    url: "/solutions/hotline",
  },
};

export default function Hotline() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <Image
            src="/hotline-signal.svg"
            alt="Hotline"
            width={72}
            height={72}
            className="mb-6"
            priority
          />
          <h1
            className={`heading-xl mb-3 ${spaceGrotesk.className}`}
            style={{ letterSpacing: "-0.02em" }}
          >
            Hotline
          </h1>
          <p className="body-md text-b59-gray mb-6">Pick a time that works.</p>
          <div className="body-lg space-y-4">
            <p>
              Civic and public-interest teams keep sensitive things on their
              calendars. You shouldn&apos;t have to hand over the whole thing
              just to get a meeting on the books{" "}
              <span className="text-b59-blue">—</span> so with Hotline you
              hand-pick a few times, share one link, and the other person taps
              one. Scheduling built for civic and public-interest teams.
            </p>
            <p>
              A host picks two to five specific slots for a single meeting and
              shares one link; the other person confirms in a tap from their
              phone. It works with the calendar you already keep{" "}
              <span className="text-b59-blue">—</span> iCloud or Outlook, no
              Google required <span className="text-b59-blue">—</span> and
              it&apos;s built on the Cal.com scheduling engine, with the propose
              experience and branded booking page as a thin layer on top.
            </p>
          </div>
        </section>

        <section>
          <h2 className="heading-md mb-4">What makes it different</h2>
          <ul className="body-md space-y-3 list-disc pl-5">
            <li>
              <strong>Your whole calendar stays private.</strong> The host offers
              a short list of times instead of exposing full availability. That
              is the whole point for teams whose calendars are sensitive.
            </li>
            <li>
              <strong>Works with the calendar you keep.</strong> Connects to
              iCloud or Outlook, with no Google account required.
            </li>
            <li>
              <strong>One link, one tap.</strong> The other person picks a time
              from their phone in a single tap, on a page built for mobile.
            </li>
            <li>
              <strong>Built on Cal.com.</strong> A trusted open-source scheduling
              engine underneath, with the proposal workflow and branded booking
              page layered on top.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="heading-md mb-4">Why we built this</h2>
          <div className="body-lg space-y-4">
            <p>
              Civic and public-interest teams&apos; calendars are sensitive{" "}
              <span className="text-b59-blue">—</span> they hold meetings, plans,
              and people that aren&apos;t anyone else&apos;s business. Most
              scheduling tools work by exposing your availability wholesale,
              which is exactly the wrong default for this kind of work.
            </p>
            <p>
              We wanted the opposite: give people a few good options instead of
              your whole calendar. A host proposes a handful of times, shares one
              link, and the other person picks one from their phone{" "}
              <span className="text-b59-blue">—</span> connected to iCloud or
              Outlook, with no Google account in the middle. It&apos;s the
              proposal workflow layered on the trusted Cal.com engine, so the
              scheduling stays solid and the experience stays simple.
            </p>
          </div>
        </section>

        <section>
          <div className="body-lg space-y-4">
            <p>
              See the live project at{" "}
              <a
                href="https://hotlinecal.com"
                className="text-link font-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                hotlinecal.com
              </a>
              .
            </p>
          </div>
          <a
            href="https://hotlinecal.com"
            className="btn-secondary mt-8"
            target="_blank"
            rel="noopener noreferrer"
          >
            Make the call
          </a>
        </section>
      </div>
    </div>
  );
}
