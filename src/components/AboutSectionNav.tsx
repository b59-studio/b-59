import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export type AboutPage = "story" | "inspirations" | "team";

const PAGES: { key: AboutPage; href: string; label: "ourStory" | "inspirations" | "team" }[] = [
  { key: "story", href: "/about", label: "ourStory" },
  { key: "inspirations", href: "/about/inspirations", label: "inspirations" },
  { key: "team", href: "/about/team", label: "team" },
];

/**
 * The three About pages read as one section: each opens with the same row of
 * links, the current one marked, so the next page is always one step away.
 */
export async function AboutSectionNav({ current }: { current: AboutPage }) {
  const [nav, about] = await Promise.all([getTranslations("nav"), getTranslations("about")]);

  return (
    <nav className="about-nav" aria-label={about("sectionNav")}>
      <ul>
        {PAGES.map((page) => (
          <li key={page.key}>
            <Link href={page.href} aria-current={page.key === current ? "page" : undefined}>
              {nav(page.label)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
