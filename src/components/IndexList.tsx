import type { CSSProperties, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { RowArrow } from "@/components/RowArrow";

export type IndexEntry = {
  href: string;
  mark: ReactNode;
  title: ReactNode;
  blurb: string;
  /** A short category shown under the title, e.g. "Voting". */
  meta?: string;
  /** Set when the destination is published in a different language. */
  hrefLang?: string;
};

/** The shell and title block every index page shares. */
export function IndexPage({ title, lede, children }: { title: ReactNode; lede: ReactNode; children: ReactNode }) {
  return (
    <div className="index-page">
      <header className="index-hero">
        <h1 className="index-title">{title}</h1>
        <p className="index-lede">{lede}</p>
      </header>
      {children}
    </div>
  );
}

/**
 * One titled run of numbered rows. `start` continues the numbering from an
 * earlier section, so a page reads as a single catalogue.
 */
export function IndexSection({
  id,
  heading,
  note,
  entries,
  locale,
  start = 1,
}: {
  id: string;
  heading: ReactNode;
  note?: string;
  entries: IndexEntry[];
  locale: string;
  start?: number;
}) {
  const number = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 });
  const headingId = `${id}-heading`;
  const noteId = note ? `${id}-note` : undefined;

  return (
    <section className="index-section" aria-labelledby={headingId}>
      <div className="index-section-head">
        <h2 id={headingId} className="index-section-title">
          {heading}
        </h2>
        <span className="index-section-rule" aria-hidden={true} />
        <span className="index-section-count" aria-hidden={true}>
          {number.format(entries.length)}
        </span>
      </div>
      {note && (
        <p id={noteId} className="index-note">
          {note}
        </p>
      )}
      <ol className="index-list" aria-describedby={noteId}>
        {entries.map((entry, i) => (
          <li key={entry.href} style={{ "--index-order": i } as CSSProperties}>
            <Link href={entry.href} className="index-row" hrefLang={entry.hrefLang}>
              <span className="index-num" aria-hidden={true}>
                {number.format(start + i)}
              </span>
              <span className="index-mark">{entry.mark}</span>
              <span className="index-head">
                <h3 className="index-name">{entry.title}</h3>
                {entry.meta && <span className="index-meta">{entry.meta}</span>}
              </span>
              <span className="index-blurb">{entry.blurb}</span>
              <RowArrow />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
