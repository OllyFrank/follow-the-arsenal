# Derby Days & Badges — Plan

Goal: add a **Derby Days** section to the Stats page and a new **Badges** tab that celebrates milestones and completed sets. Everything is calculated from the user's ticked matches, so it works the same for guests and signed-in users.

## Principles
- **Calculated, not stored.** Badges and stats are worked out from attendance plus the static data every time. Un-ticking a match updates everything, and new badges apply to everyone's history straight away. **No Supabase changes are needed.**
- **Every badge links to the match that earned it**, with its date. For a tiered badge, that is the match where the user crossed the tier's threshold.
- **Locked badges are shown with progress** (e.g. "14 of 20 grounds"), so there is always a next goal.
- **Same data rules as the rest of the app** (CLAUDE.md), restated below so nothing is reinterpreted.
- Build on a feature branch and test on a preview link first (ACCOUNTS_PLAN.md, section 0).

## Shared rules (apply to every stat and badge)
- **Behind closed doors:** the 71 matches from 17 June 2020 to 23 May 2021 (the end of 2019/20 and all of 2020/21) are ignored by every stat and badge, as if they hadn't been played. They can't be ticked, never count, never break or extend a streak, and are left out of the "missed" side of every lucky charm. For the longest-gap-between-games stat, the days from 17 June 2020 to 23 May 2021 aren't counted. **Attendable** = not behind closed doors.
- **Voided match** (Counts in record = N, the 1999 Sheffield United game): counts towards attendance, grounds, countries and seasons; excluded from every result-, score- or goal-based rule.
- **Results:** use the Result column, so penalty shoot-outs are draws.
- **Season:** use the stored Season field, never the date.
- **Biggest win / defeat:** largest goal margin; tie-break on Arsenal goals scored (for a win) or conceded (for a defeat), then the most recent.
- **Unbeaten run:** the longest sequence of consecutive *attended* matches in the group (in date order) without a defeat.
- **Lucky charm:** win % at attended matches vs win % at attendable matches the user missed, both counting only matches in the record.

## Part 1: Derby Days (new section on the Stats page)
Two sub-sections. Each has a season filter consistent with the rest of the Stats page.

**North London Derbies** (opponent = Tottenham Hotspur; 88 matches in the data, 3 behind closed doors)
- Record: W-D-L, win %, goals for and against.
- Your first North London derby: date, score, venue, linked to the match.
- Biggest win seen and biggest defeat seen.
- Unbeaten run seen.
- Lucky charm.

**London Derbies** (opponent in `londonClubs`, which includes Tottenham)
- Record: W-D-L, win %, goals for and against.
- Biggest win seen and biggest defeat seen.
- Unbeaten run seen.
- Lucky charm.
- `londonClubs` contains Bromley and Barnet, who never played Arsenal in this period. Keep them in the list for future fixtures, but don't show them anywhere until there is a match.

Empty state for both: "No derbies ticked yet" with a link to the fixtures for that opponent.

## Part 2: Badges tab
**Layout:** a new top-level tab. A header shows badges earned (e.g. "23 badges"), then one section per set: Attendance, Grounds, Europe & Countries, Witness to History.

**Badge card:** icon, name, current tier (or "Locked"), the earning match and date (linked), and a progress bar to the next tier. Tapping a card shows its rule and every tier, with the date each was reached.

**Tiered badges** show only the highest tier earned (one badge per category). Tier colours step up from bronze through silver, gold and platinum, and the top tier of every tiered badge uses a special "Legendary" style.

