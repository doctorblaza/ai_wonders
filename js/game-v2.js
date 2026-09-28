// AI Wonders - Core game engine (rules, turn flow, scoring)
// 7 players (1 human + 6 AI). 3 ages x 49 cards. 6 turns/age.

let G = null; // game state

// Remove a SINGLE instance of id from arr (hands/discards can hold duplicate copies).
function removeOne(arr, id) {
  const i = arr.indexOf(id);
  if (i >= 0) arr.splice(i, 1);
  return arr;
}

function leftOf(i) { return (i + 1) % 7; }
function rightOf(i) { return (i + 6) % 7; }

function newPlayerState() {
  return {
    coins: 3, turnStartCoins: 3,
    city: [],            // [{id, age}]
    wonderBuilt: 0,
    xaiUsed: {},         // era -> true (Colossus II free build)
    military: [],        // [{age, value}]
    hand: [],
    ownSets: [],         // snapshot: own production option-sets
    tradeProd: [],        // snapshot: tradeable production option-sets
    anthropicWild: null, // chosen at game end
    justBuiltSeed2: false,
  };
}

function newGame(humanFactionId) {
  const others = FACTIONS.map(f => f.id).filter(id => id !== humanFactionId);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const players = [{ idx: 0, factionId: humanFactionId, isHuman: true, ...newPlayerState() }];
  others.forEach((fid, k) => players.push({ idx: k + 1, factionId: fid, isHuman: false, ...newPlayerState() }));
  G = { players, age: 1, turn: 1, dir: 'left', discards: [], log: [], phase: 'setup', choices: {}, seedQueue: [] };
  addLog(t('title') + ' — ' + t('startGame'));
  startAge(1);
}

// ---------- Production ----------

function tradeableProdSets(p) {
  const sets = [];
  sets.push([WONDERS[p.factionId].startRes]);
  for (const e of p.city) {
    const c = CARD_MAP[e.id];
    if (!c) continue;
    if ((c.color === 'brown' || c.color === 'grey') && c.prod) {
      for (const k in c.prod) for (let i = 0; i < c.prod[k]; i++) sets.push([k]);
    } else if (c.prodChoice && !c.notTradeable) {
      sets.push([...c.prodChoice]);
    }
  }
  return sets;
}

function ownProdSets(p) {
  const sets = tradeableProdSets(p);
  for (const e of p.city) {
    const c = CARD_MAP[e.id];
    if (c && c.prodChoice && c.notTradeable) sets.push([...c.prodChoice]);
  }
  if (p.factionId === 'google' && p.wonderBuilt >= 2) sets.push([...RES_RAW]);
  return sets;
}

// Cheapest payment plan for a cost, using turn-start snapshots.
// Returns null if unaffordable, else {bankCoins, purchaseCost, purchases:[{to,dir,res,price}]}.
function computePayment(pIdx, cost) {
  const P = G.players[pIdx];
  const startCoins = P.turnStartCoins;
  const bankCoins = cost.coins || 0;
  if (bankCoins > startCoins) return null;
  const need = [];
  for (const k in (cost.res || {})) for (let i = 0; i < cost.res[k]; i++) need.push(k);
  if (!need.length) return { bankCoins, purchaseCost: 0, purchases: [] };

  const ownSets = P.ownSets;
  const nbs = [];
  const dirs = [['left', leftOf(pIdx)], ['right', rightOf(pIdx)]];
  for (const [dirName, nbIdx] of dirs) {
    const sets = G.players[nbIdx].tradeProd.map(opts => ({ opts: [...opts], used: false }));
    const price = {};
    for (const r of RES_ALL) price[r] = 2;
    for (const e of P.city) {
      const c = CARD_MAP[e.id];
      if (c && c.discount) {
        const d = c.discount;
        if (d.dir === 'both' || d.dir === dirName) {
          for (const r of (d.types === 'raw' ? RES_RAW : RES_REFINED)) price[r] = 1;
        }
      }
    }
    nbs.push({ idx: nbIdx, dir: dirName, sets, price });
  }

  let best = null;
  const usedOwn = new Array(ownSets.length).fill(false);
  function dfs(i, purchases, purchaseCost) {
    if (best && purchaseCost >= best.purchaseCost) return;
    if (i === need.length) {
      if (bankCoins + purchaseCost <= startCoins) {
        if (!best || purchaseCost < best.purchaseCost)
          best = { purchaseCost, purchases: purchases.map(x => ({ ...x })) };
      }
      return;
    }
    const r = need[i];
    for (let u = 0; u < ownSets.length; u++) {
      if (!usedOwn[u] && ownSets[u].includes(r)) {
        usedOwn[u] = true;
        dfs(i + 1, purchases, purchaseCost);
        usedOwn[u] = false;
      }
    }
    for (const nb of nbs) {
      for (const s of nb.sets) {
        if (!s.used && s.opts.includes(r)) {
          s.used = true;
          purchases.push({ to: nb.idx, dir: nb.dir, res: r, price: nb.price[r] });
          dfs(i + 1, purchases, purchaseCost + nb.price[r]);
          purchases.pop();
          s.used = false;
        }
      }
    }
  }
  dfs(0, [], 0);
  if (!best) return null;
  return { bankCoins, purchaseCost: best.purchaseCost, purchases: best.purchases };
}

