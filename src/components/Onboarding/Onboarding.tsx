import { Fragment, useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "../../lib/leafletIcons";
import { geocode } from "../../lib/geocode";
import { DraggablePin } from "../Addresses/DraggablePin";
import type { Fixture, HomeAddress } from "../../types";
import { Logo } from "../shared/Logo";
import { Globe } from "../shared/Globe";

interface Props {
  fixtures: Fixture[];
  homeAddresses: HomeAddress[];
  onBulkSetAttendance: (matchIds: string[], attended: boolean) => void;
  onUpdateAddresses: (addresses: HomeAddress[]) => void;
  onComplete: () => void;
}

const STOPS = [
  { n: 1, label: "Welcome" },
  { n: 2, label: "Season ticket" },
  { n: 3, label: "Home" },
] as const;

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function OnboardingProgress({ step }: { step: 2 | 3 }) {
  const dotState = (n: number) => (n < step ? "done" : n === step ? "current" : "upcoming");

  return (
    <>
      <div className="onboarding-progress-mobile">
        <div className="onboarding-progress-dots">
          {STOPS.map((s, i) => (
            <Fragment key={s.n}>
              <div className={`onboarding-dot onboarding-dot-${dotState(s.n)}`}>
                {s.n < step ? <CheckIcon /> : s.n}
              </div>
              {i < STOPS.length - 1 && (
                <div className={`onboarding-connector${s.n < step ? " done" : ""}`} />
              )}
            </Fragment>
          ))}
        </div>
        <div className="onboarding-progress-labels">
          {STOPS.map((s) => (
            <div key={s.n} className={s.n === step ? "current" : ""}>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      <div className="onboarding-progress-desktop">
        {STOPS.map((s, i) => (
          <Fragment key={s.n}>
            <div className="onboarding-progress-stop">
              <div className={`onboarding-dot onboarding-dot-${dotState(s.n)}`}>
                {s.n < step ? <CheckIcon /> : s.n}
              </div>
              <div className={`onboarding-progress-stop-label${s.n === step ? " current" : ""}`}>
                {s.label}
              </div>
            </div>
            {i < STOPS.length - 1 && (
              <div className={`onboarding-connector-vertical${s.n < step ? " done" : ""}`} />
            )}
          </Fragment>
        ))}
      </div>
    </>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="onboarding-welcome">
      <Globe variant="red" className="onboarding-welcome-globe-bg" />
      <div className="onboarding-welcome-inner">
        <div className="onboarding-welcome-top">
          <span className="logo-compact">
            <Logo variant="compact" tone="onRed" width={150} height={45} />
          </span>
          <span className="logo-long">
            <Logo variant="long" tone="onRed" width={312} height={52} />
          </span>
          <div className="onboarding-step-label">Step 1 of 3</div>
        </div>
        <div className="onboarding-welcome-columns">
          <div className="onboarding-welcome-main">
            <div className="onboarding-welcome-hero">
              <h1>How far have you followed The Arsenal?</h1>
              <p>
                Every match since 1988/89, every mile from your front door, added up into laps of
                the Earth.
              </p>
            </div>
            <div className="onboarding-welcome-points">
              <div className="onboarding-point">
                <span className="onboarding-point-num">1</span>
                <div>
                  <strong>Tick off the matches you&apos;ve attended</strong>, going back as far as
                  you like.
                </div>
              </div>
              <div className="onboarding-point">
                <span className="onboarding-point-num">2</span>
                <div>
                  <strong>Add your home address(es)</strong>, so distance and laps-of-the-Earth
                  stats can be calculated.
                </div>
              </div>
            </div>
            <div className="onboarding-welcome-cta">
              <button type="button" className="btn-onboarding-primary" onClick={onNext}>
                Get started
                <ArrowRightIcon />
              </button>
              <div className="onboarding-welcome-note">
                No sign-up. Everything is saved in this browser.
              </div>
            </div>
          </div>
          <div className="onboarding-welcome-aside">
            <Globe variant="red" className="onboarding-welcome-globe-inline" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SeasonTicketStep({
  fixtures,
  onBulkSetAttendance,
  onNext,
  onBack,
}: {
  fixtures: Fixture[];
  onBulkSetAttendance: (matchIds: string[], attended: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const seasons = useMemo(() => {
    const set = new Set(fixtures.map((f) => f.season));
    return [...set].sort();
  }, [fixtures]);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSeason(season: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(season)) next.delete(season);
      else next.add(season);
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

  const summaryLead =
    selected.size === 0
      ? "No seasons selected yet."
      : `${selected.size} season${selected.size === 1 ? "" : "s"} selected.`;
  const summaryRest =
    selected.size === 0
      ? "Tap the seasons you held a season ticket for."
      : `This will mark ${homeMatchIds.length} home game${homeMatchIds.length === 1 ? "" : "s"} as attended.`;

  return (
    <div className="onboarding-shell">
      <div className="onboarding-mobile-header">
        <div className="onboarding-mobile-header-row">
          <button
            type="button"
            className="onboarding-mobile-back"
            aria-label="Back to welcome"
            onClick={onBack}
          >
            <ChevronLeftIcon />
          </button>
          <span className="logo-compact">
            <Logo variant="compact" tone="onRed" width={160} height={48} />
          </span>
          <div className="onboarding-mobile-header-spacer" />
        </div>
        <OnboardingProgress step={2} />
      </div>

      <div className="onboarding-rail">
        <Globe variant="red" className="onboarding-rail-globe" />
        <span className="onboarding-rail-logo">
          <Logo variant="long" tone="onRed" width={230} height={69} />
        </span>
        <OnboardingProgress step={2} />
      </div>

      <div className="onboarding-content">
        <button type="button" className="onboarding-back-desktop" onClick={onBack}>
          <ChevronLeftIcon />
          Back
        </button>
        <div className="onboarding-content-inner">
          <div className="onboarding-heading">
            <h1>Had a season ticket?</h1>
            <p>
              Pick the season(s) and we&apos;ll mark every home league and cup game as attended.
              You can untick individual ones afterwards from the Fixtures tab.
            </p>
          </div>

          <div className="onboarding-chips-block">
            <div className="onboarding-chips-header">
              <div className="onboarding-chips-label">Tap your seasons</div>
              <div className="onboarding-chips-actions">
                <button
                  type="button"
                  className="onboarding-text-btn"
                  onClick={() => setSelected(new Set(seasons))}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="onboarding-text-btn"
                  onClick={() => setSelected(new Set())}
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="onboarding-chip-grid">
              {seasons.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={selected.has(s)}
                  className={`onboarding-chip${selected.has(s) ? " selected" : ""}`}
                  onClick={() => toggleSeason(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="onboarding-info-panel">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9V6h18v3a3 3 0 0 0 0 6v3H3v-3a3 3 0 0 0 0-6z" />
              <path d="M14 6v12" strokeDasharray="2 3" />
            </svg>
            <div>
              <strong>{summaryLead}</strong> {summaryRest}
            </div>
          </div>

          <div className="onboarding-actions">
            <button
              type="button"
              className="btn-onboarding-primary"
              onClick={handleApply}
              disabled={selected.size === 0}
            >
              Mark as attended &amp; continue
              <ArrowRightIcon />
            </button>
            <button type="button" className="onboarding-skip" onClick={onNext}>
              Skip this step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressStep({
  homeAddresses,
  onUpdateAddresses,
  onFinish,
  onBack,
}: {
  homeAddresses: HomeAddress[];
  onUpdateAddresses: (addresses: HomeAddress[]) => void;
  onFinish: () => void;
  onBack: () => void;
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
    <div className="onboarding-shell">
      <div className="onboarding-mobile-header">
        <div className="onboarding-mobile-header-row">
          <button
            type="button"
            className="onboarding-mobile-back"
            aria-label="Back to season ticket"
            onClick={onBack}
          >
            <ChevronLeftIcon />
          </button>
          <span className="logo-compact">
            <Logo variant="compact" tone="onRed" width={160} height={48} />
          </span>
          <div className="onboarding-mobile-header-spacer" />
        </div>
        <OnboardingProgress step={3} />
      </div>

      <div className="onboarding-rail">
        <Globe variant="red" className="onboarding-rail-globe" />
        <span className="onboarding-rail-logo">
          <Logo variant="long" tone="onRed" width={230} height={69} />
        </span>
        <OnboardingProgress step={3} />
      </div>

      <div className="onboarding-content">
        <button type="button" className="onboarding-back-desktop" onClick={onBack}>
          <ChevronLeftIcon />
          Back
        </button>
        <div className="onboarding-content-inner">
          <div className="onboarding-heading">
            <h1>Where do you live now?</h1>
            <p>This is used to calculate distance travelled to matches.</p>
          </div>

          <div className="onboarding-form">
            <div className="onboarding-field">
              <label htmlFor="ob-place">Postcode or place</label>
              <div className="onboarding-field-row">
                <input
                  id="ob-place"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. N5 1BU or Islington, London"
                />
                <button
                  type="button"
                  className="btn-onboarding-secondary"
                  onClick={handleLookup}
                  disabled={searching || query.trim() === ""}
                >
                  {searching ? "Looking up..." : "Look up"}
                </button>
              </div>
            </div>
            <div className="onboarding-field-grid">
              <div className="onboarding-field">
                <label htmlFor="ob-label">Label (optional)</label>
                <input
                  id="ob-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Home"
                />
              </div>
              <div className="onboarding-field">
                <label htmlFor="ob-since">Lived here since</label>
                <input
                  id="ob-since"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && <div className="warning-box">{error}</div>}

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

          <div className="onboarding-info-panel">
            <div className="onboarding-info-row">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 11l8-7 8 7M6 10v10h12V10" />
              </svg>
              <div className="onboarding-info-dots" />
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="var(--red)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
            </div>
            <div>
              Distance is measured in a straight line from your home to each ground. Moved over
              the years? Add earlier homes later on the Addresses tab.
            </div>
          </div>

          <div className="onboarding-actions">
            <button type="button" className="btn-onboarding-primary" onClick={handleSave}>
              Save address &amp; finish
              <ArrowRightIcon />
            </button>
            <button type="button" className="onboarding-skip" onClick={onFinish}>
              Skip this step
            </button>
          </div>
        </div>
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
        onBack={() => setStep(1)}
      />
    );
  }
  return (
    <AddressStep
      homeAddresses={homeAddresses}
      onUpdateAddresses={onUpdateAddresses}
      onFinish={onComplete}
      onBack={() => setStep(2)}
    />
  );
}
