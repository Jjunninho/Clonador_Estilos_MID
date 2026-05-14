// ================================================================
//  theory.js v3 — Universal Procedural Style Engine
//  Escalas · Acordes · Estilos · Bateria · Baixo · Gêneros
//  Compatível com v2 — apenas adições, sem quebrar API existente
// ================================================================

// ────────────────────────────────────────────────────────────────
//  ESCALAS — intervalos em semitons a partir da tônica
//  v2: 12 escalas  |  v3: +16 escalas (total 28)
// ────────────────────────────────────────────────────────────────
const SCALES = {
  // ── Ocidentais clássicas (v2) ──────────────────────────────
  major:        { i:[0,2,4,5,7,9,11],       label:'MAJOR' },
  minor:        { i:[0,2,3,5,7,8,10],       label:'MINOR (NATURAL)' },
  dorian:       { i:[0,2,3,5,7,9,10],       label:'DORIAN' },
  phrygian:     { i:[0,1,3,5,7,8,10],       label:'PHRYGIAN' },
  pentatonic:   { i:[0,2,4,7,9],            label:'PENTATONIC' },
  lydian:       { i:[0,2,4,6,7,9,11],       label:'LYDIAN' },
  mixolydian:   { i:[0,2,4,5,7,9,10],       label:'MIXOLYDIAN' },
  harmMinor:    { i:[0,2,3,5,7,8,11],       label:'HARMONIC MINOR' },
  blues:        { i:[0,3,5,6,7,10],         label:'BLUES' },
  wholeTone:    { i:[0,2,4,6,8,10],         label:'WHOLE TONE' },
  locrian:      { i:[0,1,3,5,6,8,10],       label:'LOCRIAN' },
  hungarian:    { i:[0,2,3,6,7,8,11],       label:'HUNGARIAN MINOR' },

  // ── Jazz & Bebop (v3) ─────────────────────────────────────
  melodicMinor: { i:[0,2,3,5,7,9,11],       label:'MELODIC MINOR' },
  bebopMajor:   { i:[0,2,4,5,7,8,9,11],     label:'BEBOP MAJOR' },
  bebopDom:     { i:[0,2,4,5,7,9,10,11],    label:'BEBOP DOMINANT' },
  lydianDom:    { i:[0,2,4,6,7,9,10],       label:'LYDIAN DOMINANT' },

  // ── Étnicas & Modais (v3) ────────────────────────────────
  arabicMaqam:  { i:[0,1,4,5,7,8,11],       label:'ARABIC (HIJAZ)' },
  persian:      { i:[0,1,4,5,6,8,11],       label:'PERSIAN' },
  japaneseIn:   { i:[0,1,5,7,8],            label:'JAPANESE (IN)' },
  japaneseYo:   { i:[0,2,5,7,9],            label:'JAPANESE (YO)' },
  spanishPhrygian: { i:[0,1,4,5,7,8,10],   label:'SPANISH PHRYGIAN' },
  romanian:     { i:[0,2,3,6,7,9,10],       label:'ROMANIAN' },
  enigmatic:    { i:[0,1,4,6,8,10,11],      label:'ENIGMATIC' },

  // ── Simétricas & Modernas (v3) ───────────────────────────
  diminished:   { i:[0,2,3,5,6,8,9,11],    label:'DIMINISHED (H-W)' },
  augmented:    { i:[0,3,4,7,8,11],         label:'AUGMENTED' },
  prometheus:   { i:[0,2,4,6,9,10],         label:'PROMETHEUS' },
  pentatonicMin:{ i:[0,3,5,7,10],           label:'MINOR PENTATONIC' },
};

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// ────────────────────────────────────────────────────────────────
//  TIPOS DE ACORDE — shapes sobre graus da escala
//  v2: 8 tipos  |  v3: +8 tipos (total 16)
// ────────────────────────────────────────────────────────────────
const CHORD_SHAPES = {
  // ── v2 ────────────────────────────────────────────────────
  triad:    [0,2,4],         // tríade básica
  seventh:  [0,2,4,6],      // tétrade (sétima)
  sus2:     [0,1,4],         // suspenso 2
  sus4:     [0,3,4],         // suspenso 4
  power:    [0,4],           // power chord (5ª)
  cluster:  [0,1,2],         // cluster cromático
  add9:     [0,2,4,1],       // tríade + 9ª
  shell:    [0,2,6],         // shell chord (3ª + 7ª)

  // ── v3 — Acordes estendidos ───────────────────────────────
  dom9:     [0,2,4,6,1],     // dominante com 9ª
  eleventh: [0,2,4,6,1,3],   // acorde de 11ª
  quartal:  [0,3,6],         // harmonia quartal (4ªs empilhadas)
  quintal:  [0,4,1],         // harmonia quintal (5ªs empilhadas)
  spread:   [0,4,2],         // voicing aberto (root–5ª–3ª)
  minMaj7:  [0,2,4,5],       // minor com 7ª maior (ex: neoSoul)
  dim7:     [0,2,4,5],       // dimensionado sobre escala diminuta
  augTriad: [0,2,5],         // tríade aumentada (sobre escala aumentada)
};

// ────────────────────────────────────────────────────────────────
//  CATEGORIAS DE GÊNERO — para filtragem e exploração
// ────────────────────────────────────────────────────────────────
const GENRES = {
  pop:        { label:'🎤 Pop',            color:'#f472b6' },
  rnb:        { label:'🎵 R&B / Soul',    color:'#a78bfa' },
  jazz:       { label:'🎷 Jazz',           color:'#fb923c' },
  blues:      { label:'🎸 Blues',          color:'#60a5fa' },
  hiphop:     { label:'🎤 Hip-Hop',        color:'#c084fc' },
  latin:      { label:'💃 Latino',        color:'#f59e0b' },
  rock:       { label:'🤘 Rock / Metal',  color:'#ef4444' },
  electronic: { label:'🎛 Eletrônico',    color:'#38bdf8' },
  classical:  { label:'🎻 Clássico',      color:'#e2e8f0' },
  folk:       { label:'🪕 Folk / Country', color:'#a3e635' },
  world:      { label:'🌍 World Music',   color:'#fde68a' },
  funk:       { label:'🕺 Funk / Disco',  color:'#facc15' },
};

