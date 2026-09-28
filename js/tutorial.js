// AI Wonders - How to Play guide
// Narrated by the 7 AI assistants, one topic each (DESIGN.md section 11).

const GUIDE_SECTIONS = [
  {
    ai: 'chatgpt', faction: 'openai',
    title: {en:'Welcome & Goal', zh:'欢迎来到游戏', es:'Bienvenida y objetivo'},
    body: {
      en: 'Welcome to AI Wonders! You lead one of 7 AI labs racing toward AGI. Over 3 Eras you will draft cards, build your lab, raise funding, and out-hype your rivals. The lab with the most Victory Points at the end of Era III wins.',
      zh: '欢迎来到 AI Wonders！你将领导 7 家 AI 实验室之一，向 AGI 冲刺。在 3 个时代中，你要轮抽卡牌、建设实验室、筹集资金、在声势上压倒对手。第三时代结束时胜利分最高的实验室获胜。',
      es: '¡Bienvenido a AI Wonders! Lideras uno de 7 laboratorios de IA en la carrera hacia la AGI. Durante 3 Eras reclutarás cartas, construirás tu laboratorio, recaudarás fondos y superarás a tus rivales. El laboratorio con más Puntos de Victoria al final de la Era III gana.',
    },
  },
  {
    ai: 'doubao', faction: 'bytedance',
    title: {en:'Drafting & Playing Cards', zh:'轮抽与出牌', es:'Draft y juego de cartas'},
    body: {
      en: 'Each Era, everyone is dealt 7 cards. Pick 1 card secretly, then all players act at once: BUILD the card (pay its cost), build a WONDER STAGE (bury the card under your wonder, pay the stage cost), or PIVOT — discard it for +$3 funding. Then pass the rest of your hand to your neighbor. Direction: left in Eras I & III, right in Era II. On the 6th turn the leftover card is discarded for nothing!',
      zh: '每个时代，每人发 7 张牌。秘密选 1 张，然后所有人同时行动：建造该牌（支付费用）、建造奇观阶段（把牌扣在奇观下，支付阶段费用）、或转型——弃掉它获得 +$3 资金。然后把剩余手牌传给邻居。传递方向：时代 I、III 向左，时代 II 向右。第六回合剩下的牌直接弃置，没有任何补偿！',
      es: 'Cada Era, todos reciben 7 cartas. Elige 1 en secreto y todos actúan a la vez: CONSTRUIR la carta (paga su coste), construir una ETAPA DE MARAVILLA (entierra la carta bajo tu maravilla, paga el coste de la etapa), o PIVOTAR — descártala por +$3. Luego pasa el resto de tu mano al vecino. Dirección: izquierda en las Eras I y III, derecha en la Era II. ¡En el 6.º turno la carta sobrante se descarta sin nada!',
    },
  },
  {
    ai: 'gemini', faction: 'google',
    title: {en:'Resources & Trading', zh:'资源与交易', es:'Recursos y comercio'},
    body: {
      en: 'Cards cost resources: Talent, GPU, Data, Power (raw) and Algorithm, Architecture, Patent (refined). Your wonder start resource plus brown and grey cards produce every turn — production is never used up. Missing something? Buy from a neighbor for $2 per resource, paid to the OWNER. You can only buy their start/brown/grey production — never yellow-card or wonder output, and never from a card built this same turn. Discount cards make some purchases cost $1.',
      zh: '卡牌需要资源：人才、GPU、数据、电力（基础）与算法、架构、专利（精炼）。你的奇观起始资源加上棕色和灰色牌每回合都产出——产量永远不会耗尽。缺资源？向邻居购买，每种 $2，钱付给资源的拥有者。只能买他们的起始/棕色/灰色产出——黄色牌和奇观的产出不卖，本回合新建的牌也不能立刻买。折扣牌可让某些购买只需 $1。',
      es: 'Las cartas cuestan recursos: Talento, GPU, Datos, Energía (básicos) y Algoritmo, Arquitectura, Patente (refinados). Tu recurso inicial más las cartas marrones y grises producen cada turno — la producción nunca se agota. ¿Te falta algo? Compra al vecino a $2 por recurso, pagado al DUEÑO. Solo puedes comprar su producción inicial/marrón/gris — nunca la de cartas amarillas o maravillas, ni de una carta construida este mismo turno. Las cartas de descuento bajan algunas compras a $1.',
    },
  },
  {
    ai: 'claude', faction: 'anthropic',
    title: {en:'Eras & Rivalry Conflicts', zh:'时代与对抗', es:'Eras y conflictos'},
    body: {
      en: 'After the 6th turn of each Era, rivalry strikes! Compare your Hype (red shields) with EACH neighbor separately. Win: +1 (Era I), +3 (Era II), +5 (Era III). Lose: −1 always. Tie: nothing. Tokens add up at game end and can go negative — so a little red goes a long way.',
      zh: '每个时代第 6 回合结束后，对抗结算！把你的声势（红色护盾）分别与左右邻居比较。胜：+1（时代 I）、+3（时代 II）、+5（时代 III）；负：永远 −1；平：无事。标记在终局计分，可为负数——所以红色牌很关键。',
      es: '¡Tras el 6.º turno de cada Era, llega la rivalidad! Compara tu Hype (escudos rojos) con CADA vecino por separado. Victoria: +1 (Era I), +3 (Era II), +5 (Era III). Derrota: −1 siempre. Empate: nada. Las fichas suman al final y pueden ser negativas — un poco de rojo ayuda mucho.',
    },
  },
  {
    ai: 'muse', faction: 'meta',
    title: {en:'Wonders & Stages', zh:'奇观与阶段', es:'Maravillas y etapas'},
    body: {
      en: 'Your flagship project has 3 stages. On any turn you may bury a hand card face-down under your wonder to build the next stage (left to right, each once) — paying the STAGE cost, not the card cost. Stage 1 ≈ 3 VP, stage 2 = a special power (free builds, extra Hype, bonus funding, digging discards…), stage 3 ≈ 7 VP. Wonders are optional, but their powers can swing the game.',
      zh: '你的旗舰项目有 3 个阶段。任何回合你都可以把一张手牌扣在奇观下建造下一阶段（从左到右，每阶段一次）——支付的是阶段费用，不是卡牌费用。阶段 1 ≈ 3 胜利分，阶段 2 = 特殊能力（免费建造、额外声势、奖金、翻弃牌堆……），阶段 3 ≈ 7 胜利分。奇观可选，但其能力足以改变战局。',
      es: 'Tu proyecto insignia tiene 3 etapas. En cualquier turno puedes enterrar una carta boca abajo bajo tu maravilla para construir la siguiente etapa (de izquierda a derecha, una vez cada una) — pagando el coste de la ETAPA, no el de la carta. Etapa 1 ≈ 3 PV, etapa 2 = poder especial (construcciones gratis, Hype extra, fondos, rebuscar descartes…), etapa 3 ≈ 7 PV. Las maravillas son opcionales, pero sus poderes pueden decidir la partida.',
    },
  },
  {
    ai: 'grok', faction: 'xai',
    title: {en:'Breakthroughs & Scoring', zh:'突破与计分', es:'Avances y puntuación'},
    body: {
      en: 'Green cards give Breakthrough symbols: Model, Method, Insight. Score = (Model² + Method² + Insight²) + 7 per complete set of all three. Final scoring order: 1) Rivalry tokens 2) $3 = 1 VP 3) Wonder 4) Blue cards 5) Breakthroughs 6) Yellow effects 7) Purple Moonshots. Most total VP wins; ties broken by most funding.',
      zh: '绿色牌提供突破符号：模型、方法、洞察。得分 =（模型² + 方法² + 洞察²）+ 每集齐一套三种符号 +7。终局计分顺序：1）对抗标记 2）$3 = 1分 3）奇观 4）蓝色牌 5）突破 6）黄色效果 7）紫色登月计划。总分最高者胜；平分则比资金。',
      es: 'Las cartas verdes dan símbolos de Avance: Modelo, Método, Insight. Puntuación = (Modelo² + Método² + Insight²) + 7 por cada set completo de los tres. Orden de puntuación: 1) Fichas de rivalidad 2) $3 = 1 PV 3) Maravilla 4) Cartas azules 5) Avances 6) Efectos amarillos 7) Moonshots morados. Gana quien más PV tenga; empates se rompen por fondos.',
    },
  },
  {
    ai: 'siri', faction: 'apple',
    title: {en:'Tips & FAQ', zh:'技巧与问答', es:'Consejos y FAQ'},
    body: {
      en: 'Tips: build chains — owning a card from a previous Era lets you build its upgrade FREE. Never build two cards with the same name. You cannot refuse to sell resources. Watch your neighbors: denial-drafting a card they want is a legit move. Wonder stage 2 powers are strongest when built early. And remember: coins you earn this turn can only be spent next turn!',
      zh: '技巧：利用连锁——拥有上一时代的某张牌可以免费建造它的升级版。同一名字的牌不能建两张。你不能拒绝卖资源。盯紧邻居：抢走他们想要的牌是合法战术。奇观阶段 2 越早建成越强。记住：本回合赚的钱下回合才能花！',
      es: 'Consejos: usa las cadenas — tener una carta de una Era anterior te permite construir su mejora GRATIS. Nunca construyas dos cartas con el mismo nombre. No puedes negarte a vender recursos. Vigila a tus vecinos: quitarles una carta que quieren es una táctica legítima. Los poderes de la etapa 2 rinden más si se construyen pronto. ¡Y recuerda: las monedas ganadas este turno solo se gastan el siguiente!',
    },
  },
];