// Chain: prerequisite built in a PREVIOUS age => free build.
function chainAvailable(p, card) {
  if (!card.freeFrom) return false;
  const reqs = Array.isArray(card.freeFrom) ? card.freeFrom : [card.freeFrom];
  return reqs.some(reqId => p.city.some(e => e.id === reqId && e.age < G.age));
}

function buildInfo(pIdx, cardId) {
  const p = G.players[pIdx];
  const card = CARD_MAP[cardId];
  if (p.city.some(e => e.id === cardId)) return { ok: false, reason: 'dup' };
  if (chainAvailable(p, card))
    return { ok: true, free: true, payment: { bankCoins: 0, purchaseCost: 0, purchases: [] } };
  const payment = computePayment(pIdx, card.cost);
  if (!payment) return { ok: false, reason: 'cost' };
  return { ok: true, free: false, payment };
}

function wonderInfo(pIdx) {
  const p = G.players[pIdx];
  const w = WONDERS[p.factionId];
  if (p.wonderBuilt >= 3) return { ok: false, reason: 'max' };
  const payment = computePayment(pIdx, w.stages[p.wonderBuilt].cost);
  if (!payment) return { ok: false, reason: 'cost' };
  return { ok: true, stageIdx: p.wonderBuilt, stage: w.stages[p.wonderBuilt], payment };
}

// ---------- Age / turn flow ----------

function startAge(age) {
  G.age = age; G.turn = 1;
  G.dir = (age === 2) ? 'right' : 'left';
  const deck = buildDeck(age);
  for (let i = 0; i < 7; i++) G.players[i].hand = deck.slice(i * 7, i * 7 + 7);
  addLog('—— ' + t('era') + ' ' + ['I','II','III'][age-1] + ' · ' + t('eraName' + age) + ' ——');
  startTurn();
}

function startTurn() {
  G.phase = 'choose';
  for (const p of G.players) {
    p.turnStartCoins = p.coins;
    p.ownSets = ownProdSets(p);
    p.tradeProd = tradeableProdSets(p);
  }
  G.choices = {};
  UI.selectedCard = null;
  renderAll();
}

function passHands() {
  const hands = G.players.map(p => p.hand);
  for (let i = 0; i < 7; i++) {
    const dest = (G.dir === 'left') ? leftOf(i) : rightOf(i);
    G.players[dest].hand = hands[i];
  }
}

// Human confirms card + action.
function humanChoose(cardId, action) {
  if (!G || G.phase !== 'choose') return;
  const p = G.players[0];
  if (!p.hand.includes(cardId)) return;
  const card = CARD_MAP[cardId];
  let choice = null;
  if (action === 'build') {
    const bi = buildInfo(0, cardId);
    if (!bi.ok) return;
    choice = { cardId, action, payment: bi.payment, free: bi.free };
  } else if (action === 'wonder') {
    const wi = wonderInfo(0);
    if (!wi.ok) return;
    choice = { cardId, action, payment: wi.payment, stageIdx: wi.stageIdx };
  } else if (action === 'discard') {
    choice = { cardId, action };
  } else return;
  G.choices[0] = choice;
  aiChooseAllAndResolve();
}

// AI picks for all AI players (skipping empty hands), then resolve.
function aiChooseAllAndResolve() {
  for (let i = 1; i < 7; i++) { const ch = aiChoose(i); if (ch) G.choices[i] = ch; }
  resolveTurn();
}

// Human has no cards (xAI free build consumed the last one): just continue.
function humanSkip() {
  if (!G || G.phase !== 'choose') return;
  aiChooseAllAndResolve();
}

// ---------- Resolution (simultaneous) ----------

