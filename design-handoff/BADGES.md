# Badges tab: logbook redesign

This is a brief for Claude Code. It replaces the current Badges tab UI (`src/components/Badges/`) with a "logbook" the user fills with collectible badges. Read `HANDOFF.md` first: tokens, fonts, the scarf logo, the header and navigation all come from there.

The designs are on the canvas; `reference/` holds their source (files listed at the end). Every number, match and date in them is sample data from running the app's own badge engine on an invented attendance history. Never hard-code any of it.

## Ground rules

- **Keep the badge engine.** `src/lib/badges.ts`, `badgeEngine.ts`, `badgeReference.ts` and `badgeTierColor.ts` stay the source of truth, and their tests must still pass. The only engine additions are the small helpers listed under "Logic changes".
- No crests, logos or kit designs for Arsenal or any other club. Stadium art is generic, drawn as simple line illustrations (see `reference/StadiumCard.dc.html`); never use photos or club marks.
- Work on a feature branch and check the preview link on mobile and desktop before merging (ACCOUNTS_PLAN.md, section 0).

## Before you start

Read the current Badges components and `docs/BADGES_PLAN.md`, then report back before editing:

- Which current components can be reused or restyled and which should be replaced.
- Anything in this brief that conflicts with how the engine behaves. Say so rather than guessing.

## How the page works

**Mobile (below 768px): one logbook page at a time.** Under the page title ("Your logbook" over "Badges", with the total collected at the right) sits a row of four divider tabs: Attendance, Grounds, Europe, History, each with its badge count. The selected tab is white with a 3px red top edge and joins the page below it; the others are `#e6e9f0`. Tabs are real links or a proper tablist, and the selected tab is kept in the URL hash so it survives a refresh and the back button.

**Desktop (768px and up): all four pages stacked**, each a separate panel, with jump links (pill buttons with counts) beside the title. Cards sit in a grid of `repeat(auto-fill, minmax(160px, 1fr))`, which gives six across at 1200px.

**Each page** is a white panel styled like a ruled exercise book: 1px `--line` border, faint horizontal rules every 32px (`#eef1f6`), and a thin light-red margin line (`#f3c4c6`) down the left. At the top: "Page N of 4" in small caps, the section heading, one line of description, and the section's badge count.

The bottom navigation gains a fourth item, **Badges**, with a medal icon; desktop header tabs gain it too.

## Badge cards

Every badge is a portrait collectible card, 324px tall, width from the grid (about 150px on mobile, 165px on desktop). The name and the match line are each clamped to two lines so nothing can push the footer out of the card.

**Tiered card** (`reference/BadgeCard.dc.html`), top to bottom:

1. Tier chip (e.g. "Gold") on the tier's accent colour, with the set name at the right ("Attendance").
2. Emblem: a 58px ring in the tier's metal gradient around a 45px disc in the accent colour, holding the badge's white line icon.
3. Badge name in Archivo Black caps, then the milestone reached in big navy figures, with its unit on its own line below ("250" / "matches"). Keep the unit on one line, truncating with an ellipsis if needed.
4. Below a dashed rule: "Reached at", the match where the tier was crossed, and its date. This is `progress.earningMatch`.
5. Navy footer that **counts down**: the number still needed, "{unit} to go", and "Next: {next tier}". For example "85 · matches to go · Next: 500". The number is `nextThreshold − current`. Use the singular unit when it is 1 ("1 season to go"). At the top tier the footer says "Top of the ladder" instead.

Only the current tier is shown, one card per badge, as the engine already does.

**Tier colour scale.** Every tier gets its own material, so no two tiers of a badge look alike. The scale is a fixed ladder of seven materials followed by Legendary. A badge's tier at index *i* (0 = its first tier) uses ladder step *i*, and its top tier always uses Legendary.

| Step | Tier | Frame gradient (135°) | Accent |
|---|---|---|---|
| 1 | Bronze | `#6e4119 0%, #e0a971 42%, #9a6533 58%, #6e4119 100%` | `#8a5a2b` |
| 2 | Silver | `#66717d 0%, #f1f3f6 42%, #a7b0ba 58%, #66717d 100%` | `#5f6b78` |
| 3 | Gold | `#8a6414 0%, #f6dc8e 42%, #c99b3f 58%, #8a6414 100%` | `#8a6414` |
| 4 | Platinum | `#3e5874 0%, #e9f0f7 42%, #9fb3c8 58%, #3e5874 100%` | `#3e5874` |
| 5 | Ruby | `#3d0510 0%, #e0718a 42%, #8a1026 58%, #3d0510 100%` | `#7a0f22` |
| 6 | Onyx | `#0b0b0e 0%, #74747c 42%, #2a2a30 58%, #0b0b0e 100%` | `#1f1f24` |
| 7 | Diamond | `#2a6f86 0%, #f2fbff 35%, #bfe8f5 50%, #f2fbff 62%, #2a6f86 100%` | `#24647a` |
| Top | Legendary | `#6e0007 0%, #db0007 30%, #f6dc8e 50%, #db0007 70%, #6e0007 100%` | `#a3000c` (milestone figure in this colour too) |