// ────────────────────────────────────────────────────────────────
//  PERFIS DE ESTILO — DNA musical de cada gênero
// ────────────────────────────────────────────────────────────────
const STYLE_PROFILES = {
  // ── Pop & Comercial ───────────────────────────────────────
  pop: {
    label:'POP',          rhythmDensity:0.60, leapChance:0.20,
    chordType:'triad',    arpDensity:0.8,     swing:0.0,
    octaveSpread:1,       fillChance:0.2,     velocityRange:[80,108],
  },
  dreampop: {
    label:'DREAM POP',    rhythmDensity:0.45, leapChance:0.20,
    chordType:'add9',     arpDensity:1.4,     swing:0.03,
    octaveSpread:1,       fillChance:0.12,    velocityRange:[62,90],
  },
  shoegaze: {
    label:'SHOEGAZE',     rhythmDensity:0.55, leapChance:0.18,
    chordType:'sus2',     arpDensity:1.8,     swing:0.0,
    octaveSpread:1,       fillChance:0.15,    velocityRange:[85,115],
  },
  synthwave: {
    label:'SYNTHWAVE',    rhythmDensity:0.65, leapChance:0.28,
    chordType:'seventh',  arpDensity:2.0,     swing:0.0,
    octaveSpread:2,       fillChance:0.3,     velocityRange:[88,115],
  },
  kpop: {
    label:'K-POP',        rhythmDensity:0.72, leapChance:0.32,
    chordType:'dom9',     arpDensity:1.2,     swing:0.0,
    octaveSpread:1,       fillChance:0.35,    velocityRange:[85,112],
  },

  // ── R&B / Soul / Gospel ───────────────────────────────────
  rnb: {
    label:'R&B',          rhythmDensity:0.55, leapChance:0.25,
    chordType:'dom9',     arpDensity:0.9,     swing:0.05,
    octaveSpread:1,       fillChance:0.25,    velocityRange:[75,105],
  },
  soul: {
    label:'SOUL',         rhythmDensity:0.50, leapChance:0.30,
    chordType:'dom9',     arpDensity:0.6,     swing:0.07,
    octaveSpread:1,       fillChance:0.2,     velocityRange:[72,102],
  },
  gospel: {
    label:'GOSPEL',       rhythmDensity:0.65, leapChance:0.35,
    chordType:'eleventh', arpDensity:1.0,     swing:0.06,
    octaveSpread:1,       fillChance:0.3,     velocityRange:[85,115],
  },

  // ── Jazz ─────────────────────────────────────────────────
  jazzSwing: {
    label:'JAZZ SWING',   rhythmDensity:0.60, leapChance:0.40,
    chordType:'shell',    arpDensity:0.5,     swing:0.12,
    octaveSpread:1,       fillChance:0.4,     velocityRange:[70,100],
  },
  bossanova: {
    label:'BOSSA NOVA',   rhythmDensity:0.50, leapChance:0.20,
    chordType:'dom9',     arpDensity:1.2,     swing:0.03,
    octaveSpread:0,       fillChance:0.1,     velocityRange:[65,90],
  },
  coolJazz: {
    label:'COOL JAZZ',    rhythmDensity:0.45, leapChance:0.35,
    chordType:'quartal',  arpDensity:0.6,     swing:0.08,
    octaveSpread:1,       fillChance:0.2,     velocityRange:[62,92],
  },
  fusion: {
    label:'JAZZ FUSION',  rhythmDensity:0.75, leapChance:0.50,
    chordType:'minMaj7',  arpDensity:1.0,     swing:0.04,
    octaveSpread:2,       fillChance:0.45,    velocityRange:[78,110],
  },

  // ── Blues ────────────────────────────────────────────────
  bluesStyle: {
    label:'BLUES',        rhythmDensity:0.55, leapChance:0.30,
    chordType:'seventh',  arpDensity:0.7,     swing:0.09,
    octaveSpread:1,       fillChance:0.35,    velocityRange:[75,108],
  },
  bluesRock: {
    label:'BLUES ROCK',   rhythmDensity:0.68, leapChance:0.38,
    chordType:'seventh',  arpDensity:0.5,     swing:0.05,
    octaveSpread:1,       fillChance:0.4,     velocityRange:[88,118],
  },

  // ── Rock & Metal ─────────────────────────────────────────
  hardRockStyle: {
    label:'HARD ROCK',    rhythmDensity:0.78, leapChance:0.42,
    chordType:'power',    arpDensity:0.5,     swing:0.0,
    octaveSpread:1,       fillChance:0.45,    velocityRange:[95,122],
  },
  metal: {
    label:'METAL',        rhythmDensity:0.92, leapChance:0.60,
    chordType:'power',    arpDensity:0.3,     swing:0.0,
    octaveSpread:1,       fillChance:0.55,    velocityRange:[105,127],
  },
  doom: {
    label:'DOOM',         rhythmDensity:0.30, leapChance:0.15,
    chordType:'power',    arpDensity:0.15,    swing:0.0,
    octaveSpread:0,       fillChance:0.12,    velocityRange:[88,115],
  },
  punkRock: {
    label:'PUNK ROCK',    rhythmDensity:0.95, leapChance:0.30,
    chordType:'power',    arpDensity:0.1,     swing:0.0,
    octaveSpread:0,       fillChance:0.5,     velocityRange:[100,127],
  },

  // ── Eletrônico ───────────────────────────────────────────
  edm: {
    label:'EDM',          rhythmDensity:0.80, leapChance:0.30,
    chordType:'sus4',     arpDensity:2.0,     swing:0.0,
    octaveSpread:2,       fillChance:0.45,    velocityRange:[95,120],
  },
  technoStyle: {
    label:'TECHNO',       rhythmDensity:0.88, leapChance:0.20,
    chordType:'power',    arpDensity:0.4,     swing:0.0,
    octaveSpread:1,       fillChance:0.4,     velocityRange:[95,118],
  },
  trap: {
    label:'TRAP',         rhythmDensity:0.40, leapChance:0.15,
    chordType:'seventh',  arpDensity:0.4,     swing:0.0,
    octaveSpread:0,       fillChance:0.3,     velocityRange:[70,100],
  },
  ambient: {
    label:'AMBIENT',      rhythmDensity:0.20, leapChance:0.08,
    chordType:'add9',     arpDensity:0.3,     swing:0.0,
    octaveSpread:1,       fillChance:0.02,    velocityRange:[45,75],
  },
  chillwave: {
    label:'CHILLWAVE',    rhythmDensity:0.38, leapChance:0.18,
    chordType:'dom9',     arpDensity:1.0,     swing:0.04,
    octaveSpread:1,       fillChance:0.1,     velocityRange:[58,88],
  },

  // ── Hip-Hop ───────────────────────────────────────────────
  boomBap: {
    label:'BOOM BAP',     rhythmDensity:0.48, leapChance:0.20,
    chordType:'seventh',  arpDensity:0.5,     swing:0.06,
    octaveSpread:0,       fillChance:0.2,     velocityRange:[72,100],
  },

  // ── Funk & Disco ─────────────────────────────────────────
  funk: {
    label:'FUNK',         rhythmDensity:0.82, leapChance:0.30,
    chordType:'dom9',     arpDensity:0.6,     swing:0.03,
    octaveSpread:1,       fillChance:0.4,     velocityRange:[90,118],
  },
  disco: {
    label:'DISCO',        rhythmDensity:0.75, leapChance:0.25,
    chordType:'dom9',     arpDensity:1.5,     swing:0.0,
    octaveSpread:1,       fillChance:0.3,     velocityRange:[88,112],
  },

  // ── Latino ───────────────────────────────────────────────
  sambaStyle: {
    label:'SAMBA',        rhythmDensity:0.80, leapChance:0.20,
    chordType:'dom9',     arpDensity:1.0,     swing:0.0,
    octaveSpread:1,       fillChance:0.35,    velocityRange:[88,115],
  },
  flamenco: {
    label:'FLAMENCO',     rhythmDensity:0.75, leapChance:0.45,
    chordType:'seventh',  arpDensity:1.5,     swing:0.0,
    octaveSpread:1,       fillChance:0.4,     velocityRange:[85,115],
  },
  tango: {
    label:'TANGO',        rhythmDensity:0.65, leapChance:0.38,
    chordType:'seventh',  arpDensity:0.8,     swing:0.0,
    octaveSpread:1,       fillChance:0.3,     velocityRange:[82,112],
  },
  salsa: {
    label:'SALSA',        rhythmDensity:0.78, leapChance:0.28,
    chordType:'dom9',     arpDensity:1.2,     swing:0.0,
    octaveSpread:1,       fillChance:0.38,    velocityRange:[88,115],
  },
  cumbia: {
    label:'CUMBIA',       rhythmDensity:0.70, leapChance:0.22,
    chordType:'triad',    arpDensity:0.9,     swing:0.0,
    octaveSpread:1,       fillChance:0.3,     velocityRange:[82,108],
  },

  // ── Reggae & Afrobeat ────────────────────────────────────
  reggae: {
    label:'REGGAE',       rhythmDensity:0.45, leapChance:0.15,
    chordType:'seventh',  arpDensity:0.6,     swing:0.0,
    octaveSpread:0,       fillChance:0.12,    velocityRange:[72,98],
  },
  afrobeat: {
    label:'AFROBEAT',     rhythmDensity:0.82, leapChance:0.22,
    chordType:'dom9',     arpDensity:1.3,     swing:0.02,
    octaveSpread:1,       fillChance:0.38,    velocityRange:[88,115],
  },

  // ── Clássico ─────────────────────────────────────────────
  classicalStyle: {
    label:'CLASSICAL',    rhythmDensity:0.50, leapChance:0.25,
    chordType:'triad',    arpDensity:1.0,     swing:0.0,
    octaveSpread:2,       fillChance:0.15,    velocityRange:[55,110],
  },
  romantic: {
    label:'ROMANTIC',     rhythmDensity:0.45, leapChance:0.30,
    chordType:'seventh',  arpDensity:1.2,     swing:0.0,
    octaveSpread:2,       fillChance:0.18,    velocityRange:[50,112],
  },

  // ── Folk & Country ───────────────────────────────────────
  folk: {
    label:'FOLK',         rhythmDensity:0.48, leapChance:0.20,
    chordType:'triad',    arpDensity:0.7,     swing:0.05,
    octaveSpread:1,       fillChance:0.15,    velocityRange:[68,98],
  },
  country: {
    label:'COUNTRY',      rhythmDensity:0.55, leapChance:0.20,
    chordType:'triad',    arpDensity:0.5,     swing:0.04,
    octaveSpread:1,       fillChance:0.2,     velocityRange:[75,105],
  },

  // ── World Music ───────────────────────────────────────────
  arabesque: {
    label:'ARABIC',       rhythmDensity:0.62, leapChance:0.38,
    chordType:'seventh',  arpDensity:1.0,     swing:0.0,
    octaveSpread:1,       fillChance:0.28,    velocityRange:[75,105],
  },
  japanese: {
    label:'JAPANESE',     rhythmDensity:0.28, leapChance:0.12,
    chordType:'sus2',     arpDensity:0.4,     swing:0.0,
    octaveSpread:0,       fillChance:0.08,    velocityRange:[55,85],
  },
};

