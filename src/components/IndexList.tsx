import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { RowArrow } from "@/components/RowArrow";

export type IndexEntry = {
  href: string;
  /** Renders the entry's mark; drawn very large as the band's cropped shape. */
  mark: (size: number) => ReactNode;
  title: ReactNode;
  blurb: string;
  /** A short category shown above the name, e.g. "Voting". */
  meta?: string;
  /** Set when the destination is published in a different language. */
  hrefLang?: string;
};

/** The shell and title block every index page shares. */
export function IndexPage({ title, lede, children }: { title: ReactNode; lede: ReactNode; children: ReactNode }) {
  return (
    <div className="index-page">
      <header className="index-hero">
        <span className="index-orbit" aria-hidden={true} />
        <h1 className="index-title">{title}</h1>
        <p className="index-lede">{lede}</p>
      </header>
      {children}
    </div>
  );
}

/**
 * One titled run of entries. Each entry is a wide band, all of equal weight,
 * with its mark drawn oversized and cut off by the page edge, alternating
 * sides down the page.
 */
export function IndexSection({
  id,
  heading,
  note,
  entries,
}: {
  id: string;
  heading: ReactNode;
  note?: string;
  entries: IndexEntry[];
}) {
  const headingId = `${id}-heading`;
  const noteId = note ? `${id}-note` : undefined;

  return (
    <section className="index-section" aria-labelledby={headingId}>
      <h2 id={headingId} className="index-section-title">
        {heading}
      </h2>
      {note && (
        <p id={noteId} className="index-note">
          {note}
        </p>
      )}
      <ul className="index-list" aria-describedby={noteId}>
        {entries.map((entry) => (
          <li key={entry.href} className="index-item">
            <Link href={entry.href} className="index-band" hrefLang={entry.hrefLang}>
              <span className="index-art" aria-hidden={true}>
                <span className="index-art-disc" />
                <span className="index-art-mark">{entry.mark(320)}</span>
              </span>
              <span className="index-copy">
                {entry.meta && <span className="index-meta">{entry.meta}</span>}
                <h3 className="index-name">{entry.title}</h3>
                <span className="index-blurb">{entry.blurb}</span>
                <RowArrow />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
