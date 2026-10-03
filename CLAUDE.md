# We All Follow The Arsenal — Project Brief

A personal, single-user web app that lets an Arsenal fan mark which matches they attended since 1988/89, then calculates how far they travelled and shows stats about the games they saw.

## Scope
- **In:** single user, runs locally, data stored in the browser, straight-line distances, all completed fixtures 1988/89 → 2025/26.
- **Out (for now):** accounts, road/travel-mode distances, upcoming fixtures, sharing. No official Arsenal branding, crests or logos.

## Suggested stack
Vite + React + TypeScript. Leaflet with OpenStreetMap tiles for maps. State saved in IndexedDB or localStorage, with **JSON export/import** as a backup. The owner is a product manager, not a developer: keep the code simple and explain setup steps.

## Data (source: `We_All_Follow_The_Arsenal_Data.xlsx`)
Write a one-off script to convert the workbook to `fixtures.json` and `grounds.json`, bundled with the app.
- **Fixtures (2,101 rows):** Match ID, Date, Season, Competition, Stage, Home team, Away team, Opponent, H/A/N, Ground ID, Venue, Arsenal goals, Opponent goals, Result (W/D/L), Penalty shoot-out, Behind closed doors (Y), Counts in record (Y/N), Notes.
- **Grounds (180 rows):** Ground ID, Ground, Also known as, Used by, Country, Latitude, Longitude, Confidence.
- **Season** is a stored field. Never derive it from the date (2019/20 ran into August 2020).
- **Result** already treats penalty shoot-outs as draws. The shoot-out column is for display only.
- **Behind closed doors** matches cannot be marked as attended.
- **Counts in record = N** (the voided 1999 Sheffield United game) can be attended and counts for distance and grounds, but is excluded from every result- or score-based stat.

## User inputs
1. **Home addresses:** one or more, each with a *from* and *to* date. UK postcodes are looked up via postcodes.io (which also handles discontinued postcodes). Anything else goes through OpenStreetMap Nominatim. Show a draggable map pin to confirm, then store the lat/long. Warn about gaps or overlaps between periods.
2. **Attendance:** a large, tappable "Attended" toggle on every match, not a small checkbox.

## Fixture screen
- Matches listed by season. The season filter defaults to the latest season.
- Per-season bulk actions: **"Tick all home games"** and **"Select all"** (then untick the misses).
- Each match shows date, teams, score (plus shoot-out if any), competition/stage and venue.
- **"Can't remember?"** link opens a Google search in a new tab, e.g. `Arsenal v Chelsea 17 May 2014 3-2`.
- Behind-closed-doors matches are greyed out and disabled. The voided match shows a "Voided" badge.

## Distance rules
- Origin is the home address whose period covers the match date. If none covers it, flag the match and leave it out of distance totals.
- Distance is the haversine straight-line distance from home to ground, **× 2 for a return trip**.
- Show miles by default with a km toggle.

## Stats dashboard (overall, with a season filter)
- **Distance:** total, per season, and laps of the Earth (40,075 km / 24,901 mi).
- **Furthest single trip:** the match, the ground, and the one-way distance (distance totals elsewhere are return-trip, but there's no breakdown shown, so the one-way figure is the more interesting number here).
- **Grounds:** a map of grounds visited, total grounds visited (distinct Ground IDs), and grounds ranked by visits.
- **Top opponents:** most-seen opponents, home and away combined.
- **Record:** overall W-D-L and win %, plus home and away records (H/A from the fixture, neutral counts in overall only).
- **Lucky charm:** win % at attended matches vs. missed matches (excluding behind-closed-doors).
- **Biggest win and biggest loss seen:** by goal margin, tie-break on goals scored.
- **Highest-scoring match seen:** by total goals.
- **Goals seen:** total goals, and Arsenal goals.
- **Longest unbeaten run seen:** consecutive attended matches without a defeat.
- **Longest gap:** longest gap between attended games, measured in matches missed (not calendar days — a day-based gap is always the close season for a regular matchgoer), showing the two matches either side.
- **Matches by competition:** a breakdown using the Competition column.
- **Finals:** finals attended, final wins and win %. A final is a Stage of "Final" or "Final Replay". Community/Charity Shields are excluded. A final won on penalties counts as a win here, since this stat is about lifting the trophy.
- **Best seasons:** three independent bests, each its own season and figure — most matches attended, most wins seen, and most Arsenal goals seen (the voided match counts toward attendance but not wins or goals, as above).
- **Monthly attendance heatmap:** attended-match counts by calendar month, August to May. Only append June (and any later month) as a column when the current scope actually has fixtures that month, whether or not any of them are attendable — e.g. the COVID-delayed 2019/20 run-in puts fixtures in June and July, so those columns appear (reading zero, since all of them are behind closed doors).

## Look and feel
Arsenal-inspired but unofficial: red (#DB0007), white, with a navy or gold accent, bold blocky sans-serif headings, and a clean, mobile-friendly layout.

## Verifying changes
Before calling any UI/frontend change done, start the dev server (`npm run dev`) and check it in Chrome using claude-in-chrome. Don't skip this because the browser has no real attendance data — seed a handful of matches into localStorage with the javascript_tool first if the check needs data to be meaningful. Pushing to `main` still needs the user's go-ahead each time; this verification step doesn't change that.

## Build order
1. Convert the data and render the fixture list with a season filter.
2. Attendance toggles and bulk actions, persisted locally.
3. Home addresses with lookup, pin confirmation and date ranges.
4. Distance calculation and totals.
5. Stats dashboard and ground map.
6. Export/import backup, then polish the theme.