function resolveTurn() {
  G.phase = 'resolve';
  const builtCards = [];   // [{pIdx, card}]
  const builtWonders = []; // [{pIdx, stageIdx}]

  // Pass 1: payments + placements
  for (let i = 0; i < 7; i++) {
    const p = G.players[i];
    const ch = G.choices[i];
    if (!ch) continue; // empty hand (xAI free build used every card): no action
    const card = CARD_MAP[ch.cardId];
    if (ch.action === 'build' || ch.action === 'wonder') {
      const pay = ch.payment;
      p.coins -= (pay.bankCoins + pay.purchaseCost);
      for (const pur of pay.purchases) G.players[pur.to].coins += pur.price;
    }
    if (ch.action === 'build') {
      p.city.push({ id: ch.cardId, age: G.age });
      removeOne(p.hand, ch.cardId);
      builtCards.push({ pIdx: i, card });
      addLog(`${fname(i)}: ${t('msg_cardBuilt')} ${card.name[LANG]}${ch.free ? ' (' + t('free') + ')' : ''}`);
    } else if (ch.action === 'wonder') {
      p.wonderBuilt++;
      removeOne(p.hand, ch.cardId);
      builtWonders.push({ pIdx: i, stageIdx: ch.stageIdx });
      addLog(`${fname(i)}: ${t('msg_wonderBuilt')} (${WONDERS[p.factionId].name[LANG]} ${ch.stageIdx + 1}/3)`);
    } else {
      p.coins += 3;
      G.discards.push(ch.cardId);
      removeOne(p.hand, ch.cardId);
      addLog(`${fname(i)}: ${t('msg_pivoted')} (${card.name[LANG]})`);
    }
  }

  // Pass 2: instant effects (cities are final, incl. same-turn builds)
  for (const { pIdx, card } of builtCards) applyBuildEffect(pIdx, card);
  for (const { pIdx, stageIdx } of builtWonders) applyWonderReward(pIdx, stageIdx);

  // ByteDance Seed stage 2: dig discards at end of this turn
  processSeedQueue();
}

function applyBuildEffect(pIdx, card) {
  const p = G.players[pIdx];
  if (card.coins) p.coins += card.coins;
  if (card.perCard && card.perCard.coins) {
    const n = countCards(pIdx, card.perCard.color, card.perCard.who);
    p.coins += card.perCard.coins * n;
  }
}

function applyWonderReward(pIdx, stageIdx) {
  const p = G.players[pIdx];
  const w = WONDERS[p.factionId];
  const stage = w.stages[stageIdx];
  if (stage.effect === 'coins9') p.coins += 9;
  // 'hype2', 'sciWild', 'rawChoice', 'freeBuild', 'digDiscard' handled elsewhere
  if (w.id === 'bytedance' && stageIdx === 1) p.justBuiltSeed2 = true;
}

function processSeedQueue() {
  for (let i = 0; i < 7; i++) {
    const p = G.players[i];
    if (p.justBuiltSeed2) {
      p.justBuiltSeed2 = false;
      if (p.isHuman) { showSeedModal(i, () => finishTurn()); return; }
      aiSeedDig(i);
    }
  }
  finishTurn();
}

function finishTurn() {
  if (G.turn === 6) {
    for (const p of G.players) {
      if (p.hand.length) {
        for (const cid of p.hand) G.discards.push(cid);
        p.hand = [];
        addLog(`${fname(p.idx)}: ${t('msg_discarded6th')}`);
      }
    }
    resolveConflicts();
    if (G.age === 3) gameOver();
    else startAge(G.age + 1);
  } else {
    passHands();
    G.turn++;
    startTurn();
  }
}

// ---------- Military ----------

function shieldsOf(pIdx) {
  const p = G.players[pIdx];
  let s = 0;
  for (const e of p.city) { const c = CARD_MAP[e.id]; if (c && c.shields) s += c.shields; }
  if (p.factionId === 'openai' && p.wonderBuilt >= 2) s += 2;
  return s;
}

function resolveConflicts() {
  const val = { 1: 1, 2: 3, 3: 5 }[G.age];
  addLog('—— ' + t('conflictTitle') + ' (' + t('era') + ' ' + ['I','II','III'][G.age-1] + ') ——');
  for (let i = 0; i < 7; i++) {
    const my = shieldsOf(i);
    for (const nb of [leftOf(i), rightOf(i)]) {
      const theirs = shieldsOf(nb);
      let v = 0, res;
      if (my > theirs) { v = val; res = t('win'); }
      else if (my < theirs) { v = -1; res = t('loss'); }
      else res = t('tie');
      if (v !== 0) G.players[i].military.push({ age: G.age, value: v });
      addLog(t('msg_conflict', { you: fname(i), a: my, b: fname(nb), c: theirs }) + ' → ' + res + (v ? ` (${v > 0 ? '+' : ''}${v})` : ''));
    }
  }
}

// ---------- Scoring ----------

