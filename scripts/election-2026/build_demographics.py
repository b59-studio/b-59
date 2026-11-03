"""Build src/data/election-2026/demographics.json for every Texas county.

Public sources only, all at county level or above; no voter-level records:

- ``--ted``: Texas Legislative Council precinct turnout for each general
  (``{year}_general.csv``), which carries Spanish-surname registration and the
  Spanish-surname share of turnout per precinct.
- ``--census``: the Census Bureau's county characteristics estimates for Texas,
  cc-est2024-alldata-48.csv (age, sex, race and Hispanic origin).
- ``--atlas``: us-atlas counties-10m.json (TopoJSON of Census cartographic
  boundaries), for the county map.

Usage:
    python3 -I scripts/election-2026/build_demographics.py --ted DIR \\
        --census FILE --atlas FILE --out src/data/election-2026/demographics.json
"""

from __future__ import annotations

import argparse
import csv
import json
import math
from collections import defaultdict
from pathlib import Path

VALLEY = ["Hidalgo", "Cameron", "Starr", "Willacy"]
YEARS = ["2016", "2018", "2020", "2022", "2024"]
CENSUS_YEAR = "6"  # July 1, 2024 estimate
# Census five-year age groups (1 = 0-4 ... 18 = 85+), gathered into brackets.
AGE_BRACKETS = {"Under 20": range(1, 5), "20–34": range(5, 8), "35–49": range(8, 11), "50–64": range(11, 14), "65+": range(14, 19)}
MAP_WIDTH = 1000


def rollups(name: str) -> list[str]:
    """Every row a county's numbers add into: itself, the Valley, the state."""
    return [name, "Statewide"] + (["Valley"] if name in VALLEY else [])


def county_names(census: Path) -> dict[str, str]:
    """Three-digit FIPS code -> county name, from the Census file."""
    with census.open(encoding="latin-1") as f:
        return {r["COUNTY"]: r["CTYNAME"].removesuffix(" County") for r in csv.DictReader(f)}


def surname_turnout(ted: Path, names: dict[str, str]) -> dict[str, dict[str, list[int]]]:
    """Per geography and general: [Spanish-surname registered, registered, Spanish-surname voters, voters].

    The Legislative Council reports the Spanish-surname share of each
    precinct's turnout; multiplying it back by turnout gives voters.
    """
    out: dict[str, dict[str, list[float]]] = defaultdict(dict)
    for year in YEARS:
        with (ted / f"{year}_general.csv").open() as f:
            for r in csv.DictReader(f):
                voters = float(r["Turnout"] or 0)
                vals = [
                    float(r["Spanish_Surname_Voter_Registration"] or 0),
                    float(r["Voter_Registration"] or 0),
                    float(r["Spanish_Surname_Turnout"] or 0) * voters,
                    voters,
                ]
                for g in rollups(names[r["CNTYVTD"][:3]]):
                    prev = out[g].get(year, [0.0] * 4)
                    out[g][year] = [a + b for a, b in zip(prev, vals)]
    return {g: {y: [round(v) for v in vals] for y, vals in years.items()} for g, years in out.items()}


def residents(census: Path) -> dict[str, dict[str, float | int]]:
    """Population, race and ethnicity shares, female share and age-bracket shares."""
    sums: dict[str, defaultdict[str, int]] = defaultdict(lambda: defaultdict(int))
    with census.open(encoding="latin-1") as f:
        for r in csv.DictReader(f):
            if r["YEAR"] != CENSUS_YEAR:
                continue
            age = int(r["AGEGRP"])
            for g in rollups(r["CTYNAME"].removesuffix(" County")):
                s = sums[g]
                if age == 0:
                    s["pop"] += int(r["TOT_POP"])
                    s["female"] += int(r["TOT_FEMALE"])
                    s["hispanic"] += int(r["H_MALE"]) + int(r["H_FEMALE"])
                    s["white"] += int(r["NHWA_MALE"]) + int(r["NHWA_FEMALE"])
                    s["black"] += int(r["NHBA_MALE"]) + int(r["NHBA_FEMALE"])
                    s["asian"] += int(r["NHAA_MALE"]) + int(r["NHAA_FEMALE"])
                else:
                    bracket = next(b for b, ages in AGE_BRACKETS.items() if age in ages)
                    s[bracket] += int(r["TOT_POP"])
    out = {}
    for g, s in sums.items():
        pop = s["pop"]
        other = pop - s["hispanic"] - s["white"] - s["black"] - s["asian"]
        out[g] = {
            "pop": pop,
            "hispanic": s["hispanic"] / pop,
            "white": s["white"] / pop,
            "black": s["black"] / pop,
            "asian": s["asian"] / pop,
            "other": other / pop,
            "female": s["female"] / pop,
            "ages": [s[b] / pop for b in AGE_BRACKETS],
        }
    return {g: {k: (round(v, 4) if isinstance(v, float) else [round(x, 4) for x in v] if isinstance(v, list) else v) for k, v in d.items()} for g, d in out.items()}


