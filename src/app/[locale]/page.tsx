import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: { absolute: "B-59 Studio" },
  description:
    "Deliberate design for imperfect systems. B-59 is a design and strategy studio building civic platforms, advising on complex decisions, and making things that matter. Human-centered. Public-first.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "B-59 — Deliberate design for imperfect systems",
    description:
      "Designing democracy. Digital infrastructure for public servants. We build civic technology and advise on complex decisions.",
    url: "/",
  },
};

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-16">
      <div className="text-center">
        <h1 className="heading-xl">{t.rich("heading", { blue })}</h1>
        <p className="body-lg max-w-3xl mx-auto">{t("subhead")}</p>
        <br />
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/about" className="btn-primary">
            {t("learnMore")}
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * HERO 1
Headline:
Good technology starts with good judgment.

Subhead:
We're B-59—a design and strategy studio building civic platforms, advising on complex decisions, and making things that matter. Human-centered. Public-first.

Supporting line:
Have a problem worth solving? We want to hear it.

Primary CTA: Share Your Challenge
Secondary CTA: See Our Work
 * HERO 2
Headline:
The human in the loop.

Subhead:
B-59 is a design and strategy consultancy that builds civic technology, provides clear-headed advice, and creates specialty products. We combine new tools with old-fashioned judgment.

Supporting line:
Got an idea for a platform that could help people? Tell us about it.

Primary CTA: Start a Conversation
Secondary CTA: Explore What We Build

* HERO 3
Headline:
Human judgment for systems that serve people.

Subhead:
We build civic platforms, advise institutions on hard decisions, and design products with care. If it helps people, we're interested.

Supporting line:
Platforms • Advisory • Products—all human-centered.

Primary CTA: Tell Us What You Need
Secondary CTA: See Our Platforms

* HERO 4
Headline:
We solve problems the system can't.

Subhead:
B-59 builds civic platforms for public good and advises organizations making decisions under uncertainty. Human judgment, modern tools, real accountability.

Two-column approach or stacked CTAs:
Primary CTA: "Share a Problem" or "Start a Conversation"
Secondary CTA: "See What We Build"

Below CTAs, three trust signals:
"Building civic technology" | "Strategic advisory" | "Human-first approach"
*/