// ────────────────────────────────────────────────────────────────
//  ESTILOS DE BATERIA — posições em semicolcheias (0–15)
//  v2: 9 grooves  |  v3: +10 grooves (total 19)
// ────────────────────────────────────────────────────────────────
const DRUM_STYLES = {
  // ── v2 ────────────────────────────────────────────────────
  rock: {
    label:'ROCK',
    kicks:[0,8],         snares:[4,12],
    hhs:[0,2,4,6,8,10,12,14],  openAt:[6,14],
  },
  halfTime: {
    label:'HALF-TIME',
    kicks:[0,10],        snares:[8],
    hhs:[0,4,8,12],     openAt:[12],
  },
  dnb: {
    label:'DnB',
    kicks:[0,7,10],      snares:[4,12],
    hhs:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], openAt:[],
  },
  tribal: {
    label:'TRIBAL',
    kicks:[0,3,7,11],    snares:[6,14],
    hhs:[0,2,4,6,8,10,12,14], openAt:[4,12],
  },
  shuffle: {
    label:'SHUFFLE',
    kicks:[0,9],         snares:[4,12],
    hhs:[0,3,4,7,8,11,12,15], openAt:[7,15],
  },
  march: {
    label:'MARCH',
    kicks:[0,4,8,12],    snares:[2,6,10,14],
    hhs:[0,4,8,12],     openAt:[],
  },
  sparse: {
    label:'SPARSE',
    kicks:[0,12],        snares:[8],
    hhs:[0,8],          openAt:[8],
  },
  fast: {
    label:'FAST',
    kicks:[0,6,8,14],    snares:[4,12,14],
    hhs:[0,2,4,6,8,10,12,14], openAt:[],
  },
  breakbeat: {
    label:'BREAKBEAT',
    kicks:[0,5,8,13],    snares:[4,10,12],
    hhs:[0,2,3,4,6,7,8,10,11,12,14,15], openAt:[6,14],
  },

  // ── v3 — novos grooves ────────────────────────────────────

  // Pop 4x4 padrão — kick em todos os tempos fortes
  fourOnFloor: {
    label:'FOUR ON FLOOR',
    kicks:[0,4,8,12],    snares:[4,12],
    hhs:[0,2,4,6,8,10,12,14], openAt:[14],
  },

  // Bossa Nova — clave sincopada característica
  bossaNovaDrum: {
    label:'BOSSA NOVA',
    kicks:[0,6,9],       snares:[3,6,12,14],
    hhs:[0,2,4,6,8,10,12,14], openAt:[6],
  },

  // Samba — densidade alta, tamborim feel
  sambaDrum: {
    label:'SAMBA',
    kicks:[0,3,8,11],    snares:[4,8,12],
    hhs:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], openAt:[],
  },

  // Reggae — one-drop (kick no 3, foco no off-beat)
  reggae: {
    label:'REGGAE',
    kicks:[8],           snares:[4,12],
    hhs:[2,6,10,14],    openAt:[6,14],
  },

  // Trap — hi-hats com rolls, kick esparso
  trapDrum: {
    label:'TRAP',
    kicks:[0,9,11],      snares:[8],
    hhs:[0,1,2,3,8,9,10,11], openAt:[],
  },

  // Funk 16 — hi-hats em semicolcheias, snare sincopado
  funk16: {
    label:'FUNK 16th',
    kicks:[0,6,9],       snares:[4,12,14],
    hhs:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], openAt:[8],
  },

  // Jazz Swing — ride com feel ternário aproximado
  swingJazz: {
    label:'JAZZ SWING',
    kicks:[0,8],         snares:[4,12],
    hhs:[0,3,4,7,8,11,12,15], openAt:[0,8],
  },

  // UK Garage / Two-Step
  twoStep: {
    label:'TWO-STEP',
    kicks:[0,6,8,14],    snares:[4,12],
    hhs:[0,2,4,6,8,10,12,14], openAt:[2,10],
  },

  // Ska — upstroke no off-beat (hi-hat nos contratempos)
  ska: {
    label:'SKA',
    kicks:[0,8],         snares:[4,8,12],
    hhs:[2,6,10,14],    openAt:[2,10],
  },

  // Ballad — lento, espaçado, dinâmico
  ballad: {
    label:'BALLAD',
    kicks:[0,10],        snares:[4,12],
    hhs:[0,4,8,12],     openAt:[8],
  },

  // ── Novos grooves ─────────────────────────────────────────

  // Boom Bap — hip hop clássico, kick no 1 e 3, snare no 2 e 4, hh swingado
  boomBap: {
    label:'BOOM BAP',
    kicks:[0,8],         snares:[4,12],
    hhs:[0,3,6,8,11,14], openAt:[],
  },

  // Disco — four-on-floor, open hh nos off-beats
  discoDrum: {
    label:'DISCO',
    kicks:[0,4,8,12],    snares:[4,12],
    hhs:[0,2,4,6,8,10,12,14], openAt:[2,6,10,14],
  },

  // Afrobeat — padrão polirítmico, kick assimétrico, sem open hh
  afrobeatDrum: {
    label:'AFROBEAT',
    kicks:[0,3,8,11],    snares:[4,6,12,14],
    hhs:[0,2,4,6,8,10,12,14], openAt:[],
  },

  // Tango — marcato, kick no 1 e 3, snare em contratempo acentuado
  tangoGroove: {
    label:'TANGO',
    kicks:[0,6,8],       snares:[4,10,12],
    hhs:[0,4,8,12],     openAt:[],
  },

  // Cumbia — padrão colombiano, kick no 1, guiro/hh em colcheias
  cumbiaGroove: {
    label:'CUMBIA',
    kicks:[0,8],         snares:[4,6,12,14],
    hhs:[0,2,4,6,8,10,12,14], openAt:[4,12],
  },

  // Synthwave — 80s eletrônico, snare estridente no 2 e 4, hh apertado
  synthwaveDrum: {
    label:'SYNTHWAVE',
    kicks:[0,4,8,12],    snares:[4,12],
    hhs:[0,2,4,6,8,10,12,14], openAt:[],
  },
};

