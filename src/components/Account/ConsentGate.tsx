import { useState } from "react";

interface Props {
  onAccept: () => Promise<void>;
  onReadPrivacyNotice: () => void;
  onSignOut: () => Promise<void>;
}

// docs/ACCOUNTS_PLAN.md step 6: shown right after sign-in whenever the
// account hasn't accepted the current privacy notice version (covers both
// a brand-new sign-up and a re-prompt after the notice changes).
export function ConsentGate({ onAccept, onReadPrivacyNotice, onSignOut }: Props) {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [noticeRead, setNoticeRead] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleContinue() {
    setSubmitting(true);
    await onAccept();
  }

  return (
    <div className="app-loading">
      <div className="card" style={{ maxWidth: 400, width: "100%" }}>
        <div className="section-title">Before you continue</div>
        <p className="stat-subline">Please confirm both of these to use your account.</p>

        <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginTop: "0.9rem" }}>
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            style={{ width: "auto", marginTop: "0.2rem" }}
          />
          <span>I'm 13 or over</span>
        </label>

        <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginTop: "0.6rem" }}>
          <input
            type="checkbox"
            checked={noticeRead}
            onChange={(e) => setNoticeRead(e.target.checked)}
            style={{ width: "auto", marginTop: "0.2rem" }}
          />
          <span>
            I've read the{" "}
            <button
              type="button"
              onClick={onReadPrivacyNotice}
              style={{
                background: "none",
                border: 0,
                padding: 0,
                font: "inherit",
                color: "var(--navy)",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              privacy notice
            </button>
          </span>
        </label>

        <div className="bulk-actions" style={{ marginTop: "1rem" }}>
          <button
            className="btn btn-primary"
            onClick={handleContinue}
            disabled={!ageConfirmed || !noticeRead || submitting}
          >
            {submitting ? "Saving…" : "Continue"}
          </button>
          <button className="btn" onClick={onSignOut} disabled={submitting}>
            Sign out instead
          </button>
        </div>
      </div>
    </div>
  );
}
