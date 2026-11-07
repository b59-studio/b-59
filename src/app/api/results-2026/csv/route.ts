import { NextResponse } from "next/server";
import { csvFileName, raceCsv } from "@/lib/results-2026/csv";
import { raceDetail } from "@/lib/results-2026/present";
import { getPrecincts, getSnapshot, REFRESH_SECONDS } from "@/lib/results-2026/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One race as a CSV download: statewide, every county, and precincts where published. */
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  const snapshot = await getSnapshot();
  const race = raceDetail(snapshot, key);
  if (!race) return NextResponse.json({ error: "No such race." }, { status: 404 });

  const precincts = (
    await Promise.all(
      race.rows
        .filter((r) => r.hasPrecincts)
        .map(async (r) => {
          const detail = await getPrecincts(r.county, key).catch(() => null);
          if (!detail) return null;
          // Parsed precinct rows come from the county's PDF report, not from the state's file.
          const system = detail.parsed ? `${r.county} precinct report (PDF, run ${detail.parsed.reportStamp}), parsed` : r.system;
          return { county: r.county, system, readAt: r.readAt, detail };
        }),
    )
  ).filter((p) => p != null);

  return new NextResponse(raceCsv(race, snapshot.sos, snapshot.sosReadAt, precincts), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFileName(race.name)}"`,
      "Cache-Control": `public, s-maxage=${REFRESH_SECONDS / 2}, stale-while-revalidate=${REFRESH_SECONDS}`,
    },
  });
}
