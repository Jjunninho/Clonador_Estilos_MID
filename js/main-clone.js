// js/main-clone.js
// Filosofia: IA analisa o MIDI de referência e escolhe PARÂMETROS do theory.js.
// O engine procedural gera as notas — a IA nunca inventa números musicais.

import { MidiWriter, parseMidiFile } from './midi-utils.js';
import { callGroq }                  from './api-client.js';
import { setStatus, drawPianoRoll, drawNoteList } from './ui-controller.js';
import { MidiPlayer }                from './midi-player.js';
import { generate }                  from './theory.js';

// ============================================================
// ESTADO GLOBAL
// ============================================================
let cloneSourceNotas      = null;
let cloneSourceBpm        = 90;
let cloneSourceInstrument = 0;
let cloneSourceTpb        = 480;
let cloneStyleTags        = [];

const players = {};
function getPlayer(id) {
  if (!players[id]) players[id] = new MidiPlayer();
  return players[id];
}
function bindPlayer(id) {
  const p = getPlayer(id);
  p.onProgress = (progress, elapsed) => {
    const fill = document.getElementById('fill-' + id);
    const time = document.getElementById('time-' + id);
    if (fill) fill.style.width = (progress * 100).toFixed(1) + '%';
    if (time) {
      const sec = Math.floor(elapsed);
      time.textContent = `${Math.floor(sec/60)}:${(sec%60).toString().padStart(2,'0')}`;
    }
  };
  p.onEnd = () => {
    const btn = document.getElementById('btn-play-' + id);
    if (btn) { btn.textContent = '▶'; btn.classList.remove('playing'); }
  };
}

window.playerToggle = (id) => {
  const p   = getPlayer(id);
  const btn = document.getElementById('btn-play-' + id);
  if (p.playing) {
    p.pause(); btn.textContent = '▶'; btn.classList.remove('playing');
  } else {
    p.paused ? p.resume() : p.play();
    btn.textContent = '⏸'; btn.classList.add('playing');
  }
};
window.playerStop  = (id) => {
  getPlayer(id).stop();
  const btn = document.getElementById('btn-play-' + id);
  if (btn) { btn.textContent = '▶'; btn.classList.remove('playing'); }
};
window.playerSeek  = (id, event) => {
  const wrap = document.getElementById('seek-' + id);
  getPlayer(id).seek(Math.max(0, Math.min(1, event.offsetX / wrap.offsetWidth)));
};
window.playerVol   = (id, val) => getPlayer(id).setVolume(parseFloat(val));

// ============================================================
// SLIDERS
// ============================================================
document.getElementById('clone-duration').addEventListener('input', e =>
  document.getElementById('clone-duration-val').textContent = e.target.value);
document.getElementById('clone-temp').addEventListener('input', e =>
  document.getElementById('clone-temp-val').textContent = (parseInt(e.target.value)/10).toFixed(1));

// ============================================================
// HELPERS
// ============================================================
function parseNotasFromString(raw) {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('JSON nao encontrado');
  const parsed = JSON.parse(m[0]);
  const notas  = parsed.notas || parsed.notes || parsed.data || [];
  if (!notas.length) throw new Error('Nenhuma nota encontrada');
  return notas;
}

function normalizeNota(n) {
  const rawVel = n.velocidade ?? n.velocity ?? n.volume ?? 80;
  return {
    nota:       Math.max(0,  Math.min(127, n.nota ?? n.note ?? n.pitch ?? 60)),
    inicio:     Math.round(n.inicio ?? n.start ?? n.time ?? n.offset ?? 0),
    duracao:    Math.max(60, Math.round(n.duracao ?? n.duration ?? n.length ?? 480)),
    velocidade: Math.max(40, Math.min(127, rawVel < 10 ? rawVel*10 : rawVel))
  };
}

function renderResult(id, melodyNotas, drumNotas, tempo, instrument, tpb = 480) {
  const notas  = melodyNotas.map(normalizeNota);
  const writer = new MidiWriter();
  const bytes  = drumNotas && drumNotas.length > 0
    ? writer.buildWithDrums(notas, drumNotas, tempo, instrument, tpb)
    : writer.build(notas, tempo, instrument, tpb);

  const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/midi' }));
  document.getElementById('dl-' + id).href = url;
  document.getElementById('result-' + id).style.display = 'block';

  const p = getPlayer(id);
  p.load(notas, tempo, tpb);
  bindPlayer(id);
  const btn = document.getElementById('btn-play-' + id);
  if (btn) { btn.textContent = '▶'; btn.classList.remove('playing'); }

  requestAnimationFrame(() => {
    drawPianoRoll('canvas-' + id, notas);
    drawNoteList('viz-' + id, notas);
  });
}

