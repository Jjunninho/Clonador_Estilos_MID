// js/ui-controller.js
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export function setStatus(id, msg, type = '') {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'status-bar ' + type;
}

export function drawPianoRoll(canvasId, notas) {
  const canvas = document.getElementById(canvasId);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = 100 * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = canvas.offsetWidth, H = 100;
  
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  if (!notas.length) return;

  const maxTime = Math.max(...notas.map(n => n.inicio + n.duracao));
  const minNote = Math.max(0, Math.min(...notas.map(n => n.nota)) - 3);
  const maxNote = Math.min(127, Math.max(...notas.map(n => n.nota)) + 3);
  const range = maxNote - minNote + 1;

  notas.forEach(n => {
    const x = (n.inicio / maxTime) * W;
    const w = Math.max(2, (n.duracao / maxTime) * W - 1);
    const y = H - ((n.nota - minNote + 1) / range) * H;
    const h = Math.max(2, H / range - 1);
    const hue = (n.nota * 7) % 360;
    ctx.fillStyle = `hsla(${hue},80%,${40 + (n.velocidade / 127) * 40}%, 0.9)`;
    ctx.fillRect(x, y, w, h);
  });
}

export function drawNoteList(vizId, notas) {
  const lines = notas.slice(0, 40).map(n => {
    const name = NOTE_NAMES[n.nota % 12] + Math.floor(n.nota / 12 - 1);
    return `<div class="midi-line">
      <span>t=${(n.inicio / 480).toFixed(1)}b</span>
      <span class="midi-note">${name}</span>
      <span>vel=${n.velocidade}</span>
    </div>`;
  });
  document.getElementById(vizId).innerHTML = lines.join('') + (notas.length > 40 ? '...' : '');
}