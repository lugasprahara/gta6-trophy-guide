# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/lugasprahara/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/lugasprahara/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Platinum Desk — an offline GTA 6 trophy guide and tracker: all 55 official trophies with cited guides, a platinum roadmap, missable flags, saved progress with export/import, and a spoiler setting.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. The app is plain static files under `app/` — no build step, no network requests at run time — so it works with the network off.

## What it does

- **Tracker:** all 55 official PS5 trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with a checkbox each, saved in the browser (localStorage), plus a big earned count and % to platinum.
- **Cited guides:** every trophy has a full guide in our own words, written from the official description only, with a visible Sources line (Exophase for name, description and grade; PSNProfiles for PSN's count where it has one). Nothing is invented: no locations or steps beyond the official descriptions, and anything not yet checked in the game is labelled as such.
- **Progress counters:** 20 counted trophies carry a counter (x/250 stunts, x/42 Shooting Range golds, $x/$250,000 laundered, …) stored alongside your progress.
- **Filters & search:** by grade, by kind (story / missable / collectibles / activities / world), by earned state, plus full-text search over names and descriptions.
- **Spoiler setting:** hides the names and descriptions of story trophies until they are earned.
- **Roadmap:** a six-stage path to the platinum — story first, stranger strands, activities, collectibles & exploration, money & mop-up, then the final mission and 100% — with per-stage progress.
- **Missables page:** the six cautiously-flagged trophies, each with the official description it is inferred from and an honest "not yet verified in the game" label.
- **Next up planner:** the nearest unearned trophies first, by roadmap stage and by counter left to finish.
- **Export/import:** your progress (ticks, counters, notes) as a JSON file, importable back on any device.
- **Per-trophy notes:** your own reminder for any trophy, saved in the browser only.

## Honesty note

Trophy names, descriptions and grades are the official PS5 list (Exophase, frozen 18 November 2026; PSNProfiles agrees on every name, description and grade). Missable flags are cautious inferences from the wording of the official descriptions, not verified gameplay claims. This is an unofficial fan-made guide; it uses no Rockstar logos, artwork or game screenshots.

---

<sub>Entered on [make.fun](https://make.fun/?ref=aes5np1n&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
