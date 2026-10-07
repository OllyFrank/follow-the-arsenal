import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Fixture, HomeAddress } from "../../types";
import { deleteAccount, needsReauth } from "../../lib/cloudAccount";
import { buildExportPayload, downloadExportCsvs } from "../../lib/exportData";

type Step = "main" | "reauth" | "warning" | "deleting" | "error";

interface Props {
  user: User;
  unit: "mi" | "km";
  onUnitChange: (unit: "mi" | "km") => void;
  attendedMatchIds: Set<string>;
  homeAddresses: HomeAddress[];
  fixtures: Fixture[];
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  onAccountDeleted: () => void;
}

export function AccountSettings({
  user,
  unit,
  onUnitChange,
  attendedMatchIds,
  homeAddresses,
  fixtures,
  signInWithMagicLink,
  signOut,
  onAccountDeleted,
}: Props) {
  const [step, setStep] = useState<Step>("main");
  const [reauthSent, setReauthSent] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Once a fresh magic link is clicked, the session refreshes in place and
  // last_sign_in_at updates — move on to the warning step automatically.
  useEffect(() => {
    if (step === "reauth" && !needsReauth(user.last_sign_in_at)) {
      setStep("warning");
      setReauthSent(false);
    }
  }, [step, user.last_sign_in_at]);

  function handleDownloadData() {
    const payload = buildExportPayload(
      user.email ?? "",
      unit,
      homeAddresses,
      attendedMatchIds,
      fixtures,
    );
    downloadExportCsvs(payload);
  }

  function handleDeleteClick() {
    setError(null);
    setStep(needsReauth(user.last_sign_in_at) ? "reauth" : "warning");
  }

  async function handleSendReauthLink() {
    try {
      await signInWithMagicLink(user.email ?? "");
      setReauthSent(true);
    } catch {
      setError("Couldn't send the link. Try again in a moment.");
    }
  }

  async function handleConfirmDelete() {
    setStep("deleting");
    try {
      await deleteAccount();
      await signOut();
      onAccountDeleted();
    } catch {
      setError("Something went wrong deleting your account. Please try again.");
      setStep("warning");
    }
  }

  if (step === "reauth") {
    return (
      <>
        <p className="stat-subline">
          For your security, sign in again before deleting your account — it's been a while since
          your last sign-in.
        </p>
        {reauthSent ? (
          <p className="stat-subline" style={{ marginTop: "0.6rem" }}>
            Check your email and click the link — this screen will move on automatically once
            you're signed in again.
          </p>
        ) : (
          <div className="bulk-actions" style={{ marginTop: "0.75rem" }}>
            <button className="btn btn-primary" onClick={handleSendReauthLink}>
              Send magic link
            </button>
            <button className="btn" onClick={() => setStep("main")}>
              Cancel
            </button>
          </div>
        )}
        {error && (
          <div className="warning-box" style={{ marginTop: "0.6rem" }}>
            {error}
          </div>
        )}
      </>
    );
  }

  if (step === "warning" || step === "deleting") {
    return (
      <>
        <p className="stat-subline">
          This permanently deletes your account and every match and address saved to it. Guest
          data on other devices isn't affected. This can't be undone.
        </p>
        <div className="form-row" style={{ marginTop: "0.6rem" }}>
          <label>
            Type DELETE to confirm
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={step === "deleting"}
            />
          </label>
        </div>
        {error && (
          <div className="warning-box" style={{ marginTop: "0.6rem" }}>
            {error}
          </div>
        )}
        <div className="bulk-actions" style={{ marginTop: "0.75rem" }}>
          <button
            className="btn btn-danger"
            onClick={handleConfirmDelete}
            disabled={confirmText !== "DELETE" || step === "deleting"}
          >
            {step === "deleting" ? "Deleting…" : "Delete my account"}
          </button>
          <button className="btn" onClick={() => setStep("main")} disabled={step === "deleting"}>
            Cancel
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="stat-subline">Signed in as {user.email}</p>

      <div className="form-row" style={{ marginTop: "0.6rem", alignItems: "flex-end" }}>
        <label>
          Distance units
          <select
            value={unit}
            onChange={(e) => onUnitChange(e.target.value as "mi" | "km")}
            style={{ height: "44px" }}
          >
            <option value="mi">Miles</option>
            <option value="km">Kilometres</option>
          </select>
        </label>
        <button className="btn" onClick={handleDownloadData}>
          Download my data
        </button>
      </div>

      <div className="bulk-actions bulk-actions-end" style={{ marginTop: "0.75rem" }}>
        <button className="btn btn-danger" onClick={handleDeleteClick}>
          Delete my account
        </button>
        <button className="btn" onClick={signOut}>
          Sign out
        </button>
      </div>
    </>
  );
}
