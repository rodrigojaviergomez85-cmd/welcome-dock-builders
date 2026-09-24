/**
 * La vocecita de Pip: repite la frase con la voz del niño acelerada (playbackRate 1.35,
 * sin corregir el tono) o, si no hubo grabación, con el clip modelo y el mismo efecto.
 * Todo queda en el dispositivo: usa el blob recién grabado o las claves de `recordings`.
 */
import { clipUrl } from "./audio";
import { getRecording } from "./recordings";

export type PipVoiceSource = {
  clip: string | string[];
  blob?: Blob | null;
  recordingKey?: string;
};

export const PIP_VOICE_RATE = 1.35;
const PIP_VOICE_MAX_MS = 3000;

let lastTake: PipVoiceSource | null = null;

/** RecordTurn avisa qué dijo el niño en el turno actual. */
export function setLastTake(take: PipVoiceSource) {
  lastTake = take;
}

/** MissionPlayer toma la última toma al alimentar a Pip. */
export function takeLastTake(): PipVoiceSource | null {
  const take = lastTake;
  lastTake = null;
  return take;
}

let ctx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function stopPipVoice() {
  try {
    currentSource?.stop();
  } catch {
    /* ya terminó */
  }
  currentSource = null;
}

async function loadBuffer(source: PipVoiceSource, context: AudioContext) {
  let blob = source.blob && source.blob.size > 0 ? source.blob : null;
  if (!blob && source.recordingKey) {
    const rec = await getRecording(source.recordingKey).catch(() => null);
    if (rec && rec.blob.size > 0) blob = rec.blob;
  }
  if (blob) {
    try {
      return await context.decodeAudioData(await blob.arrayBuffer());
    } catch {
      /* grabación ilegible: usamos el clip modelo */
    }
  }
  const clips = Array.isArray(source.clip) ? source.clip : [source.clip];
  const first = clips[0];
  if (!first) return null;
  const res = await fetch(clipUrl(first));
  return context.decodeAudioData(await res.arrayBuffer());
}

/** Reproduce la frase con la vocecita. Se resuelve al terminar (máximo 3 s). */
export async function playPipVoice(source: PipVoiceSource): Promise<void> {
  const context = audioContext();
  if (!context) return;
  stopPipVoice();
  try {
    const buffer = await loadBuffer(source, context);
    if (!buffer) return;
    const node = context.createBufferSource();
    node.buffer = buffer;
    node.playbackRate.value = PIP_VOICE_RATE;
    node.connect(context.destination);
    currentSource = node;
    await new Promise<void>((resolve) => {
      const timer = window.setTimeout(() => {
        stopPipVoice();
        resolve();
      }, PIP_VOICE_MAX_MS);
      node.onended = () => {
        window.clearTimeout(timer);
        if (currentSource === node) currentSource = null;
        resolve();
      };
      node.start();
    });
  } catch {
    /* sin audio, el momento sigue */
  }
}
