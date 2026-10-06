import type { AppState, HomeAddress } from "../types";

// All attendance/address reads and writes go through this module so a
// future swap to a real backend only touches this file.

const STORAGE_KEY = "watfa:state:v1";

function readState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { attendedMatchIds: [], homeAddresses: [], onboardingComplete: false };
    const parsed = JSON.parse(raw) as AppState;
    const attendedMatchIds = parsed.attendedMatchIds ?? [];
    const homeAddresses = parsed.homeAddresses ?? [];
    return {
      attendedMatchIds,
      homeAddresses,
      // Anyone with existing data got here before onboarding existed —
      // treat them as already onboarded rather than show it retroactively.
      onboardingComplete:
        parsed.onboardingComplete ?? (attendedMatchIds.length > 0 || homeAddresses.length > 0),
    };
  } catch {
    return { attendedMatchIds: [], homeAddresses: [], onboardingComplete: false };
  }
}

function writeState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getAppState(): AppState {
  return readState();
}

export function setAttendance(matchId: string, attended: boolean): AppState {
  const state = readState();
  const set = new Set(state.attendedMatchIds);
  if (attended) {
    set.add(matchId);
  } else {
    set.delete(matchId);
  }
  const next: AppState = { ...state, attendedMatchIds: [...set] };
  writeState(next);
  return next;
}

export function setAttendanceBulk(matchIds: string[], attended: boolean): AppState {
  const state = readState();
  const set = new Set(state.attendedMatchIds);
  for (const id of matchIds) {
    if (attended) set.add(id);
    else set.delete(id);
  }
  const next: AppState = { ...state, attendedMatchIds: [...set] };
  writeState(next);
  return next;
}

export function saveHomeAddresses(addresses: HomeAddress[]): AppState {
  const state = readState();
  const next: AppState = { ...state, homeAddresses: addresses };
  writeState(next);
  return next;
}

export function completeOnboarding(): AppState {
  const state = readState();
  const next: AppState = { ...state, onboardingComplete: true };
  writeState(next);
  return next;
}

// Called after a successful guest-data upload to Supabase (step 4 of
// docs/ACCOUNTS_PLAN.md). Keeps onboardingComplete as-is — clearing guest
// data shouldn't send someone back through onboarding.
export function clearGuestData(): AppState {
  const state = readState();
  const next: AppState = { ...state, attendedMatchIds: [], homeAddresses: [] };
  writeState(next);
  return next;
}
