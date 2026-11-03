"""Build src/data/election-2026/turnout.json for every Texas county.

Inputs are raw downloads, kept outside the repo:

- ``--ted``: Texas Legislative Council precinct turnout, one CSV per election
  (``{year}_general.csv``, ``{year}_{party}_primary.csv``), from
  https://ted.capitol.texas.gov/api/Offices/<election>/1428/vtd
- ``--races``: Legislative Council precinct results per race
  (``g{election}_o{office}.csv``) and the 2016 primary turnout
  (``p436_turnout.csv`` Democratic, ``p437_turnout.csv`` Republican).
- ``--sos``: Secretary of State early-voting files
  (``ev_{election}_{MM-DD-YYYY}.json``): 53815 is the 2026 general, 53814 and
  53813 the March 2026 Democratic and Republican primaries.
- ``--census``: the Census Bureau's county estimates, co-est2024-alldata.csv.

Usage:
    python3 -I scripts/election-2026/build_data.py --ted DIR --races DIR \\
        --sos DIR --census FILE --out src/data/election-2026/turnout.json
"""

from __future__ import annotations

import argparse
import base64
import csv
import glob
import json
import re
from collections import defaultdict
from pathlib import Path

# The 17 counties the analysis was built around, chosen to represent different
# sentiments across the state. Travis and the state are benchmarks.
FOCUS = [
    "El Paso", "Hidalgo", "Cameron", "Starr", "Willacy", "Webb", "Maverick",
    "Harris", "Dallas", "Bexar", "Collin", "Denton", "Williamson", "Bell",
    "Montgomery", "Ellis", "Hockley",
]
VALLEY = ["Hidalgo", "Cameron", "Starr", "Willacy"]
YEARS = ["2016", "2018", "2020", "2022", "2024"]

# (Legislative Council election id, office id) -> (year, office)
RACES = {
    (444, 1): ("2016", "President"), (444, 44): ("2016", "Railroad Comm."),
    (456, 2): ("2018", "U.S. Senate"), (456, 37): ("2018", "Governor"),
    (456, 44): ("2018", "Railroad Comm."), (456, 40): ("2018", "Comptroller"),
    (377, 1): ("2020", "President"), (377, 2): ("2020", "U.S. Senate"),
    (377, 44): ("2020", "Railroad Comm."),
    (497, 37): ("2022", "Governor"), (497, 44): ("2022", "Railroad Comm."),
    (497, 40): ("2022", "Comptroller"),
    (510, 1): ("2024", "President"), (510, 2): ("2024", "U.S. Senate"),
    (510, 44): ("2024", "Railroad Comm."),
}


def county_names(census: Path) -> dict[str, str]:
    """Three-digit FIPS code -> county name, e.g. "141" -> "El Paso"."""
    with census.open(encoding="latin-1") as f:
        return {
            r["COUNTY"]: r["CTYNAME"].removesuffix(" County")
            for r in csv.DictReader(f)
            if r["STATE"] == "48" and r["SUMLEV"] == "050"
        }


def populations(census: Path) -> dict[str, int]:
    """Three-digit FIPS code -> 2024 population estimate."""
    with census.open(encoding="latin-1") as f:
        return {
            r["COUNTY"]: int(r["POPESTIMATE2024"])
            for r in csv.DictReader(f)
            if r["STATE"] == "48" and r["SUMLEV"] == "050"
        }


def rollups(name: str) -> list[str]:
    """Every row a county's numbers add into: itself, the Valley, the state."""
    return [name, "Statewide"] + (["Valley"] if name in VALLEY else [])


def sum_precincts(path: Path, cols: list[str], names: dict[str, str]) -> dict[str, list[int]]:
    """Sum precinct columns by county, with Valley and Statewide rollups."""
    out: dict[str, list[int]] = defaultdict(lambda: [0] * len(cols))
    with path.open() as f:
        for r in csv.DictReader(f):
            vals = [int(float(r[c] or 0)) for c in cols]
            for g in rollups(names[r["CNTYVTD"][:3]]):
                out[g] = [a + b for a, b in zip(out[g], vals)]
    return out


def latest_sos(sos: Path, election: int, names: dict[str, str]) -> dict[str, dict]:
    """The last early-voting file for an election, by county FIPS code.

    Matched on the county's name: the Secretary of State's own county numbers
    do not follow FIPS order through the "Mc" counties.
    """
    path = max(glob.glob(str(sos / f"ev_{election}_*.json")))  # one election's files share a year; MM-DD sorts
    data = json.loads(base64.b64decode(json.loads(Path(path).read_text())["upload"]))
    key = lambda n: re.sub(r"[^A-Z]", "", n.upper())  # "La Salle" is "LASALLE" to the state
    fips = {key(n): f for f, n in names.items()}
    return {fips[key(c["name"])]: c for c in data["turnout_by_county"]}


