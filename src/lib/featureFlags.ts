// Lets the accounts feature (docs/ACCOUNTS_PLAN.md) ship to production
// without going live there yet. true on staging/local; left unset (false)
// in Vercel's Production env vars until launch.
export const ACCOUNTS_ENABLED = import.meta.env.VITE_ACCOUNTS_ENABLED === "true";
