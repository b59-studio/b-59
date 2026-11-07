import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { ProjectMark } from "@/components/ProjectMark";
import { BrowserShot, DeviceStage, ThemedShot, type Shot } from "@/components/ProductShot";

// Hotline's wordmark is set in Geist — load it so the name renders in-brand.
const geist = Geist({ subsets: ["latin"], weight: "700" });

export const metadata: Metadata = {
  title: "Hotline",
  description:
    "Scheduling and workforce management by B-59 for civic and public-interest teams: hand-pick a few times and share one link instead of exposing your whole calendar, then run shifts, coverage and hours in the same place. Visit hotlinecal.com.",
  alternates: { canonical: "/solutions/hotline" },
  openGraph: {
    title: "Hotline | B-59",
    description:
      "Built by B-59. Share a few times, not your whole calendar — then run the rota, coverage and hours in the same product. Works with Google, Outlook, Apple iCloud or any ICS feed. Visit hotlinecal.com.",
    url: "/solutions/hotline",
  },
};

const SITE = "https://hotlinecal.com";

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

// org3 (coverage) and org4 (hours) each get a screen of their own above; the
// two claims with no screen to show stay in the scan list.
const ORG = ["org1", "org2"] as const;

export default async function Hotline() {
  const t = await getTranslations("solutionsHotline");

  // Screens from the app itself, signed in as a test account seeded with the
  // product's own synthetic demo data (every recipient is @example.com).
  const plate: Shot = { src: "/products/hotline/plate.webp", width: 1600, height: 1025, alt: t("altHome") };
  const platePhone: Shot = { src: "/products/hotline/plate-phone.webp", width: 780, height: 1688, alt: t("altHomePhone") };
  const calendar: Shot = { src: "/products/hotline/calendar.webp", width: 1600, height: 1025, alt: t("altCalendar") };
  // The rota screens, from a test organization seeded with a synthetic roster
  // (names only, no accounts) and one deliberately uncovered day.
  const rotaShifts: Shot = { src: "/products/hotline/rota-schedule.webp", width: 1600, height: 1025, alt: t("altRotaShifts") };
  const rotaCoverage: Shot = { src: "/products/hotline/rota-coverage.webp", width: 1600, height: 1025, alt: t("altRotaCoverage") };
  const rotaTime: Shot = { src: "/products/hotline/rota-time.webp", width: 1600, height: 1025, alt: t("altRotaTime") };
  // The page a guest lands on from a Hotline link, from the product's own demo data.
  const booking = { width: 1032, height: 806, alt: t("altBooking") };

  return (
    <div className="home product">
      <section className="product-hero" aria-labelledby="hotline-title">
        <div>
          {/* The mark beats here and only here — this is Hotline's page, and its
              own design system reserves the heartbeat for the hero. */}
          <ProjectMark project="hotline" size={56} beat className="project-mark-hero" />
          <h1 id="hotline-title" className={`home-title ${geist.className}`}>
            Hotline
          </h1>
          <p className="product-tagline">{t("tagline")}</p>
          <p className="home-lede">{t.rich("intro1", { blue })}</p>
          <div className="home-actions">
            <a href={SITE} className="btn-secondary" target="_blank" rel="noopener noreferrer">
              {t("cta")}
            </a>
            <a href="#different" className="home-text-action">
              {t("differentHeading")}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <DeviceStage desktop={plate} phone={platePhone} address="hotlinecal.com/meetings" priority />
      </section>

      <section id="different" className="scroll-mt-24 product-stack" aria-labelledby="hotline-different">
        <div className="product-split">
          <div className="product-split-text">
            <h2 id="hotline-different" className="heading-lg">
              {t("differentHeading")}
            </h2>
            <p className="body-lg">{t.rich("intro2", { blue })}</p>
          </div>
          <BrowserShot shot={calendar} address="hotlinecal.com/calendar" />
        </div>

        <div className="product-split product-split--flip">
          <div className="product-split-text">
            <h3 className="heading-md">{t("diff3Strong")}</h3>
            <p className="body-lg">{t("diff3Body")}</p>
          </div>
          <ThemedShot
            light={{ src: "/products/hotline/booking-light.webp", ...booking }}
            dark={{ src: "/products/hotline/booking-dark.webp", ...booking }}
          />
        </div>

        <ul className="product-features product-features--3">
          <li>
            <h3 className="heading-sm">{t("diff1Strong")}</h3>
            <p className="body-md">{t("diff1Body")}</p>
          </li>
          <li>
            <h3 className="heading-sm">{t("diff2Strong")}</h3>
            <p className="body-md">{t("diff2Body")}</p>
          </li>
          <li>
            <h3 className="heading-sm">{t("diff4Strong")}</h3>
            <p className="body-md">{t("diff4Body")}</p>
          </li>
        </ul>
      </section>

      <section className="product-stack" aria-labelledby="hotline-org">
        <div className="product-split">
          <div className="product-split-text">
            <h2 id="hotline-org" className="heading-lg">
              {t("orgHeading")}
            </h2>
            <p className="body-lg">{t.rich("orgIntro", { blue })}</p>
          </div>
          <BrowserShot shot={rotaShifts} address="hotlinecal.com/schedule" />
        </div>

        <div className="product-split product-split--flip">
          <div className="product-split-text">
            <h3 className="heading-md">{t("org3Strong")}</h3>
            <p className="body-lg">{t("org3Body")}</p>
          </div>
          <BrowserShot shot={rotaCoverage} address="hotlinecal.com/schedule/coverage" />
        </div>

        <div className="product-split">
          <div className="product-split-text">
            <h3 className="heading-md">{t("org4Strong")}</h3>
            <p className="body-lg">{t("org4Body")}</p>
          </div>
          <BrowserShot shot={rotaTime} address="hotlinecal.com/schedule/time" />
        </div>

        <ul className="product-features">
          {ORG.map((item) => (
            <li key={item}>
              <h3 className="heading-sm">{t(`${item}Strong`)}</h3>
              <p className="body-md">{t(`${item}Body`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="product-prose" aria-labelledby="hotline-why">
        <h2 id="hotline-why" className="heading-lg">
          {t("whyHeading")}
        </h2>
        <div className="body-lg space-y-4 mt-4">
          <p>{t.rich("why1", { blue })}</p>
          <p>{t.rich("why2", { blue })}</p>
        </div>
      </section>

      <section className="product-closing" aria-labelledby="hotline-closing">
        <h2 id="hotline-closing" className="home-closing-title">
          {t("closingHeading")}
        </h2>
        <p className="body-lg">{t("closingBody")}</p>
        <div className="home-actions">
          <a href={SITE} className="btn-secondary" target="_blank" rel="noopener noreferrer">
            {t("cta")}
          </a>
        </div>
      </section>
    </div>
  );
}