// ============================================================
// ANÁLISE DO MIDI DE REFERÊNCIA
// ============================================================
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

const KS_MAJOR = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
const KS_MINOR = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];

function pearsonCorr(a, b) {
  const n = a.length;
  const ma = a.reduce((s,v)=>s+v,0)/n, mb = b.reduce((s,v)=>s+v,0)/n;
  let num=0, da=0, db=0;
  for (let i=0;i<n;i++) { const ea=a[i]-ma, eb=b[i]-mb; num+=ea*eb; da+=ea*ea; db+=eb*eb; }
  return (da===0||db===0) ? 0 : num/Math.sqrt(da*db);
}

function detectKey(notas) {
  const pcDur = new Array(12).fill(0);
  for (const n of notas) pcDur[n.nota % 12] += n.duracao;
  let best=-Infinity, root=0, mode='minor';
  for (let r=0;r<12;r++) {
    const maj = pearsonCorr(pcDur, KS_MAJOR.map((_,i)=>KS_MAJOR[(i-r+12)%12]));
    const min = pearsonCorr(pcDur, KS_MINOR.map((_,i)=>KS_MINOR[(i-r+12)%12]));
    if (maj>best) { best=maj; root=r; mode='major'; }
    if (min>best) { best=min; root=r; mode='minor'; }
  }
  return { root, mode, score: best };
}

// Mapeia modo detectado → nome de escala válido do theory.js
const MODE_TO_SCALE = {
  'major': 'major', 'minor': 'minor',
  'dorico': 'dorian', 'frigio': 'phrygian',
  'lidio': 'lydian', 'mixolidio': 'mixolydian', 'locrio': 'locrian'
};

function analyzeReference(notas) {
  const norm    = notas.map(normalizeNota);
  const vals    = norm.map(n => n.nota);
  const durs    = norm.map(n => n.duracao);
  const vels    = norm.map(n => n.velocidade);

  const avgNota = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
  const minNota = Math.min(...vals);
  const maxNota = Math.max(...vals);
  const avgDur  = Math.round(durs.reduce((a,b)=>a+b,0)/durs.length);
  const avgVel  = Math.round(vels.reduce((a,b)=>a+b,0)/vels.length);
  const maxTick = Math.max(...norm.map(n=>n.inicio+n.duracao));
  const density = (norm.length/(maxTick/480)).toFixed(2);

  const fastRatio = durs.filter(d=>d<240).length/durs.length;
  const slowRatio = durs.filter(d=>d>=960).length/durs.length;
  const syncRatio = norm.filter(n=>n.inicio%240!==0).length/norm.length;

  const { root, mode, score } = detectKey(norm);
  const centerOctave = Math.max(3, Math.min(6, Math.floor(avgNota/12)-1));
  const confidence   = score > 0.85 ? 'alta' : score > 0.65 ? 'média' : 'baixa';

  // Contorno dinâmico
  const half     = Math.floor(norm.length/2);
  const velFirst = norm.slice(0,half).map(n=>n.velocidade).reduce((a,b)=>a+b,0)/half;
  const velLast  = norm.slice(half).map(n=>n.velocidade).reduce((a,b)=>a+b,0)/(norm.length-half);
  const dynContour = velLast-velFirst > 8 ? 'crescente'
                   : velFirst-velLast > 8 ? 'decrescente' : 'constante';


// ============================================================
// PATCH 1 — analyzeReference()
// Adicionar notesPerBar e refBars à análise estatística
// Substitua o return atual pelo return abaixo
// ============================================================

  // (dentro de analyzeReference, antes do return)
  const refBeats    = maxTick / cloneSourceTpb;          // duração real em beats
  const refBars     = Math.max(4, Math.round(refBeats / 4)); // compassos reais
  const notesPerBar = parseFloat((norm.length / Math.max(1, refBars)).toFixed(2));

  return {
    root, mode, score, confidence,
    centerOctave,
    rootName: NOTE_NAMES[root],
    avgNota, minNota, maxNota,
    avgDur, avgVel, density,
    fastRatio: fastRatio.toFixed(2),
    slowRatio: slowRatio.toFixed(2),
    syncRatio: syncRatio.toFixed(2),
    dynContour,
    totalNotes: norm.length,
    maxTick,
    refBeats,          // ← novo
    refBars,           // ← novo
    notesPerBar,       // ← novo
  };

}

