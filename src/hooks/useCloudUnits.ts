import { useCallback, useEffect, useState } from "react";
import { fetchUnits, updateUnits } from "../lib/cloudProfile";

export function useCloudUnits(userId: string | null) {
  const [unit, setUnitState] = useState<"mi" | "km">("mi");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoaded(false);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    fetchUnits().then((u) => {
      if (cancelled) return;
      setUnitState(u);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setUnit = useCallback(
    (next: "mi" | "km") => {
      if (!userId) return;
      setUnitState(next);
      updateUnits(userId, next).catch((err) => console.error("Failed to sync units", err));
    },
    [userId],
  );

  return { unit, setUnit, loaded };
}