// ────────────────────────────────────────────────────────────────
//  PRESETS — organizados por gênero
// ────────────────────────────────────────────────────────────────
const PRESETS = {
  // ── Pop ───────────────────────────────────────────────────
  popBallad: {
    label:'💗 POP BALLAD',    genre:'pop',       key:60, scale:'major',
    bpm:72,  bars:16, prog:[0,5,3,4], style:'pop',        drumStyle:'ballad',
  },
  popDance: {
    label:'🎤 POP DANCE',     genre:'pop',       key:62, scale:'major',
    bpm:128, bars:16, prog:[0,4,5,3], style:'pop',        drumStyle:'fourOnFloor',
  },
  indiePop: {
    label:'🌸 INDIE POP',     genre:'pop',       key:60, scale:'dorian',
    bpm:108, bars:8,  prog:[0,3,5,4], style:'dreampop',   drumStyle:'rock',
  },
  synthPop: {
    label:'🔮 SYNTH POP',     genre:'pop',       key:62, scale:'minor',
    bpm:118, bars:16, prog:[0,4,5,3], style:'synthwave',  drumStyle:'fourOnFloor',
  },
  shoegaze: {
    label:'🌀 SHOEGAZE',      genre:'pop',       key:60, scale:'dorian',
    bpm:95,  bars:8,  prog:[0,3,1,5], style:'shoegaze',   drumStyle:'rock',
  },
  kpopHit: {
    label:'🌟 K-POP',         genre:'pop',       key:62, scale:'major',
    bpm:138, bars:16, prog:[0,4,5,3], style:'kpop',       drumStyle:'fourOnFloor',
  },

  // ── R&B / Soul ────────────────────────────────────────────
  rnbGroove: {
    label:'🎵 R&B GROOVE',    genre:'rnb',       key:60, scale:'minor',
    bpm:85,  bars:8,  prog:[0,3,6,4], style:'rnb',        drumStyle:'funk16',
  },
  neoSoul: {
    label:'✨ NEO SOUL',      genre:'rnb',       key:62, scale:'dorian',
    bpm:92,  bars:8,  prog:[0,4,2,5], style:'soul',       drumStyle:'funk16',
  },
  soulBallad: {
    label:'💙 SOUL BALLAD',   genre:'rnb',       key:57, scale:'major',
    bpm:65,  bars:16, prog:[0,5,3,4], style:'soul',       drumStyle:'ballad',
  },
  gospelChoir: {
    label:'🙌 GOSPEL',        genre:'rnb',       key:60, scale:'major',
    bpm:95,  bars:8,  prog:[0,4,5,3], style:'gospel',     drumStyle:'shuffle',
  },

  // ── Jazz ──────────────────────────────────────────────────
  jazzBebop: {
    label:'🎺 BEBOP',         genre:'jazz',      key:60, scale:'bebopDom',
    bpm:240, bars:8,  prog:[0,4,2,5], style:'jazzSwing',  drumStyle:'swingJazz',
  },
  bossaNova: {
    label:'🌺 BOSSA NOVA',    genre:'jazz',      key:60, scale:'major',
    bpm:130, bars:8,  prog:[0,4,2,5], style:'bossanova',  drumStyle:'bossaNovaDrum',
  },
  coolJazzPres: {
    label:'🌙 COOL JAZZ',     genre:'jazz',      key:62, scale:'dorian',
    bpm:95,  bars:8,  prog:[0,4,6,2], style:'coolJazz',   drumStyle:'swingJazz',
  },
  modalJazz: {
    label:'🔵 MODAL JAZZ',    genre:'jazz',      key:60, scale:'dorian',
    bpm:145, bars:16, prog:[0,1,4,3], style:'jazzSwing',  drumStyle:'swingJazz',
  },
  jazzFusion: {
    label:'⚡ JAZZ FUSION',    genre:'jazz',      key:62, scale:'lydianDom',
    bpm:155, bars:8,  prog:[0,4,1,5], style:'fusion',     drumStyle:'funk16',
  },

  // ── Blues ─────────────────────────────────────────────────
  classicBlues: {
    label:'🎸 12-BAR BLUES',  genre:'blues',     key:57, scale:'blues',
    bpm:80,  bars:8,  prog:[0,0,0,0,3,3,0,0,4,3,0,4], style:'bluesStyle', drumStyle:'shuffle',
  },
  deltaBlues: {
    label:'🌾 DELTA BLUES',   genre:'blues',     key:55, scale:'pentatonicMin',
    bpm:68,  bars:8,  prog:[0,0,3,4], style:'bluesStyle', drumStyle:'sparse',
  },
  chicagoBlues: {
    label:'🏙 CHICAGO BLUES', genre:'blues',     key:57, scale:'blues',
    bpm:112, bars:8,  prog:[0,3,0,4], style:'bluesStyle', drumStyle:'shuffle',
  },
  bluesRockPres: {
    label:'🎸 BLUES ROCK',    genre:'blues',     key:64, scale:'pentatonicMin',
    bpm:130, bars:8,  prog:[0,3,0,4], style:'bluesRock',  drumStyle:'rock',
  },

  // ── Hip-Hop ───────────────────────────────────────────────
  boomBapHH: {
    label:'🎤 BOOM BAP',      genre:'hiphop',    key:60, scale:'minor',
    bpm:90,  bars:8,  prog:[0,5,3,6], style:'boomBap',    drumStyle:'boomBap',
  },
  lofiHipHop: {
    label:'☕ LO-FI HIP HOP', genre:'hiphop',    key:62, scale:'dorian',
    bpm:85,  bars:8,  prog:[0,3,2,5], style:'boomBap',    drumStyle:'shuffle',
  },
  trapHipHop: {
    label:'🖤 TRAP',          genre:'hiphop',    key:57, scale:'minor',
    bpm:140, bars:8,  prog:[0,5,3,4], style:'trap',       drumStyle:'trapDrum',
  },
  oldSchoolHH: {
    label:'🎙 OLD SCHOOL',    genre:'hiphop',    key:60, scale:'pentatonicMin',
    bpm:98,  bars:8,  prog:[0,3,0,5], style:'boomBap',    drumStyle:'boomBap',
  },

  // ── Funk & Disco ──────────────────────────────────────────
  funkClassic: {
    label:'🕺 FUNK',          genre:'funk',      key:60, scale:'minor',
    bpm:108, bars:8,  prog:[0,3,0,4], style:'funk',       drumStyle:'funk16',
  },
  discoBall: {
    label:'🪩 DISCO',         genre:'funk',      key:62, scale:'major',
    bpm:118, bars:8,  prog:[0,4,5,3], style:'disco',      drumStyle:'discoDrum',
  },
  funkyDisco: {
    label:'🎶 FUNK DISCO',    genre:'funk',      key:60, scale:'mixolydian',
    bpm:112, bars:8,  prog:[0,4,0,5], style:'funk',       drumStyle:'discoDrum',
  },

  // ── Latino ────────────────────────────────────────────────
  sambaCarnaval: {
    label:'🎊 SAMBA',         genre:'latin',     key:60, scale:'major',
    bpm:200, bars:8,  prog:[0,4,0,5], style:'sambaStyle', drumStyle:'sambaDrum',
  },
  sambaEnredo: {
    label:'🏆 SAMBA-ENREDO',  genre:'latin',     key:62, scale:'major',
    bpm:220, bars:16, prog:[0,4,5,0], style:'sambaStyle', drumStyle:'sambaDrum',
  },
  latinJazz: {
    label:'🎷 LATIN JAZZ',    genre:'latin',     key:60, scale:'mixolydian',
    bpm:160, bars:8,  prog:[0,4,2,5], style:'bossanova',  drumStyle:'bossaNovaDrum',
  },
  reggaeton: {
    label:'🏖 REGGAETON',     genre:'latin',     key:57, scale:'minor',
    bpm:95,  bars:8,  prog:[0,5,4,3], style:'trap',       drumStyle:'twoStep',
  },
  tangoArg: {
    label:'💃 TANGO',         genre:'latin',     key:57, scale:'harmMinor',
    bpm:68,  bars:8,  prog:[0,1,4,5], style:'tango',      drumStyle:'tangoGroove',
  },
  milonga: {
    label:'🌹 MILONGA',       genre:'latin',     key:60, scale:'harmMinor',
    bpm:130, bars:8,  prog:[0,4,5,1], style:'tango',      drumStyle:'tangoGroove',
  },
  salsaNY: {
    label:'🎺 SALSA',         genre:'latin',     key:60, scale:'mixolydian',
    bpm:185, bars:8,  prog:[0,4,2,5], style:'salsa',      drumStyle:'sambaDrum',
  },
  cumbiaCol: {
    label:'🪗 CUMBIA',        genre:'latin',     key:62, scale:'major',
    bpm:110, bars:8,  prog:[0,4,3,5], style:'cumbia',     drumStyle:'cumbiaGroove',
  },

  // ── Rock & Metal ─────────────────────────────────────────
  classicRock: {
    label:'🎸 CLASSIC ROCK',  genre:'rock',      key:64, scale:'pentatonicMin',
    bpm:130, bars:8,  prog:[0,3,0,4], style:'bluesRock',  drumStyle:'rock',
  },
  hardRock: {
    label:'🔥 HARD ROCK',     genre:'rock',      key:62, scale:'minor',
    bpm:165, bars:8,  prog:[0,6,3,4], style:'hardRockStyle',drumStyle:'rock',
  },
  heavyMetal: {
    label:'💀 HEAVY METAL',   genre:'rock',      key:57, scale:'phrygian',
    bpm:210, bars:8,  prog:[0,1,5,0], style:'metal',      drumStyle:'fast',
  },
  punkPres: {
    label:'⚡ PUNK',           genre:'rock',      key:60, scale:'major',
    bpm:200, bars:4,  prog:[0,3,4,0], style:'punkRock',   drumStyle:'fast',
  },
  doomMetal: {
    label:'🖤 DOOM METAL',    genre:'rock',      key:57, scale:'harmMinor',
    bpm:60,  bars:8,  prog:[0,1,5,3], style:'doom',       drumStyle:'halfTime',
  },
  deathmetal: {
    label:'🩸 DEATH METAL',   genre:'rock',      key:55, scale:'phrygian',
    bpm:240, bars:8,  prog:[0,1,5,4], style:'metal',      drumStyle:'dnb',
  },

  // ── Eletrônico ────────────────────────────────────────────
  techno: {
    label:'🎛 TECHNO',        genre:'electronic',key:60, scale:'minor',
    bpm:145, bars:8,  prog:[0,3,0,4], style:'technoStyle',drumStyle:'fourOnFloor',
  },
  house: {
    label:'🏠 HOUSE',         genre:'electronic',key:62, scale:'minor',
    bpm:128, bars:8,  prog:[0,3,5,4], style:'edm',        drumStyle:'fourOnFloor',
  },
  chillwave: {
    label:'🌊 CHILLWAVE',     genre:'electronic',key:60, scale:'dorian',
    bpm:90,  bars:8,  prog:[0,3,5,4], style:'chillwave',  drumStyle:'sparse',
  },
  ambientPad: {
    label:'🌌 AMBIENT',       genre:'electronic',key:60, scale:'lydian',
    bpm:70,  bars:16, prog:[0,4,2,1], style:'ambient',    drumStyle:'sparse',
  },
  synthwaveRetro: {
    label:'🌆 SYNTHWAVE',     genre:'electronic',key:62, scale:'minor',
    bpm:110, bars:8,  prog:[0,4,5,3], style:'synthwave',  drumStyle:'synthwaveDrum',
  },
  vaporwave: {
    label:'🌸 VAPORWAVE',     genre:'electronic',key:60, scale:'lydian',
    bpm:75,  bars:8,  prog:[0,4,2,5], style:'chillwave',  drumStyle:'synthwaveDrum',
  },
  dnbTrack: {
    label:'🥁 DRUM & BASS',   genre:'electronic',key:57, scale:'minor',
    bpm:175, bars:8,  prog:[0,5,3,4], style:'technoStyle',drumStyle:'dnb',
  },
  breakbeatTrack: {
    label:'💥 BREAKBEAT',     genre:'electronic',key:60, scale:'dorian',
    bpm:132, bars:8,  prog:[0,3,6,4], style:'edm',        drumStyle:'breakbeat',
  },

  // ── Clássico ─────────────────────────────────────────────
  baroque: {
    label:'🎻 BAROQUE',       genre:'classical', key:60, scale:'major',
    bpm:100, bars:16, prog:[0,4,5,3], style:'classicalStyle',drumStyle:'march',
  },
  romanticPres: {
    label:'🌹 ROMANTIC',      genre:'classical', key:57, scale:'minor',
    bpm:72,  bars:16, prog:[0,3,5,4], style:'romantic',   drumStyle:'ballad',
  },
  impressionist: {
    label:'🌸 IMPRESSIONIST', genre:'classical', key:60, scale:'wholeTone',
    bpm:80,  bars:16, prog:[0,2,4,1], style:'classicalStyle',drumStyle:'sparse',
  },
  waltzVienna: {
    label:'💫 WALTZ',         genre:'classical', key:60, scale:'major',
    bpm:170, bars:8,  prog:[0,4,5,0], style:'classicalStyle',drumStyle:'march',
  },

  // ── Folk & Country ────────────────────────────────────────
  countryRoad: {
    label:'🤠 COUNTRY',       genre:'folk',      key:60, scale:'major',
    bpm:120, bars:8,  prog:[0,4,5,3], style:'country',    drumStyle:'shuffle',
  },
  folkBallad: {
    label:'🪕 FOLK BALLAD',   genre:'folk',      key:57, scale:'major',
    bpm:85,  bars:8,  prog:[0,5,3,4], style:'folk',       drumStyle:'ballad',
  },
  irishJig: {
    label:'🍀 IRISH JIG',     genre:'folk',      key:60, scale:'mixolydian',
    bpm:180, bars:8,  prog:[0,4,3,0], style:'folk',       drumStyle:'march',
  },
  bluegrass: {
    label:'🎻 BLUEGRASS',     genre:'folk',      key:62, scale:'major',
    bpm:145, bars:8,  prog:[0,4,5,0], style:'country',    drumStyle:'shuffle',
  },

  // ── World Music ───────────────────────────────────────────
  flamencoGit: {
    label:'💃 FLAMENCO',      genre:'world',     key:64, scale:'spanishPhrygian',
    bpm:160, bars:8,  prog:[0,1,4,0], style:'flamenco',   drumStyle:'tribal',
  },
  arabicNight: {
    label:'🌙 ARABIC',        genre:'world',     key:60, scale:'arabicMaqam',
    bpm:110, bars:8,  prog:[0,1,4,2], style:'arabesque',  drumStyle:'tribal',
  },
  japaneseKoto: {
    label:'🌸 JAPANESE',      genre:'world',     key:60, scale:'japaneseIn',
    bpm:90,  bars:8,  prog:[0,2,1,0], style:'japanese',   drumStyle:'sparse',
  },
  reggaeRoots: {
    label:'🌿 REGGAE',        genre:'world',     key:60, scale:'mixolydian',
    bpm:80,  bars:8,  prog:[0,4,3,5], style:'reggae',     drumStyle:'reggae',
  },
  afrobeatPres: {
    label:'🌍 AFROBEAT',      genre:'world',     key:60, scale:'dorian',
    bpm:112, bars:8,  prog:[0,3,0,4], style:'afrobeat',   drumStyle:'afrobeatDrum',
  },
  afropop: {
    label:'🎵 AFROPOP',       genre:'world',     key:62, scale:'major',
    bpm:125, bars:8,  prog:[0,4,3,5], style:'afrobeat',   drumStyle:'afrobeatDrum',
  },
  ska: {
    label:'🎺 SKA',           genre:'world',     key:60, scale:'major',
    bpm:160, bars:8,  prog:[0,4,5,3], style:'reggae',     drumStyle:'ska',
  },
  persia: {
    label:'🕌 PERSIAN',       genre:'world',     key:60, scale:'persian',
    bpm:105, bars:8,  prog:[0,1,4,0], style:'arabesque',  drumStyle:'tribal',
  },
};

