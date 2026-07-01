import type { Metadata } from "next";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";

// Hotline's wordmark is set in Space Grotesk — load it so the name renders in-brand.
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: "700" });

export const metadata: Metadata = {
  title: "Hotline",
  description:
    "Hotline is a scheduling product by B-59. Get booked without sharing your whole calendar: hand-pick a few times, share one link, and the recipient confirms in a single tap — no account, mobile-first. Built for civic and public-interest teams. Visit hotlinecal.com.",
  alternates: { canonical: "/solutions/hotline" },
  openGraph: {
    title: "Hotline | B-59",
    description:
      "Built by B-59. Scheduling for civic and public-interest teams — hand-pick a few times, share one link, confirm in a single tap. Visit hotlinecal.com.",
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
              Get booked without sharing your whole calendar. Hand-pick a few
              times, share one link <span className="text-b59-blue">—</span> they
              tap one, you&apos;re set. Hotline is scheduling for civic and
              public-interest teams.
            </p>
            <p>
              A host hand-picks two to five specific slots for a single meeting
              and shares one link; the recipient confirms in a single tap{" "}
              <span className="text-b59-blue">—</span> no account, mobile-first.
              It&apos;s built on the Cal.com scheduling engine, with the propose
              experience and branded booking page as a thin layer on top.
            </p>
          </div>
        </section>

        <section>
          <h2 className="heading-md mb-4">What makes it different</h2>
          <ul className="body-md space-y-3 list-disc pl-5">
            <li>
              <strong>Propose a few times, not your whole calendar.</strong> The
              host offers a short list of slots instead of exposing full
              availability.
            </li>
            <li>
              <strong>One link, one tap.</strong> The recipient confirms without
              creating an account or installing anything.
            </li>
            <li>
              <strong>Mobile-first and branded.</strong> The booking page is
              designed for a phone and carries the host&apos;s identity, not a
              generic scheduler&apos;s.
            </li>
            <li>
              <strong>Built on Cal.com.</strong> A trusted open-source scheduling
              engine underneath, with the proposal workflow layered on top.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="heading-md mb-4">Why we built this</h2>
          <div className="body-lg space-y-4">
            <p>
              Civic and public-interest teams schedule with people who
              won&apos;t make an account <span className="text-b59-blue">—</span>{" "}
              volunteers, constituents, partners <span className="text-b59-blue">—</span>{" "}
              and most tools ask them to. Those tools also expose a host&apos;s
              whole calendar and carry a corporate feel that&apos;s out of place
              in public work.
            </p>
            <p>
              We wanted scheduling that respects both sides: the host offers a
              few deliberate times, and the other person confirms in a single
              tap from their phone. Hotline is that <span className="text-b59-blue">—</span>{" "}
              the proposal workflow layered on the trusted Cal.com engine, so the
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