Ruby is deliberately a deep wine red, darker than Legendary (bright red and gold) and the red Season Sweep prestige card, so the three never look alike. Onyx is the only dark card in the set.

This replaces the proportional mapping in `badgeTierColor.ts`. Rewrite `tierColor(tierIndex, totalTiers, legendary)` to return `"legendary"` for the top tier and `LADDER[tierIndex]` otherwise, and update its tests.

Because ladders have different lengths, a short badge stops partway up the scale. Ghost Grounds runs Bronze, Silver, then Legendary. The longest ladders (Goals Galore and European Tours) use all eight. White text on every accent colour passes 4.5:1, and every chip carries the tier name, so colour is never the only cue.

`reference/Badge-Tiers.dc.html` shows Goals Galore in all eight materials plus the empty slot.

**Empty slot** (a tiered badge with no tier yet, `tierColor` "locked"): same card size, 2px dashed `--perf` border, no frame or white panel, grey emblem, "Not yet" chip, milestone "0", a line saying what earns the first tier, and a grey footer counting down to the first tier ("1 season to go · Next: 1").

**Per-badge content:**

| Badge | Set | Icon | Unit under the milestone | Countdown unit |
|---|---|---|---|---|
| Loyal Supporter | Attendance | ticket | matches | matches |
| Goals Galore | Attendance | ball | goals seen | goals |
| Longevity | Attendance | hourglass | seasons | seasons |
| Home Comforts | Attendance | home | full home seasons | seasons |
| Away Traveller | Attendance | coach | seasons of 10+ aways | seasons |
| Ground Hopper | Grounds | stadium | grounds | grounds |
| Ghost Grounds | Grounds | ghost | lost grounds | grounds |
| European Tours | Europe | plane | matches abroad | matches |

Icon SVGs are in `reference/BadgeCard.dc.html` (24×24 viewBox, 2px stroke, round caps, white). For an "Every season" tier the milestone text is long: drop it to 20px so it fits on one line.

**Match line format:** home team first, as in the fixture list ("Sevilla 3-1 Arsenal", "Arsenal 7-0 Slavia Prague"). Dates are "27 Nov 2007".

Tapping a card opens its detail (below). Give each card an accessible name such as "Loyal Supporter, gold, 250 matches, 85 to the next badge".

## Page 1: Attendance

- Cards for Loyal Supporter, Goals Galore, Longevity, Home Comforts and Away Traveller.
- **Season Sweep** has one card per swept season, in the same grid. Its style: red card with a red-and-gold metallic frame, a "Prestige" chip, a white pennant reading "SWEPT", the season in big figures ("2003/04"), "All N matches" (the number of attendable matches that season), and "Completed at" with the last match of the season and its date. The footer reads "One per season swept".
- With no sweeps yet, show a single empty slot: "Season Sweep: attend every match of a season".

## Page 2: Grounds

- Ground Hopper and Ghost Grounds as tiered cards.
- **Old & New and The Premier League are only badges once complete.**
  - **Old & New, collected:** a double-width card with a gold frame and a "Complete set" chip. Two halves: "Last at Highbury" with its match and date, an arrow, then "First at the Emirates". Each half has a small drawing of the ground. Highbury is the art deco East Stand frontage: a cream facade with long ribbon windows on both wings, a stepped central entrance block with vertical fins, a gold canopy over the doors and two red flags. The Emirates is the curved glass drum, with:
- vertical fins on the facade;
- a gold band of light under the wavy roof edge;
- the zigzag roof trusses above;
- a red band at the base.

It is deliberately different from the Estadio do Dragao drawing. The footer reads "Collected {date}", using the date of the later match.
  - **Old & New, not complete:** a double-width dashed "space for a badge" naming the two matches, with a tick against any already attended.
  - **The Premier League, not complete:** a double-width dashed "space for a badge" slot with a grey pin icon and "Visit the home ground of every club in the {season} Premier League to collect it." Below that: "N of 20 grounds", "M to go", a progress bar, and the missing clubs as small grey pills. A club whose ground isn't in the fixture data yet (Coventry City) is listed like any other missing club, with no footnote.
  - **The Premier League, collected:** a gold "Complete set" card like Old & New, with the season and the completing match.