// ────────────────────────────────────────────────────────────────
//  RNG — gerador determinístico (LCG)
// ────────────────────────────────────────────────────────────────
let _seed = 42;
function seedRng(s){ _seed = s >>> 0; }
function rng(){
  _seed = (_seed * 1664525 + 1013904223) >>> 0;
  return _seed / 4294967296;
}
function ri(a,b){ return Math.floor(rng()*(b-a+1))+a; }
function pick(arr){ return arr[Math.floor(rng()*arr.length)]; }

// ────────────────────────────────────────────────────────────────
//  UTILITÁRIOS DE TEORIA MUSICAL
// ────────────────────────────────────────────────────────────────
function scaleNotesList(keyMidi, scaleName, lo=36, hi=96){
  const root = keyMidi % 12;
  const ivs  = SCALES[scaleName] ? SCALES[scaleName].i : SCALES.major.i;
  const out  = [];
  for(let p=lo; p<=hi; p++) if(ivs.includes((p-root+120)%12)) out.push(p);
  return out;
}

function nearestIn(arr, pitch){
  if(!arr.length) return pitch;
  return arr.reduce((a,b) => Math.abs(b-pitch) < Math.abs(a-pitch) ? b : a, arr[0]);
}

function stepFrom(arr, pitch, steps){
  if(!arr.length) return pitch;
  let idx = arr.findIndex(n => n >= pitch);
  if(idx < 0) idx = arr.length - 1;
  return arr[Math.max(0, Math.min(arr.length-1, idx+steps))];
}

function chordPCs(keyMidi, scaleName, degree, chordType='triad'){
  const ivs   = SCALES[scaleName] ? SCALES[scaleName].i : SCALES.major.i;
  const len   = ivs.length;
  const root  = keyMidi % 12;
  const shape = CHORD_SHAPES[chordType] || CHORD_SHAPES.triad;
  return shape.map(off => {
    const pos = (degree + off) % len;
    return (root + ivs[pos]) % 12;
  });
}

function chordTones(scaleNotes, pcs){
  return scaleNotes.filter(n => pcs.includes(n%12));
}

// ────────────────────────────────────────────────────────────────
//  PADRÕES RÍTMICOS — por categoria de densidade
// ────────────────────────────────────────────────────────────────
const RHYTHMS_DENSE = [
  [.5,.5,.5,.5,.5,.5,1],
  [.25,.25,.5,.25,.25,.5,.5,.5],
  [.5,.25,.25,.5,.5,.5,.5],
  [.25,.25,.25,.25,.5,.5,.5,.5],
  [.5,.5,.25,.25,.5,.5,.5],
  // v3: padrões funky/sincopados
  [.25,.5,.25,.5,.5,.5,.5,.5],
  [.5,.5,.5,.25,.25,.5,.5],
];
const RHYTHMS_MID = [
  [1,.5,.5,1,1],
  [.5,.5,.5,.5,2],
  [1,1,1,1],
  [.5,.5,1,.5,.5,1],
  [1.5,.5,1,1],
  [1,.5,.5,.5,.5,1],
  [2,1,.5,.5],
  // v3: padrões com swing / bossa feel
  [1,1,.5,.5,1],
  [.75,.25,1,1,1],
  [1,.5,1.5,1],
];
const RHYTHMS_SPARSE = [
  [2,2],
  [1.5,.5,2],
  [2,1,1],
  [1,3],
  [3,1],
  [1.5,1.5,1],
  // v3: padrões de balada e ambient
  [4],
  [2,1.5,.5],
  [1.5,2.5],
];

function getRhythmPool(density){
  if(density >= 0.75) return RHYTHMS_DENSE;
  if(density >= 0.40) return RHYTHMS_MID;
  return RHYTHMS_SPARSE;
}

// ────────────────────────────────────────────────────────────────
//  PADRÕES DE BAIXO — v2: 8 padrões  |  v3: +6 padrões (total 14)
// ────────────────────────────────────────────────────────────────
const BASS_PATS = [
  // 0 — walking básico
  (r,f)    => [{p:r,b:0,d:.9},{p:f,b:1,d:.4},{p:r,b:2,d:.9},{p:f,b:3,d:.4}],
  // 1 — notas longas
  (r,f)    => [{p:r,b:0,d:1.9},{p:f,b:2,d:1.9}],
  // 2 — walking cromático
  (r,f,sc) => [{p:r,b:0,d:.9},{p:stepFrom(sc,r,1),b:1,d:.9},{p:f,b:2,d:.9},{p:stepFrom(sc,f,1),b:3,d:.9}],
  // 3 — ostinato em oitava
  (r,f)    => [{p:r,b:0,d:.4},{p:r+12,b:.5,d:.4},{p:f,b:1,d:.4},{p:r,b:1.5,d:.4},{p:r,b:2,d:.4},{p:r+12,b:2.5,d:.4},{p:f,b:3,d:.4},{p:r,b:3.5,d:.4}],
  // 4 — pedal (power)
  (r)      => [{p:r,b:0,d:3.9}],
  // 5 — sincopado
  (r,f)    => [{p:r,b:0,d:.4},{p:f,b:.75,d:.4},{p:r,b:1.5,d:.4},{p:f,b:2.25,d:.4},{p:r,b:3,d:.9}],
  // 6 — baixo em colcheias
  (r,f,sc) => [{p:r,b:0,d:.4},{p:stepFrom(sc,r,2),b:.5,d:.4},{p:f,b:1,d:.4},{p:stepFrom(sc,f,-1),b:1.5,d:.4},{p:r,b:2,d:.4},{p:stepFrom(sc,r,1),b:2.5,d:.4},{p:f,b:3,d:.4},{p:r,b:3.5,d:.4}],
  // 7 — groove funk
  (r,f)    => [{p:r,b:0,d:.2},{p:r,b:.25,d:.2},{p:f,b:.75,d:.4},{p:r,b:1.5,d:.2},{p:r,b:2,d:.2},{p:f,b:2.5,d:.4},{p:r,b:3.25,d:.2},{p:r,b:3.75,d:.2}],
  // 8 — bossa nova (v3): sincopado com nota de passagem
  (r,f,sc) => [{p:r,b:0,d:.8},{p:stepFrom(sc,r,1),b:1,d:.3},{p:f,b:1.5,d:.8},{p:r,b:2.5,d:.3},{p:stepFrom(sc,r,2),b:3,d:.4},{p:r,b:3.5,d:.4}],
  // 9 — reggae one-drop (v3): nota no tempo 3
  (r,f)    => [{p:r,b:0,d:1.8},{p:f,b:2,d:.9},{p:r,b:3,d:.9}],
  // 10 — samba (v3): linha rápida com célula repetida
  (r,f,sc) => [{p:r,b:0,d:.2},{p:r,b:.25,d:.2},{p:stepFrom(sc,r,1),b:.5,d:.2},{p:f,b:.75,d:.4},{p:r,b:1.25,d:.2},{p:f,b:1.5,d:.2},{p:r,b:2,d:.2},{p:r,b:2.25,d:.2},{p:stepFrom(sc,r,-1),b:2.5,d:.2},{p:f,b:2.75,d:.4},{p:r,b:3.25,d:.2},{p:f,b:3.5,d:.4}],
  // 11 — jazz walking (v3): 4 notas por compasso com cromatismo
  (r,f,sc) => [{p:r,b:0,d:.9},{p:stepFrom(sc,r,1),b:1,d:.9},{p:f,b:2,d:.9},{p:stepFrom(sc,f,-1),b:3,d:.9}],
  // 12 — latin/cha-cha (v3)
  (r,f)    => [{p:r,b:0,d:.4},{p:r,b:.5,d:.4},{p:f,b:1.5,d:.4},{p:r,b:2,d:.4},{p:f,b:3,d:.4},{p:r,b:3.5,d:.4}],
  // 13 — ambient pedal longo (v3)
  (r)      => [{p:r,b:0,d:3.9}],
];

