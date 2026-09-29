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

  const issues = useMemo(() => findPeriodIssues(addresses), [addresses]);
  const hasCurrentAddress = addresses.some((a) => a.toDate === null);

  function handleSave(address: HomeAddress) {
    onChange([...addresses, address]);
    setAdding(false);
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
        <div className="section-title">Home addresses</div>
        {addresses.length === 0 && (
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
              <button
                className="btn btn-danger"
                style={{ marginTop: "0.5rem" }}
                onClick={() => handleDelete(addr.id)}
              >
                Remove
              </button>
            </div>
          ))}
      </div>

      {adding ? (
        <div style={{ marginTop: "1rem" }}>
          <AddressForm
            onSave={handleSave}
            onCancel={() => setAdding(false)}
            hasCurrentAddress={hasCurrentAddress}
          />
        </div>
      ) : (
        <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => setAdding(true)}>
          Add address
        </button>
      )}
    </div>
  );
}
