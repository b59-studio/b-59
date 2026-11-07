"""Parse the precinct PDFs three counties posted for Nov 3, 2026 into precinct JSON.

Collin, Starr and Willacy publish no machine-readable precinct results, only
PDF reports. This reads each report's text (``pdftotext -layout``), keeps the
races that also appear in the Secretary of State's county file, and writes
them in the same shape the results page uses for Clarity and Harris
(``PrecinctDetail`` in src/lib/results-2026/types.ts), keyed by the state's
race key.

A PDF race is matched to the state's race by its candidates' surnames, not
by title, because the counties abbreviate titles ("Comm General Land Office").
Candidate names and parties come from the state's file, so the precinct
table names people exactly as the county table does. Write-ins are summed
into one "Write-in" choice.

Every race's precinct sum is checked against the state's county total and
the differences printed; the JSON records the report's own timestamp and
the largest gap between a race's precinct sum and the state's total (the
state's file is read later than a report posted on election night).

Usage:
    python3 -I scripts/results-2026/parse_precinct_pdfs.py \\
        --pdfs DIR --sos countyInfo.json --out src/data/results-2026/precincts
    (DIR holds collin.pdf, starr.pdf and willacy.pdf.)
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import subprocess
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

PARTIES = {"REP", "DEM", "LIB", "GRN", "IND"}
PARTY_CODES = {"D": "DEM", "R": "REP", "L": "LIB", "G": "GRN", "I": "IND"}
WRITE_IN = "Write-in"
# Lines inside a race that are tallies, not candidates.
NOT_CHOICES = re.compile(r"^(Total Votes Cast|Contest Totals|Registered Voters|Ballots Cast|Voter Turnout|Cast Votes)", re.I)
WATERMARK_LINES = {"Collin County Seal", "Watermark Seal for Collin County.", "Collin County Government"}
COLLIN_WATERMARK = re.compile(r"\s{3,}(" + "|".join(re.escape(w) for w in WATERMARK_LINES) + r")\s*$")


@dataclass
class Race:
    title: str
    # choice label -> precinct -> votes per type
    votes: dict[str, dict[str, list[int]]] = field(default_factory=dict)
    parties: dict[str, str] = field(default_factory=dict)

    def add(self, label: str, party: str, precinct: str, counts: list[int]) -> None:
        if label not in self.votes:
            self.votes[label] = {}
            self.parties[label] = party
        prev = self.votes[label].get(precinct)
        self.votes[label][precinct] = counts if prev is None else [a + b for a, b in zip(prev, counts)]


@dataclass
class Report:
    county: str
    types: list[str]
    stamp: str
    races: list[Race]


def text_of(pdf: Path) -> list[str]:
    out = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], check=True, capture_output=True, text=True).stdout
    return out.splitlines()


def num(s: str) -> int:
    return int(s.replace(",", ""))


def race_for(races: dict[str, Race], title: str) -> Race:
    if title not in races:
        races[title] = Race(title)
    return races[title]


def parse_electionware(lines: list[str], county: str, precinct_re: str, types: list[str], keep: slice) -> Report:
    """Collin and Starr: Electionware "Precinct Summary" reports.

    A race starts at a title line followed by "Vote For N"; a candidate line
    is an unindented label, an optional party code, then one count per
    column. `keep` picks the per-type columns out of the counts (Starr leads
    with a TOTAL column that is just their sum).
    """
    races: dict[str, Race] = {}
    precinct = race = None
    stamp = ""
    choice = re.compile(r"^(?:(REP|DEM|LIB|GRN|IND)\s+)?(\S.*?)\s{2,}((?:[\d,]+\s+)*[\d,]+)(?:\s+[\d.]+%)?\s*$")
    # Collin's pages carry a watermark whose text lands beside or between lines.
    lines = [COLLIN_WATERMARK.sub("", l.rstrip()) for l in lines]
    lines = [l for l in lines if l.strip() not in WATERMARK_LINES]
    for i, line in enumerate(lines):
        if m := re.search(r"Precinct Summary - (\d\d/\d\d/\d{4})\s+(\d+:\d\d [AP]M)", line):
            stamp = stamp or f"{m[1]} {m[2]}"
            continue
        if m := re.match(precinct_re, line):
            precinct, race = m[1], None
            continue
        if not line.strip():
            continue
        nxt = next((l for l in lines[i + 1 : i + 4] if l.strip()), "")
        if re.match(r"^\s*Vote For \d+", nxt):
            race = race_for(races, line.strip())
            continue
        if race is None or precinct is None or not line or line[0].isspace() or NOT_CHOICES.match(line):
            continue
        if m := choice.match(line):
            counts = [num(x) for x in m[3].split()]
            label = WRITE_IN if m[2].startswith("Write-In") else m[2].strip()
            race.add(label, m[1] or "", precinct, counts[keep])
    return Report(county, types, stamp, list(races.values()))


def parse_willacy(lines: list[str]) -> Report:
    """Willacy: "Precinct Results Report", one table per race with a Choice/Party header."""
    races: dict[str, Race] = {}
    precinct = race = None
    date = time = ""
    pair = r"([\d,]+)\s+[\d.]+%"
    choice = re.compile(rf"^(\S.*?)\s{{2,}}(?:(REP|DEM|LIB|GRN|IND)\s+)?{pair}\s+{pair}\s+{pair}\s+{pair}\s*$")
    prev = ""
    for raw in lines:
        line = raw.rstrip()
        if m := re.match(r"^Run Date\s+(\d\d/\d\d/\d{4})", line):
            date = date or m[1]
            continue
        if m := re.match(r"^Run Time\s+(\d+:\d\d [AP]M)", line):
            time = time or m[1]
            continue
        if m := re.match(r"^(\S.*?)\s{10,}[\d,]+ of [\d,]+ registered voters", line):
            precinct, race = m[1].strip(), None
            continue
        if re.match(r"^Choice\s+Party", line):
            race = race_for(races, prev.strip().rstrip(":"))
            continue
        if line.strip():
            prev = line
        if race is None or precinct is None or not line or line[0].isspace():
            continue
        if m := choice.match(line):
            name = m[1].strip()
            label = WRITE_IN if name.endswith("(W)") else name
            race.add(label, m[2] or "", precinct, [num(m[3]), num(m[4]), num(m[5])])
    return Report("Willacy", ["Mail", "Early in person", "Election Day"], f"{date} {time}", list(races.values()))


def race_key(name: str) -> str:
    """Mirror of raceKey in src/lib/results-2026/normalize.ts."""
    k = name.upper().replace("UNITED STATES", "US")
    k = re.sub(r"[^A-Z0-9]+", " ", k)
    k = re.sub(r"\bU S\b", "US", k)
    return re.sub(r"\s+", " ", k).strip()


def clean_name(name: str, party: str) -> tuple[str, str]:
    """Mirror of cleanChoice: "(REP)"-style suffixes move into the party."""
    name = name.strip()
    if m := re.match(r"^(.*?)\s*\((REP|DEM|LIB|GRN|IND|W)\)\s*$", name):
        name, party = m[1], party or m[2]
    p = party.strip().upper()
    return name, PARTY_CODES.get(p, p)


def surname(name: str) -> str:
    words = re.sub(r'"[^"]*"|\([^)]*\)', " ", full_ascii(name)).replace(",", " ").split()
    words = [w for w in words if w.upper().rstrip(".") not in {"JR", "SR", "II", "III", "IV"}]
    return words[-1].upper() if words else ""


def full_ascii(name: str) -> str:
    return unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()


def full(name: str) -> str:
    """A name reduced to its letters: "James P. Sullivan" and "JAMES P. SULLIVAN (I)" agree."""
    plain = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^A-Z]", "", re.sub(r"\((I|W)\)", "", plain.upper()))


def merged(races: list[Race]) -> list[Race]:
    """One race per candidate list: a title split or reworded across pages must not split the race."""
    by: dict[frozenset, Race] = {}
    for race in races:
        key = frozenset(full(l) for l in race.votes if l != WRITE_IN)
        into = by.setdefault(key, Race(race.title))
        for label, precincts in race.votes.items():
            for p, counts in precincts.items():
                into.add(label, race.parties[label], p, counts)
    return list(by.values())


def sos_counties(path: Path) -> dict[str, dict]:
    raw = json.loads(base64.b64decode(json.loads(path.read_text())["upload"]))
    return {c["N"].title(): c for c in raw.values()}


def label_for(race: Race, name: str) -> str | None:
    """The PDF's label for the state's candidate: same full name, else the one candidate with that surname."""
    labels = [l for l in race.votes if l != WRITE_IN]
    exact = [l for l in labels if full(l) == full(name)]
    if exact:
        return exact[0]
    same = [l for l in labels if surname(l) == surname(name)]
    return same[0] if len(same) == 1 else None


def total(race: Race, label: str) -> int:
    return sum(sum(v) for v in race.votes[label].values())


def match(report: Report, sos: dict) -> tuple[dict, list[str]]:
    """The report's races that the state also reports, keyed by the state's race key, plus a check log.

    The state lists declared write-in candidates by name (party "W"); the
    reports give one write-in total, so the state's write-ins are left out
    of the match and the report's total is carried as "Write-in".
    """
    out: dict[str, dict] = {}
    log: list[str] = []
    gaps: list[float] = []
    races = merged(report.races)
    for r in sos["Races"].values():
        sos_choices = [(*clean_name(c["N"], c.get("P", "")), int(c.get("V", 0))) for c in r["C"].values()]
        named = [c for c in sos_choices if c[1] != "W"]
        found = None
        for race in races:
            labels = [label_for(race, n) for n, _, _ in named]
            if None not in labels and len(set(labels)) == len(race.votes.keys() - {WRITE_IN}):
                found = (race, labels)
                break
        if found is None:
            log.append(f"  no precinct table for {r['N'].strip()}")
            continue
        race, labels = found
        choices = [{"name": n, "party": p} for n, p, _ in named]
        if WRITE_IN in race.votes and total(race, WRITE_IN):
            labels = [*labels, WRITE_IN]
            choices.append({"name": WRITE_IN, "party": ""})
        n_types = len(report.types)
        rows = []
        for p in sorted({p for by in race.votes.values() for p in by}, key=precinct_order):
            by_type = [[race.votes[l].get(p, [0] * n_types)[t] for l in labels] for t in range(n_types)]
            if any(any(v) for v in by_type):
                rows.append({"precinct": p, "votes": by_type})
        out[race_key(r["N"])] = {"choices": choices, "types": report.types, "rows": rows}
        checks = [(n, total(race, l), want) for (n, _, want), l in zip(named, labels)]
        checks.append(("write-ins", total(race, WRITE_IN) if WRITE_IN in race.votes else 0, sum(v for _, p, v in sos_choices if p == "W")))
        got, want = sum(c[1] for c in checks), sum(c[2] for c in checks)
        diffs = [f"{n} {g:,} vs {w:,}" for n, g, w in checks if g != w]
        named_got, named_want = sum(c[1] for c in checks[:-1]), sum(c[2] for c in checks[:-1])
        if named_want:
            gaps.append(abs(named_got - named_want) / named_want)
        gap = f"{(got - want) / want:+.2%}" if want else "n/a"
        log.append(f"  {r['N'].strip()}: {len(rows)} precincts, " + ("matches the state" if not diffs else f"{gap} vs the state ({'; '.join(diffs)})"))
    return out, log, max(gaps, default=0.0)


def precinct_order(p: str) -> tuple:
    return tuple(int(x) if x.isdigit() else x for x in re.split(r"(\d+)", p))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--pdfs", type=Path, required=True)
    ap.add_argument("--sos", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()
    sos = sos_counties(args.sos)
    reports = [
        parse_electionware(text_of(args.pdfs / "collin.pdf"), "Collin", r"^PCT (\S+)\s*$", ["Total"], slice(0, 1)),
        parse_electionware(text_of(args.pdfs / "starr.pdf"), "Starr", r"^Precinct (\S+)\s*$", ["Mail", "Early in person", "Election Day"], slice(1, 4)),
        parse_willacy(text_of(args.pdfs / "willacy.pdf")),
    ]
    args.out.mkdir(parents=True, exist_ok=True)
    for report in reports:
        races, log, gap = match(report, sos[report.county])
        path = args.out / f"{report.county.lower()}.json"
        doc = {"county": report.county, "reportStamp": report.stamp, "largestGap": round(gap, 4), "races": races}
        path.write_text(json.dumps(doc, separators=(",", ":"), ensure_ascii=False))
        print(f"{report.county}: report {report.stamp}, largest gap {gap:.2%}, {len(races)} of {len(sos[report.county]['Races'])} state races, {path.stat().st_size:,} bytes")
        print("\n".join(log))


if __name__ == "__main__":
    main()
