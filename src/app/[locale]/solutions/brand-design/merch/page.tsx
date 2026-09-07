import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProjectMark } from "@/components/ProjectMark";

export const metadata: Metadata = {
  title: "Merch",
  description:
    "Stickers, shirts and print B-59 designs for the groups it works with. Starting with a die-cut sticker for the Pflugerville Area Democrats.",
  alternates: { canonical: "/solutions/brand-design/merch" },
  openGraph: {
    title: "Merch | B-59",
    description:
      "Stickers, shirts and print designed for the groups we work with — the brand at the size of a laptop lid.",
    url: "/solutions/brand-design/merch",
  },
};

/**
 * One entry per piece a client has cleared for the page. The image is a
 * photograph of the printed thing rather than the artwork file: merch is
 * judged stuck to a laptop, not on a screen, so the page shows it that way.
 */
type MerchItem = {
  clientKey: string;
  titleKey: string;
  blurbKey: string;
  altKey: string;
  image: { src: string; width: number; height: number };
};

const items: MerchItem[] = [
  {
    clientKey: "stickerClient",
    titleKey: "stickerTitle",
    blurbKey: "stickerBlurb",
    altKey: "stickerAlt",
    image: {
      src: "/merch/pflugerville-area-democrats-tala-pfreakin-texan-sticker.jpg",
      width: 1161,
      height: 1200,
    },
  },
];

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

export default async function Merch() {
  const t = await getTranslations("merch");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <ProjectMark project="merch" size={72} className="project-mark-hero" />
          <h1 className="heading-xl mb-6">{t("heading")}</h1>
          <p className="body-lg max-w-2xl">{t.rich("intro", { blue })}</p>
        </section>

        <section>
          <ul className="portfolio-grid">
            {items.map((item) => (
              <li key={item.image.src} className="portfolio-card">
                <Image
                  src={item.image.src}
                  alt={t(item.altKey)}
                  width={item.image.width}
                  height={item.image.height}
                  sizes="(min-width: 896px) 420px, (min-width: 640px) 50vw, 100vw"
                  className="portfolio-card-image"
                />
                <span className="portfolio-card-tag">{t(item.clientKey)}</span>
                <h2 className="heading-sm">{t(item.titleKey)}</h2>
                <p className="body-md">{t(item.blurbKey)}</p>
              </li>
            ))}
          </ul>
          <p className="body-sm text-secondary mt-6">{t("more")}</p>
        </section>

        <section>
          <div className="callout-blue">
            <p className="body-md">
              {t.rich("closingBody", {
                link: () => (
                  <Link href="/solutions/brand-design/philosophy" className="text-link font-semibold">
                    {t("closingLinkText")}
                  </Link>
                ),
              })}
            </p>
          </div>
          <a href="mailto:contact@b-59.com" className="btn-primary mt-8">
            {t("cta")}
          </a>
        </section>
      </div>
    </div>
  );
}
