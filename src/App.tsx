import { useMemo, useState } from "react";
import fixturesData from "./data/fixtures.json";
import groundsData from "./data/grounds.json";
import type { Fixture, Ground } from "./types";
import { useAppState } from "./hooks/useAppState";
import { computeStats } from "./lib/stats";
import { formatDistance } from "./lib/format";
import { FixtureList } from "./components/FixtureList/FixtureList";
import { Addresses } from "./components/Addresses/Addresses";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Onboarding } from "./components/Onboarding/Onboarding";
import { Logo } from "./components/shared/Logo";
import { FixturesIcon, AddressesIcon, StatsIcon } from "./components/shared/NavIcons";

const fixtures = fixturesData as Fixture[];
const grounds = groundsData as Ground[];

type Tab = "fixtures" | "addresses" | "stats";

const TABS: { id: Tab; label: string; Icon: () => React.JSX.Element }[] = [
  { id: "fixtures", label: "Fixtures", Icon: FixturesIcon },
  { id: "addresses", label: "Addresses", Icon: AddressesIcon },
  { id: "stats", label: "Stats", Icon: StatsIcon },
];

function App() {
  const [tab, setTab] = useState<Tab>("fixtures");
  const [unit, setUnit] = useState<"mi" | "km">("mi");
  const {
    attendedMatchIds,
    homeAddresses,
    onboardingComplete,
    toggleAttendance,
    bulkSetAttendance,
    updateAddresses,
    finishOnboarding,
  } = useAppState();

  const groundsById = useMemo(() => new Map(grounds.map((g) => [g.groundId, g])), []);

  // All-seasons total, independent of whatever season filter the Stats tab
  // currently has selected — the header chip always shows the full figure.
  const totalDistanceKm = useMemo(
    () => computeStats(fixtures, grounds, [...attendedMatchIds], homeAddresses).distance.totalKm,
    [attendedMatchIds, homeAddresses],
  );

  if (!onboardingComplete) {
    return (
      <Onboarding
        fixtures={fixtures}
        homeAddresses={homeAddresses}
        onBulkSetAttendance={bulkSetAttendance}
        onUpdateAddresses={updateAddresses}
        onComplete={finishOnboarding}
      />
    );
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <span className="logo-compact">
            <Logo variant="compact" tone="onRed" width={170} height={51} />
          </span>
          <span className="logo-long">
            <Logo variant="long" tone="onRed" width={336} height={56} />
          </span>

          <nav className="tabs" aria-label="Main">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`tab${tab === id ? " active" : ""}`}
                aria-current={tab === id ? "page" : undefined}
                onClick={() => setTab(id)}
              >
                <Icon />
                {label}
              </button>
            ))}
          </nav>

          <div className="mileage-chip">
            <div className="mileage-chip-value">{formatDistance(totalDistanceKm, unit)}</div>
            <div className="mileage-chip-label">travelled so far</div>
          </div>
        </div>
      </header>
      <main className="app-main">
        {tab === "fixtures" && (
          <FixtureList
            fixtures={fixtures}
            groundsById={groundsById}
            attendedMatchIds={attendedMatchIds}
            onToggleAttendance={toggleAttendance}
            onBulkSetAttendance={bulkSetAttendance}
          />
        )}
        {tab === "addresses" && <Addresses addresses={homeAddresses} onChange={updateAddresses} />}
        {tab === "stats" && (
          <Dashboard
            fixtures={fixtures}
            grounds={grounds}
            attendedMatchIds={attendedMatchIds}
            addresses={homeAddresses}
            unit={unit}
            onUnitChange={setUnit}
          />
        )}
      </main>
    </>
  );
}

export default App;