// ============================================================
// VOCABULÁRIOS DO THEORY.JS (para a IA escolher)
// ============================================================
const VALID_SCALES = [
  'major','minor','dorian','phrygian','pentatonic','lydian','mixolydian',
  'harmMinor','blues','wholeTone','locrian','hungarian','melodicMinor',
  'bebopMajor','bebopDom','lydianDom','arabicMaqam','persian','japaneseIn',
  'spanishPhrygian','diminished','augmented','pentatonicMin'
];

const VALID_STYLES = [
  'pop','dreampop','shoegaze','synthwave','rnb','soul','gospel',
  'jazzSwing','bossanova','coolJazz','fusion','bluesStyle','bluesRock',
  'hardRockStyle','metal','doom','punkRock','edm','technoStyle','trap',
  'ambient','chillwave','boomBap','funk','disco','sambaStyle','flamenco',
  'tango','salsa','cumbia','reggae','afrobeat','classicalStyle','romantic',
  'folk','country','arabesque','japanese'
];

const VALID_DRUM_STYLES = [
  'rock','halfTime','dnb','tribal','shuffle','march','sparse','fast',
  'breakbeat','fourOnFloor','bossaNovaDrum','sambaDrum','reggae','trapDrum',
  'funk16','swingJazz','twoStep','ska','ballad','boomBap','discoDrum',
  'afrobeatDrum','tangoGroove','synthwaveDrum'
];

// ============================================================
// PROMPT PARA A IA — pede PARÂMETROS, não notas
// ============================================================
function buildClonePrompt(analysis, bpm, bars, styleTags, extraDesc) {
  const { root, mode, rootName, confidence, centerOctave,
          avgDur, avgVel, density, fastRatio, slowRatio, syncRatio,
          dynContour, minNota, maxNota } = analysis;

  const styleHints = styleTags.length ? `\nVariações solicitadas pelo usuário: ${styleTags.join(', ')}` : '';
  const extraHint  = extraDesc ? `\nInstrução adicional: ${extraDesc}` : '';

  return {
    system: `Você é um diretor musical que analisa um MIDI de referência e escolhe PARÂMETROS para um engine de composição procedural clonar seu estilo.

Seu trabalho é APENAS escolher os parâmetros. O engine vai gerar a música.

═══ ESCALAS DISPONÍVEIS ═══
${VALID_SCALES.join(', ')}

═══ ESTILOS DISPONÍVEIS ═══
${VALID_STYLES.join(', ')}

═══ ESTILOS DE BATERIA DISPONÍVEIS ═══
${VALID_DRUM_STYLES.join(', ')}

═══ REGRAS ═══
1. Responda SOMENTE com JSON puro — ZERO markdown
2. "key" é MIDI 0-11 (0=C, 1=C#, 2=D, … 9=A, 10=A#, 11=B)
3. "prog" é array de graus da escala (0-6), ex: [0,5,3,4] = I-VI-IV-V
4. "humanize" entre 0.0 (mecânico) e 0.12 (expressivo)
5. PRIORIDADE: os campos "scale" e "key" DEVEM refletir a tonalidade detectada — só mude se o usuário pediu explicitamente

Formato EXATO de saída:
{
  "scale": "minor",
  "key": 9,
  "style": "ambient",
  "drumStyle": "sparse",
  "prog": [0,5,3,4],
  "humanize": 0.08,
  "reasoning": "justificativa breve"
}`,

    user: `ANÁLISE DO MIDI DE REFERÊNCIA:

[TONAL - Krumhansl-Schmuckler]
Tonalidade detectada: ${rootName} ${mode} (confiança: ${confidence}, score: ${analysis.score.toFixed(3)})
Tônica MIDI: ${root} → key=${root}
Oitava central: ${centerOctave}

 // Substitua a seção [RÍTMICO] por:
[RÍTMICO]
BPM: ${bpm}
Compassos da referência: ${analysis.refBars}
Notas totais: ${analysis.totalNotes}
Notas por compasso (ALVO): ${analysis.notesPerBar}   ← o clone DEVE manter este valor
Duração média de nota: ${avgDur} ticks
Densidade: ${density} notas/batida
Notas rápidas (<colcheia): ${(fastRatio*100).toFixed(0)}%
Notas lentas (>=semínima dupla): ${(slowRatio*100).toFixed(0)}%
Síncopes: ${(syncRatio*100).toFixed(0)}%

[DINÂMICO]
Velocidade média: ${avgVel}
Contorno: ${dynContour}
Amplitude MIDI: ${minNota} a ${maxNota}
${styleHints}${extraHint}

Escolha os parâmetros que melhor CLONAM este estilo.
A escala detectada é ${rootName} ${mode} — use scale="${mode === 'major' ? 'major' : 'minor'}" e key=${root} a menos que o usuário tenha pedido algo diferente.`
  };
}

