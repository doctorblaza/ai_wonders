// AI Wonders - The 7 Wonders (flagship projects)
// Each wonder: 3 stages, built left to right, each once per game, any age.
// Stage cost paid like a card cost. Rewards as noted.
// Special stage-2 effects implemented in game.js.

const WONDERS = {
  openai: {
    id: 'openai', faction: 'OpenAI',
    name: {en:'Stargate', zh:'星门', es:'Stargate'},
    startRes: 'gpu',
    stages: [
      {cost:{coins:0,res:{power:2}}, vp:3},
      {cost:{coins:0,res:{gpu:3}}, effect:'hype2',
       desc:{en:'+2 Hype in every conflict', zh:'每次冲突 +2 声势', es:'+2 Hype en cada conflicto'}},
      {cost:{coins:0,res:{gpu:4}}, vp:7},
    ],
  },
  anthropic: {
    id: 'anthropic', faction: 'Anthropic',
    name: {en:'Constitutional AI', zh:'宪法AI', es:'IA Constitucional'},
    startRes: 'talent',
    stages: [
      {cost:{coins:0,res:{talent:2}}, vp:3},
      {cost:{coins:0,res:{algorithm:3}}, effect:'sciWild',
       desc:{en:'Extra Breakthrough symbol of your choice (at game end)', zh:'终局自选一个额外突破符号', es:'Símbolo de avance extra a elegir (al final)'}},
      {cost:{coins:0,res:{talent:4}}, vp:7},
    ],
  },
  google: {
    id: 'google', faction: 'Google',
    name: {en:'TPU v7', zh:'TPU v7', es:'TPU v7'},
    startRes: 'data',
    stages: [
      {cost:{coins:0,res:{data:2}}, vp:3},
      {cost:{coins:0,res:{architecture:2}}, effect:'rawChoice',
       desc:{en:'Produce 1 raw resource of your choice each turn (not tradeable)', zh:'每回合自选产出1个基础资源（不可交易）', es:'Produce 1 recurso básico a elegir por turno (no comerciable)'}},
      {cost:{coins:0,res:{patent:2}}, vp:7},
    ],
  },
  meta: {
    id: 'meta', faction: 'Meta',
    name: {en:'Llama', zh:'Llama', es:'Llama'},
    startRes: 'talent',
    stages: [
      {cost:{coins:0,res:{talent:2}}, vp:3},
      {cost:{coins:0,res:{data:2}}, effect:'coins9',
       desc:{en:'+$9 funding immediately', zh:'立即 +$9 资金', es:'+$9 de fondos de inmediato'}},
      {cost:{coins:0,res:{algorithm:2}}, vp:7},
    ],
  },
  xai: {
    id: 'xai', faction: 'xAI',
    name: {en:'Colossus II', zh:'Colossus II', es:'Colossus II'},
    startRes: 'power',
    stages: [
      {cost:{coins:0,res:{power:2}}, vp:3},
      {cost:{coins:0,res:{power:3}}, effect:'freeBuild',
       desc:{en:'Build one structure for free, once per Era', zh:'每个时代可免费建造一张牌一次', es:'Construye una carta gratis, una vez por Era'}},
      {cost:{coins:0,res:{power:4}}, vp:7},
    ],
  },
  bytedance: {
    id: 'bytedance', faction: 'ByteDance',
    name: {en:'Seed', zh:'Seed', es:'Seed'},
    startRes: 'data',
    stages: [
      {cost:{coins:0,res:{data:2}}, vp:3},
      {cost:{coins:0,res:{data:3}}, effect:'digDiscard',
       desc:{en:'Look through ALL discards and build one for free (end of this turn)', zh:'翻看所有弃牌堆并免费建造一张（本回合结束时）', es:'Mira todos los descartes y construye uno gratis (al final del turno)'}},
      {cost:{coins:0,res:{algorithm:3}}, vp:7},
    ],
  },
  apple: {
    id: 'apple', faction: 'Apple',
    name: {en:'Private Cloud Compute', zh:'私有云计算', es:'Nube Privada'},
    startRes: 'gpu',
    stages: [
      {cost:{coins:0,res:{gpu:2}}, vp:3},
      {cost:{coins:0,res:{architecture:2}}, vp:5},
      {cost:{coins:0,res:{gpu:4}}, vp:7},
    ],
  },
};

// Faction metadata: CEO + AI guide + portraits
const FACTIONS = [
  {id:'openai',    name:{en:'OpenAI',zh:'OpenAI',es:'OpenAI'},
   ceo:{en:'Sam Altman', zh:'萨姆·奥特曼', es:'Sam Altman'},
   guide:{en:'ChatGPT', zh:'ChatGPT', es:'ChatGPT'},
   ceoImg:'assets/portraits/ceo/ceo-altman.png', aiImg:'assets/portraits/ai/chatgpt-v1.png'},
  {id:'anthropic', name:{en:'Anthropic',zh:'Anthropic',es:'Anthropic'},
   ceo:{en:'Dario Amodei', zh:'达里奥·阿莫迪', es:'Dario Amodei'},
   guide:{en:'Claude', zh:'Claude', es:'Claude'},
   ceoImg:'assets/portraits/ceo/ceo-amodei.png', aiImg:'assets/portraits/ai/claude-v1.png'},
  {id:'google',    name:{en:'Google',zh:'谷歌',es:'Google'},
   ceo:{en:'Sundar Pichai', zh:'桑达尔·皮查伊', es:'Sundar Pichai'},
   guide:{en:'Gemini', zh:'Gemini', es:'Gemini'},
   ceoImg:'assets/portraits/ceo/ceo-pichai.png', aiImg:'assets/portraits/ai/gemini-v1.png'},
  {id:'meta',      name:{en:'Meta',zh:'Meta',es:'Meta'},
   ceo:{en:'Mark Zuckerberg', zh:'马克·扎克伯格', es:'Mark Zuckerberg'},
   guide:{en:'Muse', zh:'Muse', es:'Muse'},
   ceoImg:'assets/portraits/ceo/ceo-zuckerberg.png', aiImg:'assets/portraits/ai/muse-v1.png'},
  {id:'xai',       name:{en:'xAI',zh:'xAI',es:'xAI'},
   ceo:{en:'Elon Musk', zh:'埃隆·马斯克', es:'Elon Musk'},
   guide:{en:'Grok', zh:'Grok', es:'Grok'},
   ceoImg:'assets/portraits/ceo/ceo-musk.png', aiImg:'assets/portraits/ai/grok-v1.png'},
  {id:'bytedance', name:{en:'ByteDance',zh:'字节跳动',es:'ByteDance'},
   ceo:{en:'Zhang Yiming', zh:'张一鸣', es:'Zhang Yiming'},
   guide:{en:'Doubao', zh:'豆包', es:'Doubao'},
   ceoImg:'assets/portraits/ceo/ceo-zhangyiming.png', aiImg:'assets/portraits/ai/doubao-v1.png'},
  {id:'apple',     name:{en:'Apple',zh:'苹果',es:'Apple'},
   ceo:{en:'Tim Cook', zh:'蒂姆·库克', es:'Tim Cook'},
   guide:{en:'Siri', zh:'Siri', es:'Siri'},
   ceoImg:'assets/portraits/ceo/ceo-cook.png', aiImg:'assets/portraits/ai/siri-v1.png'},
];
const FACTION_MAP = {};
for (const f of FACTIONS) FACTION_MAP[f.id] = f;
