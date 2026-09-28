/** Reproducción de los clips ya producidos en /public/audio. Nunca se genera audio en el juego. */

/** Tope de seguridad: ningún clip bloquea más de esto aunque no dispare "ended". */
export const CLIP_MAX_MS = 10_000;

let current: HTMLAudioElement | null = null;
let currentResolve: (() => void) | null = null;

export function isPlaying() {
  return current !== null;
}

export function clipUrl(clipId: string) {
  return `/audio/${clipId}.mp3`;
}

/** Sube con cada stopClip() externo: cancela secuencias y clips encolados. */
let generation = 0;

export function stopClip() {
  generation += 1;
  stopCurrent();
}

function stopCurrent() {
  if (current) {
    current.pause();
    current.currentTime = 0;
    current = null;
  }
  const resolve = currentResolve;
  currentResolve = null;
  resolve?.();
}

function playOne(clipId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  stopCurrent();
  const audio = new Audio(clipUrl(clipId));
  current = audio;
  return new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (current === audio) current = null;
      if (currentResolve === done) currentResolve = null;
      resolve();
    };
    const timer = window.setTimeout(() => {
      if (current === audio) audio.pause();
      done();
    }, CLIP_MAX_MS);
    currentResolve = done;
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  });
}

/** Reproduce un clip o varios seguidos (por ejemplo "I am from" + "Mexico"). */
export function playClip(clipId: string | string[]): Promise<void> {
  if (Array.isArray(clipId)) return playSequence(clipId);
  return playOne(clipId);
}

export async function playSequence(clips: string[]): Promise<void> {
  const gen = generation;
  for (const clip of clips) {
    if (gen !== generation) return;
    await playOne(clip);
  }
}

/** Espera a que no suene ningún clip (tope CLIP_MAX_MS) y luego una pausa extra. */
export async function waitForSilence(pauseMs = 0): Promise<void> {
  if (typeof window === "undefined") return;
  const started = Date.now();
  while (isPlaying() && Date.now() - started < CLIP_MAX_MS) {
    await new Promise((r) => setTimeout(r, 120));
  }
  if (pauseMs > 0) await new Promise((r) => setTimeout(r, pauseMs));
}

/** Espera silencio, reproduce el clip completo y deja una pausa antes de seguir. */
export async function playThenPause(clipId: string | string[], pauseMs = 600): Promise<void> {
  await waitForSilence();
  await playClip(clipId);
  await waitForSilence(pauseMs);
}

/**
 * Audio automático encadenado: espera a que termine lo que esté sonando y recién
 * entonces reproduce. Se cancela si alguien llama stopClip() antes de empezar.
 */
export async function queueClip(clipId: string | string[]): Promise<void> {
  if (typeof window === "undefined") return;
  const gen = generation;
  await new Promise((r) => setTimeout(r, 80));
  while (isPlaying()) {
    if (gen !== generation) return;
    await new Promise((r) => setTimeout(r, 120));
  }
  if (gen !== generation) return;
  await playClip(clipId);
}
