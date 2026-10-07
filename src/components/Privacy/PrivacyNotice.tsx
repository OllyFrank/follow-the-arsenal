import { PRIVACY_CONTACT_EMAIL, PRIVACY_OWNER_NAME } from "../../lib/privacyNotice";

interface Props {
  onBack: () => void;
}

export function PrivacyNotice({ onBack }: Props) {
  return (
    <div className="app-main" style={{ maxWidth: 680 }}>
      <button type="button" className="link-button" onClick={onBack} style={{ marginBottom: "1rem" }}>
        ← Back
      </button>
      <h1 className="page-heading">Privacy notice</h1>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 className="section-title">Who runs this app</h2>
        <p className="stat-subline">
          We All Follow The Arsenal is run by {PRIVACY_OWNER_NAME}. For anything to do with your
          data or this notice, contact{" "}
          <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>.
        </p>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 className="section-title">What we collect, and why</h2>
        <p className="stat-subline">
          If you use guest mode, nothing leaves your browser — your matches and addresses are
          stored locally on your device only, and we never see them.
        </p>
        <p className="stat-subline" style={{ marginTop: "0.5rem" }}>
          If you create an account, we collect only what's needed to provide the service:
        </p>
        <ul className="stat-subline" style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
          <li>Your email address, to sign you in with a magic link.</li>
          <li>
            The postcode or place name, coordinates, and date range for each home address you
            add, so we can calculate how far you've travelled.
          </li>
          <li>Which matches you've marked as attended.</li>
          <li>Your units preference (miles or kilometres).</li>
        </ul>
        <p className="stat-subline" style={{ marginTop: "0.5rem" }}>
          Fixture and ground data (results, venues, dates) isn't personal data and isn't
          connected to your account in our database — it's bundled with the app itself.
        </p>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 className="section-title">Our legal basis</h2>
        <p className="stat-subline">
          We process your data under contract: you've asked us to provide this service, and we
          need this data to do that.
        </p>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 className="section-title">Who else is involved</h2>
        <ul className="stat-subline" style={{ paddingLeft: "1.2rem" }}>
          <li>
            <strong>Supabase</strong> — our database and sign-in provider, hosted in London, UK.
          </li>
          <li>
            <strong>Vercel</strong> — hosts the app itself.
          </li>
          <li>
            <strong>Our email provider</strong> — delivers the magic-link sign-in emails.
          </li>
          <li>
            <strong>postcodes.io and OpenStreetMap Nominatim</strong> — look up the location of a
            postcode or place name when you add a home address. The postcode or place name you
            enter is sent to one of these at the moment you look it up.
          </li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 className="section-title">How long we keep it</h2>
        <p className="stat-subline">
          We keep your data for as long as your account exists. If you delete your account, your
          profile, addresses and attendance are removed straight away. A copy may remain in
          Supabase's backups for a short period afterwards, until those backups expire in the
          normal course of their retention cycle.
        </p>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 className="section-title">Your rights</h2>
        <p className="stat-subline">You can, at any time, from inside the app:</p>
        <ul className="stat-subline" style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
          <li>
            <strong>See and correct</strong> your data — every field can be edited directly in the
            app.
          </li>
          <li>
            <strong>Export</strong> your data — Settings → Download my data.
          </li>
          <li>
            <strong>Delete</strong> your account and everything in it — Settings → Delete my
            account.
          </li>
        </ul>
        <p className="stat-subline" style={{ marginTop: "0.5rem" }}>
          If you'd rather we handled a request directly, email{" "}
          <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>. You also have
          the right to complain to the UK's data protection regulator, the ICO, at{" "}
          <a href="https://ico.org.uk" target="_blank" rel="noreferrer">
            ico.org.uk
          </a>
          .
        </p>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 className="section-title">Cookies and local storage</h2>
        <p className="stat-subline">
          Signing in uses only strictly necessary browser storage, to keep you signed in — nothing
          else. We don't use analytics or tracking, so there's no cookie banner. If that ever
          changes, this notice will say so.
        </p>
      </div>
    </div>
  );
}