// ============================================================
// PAINEL DE ANÁLISE DA REFERÊNCIA
// ============================================================
function showAnalysisPanel(analysis, bpm) {
  const panel = document.getElementById('clone-analysis-panel');
  if (!panel) return;
  const { rootName, mode, confidence, score, avgVel, density, dynContour, totalNotes } = analysis;
 panel.innerHTML = `
    <div class="ai-params-title">🔬 REFERÊNCIA ANALISADA</div>
    <div class="ai-params-grid">
      <div class="ai-param-item"><span class="ai-param-label">TONALIDADE</span><span class="ai-param-value">${rootName} ${mode}</span></div>
      <div class="ai-param-item"><span class="ai-param-label">CONFIANÇA</span><span class="ai-param-value">${confidence} (${score.toFixed(2)})</span></div>
      <div class="ai-param-item"><span class="ai-param-label">BPM</span><span class="ai-param-value">${bpm}</span></div>
      <div class="ai-param-item"><span class="ai-param-label">COMPASSOS</span><span class="ai-param-value">${analysis.refBars}</span></div>
      <div class="ai-param-item"><span class="ai-param-label">NOTAS TOTAIS</span><span class="ai-param-value">${analysis.totalNotes}</span></div>
      <div class="ai-param-item"><span class="ai-param-label">NOTAS/COMP.</span><span class="ai-param-value">${analysis.notesPerBar}</span></div>
      <div class="ai-param-item"><span class="ai-param-label">VEL. MÉDIA</span><span class="ai-param-value">${avgVel}</span></div>
      <div class="ai-param-item"><span class="ai-param-label">DINÂMICA</span><span class="ai-param-value">${dynContour}</span></div>
    </div>
  `;
  panel.style.display = 'block';
}

