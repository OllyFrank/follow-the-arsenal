import { useCallback, useState } from "react";
import type { HomeAddress } from "../types";
import {
  exportBackup,
  getAppState,
  importBackup,
  saveHomeAddresses,
  setAttendance,
  setAttendanceBulk,
} from "../lib/storage";

export function useAppState() {
  const [state, setState] = useState(() => getAppState());

  const toggleAttendance = useCallback((matchId: string, attended: boolean) => {
    setState(setAttendance(matchId, attended));
  }, []);

  const bulkSetAttendance = useCallback((matchIds: string[], attended: boolean) => {
    setState(setAttendanceBulk(matchIds, attended));
  }, []);

  const updateAddresses = useCallback((addresses: HomeAddress[]) => {
    setState(saveHomeAddresses(addresses));
  }, []);

  const backup = useCallback(() => exportBackup(), []);

  const restore = useCallback((json: string) => {
    setState(importBackup(json));
  }, []);

  return {
    attendedMatchIds: new Set(state.attendedMatchIds),
    homeAddresses: state.homeAddresses,
    toggleAttendance,
    bulkSetAttendance,
    updateAddresses,
    backup,
    restore,
  };
}
