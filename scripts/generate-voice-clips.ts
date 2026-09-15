/**
 * Genera los clips de voz PROVISIONALES de los personajes.
 *
 * Se ejecuta una sola vez en la construcción (bun scripts/generate-voice-clips.ts).
 * El juego NUNCA genera audio en tiempo real: solo reproduce estos archivos.
 * Estos clips son provisionales y deben sustituirse por grabaciones humanas revisadas.
 */
import { mkdir, writeFile, stat } from "node:fs/promises";

const OUT_DIR = "public/audio";

const VOICES: Record<string, string> = {
  luna: "shimmer",
  leo: "alloy",
  boti: "echo",
  mia: "nova",
  model: "sage",
};

const CHARACTER_INSTRUCTIONS =
  "You are a cheerful 8-year-old child with a high-pitched, youthful, playful kid voice. Speak slowly and very clearly, full of excitement and curiosity, like a kid greeting a new friend. Leave a small pause between words. You must sound like a child, never like an adult.";

const MODEL_INSTRUCTIONS =
  "Speak slowly, warmly and very clearly, like a friendly young tutor demonstrating a phrase for a child who is hearing English for the first time. Leave a small pause between words.";

type Line = { id: string; speaker: keyof typeof VOICES | string; text: string };

export const LINES: Line[] = [
  // Luna
  { id: "luna-hello-name", speaker: "luna", text: "Hello! My name is Luna." },
  { id: "luna-welcome", speaker: "luna", text: "Hello! My name is Luna. Welcome to Explorer Island!" },
  { id: "luna-what-name", speaker: "luna", text: "What is your name?" },
  { id: "luna-how-are-you", speaker: "luna", text: "How are you?" },
  { id: "luna-i-am-fine", speaker: "luna", text: "I am fine, thank you!" },
  { id: "luna-nice", speaker: "luna", text: "Nice to meet you!" },
  { id: "luna-good-night", speaker: "luna", text: "Good night!" },
  { id: "luna-intro-morning", speaker: "luna", text: "Good morning! My name is Luna." },
  { id: "luna-intro-afternoon", speaker: "luna", text: "Good afternoon! My name is Luna." },
  { id: "luna-intro-evening", speaker: "luna", text: "Good evening! My name is Luna." },
  { id: "luna-this-is-your-bag", speaker: "luna", text: "This is your backpack!" },

  // Leo
  { id: "leo-hello-name", speaker: "leo", text: "Hello! My name is Leo." },
  { id: "leo-what-name", speaker: "leo", text: "What is your name?" },
  { id: "leo-how-are-you", speaker: "leo", text: "How are you?" },
  { id: "leo-i-am-fine", speaker: "leo", text: "I am fine." },
  { id: "leo-nice", speaker: "leo", text: "Nice to meet you!" },
  { id: "leo-ask-first", speaker: "leo", text: "Hello! What is your name? My name is Leo." },
  { id: "leo-intro-morning", speaker: "leo", text: "Good morning! My name is Leo." },
  { id: "leo-intro-afternoon", speaker: "leo", text: "Good afternoon! My name is Leo." },
  { id: "leo-intro-evening", speaker: "leo", text: "Good evening! My name is Leo." },

  // Boti
  { id: "boti-hello-name", speaker: "boti", text: "Hello! My name is Boti." },
  { id: "boti-what-name", speaker: "boti", text: "What is your name?" },
  { id: "boti-how-are-you", speaker: "boti", text: "How are you?" },
  { id: "boti-i-am-fine", speaker: "boti", text: "I am fine." },
  { id: "boti-greet-then-name", speaker: "boti", text: "Good afternoon! I am Boti. My name is Boti." },
  { id: "boti-intro-morning", speaker: "boti", text: "Good morning! My name is Boti." },
  { id: "boti-intro-afternoon", speaker: "boti", text: "Good afternoon! My name is Boti." },
  { id: "boti-intro-evening", speaker: "boti", text: "Good evening! My name is Boti." },

  // Mia
  { id: "mia-hello-what-name", speaker: "mia", text: "Hello! What is your name?" },
  { id: "mia-hello-name", speaker: "mia", text: "Hello! My name is Mia." },
  { id: "mia-how-are-you", speaker: "mia", text: "How are you?" },
  { id: "mia-nice", speaker: "mia", text: "Nice to meet you!" },
  { id: "mia-good-night", speaker: "mia", text: "Good night!" },

  // Modelos de respuesta para el alumno
  { id: "model-hello", speaker: "model", text: "Hello!" },
  { id: "model-my-name-is", speaker: "model", text: "My name is Alex." },
  { id: "model-hello-my-name-is", speaker: "model", text: "Hello! My name is Alex." },
  { id: "model-i-am-fine", speaker: "model", text: "I am fine." },
  { id: "model-good-morning", speaker: "model", text: "Good morning!" },
  { id: "model-good-afternoon", speaker: "model", text: "Good afternoon!" },
  { id: "model-good-evening", speaker: "model", text: "Good evening!" },
];

async function exists(path: string) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Falta LOVABLE_API_KEY");
  await mkdir(OUT_DIR, { recursive: true });

  for (const line of LINES) {
    const path = `${OUT_DIR}/${line.id}.mp3`;
    if (await exists(path)) {
      console.log(`skip ${line.id}`);
      continue;
    }
    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        voice: VOICES[line.speaker] ?? "sage",
        input: line.text,
        response_format: "mp3",
        instructions: INSTRUCTIONS,
      }),
    });
    if (!res.ok) {
      console.error(`FALLO ${line.id}: ${res.status} ${await res.text()}`);
      continue;
    }
    await writeFile(path, Buffer.from(await res.arrayBuffer()));
    console.log(`ok   ${line.id}`);
  }
}

main();
