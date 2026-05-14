// js/midi-player.js

export class MidiPlayer {
  constructor() {
    this.ctx        = null;
    this.nodes      = [];
    this.startTime  = 0;
    this.pauseAt    = 0;
    this.playing    = false;
    this.paused     = false;
    this.totalSec   = 0;
    this.notas      = [];
    this.bpm        = 90;
    this.tpb        = 480;
    this.volume     = 0.5;
    this.onProgress = null; // callback(progress 0-1, elapsedSec)
    this.onEnd      = null;
    this._raf       = null;
    this._gainMaster = null;
  }

  load(notas, bpm = 90, tpb = 480) {
    this.stop();
    this.notas   = notas;
    this.bpm     = bpm;
    this.tpb     = tpb;
    this.pauseAt = 0;
    if (notas.length) {
      const lastTick = Math.max(...notas.map(n => n.inicio + n.duracao));
      this.totalSec  = this._ticksToSec(lastTick);
    }
  }

  _ticksToSec(ticks) {
    return ticks / (this.tpb * this.bpm / 60);
  }

  _midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  _ensureCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._gainMaster = this.ctx.createGain();
      this._gainMaster.gain.value = this.volume;
      this._gainMaster.connect(this.ctx.destination);
    }
    // Resume if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setVolume(v) {
    this.volume = v;
    if (this._gainMaster) this._gainMaster.gain.value = v;
  }

  play(fromSec = 0) {
    if (!this.notas.length) return;
    this._ensureCtx();
    this._clearNodes();

    this.playing  = true;
    this.paused   = false;
    this.startTime = this.ctx.currentTime - fromSec;

    for (const n of this.notas) {
      const noteStart = this._ticksToSec(n.inicio);
      const noteDur   = this._ticksToSec(n.duracao);

      if (noteStart + noteDur < fromSec - 0.05) continue; // already past

      const actualStart = Math.max(noteStart, fromSec);
      const actualDur   = noteDur - (actualStart - noteStart);
      if (actualDur <= 0) continue;

      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.value = this._midiToFreq(n.nota);

      const vel = (n.velocidade / 127) * 0.18;
      const t0  = this.startTime + actualStart;
      const t1  = t0 + actualDur * 0.75;
      const t2  = t0 + actualDur;

      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(vel, t0 + 0.005);
      gain.gain.setValueAtTime(vel * 0.7, t1);
      gain.gain.linearRampToValueAtTime(0, t2);

      osc.connect(gain);
      gain.connect(this._gainMaster);

      osc.start(t0);
      osc.stop(t2 + 0.02);

      this.nodes.push({ osc, gain });
    }

    this._tick();
  }

  pause() {
    if (!this.playing || this.paused) return;
    this.pauseAt = this.ctx.currentTime - this.startTime;
    this.paused  = true;
    this.playing = false;
    this._clearNodes();
    cancelAnimationFrame(this._raf);
  }

  resume() {
    if (!this.paused) return;
    this.play(this.pauseAt);
  }

  stop() {
    this.playing  = false;
    this.paused   = false;
    this.pauseAt  = 0;
    this._clearNodes();
    cancelAnimationFrame(this._raf);
    if (this.onProgress) this.onProgress(0, 0);
  }

  seek(ratio) {
    const wasPlaying = this.playing;
    const target = ratio * this.totalSec;
    this.pauseAt = target;
    this._clearNodes();
    cancelAnimationFrame(this._raf);
    if (wasPlaying) {
      this.play(target);
    } else {
      this.paused = true;
      this.playing = false;
      if (this.onProgress) this.onProgress(ratio, target);
    }
  }

  _clearNodes() {
    for (const { osc } of this.nodes) {
      try { osc.stop(0); } catch (_) {}
    }
    this.nodes = [];
  }

  _tick() {
    if (!this.playing) return;
    const elapsed  = this.ctx.currentTime - this.startTime;
    const progress = Math.min(1, elapsed / this.totalSec);
    if (this.onProgress) this.onProgress(progress, elapsed);
    if (elapsed >= this.totalSec + 0.1) {
      this.stop();
      if (this.onEnd) this.onEnd();
      return;
    }
    this._raf = requestAnimationFrame(() => this._tick());
  }
}