def build(args: argparse.Namespace) -> dict:
    """Assemble the page's data for every county from the raw inputs.

    Args:
        args: Parsed command-line paths (see the module docstring).

    Returns:
        The JSON-ready dict the page imports: geos, gen, prim, ev, raceMeta,
        races and evAsOf, as documented in src/components/research/election-2026/data.ts.
    """
    names = county_names(args.census)
    pop = populations(args.census)
    assert len(names) == 254, len(names)

    gen: dict[str, dict] = defaultdict(dict)
    for y in YEARS:
        sums = sum_precincts(args.ted / f"{y}_general.csv", ["Voter_Registration", "Turnout"], names)
        for g, v in sums.items():
            gen[g][y] = v

    prim: dict[str, dict] = defaultdict(dict)
    primary_files = {"2016": (args.races / "p436_turnout.csv", args.races / "p437_turnout.csv")}
    for y in YEARS[1:]:
        primary_files[y] = (args.ted / f"{y}_democratic_primary.csv", args.ted / f"{y}_republican_primary.csv")
    for y, (dfile, rfile) in primary_files.items():
        d = sum_precincts(dfile, ["Turnout", "Voter_Registration"], names)
        r = sum_precincts(rfile, ["Turnout"], names)
        for g in d:
            prim[g][y] = [d[g][0], r[g][0], d[g][1]]

    # March 2026 primary early vote, in person plus mail, against the Democratic file's registration.
    dem26, rep26 = latest_sos(args.sos, 53814, names), latest_sos(args.sos, 53813, names)
    for fips, c in dem26.items():
        vals = [
            c["total_in_person_votes_for_election"] + c["total_mail_votes_for_election"],
            rep26[fips]["total_in_person_votes_for_election"] + rep26[fips]["total_mail_votes_for_election"],
            c["registered_voters"],
        ]
        for g in rollups(names[fips]):
            prim[g]["2026"] = [a + b for a, b in zip(prim[g].get("2026", [0, 0, 0]), vals)]

    ev: dict[str, list[int]] = defaultdict(lambda: [0, 0, 0, 0])
    for fips, c in latest_sos(args.sos, 53815, names).items():
        inp, mail = c["total_in_person_votes_for_election"], c["total_mail_votes_for_election"]
        for g in rollups(names[fips]):
            ev[g] = [a + b for a, b in zip(ev[g], [c["registered_voters"], inp, mail, inp + mail])]

    race_meta: dict[str, list[str]] = {}
    races: dict[str, dict] = defaultdict(dict)
    for (e, o), (year, office) in RACES.items():
        path = args.races / f"g{e}_o{o}.csv"
        with path.open() as f:
            cands = [c for c in next(csv.reader(f)) if c not in ("CNTYVTD", "VTDKEY")]
        dem = [c for c in cands if re.match(r".+D_\d\dG_", c)]
        rep = [c for c in cands if re.match(r".+R_\d\dG_", c)]
        assert len(dem) == 1 and len(rep) == 1, (e, o, cands)
        key = f"{year}|{office}"
        race_meta[key] = [dem[0].split("_")[0][:-1], rep[0].split("_")[0][:-1]]
        for g, v in sum_precincts(path, [dem[0], rep[0], *cands], names).items():
            races[g][key] = [v[0], v[1], sum(v[2:])]

    valley_pop = sum(pop[f] for f, n in names.items() if n in VALLEY)
    geos = [["Statewide", "statewide", False, sum(pop.values())], ["Travis", "benchmark", False, pop["453"]]]
    focus = sorted(
        [n for n in FOCUS if n not in VALLEY] + ["Valley"],
        key=lambda n: -(valley_pop if n == "Valley" else pop[next(f for f, x in names.items() if x == n)]),
    )
    by_name = {n: f for f, n in names.items()}
    for n in focus:
        if n == "Valley":
            geos.append(["Valley", "focus", False, valley_pop])
            for v in sorted(VALLEY, key=lambda x: -pop[by_name[x]]):
                geos.append([v, "focus", True, pop[by_name[v]]])
        else:
            geos.append([n, "focus", False, pop[by_name[n]]])
    others = sorted((n for n in names.values() if n not in FOCUS and n != "Travis"), key=lambda n: -pop[by_name[n]])
    geos += [[n, "other", False, pop[by_name[n]]] for n in others]

    return {
        "geos": geos,
        "gen": gen,
        "prim": prim,
        "ev": ev,
        "raceMeta": race_meta,
        "races": races,
        "evAsOf": "Oct 30, 2026 (final early-voting day)",
    }


def main() -> None:
    """Parse the input paths, build the data and write it to --out."""
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    for flag in ("--ted", "--races", "--sos", "--census", "--out"):
        p.add_argument(flag, type=Path, required=True)
    args = p.parse_args()
    out = build(args)
    args.out.write_text(json.dumps(out, separators=(",", ":"), ensure_ascii=False))
    print(f"{len(out['geos'])} rows, {args.out.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
