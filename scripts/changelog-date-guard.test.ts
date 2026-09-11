import { execFileSync, execSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

const GUARD = resolve(__dirname, "changelog-date-guard");

/** The guard reads the local day from `date +%F`; read it the same way. */
const TODAY = execSync("date +%F").toString().trim();
const PAST = "2026-09-08";
const LONG_AGO = "2020-01-01";
const FUTURE = "2099-01-01";

type Result = { blocked: boolean; output: string };

/**
 * A throwaway repo with a base commit, so each case can be expressed as
 * "the branch changes the changelog like THIS" and nothing else.
 */
class Fixture {
  readonly dir: string;
  base = "";

  constructor(baseChangelog: string) {
    this.dir = mkdtempSync(join(tmpdir(), "changelog-guard-"));
    this.git("init -q .");
    this.git("config user.email guard@test");
    this.git("config user.name guard");
    this.write("CHANGELOG.md", baseChangelog);
    this.write("other.txt", "unrelated\n");
    this.git("add -A");
    this.git("commit -qm base");
    this.base = this.git("rev-parse HEAD").trim();
  }

  git(args: string): string {
    return execSync(`git ${args}`, { cwd: this.dir, encoding: "utf8" });
  }

  write(name: string, body: string): void {
    writeFileSync(join(this.dir, name), body);
  }

  commit(message: string): void {
    this.git("add -A");
    this.git(`commit -qm ${message}`);
  }

  /** Runs the guard over everything the branch adds on top of its base. */
  run(env: Record<string, string> = {}): Result {
    try {
      const output = execFileSync(GUARD, [this.base, "HEAD"], {
        cwd: this.dir,
        encoding: "utf8",
        env: { ...process.env, ...env },
      });
      return { blocked: false, output };
    } catch (error) {
      const failure = error as { status?: number; stdout?: string };
      return { blocked: true, output: failure.stdout ?? "" };
    }
  }

  cleanup(): void {
    rmSync(this.dir, { recursive: true, force: true });
  }
}

const changelog = (...sections: string[]) =>
  `# Changelog\n\n## [Unreleased]\n\n${sections.join("\n")}`;

const section = (heading: string, entry: string) =>
  `## ${heading}\n\n### Changed\n\n- ${entry}\n\n`;

describe("changelog-date-guard", () => {
  let fixture: Fixture;

  afterEach(() => fixture?.cleanup());

  // What the guard must let through. This half is the expensive one to get
  // wrong: a guard that refuses too much looks like working software right
  // up until someone needs the thing it blocked (standards/59).
  describe("permits", () => {
    beforeEach(() => {
      fixture = new Fixture(changelog(section(LONG_AGO, "Something old.")));
    });

    it("an entry parked under [Unreleased]", () => {
      fixture.write(
        "CHANGELOG.md",
        changelog(
          "### Fixed\n\n- Still in flight.\n\n",
          section(LONG_AGO, "Something old."),
        ),
      );
      fixture.commit("unreleased");
      expect(fixture.run().blocked).toBe(false);
    });

    it("a new section dated today", () => {
      fixture.write(
        "CHANGELOG.md",
        changelog(
          section(TODAY, "Shipping now."),
          section(LONG_AGO, "Something old."),
        ),
      );
      fixture.commit("today");
      expect(fixture.run().blocked).toBe(false);
    });

    it("an entry added to today's section when it already exists upstream", () => {
      // The ordinary case for a second merge on a busy day — and the one a
      // naive "never touch an existing section" rule would refuse.
      fixture = new Fixture(
        changelog(section(TODAY, "First thing today."), section(LONG_AGO, "Old.")),
      );
      fixture.write(
        "CHANGELOG.md",
        changelog(
          `## ${TODAY}\n\n### Changed\n\n- First thing today.\n- Second thing today.\n\n`,
          section(LONG_AGO, "Old."),
        ),
      );
      fixture.commit("second");
      expect(fixture.run().blocked).toBe(false);
    });

    it("a push that does not touch the changelog at all", () => {
      fixture.write("other.txt", "changed\n");
      fixture.commit("unrelated");
      expect(fixture.run().blocked).toBe(false);
    });

    it("a deletion from a past section, with nothing added", () => {
      fixture.write("CHANGELOG.md", changelog(`## ${LONG_AGO}\n\n### Changed\n\n`));
      fixture.commit("deletion");
      expect(fixture.run().blocked).toBe(false);
    });
  });

  describe("refuses", () => {
    it("a heading the branch added for a day that has since passed", () => {
      // The case this guard was written for: filed on the 8th, pushed again on
      // the 10th, merged under a heading naming a day that shipped without it.
      fixture = new Fixture(changelog(section(LONG_AGO, "Something old.")));
      fixture.write(
        "CHANGELOG.md",
        changelog(section(PAST, "Filed early."), section(LONG_AGO, "Something old.")),
      );
      fixture.commit("stale");

      const result = fixture.run();
      expect(result.blocked).toBe(true);
      expect(result.output).toContain(`## ${PAST}`);
      // A heading the branch invented can just be retitled, so say so.
      expect(result.output).toContain(`s/^## ${PAST}\$/## ${TODAY}/`);
    });

    it("an entry slipped into a section that already shipped", () => {
      fixture = new Fixture(changelog(section(LONG_AGO, "Something old.")));
      fixture.write(
        "CHANGELOG.md",
        changelog(`## ${LONG_AGO}\n\n### Changed\n\n- Something old.\n- Snuck in.\n\n`),
      );
      fixture.commit("snuck");

      const result = fixture.run();
      expect(result.blocked).toBe(true);
      // Renaming a published heading would redate entries that did ship that
      // day, so the remediation here must be "move", never "retitle".
      expect(result.output).toContain("Move those lines");
      expect(result.output).not.toContain(`s/^## ${LONG_AGO}\$/`);
    });

    it("a heading dated in the future", () => {
      fixture = new Fixture(changelog(section(LONG_AGO, "Something old.")));
      fixture.write(
        "CHANGELOG.md",
        changelog(section(FUTURE, "Ships someday."), section(LONG_AGO, "Old.")),
      );
      fixture.commit("future");

      const result = fixture.run();
      expect(result.blocked).toBe(true);
      expect(result.output).toContain("in the future");
    });
  });

  describe("escape hatch", () => {
    it("lets a deliberate correction through and says that it did", () => {
      fixture = new Fixture(changelog(section(LONG_AGO, "Typo heer.")));
      fixture.write("CHANGELOG.md", changelog(section(LONG_AGO, "Typo here.")));
      fixture.commit("correction");

      expect(fixture.run().blocked).toBe(true);

      const skipped = fixture.run({ CHANGELOG_DATE_GUARD: "off" });
      expect(skipped.blocked).toBe(false);
      expect(skipped.output).toContain("skipped");
    });
  });
});
