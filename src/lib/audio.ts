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

export function stopClip() {
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
  stopClip();
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
  for (const clip of clips) {
    await playOne(clip);
  }
}
