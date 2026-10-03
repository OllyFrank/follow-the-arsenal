# We All Follow The Arsenal — visual redesign handoff

This is a brief for Claude Code. It describes a visual redesign of the existing app (live at https://follow-the-arsenal.vercel.app/). The designs were made on a design canvas; the `reference/` folder beside this file holds the source markup for every screen, with exact values in inline styles.

## How to use this folder

1. Put the `design-handoff/` folder in the root of the repo.
2. Ask Claude Code: *"Read design-handoff/HANDOFF.md and implement it. Start with the 'Before you start' section and show me your plan before changing anything."*

## Ground rules

- **This is a restyle, not a rewrite.** Keep the data model, the fixture data, the distance maths and the saved state exactly as they are. The app stores state in `localStorage` under `watfa:state:v1`; existing users' data must keep working with no migration.
- **No official Arsenal branding.** No club crest, no club wordmark, no kit-sponsor marks. The cannon in this pack is an original generic drawing; use it as given and do not replace it with, or redraw it towards, the cannon on the club crest.
- **Numbers in the mocks are sample data.** Never hard-code a figure, fixture or address from the reference files. Everything shown comes from the app's real state.
- Keep all existing copy unless this document gives new wording.
- Work in small commits, one screen or component at a time.

## Before you start

Read the codebase and report back, before editing:

- Framework, styling approach (the live site uses CSS custom properties: `--red`, `--red-dark`, `--navy`, `--gold`, `--green`, `--grey-50` to `--grey-800`, `--white`, `--font-body`, `--font-heading`) and how fonts are loaded.
- Where the onboarding steps, the three tabs (Fixtures, Addresses, Stats) and the header live.
- How total distance and laps of the Earth are computed, so the header chip and lap stamps can reuse them.
- Anything in this brief that does not match how the app actually works. Say so rather than guessing.

## Design tokens

Extend the existing custom properties; keep the existing names and values, add the new ones.

| Token | Value | Use |
|---|---|---|
| `--red` (existing) | `#db0007` | Header, welcome screen, attended tickets, active indicators |
| `--red-dark` (existing) | `#a3000c` | Active header tab, globe lines on red, loss chip text |
| `--red-deep` | `#c40006` | Globe fill on a red ground |
| `--navy` (existing) | `#063672` | Primary buttons, headings, stats hero, selected chips |
| `--navy-ink` | `#0b1f3f` | Strong text on white (titles, table row heads) |
| `--navy-line` | `#2a5591` | Globe lines and progress track on navy |
| `--navy-rule` | `#3d659d` | Hairline rule on navy |
| `--navy-soft` | `#dbe5f4` | Secondary text on navy |
| `--navy-tint` | `#e6ecf5` | Info panels |
| `--gold` (existing) | `#c99b3f` | Header rule, completed steps, lap stamps, progress fill |
| `--gold-text` | `#ecd59c` | Small gold text on navy only |
| `--ground` | `#f4f5f8` | Page background (replaces `--grey-50` as the page ground) |
| `--stub` | `#eef0f5` | Unattended ticket stub, bar tracks |
| `--line` | `#c5c8d2` | Card borders, dividers |
| `--line-strong` | `#7d7d88` | Input borders, unattended toggle ring |
| `--perf` | `#b4b8c4` | Unattended ticket perforation |
| `--timeline` | `#7d8aa5` | Address timeline dots, "missed" bar |
| `--text` | `#2b2b33` | Body text (same as `--grey-800`) |
| `--text-muted` | `#5c5c66` | Secondary text (same as `--grey-600`) |

Result chips: win `#e3f3e7` / `#14692d`, draw `#ececef` / `#44444e`, loss `#fde4e4` / `#a3000c` (background / text).

Colour rules:

- Text on red is always white. Gold is never used for text on red or on white; it fails contrast there.
- Gold text (`--gold-text`) appears only on navy.
- Win, draw and loss are always labelled with a letter or a word, never by colour alone.

Shape and spacing:

- Radius: 6px for buttons, inputs and chips; 10px for cards (12px for the large desktop cards); circles for toggles and stamps.
- Every tappable control is at least 44px tall.
- Page gutters: 20px on mobile (24px in onboarding), 32px on desktop. Desktop content max-width 1200px, centred.

## Type

Replace Inter with the Archivo family. Load from Google Fonts (or the framework's font loader):

- **Archivo Black** (400): logo lettering, headings, big numerals, scores. Stack: `'Archivo Black', 'Arial Black', Impact, sans-serif`. Headings are uppercase.
- **Archivo** (400, 500, 600, 700): body text, buttons, inputs. Stack: `Archivo, system-ui, sans-serif`.
- **Archivo Narrow** (500, 600, 700): small uppercase labels with 0.06–0.14em letter-spacing, season chips, nav labels. Stack: `'Archivo Narrow', 'Arial Narrow', sans-serif`.

Key sizes (mobile / desktop): welcome headline 38 / 64px; step and page headings 26 / 40px (app page titles 22 / 32px); card headings 16 / 18px; body 15.5 / 17px; labels 11–13px; stats hero number 60 / 104px.

## Shared pieces

### Logo: the scarf

The app's name is now set as a football bar scarf with tassels, replacing the plain block-text wordmark everywhere. It is an original drawing; do not add a crest or any club mark to it. Build it as one `Logo` component with two props: `variant` (`long` or `compact`) and `tone` (`onRed` or `onLight`).

**Long** (one line, 6:1). Use where there is width to spare: the desktop header and the desktop welcome screen.

```html
<svg role="img" aria-label="We All Follow The Arsenal" viewBox="0 0 720 120" width="336" height="56">
  <path d="M0 12H26M0 28H26M0 44H26M0 60H26M0 76H26M0 92H26M0 108H26M694 12H720M694 28H720M694 44H720M694 60H720M694 76H720M694 92H720M694 108H720" fill="none" stroke="BODY" stroke-width="8" stroke-linecap="round"/>
  <rect x="24" y="0" width="672" height="120" fill="BODY"/>
  <rect x="44" y="0" width="16" height="120" fill="BAR"/>
  <rect x="70" y="0" width="16" height="120" fill="BAR"/>
  <rect x="634" y="0" width="16" height="120" fill="BAR"/>
  <rect x="660" y="0" width="16" height="120" fill="BAR"/>
  <rect x="106" y="12" width="508" height="4" fill="LINE"/>
  <rect x="106" y="104" width="508" height="4" fill="LINE"/>
  <text x="360" y="72" text-anchor="middle" font-size="33" fill="NAME" textLength="492" lengthAdjust="spacingAndGlyphs">
    <tspan fill="LEAD" font-weight="700" style="font-family: 'Archivo Narrow', 'Arial Narrow', sans-serif">WE ALL FOLLOW </tspan><tspan style="font-family: 'Archivo Black', 'Arial Black', Impact, sans-serif">THE ARSENAL</tspan>
  </text>
</svg>
```

**Compact** (two lines, 10:3). Use on mobile and in narrow spaces: the mobile header, all mobile onboarding screens and the desktop onboarding rail.

```html
<svg role="img" aria-label="We All Follow The Arsenal" viewBox="0 0 400 120" width="170" height="51">
  <path d="M0 12H22M0 28H22M0 44H22M0 60H22M0 76H22M0 92H22M0 108H22M378 12H400M378 28H400M378 44H400M378 60H400M378 76H400M378 92H400M378 108H400" fill="none" stroke="BODY" stroke-width="8" stroke-linecap="round"/>
  <rect x="20" y="0" width="360" height="120" fill="BODY"/>
  <rect x="34" y="0" width="12" height="120" fill="BAR"/>
  <rect x="354" y="0" width="12" height="120" fill="BAR"/>
  <text x="200" y="48" text-anchor="middle" font-size="27" font-weight="700" fill="LEAD" textLength="246" lengthAdjust="spacingAndGlyphs" style="font-family: 'Archivo Narrow', 'Arial Narrow', sans-serif">WE ALL FOLLOW</text>
  <text x="200" y="94" text-anchor="middle" font-size="38" fill="NAME" textLength="276" lengthAdjust="spacingAndGlyphs" style="font-family: 'Archivo Black', 'Arial Black', Impact, sans-serif">THE ARSENAL</text>
</svg>
```

Colours by tone:

| Slot | `onRed` (on a red ground) | `onLight` (on white or `--ground`) |
|---|---|---|
| `BODY` (scarf and tassels) | white | `--red` |
| `BAR` (end bars) | `--red` | white |
| `LINE` (long version only) | `--navy` | `--gold` |
| `LEAD` ("WE ALL FOLLOW") | `--navy` | white |
| `NAME` ("THE ARSENAL") | `--red` | white |

Every screen in this redesign places the logo on red, so `onRed` is the one in use; `onLight` is for any future light surface.

Sizes used in the designs (width × height):

| Place | Variant | Size |
|---|---|---|
| Mobile app header | compact | 170 × 51 |
| Mobile welcome, top left | compact | 150 × 45 |
| Mobile onboarding steps 2 and 3, centred in the red band | compact | 160 × 48 |
| Desktop app header | long | 336 × 56 |
| Desktop welcome, top left | long | 312 × 52 |
| Desktop onboarding rail | compact | 230 × 69 |

Rules: keep the aspect ratio; do not go below 150px wide for the compact version or 300px for the long one, or the top line becomes unreadable. The text is live SVG text, so Archivo Black and Archivo Narrow must be loaded; `textLength` keeps the lettering inside the scarf if a fallback font shows first. The logo is not a link unless the app already links its title. The favicon and app icon are not part of this redesign; leave them as they are.

### Cannon icon

Used for the attended toggle and the lap stamps. `currentColor` drives the cannon; the wheel's inner fill must match whatever is behind the icon (the `WHEEL_FILL` below), so make it a prop.

```html
<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
  <path d="M12 20L3.5 27" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
  <g transform="rotate(-18 14 16)" fill="currentColor">
    <rect x="5" y="11.5" width="21" height="7" rx="2.2"/>
    <rect x="24.5" y="10.3" width="3.2" height="9.4" rx="1.2"/>
    <circle cx="4.4" cy="15" r="1.9"/>
  </g>
  <circle cx="12" cy="22" r="6.3" fill="WHEEL_FILL" stroke="currentColor" stroke-width="2.2"/>
  <path d="M12 16.9V27.1M6.9 22H17.1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <circle cx="12" cy="22" r="1.7" fill="currentColor"/>
</svg>
```

### Globe graphic

Decorative only (`aria-hidden`). On red: fill `--red-deep`, lines `--red-dark`, dotted gold orbit, white traveller dot ringed in navy. On navy (stats hero): lines only, in `--navy-line`. Copy the SVG from `reference/Main.dc.html` and `reference/Stats.dc.html`.

### Buttons, inputs, selects

- Primary: navy fill, white text, 56px tall, 6px radius, Archivo 700 17px, optional right arrow. On the red welcome screen the primary is white with navy text.
- Secondary: white fill, navy 1–2px border, navy text.
- Text button / link: navy, 600 weight, underlined where it sits in running content.
- Inputs: 52px tall, 1px `--line-strong` border, 6px radius, 16px text, visible `<label>` above.
- Selects: 48px tall, same border, bold navy text, custom chevron.
- Segmented control (List/Grid, mi/km): 1px navy outline, selected segment navy with white text.

### App header

- Red bar with a 4px gold bottom rule.
- The scarf logo at the left: compact on mobile, long on desktop (sizes in the Logo section). Mobile header padding is 12px 20px 10px; on desktop the logo has 10px above and below.
- **Mileage chip** (new): navy pill at the right showing the all-seasons total distance in the selected unit, with the label "travelled so far" in `--gold-text`. It uses the same figure as the Stats total.

### Navigation

- **Below 768px:** a bottom bar fixed to the bottom of the viewport with three items (Fixtures, Addresses, Stats), each an icon over an Archivo Narrow uppercase label. Active item: navy text, 3px red top indicator. Inactive: `--text-muted`. The header tabs are removed at this width. Add bottom padding to the page so content is not hidden behind the bar.
- **768px and up:** tabs sit in the header beside the logo, icon plus label in Archivo Black 13px uppercase. Active tab has a `--red-dark` background. No bottom bar.

## Onboarding (3 steps, same order and logic as today)

Reference: `Main`, `Onboarding-2`, `Onboarding-3` (mobile) and `Desktop-Welcome`, `Desktop-Onboarding-2`, `Desktop-Onboarding-3`.

**Step 1 – Welcome.** Full red screen. Scarf logo top left with "Step 1 of 3" top right. Globe graphic top right (mobile) or right half (desktop). Headline "How far have you followed The Arsenal?", then "Every match since 1988/89, every mile from your front door, added up into laps of the Earth." Below a hairline, the two existing points as numbered rows (white numeral in a navy circle), keeping the existing wording. White "Get started" button, then "No sign-up. Everything is saved in this browser."

**Progress.** "Step N of 3" becomes a three-stop route: Welcome, Season ticket, Home. Completed stop: gold circle with a navy tick, gold connector. Current: white circle with navy numeral, bold label. Upcoming: `--red-dark` circle, dotted white connector. Horizontal in a red band on mobile, under a row holding the Back control and the centred scarf logo; vertical in a red left rail on desktop. Include a Back control on steps 2 and 3.

**Step 2 – Season ticket.** Replace the From/To dropdowns, "Add range" button and scrolling checkbox list with one grid of season chips (1988/89 to the latest season in the data). Each chip is a toggle button with `aria-pressed`: unselected white with `--line` border; selected navy with white text. Five columns on mobile; auto-fit columns (min 84px) on desktop. "Select all" and "Clear" text buttons sit above the grid. Keep the live summary and keep the real count the app already computes: "N seasons selected. This will mark X home games as attended." (The mock omits X only because the canvas has no fixture data.) Buttons: "Mark as attended & continue" (primary) and "Skip this step".

**Step 3 – Home address.** Same fields and behaviour: "Postcode or place" with "Look up" beside it, then "Label (optional)" and the date field side by side (label shortened to "Lived here since"). Below, a `--navy-tint` panel with a home icon, dotted line and pin, and the text "Distance is measured in a straight line from your home to each ground. Moved over the years? Add earlier homes later on the Addresses tab." Buttons: "Save address & finish" and "Skip this step".

Desktop layout for steps 2 and 3: red left rail (compact scarf logo, vertical route, cropped globe at the bottom) and a content panel on `--ground` with the form in a 640px column. Below about 960px the rail stacks above the content.

## Fixtures

Reference: `Fixtures` and `Desktop-Fixtures`.

- Filters: season select and competition select on one row. List/Grid segmented control. An "N attended" counter for the current filter in Archivo Black.
- Bulk actions unchanged: "Tick all home games", "Select all", "Untick all" as secondary buttons.
- The autosave notice becomes one quiet line with a padlock icon: "Saves automatically, in this browser only." (Desktop adds "Switching devices or clearing your browser data will lose your matches.")
- **Group fixtures by calendar month** with an uppercase Archivo Narrow heading and a hairline.

**Ticket card.** One per match, three parts in a row:

1. **Stub** (72–76px wide): score in Archivo Black 24px, "HOME" or "AWAY" beneath. A 2px dashed right border is the perforation.
2. **Details:** result chip (W, D or L) plus competition in small caps; match title in bold 16px; date; venue; the existing "Can't remember?" link with its current behaviour.
3. **Attended toggle:** a 48px circular button holding the cannon icon, with a caption beneath. `aria-pressed` reflects state; `aria-label` is "Attended {match title}".

| | Not attended | Attended (red-and-white ticket) |
|---|---|---|
| Card background / border | white / `--line` | `--red` / `--red` |
| Stub background / text | `--stub` / `--navy-ink` | white / `--red` |
| Perforation | `--perf` | `--red` |
| Title, meta, link | `--navy-ink`, `--text-muted`, `--navy` | all white |
| Toggle fill / ring / cannon | white / `--line-strong` / `--line` | white / white / `--red` |
| Caption | "Missed it" in `--text-muted` | "Was there" in white |

Result chips keep their own colours on both backgrounds.

Layout: single column on mobile. On desktop, a grid of tickets using `repeat(auto-fit, minmax(340px, 1fr))` with a 12px gap (three across at 1200px). Keep the existing List and Grid options; List is the single-column ticket, and the compact mobile Grid cards should adopt the same red-and-white attended state.

## Addresses

Reference: `Addresses` and `Desktop-Addresses`.

- Heading "Home addresses", the line "Each match is measured from wherever you were living at the time.", and the "Add address" primary button.
- Addresses become a **timeline, newest first**: a dotted vertical line with a dot per address (red ringed dot for the current one, navy dots for earlier ones). Each address is a white card with the label, a "Current" tag where relevant, the place, and the date range in small caps, plus edit and remove icon buttons with `aria-label`s.
- A dashed-outline button "Add an earlier home" ends the timeline.
- Footer line with a padlock: "Addresses are stored in this browser only."
- Keep the existing empty state copy ("No addresses yet. Add one so distances can be calculated.") inside the new card style.
- Desktop: heading, text and button in a left column; timeline (max 700px) on the right.

## Stats

Reference: `Stats` and `Desktop-Stats`.

- Controls: season select and mi/km segmented control.
- **Hero panel** (navy, 12px radius, faint globe lines top right): "TOTAL DISTANCE" label in `--gold-text`; the total in Archivo Black with the unit in `--gold-text`; a hairline; then laps of the Earth.
- **Lap stamps** (new): one cannon stamp per completed lap. Completed: `--gold` circle, navy cannon (wheel fill gold). The lap in progress: dashed `--gold-text` ring, cannon in `#7f9cc6` (wheel fill navy). Show `floor(laps)` gold stamps plus one in-progress stamp. If there are more than five completed laps, show one gold stamp with "×N" beside it instead. Give the group `role="img"` and a label such as "1 lap completed, lap 2 in progress".
- **Progress bar** under the laps line: track `--navy-line`, fill `--gold`, width equal to the fractional part of the lap count. Caption: "One cannon per lap. Another {distance to next lap} earns the {ordinal}."
- **Tiles:** Grounds visited, Arsenal goals seen, Longest unbeaten run. Three across; number in Archivo Black navy, label in small caps.
- **Record card:** Won, Drawn, Lost as three large figures (navy, grey, red), a stacked proportion bar, the win rate, and the Home / Away / Overall table as a real `<table>` with tabular numerals.
- **Furthest single trip:** home icon, dotted line, the distance, dotted line, red pin; then the match and its date and venue.
- **Distance by season:** horizontal bars in navy on a `--stub` track, season label left, value right, most recent first, with "Show all N seasons" to expand.
- **Lucky charm?** two labelled bars: Attended (navy) and Missed (`--timeline`), each with match count and win rate.
- The sections not drawn (Grounds visited list, Top opponents, Biggest win and loss seen, Highest-scoring match seen, Longest gap between attended matches, Matches by competition, Finals) stay, restyled with the same white card, Archivo Black card heading and table treatment. Keep their existing empty-state copy.
- Desktop: hero and Record side by side; tiles in a row; Distance by season beside a column holding Furthest single trip and Lucky charm.

## Responsive rules

- Below 768px: the mobile layouts, bottom navigation.
- 768px and up: header tabs, content max-width 1200px with 32px gutters.
- Use `auto-fit` grids and wrapping flex rows so nothing needs a fixed breakpoint between tablet and desktop. No horizontal scrolling at any width down to 320px.

## Changes that touch logic, not only styling

1. Season-ticket step: chip toggles replace the range picker and checkbox list.
2. Fixtures grouped by month.
3. "N attended" counter on Fixtures.
4. Mileage chip in the header.
5. Lap stamps and the progress-to-next-lap bar and caption.
6. Bottom navigation on mobile.
7. Back control in onboarding steps 2 and 3.

Everything else is presentation.

## Accessibility

- Real `<button>`, `<a>`, `<input>` with `<label>`, `<select>` and `<table>` elements throughout; no click handlers on divs.
- Visible focus rings on every control (2px navy, or white on red and navy grounds, with a 2px offset).
- Toggles expose `aria-pressed`; the current nav item has `aria-current="page"`; decorative SVGs are `aria-hidden`.
- Body text contrast at least 4.5:1; the colour rules above already satisfy this.
- Respect `prefers-reduced-motion` for any transition added.

## Suggested order

1. Tokens and fonts.
2. Logo component, header, mileage chip and navigation.
3. Fixtures ticket card and month grouping.
4. Stats hero, lap stamps and cards.
5. Addresses timeline.
6. Onboarding.
7. Desktop layouts and a pass at 320, 390, 768 and 1440px wide.

After each step, run the app and check that existing saved data still loads and that ticking a match still updates the stats.

## Reference files

`reference/` holds one file per screen:

| Mobile (390px) | Desktop (1440px) |
|---|---|
| `Main.dc.html` (welcome) | `Desktop-Welcome.dc.html` |
| `Onboarding-2.dc.html` | `Desktop-Onboarding-2.dc.html` |
| `Onboarding-3.dc.html` | `Desktop-Onboarding-3.dc.html` |
| `Fixtures.dc.html` | `Desktop-Fixtures.dc.html` |
| `Addresses.dc.html` | `Desktop-Addresses.dc.html` |
| `Stats.dc.html` | `Desktop-Stats.dc.html` |

`Logo-C-Scarf.dc.html` is the logo sheet: the long version on red, the `onLight` version on white, and the compact version in a mobile header.

These are design-canvas source files, not app code. Read them for exact sizes, spacing and colours (all in inline `style` attributes) and for the SVGs. Ignore the canvas plumbing: the `support.js` script tag, `<x-dc>`, `<helmet>`, `{{ ... }}` placeholders, `<sc-for>` and `<sc-if>`. The script block at the bottom of the Fixtures and Onboarding-2 files shows the colour values for each state. Do not copy the files into the app; rebuild the screens with the app's own components and the tokens above.
