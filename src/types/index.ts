export type HomeAwayNeutral = "H" | "A" | "N";
export type MatchResult = "W" | "D" | "L";

export interface Fixture {
  matchId: string;
  /** ISO date string, e.g. "1988-08-27" */
  date: string;
  /** Stored season string, e.g. "1988/89". Never derive from date. */
  season: string;
  competition: string;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  opponent: string;
  venueType: HomeAwayNeutral;
  groundId: string;
  venue: string;
  arsenalGoals: number;
  opponentGoals: number;
  result: MatchResult;
  penaltyShootOut: string | null;
  behindClosedDoors: boolean;
  /** false only for the one voided 1999 Sheffield United game. */
  countsInRecord: boolean;
  notes: string | null;
}

export interface Ground {
  groundId: string;
  ground: string;
  alsoKnownAs: string | null;
  usedBy: string | null;
  country: string;
  latitude: number;
  longitude: number;
  confidence: "High" | "Medium" | "Low";
}

export interface HomeAddress {
  id: string;
  label: string;
  /** Raw text the user entered (postcode or free-text place name). */
  query: string;
  latitude: number;
  longitude: number;
  /** ISO date string, inclusive. */
  fromDate: string;
  /** ISO date string, inclusive. Null = ongoing/current address. */
  toDate: string | null;
}

export interface AppState {
  attendedMatchIds: string[];
  homeAddresses: HomeAddress[];
  onboardingComplete: boolean;
}
