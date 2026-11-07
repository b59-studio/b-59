import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { lastCommitDates } from "./git-dates";

// A throwaway repo where each commit touches one file on a known date:
//   2024-01-01 adds pages/[locale]/old.tsx
//   2024-02-01 adds pages/[locale]/mid.tsx
//   2024-03-01 changes pages/[locale]/new.tsx
let root: string;
let full: string;

function git(cwd: string, args: string[], date?: string) {
  const env = { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date };
  execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", ...args], {
    cwd,
    env,
    stdio: "ignore",
  });
}

function commitFile(name: string, date: string) {
  fs.mkdirSync(path.join(full, "pages/[locale]"), { recursive: true });
  fs.writeFileSync(path.join(full, "pages/[locale]", name), date);
  git(full, ["add", "."]);
  git(full, ["commit", "-m", name], `${date}T12:00:00Z`);
}

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "git-dates-"));
  full = path.join(root, "full");
  fs.mkdirSync(full);
  git(full, ["init", "-q"]);
  commitFile("old.tsx", "2024-01-01");
  commitFile("mid.tsx", "2024-02-01");
  commitFile("new.tsx", "2024-03-01");
});

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("lastCommitDates", () => {
  it("dates each file by the last commit that touched it", () => {
    const dates = lastCommitDates("pages/[locale]", full);
    expect(dates.get("pages/[locale]/old.tsx")?.toISOString()).toBe("2024-01-01T12:00:00.000Z");
    expect(dates.get("pages/[locale]/mid.tsx")?.toISOString()).toBe("2024-02-01T12:00:00.000Z");
    expect(dates.get("pages/[locale]/new.tsx")?.toISOString()).toBe("2024-03-01T12:00:00.000Z");
  });

  it("leaves out files a shallow clone can't date instead of stamping them with the boundary commit", () => {
    const shallow = path.join(root, "shallow");
    git(root, ["clone", "-q", "--depth=2", `file://${full}`, shallow]);
    const dates = lastCommitDates("pages/[locale]", shallow);
    // The boundary commit (mid) appears to add every file, so neither it nor old can be trusted.
    expect(dates.has("pages/[locale]/old.tsx")).toBe(false);
    expect(dates.has("pages/[locale]/mid.tsx")).toBe(false);
    expect(dates.get("pages/[locale]/new.tsx")?.toISOString()).toBe("2024-03-01T12:00:00.000Z");
  });

  it("returns nothing outside a git repo", () => {
    const bare = fs.mkdtempSync(path.join(root, "nogit-"));
    expect(lastCommitDates("pages/[locale]", bare).size).toBe(0);
  });
});
