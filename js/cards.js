// AI Wonders - Card Database
// All 3 ages, 7-player deck composition (49/49/49 cards).
// Adapted 1:1 from 7 Wonders 1st Edition (Repos 2010) base game.
// Resource keys: talent, gpu, data, power (raw); algorithm, architecture, patent (refined)
// Science: model, method, insight
// Card name locales: en / zh / es

const RES_RAW = ['talent', 'gpu', 'data', 'power'];
const RES_REFINED = ['algorithm', 'architecture', 'patent'];
const RES_ALL = [...RES_RAW, ...RES_REFINED];

// cost: { coins: n, res: {key: n} }
// Effects by color:
//  brown/grey: prod {key:n} | prodChoice [k1,k2]
//  blue: vp n
//  red: shields n
//  green: sci 'model'|'method'|'insight'
//  yellow: coins n | discount {dir:'left'|'right'|'both', types:'raw'|'refined'}
//          | prodChoice [...] (not tradeable) | perCard {coins, vp, color, who:'self'|'neighbors'|'all'}
//  purple: perCard {...} | sciWild true
// freeFrom: card id (or array) built in a PREVIOUS age => build free

const CARDS = [
// ==================== AGE 1 ====================
// ---- Brown (raw) ----
{id:'datapipeline', age:1, color:'brown', copies7:2,
 name:{en:'Data Pipeline', zh:'数据管道', es:'Tubería de Datos'},
 cost:{coins:0,res:{}}, prod:{data:1}},
{id:'talentpool', age:1, color:'brown', copies7:2,
 name:{en:'Talent Pool', zh:'人才库', es:'Reserva de Talento'},
 cost:{coins:0,res:{}}, prod:{talent:1}},
{id:'gpucluster', age:1, color:'brown', copies7:2,
 name:{en:'GPU Cluster', zh:'GPU集群', es:'Clúster de GPU'},
 cost:{coins:0,res:{}}, prod:{gpu:1}},
{id:'powergrid', age:1, color:'brown', copies7:2,
 name:{en:'Power Grid', zh:'电网', es:'Red Eléctrica'},
 cost:{coins:0,res:{}}, prod:{power:1}},
{id:'cloudregion', age:1, color:'brown', copies7:1,
 name:{en:'Cloud Region', zh:'云区域', es:'Región de Nube'},
 cost:{coins:1,res:{}}, prodChoice:['data','gpu']},
{id:'hiringsprint', age:1, color:'brown', copies7:1,
 name:{en:'Hiring Sprint', zh:'招聘冲刺', es:'Sprint de Contratación'},
 cost:{coins:1,res:{}}, prodChoice:['talent','gpu']},
{id:'energylease', age:1, color:'brown', copies7:1,
 name:{en:'Energy Lease', zh:'能源租赁', es:'Arrendamiento de Energía'},
 cost:{coins:1,res:{}}, prodChoice:['gpu','power']},
{id:'opendataset', age:1, color:'brown', copies7:1,
 name:{en:'Open Dataset', zh:'开放数据集', es:'Conjunto de Datos Abierto'},
 cost:{coins:1,res:{}}, prodChoice:['data','talent']},
{id:'datacenter', age:1, color:'brown', copies7:1,
 name:{en:'Data Center', zh:'数据中心', es:'Centro de Datos'},
 cost:{coins:1,res:{}}, prodChoice:['data','power']},
{id:'powerplant', age:1, color:'brown', copies7:1,
 name:{en:'Power Plant', zh:'发电厂', es:'Planta de Energía'},
 cost:{coins:1,res:{}}, prodChoice:['power','talent']},
// ---- Grey (refined) ----
{id:'systemsteam', age:1, color:'grey', copies7:2,
 name:{en:'Systems Team', zh:'系统团队', es:'Equipo de Sistemas'},
 cost:{coins:0,res:{}}, prod:{architecture:1}},
{id:'paperreading', age:1, color:'grey', copies7:2,
 name:{en:'Paper Reading Group', zh:'论文研读组', es:'Grupo de Lectura'},
 cost:{coins:0,res:{}}, prod:{algorithm:1}},
{id:'ipportfolio', age:1, color:'grey', copies7:2,
 name:{en:'IP Portfolio', zh:'专利组合', es:'Cartera de Patentes'},
 cost:{coins:0,res:{}}, prod:{patent:1}},
// ---- Blue ----
{id:'hackathon', age:1, color:'blue', copies7:2,
 name:{en:'Hackathon', zh:'黑客松', es:'Hackatón'},
 cost:{coins:0,res:{}}, vp:3},
{id:'mlcourse', age:1, color:'blue', copies7:2,
 name:{en:'ML Course', zh:'机器学习课程', es:'Curso de ML'},
 cost:{coins:0,res:{talent:1}}, vp:3, unlocks:'onlinecourses'},
{id:'researchblog', age:1, color:'blue', copies7:2,
 name:{en:'Research Blog', zh:'研究博客', es:'Blog de Investigación'},
 cost:{coins:0,res:{}}, vp:2, unlocks:'researchinstitute'},
{id:'demoday', age:1, color:'blue', copies7:2,
 name:{en:'Demo Day', zh:'演示日', es:'Día de Demostración'},
 cost:{coins:0,res:{}}, vp:2, unlocks:'founderstatue'},
// ---- Yellow ----
{id:'seedround', age:1, color:'yellow', copies7:3,
 name:{en:'Seed Round', zh:'种子轮', es:'Ronda Semilla'},
 cost:{coins:0,res:{}}, coins:5},
{id:'eastagency', age:1, color:'yellow', copies7:2,
 name:{en:'East Talent Agency', zh:'东部人才中介', es:'Agencia del Este'},
 cost:{coins:0,res:{}}, discount:{dir:'right', types:'raw'}, unlocks:'computeexchange'},
{id:'westagency', age:1, color:'yellow', copies7:2,
 name:{en:'West Talent Agency', zh:'西部人才中介', es:'Agencia del Oeste'},
 cost:{coins:0,res:{}}, discount:{dir:'left', types:'raw'}, unlocks:'computeexchange'},
{id:'apimarket', age:1, color:'yellow', copies7:2,
 name:{en:'API Marketplace', zh:'API市场', es:'Mercado de API'},
 cost:{coins:0,res:{}}, discount:{dir:'both', types:'refined'}, unlocks:'databroker'},
// ---- Red ----
{id:'ndawall', age:1, color:'red', copies7:2,
 name:{en:'NDA Wall', zh:'保密墙', es:'Muro de NDA'},
 cost:{coins:0,res:{data:1}}, shields:1},
{id:'talentraid', age:1, color:'red', copies7:2,
 name:{en:'Talent Raid', zh:'人才争夺战', es:'Caza de Talento'},
 cost:{coins:0,res:{power:1}}, shields:1, unlocks:'redteam'},
{id:'benchmarkwatch', age:1, color:'red', copies7:2,
 name:{en:'Benchmark Watch', zh:'基准监控', es:'Vigilancia de Benchmarks'},
 cost:{coins:0,res:{gpu:1}}, shields:1},
// ---- Green ----
{id:'datalab', age:1, color:'green', copies7:2,
 name:{en:'Data Lab', zh:'数据实验室', es:'Laboratorio de Datos'},
 cost:{coins:0,res:{architecture:1}}, sci:'model', unlocks:'gpureserve', unlocks2:'dataflywheel'},
{id:'rlworkshop', age:1, color:'green', copies7:2,
 name:{en:'RL Workshop', zh:'强化学习工坊', es:'Taller de RL'},
 cost:{coins:0,res:{algorithm:1}}, sci:'method', unlocks:'evalharness', unlocks2:'alignmentlab'},
{id:'arxiv', age:1, color:'green', copies7:2,
 name:{en:'ArXiv Preprint', zh:'预印本论文', es:'Preprint de ArXiv'},
 cost:{coins:0,res:{patent:1}}, sci:'insight', unlocks:'aisafetyboard', unlocks2:'modelzoo'},

// ==================== AGE 2 ====================
// ---- Brown ----
{id:'datalake', age:2, color:'brown', copies7:2,
 name:{en:'Data Lake', zh:'数据湖', es:'Lago de Datos'},
 cost:{coins:1,res:{}}, prod:{data:2}},
{id:'hiringspree', age:2, color:'brown', copies7:2,
 name:{en:'Hiring Spree', zh:'大规模招聘', es:'Contratación Masiva'},
 cost:{coins:1,res:{}}, prod:{talent:2}},
{id:'gpufarm', age:2, color:'brown', copies7:2,
 name:{en:'GPU Farm', zh:'GPU农场', es:'Granja de GPU'},
 cost:{coins:1,res:{}}, prod:{gpu:2}},
{id:'solararray', age:2, color:'brown', copies7:2,
 name:{en:'Solar Array', zh:'太阳能阵列', es:'Planta Solar'},
 cost:{coins:1,res:{}}, prod:{power:2}},
// ---- Grey ----
{id:'mlopsteam', age:2, color:'grey', copies7:2,
 name:{en:'MLOps Team', zh:'MLOps团队', es:'Equipo de MLOps'},
 cost:{coins:0,res:{}}, prod:{architecture:1}},
{id:'algorithmguild', age:2, color:'grey', copies7:2,
 name:{en:'Algorithm Guild', zh:'算法公会', es:'Gremio de Algoritmos'},
 cost:{coins:0,res:{}}, prod:{algorithm:1}},
{id:'patentpool', age:2, color:'grey', copies7:2,
 name:{en:'Patent Pool', zh:'专利池', es:'Fondo de Patentes'},
 cost:{coins:0,res:{}}, prod:{patent:1}},
// ---- Blue ----
{id:'onlinecourses', age:2, color:'blue', copies7:2,
 name:{en:'Online Course Empire', zh:'在线课程帝国', es:'Imperio de Cursos'},
 cost:{coins:0,res:{talent:3}}, vp:5, freeFrom:'mlcourse'},
{id:'researchinstitute', age:2, color:'blue', copies7:2,
 name:{en:'Research Institute', zh:'研究院', es:'Instituto de Investigación'},
 cost:{coins:0,res:{data:1,gpu:1,algorithm:1}}, vp:3, freeFrom:'researchblog', unlocks:'agicathedral'},
{id:'founderstatue', age:2, color:'blue', copies7:2,
 name:{en:'Founder Statue', zh:'创始人雕像', es:'Estatua del Fundador'},
 cost:{coins:0,res:{data:1,power:2}}, vp:4, freeFrom:'demoday', unlocks:'campusgardens'},
{id:'aisafetyboard', age:2, color:'blue', copies7:2,
 name:{en:'AI Safety Board', zh:'AI安全委员会', es:'Junta de Seguridad de IA'},
 cost:{coins:0,res:{gpu:2,architecture:1}}, vp:4, freeFrom:'arxiv'},
// ---- Yellow ----
{id:'computeexchange', age:2, color:'yellow', copies7:3,
 name:{en:'Compute Exchange', zh:'算力交易所', es:'Bolsa de Cómputo'},
 cost:{coins:0,res:{gpu:2}}, prodChoice:['algorithm','architecture','patent'], notTradeable:true,
 freeFrom:['eastagency','westagency'], unlocks:'cloudharbor'},
{id:'databroker', age:2, color:'yellow', copies7:3,
 name:{en:'Data Broker', zh:'数据经纪', es:'Corredor de Datos'},
 cost:{coins:0,res:{data:2}}, prodChoice:['talent','gpu','data','power'], notTradeable:true,
 freeFrom:'apimarket', unlocks:'beaconlaunch'},
{id:'apirevenue', age:2, color:'yellow', copies7:2,
 name:{en:'API Revenue', zh:'API收入', es:'Ingresos por API'},
 cost:{coins:0,res:{}}, perCard:{coins:1, vp:0, color:'brown', who:'neighbors'}},
{id:'patentlicensing', age:2, color:'yellow', copies7:2,
 name:{en:'Patent Licensing', zh:'专利授权', es:'Licencias de Patentes'},
 cost:{coins:0,res:{}}, perCard:{coins:2, vp:0, color:'grey', who:'neighbors'}},
// ---- Red ----
{id:'moatoflawyers', age:2, color:'red', copies7:2,
 name:{en:'Moat of Lawyers', zh:'律师护城河', es:'Foso de Abogados'},
 cost:{coins:0,res:{talent:3}}, shields:2, unlocks:'patentfortress'},
{id:'redteam', age:2, color:'red', copies7:3,
 name:{en:'Red Team', zh:'红队', es:'Equipo Rojo'},
 cost:{coins:0,res:{data:1,power:2}}, shields:2, freeFrom:'talentraid', unlocks:'virallaunch'},
{id:'gpureserve', age:2, color:'red', copies7:2,
 name:{en:'GPU Reserve', zh:'GPU储备', es:'Reserva de GPU'},
 cost:{coins:0,res:{power:1,gpu:1,data:1}}, shields:2, freeFrom:'datalab'},
{id:'evalharness', age:2, color:'red', copies7:2,
 name:{en:'Eval Harness', zh:'评估工具', es:'Arnés de Evaluación'},
 cost:{coins:0,res:{data:2,power:1}}, shields:2, freeFrom:'rlworkshop'},
// ---- Green ----
{id:'dataflywheel', age:2, color:'green', copies7:2,
 name:{en:'Data Flywheel', zh:'数据飞轮', es:'Volante de Datos'},
 cost:{coins:0,res:{power:2,algorithm:1}}, sci:'model', freeFrom:'datalab',
 unlocks:'launcharena', unlocks2:'frontierlodge'},
{id:'alignmentlab', age:2, color:'green', copies7:2,
 name:{en:'Alignment Lab', zh:'对齐实验室', es:'Laboratorio de Alineamiento'},
 cost:{coins:0,res:{gpu:2,patent:1}}, sci:'method', freeFrom:'rlworkshop',
 unlocks:'computearsenal', unlocks2:'evalobservatory'},
{id:'modelzoo', age:2, color:'green', copies7:2,
 name:{en:'Model Zoo', zh:'模型动物园', es:'Zoológico de Modelos'},
 cost:{coins:0,res:{talent:2,architecture:1}}, sci:'insight', freeFrom:'arxiv',
 unlocks:'allhands', unlocks2:'aiuniversity'},
{id:'aibootcamp', age:2, color:'green', copies7:2,
 name:{en:'AI Bootcamp', zh:'AI训练营', es:'Bootcamp de IA'},
 cost:{coins:0,res:{data:1,patent:1}}, sci:'insight',
 unlocks:'researchacademy', unlocks2:'scalinglaws'},

// ==================== AGE 3 ====================
// ---- Blue ----
{id:'agicathedral', age:3, color:'blue', copies7:2,
 name:{en:'AGI Cathedral', zh:'AGI大教堂', es:'Catedral de AGI'},
 cost:{coins:0,res:{gpu:2,power:1,algorithm:1,patent:1,architecture:1}}, vp:7, freeFrom:'researchinstitute'},
{id:'campusgardens', age:3, color:'blue', copies7:2,
 name:{en:'Campus Gardens', zh:'园区花园', es:'Jardines del Campus'},
 cost:{coins:0,res:{data:1,gpu:2}}, vp:5, freeFrom:'founderstatue'},
{id:'allhands', age:3, color:'blue', copies7:3,
 name:{en:'All-Hands Summit', zh:'全员大会', es:'Cumbre General'},
 cost:{coins:0,res:{talent:2,power:1,algorithm:1}}, vp:6, freeFrom:'modelzoo'},
{id:'founderspalace', age:3, color:'blue', copies7:2,
 name:{en:"Founder's Palace", zh:'创始人宫殿', es:'Palacio del Fundador'},
 cost:{coins:0,res:{talent:1,gpu:1,data:1,power:1,algorithm:1,architecture:1,patent:1}}, vp:8},
{id:'aisenate', age:3, color:'blue', copies7:2,
 name:{en:'AI Senate', zh:'AI参议院', es:'Senado de IA'},
 cost:{coins:0,res:{data:2,talent:1,power:1}}, vp:6, freeFrom:'modelzoo'},
// ---- Yellow ----
{id:'cloudharbor', age:3, color:'yellow', copies7:2,
 name:{en:'Cloud Harbor', zh:'云港', es:'Puerto de Nube'},
 cost:{coins:0,res:{architecture:1,power:1,data:1}},
 perCard:{coins:1, vp:1, color:'brown', who:'self'}, freeFrom:'computeexchange'},
{id:'beaconlaunch', age:3, color:'yellow', copies7:2,
 name:{en:'Beacon Launch', zh:'灯塔发布', es:'Lanzamiento Faro'},
 cost:{coins:0,res:{talent:1,algorithm:1}},
 perCard:{coins:1, vp:1, color:'yellow', who:'self'}, freeFrom:'databroker'},
{id:'consortium', age:3, color:'yellow', copies7:2,
 name:{en:'Consortium', zh:'联盟', es:'Consorcio'},
 cost:{coins:0,res:{gpu:2,patent:1}},
 perCard:{coins:2, vp:2, color:'grey', who:'self'}, freeFrom:'dataflywheel'},
{id:'launcharena', age:3, color:'yellow', copies7:3,
 name:{en:'Launch Arena', zh:'发布竞技场', es:'Arena de Lanzamiento'},
 cost:{coins:0,res:{talent:2,power:1}},
 perCard:{coins:3, vp:1, color:'wonder', who:'self'}, freeFrom:'dataflywheel'},
// ---- Red ----
{id:'patentfortress', age:3, color:'red', copies7:2,
 name:{en:'Patent Fortress', zh:'专利堡垒', es:'Fortaleza de Patentes'},
 cost:{coins:0,res:{power:3,talent:1}}, shields:3, freeFrom:'moatoflawyers'},
{id:'virallaunch', age:3, color:'red', copies7:3,
 name:{en:'Viral Launch', zh:'病毒式发布', es:'Lanzamiento Viral'},
 cost:{coins:0,res:{talent:3,power:1}}, shields:3, freeFrom:'redteam'},
{id:'computearsenal', age:3, color:'red', copies7:3,
 name:{en:'Compute Arsenal', zh:'算力军火库', es:'Arsenal de Cómputo'},
 cost:{coins:0,res:{data:2,power:1,architecture:1}}, shields:3, freeFrom:'alignmentlab'},
{id:'scalingsiege', age:3, color:'red', copies7:2,
 name:{en:'Scaling Siege', zh:'扩展攻坚', es:'Asedio de Escala'},
 cost:{coins:0,res:{data:1,gpu:3}}, shields:3, freeFrom:'alignmentlab'},
// ---- Green ----
{id:'frontierlodge', age:3, color:'green', copies7:2,
 name:{en:'Frontier Lodge', zh:'前沿小屋', es:'Refugio Fronterizo'},
 cost:{coins:0,res:{gpu:2,architecture:1,patent:1}}, sci:'model', freeFrom:'dataflywheel'},
{id:'evalobservatory', age:3, color:'green', copies7:2,
 name:{en:'Eval Observatory', zh:'评估天文台', es:'Observatorio de Evaluación'},
 cost:{coins:0,res:{power:2,algorithm:1,architecture:1}}, sci:'method', freeFrom:'alignmentlab'},
{id:'aiuniversity', age:3, color:'green', copies7:2,
 name:{en:'AI University', zh:'AI大学', es:'Universidad de IA'},
 cost:{coins:0,res:{data:2,patent:1,algorithm:1}}, sci:'insight', freeFrom:'modelzoo'},
{id:'researchacademy', age:3, color:'green', copies7:2,
 name:{en:'Research Academy', zh:'研究学院', es:'Academia de Investigación'},
 cost:{coins:0,res:{talent:3,algorithm:1}}, sci:'model', freeFrom:'aibootcamp'},
{id:'scalinglaws', age:3, color:'green', copies7:2,
 name:{en:'Scaling Laws', zh:'扩展定律', es:'Leyes de Escala'},
 cost:{coins:0,res:{data:1,patent:1,architecture:1}}, sci:'method', freeFrom:'aibootcamp'},
];

