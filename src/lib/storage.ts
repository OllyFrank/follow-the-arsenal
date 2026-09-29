import type { AppState, HomeAddress } from "../types";

// All attendance/address reads and writes go through this module so a
// future swap to a real backend only touches this file.

const STORAGE_KEY = "watfa:state:v1";

function readState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { attendedMatchIds: [], homeAddresses: [] };
    const parsed = JSON.parse(raw) as AppState;
    return {
      attendedMatchIds: parsed.attendedMatchIds ?? [],
      homeAddresses: parsed.homeAddresses ?? [],
    };
  } catch {
    return { attendedMatchIds: [], homeAddresses: [] };
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

export function exportBackup(): string {
  return JSON.stringify(readState(), null, 2);
}

export function importBackup(json: string): AppState {
  const parsed = JSON.parse(json) as AppState;
  const next: AppState = {
    attendedMatchIds: Array.isArray(parsed.attendedMatchIds) ? parsed.attendedMatchIds : [],
    homeAddresses: Array.isArray(parsed.homeAddresses) ? parsed.homeAddresses : [],
  };
  writeState(next);
  return next;
}
