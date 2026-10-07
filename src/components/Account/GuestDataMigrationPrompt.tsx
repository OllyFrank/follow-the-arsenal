import { useState } from "react";
import type { HomeAddress } from "../../types";
import { addressesConflict, matchIdsToUpload } from "../../lib/guestMigration";

type Step = "confirm" | "addressChoice" | "working";

interface Props {
  guestMatchIds: Set<string>;
  guestAddresses: HomeAddress[];
  cloudMatchIds: Set<string>;
  cloudAddresses: HomeAddress[];
  onBulkSetAttendance: (matchIds: string[], attended: boolean) => void;
  onUpdateAddresses: (addresses: HomeAddress[]) => void;
  onClearGuestData: () => void;
  onDismiss: () => void;
}

// Step 4 of docs/ACCOUNTS_PLAN.md: offer to upload this device's guest data
// into the signed-in account. Attendance always merges as a union; addresses
// only get a silent import when the account has none yet — otherwise the
// user picks which set to keep.
export function GuestDataMigrationPrompt({
  guestMatchIds,
  guestAddresses,
  cloudMatchIds,
  cloudAddresses,
  onBulkSetAttendance,
  onUpdateAddresses,
  onClearGuestData,
  onDismiss,
}: Props) {
  const [step, setStep] = useState<Step>("confirm");

  const newMatchIds = matchIdsToUpload(guestMatchIds, cloudMatchIds);
  const hasAddressConflict = addressesConflict(guestAddresses, cloudAddresses);

  function finish(resolvedAddresses: HomeAddress[] | null) {
    if (newMatchIds.length > 0) onBulkSetAttendance(newMatchIds, true);
    if (resolvedAddresses !== null) onUpdateAddresses(resolvedAddresses);
    onClearGuestData();
    onDismiss();
  }

  function handleUpload() {
    if (hasAddressConflict) {
      setStep("addressChoice");
      return;
    }
    // No conflict: either the account has no addresses yet (import the
    // guest set), or the guest has none to offer (nothing to do).
    finish(guestAddresses.length > 0 ? guestAddresses : null);
  }

  const parts: string[] = [];
  if (guestMatchIds.size > 0) {
    parts.push(`${guestMatchIds.size} match${guestMatchIds.size === 1 ? "" : "es"}`);
  }
  if (guestAddresses.length > 0) {
    parts.push(`${guestAddresses.length} address${guestAddresses.length === 1 ? "" : "es"}`);
  }

  return (
    <div className="modal-backdrop">
      <div className="card modal-panel">
        <div className="section-title">Upload your data?</div>

        {step === "confirm" && (
          <>
            <p className="stat-subline">
              This device has {parts.join(" and ")} saved as a guest. Upload{" "}
              {parts.length === 2 ? "them" : "it"} to your account?
            </p>
            <div className="bulk-actions" style={{ marginTop: "0.75rem" }}>
              <button className="btn btn-primary" onClick={handleUpload}>
                Upload
              </button>
              <button className="btn" onClick={onDismiss}>
                Don't upload
              </button>
            </div>
          </>
        )}

        {step === "addressChoice" && (
          <>
            <p className="stat-subline">
              Your account already has {cloudAddresses.length} address
              {cloudAddresses.length === 1 ? "" : "es"} saved. Keep those, or replace them with
              the {guestAddresses.length} from this device?
            </p>
            <div className="bulk-actions" style={{ marginTop: "0.75rem" }}>
              <button className="btn btn-primary" onClick={() => finish(guestAddresses)}>
                Replace with these
              </button>
              <button className="btn" onClick={() => finish(null)}>
                Keep account's
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
