// Bump this and update PrivacyNotice.tsx's content together whenever the
// notice materially changes — signed-in users get re-prompted to accept
// whatever version is current here (docs/ACCOUNTS_PLAN.md section 6).
export const PRIVACY_NOTICE_VERSION = 1;

export const PRIVACY_CONTACT_EMAIL = "privacy@weallfollowthearsenal.co.uk";
export const PRIVACY_OWNER_NAME = "Olly Frank";

export interface ConsentStatus {
  privacyVersionAccepted: number | null;
  ageConfirmed13Plus: boolean;
}

export function needsConsent(status: ConsentStatus): boolean {
  return status.privacyVersionAccepted !== PRIVACY_NOTICE_VERSION || !status.ageConfirmed13Plus;
}
