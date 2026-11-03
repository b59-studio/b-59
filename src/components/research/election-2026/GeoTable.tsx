"use client";

import { Fragment } from "react";
import { GROUP_LABEL, ROWS } from "./data";
import { DataTable } from "./parts";

/**
 * Every geography as a row. Statewide is pinned in the header, so it sticks
 * with the column titles; below it come Travis, the 17 focus counties (the
 * Valley with its four counties indented beneath) and every other county by
 * population, each group under a label row.
 *
 * `head` holds the header rows, whose first cell is the County title; `cells`
 * fills a row's columns after the name; `columns` counts every column,
 * including the name, so the label rows span the table.
 */
export function GeoTable({
  head,
  cells,
  columns,
  name = (g) => g,
}: {
  head: React.ReactNode;
  cells: (geo: string) => React.ReactNode;
  columns: number;
  name?: (geo: string) => React.ReactNode;
}) {
  return (
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
      {ROWS.map(([g, group, isSub], i) => (
        <Fragment key={g}>
          {(i === 0 || ROWS[i - 1][1] !== group) && (
            <tr className="ea-grp-row">
              <td colSpan={columns}>{GROUP_LABEL[group as keyof typeof GROUP_LABEL]}</td>
            </tr>
          )}
          <tr className={[isSub ? "ea-sub" : "", group === "benchmark" ? "ea-bench" : ""].join(" ").trim() || undefined}>
            <td>{name(g)}</td>
            {cells(g)}
          </tr>
        </Fragment>
      ))}
    </DataTable>
  );
}
