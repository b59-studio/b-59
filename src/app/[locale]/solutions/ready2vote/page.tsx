import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

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

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;
const r2v = () => (
  <>
    ready<span className="text-b59-blue">2</span>vote
  </>
);

export default async function Ready2Vote() {
  const t = await getTranslations("solutionsReady2vote");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <Image
            src="/ready2vote-star.svg"
            alt="ready2vote"
            width={72}
            height={72}
            className="mb-6"
            priority
          />
          <h1 className="heading-xl mb-6">
            ready<span className="text-b59-blue">2</span>vote
          </h1>
          <div className="body-lg space-y-4">
            <p>{t.rich("intro1", { r2v })}</p>
            <p>{t.rich("intro2", { blue, r2v })}</p>
          </div>
        </section>

        <section>
          <div className="callout-blue">
            <p className="body-md">{t.rich("disclaimer", { blue, r2v })}</p>
          </div>
        </section>

        <section>
          <div className="body-lg space-y-4">
            <p>{t("funding")}</p>
          </div>
          <a
            href="https://readyto.vote"
            className="btn-secondary mt-8"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("cta")}
          </a>
        </section>
      </div>
    </div>
  );
}
