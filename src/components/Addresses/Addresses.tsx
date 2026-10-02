import { useMemo, useState } from "react";
import type { HomeAddress } from "../../types";
import { findPeriodIssues } from "../../lib/addressPeriods";
import { formatMonthYear } from "../../lib/format";
import { LockIcon } from "../shared/LockIcon";
import { AddressForm } from "./AddressForm";

interface Props {
  addresses: HomeAddress[];
  onChange: (addresses: HomeAddress[]) => void;
}

function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" />
    </svg>
  );
}

export function Addresses({ addresses, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<HomeAddress | null>(null);

  const issues = useMemo(() => findPeriodIssues(addresses), [addresses]);
  const hasCurrentAddress = addresses.some(
    (a) => a.toDate === null && a.id !== editingAddress?.id,
  );
  const formOpen = adding || editingAddress !== null;

  const sorted = useMemo(
    () => addresses.slice().sort((a, b) => b.fromDate.localeCompare(a.fromDate)),
    [addresses],
  );

  function startAdding() {
    setAdding(true);
    setEditingAddress(null);
  }

  function handleSave(address: HomeAddress) {
    if (editingAddress) {
      onChange(addresses.map((a) => (a.id === address.id ? address : a)));
    } else {
      onChange([...addresses, address]);
    }
    setAdding(false);
    setEditingAddress(null);
  }

  function handleCancelForm() {
    setAdding(false);
    setEditingAddress(null);
  }

  function handleDelete(id: string) {
    onChange(addresses.filter((a) => a.id !== id));
  }

  return (
    <div>
      {issues.length > 0 && (
        <div className="warning-box">
          {issues.map((issue, i) => (
            <div key={i}>
              {issue.type === "gap"
                ? `${issue.days}-day gap between "${issue.a.label}" and "${issue.b.label}" — matches in that window won't count toward distance.`
                : `"${issue.a.label}" and "${issue.b.label}" have overlapping date ranges.`}
            </div>
          ))}
        </div>
      )}

      <div className="addresses-page">
        <div className="addresses-intro">
          <div className="addresses-heading-row">
            <h1 className="addresses-heading">Home addresses</h1>
            {!formOpen && (
              <button className="btn btn-primary addresses-add-inline" onClick={startAdding}>
                <PlusIcon size={16} />
                Add address
              </button>
            )}
          </div>
          <p className="addresses-lede">
            Each match is measured from wherever you were living at the time.
          </p>
          {!formOpen && (
            <button className="btn btn-primary addresses-add-block" onClick={startAdding}>
              <PlusIcon size={18} />
              Add address
            </button>
          )}
          <div className="autosave-notice addresses-note-top">
            <LockIcon />
            <div>Addresses are stored in this browser only.</div>
          </div>
        </div>

        <div className="addresses-timeline-col">
          {formOpen && (
            <AddressForm
              key={editingAddress?.id ?? "add"}
              onSave={handleSave}
              onCancel={handleCancelForm}
              hasCurrentAddress={hasCurrentAddress}
              initialAddress={editingAddress ?? undefined}
            />
          )}

          {addresses.length === 0 && !adding ? (
            <div className="empty-state">
              No addresses yet. Add one so distances can be calculated.
            </div>
          ) : (
            <ol className="address-timeline">
              {sorted.map((addr) => {
                const isCurrent = addr.toDate === null;
                const showPlace = addr.query.trim() !== addr.label.trim();
                return (
                  <li className="address-timeline-item" key={addr.id}>
                    <div className="address-dot-col">
                      <div className={`address-dot${isCurrent ? " address-dot-current" : ""}`} />
                      <div className="address-connector" />
                    </div>
                    <div className="address-card">
                      <div className="address-card-main">
                        <div className="address-card-title-row">
                          <div className="address-card-label">{addr.label}</div>
                          {isCurrent && <span className="address-current-tag">Current</span>}
                        </div>
                        {showPlace && <div className="address-card-place">{addr.query}</div>}
                        <div className="address-card-range">
                          {isCurrent
                            ? `Since ${formatMonthYear(addr.fromDate)}`
                            : `${formatMonthYear(addr.fromDate)} – ${formatMonthYear(addr.toDate!)}`}
                        </div>
                      </div>
                      <div className="address-card-actions">
                        <button
                          className="icon-button"
                          aria-label={`Edit ${addr.label}`}
                          onClick={() => {
                            setEditingAddress(addr);
                            setAdding(false);
                          }}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="icon-button icon-button-muted"
                          aria-label={`Remove ${addr.label}`}
                          onClick={() => handleDelete(addr.id)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
              <li className="address-timeline-item address-timeline-item-add">
                <div className="address-dot-col">
                  <div className="address-dot address-dot-hollow" />
                </div>
                {!formOpen && (
                  <button className="add-earlier-button" onClick={startAdding}>
                    <PlusIcon size={16} />
                    Add an earlier home
                  </button>
                )}
              </li>
            </ol>
          )}

          <div className="autosave-notice addresses-note-bottom">
            <LockIcon />
            <div>Addresses are stored in this browser only.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