### Attendance
| Badge | Counts | Tiers | Rule and edge cases |
|---|---|---|---|
| Loyal Supporter | Matches attended | 1, 50, 100, 250, 500, 1,000, 1,500 (legendary) | All attended matches, including the voided one. |
| Goals Galore | Arsenal goals seen | 1, 50, 100, 250, 500, 1,000, 2,000, 3,000 | Arsenal goals in attended matches in the record. Shoot-out goals don't count. Attendable matches hold 3,665 Arsenal goals, so 3,000 is possible but extremely hard. |
| Longevity | Seasons with at least one match attended | 5, 10, 15, 25, every season | "Every season" = every season with at least one attendable match: 37 of the 38 seasons, because all of 2020/21 was behind closed doors. |
| Home Comforts | Seasons where the user attended every home league game | 1, 3, 5, 10, 20, every season | League = Premier League or League Division One, H only. Only attendable games are required, so 2019/20 needs its 15 attendable home league games. A season with no attendable home league games (2020/21) can never count. "Every season" = the 37 seasons that can count. |
| Away Traveller | Seasons with 10+ away games attended | 1, 3, 5, 10, 20, every season | Away = H/A/N "A", any competition; neutral venues don't count. "Every season" = the 37 seasons with attendable away games. |
| Season Sweep | Seasons where the user attended every attendable match | One badge per season completed | The prestige badge. Shows one badge per swept season, e.g. "Season Sweep 2004/05". Includes the voided match in 1998/99. A season with no attendable matches (2020/21) can never be swept. |

