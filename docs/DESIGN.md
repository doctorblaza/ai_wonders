# AI Wonders — Game Design Document

> A 7 Wonders-inspired strategy card game set in the AI industry.
> 1 human player (picks 1 of 7 AI labs) vs 6 AI opponents. 3 UI languages: English (default), 中文, Español.
>
> Rules basis: 7 Wonders 1st Edition (Repos Production 2010), verified against the official EN rulebook
> (see `~/workspace/research_notes/seven-wonders-base-rules-20260927-1812/report.md`).
> Terminology and mechanics are AI-themed; the underlying rules follow the verified reference.

## 1. The Seven Labs (the 7 "civilizations")

Each lab has a unique Wonder (= flagship moonshot project, 3 build stages) and a starting resource
(produced every turn from game start, mirroring 7 Wonders' wonder starting resources).

| Lab | CEO (portrait) | AI Guide | Wonder (flagship project) | Starting resource |
|---|---|---|---|---|
| OpenAI | Sam Altman | ChatGPT | **Stargate** — the $500B compute cluster | GPU |
| Anthropic | Dario Amodei | Claude | **Constitutional AI** — safe superintelligence | Talent |
| Google | Sundar Pichai | Gemini | **TPU v7** — custom silicon empire | Data |
| Meta | Mark Zuckerberg | **Muse** | **Llama** — open-weights ecosystem | Talent |
| xAI | Elon Musk | Grok | **Colossus II** — gigawatt training cluster | Power |
| ByteDance | **Zhang Yiming** | Doubao (豆包) | **Seed** — the recommendation-to-reasoning engine | Data |
| Apple | Tim Cook | **Siri** | **Private Cloud Compute** — on-device AI | GPU |

## 2. Resources (AI-themed; structure mirrors 7 Wonders)

### Raw resources (brown cards) — 4
| Icon | EN | 中文 | Español |
|---|---|---|---|
| 🧑‍💻 | Talent | 人才 | Talento |
| 🎮 | GPU | GPU | GPU |
| 💾 | Data | 数据 | Datos |
| ⚡ | Power | 电力 | Energía |

### Refined resources (grey cards) — 3
| Icon | EN | 中文 | Español |
|---|---|---|---|
| 🧬 | Algorithm | 算法 | Algoritmo |
| 🏗️ | Architecture | 架构 | Arquitectura |
| 📜 | Patent | 专利 | Patente |

## 3. Card colors (per Era)

### 🟤 Brown — Infrastructure (raw resources)
Produce raw resources: 1 of one, 2 of one, or 1-of-2 choice.
Examples: "Talent Pipeline" (Talent), "GPU Farm" (GPU), "Data Lake" (Data), "Solar Array" (Power),
"Hiring Spree" (Talent×2), "Cloud Region" (GPU or Power).

### ⬜ Grey — Research Inputs (refined resources)
Produce 1 refined resource.
Examples: "Paper Reading Group" (Algorithm), "Systems Team" (Architecture), "IP Portfolio" (Patent),
"Fab Partnership" (Patent).

### 🔵 Blue — Ecosystem (victory points)
Pure influence/VP, VP printed on card, scored at game end.
Examples: "Developer Conference" (+5), "Open Source Release" (+3), "Viral Demo" (+4), "Keynote" (+6).

### 🟢 Green — Breakthroughs (science symbols, 3 types)
Symbols: **Model** (🤖), **Method** (🧪), **Insight** (💡).
Scoring (verified 7 Wonders formula): **VP = Model² + Method² + Insight² + 7 × min(Model, Method, Insight)**.
Examples: "Transformer++" (Model), "RLHF" (Method), "Scaling Laws" (Insight).

### 🟡 Yellow — Capital (funding, trade, some end-game VP)
Coins = **Funding ($)**. Effects: instant funding, trade discounts, resource production (not tradeable),
per-card payouts at build time, and end-game VP per card type in your city.
Examples: "Series C" (+$6), "API Revenue", "Cloud Credits" (discount), "Talent Agency" (trade discount).

### 🔴 Red — Rivalry (competition shields)
Shields = **Hype (声势)**. Counted at the end of each Era; compare vs each neighbor separately.
Examples: "Talent Raid", "Benchmark Sweep", "Launch Day", "Viral Launch".

### 🟣 Purple — Moonshots (Era III only)
Big end-game plays. Exactly **N+2** of the 10 moonshots are shuffled into Era III (7 players → 9),
mirroring 7 Wonders' guild selection.
Examples: "AGI Announcement" (VP per green card in neighboring cities),
"Open Weights" (VP per brown card in neighboring cities),
"Regulatory Capture" (VP per red card in neighboring cities),
"Superalignment" (VP per wonder stage in your city and neighbors').

## 4. Eras (the 3 Ages)

| Era | Theme | Draft direction |
|---|---|---|
| Era I | **Foundation** (奠基) | Left (clockwise) |
| Era II | **Scaling** (扩张) | Right (counter-clockwise) |
| Era III | **AGI Race** (AGI 竞赛) | Left (clockwise) |

Each Era (verified rules):
- Deal **7 cards per player** (7 players → 49-card deck per Era; Era III includes 9 moonshots).
- **6 turns** per Era: secretly pick 1 card → all players reveal and act simultaneously → pass the hand.
- **6th turn**: 2-card hand, play 1 normally; the leftover card is **discarded face-down for NO funding**.
- After the 6th turn, **rivalry conflicts** resolve vs both neighbors, then the next Era begins.

Per turn, exactly ONE action:
1. **Build** the card (pay its cost; never two structures with the same name in one city).
2. **Fund Wonder** — bury the card face-down under your Wonder to build the next stage
   (pay the *stage's* cost; stages built left to right, each once; optional; not tied to Eras).
3. **Pivot** — discard the card for **+$3 funding**.
- **Forced pivot**: if the card can be neither built nor used for a wonder stage, pivoting is mandatory.

## 5. Building chains (free construction)

Owning card X (built in a **previous** Era) lets you build card Y **for free** (ignore its resource cost).
Example chains:
- "ML Course" → "Paper Reading Group" → "Transformer++"
- "Seed Round" → "Series C" → "IPO"
- "GPU Farm" → "Training Cluster" → "Stargate Phase"
- "Hackathon" → "Developer Conference" → "Worldwide AI Summit"

## 6. Trading (verified 7 Wonders rules, AI-themed)

- Buy missing resources **only from your left/right neighbors**, **$2 per resource**, paid to the **owner**.
- Buyable: neighbor's **starting resource + brown cards + grey cards**.
  **NOT buyable**: yellow-card or wonder-stage production (reserved for the owner).
- "Produces X or Y" cards: the buyer picks either option independently of the owner's choice.
- You must hold the coins **at the start of the turn**; funding earned this turn is spendable next turn.
- You **cannot** buy from a building your neighbor built **this same turn**.
- Selling is never refused; production is never depleted (both neighbors + owner can use it).
- Discounts (yellow cards / wonder stages): specific resource types cost **$1** instead of $2
  from the specified neighbor(s).

## 7. Rivalry conflicts (end of each Era — 3 times total)

After Era I, II, and III (before the next Era begins / before final scoring):
- Compare your Hype (red shields + wonder-stage shields) vs **each neighbor separately**.
- Win: **+1** (Era I) / **+3** (Era II) / **+5** (Era III). Loss: **−1** (all Eras). Tie: nothing.
- Tokens sum at game end and **can be negative**.

## 8. Scoring (end of Era III, in this order)

1. **Rivalry tokens** — sum of conflict tokens (may be negative).
2. **Treasury** — 1 VP per $3 funding (remainder scores 0).
3. **Wonder** — VP printed on built wonder stages.
4. **Ecosystem** — VP printed on blue cards.
5. **Breakthroughs** — green formula: Σ(count²) + 7 per complete 3-symbol set.
6. **Capital** — yellow end-game effects.
7. **Moonshots** — purple effects.

Highest total wins. **Tie-break: most funding; further ties share the victory.**

## 9. The 7 Wonders (flagship projects, 3 stages each)

Stage costs are paid like card costs (own production and/or neighbor purchases).
Pattern follows 7 Wonders Side A: stage 1 ≈ 3 VP, stage 2 = special effect, stage 3 ≈ 7 VP.

| Lab | Wonder | Stage 1 (cost → reward) | Stage 2 (cost → reward) | Stage 3 (cost → reward) |
|---|---|---|---|---|
| OpenAI | **Stargate** | 2 Power → 3 VP | 3 GPU → +2 Hype in every conflict | 4 GPU → 7 VP |
| Anthropic | **Constitutional AI** | 2 Talent → 3 VP | 3 Algorithm → extra Breakthrough symbol of choice (chosen at game end) | 4 Talent → 7 VP |
| Google | **TPU v7** | 2 Data → 3 VP | 2 Architecture → 1 raw resource of choice each turn (not tradeable) | 2 Patent → 7 VP |
| Meta | **Llama** | 2 Talent → 3 VP | 2 Data → +$9 funding once, immediately | 2 Algorithm → 7 VP |
| xAI | **Colossus II** | 2 Power → 3 VP | 3 Power → build one structure for free, once per Era | 4 Power → 7 VP |
| ByteDance | **Seed** | 2 Data → 3 VP | 3 Data → look through ALL discards since game start and build one for free (end of this turn) | 3 Algorithm → 7 VP |
| Apple | **Private Cloud Compute** | 2 GPU → 3 VP | 3 Architecture → 5 VP | 4 GPU → 7 VP |



## 10. AI opponents (6)

Heuristic AI per opponent with a personality per lab:
- **OpenAI AI**: aggressive wonder-rushing (Stargate), favors red/blue.
- **Anthropic AI**: balanced, favors green/blue (safety + research).
- **Google AI**: resource engine, favors brown/grey.
- **Meta AI**: open-ecosystem, favors blue/yellow.
- **xAI AI**: aggressive rivalry, favors red.
- **ByteDance AI**: data-driven, favors yellow/green.
- **Apple AI**: patient, favors wonder + blue.

AI decision: score each playable card by (VP value + resource value + strategic fit + affordability),
pick the best; pivot weak hands for funding when nothing is playable or valuable. Difficulty: normal.

## 11. How to Play guide

In-game guide narrated by the 7 AI assistants, each covering their specialty:
- **ChatGPT** (OpenAI): Welcome & goal of the game
- **Doubao** (ByteDance): Drafting & playing cards
- **Gemini** (Google): Resources & trading
- **Claude** (Anthropic): Eras & rivalry conflicts
- **Muse** (Meta): Wonders & building stages
- **Grok** (xAI): Breakthroughs & scoring
- **Siri** (Apple): Tips & FAQ

Each guide section shows that AI's portrait + a short script (localized in EN/ZH/ES).

## 12. Art direction

**Style**: Romance of the Three Kingdoms XIV (三国志14) — dramatic oil-painted character portraits.

- **7 CEO portraits**: ROTK14-style painted portraits, facial features strictly matching reference photos.
  **Transparent backgrounds** (PNG with alpha) — required for card/game UI compositing.
- **7 AI portraits**: personified AI characters in ROTK14 style, **transparent backgrounds** (PNG with alpha).
- **Backgrounds**: 1 title-screen panorama (AI data-center "battlefield" in ROTK14 map style),
  1 game-table background. These keep full painted scenery (NOT transparent).
- **Card art**: icon-based (no per-card illustration); color-coded frames per card type.
- **No text on portraits** (no names, no watermarks).

## 13. Tech

- Static web game (HTML/CSS/JS), GitHub Pages hosting.
- `index.html` + `js/` modules + `i18n/{en,zh,es}.json`.
- All game logic client-side; AI opponents run in-page.
- Repo language: English only (README, code, comments, commits). ZH/ES exist only as UI locale strings.
- UI language switcher: **EN (default)** / 中文 / ES, persisted in localStorage.
- Default game: 1 human + 6 AI, no setup required.

## 14. File layout

```
ai_wonders/
├── index.html          # game shell + language picker
├── css/style.css
├── js/
│   ├── game.js         # core engine (draft, build, conflicts, scoring)
│   ├── ai.js           # 6 AI opponents
│   ├── cards.js        # card database (all 3 eras, 49 cards each)
│   ├── wonders.js      # 7 wonders
│   └── guide.js        # How-to-Play scripts
├── i18n/en.json, zh.json, es.json
├── assets/
│   ├── portraits/ceo/*.png      (7, transparent)
│   ├── portraits/ai/*.png       (7, transparent)
│   └── backgrounds/*.png       (title + table)
├── docs/DESIGN.md (this file)
└── README.md
```

## 15. Card counts (verified 7 Wonders 7-player scale)

- **Era I: 49 cards. Era II: 49 cards. Era III: 49 cards (incl. 9 moonshots).**
- Per-card copy counts follow the 7 Wonders min-player-badge distribution pattern
  (some cards appear once, others up to 2–3 copies at 7 players).
- Brown/grey cards exist only in Eras I & II; purple moonshots only in Era III.
