import { useCallback, useEffect, useState } from "react";
import type { HomeAddress } from "../types";
import {
  addAttendance,
  bulkAddAttendance,
  bulkRemoveAttendance,
  fetchAttendance,
  removeAttendance,
} from "../lib/cloudAttendance";
import { fetchAddresses, saveAddresses } from "../lib/cloudAddresses";

// Mirrors useAppState's shape so App.tsx can swap between the two by auth
// state alone. Supabase is the source of truth while signed in; this just
// keeps an in-memory cache so the UI doesn't wait on the network for every
// render (docs/ACCOUNTS_PLAN.md: "keep a local cache for speed only").
export function useCloudAppState(userId: string | null) {
  const [attendedMatchIds, setAttendedMatchIds] = useState<Set<string>>(new Set());
  const [homeAddresses, setHomeAddresses] = useState<HomeAddress[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setAttendedMatchIds(new Set());
      setHomeAddresses([]);
      setLoaded(false);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    Promise.all([fetchAttendance(), fetchAddresses()]).then(([matchIds, addresses]) => {
      if (cancelled) return;
      setAttendedMatchIds(new Set(matchIds));
      setHomeAddresses(addresses);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggleAttendance = useCallback(
    (matchId: string, attended: boolean) => {
      if (!userId) return;
      setAttendedMatchIds((prev) => {
        const next = new Set(prev);
        if (attended) next.add(matchId);
        else next.delete(matchId);
        return next;
      });
      (attended ? addAttendance(userId, matchId) : removeAttendance(userId, matchId)).catch(
        (err) => console.error("Failed to sync attendance", err),
      );
    },
    [userId],
  );

  const bulkSetAttendance = useCallback(
    (matchIds: string[], attended: boolean) => {
      if (!userId) return;
      setAttendedMatchIds((prev) => {
        const next = new Set(prev);
        for (const id of matchIds) {
          if (attended) next.add(id);
          else next.delete(id);
        }
        return next;
      });
      (attended
        ? bulkAddAttendance(userId, matchIds)
        : bulkRemoveAttendance(userId, matchIds)
      ).catch((err) => console.error("Failed to sync attendance", err));
    },
    [userId],
  );

  const updateAddresses = useCallback(
    (addresses: HomeAddress[]) => {
      if (!userId) return;
      setHomeAddresses(addresses);
      saveAddresses(userId, addresses).catch((err) =>
        console.error("Failed to sync addresses", err),
      );
    },
    [userId],
  );

  return { attendedMatchIds, homeAddresses, loaded, toggleAttendance, bulkSetAttendance, updateAddresses };
}
