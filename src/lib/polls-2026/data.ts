import type { Poll } from "./average";
import source from "./polls.json";

/**
 * Public pre-election polls of the November 2026 Texas general election,
 * entered by hand from each pollster's own release (polls.json). Every entry
 * links to that release. Shares are as published; nothing is adjusted.
 */

export type Race = { id: string; name: string; dem: string; rep: string };

export const RACES: Race[] = source.races;
export const POLLS = source.polls as Poll[];

/** The date polls are averaged to: the last day polls were collected for the page. */
export const AS_OF: string = source.asOf;

export const pollsFor = (race: string) => POLLS.filter((p) => p.race === race);