function countCards(pIdx, color, who) {
  const countIn = (idx) => {
    const p = G.players[idx];
    if (color === 'wonder') return p.wonderBuilt;
    if (color === 'defeat') return p.military.filter(x => x.value < 0).length;
    let n = 0;
    for (const e of p.city) {
      const c = CARD_MAP[e.id];
      if (!c) continue;
      if (color === 'brown+grey+purple') { if (['brown','grey','purple'].includes(c.color)) n++; }
      else if (c.color === color) n++;
    }
    return n;
  };
  if (who === 'self') return countIn(pIdx);
  if (who === 'neighbors') return countIn(leftOf(pIdx)) + countIn(rightOf(pIdx));
  if (who === 'all') return countIn(pIdx) + countIn(leftOf(pIdx)) + countIn(rightOf(pIdx));
  return 0;
}

function bestScienceScore(m, d, i, w) {
  let best = 0;
  (function rec(wm, wd, wi, left) {
    if (left === 0) {
      const v = wm*wm + wd*wd + wi*wi + 7 * Math.min(wm, wd, wi);
      if (v > best) best = v;
      return;
    }
    rec(wm+1, wd, wi, left-1); rec(wm, wd+1, wi, left-1); rec(wm, wd, wi+1, left-1);
  })(m, d, i, w);
  return best;
}

function scorePlayer(pIdx) {
  const p = G.players[pIdx];
  const s = { military: 0, treasury: 0, wonder: 0, blue: 0, green: 0, yellow: 0, purple: 0 };
  for (const x of p.military) s.military += x.value;
  s.treasury = Math.floor(p.coins / 3);
  const w = WONDERS[p.factionId];
  for (let i = 0; i < p.wonderBuilt; i++) s.wonder += w.stages[i].vp || 0;
  const sci = { model: 0, method: 0, insight: 0, wild: 0 };
  for (const e of p.city) {
    const c = CARD_MAP[e.id];
    if (!c) continue;
    if (c.color === 'blue') s.blue += c.vp || 0;
    if (c.color === 'green' && c.sci) sci[c.sci]++;
    if (c.color === 'yellow' && c.perCard && c.perCard.vp)
      s.yellow += c.perCard.vp * countCards(pIdx, c.perCard.color, c.perCard.who);
    if (c.color === 'purple') {
      if (c.sciWild) sci.wild++;
      else if (c.perCard) s.purple += c.perCard.vp * countCards(pIdx, c.perCard.color, c.perCard.who);
    }
  }
  if (p.factionId === 'anthropic' && p.wonderBuilt >= 2 && p.anthropicWild) sci[p.anthropicWild]++;
  s.green = bestScienceScore(sci.model, sci.method, sci.insight, sci.wild);
  s.total = s.military + s.treasury + s.wonder + s.blue + s.green + s.yellow + s.purple;
  s.coins = p.coins;
  return s;
}

function gameOver() {
  G.phase = 'gameover';
  // AI Anthropic players: auto-pick optimal wild symbol
  for (const p of G.players) {
    if (!p.isHuman && p.factionId === 'anthropic' && p.wonderBuilt >= 2 && !p.anthropicWild)
      aiAnthropicWild(p.idx);
  }
  // Human Anthropic player picks; everyone else goes straight to scores
  const p0 = G.players[0];
  if (p0.factionId === 'anthropic' && p0.wonderBuilt >= 2 && !p0.anthropicWild) {
    showSciWildModal(0, 'anthropic', () => showFinalScores());
    return;
  }
  showFinalScores();
}

function showFinalScores() {
  const rows = G.players.map(p => ({ p, s: scorePlayer(p.idx) }));
  rows.sort((a, b) => (b.s.total - a.s.total) || (b.s.coins - a.s.coins));
  const top = rows[0].s.total;
  const tied = rows.filter(r => r.s.total === top && r.s.coins === rows[0].s.coins);
  G.results = { rows, winners: tied.map(r => r.p.idx) };
  addLog('—— ' + t('gameOver') + ' ——');
  renderGameOver();
}

// ---------- Helpers ----------

function fname(i) {
  const p = G.players[i];
  const f = FACTION_MAP[p.factionId];
  return p.isHuman ? '🧑 ' + f.name[LANG] : f.ceo[LANG] + ' (' + f.name[LANG] + ')';
}

function addLog(msg) {
  G.log.push(msg);
  const el = document.getElementById('log');
  if (el) { el.innerHTML = G.log.map(m => `<div>${m}</div>`).join(''); el.scrollTop = el.scrollHeight; }
}

// ---------- Bonus actions ----------

