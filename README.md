# AI Wonders

A 7 Wonders-inspired strategy card game set in the AI industry. You lead one of 7 AI labs
(OpenAI, Anthropic, Google, Meta, xAI, ByteDance, Apple) racing toward AGI — against 6 AI
opponents, each with its own personality.

Rules basis: **7 Wonders 1st Edition** (Repos Production, 2010). Terminology and art are
AI-themed; the underlying mechanics (drafting, trading, conflicts, scoring) follow the
verified base-game rules. See `docs/DESIGN.md` for the full design document.

## Play

Open `index.html` in any modern browser — no build step, no server required. Works from
`file://` and from GitHub Pages.

1. Pick a language: **English** (default), **中文**, or **Español** (persisted).
2. Pick your lab (CEO portrait shown).
3. Each Era: draft 1 card per turn from a 7-card hand, then pass the hand
   (left in Eras I & III, right in Era II). Each turn: **build** the card,
   **fund a wonder stage**, or **pivot** (discard for +$3).
4. Buy missing resources from neighbors ($2 each, paid to the owner).
5. Rivalry conflicts resolve at the end of each Era.
6. Highest Victory Points after Era III wins (tie-break: most funding).

An in-game **How to Play** guide is narrated by the 7 AI assistants
(ChatGPT, Doubao, Gemini, Claude, Muse, Grok, Siri).

## Project layout

```
index.html          game shell (title screen, HUD, modals)
css/style.css       all styles (responsive, mobile-friendly)
js/cards.js         card database: 147 cards (49/age), 10 moonshots (9 drafted)
js/wonders.js       the 7 wonders + faction/CEO/AI-guide metadata
js/game.js          core engine (draft, payment, conflicts, scoring) + UI
js/ai.js            6 heuristic AI opponents with per-lab personalities
js/i18n.js          EN/中文/ES UI strings + localized card text
js/tutorial.js      How-to-Play scripts (one AI narrator per topic)
assets/portraits/   7 CEO + 7 AI portraits (transparent PNG, ROTK14 style)
assets/backgrounds/ title-screen panorama
docs/DESIGN.md      full game design document
```

## Rules implemented

- 7 players, 3 ages × 49 cards (Age III drafts 9 of 10 purple Moonshots at random)
- 6 turns/age; 6th-turn leftover card discarded for no coins
- Build / wonder-stage / pivot-for-$3; forced pivot when nothing is buildable
- Building chains: previous-Age prerequisite ⇒ free build
- Trading: neighbors only, $2/resource to the owner, start/brown/grey production only,
  same-turn builds not buyable, coins held at turn start, discounts ($1)
- Military: +1/+3/+5 vs −1 per neighbor per age; science = a²+b²+c²+7·min
- 7-category end scoring in order; coin tie-break, then shared victory
- Wonder powers: Stargate (+2 Hype/conflict), Constitutional AI (wild Breakthrough),
  TPU v7 (raw-of-choice/turn), Llama (+$9), Colossus II (free build/era),
  Seed (dig discards), Private Cloud Compute (VP stages)

## Notes

- All game logic is client-side vanilla JS; AI opponents run in-page.
- Card art is icon/color based; portraits are pre-rendered transparent PNGs.
- Repo language is English (code, comments, docs). 中文/ES exist only as UI locales.