function showCloneParams(params, bpm, bars) {
  const panel = document.getElementById('clone-params-panel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="ai-params-title">🤖 IA ESCOLHEU PARA O CLONE</div>
    <div class="ai-params-grid">
      <div class="ai-param-item"><span class="ai-param-label">ESCALA</span><span class="ai-param-value">${params.scale}</span></div>
      <div class="ai-param-item"><span class="ai-param-label">TÔNICA</span><span class="ai-param-value">${NOTE_NAMES[params.key]}</span></div>
      <div class="ai-param-item"><span class="ai-param-label">ESTILO</span><span class="ai-param-value">${params.style}</span></div>
      <div class="ai-param-item"><span class="ai-param-label">BATERIA</span><span class="ai-param-value">${params.drumStyle}</span></div>
      <div class="ai-param-item"><span class="ai-param-label">BPM</span><span class="ai-param-value">${bpm}</span></div>
      <div class="ai-param-item"><span class="ai-param-label">COMPASSOS</span><span class="ai-param-value">${bars}</span></div>
      <div class="ai-param-item"><span class="ai-param-label">PROGRESSÃO</span><span class="ai-param-value">[${params.prog.join(',')}]</span></div>
      <div class="ai-param-item"><span class="ai-param-label">HUMANIZE</span><span class="ai-param-value">${params.humanize.toFixed(2)}</span></div>
    </div>
    ${params.reasoning ? `<div class="ai-reasoning">💬 "${params.reasoning}"</div>` : ''}
  `;
  panel.style.display = 'block';
}

// ============================================================
// PARSE E VALIDAÇÃO DOS PARÂMETROS DA IA
// ============================================================
function parseCloneParams(raw, analysis) {
  let parsed;
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('no json');
    parsed = JSON.parse(m[0]);
  } catch {
    console.warn('[clone] IA retornou JSON inválido, usando análise direta');
    return {
      scale:     analysis.mode === 'major' ? 'major' : 'minor',
      key:       analysis.root,
      style:     analysis.density > 2 ? 'pop' : analysis.avgDur > 600 ? 'ambient' : 'classicalStyle',
      drumStyle: analysis.fastRatio > 0.4 ? 'rock' : 'ballad',
      prog:      [0, 5, 3, 4],
      humanize:  0.07,
      reasoning: 'fallback direto da análise'
    };
  }

  const scale     = VALID_SCALES.includes(parsed.scale)         ? parsed.scale     : (analysis.mode === 'major' ? 'major' : 'minor');
  const key       = Number.isInteger(parsed.key) && parsed.key >= 0 && parsed.key <= 11 ? parsed.key : analysis.root;
  const style     = VALID_STYLES.includes(parsed.style)         ? parsed.style     : 'classicalStyle';
  const drumStyle = VALID_DRUM_STYLES.includes(parsed.drumStyle) ? parsed.drumStyle : 'ballad';
  const humanize  = parsed.humanize >= 0 && parsed.humanize <= 0.15 ? parsed.humanize : 0.07;

  let prog = parsed.prog;
  if (!Array.isArray(prog) || prog.length < 2) prog = [0, 5, 3, 4];
  prog = prog.map(g => Math.max(0, Math.min(6, Math.round(g))));

  if (parsed.reasoning) console.log('[Clone IA]', parsed.reasoning);

  return { scale, key, style, drumStyle, prog, humanize, reasoning: parsed.reasoning };
}

// ============================================================
// FUNÇÕES EXPOSTAS AO HTML (window.*)
// ============================================================
window.toggleStyle = (btn, tag) => {
  btn.classList.toggle('active');
  if (cloneStyleTags.includes(tag)) cloneStyleTags = cloneStyleTags.filter(t=>t!==tag);
  else cloneStyleTags.push(tag);
};

window.handleCloneUpload = (input) => {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const { notas, bpm, instrument, tpb } = parseMidiFile(e.target.result);
      cloneSourceNotas      = notas;
      cloneSourceBpm        = bpm;
      cloneSourceInstrument = instrument;
      cloneSourceTpb        = tpb;
      document.getElementById('clone-loaded').textContent =
        `✓ ${notas.length} notas / ${bpm} BPM / instr. ${instrument}`;

      // Mostrar análise imediata ao carregar o arquivo
      const analysis = analyzeReference(notas);
      showAnalysisPanel(analysis, bpm);
    } catch (err) {
      setStatus('status-clone', 'Erro ao ler .mid: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
};

window.cloneStyle = async () => {
  let srcNotas = cloneSourceNotas;
  const jsonRaw = document.getElementById('clone-json').value.trim();

  if (!srcNotas && jsonRaw) {
    try {
      srcNotas = parseNotasFromString(jsonRaw);
      cloneSourceBpm = parseInt(document.getElementById('clone-bpm-manual').value) || 90;
    } catch (e) { setStatus('status-clone', 'JSON inválido: ' + e.message, 'error'); return; }
  }

  if (!srcNotas || !srcNotas.length) {
    setStatus('status-clone', 'Carregue um .mid ou cole um JSON de referência.', 'error');
    return;
  }

  const temperature = parseInt(document.getElementById('clone-temp').value) / 10;
  const instrSel    = parseInt(document.getElementById('clone-instrument').value);
  const extraDesc   = document.getElementById('clone-desc').value.trim();

  const bpm        = cloneSourceBpm;
  const finalInstr = instrSel >= 0 ? instrSel : cloneSourceInstrument;

  document.getElementById('btn-clone').disabled = true;
  setStatus('status-clone', '🔬 Analisando referência...', 'active');

  // ── PASSO 1: Analisar referência ──────────────────────────
  const analysis = analyzeReference(srcNotas);
  showAnalysisPanel(analysis, bpm);

  // DURAÇÃO: compassos reais da referência (ignora slider)
  const bars = analysis.refBars;

  // DENSIDADE RÍTMICA: mapeia notesPerBar → rhythmDensity
  // Âncoras: 2 notas/comp ≈ 0.20 (sparse) | 4 ≈ 0.50 (mid) | 8+ ≈ 0.95 (dense)
  const targetDensity = Math.min(0.95, Math.max(0.15, analysis.notesPerBar / 8));

  // VELOCIDADE: ancora no avgVel da referência
  const velBase = analysis.avgVel;
  const velRange = [
    Math.max(40,  velBase - 18),
    Math.min(127, velBase + 18),
  ];

  setStatus('status-clone', `🧠 IA mapeando estilo: ${analysis.rootName} ${analysis.mode}...`, 'active');

  try {
    // ── PASSO 2: IA escolhe parâmetros do theory.js ──────────
    const { system, user } = buildClonePrompt(analysis, bpm, bars, cloneStyleTags, extraDesc);
    const rawResponse      = await callGroq(system, user, temperature);
    const params           = parseCloneParams(rawResponse, analysis);

    // Aplicar modificadores dos botões de variação
    let keyOverride = params.key;
    if (cloneStyleTags.includes('mesma tonalidade')) keyOverride = analysis.root;

    let octaveShift = 0;
    if (cloneStyleTags.includes('mais agudo')) octaveShift = +12;
    if (cloneStyleTags.includes('mais grave')) octaveShift = -12;

    showCloneParams({ ...params, key: keyOverride }, bpm, bars);
    setStatus('status-clone',
      `🎼 Gerando clone: ${params.style} / ${params.scale} @ ${bpm}bpm · ${analysis.notesPerBar} notas/comp...`,
      'active');

    // ── PASSO 3: theory.js gera as notas ─────────────────────
    const cfg = {
      key:       (keyOverride + 48 + octaveShift),
      scale:     params.scale,
      bpm:       bpm,
      bars:      bars,
      prog:      params.prog,
      style:     params.style,
      drumStyle: params.drumStyle,
      humanize:  cloneStyleTags.includes('mais suave e delicado')
                   ? Math.min(0.12, params.humanize + 0.03)
                 : cloneStyleTags.includes('mais intenso e dramatico')
                   ? Math.max(0, params.humanize - 0.02)
                 : params.humanize,
      styleOverride: {
        rhythmDensity: targetDensity,
        velocityRange: velRange,
      },
    };

    const song = generate(cfg);
    const tpb  = 480;
    const b2t  = (beats) => Math.round(beats * tpb);

    const melodyNotas = [
      ...song.melody.map(n => ({
        nota:       n.pitch,
        inicio:     b2t(n.startBeat),
        duracao:    Math.max(60, b2t(n.duration)),
        velocidade: cloneStyleTags.includes('mais intenso e dramatico')
          ? Math.min(127, n.velocity + 15)
          : cloneStyleTags.includes('mais suave e delicado')
          ? Math.max(40, n.velocity - 15)
          : n.velocity
      })),
      ...song.bass.map(n => ({
        nota:       n.pitch,
        inicio:     b2t(n.startBeat),
        duracao:    Math.max(60, b2t(n.duration)),
        velocidade: Math.round(n.velocity * 0.85)
      })),
    ];
    melodyNotas.sort((a, b) => a.inicio - b.inicio);

    const drumNotas = song.drums.map(n => ({
      nota:       n.pitch,
      inicio:     b2t(n.startBeat),
      duracao:    60,
      velocidade: Math.max(40, Math.min(127, n.velocity))
    }));

    renderResult('clone', melodyNotas, drumNotas, bpm, finalInstr, tpb);

    const drumInfo = drumNotas.length > 0 ? ` + ${drumNotas.length} hits bateria` : '';
    setStatus('status-clone',
      `✓ Clone: ${analysis.rootName} ${analysis.mode} / ${params.style} @ ${bpm}bpm${drumInfo}`, 'done');

  } catch (e) {
    console.error(e);
    setStatus('status-clone', '✗ Erro: ' + e.message, 'error');
  } finally {
    document.getElementById('btn-clone').disabled = false;
  }
};

// ============================================================
// DRAG-AND-DROP
// ============================================================
const cloneDrop = document.getElementById('clone-drop');
cloneDrop.addEventListener('dragover',  e => { e.preventDefault(); cloneDrop.classList.add('drag-over'); });
cloneDrop.addEventListener('dragleave', () => cloneDrop.classList.remove('drag-over'));
cloneDrop.addEventListener('drop', e => {
  e.preventDefault(); cloneDrop.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) window.handleCloneUpload({ files: [file] });
});