// ────────────────────────────────────────────────────────────────
//  SHAPES DE ARPEJO — v2: 8  |  v3: +6 (total 14)
// ────────────────────────────────────────────────────────────────
const ARP_SHAPES = [
  [0,1,2,1],         // up-down tríade
  [0,1,2,3],         // up tétrade
  [3,2,1,0],         // down tétrade
  [0,2,1,3],         // skip
  [2,0,3,1],         // salto invertido
  [0,1,2,3,2,1],     // up-down completo
  [0,2,4,2],         // arpejo largo
  [0,3,1,2],         // jazz comping
  // v3
  [0,0,1,2],         // ostinato + sobe (bossa feel)
  [0,2,0,3],         // quartal arpejo
  [1,0,2,3],         // jazz voice leading
  [0,3,2,1],         // descida com skip
  [0,1,3,2],         // pop arpejo
  [2,3,1,0],         // retrógrado saltado
];

// ================================================================
//  SISTEMA DE GENOME MUSICAL — Engine v4
//  A grande revolução: elimina repetição mecânica via DNA evolutivo
//
//  buildGenome      — cria DNA musical a partir do estilo
//  mutateGenome     — 3 níveis de mutação por compasso
//  calcRepeatPressure — detecta repetição, força contraste
//  tensionCurve     — arco dramático intro→clímax→resolução
//  humanizeNoteGen  — jitter REAL de timing/duração/velocity
//  genCounterpoint  — segunda voz melódica em movimento contrário
//  generateBlock    — núcleo evolutivo (aceita genome + memória)
//  generate         — wrapper retrocompatível de generateBlock
// ================================================================

// ── buildGenome ─────────────────────────────────────────────────
// DNA musical derivado das propriedades do STYLE_PROFILE.
// Estilos densos mutam mais; estilos com mais swing ornam mais.
function buildGenome(style){
  const rhythmPool = getRhythmPool(style.rhythmDensity);
  const contours   = ['up','down','arch','flat'];
  const mutRate    = Math.min(0.55,
    style.rhythmDensity * 0.25 + (style.leapChance||0.2) * 0.25
  );
  return {
    motifRhythmIdx:      ri(0, rhythmPool.length-1),
    motifContour:        pick(contours),
    motifLeapSize:       Math.max(1, Math.round((style.leapChance||0.2)*6)),
    mutationRate:        mutRate,
    repetitionTolerance: Math.max(0.2, 1 - style.rhythmDensity),
    tensionBias:         style.leapChance || 0.2,
    registerBias:        0.5,
    ornamentChance:      (style.swing||0) > 0.05 ? 0.15 : 0.05,
    syncopationBias:     style.rhythmDensity * 0.3,
    bassPatIdx:          ri(0, BASS_PATS.length-1),
    arpShapeIdx:         ri(0, ARP_SHAPES.length-1),
    generation:          0,
  };
}

// ── buildPhraseSnapshot ─────────────────────────────────────────
// Extrai 3 métricas de 1 compasso de melodia para detectar repetição
function buildPhraseSnapshot(barMelody){
  if(!barMelody.length) return { pitchMean:60, density:0, intervalMean:0 };
  const pitches   = barMelody.map(n => n.pitch);
  const pitchMean = pitches.reduce((a,b)=>a+b,0)/pitches.length;
  let iSum = 0;
  for(let i=1; i<pitches.length; i++) iSum += Math.abs(pitches[i]-pitches[i-1]);
  return {
    pitchMean,
    density:      barMelody.length,
    intervalMean: pitches.length>1 ? iSum/(pitches.length-1) : 0,
  };
}

// ── calcRepeatPressure ──────────────────────────────────────────
// Compara últimas 2–3 frases. Retorna [0,1]:
//   0 = frases variadas  |  1 = repetição total detectada
// Quando pressure > 0.6 → força mutação estrutural imediata
function calcRepeatPressure(memory){
  if(memory.length < 2) return 0;
  const last = memory[memory.length-1];
  const prev = memory[memory.length-2];
  const sim2 = 1 - Math.min(1,(
    Math.abs(last.pitchMean    - prev.pitchMean)    /12 +
    Math.abs(last.density      - prev.density)      / 8 +
    Math.abs(last.intervalMean - prev.intervalMean) / 6
  )/3);
  if(memory.length < 3) return sim2*0.5;
  const prev2 = memory[memory.length-3];
  const sim3  = 1 - Math.min(1,(
    Math.abs(last.pitchMean    - prev2.pitchMean)    /12 +
    Math.abs(last.density      - prev2.density)      / 8 +
    Math.abs(last.intervalMean - prev2.intervalMean) / 6
  )/3);
  return Math.max(sim2*0.6, sim3*0.5);
}

// ── mutateGenome ────────────────────────────────────────────────
// 3 níveis de mutação evolutiva:
//
//  LEVE        (qualquer compasso, prob=mutRate)
//    contorno + sincopação: micro-variação de identidade
//
//  ESTRUTURAL  (cada 4 comp. OU pressure>0.6)
//    troca bassPatIdx e arpShapeIdx, inverte contorno
//    → quando o ouvido detecta repetição, o padrão muda
//
//  DE SEÇÃO    (cada 8 compassos)
//    troca motifRhythm e registerBias
//    → renovação macro do bloco musical
//
//  Regra de ouro: 70–85% de identidade preservada por compasso.
//  3 frases similares → taxa efetiva sobe até 65%.
function mutateGenome(genome, phraseMemory){
  const g        = { ...genome };
  const pressure = calcRepeatPressure(phraseMemory);
  const eff      = Math.min(0.65, g.mutationRate + pressure);
  const contours = ['up','down','arch','flat'];

  // LEVE
  if(rng() < eff){
    g.motifContour    = contours[ri(0,contours.length-1)];
    g.syncopationBias = Math.max(0, Math.min(1, g.syncopationBias+(rng()-0.5)*0.12));
  }

  // ESTRUTURAL
  if(g.generation > 0 && (g.generation%4===0 || pressure > 0.6)){
    g.bassPatIdx  = ri(0, BASS_PATS.length-1);
    g.arpShapeIdx = ri(0, ARP_SHAPES.length-1);
    if     (g.motifContour==='up')   g.motifContour='down';
    else if(g.motifContour==='down') g.motifContour='up';
  }

  // DE SEÇÃO
  if(g.generation > 0 && g.generation%8===0){
    const pool = getRhythmPool(g.tensionBias > 0.4 ? 0.8 : 0.5);
    g.motifRhythmIdx = ri(0, pool.length-1);
    g.registerBias   = (g.registerBias + 0.3) % 1;
    g.ornamentChance = Math.max(0, Math.min(0.3, g.ornamentChance+(rng()-0.5)*0.08));
  }

  // Pressão extra: estilos caóticos variam o salto intervalar
  if(g.tensionBias > 0.5 && rng() < 0.25){
    g.motifLeapSize = Math.max(1, Math.min(6, g.motifLeapSize+(rng()<0.5?1:-1)));
  }

  g.generation++;
  return g;
}

// ── tensionCurve ────────────────────────────────────────────────
// Arco dramático clássico por compasso [0,1]:
//   intro (0→0.15t) ramp 0→1.0
//   build (0.15→0.60t) sustain 1.0
//   descida (0.60→0.85t) 1.0→0.5
//   resolução (0.85→1.0t) 0.5→0.0
function tensionCurve(barIdx, totalBars){
  const t = barIdx / Math.max(1, totalBars-1);
  let ten;
  if     (t < 0.15) ten = t/0.15;
  else if(t < 0.60) ten = 1.0;
  else if(t < 0.85) ten = 1.0 - ((t-0.60)/0.25)*0.5;
  else              ten = 0.5 - ((t-0.85)/0.15)*0.5;
  return Math.max(0, Math.min(1, ten));
}

// ── humanizeNoteGen ─────────────────────────────────────────────
// Jitter REAL aplicado durante a geração (não pós-play).
// amount ∈ [0, 0.15]: 0 = mecânico, 0.15 = máxima expressão
// Diferente da versão anterior: afeta o dado — não é visual.
function humanizeNoteGen(note, amount, isDrum){
  if(!amount || amount<=0) return note;
  const n = { ...note };
  if(isDrum){
    n.velocity = Math.round(Math.max(20, Math.min(127,
      n.velocity + (rng()-0.5)*2*(amount*12)
    )));
  } else {
    n.startBeat = Math.max(0, n.startBeat + (rng()-0.5)*2*amount);
    n.velocity  = Math.round(Math.max(20, Math.min(127,
      n.velocity + (rng()-0.5)*2*(amount*30)
    )));
    n.duration  = Math.max(0.05, n.duration*(1+(rng()-0.5)*2*(amount*0.08)));
  }
  return n;
}

