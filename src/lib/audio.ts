/** Reproducción de los clips ya producidos en /public/audio. Nunca se genera audio en el juego. */

let current: HTMLAudioElement | null = null;

export function clipUrl(clipId: string) {
  return `/audio/${clipId}.mp3`;
}

export function stopClip() {
  if (current) {
    current.pause();
    current.currentTime = 0;
    current = null;
  }
}

function playOne(clipId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  stopClip();
  const audio = new Audio(clipUrl(clipId));
  current = audio;
  return new Promise<void>((resolve) => {
    audio.onended = () => {
      if (current === audio) current = null;
      resolve();
    };
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
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