// xAI Colossus II stage 2: build one structure free, once per Era.
// Human triggers via UI button on their turn; AI uses it during its choice.
function xaiFreeBuildAvailable(pIdx) {
  const p = G.players[pIdx];
  return p.factionId === 'xai' && p.wonderBuilt >= 2 && !p.xaiUsed[G.age] &&
         G.phase === 'choose' && p.hand.length > 0;
}

function humanXaiFreeBuild(cardId) {
  const p = G.players[0];
  if (!xaiFreeBuildAvailable(0) || !p.hand.includes(cardId)) return false;
  if (p.city.some(e => e.id === cardId)) return false; // no duplicates
  p.city.push({ id: cardId, age: G.age });
  removeOne(p.hand, cardId);
  p.xaiUsed[G.age] = true;
  applyBuildEffect(0, CARD_MAP[cardId]);
  addLog(`${fname(0)}: ${t('useFreeBuild')} — ${CARD_MAP[cardId].name[LANG]} (${t('free')})`);
  if (p.hand.length === 0) { humanSkip(); return true; } // no cards left: turn is done
  startTurn(); // re-snapshot (hand changed); keep turn/phase
  return true;
}

// ByteDance Seed stage 2: dig ALL discards, build one free (end of the turn the stage was built).
function seedDigChoices(pIdx) {
  const p = G.players[pIdx];
  const seen = new Set(p.city.map(e => e.id));
  return [...new Set(G.discards)].filter(id => !seen.has(id));
}

function doSeedDig(pIdx, cardId) {
  const p = G.players[pIdx];
  if (!G.discards.includes(cardId)) return false;
  if (p.city.some(e => e.id === cardId)) return false;
  removeOne(G.discards, cardId);
  p.city.push({ id: cardId, age: G.age });
  applyBuildEffect(pIdx, CARD_MAP[cardId]);
  addLog(`${fname(pIdx)}: Seed dig → ${CARD_MAP[cardId].name[LANG]} (${t('free')})`);
  return true;
}

// Anthropic stage 2 / Scientists' Guild wilds are chosen at game end.
// For AI we auto-optimize; the human gets a modal.
function optimalWildFor(pIdx, sciCounts) {
  let bestSym = 'model', bestScore = -1;
  for (const sym of ['model', 'method', 'insight']) {
    const c = { ...sciCounts, [sym]: sciCounts[sym] + 1 };
    const v = bestScienceScore(c.model, c.method, c.insight, c.wild);
    if (v > bestScore) { bestScore = v; bestSym = sym; }
  }
  return bestSym;
}

// ==================== UI ====================

const UI = { selectedCard: null, showOppCity: {}, lang: 'en' };

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function cardHTML(cid, opts = {}) {
  const c = CARD_MAP[cid];
  const sel = opts.selected ? ' selected' : '';
  const dis = opts.disabled ? ' disabled' : '';
  return `<div class="card color-${c.color}${sel}${dis}" data-card="${cid}" ${opts.clickable ? `onclick="UI_pickCard('${cid}')"` : ''}>
    <div class="card-art"><img src="assets/cards/${cid}.webp" alt="" loading="lazy" onerror="this.style.display='none'"></div>
    <div class="card-name">${esc(c.name[LANG])}</div>
    <div class="card-cost">${esc(cardCostText(c))}</div>
    <div class="card-effect">${esc(cardEffectText(c))}</div>
  </div>`;
}

const WONDER_ART = { openai:'stargate', anthropic:'constitutionalai', google:'tpuv7', meta:'llama', xai:'colossus2', bytedance:'seed', apple:'privatecloud' };

function wonderHTML(p) {
  const w = WONDERS[p.factionId];
  let stages = '';
  for (let i = 0; i < 3; i++) {
    const st = w.stages[i];
    const built = i < p.wonderBuilt;
    const costTxt = st.cost.coins || Object.keys(st.cost.res || {}).length
      ? (() => { const b=[]; if (st.cost.coins) b.push('$'+st.cost.coins);
          for (const k in (st.cost.res||{})) b.push(resName(k) + (st.cost.res[k]>1?'×'+st.cost.res[k]:''));
          return b.join(' + '); })()
      : t('free');
    const reward = st.vp ? t('eff_vp',{n:st.vp}) : (st.desc ? st.desc[LANG] : (st.effect ? t('eff_'+st.effect) : ''));
    stages += `<div class="wstage${built?' built':''}"><b>${i+1}</b> ${esc(costTxt)} → ${esc(reward)}</div>`;
  }
  return `<div class="wonder"><div class="wonder-art"><img src="assets/wonders/${WONDER_ART[p.factionId]}.webp" alt="" loading="lazy" onerror="this.style.display='none'"></div><div class="wonder-name">${esc(w.name[LANG])}</div>${stages}</div>`;
}

