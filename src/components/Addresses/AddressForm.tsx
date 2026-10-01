import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "../../lib/leafletIcons";
import { geocode } from "../../lib/geocode";
import type { HomeAddress } from "../../types";
import { DraggablePin } from "./DraggablePin";

interface Props {
  onSave: (address: HomeAddress) => void;
  onCancel: () => void;
  /** Whether an address with no end date (an ongoing "current" address) already exists. */
  hasCurrentAddress: boolean;
  /** When set, the form edits this address in place instead of creating a new one. */
  initialAddress?: HomeAddress;
}

export function AddressForm({ onSave, onCancel, hasCurrentAddress, initialAddress }: Props) {
  const [label, setLabel] = useState(initialAddress?.label ?? "");
  const [query, setQuery] = useState(initialAddress?.query ?? "");
  const [fromDate, setFromDate] = useState(initialAddress?.fromDate ?? "");
  const [toDate, setToDate] = useState(initialAddress?.toDate ?? "");
  // Only default to "current" when nothing else is already marked current —
  // otherwise every new address would silently claim to be the current one.
  const [ongoing, setOngoing] = useState(
    initialAddress ? initialAddress.toDate === null : !hasCurrentAddress,
  );
  const [pin, setPin] = useState<[number, number] | null>(
    initialAddress ? [initialAddress.latitude, initialAddress.longitude] : null,
  );
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup() {
    setError(null);
    setSearching(true);
    try {
      const result = await geocode(query);
      if (!result) {
        setError("Couldn't find that location. Try a full postcode or place name.");
        return;
      }
      setPin([result.latitude, result.longitude]);
      if (!label) setLabel(result.label);
    } catch {
      setError("Lookup failed. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }

  function handleSave() {
    if (!pin) {
      setError("Confirm a location on the map first.");
      return;
    }
    if (!fromDate) {
      setError("Set a from date.");
      return;
    }
    onSave({
      id: initialAddress?.id ?? crypto.randomUUID(),
      label: label || query,
      query,
      latitude: pin[0],
      longitude: pin[1],
      fromDate,
      toDate: ongoing ? null : toDate || null,
    });
  }

  return (
    <div className="card" style={{ marginBottom: "1rem" }}>
      <div className="section-title">{initialAddress ? "Edit home address" : "Add home address"}</div>

      <div className="form-row">
        <label>
          Postcode or place
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. N5 1BU or Islington, London"
          />
        </label>
        <label>
          Label (optional)
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home" />
        </label>
      </div>

      <button className="btn" onClick={handleLookup} disabled={searching || query.trim() === ""}>
        {searching ? "Looking up..." : "Look up"}
      </button>

      {error && <div className="warning-box" style={{ marginTop: "0.6rem" }}>{error}</div>}

      {pin && (
        <div className="map-preview">
          <MapContainer center={pin} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggablePin position={pin} onMove={setPin} />
          </MapContainer>
        </div>
      )}

      <div className="form-row" style={{ marginTop: "0.6rem" }}>
        <label>
          From
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label>
          To
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            disabled={ongoing}
          />
        </label>
        <label style={{ flexDirection: "row", alignItems: "center", gap: "0.4rem" }}>
          <input
            type="checkbox"
            checked={ongoing}
            onChange={(e) => setOngoing(e.target.checked)}
            style={{ width: "auto" }}
          />
          Current address
        </label>
      </div>

      <div className="bulk-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          {initialAddress ? "Save changes" : "Save address"}
        </button>
        <button className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
