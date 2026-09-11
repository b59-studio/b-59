import { execFileSync, execSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "@jest/globals";

const INSTALLER = resolve(__dirname, "install-hooks.sh");

type Result = { blocked: boolean; output: string };

/**
 * A throwaway repo the installer can be run inside, so each case is "the hook
 * this installer writes, invoked the way git invokes it".
 *
 * The cases here are about the SPLIT the installer straddles: .git/hooks is
 * checkout-scoped, scripts/ is branch-scoped. Every case either has the checks
 * script present or deliberately does not.
 */
class Fixture {
  readonly dir: string;
  sha = "";

  constructor({ withChecks }: { withChecks: boolean }) {
    this.dir = mkdtempSync(join(tmpdir(), "install-hooks-"));
    this.git("init -q .");
    this.git("config user.email hooks@test");
    this.git("config user.name hooks");
    mkdirSync(join(this.dir, "scripts"));
    copyFileSync(INSTALLER, join(this.dir, "scripts/install-hooks.sh"));
    if (withChecks) {
      // Stands in for the real checks: says it ran, and refuses, so a silent
      // pass cannot be mistaken for the checks having run.
      this.writeExecutable("scripts/pre-push-checks", "#!/bin/sh\necho CHECKS RAN\nexit 1\n");
    }
    writeFileSync(join(this.dir, "README.md"), "fixture\n");
    this.git("add -A");
    this.git("commit -qm base");
    this.sha = this.git("rev-parse HEAD").trim();
  }

  git(args: string): string {
    return execSync(`git ${args}`, { cwd: this.dir, encoding: "utf8" });
  }

  writeExecutable(name: string, body: string): void {
    const path = join(this.dir, name);
    writeFileSync(path, body);
    chmodSync(path, 0o755);
  }

  install(...args: string[]): string {
    return execFileSync("bash", ["scripts/install-hooks.sh", ...args], {
      cwd: this.dir,
      encoding: "utf8",
    });
  }

  /** Invokes the installed hook the way git does: one ref line on stdin. */
  push(): Result {
    const line = `refs/heads/main ${this.sha} refs/heads/main ${this.sha}\n`;
    try {
      const output = execFileSync(".git/hooks/pre-push", [], {
        cwd: this.dir,
        encoding: "utf8",
        input: line,
      });
      return { blocked: false, output };
    } catch (error) {
      const failure = error as { stdout?: string };
      return { blocked: true, output: failure.stdout ?? "" };
    }
  }

  cleanup(): void {
    rmSync(this.dir, { recursive: true, force: true });
  }
}

describe("install-hooks.sh", () => {
  let fixture: Fixture;

  afterEach(() => fixture?.cleanup());

  it("runs the checks when the branch has them", () => {
    fixture = new Fixture({ withChecks: true });
    fixture.install();
    const result = fixture.push();
    expect(result.output).toContain("CHECKS RAN");
    expect(result.blocked).toBe(true);
  });

  // The defect this guards against: the hook is installed per checkout, the
  // script it runs lives on a branch. Check out a branch cut before the script
  // existed and an unconditional exec fails every push with a "No such file or
  // directory" naming a path that branch has never heard of.
  it("lets the push through when the checks are not on this branch", () => {
    fixture = new Fixture({ withChecks: false });
    fixture.install();
    expect(fixture.push().blocked).toBe(false);
  });

  // A hook that tells you to "re-run the installer" has to survive being
  // re-run. The marker the installer looks for must be one its own output
  // contains, or the second run refuses to overwrite the first run's work.
  it("can be run again over the hook it wrote itself", () => {
    fixture = new Fixture({ withChecks: true });
    fixture.install();
    expect(() => fixture.install()).not.toThrow();
    expect(fixture.push().output).toContain("CHECKS RAN");
  });

  it("refuses to overwrite a pre-push hook it did not write", () => {
    fixture = new Fixture({ withChecks: true });
    mkdirSync(join(fixture.dir, ".git/hooks"), { recursive: true });
    fixture.writeExecutable(".git/hooks/pre-push", "#!/bin/sh\nexit 0\n");
    expect(() => fixture.install()).toThrow();
  });
});
