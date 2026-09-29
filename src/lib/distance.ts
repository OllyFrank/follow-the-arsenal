import type { Fixture, Ground, HomeAddress } from "../types";

const EARTH_RADIUS_KM = 6371;
export const EARTH_CIRCUMFERENCE_KM = 40075;
export const EARTH_CIRCUMFERENCE_MI = 24901;
const KM_TO_MI = 0.621371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** One-way great-circle distance in km. */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function kmToMi(km: number): number {
  return km * KM_TO_MI;
}

/** Finds the home address whose [fromDate, toDate] period covers the given date. */
export function findHomeAddressForDate(
  addresses: HomeAddress[],
  isoDate: string,
): HomeAddress | null {
  return (
    addresses.find((addr) => {
      if (isoDate < addr.fromDate) return false;
      if (addr.toDate !== null && isoDate > addr.toDate) return false;
      return true;
    }) ?? null
  );
}

export interface MatchDistance {
  fixture: Fixture;
  ground: Ground;
  homeAddress: HomeAddress;
  /** Return-trip distance in km (one-way haversine x 2). */
  distanceKm: number;
}

export interface DistanceResult {
  matches: MatchDistance[];
  /** Attended, counted matches with no home address covering their date. */
  unresolvedFixtures: Fixture[];
}

/**
 * Computes return-trip distances for every attended, non-behind-closed-doors
 * match. `Counts in record = N` matches ARE included here (they still count
 * for distance/grounds even though they're excluded from result stats).
 */
export function computeDistances(
  fixtures: Fixture[],
  groundsById: Map<string, Ground>,
  attendedMatchIds: Set<string>,
  addresses: HomeAddress[],
): DistanceResult {
  const matches: MatchDistance[] = [];
  const unresolvedFixtures: Fixture[] = [];

  for (const fixture of fixtures) {
    if (!attendedMatchIds.has(fixture.matchId)) continue;
    if (fixture.behindClosedDoors) continue;

    const ground = groundsById.get(fixture.groundId);
    if (!ground) continue;

    const homeAddress = findHomeAddressForDate(addresses, fixture.date);
    if (!homeAddress) {
      unresolvedFixtures.push(fixture);
      continue;
    }

    const oneWayKm = haversineKm(
      homeAddress.latitude,
      homeAddress.longitude,
      ground.latitude,
      ground.longitude,
    );
    matches.push({
      fixture,
      ground,
      homeAddress,
      distanceKm: oneWayKm * 2,
    });
  }

  return { matches, unresolvedFixtures };
}
