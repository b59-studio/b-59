"use client";

import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

/** Whether the panel around a component fills the window, so a chart can grow into it. */
const ExpandedContext = createContext(false);
export const usePanelExpanded = () => useContext(ExpandedContext);

/**
 * One block of the analysis. A panel whose table is wider than the page can be
 * expanded to fill the browser window (not the screen); Escape or the button
 * closes it. The button shows only while the table overflows.
 */
export function Panel({
  title,
  as: Heading = "h2",
  expandable = true,
  id,
  children,
}: {
  title: React.ReactNode;
  as?: "h2" | "h3";
  expandable?: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!expanded) return;
    document.body.classList.add("ea-locked");
    button.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("ea-locked");
      document.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  return (
    <section id={id} className={`ea-panel${expandable ? " ea-has-x" : ""}${expanded ? " ea-expanded" : ""}`}>
      {expandable && (
        <button
          ref={button}
          type="button"
          className="ea-btn ea-xbtn"
          aria-expanded={expanded}
          aria-label={expanded ? "Close full-window view" : "Expand to fill the window"}
          onClick={() => setExpanded((on) => !on)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              d={expanded ? "M2 6h4V2M14 6h-4V2M2 10h4v4M14 10h-4v4" : "M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4"}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span className="ea-xlabel">{expanded ? "Close" : "Expand"}</span>
        </button>
      )}
      <Heading className="ea-panel-title">{title}</Heading>
      <ExpandedContext.Provider value={expanded}>{children}</ExpandedContext.Provider>
    </section>
  );
}

/** An explanatory note. On a phone it folds behind "About this"; wider screens show it. */
export function Note({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={`ea-note-wrap${open ? " ea-open" : ""}`}>
      <button type="button" className="ea-note-btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {open ? "Hide notes ▾" : "Notes ▸"}
      </button>
      <p id={id} className="ea-note">
        {children}
      </p>
    </div>
  );
}

/**
 * A table with sticky header rows. A table that fits the page flows with it and
 * its header sticks below the site header. One wider than the page scrolls
 * sideways in its own box, with the first column pinned. Each header row
 * sticks below the ones above it, so a two-row header stays readable.
 */
export function DataTable({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const table = useRef<HTMLTableElement>(null);

  useLayoutEffect(() => {
    const wrap = box.current;
    const el = table.current;
    if (!wrap || !el?.tHead) return;
    const thead = el.tHead;
    const layout = () => {
      wrap.classList.toggle("ea-overflows", el.offsetWidth > wrap.clientWidth + 1);
      let y = 0;
      for (const row of thead.rows) {
        for (const th of row.cells) if (th.rowSpan === 1 || y === 0) th.style.top = `calc(var(--ea-stick) + ${y}px)`;
        y += row.getBoundingClientRect().height;
      }
    };
    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(wrap);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="ea-scroll">
      <table ref={table} className="ea-table">
        <thead>{head}</thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** A county name linking to its live tracker, in a new tab. */
export function TrackerLink({ label, url, extra }: { label: string; url: string; extra?: string }) {
  return (
    <a
      className="ea-link"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open the ${label.replace(/ County$/, "")} County live turnout tracker`}
    >
      {label}
      <span className="ea-ext" aria-hidden="true">
        {extra ? ` · ${extra} ↗` : " ↗"}
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export type PickOption = { value: string; label: string; detail?: string };

/**
 * Filter-and-pick: type to narrow the list, arrows to move, Enter to choose,
 * Escape to leave the previous value standing (standards/42). Focus stays in
 * the input; the highlighted row is pointed at with aria-activedescendant.
 */
export function FilterPick({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: PickOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const current = options.find((o) => o.value === value);

  const q = query.trim().toLowerCase();
  const matches = q ? options.filter((o) => `${o.label} ${o.detail ?? ""}`.toLowerCase().includes(q)) : options;

  const show = () => {
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const commit = (option: PickOption | undefined) => {
    if (option) onChange(option.value);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return show();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (matches.length ? (i + step + matches.length) % matches.length : 0));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      commit(matches[active]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div className="ea-pick">
      <label htmlFor={id} className="ea-field-label">
        {label}
      </label>
      <input
        id={id}
        className="ea-input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && matches[active] ? `${id}-${active}` : undefined}
        autoComplete="off"
        value={open ? query : current?.label ?? ""}
        placeholder={current?.label}
        onFocus={show}
        onClick={() => !open && show()}
        onBlur={() => setOpen(false)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      <ul id={listId} role="listbox" aria-label={label} className="ea-pick-list" hidden={!open}>
        {matches.map((o, i) => (
          <li
            key={o.value}
            id={`${id}-${i}`}
            role="option"
            aria-selected={o.value === value}
            className={`ea-pick-option${i === active ? " ea-active" : ""}`}
            onPointerDown={(e) => {
              e.preventDefault();
              commit(o);
            }}
            onPointerEnter={() => setActive(i)}
          >
            <span>{o.label}</span>
            {o.detail && <span className="ea-cnt">{o.detail}</span>}
          </li>
        ))}
        {!matches.length && <li className="ea-pick-empty">Nothing matches “{query}”.</li>}
      </ul>
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="ea-stat">
      <span className="ea-stat-v">{value}</span>
      <span className="ea-stat-k">{label}</span>
    </div>
  );
}