function cityCompact(p) {
  const byColor = {};
  for (const e of p.city) { const c = CARD_MAP[e.id]; byColor[c.color] = (byColor[c.color]||0)+1; }
  return ['brown','grey','blue','green','yellow','red','purple']
    .filter(k => byColor[k]).map(k => `<span class="dot color-${k}" title="${t('color_'+k)}">${byColor[k]}</span>`).join(' ');
}

function oppPanel(p) {
  const f = FACTION_MAP[p.factionId];
  const isL = p.idx === leftOf(0), isR = p.idx === rightOf(0);
  const tag = isL ? t('leftNeighbor') : isR ? t('rightNeighbor') : '';
  const open = UI.showOppCity[p.idx];
  let detail = '';
  if (open) {
    const cards = p.city.map(e => `<div class="minicard color-${CARD_MAP[e.id].color}" title="${esc(cardEffectText(CARD_MAP[e.id]))}">${esc(CARD_MAP[e.id].name[LANG])}</div>`).join('');
    detail = `<div class="opp-detail">${wonderHTML(p)}<div class="opp-cards">${cards || '—'}</div></div>`;
  }
  return `<div class="opp${isL||isR?' neighbor':''}">
    <img class="opp-img" src="${f.ceoImg}" alt="${esc(f.ceo[LANG])}" onclick="UI_toggleOpp(${p.idx})">
    <div class="opp-info" onclick="UI_toggleOpp(${p.idx})">
      <div class="opp-name">${esc(f.ceo[LANG])} <span class="opp-fac">${esc(f.name[LANG])}</span>${tag?` <span class="ntag">${tag}</span>`:''}</div>
      <div class="opp-stats">$${p.coins} · 🛡${shieldsOf(p.idx)} · ★${p.wonderBuilt}/3 ${cityCompact(p)}</div>
    </div>${detail}</div>`;
}

function renderAll() {
  if (!G) return;
  if (G.phase === 'gameover') { renderGameOver(); return; }
  // header
  document.getElementById('hud-era').textContent =
    `${t('era')} ${['I','II','III'][G.age-1]} · ${t('eraName'+G.age)} — ${t('turn')} ${G.turn}/6`;
  // opponents
  document.getElementById('opponents').innerHTML =
    G.players.slice(1).map(oppPanel).join('');
  // player city
  const p = G.players[0];
  const f = FACTION_MAP[p.factionId];
  const cityCards = p.city.map(e => cardHTML(e.id)).join('');
  document.getElementById('city').innerHTML = `
    <div class="phead">
      <img class="phead-img" src="${f.ceoImg}" alt="">
      <div><b>${esc(f.ceo[LANG])}</b> · ${esc(f.name[LANG])}<br>
      <span class="pstats">$${p.coins} ${t('coins')} · 🛡${shieldsOf(0)} ${t('shields')}</span></div>
      <img class="phead-ai" src="${f.aiImg}" title="${esc(f.guide[LANG])}" alt="">
    </div>
    ${wonderHTML(p)}
    <div class="city-cards">${cityCards || '<span class="dim">—</span>'}</div>`;
  renderHand();
  renderLog();
}

function renderHand() {
  const p = G.players[0];
  const handEl = document.getElementById('hand');
  if (G.phase !== 'choose') { handEl.innerHTML = `<div class="dim">${t('waitingAI')}</div>`; renderActions(); return; }
  if (!p.hand.length) {
    handEl.innerHTML = `<div class="dim">—</div>`;
    document.getElementById('action-bar').innerHTML =
      `<button class="btn big" onclick="humanSkip()">${t('confirm')}</button>`;
    return;
  }
  handEl.innerHTML = `<div class="hand-label">${t('yourHand')}</div><div class="hand-cards">` +
    p.hand.map(cid => cardHTML(cid, { clickable: true, selected: UI.selectedCard === cid })).join('') +
    '</div>';
  renderActions();
}

function paymentText(pay) {
  const bits = [];
  if (pay.bankCoins) bits.push('$' + pay.bankCoins + ' → bank');
  for (const pur of pay.purchases) {
    const seller = FACTION_MAP[G.players[pur.to].factionId];
    bits.push(`$${pur.price} ${resName(pur.res)} → ${esc(seller.name[LANG])} (${t('dir_'+pur.dir)})`);
  }
  return bits.length ? bits.join(' · ') : t('free');
}

