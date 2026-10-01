import { useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "../../lib/leafletIcons";
import { geocode } from "../../lib/geocode";
import { DraggablePin } from "../Addresses/DraggablePin";
import type { Fixture, HomeAddress } from "../../types";

interface Props {
  fixtures: Fixture[];
  homeAddresses: HomeAddress[];
  onBulkSetAttendance: (matchIds: string[], attended: boolean) => void;
  onUpdateAddresses: (addresses: HomeAddress[]) => void;
  onComplete: () => void;
}

function StepLabel({ step }: { step: number }) {
  return <div className="stat-detail">Step {step} of 3</div>;
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="card">
      <StepLabel step={1} />
      <div className="section-title">Welcome to We All Follow The Arsenal</div>
      <p>There are two things worth doing to get the most out of this:</p>
      <ul>
        <li>
          <strong>Tick off the matches you've attended</strong> on the Fixtures tab, going back
          as far as you like.
        </li>
        <li>
          <strong>Add your home address(es)</strong> on the Addresses tab, so distance and
          laps-of-the-Earth stats can be calculated.
        </li>
      </ul>
      <p>Let's get you started with both.</p>
      <div className="bulk-actions">
        <button className="btn btn-primary" onClick={onNext}>
          Get started
        </button>
      </div>
    </div>
  );
}

function SeasonTicketStep({
  fixtures,
  onBulkSetAttendance,
  onNext,
}: {
  fixtures: Fixture[];
  onBulkSetAttendance: (matchIds: string[], attended: boolean) => void;
  onNext: () => void;
}) {
  const seasons = useMemo(() => {
    const set = new Set(fixtures.map((f) => f.season));
    return [...set].sort();
  }, [fixtures]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [fromSeason, setFromSeason] = useState(seasons[0] ?? "");
  const [toSeason, setToSeason] = useState(seasons[0] ?? "");

  function toggleSeason(season: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(season)) next.delete(season);
      else next.add(season);
      return next;
    });
  }

  function addRange() {
    const fromIndex = seasons.indexOf(fromSeason);
    const toIndex = seasons.indexOf(toSeason);
    if (fromIndex === -1 || toIndex === -1) return;
    const [start, end] = fromIndex <= toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
    setSelected((prev) => {
      const next = new Set(prev);
      for (const s of seasons.slice(start, end + 1)) next.add(s);
      return next;
    });
  }

  const homeMatchIds = useMemo(
    () =>
      fixtures
        .filter((f) => selected.has(f.season) && f.venueType === "H" && !f.behindClosedDoors)
        .map((f) => f.matchId),
    [fixtures, selected],
  );

  function handleApply() {
    onBulkSetAttendance(homeMatchIds, true);
    onNext();
  }

  return (
    <div className="card">
      <StepLabel step={2} />
      <div className="section-title">Had a season ticket?</div>
      <p>
        Pick the season(s) and we'll automatically mark every home league and cup game as
        attended. You can untick individual ones afterwards from the Fixtures tab.
      </p>

      <div className="form-row">
        <label>
          From season
          <select value={fromSeason} onChange={(e) => setFromSeason(e.target.value)}>
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          To season
          <select value={toSeason} onChange={(e) => setToSeason(e.target.value)}>
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button className="btn" onClick={addRange}>
        Add range
      </button>

      <div className="section-title" style={{ marginTop: "1rem" }}>
        Or pick seasons individually
      </div>
      <div className="season-picklist">
        {seasons.map((s) => (
          <label key={s} className="season-picklist-item">
            <input
              type="checkbox"
              checked={selected.has(s)}
              onChange={() => toggleSeason(s)}
              style={{ width: "auto" }}
            />
            {s}
          </label>
        ))}
      </div>

      <div className="stat-detail" style={{ marginTop: "0.75rem" }}>
        This will mark <strong>{homeMatchIds.length}</strong> home game
        {homeMatchIds.length === 1 ? "" : "s"} as attended across{" "}
        <strong>{selected.size}</strong> season{selected.size === 1 ? "" : "s"}.
      </div>

      <div className="bulk-actions" style={{ marginTop: "0.75rem" }}>
        <button className="btn btn-primary" onClick={handleApply} disabled={selected.size === 0}>
          Mark as attended &amp; continue
        </button>
        <button className="btn" onClick={onNext}>
          Skip this step
        </button>
      </div>
    </div>
  );
}

function AddressStep({
  homeAddresses,
  onUpdateAddresses,
  onFinish,
}: {
  homeAddresses: HomeAddress[];
  onUpdateAddresses: (addresses: HomeAddress[]) => void;
  onFinish: () => void;
}) {
  const [label, setLabel] = useState("");
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [pin, setPin] = useState<[number, number] | null>(null);
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
      setError("Set when you moved in.");
      return;
    }
    onUpdateAddresses([
      ...homeAddresses,
      {
        id: crypto.randomUUID(),
        label: label || query,
        query,
        latitude: pin[0],
        longitude: pin[1],
        fromDate,
        toDate: null,
      },
    ]);
    onFinish();
  }

  return (
    <div className="card">
      <StepLabel step={3} />
      <div className="section-title">Where do you live now?</div>
      <p>This is used to calculate distance travelled to matches.</p>

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
          Since when have you lived here?
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
      </div>

      <div className="bulk-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          Save address &amp; finish
        </button>
        <button className="btn" onClick={onFinish}>
          Skip this step
        </button>
      </div>
    </div>
  );
}

export function Onboarding({
  fixtures,
  homeAddresses,
  onBulkSetAttendance,
  onUpdateAddresses,
  onComplete,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  if (step === 1) return <WelcomeStep onNext={() => setStep(2)} />;
  if (step === 2) {
    return (
      <SeasonTicketStep
        fixtures={fixtures}
        onBulkSetAttendance={onBulkSetAttendance}
        onNext={() => setStep(3)}
      />
    );
  }
  return (
    <AddressStep
      homeAddresses={homeAddresses}
      onUpdateAddresses={onUpdateAddresses}
      onFinish={onComplete}
    />
  );
}