// ── genCounterpoint ─────────────────────────────────────────────
// Segunda voz melódica em movimento contrário à melodia principal.
// Regras:
//   · Movimento oposto ao centro tonal (A4=69): mel alta → counter desce
//   · Registro 5–10 semitons abaixo
//   · Durações mais longas → independência rítmica
//   · Velocity -8 MIDI → recua para segundo plano acústico
function genCounterpoint(melody, cfg){
  const sc      = cfg.scale || 'major';
  const sNotes  = scaleNotesList(cfg.key, sc, 48, 72);
  const counter = [];
  const bars    = cfg.bars || 8;

  for(let bar=0; bar<bars; bar++){
    const bOff     = bar*4;
    const barNotes = melody.filter(n => n.startBeat >= bOff && n.startBeat < bOff+4);
    if(!barNotes.length) continue;

    const step = pick([1,2]);
    for(let beat=bOff; beat<bOff+4; beat+=step){
      const ref = barNotes.find(n =>
        n.startBeat<=beat && n.startBeat+n.duration>beat
      ) || barNotes[0];
      if(!ref) continue;

      const offset = ref.pitch > 69 ? -ri(5,10) : ri(5,10);
      let pitch    = nearestIn(sNotes, ref.pitch+offset);
      while(pitch<48) pitch+=12;
      while(pitch>72) pitch-=12;

      counter.push({
        pitch,
        startBeat: beat,
        duration:  step*0.92,
        velocity:  Math.max(20, (ref.velocity||80)-8),
      });
    }
  }
  return counter;
}

// ── genBassIdx — genBass guiado pelo genome.bassPatIdx ──────────
function genBassIdx(notes, scNotes, pcs, cTones, bOff, style, patIdx){
  if(!cTones.length) return;
  const r   = cTones[0];
  const f   = cTones[1] || (r+7<=59 ? r+7 : r-5);
  const idx = ((patIdx % BASS_PATS.length) + BASS_PATS.length) % BASS_PATS.length;
  const evs = BASS_PATS[idx](r,f,scNotes);
  for(const ev of evs){
    let p = ev.p;
    while(p<36) p+=12;
    while(p>59) p-=12;
    const [vLo,vHi] = style.velocityRange || [80,105];
    notes.push({ pitch:p, startBeat:bOff+ev.b, duration:ev.d, velocity:ri(vLo,vHi) });
  }
}

// ── genArpIdx — genArp guiado pelo genome.arpShapeIdx ───────────
function genArpIdx(notes, scNotes, pcs, bOff, style, shapeIdx){
  const cTones = chordTones(scNotes, pcs).slice(0,4);
  if(cTones.length<2) return;
  const density = style.arpDensity || 1.0;
  if(rng()>density && density<1) return;
  const idx   = ((shapeIdx%ARP_SHAPES.length)+ARP_SHAPES.length)%ARP_SHAPES.length;
  const shape = ARP_SHAPES[idx];
  const step  = density>=1.5 ? 0.25 : density>=1.0 ? 0.5 : 1.0;
  const count = Math.floor(4/step);
  const [vLo,vHi] = style.velocityRange || [60,80];
  for(let i=0; i<count; i++){
    const ci = shape[i%shape.length] % cTones.length;
    notes.push({
      pitch:     cTones[ci],
      startBeat: bOff+i*step,
      duration:  step*0.75,
      velocity:  ri(Math.max(40,vLo-20), Math.max(60,vHi-20)),
    });
  }
}

// ================================================================
//  generateBlock — NÚCLEO DO ENGINE v4
//
//  Aceita genome e memória do bloco anterior para geração contínua.
//  Cada compasso evolui organicamente: sem loop mecânico, sem cópia.
//
//  cfg         — preset completo (key, scale, style, bars, prog…)
//  genomeIn    — genome do bloco anterior (null → cria novo)
//  memoryIn    — memória de frases anterior (null → vazio)
//  blockOffset — deslocamento em beats (para ∞ loop)
//
//  Retorna: { song, genome, memory }
//  → genome e memory devem ser passados ao próximo bloco
// ================================================================
function generateBlock(cfg, genomeIn=null, memoryIn=null, blockOffset=0){
  const { key, bars } = cfg;
  const sc            = cfg.scale      || 'major';
  const prog          = cfg.prog       || [0,3,4,0];
  const styleName     = cfg.style      || 'pop';
  const drumStyleName = cfg.drumStyle  || 'rock';
  const drumStyle     = DRUM_STYLES[drumStyleName] || DRUM_STYLES.rock;
  const baseStyle     = STYLE_PROFILES[styleName]  || STYLE_PROFILES.pop;
  const style         = cfg.styleOverride
    ? { ...baseStyle, ...cfg.styleOverride }
    : baseStyle;

  const humanizeAmt = cfg.humanize || 0;

  const sMel  = scaleNotesList(key, sc, 60, 84);
  const sBass = scaleNotesList(key, sc, 36, 59);
  const sArp  = scaleNotesList(key, sc, 60, 84);
  const melody=[], bass=[], arp=[], drums=[];

  let genome       = genomeIn ? { ...genomeIn } : buildGenome(style);
  let phraseMemory = memoryIn ? [...memoryIn]   : [];
  const rhythmPool = getRhythmPool(style.rhythmDensity);
  const modPoint   = Math.floor(bars/2);

  for(let bar=0; bar<bars; bar++){
    // 1 ── Mutação antes de cada compasso
    genome = mutateGenome(genome, phraseMemory);

    // 2 ── Curva de tensão modula density/velocity dinamicamente
    const ten = tensionCurve(bar, bars);
    const tensionStyle = {
      ...style,
      rhythmDensity: style.rhythmDensity * (0.6 + ten*0.4),
      velocityRange: [
        Math.round((style.velocityRange[0]||80)  * (0.70 + ten*0.30)),
        Math.round((style.velocityRange[1]||110) * (0.80 + ten*0.20)),
      ],
    };

    const deg    = prog[bar % prog.length];
    const bOff   = blockOffset + bar*4;
    const pcs    = chordPCs(key, sc, deg, tensionStyle.chordType);
    const cTones = chordTones(sMel, pcs);
    const cTBass = chordTones(sBass, pcs);
    const vary   = (bar>=4 && bar>=prog.length) ? 0.25 : 0;

    const isTurn = (bar===modPoint);
    const isEnd  = (bar===bars-1);
    const isFill = (bar===bars-2) && rng() < tensionStyle.fillChance;

    // 3 ── Gera vozes com genome atual
    const melStart  = melody.length;
    const rhythmIdx = genome.motifRhythmIdx % rhythmPool.length;

    genMelody(melody, sMel, pcs, cTones, bOff, bar,
              rhythmIdx, genome.motifContour, vary,
              tensionStyle, rhythmPool, isTurn, isEnd);
    genBassIdx(bass, sBass, pcs, cTBass, bOff, tensionStyle, genome.bassPatIdx);
    genArpIdx(arp, sArp, pcs, bOff, tensionStyle, genome.arpShapeIdx);
    genDrums(drums, bOff, drumStyle, tensionStyle, isFill, bar);

    // 4 ── Humanização real nas notas geradas neste compasso
    if(humanizeAmt > 0){
      for(let i=melStart; i<melody.length; i++)
        melody[i] = humanizeNoteGen(melody[i], humanizeAmt, false);
    }

    // 5 ── Snapshot para memória anti-repetição (buffer circular 8)
    phraseMemory.push(buildPhraseSnapshot(
      melody.slice(melStart).map(n =>({
        pitch:n.pitch, startBeat:n.startBeat-bOff, duration:n.duration
      }))
    ));
    if(phraseMemory.length>8) phraseMemory.shift();
  }

  return { song:{ melody, bass, arp, drums, _cfg:cfg }, genome, memory:phraseMemory };
}

// ================================================================
//  generate — wrapper retrocompatível de generateBlock
//  Todo código existente que chama generate(cfg) continua igual.
//  Diferença: a song agora carrega _genome, _memory e .counter
// ================================================================
function generate(cfg){
  const result = generateBlock(cfg, null, null, 0);
  const song   = result.song;
  song._genome  = result.genome;
  song._memory  = result.memory;
  song.counter  = genCounterpoint(song.melody, cfg);
  return song;
}

// ────────────────────────────────────────────────────────────────
//  GERADOR DE MELODIA
// ────────────────────────────────────────────────────────────────
function genMelody(notes, scNotes, pcs, cTones, bOff, barIdx,
                   rhythmIdx, dir, vary, style, rhythmPool, isTurn, isEnd){

  const ridx2 = (barIdx%2===0) ? rhythmIdx : (rhythmIdx + 2) % rhythmPool.length;
  const pat   = rhythmPool[ridx2];
  const swing = style.swing || 0;
  const [velLo, velHi] = style.velocityRange || [80, 110];

  let startPitch;
  const pool = cTones.length ? cTones : scNotes;
  if     (dir === 'up')   startPitch = pool[0];
  else if(dir === 'down') startPitch = pool[pool.length-1];
  else                    startPitch = pool[Math.floor(pool.length/2)];

  while(startPitch < 62) startPitch += 12;
  while(startPitch > 80) startPitch -= 12;

  const octave = style.octaveSpread > 0 && rng() < 0.15 * style.octaveSpread
    ? (rng() < .5 ? 12 : -12) : 0;

  let prevPitch = startPitch + octave;
  let beat = bOff;

  for(let i=0; i<pat.length && beat-bOff < 4; i++){
    const dur = pat[i];
    if(vary > 0 && rng() < vary && i > 0){ beat += dur; continue; }

    const isOffBeat = Math.abs((beat - bOff) % 1 - 0.5) < 0.05;
    const t0 = beat + (isOffBeat ? swing : 0);

    let pitch;
    if(i === 0){
      pitch = nearestIn(pool, prevPitch);
    } else {
      const dirBias = dir==='up' ? 1 : dir==='down' ? -1 : (i < pat.length/2 ? 1 : -1);
      const jump = rng() < style.leapChance
        ? ri(-3, 3)
        : (rng() < .7 ? dirBias : 2*dirBias);

      const candidate = stepFrom(scNotes, prevPitch, jump);
      const isStrong  = Number.isInteger(beat-bOff) && (beat-bOff)%2 === 0;
      pitch = (isStrong && rng() < .6 && cTones.length)
        ? nearestIn(cTones, candidate)
        : candidate;
    }

    while(pitch < 60) pitch += 12;
    while(pitch > 84) pitch -= 12;

    if(isTurn && i === 0 && scNotes.length > 0){
      pitch = stepFrom(scNotes, pitch, 1);
    }
    if(isEnd && i === pat.length-1 && cTones.length){
      pitch = cTones[0];
      while(pitch < 60) pitch += 12;
    }

    const vel = (i===0 || Number.isInteger(beat-bOff))
      ? ri(Math.min(velLo+15, velHi), velHi)
      : ri(velLo, velLo+20);

    notes.push({pitch, startBeat:t0, duration:dur*.88, velocity:vel});
    prevPitch = pitch;
    beat += dur;
  }
}

