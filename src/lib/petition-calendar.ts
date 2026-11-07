/**
 * The election Austin citizen petitions can next reach, shared by every page
 * that counts back from it. Proposition G (November 2026) puts initiatives and
 * petitioned charter amendments on the next November election in an
 * even-numbered year; the uniform date that year is Tex. Elec. Code §41.001's.
 */
export const PETITION_ELECTION = { label: "November 2028", date: "2028-11-07" };

/**
 * The steps between filing and election day: the 78-day order deadline
 * (Elec. Code §3.005(c)), the Council's 10 days after certification, the
 * Clerk's stated 30-day minimum to verify, and a signature's 180-day life
 * (Elec. Code §277.002(e)).
 */
export const PETITION_TIMING = { orderLeadDays: 78, councilDays: 10, clerkDays: 30, signatureLifeDays: 180 };
