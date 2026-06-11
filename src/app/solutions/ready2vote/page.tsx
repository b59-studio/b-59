import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ready2vote",
  description:
    "ready2vote is a civic product built by B-59. It helps Texans complete their voter registration application online and have it mailed to their county. ready2vote doesn't register you—your county does that when they receive your application. Visit readyto.vote.",
  alternates: { canonical: "/solutions/ready2vote" },
  openGraph: {
    title: "ready2vote | B-59",
    description:
      "Built by B-59. The first online tool that helps Texans complete their voter registration application and have it mailed to their county. Visit readyto.vote.",
    url: "/solutions/ready2vote",
  },
};

export default function Ready2Vote() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <p className="text-secondary mb-2">Solutions</p>
          <h1 className="heading-xl mb-6">
            ready<span className="text-b59-blue">2</span>vote
          </h1>
          <div className="body-lg space-y-4">
            <p>
              ready<span className="text-b59-blue">2</span>vote is a civic
              product we design and run at B<span className="text-b59-blue">-</span>59.
              It&apos;s the first online tool built to do one thing: help Texans
              complete their voter registration application on the web and have
              it mailed to their county for them.
            </p>
            <p>
              In Texas, there&apos;s no single &ldquo;click to register&rdquo;
              option run by the state. To get on the voter rolls, you have to get
              a signed registration application to your county <span className="text-b59-blue">—</span>{" "}
              usually by printing a form, filling it out, and mailing it
              yourself. ready<span className="text-b59-blue">2</span>vote lets you
              complete that application online and sign electronically; it then
              works with a trusted mailing service to print and mail the form to
              the right county office. You get a copy for your records and can
              check that it was sent.
            </p>
          </div>
        </section>

        <section>
          <div className="callout-blue">
            <p className="body-md">
              To be clear: ready<span className="text-b59-blue">2</span>vote
              doesn&apos;t register you to vote, and we don&apos;t approve your
              application. Your county does that when they receive and process
              it. We&apos;re not your county and not the government <span className="text-b59-blue">—</span>{" "}
              we only make it easier to get your completed application to the
              office that can add you to the voter rolls.
            </p>
          </div>
        </section>

        <section>
          <div className="body-lg space-y-4">
            <p>
              It&apos;s free, run as a civic effort and funded by donations from
              people who want to make it easier for others to get their
              application to their county. See the live project at{" "}
              <a
                href="https://readyto.vote"
                className="text-link font-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                readyto.vote
              </a>
              .
            </p>
          </div>
          <a
            href="https://readyto.vote"
            className="btn-secondary mt-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Start your application
          </a>
        </section>
      </div>
    </div>
  );
}