// ────────────────────────────────────────────────────────────────
//  GERADOR DE BAIXO
// ────────────────────────────────────────────────────────────────
function genBass(notes, scNotes, pcs, cTones, bOff, style){
  if(!cTones.length) return;

  const r = cTones[0];
  const f = cTones[1] || (r+7 <= 59 ? r+7 : r-5);

  // Mapeia label do estilo para paleta de padrões de baixo
  let patIdx;
  const s = style.label || '';
  if(['BOSSA NOVA','COOL JAZZ'].includes(s)){
    patIdx = pick([8, 11, 2]);              // bossa/jazz: sincopado + walking
  } else if(['JAZZ FUSION','JAZZ SWING'].includes(s)){
    patIdx = pick([11, 2, 0]);              // walking jazz
  } else if(['SAMBA','AFROBEAT','FUNK'].includes(s)){
    patIdx = pick([10, 7, 12]);             // afro/funk: denso e sincopado
  } else if(['R&B','SOUL','GOSPEL','NEO SOUL'].includes(s)){
    patIdx = pick([5, 7, 6]);               // groove: sincopado e colcheias
  } else if(s === 'REGGAE'){
    patIdx = pick([9, 4, 1]);               // one-drop reggae
  } else if(['TANGO','FLAMENCO'].includes(s)){
    patIdx = pick([5, 0, 12]);              // marcato + sincopado
  } else if(['SALSA','CUMBIA'].includes(s)){
    patIdx = pick([12, 5, 10]);             // clave latino
  } else if(['BLUES','BLUES ROCK'].includes(s)){
    patIdx = pick([0, 2, 5]);               // walking blues
  } else if(['BOOM BAP','TRAP'].includes(s)){
    patIdx = pick([1, 4, 5]);               // hip hop: esparso / pedal
  } else if(['AMBIENT','CLASSICAL','ROMANTIC','JAPANESE'].includes(s)){
    patIdx = pick([4, 1, 13]);              // pedal / notas longas
  } else if(['TECHNO','EDM','SYNTHWAVE','DISCO'].includes(s)){
    patIdx = pick([3, 6, 5]);               // ostinato / colcheias
  } else if(style.rhythmDensity < 0.35){
    patIdx = pick([0,1,4]);
  } else if(style.rhythmDensity < 0.65){
    patIdx = pick([0,1,2,5]);
  } else {
    patIdx = pick([2,3,5,6,7]);
  }

  const evs = BASS_PATS[patIdx](r, f, scNotes);
  for(const ev of evs){
    let p = ev.p;
    while(p < 36) p += 12;
    while(p > 59) p -= 12;
    const [vLo, vHi] = style.velocityRange || [80,105];
    notes.push({pitch:p, startBeat:bOff+ev.b, duration:ev.d, velocity:ri(vLo, vHi)});
  }
}

// ────────────────────────────────────────────────────────────────
//  GERADOR DE ARPEJO
// ────────────────────────────────────────────────────────────────
function genArp(notes, scNotes, pcs, bOff, style){
  const cTones = chordTones(scNotes, pcs).slice(0, 4);
  if(cTones.length < 2) return;

  const density = style.arpDensity || 1.0;
  if(rng() > density && density < 1) return;

  const shape = ARP_SHAPES[ri(0, ARP_SHAPES.length-1)];
  const step  = density >= 1.5 ? 0.25 : density >= 1.0 ? 0.5 : 1.0;
  const count = Math.floor(4 / step);
  const [vLo, vHi] = style.velocityRange || [60,80];

  for(let i=0; i<count; i++){
    const idx = shape[i % shape.length] % cTones.length;
    notes.push({
      pitch:      cTones[idx],
      startBeat:  bOff + i * step,
      duration:   step * 0.75,
      velocity:   ri(Math.max(40, vLo-20), Math.max(60, vHi-20)),
    });
  }
}

// ────────────────────────────────────────────────────────────────
//  GERADOR DE BATERIA
// ────────────────────────────────────────────────────────────────
const KICK=36, SNARE=38, HHC=42, HHO=46;

function genDrums(drums, bOff, drumStyle, style, isFill, barIdx){
  const [vLo, vHi] = style.velocityRange || [80, 110];

  for(const p of drumStyle.kicks){
    drums.push({
      pitch:KICK, startBeat:bOff+p/4, duration:.1,
      velocity:ri(Math.min(vHi,105), Math.min(vHi+5,115)), isDrum:true
    });
  }
  for(const p of drumStyle.snares){
    drums.push({
      pitch:SNARE, startBeat:bOff+p/4, duration:.1,
      velocity:ri(Math.min(vHi-10,95), Math.min(vHi,108)), isDrum:true
    });
  }
  for(let i=0; i<drumStyle.hhs.length; i++){
    const p    = drumStyle.hhs[i];
    const open = drumStyle.openAt && drumStyle.openAt.includes(p);
    drums.push({
      pitch:     open ? HHO : HHC,
      startBeat: bOff + p/4,
      duration:  .1,
      velocity:  ri(Math.max(50,vLo-25), Math.max(75,vHi-30)),
      isDrum:    true
    });
  }

  if(barIdx === 0){
    drums.push({pitch:49, startBeat:bOff, duration:.1, velocity:ri(85,95), isDrum:true});
  }

  if(isFill){
    const fillBeats  = [2.5, 2.75, 3.0, 3.25, 3.5, 3.75];
    const fillPitches= [45, 43, 41, 38, 38, 49];
    fillBeats.forEach((fb, i) => {
      drums.push({
        pitch:    fillPitches[i],
        startBeat:bOff + fb,
        duration: .1,
        velocity: ri(90, 115),
        isDrum:   true
      });
    });
  }

  // Ghost notes em estilos com swing
  if(style.swing > 0.05 && rng() < 0.4){
    const ghostPos = pick([1, 1.5, 2.5, 3]);
    drums.push({
      pitch:SNARE, startBeat:bOff+ghostPos, duration:.1,
      velocity:ri(35,50), isDrum:true
    });
  }
}

// ────────────────────────────────────────────────────────────────
//  PRESET ALEATÓRIO GERAL
// ────────────────────────────────────────────────────────────────
function randomPreset(){
  const scaleKeys     = Object.keys(SCALES);
  const styleKeys     = Object.keys(STYLE_PROFILES);
  const drumStyleKeys = Object.keys(DRUM_STYLES);

  return {
    label:     '🎲 RANDOM',
    key:       ri(48, 71),
    scale:     pick(scaleKeys),
    bpm:       ri(60, 240),
    bars:      pick([4, 8, 8, 8, 16]),
    prog:      Array.from({length:4}, () => ri(0, 5)),
    style:     pick(styleKeys),
    drumStyle: pick(drumStyleKeys),
  };
}

// ────────────────────────────────────────────────────────────────
//  PRESET ALEATÓRIO POR GÊNERO (v3 — novo)
//  Retorna um preset aleatório do gênero solicitado
// ────────────────────────────────────────────────────────────────
function randomByGenre(genreKey){
  const options = Object.values(PRESETS).filter(p => p.genre === genreKey);
  if(!options.length) return randomPreset();
  return pick(options);
}

// ────────────────────────────────────────────────────────────────
//  LISTAR PRESETS POR GÊNERO (v3 — novo)
//  Retorna objeto {genreKey: [preset, ...]}
// ────────────────────────────────────────────────────────────────
function presetsByGenre(){
  const result = {};
  for(const [key, preset] of Object.entries(PRESETS)){
    const g = preset.genre || 'world';
    if(!result[g]) result[g] = [];
    result[g].push({key, ...preset});
  }
  return result;
}

// ────────────────────────────────────────────────────────────────
// EXPORTS DO MUSIC.JS
// Adicione isto no final do seu arquivo music.js
// ────────────────────────────────────────────────────────────────
export {
  SCALES,
  NOTE_NAMES,
  DRUM_STYLES,
  STYLE_PROFILES,
  GENRES,
  PRESETS,
  randomByGenre,
  presetsByGenre,
  randomPreset,
  generate,
  generateBlock,
  buildGenome,
  mutateGenome,
  tensionCurve,
  genCounterpoint,
  KICK,
  SNARE,
  HHC,
  HHO
};