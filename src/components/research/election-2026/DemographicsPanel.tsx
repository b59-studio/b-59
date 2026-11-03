"use client";

import { useId, useState } from "react";
import { fmt, pct, points } from "@/lib/election-2026/live";
import { CORE, DATA, shade } from "./data";
import { AGE_BRACKETS, DEMO, surnameFigures } from "./demographics";
import { GeoTable, SortTh } from "./GeoTable";
import { Note, Panel } from "./parts";

const EARLIER = ["2016", "2018", "2020", "2022"];

const MEASURES = [
  { id: "early", label: "Early turnout, 2026", value: (g: string) => DATA.ev[g][3] / DATA.ev[g][0] },
  { id: "vs2022", label: "Early vote vs all of 2022", value: (g: string) => DATA.ev[g][3] / DATA.gen[g]["2022"][1] },
  { id: "surname", label: "Hispanic-surname voters, 2024", value: (g: string) => surnameFigures(g, "2024").shareOfVoters },
  { id: "hispanic", label: "Hispanic residents", value: (g: string) => DEMO.residents[g].hispanic },
] as const;
type MeasureId = (typeof MEASURES)[number]["id"];

/** Five equal steps between the 5th and 95th percentile, so a few outlying counties don't wash out the rest. */
function steps(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const lo = sorted[Math.floor(sorted.length * 0.05)];
  const hi = sorted[Math.floor(sorted.length * 0.95)];
  return [1, 2, 3, 4].map((i) => lo + ((hi - lo) * i) / 5);
}

/** One neutral hue, light to dark: these are magnitudes, not parties. */
const STEP_FILL = [12, 26, 40, 54, 70].map((p) => `color-mix(in srgb, var(--ea-fg) ${p}%, var(--ea-panel))`);

