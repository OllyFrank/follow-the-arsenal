import { useMemo, useState } from "react";
import fixturesData from "./data/fixtures.json";
import groundsData from "./data/grounds.json";
import managersData from "./data/managers.json";
import type { Fixture, Ground, Manager } from "./types";
import { useAppState } from "./hooks/useAppState";
import { useAuth } from "./hooks/useAuth";
import { useCloudAppState } from "./hooks/useCloudAppState";
import { useCloudUnits } from "./hooks/useCloudUnits";
import { useCloudConsent } from "./hooks/useCloudConsent";
import { computeStats } from "./lib/stats";
import { formatDistance } from "./lib/format";
import { FixtureList } from "./components/FixtureList/FixtureList";
import { Addresses } from "./components/Addresses/Addresses";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Onboarding } from "./components/Onboarding/Onboarding";
import { Logo } from "./components/shared/Logo";
import { Account } from "./components/Account/Account";
import { AccountComingSoon } from "./components/Account/AccountComingSoon";
import { GuestDataMigrationPrompt } from "./components/Account/GuestDataMigrationPrompt";
import { ConsentGate } from "./components/Account/ConsentGate";
import { PrivacyNotice } from "./components/Privacy/PrivacyNotice";
import { ACCOUNTS_ENABLED } from "./lib/featureFlags";
import { FixturesIcon, AddressesIcon, StatsIcon } from "./components/shared/NavIcons";

const fixtures = fixturesData as Fixture[];
const grounds = groundsData as Ground[];
const managers = managersData as Manager[];

type Tab = "fixtures" | "addresses" | "stats";

const TABS: { id: Tab; label: string; Icon: () => React.JSX.Element }[] = [
  { id: "fixtures", label: "Fixtures", Icon: FixturesIcon },
  { id: "addresses", label: "Addresses", Icon: AddressesIcon },
  { id: "stats", label: "Stats", Icon: StatsIcon },
];

function App() {
  const [tab, setTab] = useState<Tab>("fixtures");
  const [guestUnit, setGuestUnit] = useState<"mi" | "km">("mi");

  const auth = useAuth();
  const guestState = useAppState();
  const cloudState = useCloudAppState(auth.user?.id ?? null);
  const cloudUnits = useCloudUnits(auth.user?.id ?? null);
  const cloudConsent = useCloudConsent(auth.user?.id ?? null);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Guest mode is untouched: signed out, nothing here changes. Signed in,
  // Supabase is the source of truth for attendance, addresses and units —
  // but onboarding-seen is a per-device flag, not user data, so it (and
  // finishing it) always goes through the local guest state regardless.
  const signedIn = auth.user !== null;
  const { attendedMatchIds, homeAddresses, toggleAttendance, bulkSetAttendance, updateAddresses } =
    signedIn ? cloudState : guestState;
  const { onboardingComplete, finishOnboarding } = guestState;
  const unit = signedIn ? cloudUnits.unit : guestUnit;
  const setUnit = signedIn ? cloudUnits.setUnit : setGuestUnit;

  // Step 4: offer to upload this device's guest data once, per app load,
  // the first time there's both a session and some guest data to offer.
  const [migrationDismissed, setMigrationDismissed] = useState(false);
  const hasGuestData = guestState.attendedMatchIds.size > 0 || guestState.homeAddresses.length > 0;
  const showMigrationPrompt =
    signedIn && cloudState.loaded && hasGuestData && !migrationDismissed;

  const groundsById = useMemo(() => new Map(grounds.map((g) => [g.groundId, g])), []);

  // All-seasons total, independent of whatever season filter the Stats tab
  // currently has selected — the header chip always shows the full figure.
  const totalDistanceKm = useMemo(
    () => computeStats(fixtures, grounds, [...attendedMatchIds], homeAddresses).distance.totalKm,
    [attendedMatchIds, homeAddresses],
  );

  if (
    auth.loading ||
    (signedIn && (!cloudState.loaded || !cloudUnits.loaded || !cloudConsent.loaded))
  ) {
    return (
      <div className="app-loading">
        <p>Loading…</p>
      </div>
    );
  }

  if (showPrivacy) {
    return <PrivacyNotice onBack={() => setShowPrivacy(false)} />;
  }

  if (signedIn && cloudConsent.needsConsent) {
    return (
      <ConsentGate
        onAccept={cloudConsent.accept}
        onReadPrivacyNotice={() => setShowPrivacy(true)}
        onSignOut={auth.signOut}
      />
    );
  }

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
      {showMigrationPrompt && (
        <GuestDataMigrationPrompt
          guestMatchIds={guestState.attendedMatchIds}
          guestAddresses={guestState.homeAddresses}
          cloudMatchIds={cloudState.attendedMatchIds}
          cloudAddresses={cloudState.homeAddresses}
          onBulkSetAttendance={cloudState.bulkSetAttendance}
          onUpdateAddresses={cloudState.updateAddresses}
          onClearGuestData={guestState.clearData}
          onDismiss={() => setMigrationDismissed(true)}
        />
      )}
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

          {ACCOUNTS_ENABLED ? (
            <Account
              user={auth.user}
              loading={auth.loading}
              signInWithMagicLink={auth.signInWithMagicLink}
              signOut={auth.signOut}
              unit={unit}
              onUnitChange={setUnit}
              attendedMatchIds={attendedMatchIds}
              homeAddresses={homeAddresses}
              fixtures={fixtures}
            />
          ) : (
            <AccountComingSoon />
          )}
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
            managers={managers}
            attendedMatchIds={attendedMatchIds}
            addresses={homeAddresses}
            unit={unit}
            onUnitChange={setUnit}
          />
        )}
      </main>
      <footer className="app-footer">
        <button type="button" className="link-button" onClick={() => setShowPrivacy(true)}>
          Privacy notice
        </button>
      </footer>
    </>
  );
}

export default App;
