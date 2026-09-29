# We All Follow The Arsenal

A personal app to track which Arsenal matches you've attended since 1988/89, and see stats about the games you've seen: distance travelled, grounds visited, your record, and more.

Everything is stored in your browser only (no accounts, no server) — use the Backup section to export a JSON file as a safety copy.

## Running it

You need Node.js installed (already set up on this machine). From this folder:

```
npm install      # first time only, or after pulling changes
npm run dev
```

Then open the URL it prints (usually http://localhost:5173) in your browser.

To stop the app, go back to the terminal window running it and press `Ctrl+C`.

## If the match data changes

The fixture/ground data lives in `We_All_Follow_The_Arsenal_Data_Final.xlsx`. If you update that spreadsheet, regenerate the app's data files with:

```
npm run convert-data
```

This rewrites `src/data/fixtures.json` and `src/data/grounds.json` from the spreadsheet.

## Project layout

- `src/data/` — generated fixture and ground data (don't hand-edit; edit the spreadsheet and re-run `convert-data`)
- `src/lib/` — the actual logic: distance calculations, stats, storage, geocoding
- `src/components/` — the three screens: Fixtures, Addresses, Stats
- `scripts/convert-data.ts` — the spreadsheet-to-JSON converter

## Backing up your data

Your attendance and home addresses live in your browser's local storage, which persists across restarts but is tied to this browser on this machine. Use **Addresses → Export backup** regularly, especially before clearing browser data or switching machines. **Import backup** restores from that file.
