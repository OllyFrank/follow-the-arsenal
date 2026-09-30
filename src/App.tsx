import { useMemo, useState } from "react";
import fixturesData from "./data/fixtures.json";
import groundsData from "./data/grounds.json";
import type { Fixture, Ground } from "./types";
import { useAppState } from "./hooks/useAppState";
import { FixtureList } from "./components/FixtureList/FixtureList";
import { Addresses } from "./components/Addresses/Addresses";
import { Dashboard } from "./components/Dashboard/Dashboard";

const fixtures = fixturesData as Fixture[];
const grounds = groundsData as Ground[];

type Tab = "fixtures" | "addresses" | "stats";

function App() {
  const [tab, setTab] = useState<Tab>("fixtures");
  const {
    attendedMatchIds,
    homeAddresses,
    toggleAttendance,
    bulkSetAttendance,
    updateAddresses,
  } = useAppState();

  const groundsById = useMemo(() => new Map(grounds.map((g) => [g.groundId, g])), []);

  return (
    <>
      <header className="app-header">
        <h1>We All Follow The Arsenal</h1>
        <nav className="tabs">
          <button
            className={`tab${tab === "fixtures" ? " active" : ""}`}
            onClick={() => setTab("fixtures")}
          >
            Fixtures
          </button>
          <button
            className={`tab${tab === "addresses" ? " active" : ""}`}
            onClick={() => setTab("addresses")}
          >
            Addresses
          </button>
          <button
            className={`tab${tab === "stats" ? " active" : ""}`}
            onClick={() => setTab("stats")}
          >
            Stats
          </button>
        </nav>
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
        {tab === "addresses" && (
          <Addresses addresses={homeAddresses} onChange={updateAddresses} />
        )}
        {tab === "stats" && (
          <Dashboard
            fixtures={fixtures}
            grounds={grounds}
            attendedMatchIds={attendedMatchIds}
            addresses={homeAddresses}
          />
        )}
      </main>
    </>
  );
}

export default App;
