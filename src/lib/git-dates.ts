import { execFileSync } from "node:child_process";
import fs from "node:fs";

/**
 * When each file under `dir` was last changed, from git history.
 *
 * Built for the sitemap's `lastModified`: a date that is always "now" teaches
 * search engines to ignore it, so a page only gets a date git can vouch for.
 * Returns an empty map when git isn't available.
 *
 * Shallow clones (CI and hosted builds often fetch only the last few commits)
 * need care: git reports the oldest fetched commit as adding every file in the
 * repo, which would stamp untouched pages with a recent date. Files whose only
 * change in the fetched history is that boundary commit get no date at all.
 */
export function lastCommitDates(dir: string, cwd: string = process.cwd()): Map<string, Date> {
  const dates = new Map<string, Date>();
  let log: string;
  try {
    log = execFileSync(
      "git",
      ["log", "--format=%x1e%H%x1f%cI", "--name-only", "--relative", "--no-renames", "--", `:(literal)${dir}`],
      { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 },
    );
  } catch {
    return dates;
  }

  const boundary = shallowBoundary(cwd);
  // Newest commit first, so the first date seen for a file is its latest change.
  for (const record of log.split("\x1e")) {
    const [header, ...files] = record.split("\n");
    const [sha, iso] = header.split("\x1f");
    if (!sha || !iso || boundary.has(sha)) continue;
    const date = new Date(iso);
    for (const file of files) {
      if (file && !dates.has(file)) dates.set(file, date);
    }
  }
  return dates;
}

/** Commits at the edge of a shallow clone; empty for a full clone. */
function shallowBoundary(cwd: string): Set<string> {
  try {
    const shallowFile = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-path", "shallow"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!fs.existsSync(shallowFile)) return new Set();
    return new Set(fs.readFileSync(shallowFile, "utf8").split("\n").filter(Boolean));
  } catch {
    return new Set();
  }
}
