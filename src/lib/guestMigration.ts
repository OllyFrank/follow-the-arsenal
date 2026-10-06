import type { HomeAddress } from "../types";

// Step 4 of docs/ACCOUNTS_PLAN.md: guest-data upload decisions, kept as pure
// functions so the merge logic is tested directly rather than only through
// the prompt component's interactions.

/** Attendance always merges as a union: only the guest IDs the account doesn't already have. */
export function matchIdsToUpload(guestMatchIds: Set<string>, cloudMatchIds: Set<string>): string[] {
  return [...guestMatchIds].filter((id) => !cloudMatchIds.has(id));
}

/** Addresses only need a choice when both sides actually have some. */
export function addressesConflict(guestAddresses: HomeAddress[], cloudAddresses: HomeAddress[]): boolean {
  return guestAddresses.length > 0 && cloudAddresses.length > 0;
}