function renderActions() {
  const bar = document.getElementById('action-bar');
  const p = G.players[0];
  if (G.phase !== 'choose' || !UI.selectedCard) {
    // xAI free build button can show even without selection
    bar.innerHTML = xaiButtonHTML();
    return;
  }
  const cid = UI.selectedCard, card = CARD_MAP[cid];
  const bi = buildInfo(0, cid);
  const wi = wonderInfo(0);
  let html = `<div class="selinfo"><b>${esc(card.name[LANG])}</b> — ${esc(cardCostText(card))} · ${esc(cardEffectText(card))}</div><div class="abtns">`;
  if (bi.ok) {
    const extra = bi.free ? ` (${t('viaChain')})` : (bi.payment.purchaseCost || bi.payment.bankCoins) ? ` — ${paymentText(bi.payment)}` : '';
    html += `<button class="btn build" onclick="UI_doAction('build')">${t('build')}${extra}</button>`;
  } else {
    html += `<button class="btn" disabled>${t('build')} (${bi.reason==='dup'?t('alreadyBuilt'):t('cannotAfford')})</button>`;
  }
  if (wi.ok) {
    html += `<button class="btn wonder" onclick="UI_doAction('wonder')">${t('buildWonder')} ${wi.stageIdx+1}/3 — ${paymentText(wi.payment)}</button>`;
  } else {
    const r = wi.reason === 'max' ? t('err_noWonderStage') : t('cannotAfford');
    html += `<button class="btn" disabled>${t('buildWonder')} (${r})</button>`;
  }
  html += `<button class="btn discard" onclick="UI_doAction('discard')">${t('discard')}</button>`;
  html += xaiButtonHTML();
  html += '</div>';
  bar.innerHTML = html;
}

function xaiButtonHTML() {
  if (xaiFreeBuildAvailable(0) && !UI.selectedCard)
    return `<button class="btn xai" onclick="UI_xaiPick()">${t('useFreeBuild')} (${t('free')})</button>`;
  return '';
}

function renderLog() {
  const el = document.getElementById('log');
  el.innerHTML = G.log.map(m => `<div>${m}</div>`).join('');
  el.scrollTop = el.scrollHeight;
}

// ---------- UI event handlers (global) ----------

function UI_pickCard(cid) {
  if (G.phase !== 'choose') return;
  if (UI.xaiMode) { // picking a card for xAI free build
    if (humanXaiFreeBuild(cid)) { UI.xaiMode = false; }
    return;
  }
  UI.selectedCard = (UI.selectedCard === cid) ? null : cid;
  renderHand();
}

function UI_doAction(action) {
  if (!UI.selectedCard) return;
  const cid = UI.selectedCard;
  UI.selectedCard = null;
  humanChoose(cid, action);
}

function UI_xaiPick() {
  UI.xaiMode = true;
  UI.selectedCard = null;
  document.getElementById('hand').innerHTML =
    `<div class="hand-label">${t('useFreeBuild')} — ${t('yourHand')}</div><div class="hand-cards">` +
    G.players[0].hand.map(cid => cardHTML(cid, { clickable: true })).join('') + '</div>';
  document.getElementById('action-bar').innerHTML =
    `<button class="btn" onclick="UI_xaiCancel()">${t('cancel')}</button>`;
}

function UI_xaiCancel() { UI.xaiMode = false; renderHand(); }

function UI_toggleOpp(idx) { UI.showOppCity[idx] = !UI.showOppCity[idx]; renderAll(); }

function UI_setLang(l) {
  setLang(l);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    el.textContent = t(k);
  });
  if (G) renderAll(); else renderTitle();
}

// ---------- Modals ----------

function showModal(html) {
  const m = document.getElementById('modal');
  m.innerHTML = `<div class="modal-box">${html}</div>`;
  m.classList.remove('hidden');
}
function hideModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal').innerHTML = '';
}

function showSeedModal(pIdx, done) {
  const opts = seedDigChoices(pIdx);
  if (!opts.length) { done(); return; }
  showModal(`<h3>${t('digTitle')}</h3><div class="modal-cards">` +
    opts.map(cid => cardHTML(cid, { clickable: false }) +
      `<button class="btn build" onclick="UI_seedPick('${cid}')">${t('build')} (${t('free')})</button>`).join('') +
    `</div><button class="btn" onclick="UI_seedSkip()">${t('cancel')}</button>`);
  UI._seedDone = done; UI._seedP = pIdx;
}
function UI_seedPick(cid) {
  doSeedDig(UI._seedP, cid);
  const d = UI._seedDone; hideModal(); renderAll(); d();
}
function UI_seedSkip() { const d = UI._seedDone; hideModal(); d(); }

