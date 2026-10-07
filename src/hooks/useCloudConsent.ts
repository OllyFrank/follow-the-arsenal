import { useCallback, useEffect, useState } from "react";
import { acceptConsent, fetchConsentStatus } from "../lib/cloudProfile";
import { needsConsent, PRIVACY_NOTICE_VERSION, type ConsentStatus } from "../lib/privacyNotice";

export function useCloudConsent(userId: string | null) {
  const [status, setStatus] = useState<ConsentStatus | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setStatus(null);
      setLoaded(false);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    fetchConsentStatus().then((s) => {
      if (cancelled) return;
      setStatus(s);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const accept = useCallback(async () => {
    if (!userId) return;
    await acceptConsent(userId, PRIVACY_NOTICE_VERSION);
    setStatus({ privacyVersionAccepted: PRIVACY_NOTICE_VERSION, ageConfirmed13Plus: true });
  }, [userId]);

  return {
    loaded,
    needsConsent: status !== null && needsConsent(status),
    accept,
  };
}