def albers(lon: float, lat: float) -> tuple[float, float]:
    """Albers equal-area conic tuned for Texas (standard parallels 27.5° and 35°)."""
    phi1, phi2, phi0, lam0 = map(math.radians, (27.5, 35.0, 31.25, -100.0))
    n = (math.sin(phi1) + math.sin(phi2)) / 2
    c = math.cos(phi1) ** 2 + 2 * n * math.sin(phi1)
    rho0 = math.sqrt(c - 2 * n * math.sin(phi0)) / n
    phi, lam = math.radians(lat), math.radians(lon)
    rho = math.sqrt(c - 2 * n * math.sin(phi)) / n
    theta = n * (lam - lam0)
    return rho * math.sin(theta), rho0 - rho * math.cos(theta)


def county_paths(atlas: Path, names: dict[str, str]) -> dict:
    """SVG path data per county, projected and fitted to a MAP_WIDTH-wide view box."""
    topo = json.loads(atlas.read_text())
    (sx, sy), (tx, ty) = topo["transform"]["scale"], topo["transform"]["translate"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x, y = x + dx, y + dy
            pts.append(albers(x * sx + tx, y * sy + ty))
        arcs.append(pts)

    def ring(indices: list[int]) -> list[tuple[float, float]]:
        pts: list[tuple[float, float]] = []
        for i in indices:
            arc = arcs[i] if i >= 0 else arcs[~i][::-1]
            pts.extend(arc if not pts else arc[1:])
        return pts

    shapes = {}
    for geom in topo["objects"]["counties"]["geometries"]:
        if not geom["id"].startswith("48"):
            continue
        polys = geom["arcs"] if geom["type"] == "MultiPolygon" else [geom["arcs"]]
        shapes[names[geom["id"][2:]]] = [[ring(r) for r in poly] for poly in polys]

    xs = [p[0] for s in shapes.values() for poly in s for r in poly for p in r]
    ys = [p[1] for s in shapes.values() for poly in s for r in poly for p in r]
    scale = MAP_WIDTH / (max(xs) - min(xs))
    height = round((max(ys) - min(ys)) * scale)

    def fmt(p: tuple[float, float]) -> str:
        return f"{(p[0] - min(xs)) * scale:.1f},{(max(ys) - p[1]) * scale:.1f}"

    paths = {
        name: "".join("M" + "L".join(fmt(p) for p in r) + "Z" for poly in polys for r in poly)
        for name, polys in shapes.items()
    }
    return {"width": MAP_WIDTH, "height": height, "paths": paths}


def build(args: argparse.Namespace) -> dict:
    """Assemble surname turnout, resident profiles and map shapes for every county.

    Args:
        args: Parsed command-line paths (see the module docstring).

    Returns:
        The JSON-ready dict the page imports, as documented in
        src/components/research/election-2026/demographics.ts.
    """
    names = county_names(args.census)
    tx = {k: v for k, v in names.items() if k != "000"}
    return {
        "surname": surname_turnout(args.ted, tx),
        "residents": residents(args.census),
        "map": county_paths(args.atlas, tx),
        "censusYear": "2024",
    }


def main() -> None:
    """Parse the input paths, build the data and write it to --out."""
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    for flag in ("--ted", "--census", "--atlas", "--out"):
        p.add_argument(flag, type=Path, required=True)
    args = p.parse_args()
    out = build(args)
    args.out.write_text(json.dumps(out, separators=(",", ":"), ensure_ascii=False))
    print(f"{len(out['surname'])} surname rows, {len(out['map']['paths'])} shapes, {args.out.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