// ==================== PURPLE - Moonshots (10, pick 9) ====================
const GUILDS = [
{id:'openweights', age:3, color:'purple',
 name:{en:'Open Weights', zh:'开放权重', es:'Pesos Abiertos'},
 cost:{coins:0,res:{power:2,gpu:1,talent:1,data:1}},
 perCard:{coins:0, vp:1, color:'brown', who:'neighbors'}},
{id:'talentcartel', age:3, color:'purple',
 name:{en:'Talent Cartel', zh:'人才卡特尔', es:'Cártel de Talento'},
 cost:{coins:0,res:{power:2,talent:2}},
 perCard:{coins:0, vp:2, color:'grey', who:'neighbors'}},
{id:'marketmakers', age:3, color:'purple',
 name:{en:'Market Makers', zh:'做市商', es:'Creadores de Mercado'},
 cost:{coins:0,res:{architecture:1,algorithm:1,patent:1}},
 perCard:{coins:0, vp:1, color:'yellow', who:'neighbors'}},
{id:'agiannouncement', age:3, color:'purple',
 name:{en:'AGI Announcement', zh:'AGI公告', es:'Anuncio de AGI'},
 cost:{coins:0,res:{gpu:3,architecture:1,patent:1}},
 perCard:{coins:0, vp:1, color:'green', who:'neighbors'}},
{id:'industrialespionage', age:3, color:'purple',
 name:{en:'Industrial Espionage', zh:'工业间谍', es:'Espionaje Industrial'},
 cost:{coins:0,res:{gpu:3,algorithm:1}},
 perCard:{coins:0, vp:1, color:'red', who:'neighbors'}},
{id:'regulatorycapture', age:3, color:'purple',
 name:{en:'Regulatory Capture', zh:'监管俘获', es:'Captura Regulatoria'},
 cost:{coins:0,res:{power:2,talent:1,architecture:1}},
 perCard:{coins:0, vp:1, color:'defeat', who:'neighbors'}},
{id:'standardsbody', age:3, color:'purple',
 name:{en:'Standards Body', zh:'标准组织', es:'Organismo de Estándares'},
 cost:{coins:0,res:{data:3,talent:1,architecture:1}},
 perCard:{coins:0, vp:1, color:'blue', who:'neighbors'}},
{id:'superalignment', age:3, color:'purple',
 name:{en:'Superalignment', zh:'超级对齐', es:'Superalineación'},
 cost:{coins:0,res:{talent:2,gpu:2,algorithm:1}},
 perCard:{coins:0, vp:1, color:'wonder', who:'all'}},
{id:'verticalintegration', age:3, color:'purple',
 name:{en:'Vertical Integration', zh:'垂直整合', es:'Integración Vertical'},
 cost:{coins:0,res:{data:3,patent:1,algorithm:1}},
 perCard:{coins:0, vp:1, color:'brown+grey+purple', who:'self'}},
{id:'breakthroughwildcard', age:3, color:'purple',
 name:{en:'Breakthrough Wildcard', zh:'突破万能牌', es:'Comodín de Avance'},
 cost:{coins:0,res:{data:2,power:2,patent:1}}, sciWild:true},
];

const CARD_MAP = {};
for (const c of [...CARDS, ...GUILDS]) CARD_MAP[c.id] = c;

// Build a shuffled 49-card deck for the given age (7 players fixed)
function buildDeck(age) {
  const deck = [];
  for (const c of CARDS) {
    if (c.age !== age) continue;
    for (let i = 0; i < c.copies7; i++) deck.push(c.id);
  }
  if (age === 3) {
    const guilds = [...GUILDS].sort(() => Math.random() - 0.5).slice(0, 9);
    for (const g of guilds) deck.push(g.id);
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Verify deck sizes at load (dev sanity check)
(function verifyDecks(){
  for (const age of [1,2,3]) {
    let n = 0;
    for (const c of CARDS) if (c.age === age) n += c.copies7;
    if (age === 3) n += 9;
    if (n !== 49) console.error(`Deck age ${age} has ${n} cards, expected 49`);
  }
})();
