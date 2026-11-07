import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProjectMark } from "@/components/ProjectMark";
import { DeviceStage, type Shot } from "@/components/ProductShot";

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

const SITE = "https://readyto.vote";

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;
const r2v = () => (
  <>
    ready<span className="text-b59-blue">2</span>vote
  </>
);

const STEPS = ["step1", "step2", "step3", "step4"] as const;
const DETAILS = ["detail1", "detail2", "detail3"] as const;

export default async function Ready2Vote() {
  const t = await getTranslations("solutionsReady2vote");

  // Captured from the live site; the application screen is its first step,
  // before anything personal is entered.
  const home: Shot = { src: "/products/ready2vote/home.webp", width: 1600, height: 1025, alt: t("altHome") };
  const homePhone: Shot = { src: "/products/ready2vote/home-phone.webp", width: 780, height: 1688, alt: t("altHomePhone") };
  const application: Shot = {
    src: "/products/ready2vote/application.webp",
    width: 1600,
    height: 1025,
    alt: t("altApplication"),
  };
  const applicationPhone: Shot = {
    src: "/products/ready2vote/application-phone.webp",
    width: 780,
    height: 1688,
    alt: t("altApplicationPhone"),
  };

  return (
    <div className="home product">
      <section className="product-hero" aria-labelledby="r2v-title">
        <div>
          <ProjectMark project="ready2vote" size={56} className="project-mark-hero" />
          <h1 id="r2v-title" className="home-title">
            ready<span className="text-b59-blue">2</span>vote
          </h1>
          <p className="home-lede">{t.rich("intro1", { r2v })}</p>
          <div className="home-actions">
            <a href={SITE} className="btn-secondary" target="_blank" rel="noopener noreferrer">
              {t("cta")}
            </a>
            <a href="#how-it-works" className="home-text-action">
              {t("howLink")}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <DeviceStage desktop={home} phone={homePhone} address="readyto.vote" priority />
      </section>

      <section id="how-it-works" aria-labelledby="r2v-how" className="scroll-mt-24">
        <div className="product-section-intro">
          <h2 id="r2v-how" className="heading-lg">
            {t("howHeading")}
          </h2>
          <p className="body-lg">{t.rich("intro2", { blue, r2v })}</p>
        </div>
        <ol className="product-features product-features--4">
          {STEPS.map((step, i) => (
            <li key={step}>
              <span className="product-step-number" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="heading-sm">{t(`${step}Title`)}</h3>
              <p className="body-md">{t(`${step}Body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="product-split product-split--flip" aria-labelledby="r2v-detail">
        <div className="product-split-text">
          <h2 id="r2v-detail" className="heading-lg">
            {t("detailHeading")}
          </h2>
          <ul className="product-features product-features--stack">
            {DETAILS.map((detail) => (
              <li key={detail}>
                <h3 className="heading-sm">{t(`${detail}Title`)}</h3>
                <p className="body-md">{t(`${detail}Body`)}</p>
              </li>
            ))}
          </ul>
        </div>
        <DeviceStage desktop={application} phone={applicationPhone} address="readyto.vote/registration" />
      </section>

      <section aria-label={t("disclaimerLabel")}>
        <div className="callout-blue product-prose">
          <p className="body-md">{t.rich("disclaimer", { blue, r2v })}</p>
        </div>
      </section>

      <section className="product-closing" aria-labelledby="r2v-closing">
        <h2 id="r2v-closing" className="home-closing-title">
          {t("closingHeading")}
        </h2>
        <p className="body-lg">{t("funding")}</p>
        <div className="home-actions">
          <a href={SITE} className="btn-secondary" target="_blank" rel="noopener noreferrer">
            {t("cta")}
          </a>
        </div>
      </section>
    </div>
  );
}