function CountyMap() {
  const [measureId, setMeasureId] = useState<MeasureId>("early");
  const [picked, setPicked] = useState<string | null>(null);
  const name = useId();
  const measure = MEASURES.find((m) => m.id === measureId)!;
  const counties = Object.keys(DEMO.map.paths);
  const values = new Map(counties.map((g) => [g, measure.value(g)]));
  const cuts = steps([...values.values()]);
  const stepOf = (v: number) => cuts.filter((c) => v >= c).length;
  const { width, height, paths } = DEMO.map;

  return (
    <Panel title="County map" expandable={false}>
      <fieldset className="ea-seg">
        <legend className="ea-field-label">Shade counties by</legend>
        {MEASURES.map((m) => (
          <label key={m.id} className="ea-seg-option">
            <input
              type="radio"
              className="sr-only"
              name={name}
              value={m.id}
              checked={measureId === m.id}
              onChange={() => setMeasureId(m.id)}
            />
            <span>{m.label}</span>
          </label>
        ))}
      </fieldset>
      <div className="ea-map">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Map of Texas counties shaded by ${measure.label.toLowerCase()}. The values are in the tables below.`}
          onPointerLeave={() => setPicked(null)}
        >
          {counties.map((g) => (
            <path
              key={g}
              d={paths[g]}
              fill={STEP_FILL[stepOf(values.get(g)!)]}
              className="ea-map-county"
              onPointerEnter={() => setPicked(g)}
              onPointerDown={() => setPicked(g)}
            />
          ))}
          {CORE.filter((g) => paths[g]).map((g) => (
            <path key={`focus-${g}`} d={paths[g]} className="ea-map-focus" />
          ))}
          {picked && <path d={paths[picked]} className="ea-map-picked" />}
        </svg>
      </div>
      <p className="ea-map-readout" aria-live="polite">
        {picked ? (
          <>
            <strong>{picked}</strong> · {measure.label}: {pct(values.get(picked)!)}
          </>
        ) : (
          "Point at or tap a county to read its value."
        )}
      </p>
      <ul className="ea-map-legend" aria-label="Legend">
        {STEP_FILL.map((fill, i) => (
          <li key={fill}>
            <span className="ea-sw" style={{ background: fill }} />
            {i === 0 ? `Under ${pct(cuts[0])}` : i === 4 ? `${pct(cuts[3])} and up` : `${pct(cuts[i - 1])}–${pct(cuts[i])}`}
          </li>
        ))}
        <li>
          <span className="ea-sw ea-sw-outline" />
          The 17 focus counties and Travis
        </li>
      </ul>
    </Panel>
  );
}

function SurnameTable() {
  return (
    <Panel title="Hispanic-surname voters">
      <Note>
        Registered voters with a Spanish surname, as the Texas Legislative Council identifies them from the Census
        surname list. It is a proxy for Hispanic voters: it misses Hispanic voters without a Spanish surname and counts
        some who are not Hispanic. Turnout is ballots cast as a share of each group’s registered voters.
      </Note>
      <GeoTable
        columns={1 + 5 + EARLIER.length}
        sort={{
          reg: (g) => surnameFigures(g, "2024").shareOfRegistered,
          voters: (g) => surnameFigures(g, "2024").shareOfVoters,
          turnout: (g) => surnameFigures(g, "2024").turnout,
          other: (g) => surnameFigures(g, "2024").otherTurnout,
          gap: (g) => {
            const f = surnameFigures(g, "2024");
            return f.turnout - f.otherTurnout;
          },
          ...Object.fromEntries(EARLIER.map((y) => [`s${y}`, (g: string) => surnameFigures(g, y).shareOfVoters])),
        }}
        head={
          <>
            <tr>
              <SortTh by="name" rowSpan={2}>
                County
              </SortTh>
              <th className="ea-grp ea-sep" colSpan={5}>
                2024 general <span className="ea-src-tag">TLC</span>
              </th>
              <th className="ea-grp ea-sep" colSpan={EARLIER.length}>
                Share of voters, earlier generals
              </th>
            </tr>
            <tr>
              <SortTh by="reg" className="ea-sep">
                Share of registered
              </SortTh>
              <SortTh by="voters">Share of voters</SortTh>
              <SortTh by="turnout">Turnout, Hispanic surname</SortTh>
              <SortTh by="other">Turnout, everyone else</SortTh>
              <SortTh by="gap">Gap</SortTh>
              {EARLIER.map((y, i) => (
                <SortTh key={y} by={`s${y}`} className={i === 0 ? "ea-sep" : undefined}>
                  {y}
                </SortTh>
              ))}
            </tr>
          </>
        }
        cells={(g) => {
          const f = surnameFigures(g, "2024");
          return (
            <>
              <td className="ea-sep">{pct(f.shareOfRegistered)}</td>
              <td style={shade("ink", f.shareOfVoters)}>{pct(f.shareOfVoters)}</td>
              <td>{pct(f.turnout)}</td>
              <td>{pct(f.otherTurnout)}</td>
              <td>{points(f.turnout - f.otherTurnout)}</td>
              {EARLIER.map((y, i) => (
                <td key={y} className={i === 0 ? "ea-sep" : undefined}>
                  {pct(surnameFigures(g, y).shareOfVoters)}
                </td>
              ))}
            </>
          );
        }}
      />
    </Panel>
  );
}

function ResidentsTable() {
  return (
    <Panel title="Who lives here">
      <Note>
        Everyone who lives in the county, from the Census Bureau’s {DEMO.censusYear} estimates: residents, not voters,
        so it includes children and people who cannot vote. Race columns other than Hispanic count non-Hispanic
        residents of that race alone; “Other” is everyone else, including people of more than one race.
      </Note>
      <GeoTable
        columns={1 + 1 + 5 + 1 + AGE_BRACKETS.length}
        sort={{
          pop: (g) => DEMO.residents[g].pop,
          hispanic: (g) => DEMO.residents[g].hispanic,
          white: (g) => DEMO.residents[g].white,
          black: (g) => DEMO.residents[g].black,
          asian: (g) => DEMO.residents[g].asian,
          other: (g) => DEMO.residents[g].other,
          female: (g) => DEMO.residents[g].female,
          ...Object.fromEntries(AGE_BRACKETS.map((a, i) => [`age${i}`, (g: string) => DEMO.residents[g].ages[i]])),
        }}
        head={
          <>
            <tr>
              <SortTh by="name" rowSpan={2}>
                County
              </SortTh>
              <SortTh by="pop" rowSpan={2} className="ea-sep">
                Population
              </SortTh>
              <th className="ea-grp ea-sep" colSpan={5}>
                Race and ethnicity <span className="ea-src-tag">Census</span>
              </th>
              <SortTh by="female" rowSpan={2} className="ea-sep">
                Female
              </SortTh>
              <th className="ea-grp ea-sep" colSpan={AGE_BRACKETS.length}>
                Age
              </th>
            </tr>
            <tr>
              <SortTh by="hispanic" className="ea-sep">
                Hispanic
              </SortTh>
              <SortTh by="white">White</SortTh>
              <SortTh by="black">Black</SortTh>
              <SortTh by="asian">Asian</SortTh>
              <SortTh by="other">Other</SortTh>
              {AGE_BRACKETS.map((a, i) => (
                <SortTh key={a} by={`age${i}`} className={i === 0 ? "ea-sep" : undefined}>
                  {a}
                </SortTh>
              ))}
            </tr>
          </>
        }
        cells={(g) => {
          const r = DEMO.residents[g];
          return (
            <>
              <td className="ea-sep">{fmt(r.pop)}</td>
              <td className="ea-sep">{pct(r.hispanic)}</td>
              <td>{pct(r.white)}</td>
              <td>{pct(r.black)}</td>
              <td>{pct(r.asian)}</td>
              <td>{pct(r.other)}</td>
              <td className="ea-sep">{pct(r.female)}</td>
              {r.ages.map((share, i) => (
                <td key={AGE_BRACKETS[i]} className={i === 0 ? "ea-sep" : undefined}>
                  {pct(share)}
                </td>
              ))}
            </>
          );
        }}
      />
    </Panel>
  );
}

/** The Demographics tab: a county map, Hispanic-surname turnout, and who lives in each county. */
export default function DemographicsPanel() {
  return (
    <>
      <CountyMap />
      <SurnameTable />
      <ResidentsTable />
    </>
  );
}
