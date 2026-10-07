import { useState } from "react";
import { AccountIcon, CloseIcon } from "../shared/NavIcons";

// Shown instead of <Account /> whenever ACCOUNTS_ENABLED is false (see
// lib/featureFlags.ts) — the icon stays visible so people know it's coming,
// but nothing behind it touches Supabase.
export function AccountComingSoon() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="account-trigger"
        aria-label="Account"
        onClick={() => setOpen(true)}
      >
        <AccountIcon />
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="card modal-panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </button>
            <div className="section-title">Accounts</div>
            <p className="stat-subline">
              Accounts are coming soon. For now, everything's saved locally in this browser.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
