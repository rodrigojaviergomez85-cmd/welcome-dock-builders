/**
 * Sonidos de retroalimentación sintetizados con Web Audio.
 * No usan archivos: funcionan sin internet y sin descargas.
 * Si el navegador bloquea el audio (sin interacción previa), fallan en silencio.
 */

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

type Note = {
  freq: number;
  start: number;
  duration: number;
  volume?: number;
  type?: OscillatorType;
};

function playNotes(notes: Note[]) {
  const ac = audioContext();
  if (!ac) return;
  try {
    const master = ac.createGain();
    master.gain.value = 0.9;
    master.connect(ac.destination);
    const now = ac.currentTime;
    for (const note of notes) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const peak = note.volume ?? 0.22;
      const t0 = now + note.start;
      osc.type = note.type ?? "sine";
      osc.frequency.value = note.freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t0);
      osc.stop(t0 + note.duration + 0.05);
    }
  } catch {
    /* el juego sigue sin sonido */
  }
}

/** Acierto: dos notas alegres ascendentes. */
export function playSuccess() {
  playNotes([
    { freq: 660, start: 0, duration: 0.16 },
    { freq: 880, start: 0.12, duration: 0.22 },
  ]);
}

/** Reintento suave: tono descendente breve, no intimidante. */
export function playTryAgain() {
  playNotes([
    { freq: 392, start: 0, duration: 0.18, volume: 0.16 },
    { freq: 311, start: 0.16, duration: 0.24, volume: 0.16 },
  ]);
}

/** Celebración de misión terminada. */
export function playFanfare() {
  playNotes([
    { freq: 523, start: 0, duration: 0.14 },
    { freq: 659, start: 0.13, duration: 0.14 },
    { freq: 784, start: 0.26, duration: 0.14 },
    { freq: 1047, start: 0.39, duration: 0.34, volume: 0.26 },
    { freq: 1319, start: 0.42, duration: 0.3, volume: 0.14, type: "triangle" },
  ]);
}

/** Pip come: dos crujidos cortos y suaves. */
export function playMunch() {
  playNotes([
    { freq: 170, start: 0, duration: 0.08, volume: 0.16, type: "square" },
    { freq: 125, start: 0.1, duration: 0.1, volume: 0.13, type: "triangle" },
  ]);
}

/** Pip evoluciona: destello ascendente distinto de la recompensa final. */
export function playEvolution() {
  playNotes([
    { freq: 440, start: 0, duration: 0.12, type: "triangle" },
    { freq: 660, start: 0.1, duration: 0.16, type: "triangle" },
    { freq: 880, start: 0.22, duration: 0.2, type: "triangle" },
    { freq: 1320, start: 0.36, duration: 0.35, volume: 0.24 },
  ]);
}

/** Ronquido suave de Pip dormido. */
export function playSnore() {
  playNotes([
    { freq: 120, start: 0, duration: 0.42, volume: 0.06, type: "sine" },
    { freq: 95, start: 0.5, duration: 0.52, volume: 0.05, type: "sine" },
  ]);
}