## Page 3: Europe & countries

- **European Tours** as a tiered card.
- **Passport cover** beside it, the same height as a card: navy booklet with a darker spine on the left and gold text: "Gooners' passport", the globe line drawing, "Over land and sea", then the stamp count ("13 countries stamped").
- **No totals.** Arsenal can play in new countries in future, so never show "of 27", a list of countries still to stamp, or greyed-out stamps. The section heading shows just the count ("13 stamps").
- **Passport stamps:** a visa page panel (pale `#f3f6f0` with a faint diagonal hatch, `#d6dccf` border, "Visas · Entries" label) holding **one stamp per collected country only**, in the order they were collected (date of first European match there). Each stamp shows the country, that date ("30 SEP 2003"), and "v {opponent}". Style: 3px double border in the stamp's ink, 90% opacity.
- **Mobile:** three across. The visa page simply grows downward as stamps are added.
- **Desktop:** the visa page is a fixed-height page, the same height as the cover beside it, holding 14 stamps (two rows of seven). Past 14 stamps it becomes a paged passport (`reference/Passport-Pages.dc.html`):
  - "Page N of M" in the visa page header;
  - Previous and Next page buttons with page dots underneath;
  - it opens on the last page, so the newest stamp is visible.

  With 14 or fewer stamps, hide the controls. The cover never changes size, so the row's layout never breaks.
- **Choosing each stamp's look:** stamp number *n* (1 = first collected) takes its ink, shape and angle from three fixed cycles, so neighbouring stamps never repeat and the next stamp is always predictable (`reference/Stamp-Inks.dc.html`):
  - **Ink**, cycling every 5: Post-box red `#b3121b`, Royal blue `#1f4f8f`, Bottle green `#2e6b3f`, Violet `#6b3a8f`, Sepia `#8a5a14`.
  - **Shape**, cycling every 3: rectangle (8px radius), circle (88px), oval (`50% / 42%`). Use a rectangle instead of a circle when the country name is longer than 11 characters.
  - **Angle**, cycling every 10: −4°, 5°, −3°, 3°, −6°, 2°, −2°, 4°, −5°, 6°.

  So the 14th stamp will be Violet, a circle, at 3°. If the user unticks an earlier match, later stamps shift along the cycle; that's acceptable for a logbook.
- **Cathedrals of Football:** one stadium card per collected stadium (`reference/StadiumCard.dc.html`), 270px tall, in date order of first visit. Layout:
  - Frame: navy-and-gold metallic.
  - Top: a 118px night-sky panel with a white and gold line drawing of that stadium.
  - Below the art: the name, then "City · Country", a dashed rule, "First visit", the match and the date.
- Uncollected cathedrals are empty spaces: on mobile, small dashed tiles with the stadium name and city, three across; on desktop, full-size dashed stadium cards with a grey stadium icon and "Not yet visited". The count reads "6 of 12".
- **Stadium art:** all 12 drawings are in `reference/StadiumCard.dc.html` and shown together in `reference/Stadium-Art.dc.html`. Copy them exactly as one SVG per ground ID. They share one style: a 200×118 viewBox, a ground line at y=104, white 2px strokes, gold `#e9c877` accents and `#0a2448` fills on a `#0e2f5c` sky. Allianz Arena's shell uses `#2a0f2a` and Signal Iduna Park's pylons use `#f5c84c`.
- City and country names aren't in `grounds.json` (only country is). Add a `city` field for the 12 cathedrals in `badge_reference.json` rather than hard-coding them in the UI.

## Page 4: Witness to history

- **Only matches the user attended appear.** No locked or greyed entries, no "of 10" totals.
- The summary under the heading counts each tier: "2 gold · 3 silver · 7 bronze", each with a small metal disc.
- One ticket stub per match (`reference/WitnessTicket.dc.html`), ordered by tier (gold, then silver, then bronze) and by date within each tier:
  - **Left stub:** a 6px metallic strip, then a 72px stub in the tier's accent colour with a white medal icon and the tier name, ending in a dashed perforation.
  - **Body:**
    - date and competition in small caps;
    - the match in bold;
    - the "why" line from `greatest_matches.json` as a handwritten note, in Kaushan Script 16px navy (add this font to the Google Fonts load);
    - the venue, as named in the fixture data.
