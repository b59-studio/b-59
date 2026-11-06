import { NextResponse } from "next/server";
import { countyStatuses, raceDetail } from "@/lib/results-2026/present";
import { getSnapshot, REFRESH_SECONDS } from "@/lib/results-2026/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One race's statewide sum and county rows, with every followed county's source status. */
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  const snapshot = await getSnapshot();
  const race = raceDetail(snapshot, key);
  if (!race) return NextResponse.json({ error: "No such race." }, { status: 404 });
  return NextResponse.json(
    { readAt: snapshot.readAt, official: snapshot.official, race, counties: countyStatuses(snapshot) },
    // Shared caches may hold it for half a refresh; the sources are read at most every REFRESH_SECONDS anyway.
    { headers: { "Cache-Control": `public, s-maxage=${REFRESH_SECONDS / 2}, stale-while-revalidate=${REFRESH_SECONDS}` } },
  );
}
