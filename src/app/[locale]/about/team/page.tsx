import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Team",
  description: "The people behind B-59 Studio. Jon Reise, founder — civic technology from Austin, Texas.",
  alternates: { canonical: "/about/team" },
  openGraph: {
    title: "Team | B-59",
    description: "Who you'll be working with at B-59 Studio.",
    url: "/about/team",
  },
};

/**
 * A member's portrait, once there is one to show. Until then the entry is
 * name, role and bio — no silhouette standing in for a face. To add one, drop
 * the file in `public/team/` and set `photo` on the member below.
 */
type Photo = { src: string; width: number; height: number };

const jon: { photo?: Photo; linkedIn: string } = {
  linkedIn: "https://www.linkedin.com/in/jonvthon",
};

const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;
const brand = () => <Brand />;

export default async function Team() {
  const t = await getTranslations("team");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-12">
        <section>
          <h1 className="heading-xl mb-6">{t("heading")}</h1>
          <p className="body-lg max-w-2xl">{t.rich("intro", { brand })}</p>
        </section>

        <section>
          <article className="team-member">
            {jon.photo && (
              <Image
                src={jon.photo.src}
                alt={t("jonName")}
                width={jon.photo.width}
                height={jon.photo.height}
                sizes="(min-width: 640px) 200px, 100vw"
                className="team-member-photo"
              />
            )}
            <div className="team-member-body">
              <h2 className="heading-md">{t("jonName")}</h2>
              <p className="text-secondary">{t("jonRole")}</p>
              <div className="body-md space-y-3 mt-3">
                <p>{t.rich("jonBio1", { brand, blue })}</p>
                <p>
                  {t.rich("jonBio2", {
                    link: (chunks) => (
                      <Link href="/about/inspirations" className="text-link">
                        {chunks}
                      </Link>
                    ),
                  })}
                </p>
              </div>
              <a
                href={jon.linkedIn}
                className="text-link font-semibold mt-4 inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("jonLinkedIn")}
                <span className="sr-only">{t("opensNewWindow")}</span>
              </a>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
