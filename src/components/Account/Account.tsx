import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Fixture, HomeAddress } from "../../types";
import { AccountIcon } from "../shared/NavIcons";
import { AccountSettings } from "./AccountSettings";

type SendStatus = "idle" | "sending" | "sent";

interface Props {
  user: User | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  unit: "mi" | "km";
  onUnitChange: (unit: "mi" | "km") => void;
  attendedMatchIds: Set<string>;
  homeAddresses: HomeAddress[];
  fixtures: Fixture[];
}

export function Account({
  user,
  loading,
  signInWithMagicLink,
  signOut,
  unit,
  onUnitChange,
  attendedMatchIds,
  homeAddresses,
  fixtures,
}: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [justDeleted, setJustDeleted] = useState(false);

  function close() {
    setOpen(false);
    setStatus("idle");
    setError(null);
  }

  async function handleSendLink() {
    setError(null);
    setStatus("sending");
    try {
      await signInWithMagicLink(email);
      setStatus("sent");
    } catch (err) {
      const status = err instanceof Object && "status" in err ? err.status : null;
      setError(
        status === 429
          ? "Too many sign-in emails sent recently — wait a bit and try again."
          : "Couldn't send the link. Check the email address and try again.",
      );
      setStatus("idle");
    }
  }

  async function handleSignOut() {
    await signOut();
    close();
  }

  if (loading) return null;

  return (
    <>
      <button
        type="button"
        className="account-trigger"
        aria-label={user ? "Account" : "Sign in"}
        onClick={() => setOpen(true)}
      >
        <AccountIcon />
      </button>

      {open && (
        <div className="modal-backdrop" onClick={close}>
          <div className="card modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="section-title">Account</div>

            {justDeleted ? (
              <>
                <p className="stat-subline">Your account and data have been deleted.</p>
                <div className="bulk-actions" style={{ marginTop: "0.75rem" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      setJustDeleted(false);
                      close();
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : user ? (
              <AccountSettings
                user={user}
                unit={unit}
                onUnitChange={onUnitChange}
                attendedMatchIds={attendedMatchIds}
                homeAddresses={homeAddresses}
                fixtures={fixtures}
                signInWithMagicLink={signInWithMagicLink}
                signOut={handleSignOut}
                onClose={close}
                onAccountDeleted={() => setJustDeleted(true)}
              />
            ) : status === "sent" ? (
              <>
                <p className="stat-subline">
                  Check your email for a sign-in link — it'll sign you in on this device.
                </p>
                <div className="bulk-actions" style={{ marginTop: "0.75rem" }}>
                  <button className="btn" onClick={close}>
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="stat-subline">
                  Sign in with a magic link to save your matches and addresses to your account.
                  Guest mode keeps working either way.
                </p>
                <div className="form-row" style={{ marginTop: "0.6rem" }}>
                  <label>
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
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
                    className="btn btn-primary"
                    onClick={handleSendLink}
                    disabled={status === "sending" || email.trim() === ""}
                  >
                    {status === "sending" ? "Sending..." : "Send magic link"}
                  </button>
                  <button className="btn" onClick={close}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
