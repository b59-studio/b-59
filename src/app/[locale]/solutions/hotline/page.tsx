import type { Metadata } from "next";
import { BASE_OPEN_GRAPH } from "@/lib/share-card";
import { getTranslations } from "next-intl/server";
import { HotlineWordmark } from "@/components/HotlineWordmark";
import { BrowserShot, DeviceStage, ThemedShot, type Shot } from "@/components/ProductShot";

const DESCRIPTION =
  "Hotline helps organizing teams coordinate: schedule shifts and events, book meetings, and see who's coming.";

export const metadata: Metadata = {
  title: "Hotline — Coordination for organizing teams",
  description: DESCRIPTION,
  alternates: { canonical: "/solutions/hotline" },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: "Hotline — Coordination for organizing teams",
    description: DESCRIPTION,
    url: "/solutions/hotline",
  },
};

const SITE = "https://hotlinecal.com";

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
  // The page a guest lands on from a Hotline link, from the product's own demo data.
  const booking = { width: 1032, height: 806, alt: t("altBooking") };

  return (
    <div className="home product">
      <section className="product-hero" aria-labelledby="hotline-title">
        <div>
          {/* The wordmark is live here and only here: this is Hotline's page, and
              its own rules give a marketing hero the live level and allow one
              loop per view. The dot is the i's tittle, so no separate mark sits
              above it. */}
          <h1 id="hotline-title" className="home-title product-wordmark-title">
            <HotlineWordmark live />
          </h1>
          <p className="product-tagline">{t("tagline")}</p>
          <p className="home-lede">{t("description")}</p>
          <div className="home-actions">
            <a href={SITE} className="btn-secondary" target="_blank" rel="noopener noreferrer">
              {t("cta")}
            </a>
          </div>
        </div>
        <DeviceStage desktop={plate} phone={platePhone} address="hotlinecal.com/meetings" priority />
      </section>

      {/* One screen per row, each named in a short title and one plain sentence.
          The screen does the explaining. */}
      <div className="product-stack">
        <section className="product-split" aria-labelledby="hotline-shifts">
          <div className="product-split-text">
            <h2 id="hotline-shifts" className="heading-lg">
              {t("shiftsTitle")}
            </h2>
            <p className="body-lg">{t("shiftsBody")}</p>
          </div>
          <BrowserShot shot={rotaShifts} address="hotlinecal.com/schedule" />
        </section>

        <section className="product-split product-split--flip" aria-labelledby="hotline-coverage">
          <div className="product-split-text">
            <h2 id="hotline-coverage" className="heading-lg">
              {t("coverageTitle")}
            </h2>
            <p className="body-lg">{t("coverageBody")}</p>
          </div>
          <BrowserShot shot={rotaCoverage} address="hotlinecal.com/schedule/coverage" />
        </section>

        <section className="product-split" aria-labelledby="hotline-booking">
          <div className="product-split-text">
            <h2 id="hotline-booking" className="heading-lg">
              {t("bookingTitle")}
            </h2>
            <p className="body-lg">{t("bookingBody")}</p>
          </div>
          <ThemedShot
            light={{ src: "/products/hotline/booking-light.webp", ...booking }}
            dark={{ src: "/products/hotline/booking-dark.webp", ...booking }}
          />
        </section>

        <section className="product-split product-split--flip" aria-labelledby="hotline-calendar">
          <div className="product-split-text">
            <h2 id="hotline-calendar" className="heading-lg">
              {t("calendarTitle")}
            </h2>
            <p className="body-lg">{t("calendarBody")}</p>
          </div>
          <BrowserShot shot={calendar} address="hotlinecal.com/calendar" />
        </section>
      </div>

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
