"use client";

import { createContext, Fragment, useContext, useState } from "react";
import { GROUP_LABEL, ROWS } from "./data";
import { DataTable } from "./parts";

/** Counties whose live tracker could be read; they lead every county list after Travis. */
export const LiveCountiesContext = createContext<ReadonlySet<string>>(new Set());

type SortValue = number | string | null | undefined;
type Dir = "desc" | "asc";

export const SortContext = createContext<{ by: string | null; dir: Dir; toggle: (by: string) => void }>({
  by: null,
  dir: "desc",
  toggle: () => {},
});

/**
 * A column header that sorts the table. The first click sorts highest first
 * (A to Z for the county name), the second reverses, the third restores the
 * default order.
 */
export function SortTh({
  by,
  className,
  rowSpan,
  children,
}: {
  by: string;
  className?: string;
  rowSpan?: number;
  children: React.ReactNode;
}) {
  const { by: active, dir, toggle } = useContext(SortContext);
  const on = active === by;
  return (
    <th className={className} rowSpan={rowSpan} aria-sort={on ? (dir === "desc" ? "descending" : "ascending") : "none"}>
      <button type="button" className="ea-sort" onClick={() => toggle(by)}>
        {children}
        <span className={`ea-sort-mark${on ? " ea-on" : ""}`} aria-hidden="true">
          {on ? (dir === "desc" ? "▼" : "▲") : "↕"}
        </span>
      </button>
    </th>
  );
}

const firstDir = (by: string): Dir => (by === "name" ? "asc" : "desc");

/** Sort state for a table of SortTh headers: which key, which way, and the three-click toggle. */
export function useSortState() {
  const [by, setBy] = useState<string | null>(null);
  const [dir, setDir] = useState<Dir>("desc");
  const toggle = (key: string) => {
    if (key !== by) {
      setBy(key);
      setDir(firstDir(key));
    } else if (dir === firstDir(key)) {
      setDir(dir === "desc" ? "asc" : "desc");
    } else {
      setBy(null);
    }
  };
  return { by, dir, toggle, reset: () => setBy(null) };
}

/** `items` ranked by `value`, blanks last; unchanged when nothing is sorted. */
export function sortItems<T>(items: T[], value: ((item: T) => SortValue) | null, dir: Dir): T[] {
  return value ? [...items].sort((a, b) => compare(value(a), value(b), dir)) : items;
}

function compare(a: SortValue, b: SortValue, dir: Dir): number {
  const missing = (v: SortValue) => v == null || (typeof v === "number" && !Number.isFinite(v));
  if (missing(a) || missing(b)) return missing(a) ? (missing(b) ? 0 : 1) : -1; // blanks always last
  const order = typeof a === "string" ? a.localeCompare(String(b)) : (a as number) - (b as number);
  return dir === "asc" ? order : -order;
}

type Row = { g: string; label: string; isSub: boolean; bench: boolean };

/** How many rows a sorted table shows before "Show all". */
const SORTED_PREVIEW = 25;

/**
 * Every geography as a row. Statewide is pinned in the header, so it sticks
 * with the column titles. In the default order Travis comes next, then the
 * counties with a live tracker, then the rest of the 17 focus counties (the
 * Valley with its four counties indented beneath), then every other county by
 * population, each group under a label row. Sorted by a column, the counties
 * form one ranked list and the Valley's combined row steps aside.
 *
 * `head` holds the header rows, built from SortTh cells whose `by` names a key
 * in `sort`; "name" sorts by county name. `cells` fills a row's columns after
 * the name; `columns` counts every column, including the name.
 */
export function GeoTable({
  head,
  cells,
  columns,
  sort,
  name = (g) => g,
}: {
  head: React.ReactNode;
  cells: (geo: string) => React.ReactNode;
  columns: number;
  sort: Record<string, (geo: string) => SortValue>;
  name?: (geo: string) => React.ReactNode;
}) {
  const live = useContext(LiveCountiesContext);
  const { by, dir, toggle, reset } = useSortState();
  const [showAll, setShowAll] = useState(false);

  const keyOf = by === "name" ? (g: string) => g : by ? sort[by] : null;
  let rows: Row[];
  if (keyOf) {
    rows = sortItems(
      ROWS.filter(([g]) => g !== "Valley"),
      ([g]) => keyOf(g),
      dir,
    ).map(([g, group]) => ({ g, label: "", isSub: false, bench: group === "benchmark" }));
  } else {
    const isLive = (g: string, group: string) => group !== "benchmark" && live.has(g);
    rows = [
      ...ROWS.filter(([, group]) => group === "benchmark").map(([g]) => ({
        g,
        label: GROUP_LABEL.benchmark,
        isSub: false,
        bench: true,
      })),
      ...ROWS.filter(([g, group]) => isLive(g, group)).map(([g]) => ({
        g,
        label: "Counties with a live election-day tracker",
        isSub: false,
        bench: false,
      })),
      ...ROWS.filter(([g, group]) => group !== "benchmark" && !isLive(g, group)).map(([g, group, isSub]) => ({
        g,
        label: GROUP_LABEL[group as keyof typeof GROUP_LABEL],
        isSub,
        bench: false,
      })),
    ];
  }

  // Collapsed, a table stops after the focus counties, or after the top
  // SORTED_PREVIEW when sorted; the rest are a button away.
  const shown = showAll ? rows : keyOf ? rows.slice(0, SORTED_PREVIEW) : rows.filter((r) => r.label !== GROUP_LABEL.other);
  const hidden = rows.length - shown.length;

  return (
    <SortContext.Provider value={{ by, dir, toggle }}>
      {by && (
        <button type="button" className="ea-btn ea-sort-reset" onClick={reset}>
          Back to the default order
        </button>
      )}
      <DataTable
        head={
          <>
            {head}
            <tr className="ea-pinned">
              <td>Statewide</td>
              {cells("Statewide")}
            </tr>
          </>
        }
      >
        {shown.map(({ g, label, isSub, bench }, i) => (
          <Fragment key={g}>
            {label && label !== shown[i - 1]?.label && (
              <tr className="ea-grp-row">
                <td colSpan={columns}>{label}</td>
              </tr>
            )}
            <tr className={[isSub ? "ea-sub" : "", bench ? "ea-bench" : ""].join(" ").trim() || undefined}>
              <td>{name(g)}</td>
              {cells(g)}
            </tr>
          </Fragment>
        ))}
      </DataTable>
      {(hidden > 0 || showAll) && (
        <button type="button" className="ea-btn ea-show-all" aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Show fewer counties" : `Show every county (${hidden} more)`}
        </button>
      )}
    </SortContext.Provider>
  );
}