- Tier colours: gold `#8a6414` (edge `#e2c47a`), silver `#5f6b78` (edge `#c3cad2`), bronze `#8a5a2b` (edge `#d9b08a`).
- One column on mobile; `repeat(auto-fill, minmax(340px, 1fr))` on desktop.
- With none attended, show one line: "No famous matches in the book yet. Tick one of the greats and it will appear here."

## Badge detail

**Mobile:** a bottom sheet over a navy scrim (`reference/Badge-Detail.dc.html`).

**Desktop:** a centred dialog, 780px wide, over the same scrim (`reference/Desktop-Badge-Detail.dc.html`). It has two columns:

- **Left (210px):** the badge's own card at full size, with the rule text on a grey panel below it.
- **Right:** the header, countdown and tier ladder.

Contents:

- Close button (44px).
- Emblem (mobile only; the card does this job on desktop), "{Set} · {Tier}", the badge name, and the current count ("415 matches attended").
- The rule text on a grey panel, written plainly for the user. Leave out engine edge cases such as the voided match; Loyal Supporter's reads "Every match you've ticked as attended."
- A navy countdown banner: "85 matches until your 500 badge (Ruby)", with a gold bar showing progress from the current tier to the next.
- "Every tier": one row per tier from `allTiers`/`tiersReached`. A reached tier shows a metal disc, the earning match and its date. Unreached tiers show a dashed disc and "N to go". The current tier carries a "Your badge" chip.
- Focus moves into the dialog on open, Esc closes it, and focus returns to the card.

Season Sweep, Old & New, The Premier League, stamps, stadiums and tickets open a simpler detail with the rule and the matches involved (for The Premier League, every club with its first-visit match or "not yet").

## Logic changes (small, in the engine or a selector beside it)

1. `toGo = nextThreshold - current` for every tiered badge (null at the top tier).
2. Season Sweep cards need the count of attendable matches in that season ("All 59 matches").
3. The Old & New and Premier League collected dates, which the engine already gives as `earningMatch`.
4. Stamp ink, shape and angle chosen from the stamp's position in collection order (see Page 3).
5. `tierColor()` rewritten to the eight-step ladder (see Tier colour scale).
6. `city` for the 12 cathedrals in `badge_reference.json`.
7. `countEarnedBadges` stays as it is; the header and tab counts use it, split per section.

## Empty states (nothing ticked)

- Every tiered badge shows its empty slot, counting down to its first tier.
- Season Sweep, Old & New and The Premier League show their dashed spaces.
- The passport cover reads "0 countries stamped". The visa page shows "No stamps yet. Your first European away day abroad gets you one."
- All 12 cathedrals show as empty spaces.
- Witness to history shows the one-line empty message above.

## Reference files (`reference/`)

| File | What it shows |
|---|---|
| `Badges-Attendance.dc.html` | Mobile, page 1 (tabs, ruled page, cards, Season Sweep) |
| `Badges-Grounds.dc.html` | Mobile, page 2 (Old & New collected, Premier League space) |
| `Badges-Europe.dc.html` | Mobile, page 3 (passport, stamps, cathedrals) |
| `Badges-History.dc.html` | Mobile, page 4 (ticket stubs) |
| `Badge-Detail.dc.html` | Mobile detail sheet |
| `Desktop-Badges.dc.html` | Desktop, all four pages |
| `Desktop-Badge-Detail.dc.html` | Desktop detail dialog |
| `Badge-Tiers.dc.html` | The eight-step tier colour scale plus the empty slot |
| `Stadium-Art.dc.html` | All 12 Cathedrals of Football drawings |
| `Stamp-Inks.dc.html` | The five stamp inks, the cycles, and what the next stamp looks like |
| `Passport-Pages.dc.html` | Desktop passport past 14 stamps (paged) |
| `Tier-Options.dc.html` | The options considered for steps 5 and 6 (Option B, Ruby and Onyx, was chosen) |
| `BadgeCard.dc.html`, `StadiumCard.dc.html`, `WitnessTicket.dc.html` | The three card components, with every icon and stadium drawing |

As with the other reference files: read them for exact sizes, colours and SVGs, ignore the canvas plumbing (`support.js`, `<x-dc>`, `<helmet>`, `{{ }}`, `<sc-for>`, `<sc-if>`, `<dc-import>`), and rebuild with the app's own components.

## Checks before merging

- Run the existing badge tests.
- Check the nothing-ticked, sample and everything-ticked states at 320, 390, 768 and 1440px wide.
- Ticking and unticking a match updates the cards and countdowns straight away.
- Tabs keep their place on refresh.
- The detail dialog works with the keyboard alone.