function showSciWildModal(pIdx, kind, done) {
  showModal(`<h3>${t('sciWildTitle')}</h3><div class="abtns">` +
    ['model','method','insight'].map(s =>
      `<button class="btn build" onclick="UI_wildPick('${s}')">🔬 ${sciName(s)}</button>`).join('') +
    '</div>');
  UI._wildDone = done; UI._wildP = pIdx;
}
function UI_wildPick(sym) {
  const p = G.players[UI._wildP];
  p.anthropicWild = sym;
  const d = UI._wildDone; hideModal(); d();
}

// ---------- Title screen ----------

function renderTitle() {
  const ts = document.getElementById('title-screen');
  ts.innerHTML = `
    <div class="title-bg"></div>
    <div class="title-inner">
      <h1>${t('title')}</h1>
      <p class="subtitle">${t('subtitle')}</p>
      <div class="lang-row"><span>${t('chooseLanguage')}:</span>
        ${['en','zh','es'].map(l => `<button class="btn lang${LANG===l?' active':''}" onclick="UI_setLang('${l}')">${I18N[l].langName}</button>`).join('')}
      </div>
      <h2>${t('chooseFaction')}</h2>
      <div class="faction-grid">
        ${FACTIONS.map(f => { const w = WONDERS[f.id]; return `
          <div class="faction" onclick="UI_start('${f.id}')">
            <img src="${f.ceoImg}" alt="${esc(f.ceo[LANG])}">
            <div class="fac-name">${esc(f.name[LANG])}</div>
            <div class="fac-ceo">${esc(f.ceo[LANG])}</div>
            <div class="fac-wonder">${esc(w.name[LANG])} · ${resName(w.startRes)}</div>
          </div>`; }).join('')}
      </div>
      <button class="btn big" onclick="UI_guide()">${t('howToPlay')}</button>
    </div>`;
}

// ---------- Guide ----------

function UI_guide() {
  const secs = GUIDE_SECTIONS.map(s => {
    const f = FACTION_MAP[s.faction];
    return `<div class="guide-sec">
      <img src="${f.aiImg}" alt="${esc(f.guide[LANG])}">
      <div><h3>${esc(f.guide[LANG])} — ${esc(s.title[LANG])}</h3><p>${esc(s.body[LANG])}</p></div>
    </div>`;
  }).join('');
  showModal(`<h2>${t('guideTitle')}</h2><div class="guide-list">${secs}</div>
    <button class="btn" onclick="hideModal()">${t('close')}</button>`);
}

function UI_start(fid) {
  hideModal();
  document.getElementById('title-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  newGame(fid);
}

// ---------- Game over ----------

function renderGameOver() {
  const { rows, winners } = G.results;
  const cats = ['military','treasury','wonder','blue','green','yellow','purple'];
  const catLabel = { military: t('scoreMilitary'), treasury: t('scoreTreasury'), wonder: t('scoreWonder'),
    blue: t('scoreBlue'), green: t('scoreGreen'), yellow: t('scoreYellow'), purple: t('scorePurple') };
  const table = `<table class="scores"><tr><th></th>${cats.map(c=>`<th>${catLabel[c]}</th>`).join('')}<th>${t('scoreTotal')}</th><th>$</th></tr>` +
    rows.map(({p, s}) => {
      const f = FACTION_MAP[p.factionId];
      const win = winners.includes(p.idx) ? ' 🏆' : '';
      return `<tr class="${winners.includes(p.idx)?'winner-row':''}">
        <td><img class="tiny" src="${f.ceoImg}"> ${esc(f.ceo[LANG])}${p.isHuman?' 🧑':''}${win}</td>
        ${cats.map(c=>`<td>${s[c]}</td>`).join('')}<td><b>${s.total}</b></td><td>${s.coins}</td></tr>`;
    }).join('') + '</table>';
  const widx = winners[0];
  const wf = FACTION_MAP[G.players[widx].factionId];
  const winTitle = winners.length > 1 ? t('sharedVictory') :
    `${t('winner')}: ${esc(wf.ceo[LANG])} (${esc(wf.name[LANG])})`;
  document.getElementById('game-screen').innerHTML = `
    <div class="gameover">
      <h1>${t('gameOver')}</h1>
      <img class="winner-img" src="${wf.ceoImg}" alt="">
      <h2>${winTitle}</h2>
      ${table}
      <div class="abtns"><button class="btn big" onclick="location.reload()">${t('playAgain')}</button></div>
    </div>`;
}

// ---------- Boot ----------

function boot() {
  loadLang();
  renderTitle();
  document.getElementById('btn-guide').textContent = t('howToPlay');
}
document.addEventListener('DOMContentLoaded', boot);
