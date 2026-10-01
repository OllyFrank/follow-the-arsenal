import { useCallback, useState } from "react";
import type { HomeAddress } from "../types";
import {
  completeOnboarding,
  getAppState,
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

  const finishOnboarding = useCallback(() => {
    setState(completeOnboarding());
  }, []);

  return {
    attendedMatchIds: new Set(state.attendedMatchIds),
    homeAddresses: state.homeAddresses,
    onboardingComplete: state.onboardingComplete,
    toggleAttendance,
    bulkSetAttendance,
    updateAddresses,
    finishOnboarding,
  };
}
