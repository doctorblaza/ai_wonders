// AI Wonders - AI opponents
// Heuristic: score each playable card by (VP + resources + strategic fit + affordability).
// Personalities per lab (DESIGN.md section 10). Difficulty: normal.

const AI_PERSONALITY = {
  openai:    { wonder: 3.0, red: 2.0, blue: 2.0, green: 1.0, yellow: 1.0, brown: 1.0, grey: 1.0, purple: 2.0 },
  anthropic: { wonder: 1.5, red: 0.5, blue: 2.0, green: 3.0, yellow: 1.0, brown: 1.0, grey: 1.5, purple: 2.0 },
  google:    { wonder: 1.5, red: 0.5, blue: 1.0, green: 1.5, yellow: 1.0, brown: 3.0, grey: 3.0, purple: 1.5 },
  meta:      { wonder: 1.5, red: 0.5, blue: 3.0, green: 1.0, yellow: 2.5, brown: 1.0, grey: 1.0, purple: 2.0 },
  xai:       { wonder: 2.0, red: 3.0, blue: 1.5, green: 0.5, yellow: 1.0, brown: 1.5, grey: 1.0, purple: 1.5 },
  bytedance: { wonder: 1.5, red: 0.5, blue: 1.0, green: 2.5, yellow: 3.0, brown: 1.5, grey: 1.5, purple: 2.0 },
  apple:     { wonder: 3.0, red: 0.5, blue: 2.5, green: 1.0, yellow: 1.5, brown: 1.0, grey: 1.0, purple: 2.0 },
};

// Intrinsic card value (before personality multiplier).
function aiCardValue(pIdx, card) {
  const p = G.players[pIdx];
  const age = G.age;
  let v = 0;
  if (card.vp) v += card.vp;
  if (card.shields) v += card.shields * (age === 1 ? 1.6 : age === 2 ? 2.6 : 3.2);
  if (card.sci) {
    // value grows with existing symbols of same type + set potential
    let same = 0, total = 0;
    for (const e of p.city) { const c = CARD_MAP[e.id]; if (c && c.sci) { total++; if (c.sci === card.sci) same++; } }
    v += 2 + same * 2 + (total >= 2 ? 1.5 : 0);
  }
  if (card.sciWild) v += 6;
  if (card.coins) v += card.coins * 0.45;
  if (card.prod) v += 2.6 * Object.values(card.prod).reduce((a, b) => a + b, 0);
  if (card.prodChoice) v += card.notTradeable ? 2.2 : 3.0;
  if (card.discount) v += 3.2;
  if (card.perCard) {
    const n = countCards(pIdx, card.perCard.color, card.perCard.who);
    v += (card.perCard.coins || 0) * 0.45 * Math.max(n, 1) + (card.perCard.vp || 0) * Math.max(n, 2) * 0.9;
  }
  return v;
}

function aiWonderValue(pIdx) {
  const p = G.players[pIdx];
  if (p.wonderBuilt >= 3) return -1;
  const stage = WONDERS[p.factionId].stages[p.wonderBuilt];
  let v = (stage.vp || 0);
  if (stage.effect === 'coins9') v += 4;
  if (stage.effect === 'hype2') v += 3 * (4 - G.age);
  if (stage.effect === 'sciWild') v += 5;
  if (stage.effect === 'rawChoice') v += 4;
  if (stage.effect === 'freeBuild') v += 5;
  if (stage.effect === 'digDiscard') v += 3;
  return v;
}

// Main decision: returns {cardId, action, payment?, free?, stageIdx?}, or null if hand is empty.
function aiChoose(pIdx) {
  const p = G.players[pIdx];
  const pers = AI_PERSONALITY[p.factionId];
  const hand = p.hand;
  if (!hand.length) return null;
  let best = null; // {score, choice}

  const consider = (score, choice) => { if (!best || score > best.score) best = { score, choice }; };

  for (const cid of hand) {
    const card = CARD_MAP[cid];
    if (p.city.some(e => e.id === cid)) continue; // duplicate
    const bi = buildInfo(pIdx, cid);
    if (bi.ok) {
      const costPenalty = bi.free ? 0 : (bi.payment.bankCoins + bi.payment.purchaseCost) * 0.55;
      // slight penalty for buying (coins are valuable)
      const score = aiCardValue(pIdx, card) * (pers[card.color] || 1) - costPenalty + Math.random() * 0.6;
      consider(score, { cardId: cid, action: 'build', payment: bi.payment, free: bi.free });
    }
  }

  const wi = wonderInfo(pIdx);
  if (wi.ok) {
    const costPenalty = (wi.payment.bankCoins + wi.payment.purchaseCost) * 0.55;
    const score = aiWonderValue(pIdx) * pers.wonder - costPenalty + Math.random() * 0.6;
    // bury the lowest-value card (rulebook tip: deny your neighbor)
    let bury = hand[0], buryV = Infinity;
    for (const cid of hand) {
      const v = aiCardValue(pIdx, CARD_MAP[cid]);
      if (v < buryV) { buryV = v; bury = cid; }
    }
    consider(score, { cardId: bury, action: 'wonder', payment: wi.payment, stageIdx: wi.stageIdx });
  }

  // Pivot fallback: discard the lowest-value card for $3
  let worst = hand[0], worstV = Infinity;
  for (const cid of hand) {
    const v = aiCardValue(pIdx, CARD_MAP[cid]) * (AI_PERSONALITY[p.factionId][CARD_MAP[cid].color] || 1);
    if (v < worstV) { worstV = v; worst = cid; }
  }
  consider(2.2 + Math.random() * 0.4, { cardId: worst, action: 'discard' });

  const choice = best.choice;
  // xAI: use free build token opportunistically on a good remaining card
  if (p.factionId === 'xai' && p.wonderBuilt >= 2 && !p.xaiUsed[G.age]) {
    const remaining = hand.filter(id => id !== choice.cardId && !p.city.some(e => e.id === id));
    let bv = null, bval = 4.5;
    for (const cid of remaining) {
      const val = aiCardValue(pIdx, CARD_MAP[cid]) * (pers[CARD_MAP[cid].color] || 1);
      if (val > bval) { bval = val; bv = cid; }
    }
    if (bv) {
      p.city.push({ id: bv, age: G.age });
      removeOne(p.hand, bv);
      p.xaiUsed[G.age] = true;
      applyBuildEffect(pIdx, CARD_MAP[bv]);
      addLog(`${fname(pIdx)}: ${t('useFreeBuild')} — ${CARD_MAP[bv].name[LANG]} (${t('free')})`);
    }
  }
  return choice;
}

// ByteDance AI: dig the best discard.
function aiSeedDig(pIdx) {
  const opts = seedDigChoices(pIdx);
  if (!opts.length) return;
  const pers = AI_PERSONALITY[G.players[pIdx].factionId];
  let bestId = opts[0], bestV = -1;
  for (const cid of opts) {
    const v = aiCardValue(pIdx, CARD_MAP[cid]) * (pers[CARD_MAP[cid].color] || 1);
    if (v > bestV) { bestV = v; bestId = cid; }
  }
  if (bestV > 1.5) doSeedDig(pIdx, bestId);
}

// Anthropic AI wild: optimal symbol.
function aiAnthropicWild(pIdx) {
  const p = G.players[pIdx];
  const sci = { model: 0, method: 0, insight: 0, wild: 0 };
  for (const e of p.city) { const c = CARD_MAP[e.id]; if (c && c.color === 'green' && c.sci) sci[c.sci]++; if (c && c.sciWild) sci.wild++; }
  p.anthropicWild = optimalWildFor(pIdx, sci);
}
