import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design-Philosophy",
  description:
    "How B-59 approaches brand design. A brand is a set of decisions about how an organization shows up — clarity before polish, restraint as strategy, systems built to be used, and neutrality by default. For campaigns, committees, firms, and institutions where trust is the whole game.",
  alternates: { canonical: "/solutions/brand-design/philosophy" },
  openGraph: {
    title: "Design-Philosophy | B-59",
    description:
      "A brand is not a logo. It's a set of decisions about how an organization shows up. How B-59 designs brands for campaigns, committees, firms, and institutions where trust is the whole game.",
    url: "/solutions/brand-design/philosophy",
  },
};

export default function BrandPhilosophy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-16">
        <section>
          <h1 className="heading-xl mb-6">
            Design<span className="text-b59-blue">-</span>Philosophy
          </h1>
          <div className="body-lg space-y-4">
            <p>
              A brand is not a logo. It&apos;s the set of decisions an
              organization makes about how it shows up <span className="text-b59-blue">—</span>{" "}
              what it says, what it withholds, and whether the two match. We
              design brands for organizations that operate where trust is the
              whole game: campaigns, committees, firms, and institutions that
              can&apos;t afford to look like everyone else, or to look like
              they&apos;re hiding something.
            </p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">Clarity before polish</h2>
          <div className="body-lg space-y-4">
            <p>
              A brand should make the work easier to understand, not harder. We
              start with what you do and who depends on it, then design outward.
              Polish is the last 10 percent <span className="text-b59-blue">—</span>{" "}
              it matters, but only once the thing underneath is clear.
            </p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">Restraint is a strategy</h2>
          <div className="body-lg space-y-4">
            <p>
              The temptation is always to add: more color, more motion, more
              message. We subtract. In high-stakes contexts <span className="text-b59-blue">—</span>{" "}
              a campaign in its final weeks, a firm in front of a jury, a
              committee under scrutiny <span className="text-b59-blue">—</span> restraint
              reads as confidence. The work should look like it knows what it
              is.
            </p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">Built to be used</h2>
          <div className="body-lg space-y-4">
            <p>
              A brand lives in the hands of people who aren&apos;t designers{" "}
              <span className="text-b59-blue">—</span> staff, volunteers,
              counsel, a comms director at 11pm. We design systems that hold up
              when we&apos;re not in the room: clear rules, real files, and no
              guesswork. A brand that can only be applied by the people who made
              it isn&apos;t finished.
            </p>
          </div>
        </section>

        <section>
          <h2 className="heading-lg mb-6">Neutral by default</h2>
          <div className="body-lg space-y-4">
            <p>
              We work across the political and professional spectrum. Our craft
              is making your message land <span className="text-b59-blue">—</span> not
              inserting ours. We bring judgment about what will read as
              credible to the people you need to reach, and we keep our own
              thumb off the scale.
            </p>
          </div>
          <a href="mailto:contact@b-59.com" className="btn-primary mt-8">
            Start a brand project
          </a>
        </section>
      </div>
    </div>
  );
}
