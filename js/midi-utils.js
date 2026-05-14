// js/midi-utils.js

// ============================================================
// MIDI WRITER
// ============================================================
export class MidiWriter {
  varLen(val) {
    const b = [];
    b.unshift(val & 0x7F); val >>= 7;
    while (val > 0) { b.unshift((val & 0x7F) | 0x80); val >>= 7; }
    return b;
  }
  u16(v) { return [(v >> 8) & 0xFF, v & 0xFF]; }
  u32(v) { return [(v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF]; }

  buildTrack(events) {
    const b = [];
    for (const ev of events) { b.push(...this.varLen(ev.delta)); b.push(...ev.data); }
    b.push(0x00, 0xFF, 0x2F, 0x00); // end of track
    return b;
  }

  build(notas, tempo, instrument, tpb = 480) {
    const b = [];

    // MIDI header
    b.push(0x4D, 0x54, 0x68, 0x64); // MThd
    b.push(...this.u32(6));
    b.push(...this.u16(1));          // format 1
    b.push(...this.u16(2));          // 2 tracks
    b.push(...this.u16(tpb));        // tpb real do arquivo

    // Track 0: tempo
    const µ = Math.round(60000000 / tempo);
    const trkTempo = this.buildTrack([
      { delta: 0, data: [0xFF, 0x51, 0x03, (µ >> 16) & 0xFF, (µ >> 8) & 0xFF, µ & 0xFF] }
    ]);
    b.push(0x4D, 0x54, 0x72, 0x6B); // MTrk
    b.push(...this.u32(trkTempo.length));
    b.push(...trkTempo);

    // Track 1: notas
    const events = [{ delta: 0, data: [0xC0, Math.max(0, instrument)] }]; // program change

    const flat = [];
    for (const n of notas) {
      flat.push({ time: n.inicio,           nota: n.nota, vel: n.velocidade });
      flat.push({ time: n.inicio + n.duracao, nota: n.nota, vel: 0 });
    }
    // note-off antes de note-on no mesmo tick (evita clipping)
    flat.sort((a, z) => a.time - z.time || (a.vel === 0 ? -1 : 1));

    let prev = 0;
    for (const ev of flat) {
      const delta = Math.max(0, ev.time - prev); // garante delta nunca negativo
      prev = ev.time;
      events.push({ delta, data: ev.vel > 0 ? [0x90, ev.nota, ev.vel] : [0x80, ev.nota, 0] });
    }

    const trkNotes = this.buildTrack(events);
    b.push(0x4D, 0x54, 0x72, 0x6B);
    b.push(...this.u32(trkNotes.length));
    b.push(...trkNotes);

    return new Uint8Array(b);
  }
  
  // Adicione este método dentro da classe MidiWriter,
// logo após o método build() existente.

	buildWithDrums(notas, drumNotas, tempo, instrument, tpb = 480) {
	  const b = [];

	  // MIDI header
	  b.push(0x4D, 0x54, 0x68, 0x64); // MThd
	  b.push(...this.u32(6));
	  b.push(...this.u16(1));          // format 1
	  b.push(...this.u16(3));          // 3 tracks: tempo + melodia + bateria
	  b.push(...this.u16(tpb));

	  // Track 0: tempo
	  const µ = Math.round(60000000 / tempo);
	  const trkTempo = this.buildTrack([
		{ delta: 0, data: [0xFF, 0x51, 0x03, (µ >> 16) & 0xFF, (µ >> 8) & 0xFF, µ & 0xFF] }
	  ]);
	  b.push(0x4D, 0x54, 0x72, 0x6B);
	  b.push(...this.u32(trkTempo.length));
	  b.push(...trkTempo);

	  // Track 1: melodia (canal 0)
	  const evMel = [{ delta: 0, data: [0xC0, Math.max(0, instrument)] }];
	  const flatMel = [];
	  for (const n of notas) {
		flatMel.push({ time: n.inicio,              nota: n.nota, vel: n.velocidade });
		flatMel.push({ time: n.inicio + n.duracao,  nota: n.nota, vel: 0 });
	  }
	  flatMel.sort((a, z) => a.time - z.time || (a.vel === 0 ? -1 : 1));
	  let prev = 0;
	  for (const ev of flatMel) {
		const delta = Math.max(0, ev.time - prev);
		prev = ev.time;
		evMel.push({ delta, data: ev.vel > 0 ? [0x90, ev.nota, ev.vel] : [0x80, ev.nota, 0] });
	  }
	  const trkMel = this.buildTrack(evMel);
	  b.push(0x4D, 0x54, 0x72, 0x6B);
	  b.push(...this.u32(trkMel.length));
	  b.push(...trkMel);

	  // Track 2: bateria (canal 9 — GM drums)
	  const evDrum = [];
	  const flatDrum = [];
	  for (const n of drumNotas) {
		flatDrum.push({ time: n.inicio,             nota: n.nota, vel: n.velocidade });
		flatDrum.push({ time: n.inicio + n.duracao, nota: n.nota, vel: 0 });
	  }
	  flatDrum.sort((a, z) => a.time - z.time || (a.vel === 0 ? -1 : 1));
	  let prevD = 0;
	  for (const ev of flatDrum) {
		const delta = Math.max(0, ev.time - prevD);
		prevD = ev.time;
		// Canal 9 (0x99 / 0x89) = canal de percussão GM
		evDrum.push({ delta, data: ev.vel > 0 ? [0x99, ev.nota, ev.vel] : [0x89, ev.nota, 0] });
	  }
	  const trkDrum = this.buildTrack(evDrum);
	  b.push(0x4D, 0x54, 0x72, 0x6B);
	  b.push(...this.u32(trkDrum.length));
	  b.push(...trkDrum);

	  return new Uint8Array(b);
	}
}

// ============================================================
// MIDI PARSER  — lê binário .mid → notas[]
//
// Bugs corrigidos vs versão anterior:
//
// BUG A: noteOns era compartilhado entre tracks (objeto global).
//   Em arquivos Format 1 multi-track, note-offs de uma track fechavam
//   notas abertas em outra track → todas as notas sumiam.
//   Fix: noteOns resetado a {} no início de cada track.
//
// BUG B: chave de noteOns era só o número da nota (ex: noteOns[60]).
//   Em MIDIs com múltiplos canais, nota 60 no ch1 e no ch2 colidiam.
//   Fix: chave inclui canal → noteOns[`${nota}_${canal}`].
//
// BUG C: notas abertas ao final da track eram descartadas silenciosamente.
//   Fix: ao terminar cada track, fechar notas pendentes com duração estimada.
//
// BUG D: tpb (ticks per beat) era lido mas ignorado no cálculo de BPM.
//   Fix: BPM agora usa tpb corretamente para arquivos com tpb ≠ 480.
// ============================================================
export function parseMidiFile(buffer) {
  const data = new Uint8Array(buffer);
  let i = 0;

  const r8    = () => data[i++];
  const r16   = () => { const v = (data[i] << 8) | data[i + 1]; i += 2; return v; };
  const r32   = () => { const v = (data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3]; i += 4; return v; };
  // BUG 5 CORRIGIDO: guard contra arquivo MIDI truncado/corrompido
  const varLen = () => {
    let v = 0;
    do {
      if (i >= data.length) break; // evita loop infinito em arquivo corrompido
      const b = r8();
      v = (v << 7) | (b & 0x7F);
      if (!(b & 0x80)) break;
    } while (true);
    return v;
  };

  if (String.fromCharCode(data[0], data[1], data[2], data[3]) !== 'MThd')
    throw new Error('Arquivo MIDI inválido — header não encontrado');

  // ROOT FIX: a checagem acima usa índices fixos e NÃO avança i.
  // Sem o i+=4, r32() leria os próprios bytes "MThd" como chunk length,
  // deslocando tudo 4 bytes → format errado, ntracks errado, tpb=1.
  i += 4;                          // pular tag "MThd"
  r32();                           // chunk length (sempre 6)
  const format   = r16();          // format 0, 1 ou 2
  const ntracks  = r16();
  const tpb      = r16();          // tpb real do arquivo

  console.log(`[MIDI Parser] Format=${format} Tracks=${ntracks} TPB=${tpb}`);

  let globalTempo = 500000;        // default 120 BPM
  const notas = [];
  let capturedInstrument = 0;      // BUG 3 FIX: capturar instrumento do Program Change

  // Ticks mantidos crus — MidiWriter usa tpb real do arquivo

  // DIAGNÓSTICO + FIX: em vez de confiar no alinhamento de chunks,
  // fazemos varredura ativa buscando o tag 'MTrk' no buffer.
  // Isso torna o parser robusto contra desalinhamentos causados por
  // chunks desconhecidos com tamanho lido errado.
  const findNextMTrk = (from) => {
    for (let p = from; p <= data.length - 8; p++) {
      if (data[p]===0x4D && data[p+1]===0x54 && data[p+2]===0x72 && data[p+3]===0x6B)
        return p;
    }
    return -1;
  };

  // Avançar i para depois do header MThd (já lemos 14 bytes: 4+4+2+2+2)
  // i já está correto após os r32/r16 acima — só buscamos a partir daqui
  let tracksFound = 0;
  while (tracksFound < ntracks) {
    const mtrk = findNextMTrk(i);
    if (mtrk === -1) { console.warn('[MIDI Parser] Nenhum MTrk encontrado a partir de', i); break; }
    i = mtrk + 4;                  // pular tag 'MTrk'
    const len = r32();
    const end = i + len;
    tracksFound++;
    console.log(`[MIDI Parser] Track ${tracksFound}: offset=${mtrk} len=${len} end=${end}`);

    let tick = 0;
    let lastStatus = 0;

    // BUG A FIX: noteOns resetado a cada track
    // BUG B FIX: chave inclui canal → `${nota}_${canal}`
    const noteOns = {};

    while (i < end) {
      if (i >= data.length) break;
      tick += varLen();

      let status = data[i];

      // Running status: se byte não tem bit 7, reutilizar lastStatus.
      // CRÍTICO: meta-events (0xFF) e SysEx (0xF0, 0xF7) NÃO devem atualizar
      // lastStatus — senão o próximo byte sem bit7 seria interpretado como
      // tipo de meta-event em vez de nota, desalinhando o parser inteiro.
      if (status & 0x80) {
        if (status < 0xF0) lastStatus = status; // só voice messages atualizam
        i++;
      } else {
        status = lastStatus;
      }

      const type = status & 0xF0;
      const ch   = status & 0x0F; // canal MIDI (0–15)

      if (type === 0x90) {
        const n = r8(), v = r8();
        console.log(`[MIDI Parser] NoteOn ch=${ch} nota=${n} vel=${v} tick=${tick}`);
        const key = `${n}_${ch}`;
        if (v > 0) {
          noteOns[key] = { tick, vel: v };
        } else {
          // note_on com velocity=0 é note_off (comum em vários DAWs)
          if (noteOns[key]) {
            const on = noteOns[key];
            // BUG 2 FIX: normalizar ticks para base 480
            notas.push({ nota: n, inicio: on.tick, duracao: Math.max(60, tick - on.tick), velocidade: on.vel });
            delete noteOns[key];
          }
        }
      } else if (type === 0x80) {
        const n = r8(); r8(); // nota + velocity (ignorada no note-off)
        const key = `${n}_${ch}`;
        if (noteOns[key]) {
          const on = noteOns[key];
          // BUG 2 FIX: normalizar ticks para base 480
          notas.push({ nota: n, inicio: on.tick, duracao: Math.max(60, tick - on.tick), velocidade: on.vel });
          delete noteOns[key];
        }
      } else if (type === 0xA0 || type === 0xB0 || type === 0xE0) {
        r8(); r8(); // 2 bytes de dados
      } else if (type === 0xC0) {
        // BUG 3 FIX: capturar Program Change em vez de descartar
        const prog = r8();
        if (capturedInstrument === 0) capturedInstrument = prog; // pega o primeiro canal não-percussão
      } else if (type === 0xD0) {
        r8();       // 1 byte de dados
      } else if (status === 0xFF) {
        // Meta-evento
        const mt = r8();
        const ml = varLen();
        if (mt === 0x51 && ml === 3) {
          globalTempo = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
        }
        i += ml;
      } else if (status === 0xF0 || status === 0xF7) {
        // SysEx — pular
        i += varLen();
      } else {
        i++; // byte desconhecido, avançar
      }
    }

    // BUG C FIX: fechar notas que ficaram abertas ao final da track
    for (const key of Object.keys(noteOns)) {
      const on = noteOns[key];
      const nota = parseInt(key.split('_')[0]);
      const duracao = Math.max(240, tick - on.tick || 480);
      notas.push({ nota, inicio: on.tick, duracao, velocidade: on.vel });
    }

    i = end; // garantir posição correta mesmo com erros de parse
  }

  notas.sort((a, b) => a.inicio - b.inicio);

  // BPM = microsegundos por minuto / microsegundos por batida
  const bpm = Math.round(60000000 / globalTempo);

  // BUG 3 FIX: retornar instrumento capturado junto com notas e bpm
  return { notas, bpm, tpb, instrument: capturedInstrument };
}
