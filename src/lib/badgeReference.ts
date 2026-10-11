import badgeReferenceData from "../data/badge_reference.json";

export interface GroundReference {
  groundId: string;
  ground: string;
}

export interface CathedralReference extends GroundReference {
  city: string;
}

export interface PremierLeagueClub {
  club: string;
  groundId: string | null;
  ground: string;
  inData: boolean;
}

export interface BadgeReference {
  londonClubs: string[];
  northLondonDerbyOpponent: string;
  leagueCompetitions: string[];
  europeanCompetitions: string[];
  ghostGrounds: GroundReference[];
  cathedralsOfFootball: CathedralReference[];
  oldAndNew: { lastAtHighbury: string; firstAtEmirates: string };
  premierLeague: { season: string; clubs: PremierLeagueClub[] };
}

export const badgeReference = badgeReferenceData as BadgeReference;
