/**
 * The arithmetic behind an Austin citizen petition, kept apart from the page so
 * every figure the page prints is computed, and tested, rather than typed.
 */

/** Signatures an Austin initiative or charter petition needs: 5% of qualified voters or 20,000, whichever is fewer. */
export function signaturesRequired(qualifiedVoters: number): number {
  return Math.min(Math.ceil(qualifiedVoters * 0.05), 20_000);
}

/** The required count as a share of qualified voters, e.g. 0.0367. */
export function thresholdShare(qualifiedVoters: number): number {
  return signaturesRequired(qualifiedVoters) / qualifiedVoters;
}

/** The share of submitted signatures that must prove valid for the petition to qualify. */
export function validityNeeded(submitted: number, required: number): number {
  if (submitted <= 0) throw new RangeError("submitted must be positive");
  return required / submitted;
}

const DAY_MS = 86_400_000;

/** A calendar date (no time zone), as an ISO yyyy-mm-dd string, moved by `days`. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS).toISOString().slice(0, 10);
}

export type Deadlines = {
  election: string;
  /** Last day the Council can order the election. */
  orderBy: string;
  /** Last day the Clerk should certify, leaving the Council its full window. */
  certifyBy: string;
  /** Last day to file, if verification takes the Clerk's stated minimum. */
  fileBy: string;
  /** Earliest date a signature on that filing can carry and still count. */
  oldestSignature: string;
};

/**
 * Works back from an election date: the order deadline, the Council's window,
 * the Clerk's verification time, then the 180-day life of a signature.
 */
export function deadlinesFor(
  election: string,
  { orderLeadDays, councilDays, clerkDays, signatureLifeDays }: {
    orderLeadDays: number;
    councilDays: number;
    clerkDays: number;
    signatureLifeDays: number;
  },
): Deadlines {
  const orderBy = addDays(election, -orderLeadDays);
  const certifyBy = addDays(orderBy, -councilDays);
  const fileBy = addDays(certifyBy, -clerkDays);
  return { election, orderBy, certifyBy, fileBy, oldestSignature: addDays(fileBy, -signatureLifeDays) };
}