### Grounds
| Badge | Rule | Tiers | Data |
|---|---|---|---|
| Ground Hopper | Distinct grounds visited (by Ground ID) | 5, 10, 25, 50, 80 | Existing data (179 grounds) |
| The Premier League | Has visited the current home ground of every club in this season's Premier League, at any point in their history. Recalculated when the club list changes; once earned, kept with the date it was earned. Shows "18 of 20" while locked, listing the missing grounds. | Single badge | `premierLeague` in `badge_reference.json` (2026/27) |
| Ghost Grounds | Visited grounds no longer used by their club, mostly demolished (including Goodison Park, Everton's home until 2025) | 1, 5, 10 | `ghostGrounds` (27 grounds) |
| Old & New | Attended both the last match at Highbury (M0984, 4-2 v Wigan, 7 May 2006) and the first competitive match at the Emirates (M0987, 1-1 v Aston Villa, 19 Aug 2006) | Single badge | `oldAndNew` |

**The Premier League, 2026/27:** Coventry City's ground isn't in the data yet (Arsenal haven't played there in this period), so nobody can earn this badge until that fixture is added. Show Coventry in the missing list as "Coventry Building Society Arena — not yet in the fixture list". The badge must not crash or quietly skip Coventry.

**Earned-badge rule:** if the club list changes later (e.g. 2027/28), users who earned the badge keep it with its earned date. That date has to come from history, not storage: it is the date of the attended match that completed the set *for the season in which it was earned*. To keep this calculable, store the club list per season (`premierLeague` becomes a list of seasons over time) and evaluate each season's list separately.

### Europe & Countries
"European match abroad" = competition is in `europeanCompetitions` **and** the ground's country isn't England. That covers away games and finals abroad (164 matches, 156 attendable). It leaves out the three European away ties at English grounds (Chelsea 2004, Liverpool 2008, Man Utd 2009).

| Badge | Rule | Tiers |
|---|---|---|
| European Tours | European matches abroad attended | 1, 3, 5, 10, 25, 50, 75, 100 |
| Passport Stamps | One badge per country where the user attended a European match abroad. Show every earnable country, with locked ones greyed out: 27 in the current data. Ireland is left out because its only match (Dundalk, 2020) was behind closed doors. Derive the list from the data, so new countries appear automatically. | One per country |
| Cathedrals of Football | One badge per stadium in `cathedralsOfFootball` where the user attended any match, in any competition | One per stadium (12) |

### Witness to History
- One badge per greatest match attended, coloured by its tier (10 gold, 10 silver, 10 bronze). Source: `greatest_matches.json`.
- Show all 30 in date order, locked ones greyed, each with its "why" line.
- Summary at the top of the section: "Gold 3/10 · Silver 5/10 · Bronze 2/10".

## Data files (add next to fixtures.json, grounds.json and managers.json)
- **`greatest_matches.json`:** 30 entries with number, match ID, date, opponent, score line, era, "why" and tier.
- **`badge_reference.json`:** London clubs, league and European competition lists, ghost grounds, cathedrals, the Old & New match IDs, and the 2026/27 Premier League clubs with their ground IDs.
- Both files use the match and ground IDs from We_All_Follow_The_Arsenal_Data.xlsx. **First check every ID against fixtures.json and grounds.json by date + opponent or by ground name, and stop and report any mismatch** rather than guessing.

## Visual design
- Arsenal-inspired but unofficial, as in the rest of the app: no club crests, logos or kit designs for Arsenal or any opponent.
- Simple SVG icons per badge, one consistent style.
- Passport Stamps can use a country name and stamp-style border, optionally flag colours.
- Cathedrals use generic stadium silhouettes plus the stadium name.
- Witness to History cards use a ticket-stub look with the tier colour.

## Build order
1. **Data fix first:** in fixtures.json, change match M0707 (Schalke v Arsenal, 30 Oct 2001) from Parkstadion to Veltins Arena (G169), and remove Parkstadion (G104) from grounds.json. The second source had the wrong ground: Schalke had already moved to the Arena AufSchalke. No other IDs change. Add the behind-closed-doors rule above to CLAUDE.md, and check the existing stats (unbeaten run, lucky charm, longest gap) follow it.
2. Load the two new data files, run the ID check, and write the shared helpers (attendable, in record, season groups, biggest win, unbeaten run, lucky charm). Reuse existing helpers where the Stats page already has them.
3. Derby Days section on the Stats page.
4. Badge engine: one function per badge returning tier reached, earning match, progress to next and locked/unlocked. Keep it independent of the UI so it can be tested on its own.
5. Badges tab UI: header, sections, cards, detail view.
6. Badge icons and styling.
7. Tests (below), then a check on the preview link on desktop and mobile.

## Tests (automated, against the real fixture data)
- **Nothing ticked:** no badges earned, every badge shows progress from zero, derby sections show their empty state.
- **Every attendable match ticked:** Loyal Supporter reaches 1,500 (legendary); Goals Galore reaches 3,000; Longevity, Home Comforts and Away Traveller reach "every season"; Season Sweep awarded for 37 seasons, **not** 2020/21; all 27 ghost grounds; all 27 passport stamps; all 12 cathedrals; all 30 Witness to History; The Premier League still locked at 19 of 20 because of Coventry.
- **Behind closed doors:** ticking is impossible, and no badge or stat ever counts one. An unbeaten run either side of the closed-doors period joins up across it, and the longest gap leaves out 17 June 2020 to 23 May 2021.
- **Voided match:** counts for Loyal Supporter but not Goals Galore or derby records.
- **Un-ticking** the match that earned a tier removes that tier, and the earning match moves to the next qualifying one.
- **Old & New:** needs both matches; one alone stays locked.
- **Thresholds:** exactly 49 vs 50 matches attended gives the correct tier, and the earning match is the 50th.
- **Derby lucky charm:** missed matches exclude behind-closed-doors games.

## Decisions made in this plan (check before building)
- European Tours and Passport Stamps count matches at grounds outside England, so the 2009 Celtic qualifier counts (Scotland) and all-English European ties don't.
- Away Traveller counts any competition but not neutral venues.
- Ibrox has been dropped from Cathedrals of Football. The only Rangers match was removed from the data set, so the badge could never be earned.
- Greatest match dates have been corrected to the data: the 1993 Coca-Cola Cup final was 18 April and the Villarreal semi-final was 25 April 2006.

## Not in this phase
London grounds badge, big-six head-to-heads, St Totteringham's Day, All Spurs Homes, Wembley Derby, Lane Winner, Title at the Lane, and rarity percentages (they need many users).
