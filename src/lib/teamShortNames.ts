// Short names for clubs whose full name is long enough to threaten the
// single-line match rows in the badge logbook (card faces and the detail
// dialog's tier ladder) — used only there, via matchScoreLine(); the
// Fixtures and Stats tabs always show the full name. Conventional
// shorthand (as used in football score tickers), not slang.
export const TEAM_SHORT_NAMES: Record<string, string> = {
  "Bayern Munich": "Bayern",
  "Athletic Bilbao": "Ath Bilbao",
  "Vorskla Poltava": "Vorskla",
  "Atletico Madrid": "Atletico",
  "AFC Bournemouth": "Bournemouth",
  "Twente Enschede": "Twente",
  "Carlisle United": "Carlisle",
  "Birmingham City": "Birmingham",
  "Shrewsbury Town": "Shrewsbury",
  "Oldham Athletic": "Oldham",
  "Manchester City": "Man City",
  "Plymouth Argyle": "Plymouth",
  "West Ham United": "West Ham",
  "Steaua Bucharest": "Steaua",
  "Doncaster Rovers": "Doncaster",
  "Rotherham United": "Rotherham",
  "Lokomotiv Moscow": "Lokomotiv",
  "Farnborough Town": "Farnborough",
  "Bayer Leverkusen": "Leverkusen",
  "Shakhtar Donetsk": "Shakhtar",
  "Bolton Wanderers": "Bolton",
  "Blackburn Rovers": "Blackburn",
  "Cambridge United": "Cambridge",
  "Sheffield United": "Sheff Utd",
  "Newcastle United": "Newcastle",
  "Red Star Belgrade": "Red Star",
  "Partizan Belgrade": "Partizan",
  "Borussia Dortmund": "Dortmund",
  "Preston North End": "Preston",
  "Hartlepool United": "Hartlepool",
  "Huddersfield Town": "Huddersfield",
  "Charlton Athletic": "Charlton",
  "Manchester United": "Man Utd",
  "Nottingham Forest": "Nottm Forest",
  "Tottenham Hotspur": "Tottenham",
  "Ludogorets Razgrad": "Ludogorets",
  "Eintracht Frankfurt": "Frankfurt",
  "Deportivo La Coruna": "Deportivo",
  "Paris Saint-Germain": "PSG",
  "Queens Park Rangers": "QPR",
  "Sheffield Wednesday": "Sheff Wed",
  "Vitoria de Guimaraes": "Guimaraes",
  "West Bromwich Albion": "West Brom",
  "Brighton & Hove Albion": "Brighton",
  "Wolverhampton Wanderers": "Wolves",
  "Borussia Monchengladbach": "Gladbach",
};

/** Falls back to the full name for anything not in the table (every name
 * short enough not to need one). */
export function shortTeamName(name: string): string {
  return TEAM_SHORT_NAMES[name] ?? name;
}
