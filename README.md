# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/lugasprahara/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/lugasprahara/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Platinum Desk — an offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5: the official name, description and grade of every trophy, a guide in our own words with its sources beside it, a roadmap to the platinum in five stages, the one missable trophy flagged with its warning, and a checklist whose progress is saved in the browser and can be exported and imported.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. It works with the network off: every file it loads is under `app/`, and your progress never leaves your browser except when you export it yourself. Add `?demo=1` to the address to preview the guide with a sample of earned trophies.

## How it is built

- `app/index.html` — the page: progress bar, checklist / roadmap / missables views, search, filters and the spoiler setting.
- `app/app.js` — the tracker: loads the data, renders the views, saves earned trophies to localStorage, exports and imports progress.
- `app/style.css` — the look: a Vice City sunset theme of our own, no images, no web fonts.
- `app/data/trophies.json` — the 55 trophies: official name, description, grade and count, kind, roadmap stage, missable flag, steps, a guide in our own words and its sources.
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.

The game launched on 19 Nov 2026, so detailed external guides are still thin. Where no guide had confirmed a method, this guide says so instead of inventing a location or a step — a cited guide beats an uncited one, however detailed.

---

<sub>Entered on [make.fun](https://make.fun/?ref=aes5np1n&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
