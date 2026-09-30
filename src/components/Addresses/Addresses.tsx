import { useMemo, useState } from "react";
import type { HomeAddress } from "../../types";
import { findPeriodIssues } from "../../lib/addressPeriods";
import { formatDateLong } from "../../lib/format";
import { AddressForm } from "./AddressForm";

interface Props {
  addresses: HomeAddress[];
  onChange: (addresses: HomeAddress[]) => void;
}

export function Addresses({ addresses, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<HomeAddress | null>(null);

  const issues = useMemo(() => findPeriodIssues(addresses), [addresses]);
  const hasCurrentAddress = addresses.some(
    (a) => a.toDate === null && a.id !== editingAddress?.id,
  );

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

      <div className="card">
        <div className="section-header">
          <div className="section-title">Home addresses</div>
          {!adding && !editingAddress && (
            <button className="btn btn-primary" onClick={() => setAdding(true)}>
              Add address
            </button>
          )}
        </div>
        {(adding || editingAddress) && (
          <AddressForm
            key={editingAddress?.id ?? "add"}
            onSave={handleSave}
            onCancel={handleCancelForm}
            hasCurrentAddress={hasCurrentAddress}
            initialAddress={editingAddress ?? undefined}
          />
        )}
        {addresses.length === 0 && !adding && (
          <div className="empty-state">
            No addresses yet. Add one so distances can be calculated.
          </div>
        )}
        {addresses
          .slice()
          .sort((a, b) => a.fromDate.localeCompare(b.fromDate))
          .map((addr) => (
            <div className="address-card" key={addr.id}>
              <div className="address-title">{addr.label}</div>
              <div className="address-dates">
                {formatDateLong(addr.fromDate)} &rarr;{" "}
                {addr.toDate ? formatDateLong(addr.toDate) : "present"}
              </div>
              <div className="bulk-actions" style={{ marginTop: "0.5rem", marginBottom: 0 }}>
                <button
                  className="btn"
                  onClick={() => {
                    setEditingAddress(addr);
                    setAdding(false);
                  }}
                >
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(addr.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
