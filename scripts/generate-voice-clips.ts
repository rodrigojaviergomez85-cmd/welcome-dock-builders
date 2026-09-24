/**
 * Genera los clips de voz PROVISIONALES de los personajes.
 *
 * Se ejecuta una sola vez en la construcción (bun scripts/generate-voice-clips.ts).
 * El juego NUNCA genera audio en tiempo real: solo reproduce estos archivos.
 * Estos clips son provisionales y deben sustituirse por grabaciones humanas revisadas.
 */
import { mkdir, writeFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const OUT_DIR = "public/audio";

// Además de las instrucciones, se sube el tono con ffmpeg para que suenen como niños.
const PITCH: Record<string, number> = {
  luna: 1.2,
  leo: 1.16,
  boti: 1.28,
  mia: 1.22,
  es: 1.24,
};

function raisePitch(path: string, factor: number) {
  const tmp = `${path}.tmp.mp3`;
  const r = spawnSync("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    path,
    "-af",
    `asetrate=24000*${factor},aresample=24000,atempo=${(1 / factor).toFixed(4)}`,
    "-codec:a",
    "libmp3lame",
    "-q:a",
    "4",
    tmp,
  ]);
  if (r.status === 0) spawnSync("mv", [tmp, path]);
}

// Voces agudas y juveniles; "instructions" fuerza el tono de niño.
const VOICES: Record<string, string> = {
  luna: "shimmer",
  leo: "nova",
  boti: "coral",
  mia: "shimmer",
  model: "sage",
  es: "shimmer",
  slow: "sage",
};

const CHARACTER_INSTRUCTIONS =
  "You are a cheerful 8-year-old child with a high-pitched, youthful, playful kid voice. Speak slowly and very clearly, full of excitement and curiosity, like a kid greeting a new friend. Leave a small pause between words. You must sound like a child, never like an adult.";

const MODEL_INSTRUCTIONS =
  "Speak slowly, warmly and very clearly, like a friendly young tutor demonstrating a phrase for a child who is hearing English for the first time. Leave a small pause between words.";

const ES_INSTRUCTIONS =
  "Sos una niña de 8 años. Hablá en español latinoamericano neutro con una voz claramente infantil, aguda, juguetona y llena de entusiasmo. Hablá despacio y con mucha claridad, como una niña ayudando a otro niño. Nunca debes sonar como una persona adulta, una maestra adulta o una narradora adulta.";

const SLOW_INSTRUCTIONS =
  "Speak EXTREMELY slowly in English, one word at a time, with a clear pause after every single word, exaggerating each sound, like a teacher helping a child repeat the phrase.";

function instructionsFor(speaker: string) {
  if (speaker === "model") return MODEL_INSTRUCTIONS;
  if (speaker === "es") return ES_INSTRUCTIONS;
  if (speaker === "slow") return SLOW_INSTRUCTIONS;
  return CHARACTER_INSTRUCTIONS;
}

type Line = { id: string; speaker: keyof typeof VOICES | string; text: string };

const COUNTRY_NAMES: [string, string][] = [
  ["c-el-salvador", "El Salvador"],
  ["c-mexico", "Mexico"],
  ["c-guatemala", "Guatemala"],
  ["c-colombia", "Colombia"],
  ["c-peru", "Peru"],
  ["c-argentina", "Argentina"],
  ["c-brazil", "Brazil"],
  ["c-united-states", "United States"],
];
const COUNTRY_LINES: Line[] = COUNTRY_NAMES.map(([id, name]) => ({
  id: `w-${id}`,
  speaker: "model",
  text: name,
}));

const NUMBER_NAMES = [
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];
const NUMBER_LINES: Line[] = NUMBER_NAMES.map((word, i) => ({
  id: `w-n-${i + 1}`,
  speaker: "model",
  text: word,
}));

const LETTER_LINES: Line[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => ({
  id: `w-l-${letter.toLowerCase()}`,
  speaker: "model",
  text: `${letter}.`,
}));

export const LINES: Line[] = [
  // Luna
  { id: "luna-hello-name", speaker: "luna", text: "Hello! My name is Luna." },
  {
    id: "luna-welcome",
    speaker: "luna",
    text: "Hello! My name is Luna. Welcome to Explorer Island!",
  },
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
  {
    id: "boti-greet-then-name",
    speaker: "boti",
    text: "Good afternoon! I am Boti. My name is Boti.",
  },
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

  // Significados en español (modo "primero en español", como Dora)
  { id: "es-hello", speaker: "es", text: "¡Hola!" },
  {
    id: "es-luna-welcome",
    speaker: "es",
    text: "¡Hola! Me llamo Luna. ¡Bienvenido a la Isla de los Exploradores!",
  },
  { id: "es-what-name", speaker: "es", text: "¿Cómo te llamás?" },
  { id: "es-hello-what-name", speaker: "es", text: "¡Hola! ¿Cómo te llamás?" },
  { id: "es-leo-ask-first", speaker: "es", text: "¡Hola! ¿Cómo te llamás? Yo me llamo Leo." },
  { id: "es-hello-name-leo", speaker: "es", text: "¡Hola! Me llamo Leo." },
  { id: "es-morning-luna", speaker: "es", text: "¡Buenos días! Me llamo Luna." },
  { id: "es-afternoon-luna", speaker: "es", text: "¡Buenas tardes! Me llamo Luna." },
  { id: "es-afternoon-leo", speaker: "es", text: "¡Buenas tardes! Me llamo Leo." },
  { id: "es-evening-boti", speaker: "es", text: "¡Buenas noches! Me llamo Boti." },
  { id: "es-boti-greet", speaker: "es", text: "¡Buenas tardes! Soy Boti. Me llamo Boti." },
  { id: "es-your-backpack", speaker: "es", text: "¡Esta es tu mochila!" },
  { id: "es-nice", speaker: "es", text: "¡Mucho gusto!" },
  { id: "es-i-am-fine", speaker: "es", text: "Estoy bien." },
  { id: "es-how-are-you", speaker: "es", text: "¿Cómo estás?" },
  { id: "es-good-night", speaker: "es", text: "¡Buenas noches! Se dice al irse a dormir." },
  { id: "es-good-morning", speaker: "es", text: "¡Buenos días!" },
  { id: "es-good-afternoon", speaker: "es", text: "¡Buenas tardes!" },
  { id: "es-good-evening", speaker: "es", text: "¡Buenas noches! Se dice al llegar de noche." },
  { id: "es-my-name-is", speaker: "es", text: "Me llamo… y acá decís tu nombre." },
  { id: "es-hello-my-name-is", speaker: "es", text: "¡Hola! Me llamo… y acá decís tu nombre." },
  { id: "es-hello-name-fine", speaker: "es", text: "¡Hola! Me llamo… y estoy bien." },
  {
    id: "es-good-afternoon-name",
    speaker: "es",
    text: "¡Buenas tardes! Me llamo… y acá decís tu nombre.",
  },
  { id: "es-your-turn", speaker: "es", text: "¡Te toca!" },

  // Inglés muy lento, palabra por palabra
  { id: "slow-what-name", speaker: "slow", text: "What... is... your... name?" },
  { id: "slow-i-am-fine", speaker: "slow", text: "I... am... fine." },
  { id: "slow-how-are-you", speaker: "slow", text: "How... are... you?" },
  { id: "slow-good-morning", speaker: "slow", text: "Good... morning!" },
  { id: "slow-good-afternoon", speaker: "slow", text: "Good... afternoon!" },
  { id: "slow-my-name-is", speaker: "slow", text: "My... name... is... Alex." },
  { id: "slow-hello-my-name-is", speaker: "slow", text: "Hello!... My... name... is... Alex." },
  {
    id: "slow-hello-name-fine",
    speaker: "slow",
    text: "Hello!... My... name... is... Alex... I... am... fine.",
  },
  {
    id: "slow-good-afternoon-name",
    speaker: "slow",
    text: "Good... afternoon!... My... name... is... Alex.",
  },

  // Frases puente de la guía
  { id: "bridge-en-ingles", speaker: "es", text: "En inglés se dice así:" },
  { id: "bridge-repeat", speaker: "es", text: "¡Ahora vos! Repetí conmigo." },
  { id: "bridge-muy-bien", speaker: "es", text: "¡Muy bien!" },

  // Instrucciones de cada parte de la misión
  {
    id: "intro-story",
    speaker: "es",
    text: "Llegaste al muelle. Luna te va a saludar en inglés. Escuchá y después elegí tu respuesta.",
  },
  {
    id: "intro-listen",
    speaker: "es",
    text: "Vas a escuchar a alguien presentarse en inglés. Tocá quién habló.",
  },
  {
    id: "intro-bags",
    speaker: "es",
    text: "Cada explorador dice su nombre en inglés. Llevale la mochila a su dueño.",
  },
  {
    id: "intro-talk",
    speaker: "es",
    text: "Te van a saludar en inglés. Vos vas a contestar con tu nombre. Primero escuchás, después lo decís.",
  },
  {
    id: "intro-finale",
    speaker: "es",
    text: "Alguien nuevo te espera. Respondé en inglés y ganá tu etiqueta.",
  },

  // --- Semana 1: vocabulario nuevo (países, números, alfabeto) y partes de frase ---
  ...COUNTRY_LINES,
  ...NUMBER_LINES,
  ...LETTER_LINES,

  { id: "p-i-am-from", speaker: "model", text: "I am from" },
  { id: "p-i-am", speaker: "model", text: "I am" },
  { id: "p-years-old", speaker: "model", text: "years old" },
  { id: "p-where-from", speaker: "luna", text: "Where are you from?" },
  { id: "p-how-old", speaker: "boti", text: "How old are you?" },
  { id: "p-tell-me", speaker: "luna", text: "Tell me about yourself!" },
  { id: "p-nice", speaker: "model", text: "Nice to meet you!" },

  { id: "spell-luna", speaker: "slow", text: "L... U... N... A" },
  { id: "spell-leo", speaker: "slow", text: "L... E... O" },
  { id: "spell-boti", speaker: "slow", text: "B... O... T... I" },
  { id: "spell-mia", speaker: "slow", text: "M... I... A" },

  { id: "es-where-from", speaker: "es", text: "¿De dónde sos?" },
  { id: "es-i-am-from", speaker: "es", text: "Soy de… y acá decís tu país." },
  { id: "es-how-old", speaker: "es", text: "¿Cuántos años tenés?" },
  { id: "es-years-old", speaker: "es", text: "Tengo… y acá decís tus años." },
  { id: "es-tell-me", speaker: "es", text: "¡Contame de vos!" },

  {
    id: "intro-tue-flags",
    speaker: "es",
    text: "Llegó el barco y las banderas se mezclaron. Escuchá de dónde es cada explorador y tocá su bandera.",
  },
  {
    id: "intro-tue-mine",
    speaker: "es",
    text: "Ahora te toca a vos: elegí tu país y aprendé a decirlo en inglés.",
  },
  {
    id: "intro-tue-show",
    speaker: "es",
    text: "Luna te pregunta de dónde sos. Decí tu nombre y tu país en inglés.",
  },
  {
    id: "intro-wed-numbers",
    speaker: "es",
    text: "En el mercado se cayeron las cajas. Escuchá el número en inglés y tocalo.",
  },
  {
    id: "intro-wed-age",
    speaker: "es",
    text: "Elegí cuántos años tenés y aprendé a decirlo en inglés.",
  },
  {
    id: "intro-wed-show",
    speaker: "es",
    text: "Boti quiere saber tu edad. Decí tu nombre, tu país y tus años.",
  },
  {
    id: "intro-thu-letters",
    speaker: "es",
    text: "El faro perdió sus letras. Escuchá cada letra en inglés y tocala.",
  },
  {
    id: "intro-thu-bee",
    speaker: "es",
    text: "Ahora deletrean nombres. Escuchá letra por letra y tocá de quién es.",
  },
  {
    id: "intro-thu-spell",
    speaker: "es",
    text: "Armá tu propio nombre tocando sus letras en inglés.",
  },
  {
    id: "intro-fri-warmup",
    speaker: "es",
    text: "Repaso rápido de letras antes de salir al escenario.",
  },
  { id: "intro-fri-spell", speaker: "es", text: "Deletreá tu nombre para el público de la isla." },
  {
    id: "intro-fri-show",
    speaker: "es",
    text: "¡Es tu show! Contá quién sos: nombre, país y edad, todo en inglés.",
  },

  // ── Lunes "El reloj del sol" (nuevos) ──
  { id: "boti-good-morning", speaker: "boti", text: "Good morning!" },
  { id: "boti-good-afternoon", speaker: "boti", text: "Good afternoon!" },
  { id: "boti-good-evening", speaker: "boti", text: "Good evening!" },
  { id: "boti-good-night", speaker: "boti", text: "Good night!" },
  { id: "boti-good-night-name", speaker: "boti", text: "Good night! My name is Boti." },
  { id: "boti-sun-fixed", speaker: "boti", text: "The sun clock works! Thank you!" },
  { id: "boti-tag-ready", speaker: "boti", text: "Your tag is ready!" },
  { id: "luna-hello-how-are-you", speaker: "luna", text: "Hello! How are you?" },
  { id: "luna-i-am-fine-thank-you", speaker: "luna", text: "I am fine, thank you." },
  { id: "luna-my-name-is", speaker: "luna", text: "My name is Luna." },
  { id: "luna-tell-me", speaker: "luna", text: "Tell me about yourself!" },
  { id: "luna-cheer", speaker: "luna", text: "Yay! Welcome to Explorer Island!" },
  { id: "leo-teaser-tuesday", speaker: "leo", text: "Tomorrow I will tell you where I am from!" },
  { id: "mia-intro-afternoon", speaker: "mia", text: "Good afternoon! My name is Mia." },
  { id: "mia-my-name-is", speaker: "mia", text: "My name is Mia!" },
  { id: "model-good-night", speaker: "model", text: "Good night!" },
  { id: "model-what-name", speaker: "model", text: "What is your name?" },
  { id: "model-i-am-fine-thank-you", speaker: "model", text: "I am fine, thank you." },
  { id: "model-hello-how-are-you", speaker: "model", text: "Hello! How are you?" },
  { id: "slow-good-evening", speaker: "slow", text: "Good... evening!" },
  { id: "slow-good-night", speaker: "slow", text: "Good... night!" },
  { id: "slow-i-am-fine-thank-you", speaker: "slow", text: "I... am... fine,... thank... you." },
  {
    id: "es-pip-intro",
    speaker: "es",
    text: "Este es Pip. Pip solo entiende inglés y está dormido. Tocá el micrófono y decile: Hello!",
  },
  {
    id: "es-sun-intro",
    speaker: "es",
    text: "El reloj del sol se rompió. Arrastrá el sol por el cielo y escuchá cómo saluda Boti a cada hora.",
  },
  {
    id: "es-sun-repeat",
    speaker: "es",
    text: "Ahora vos. Tocá un cielo y repetí el saludo para que Pip coma.",
  },
  {
    id: "es-radar-intro",
    speaker: "es",
    text: "Escuchá cómo saluda cada explorador y tocá el cielo de esa hora.",
  },
  {
    id: "es-tag-intro",
    speaker: "es",
    text: "Leo quiere saber tu nombre. Decilo al micrófono y la máquina de Boti imprime tu etiqueta.",
  },
  { id: "es-tag-swap", speaker: "es", text: "Ahora preguntá vos: What is your name?" },
  {
    id: "es-roleplay-intro",
    speaker: "es",
    text: "Vamos a conversar con Luna. Primero respondés vos. Después preguntás vos.",
  },
  {
    id: "es-dock-intro",
    speaker: "es",
    text: "Mirá el cielo: es la hora de verdad. Saludá según la hora y decí tu nombre. Esta es tu presentación de hoy.",
  },
  { id: "es-i-am-fine-thank-you", speaker: "es", text: "Estoy bien, gracias." },
  { id: "es-hello-how-are-you", speaker: "es", text: "¡Hola! ¿Cómo estás?" },
  {
    id: "es-help-ask",
    speaker: "es",
    text: "Ahora te toca preguntar a vos. Escuchá la frase y decila en inglés.",
  },
  {
    id: "es-help-answer",
    speaker: "es",
    text: "Ahora respondés vos. Tocá el botón rojo y decí la frase en inglés con tu nombre.",
  },
  {
    id: "es-help-repeat",
    speaker: "es",
    text: "Repetí la frase. Tocá el botón rojo y decila en inglés.",
  },
  { id: "es-help-offer", speaker: "es", text: "¿Te ayudo? Tocá mi carita." },
  {
    id: "es-ask-mia-name",
    speaker: "es",
    text: "¡Mirá, llegó Mia! Preguntale cómo se llama diciendo:",
  },
  {
    id: "es-ask-luna-how",
    speaker: "es",
    text: "Luna está esperando. Saludala y preguntale cómo está diciendo:",
  },
  {
    id: "es-ask-luna-name",
    speaker: "es",
    text: "Ahora preguntale el nombre a Luna diciendo:",
  },
  { id: "es-ask-repeat", speaker: "es", text: "Ahora repetilo vos." },
  { id: "es-ask-hint", speaker: "es", text: "Escuchá y decilo vos." },
  {
    id: "es-ask-confused",
    speaker: "es",
    text: "¡Esa es la respuesta! Ahora te toca preguntar a vos. Escuchá.",
  },
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
        instructions: instructionsFor(line.speaker),
      }),
    });
    if (!res.ok) {
      console.error(`FALLO ${line.id}: ${res.status} ${await res.text()}`);
      continue;
    }
    await writeFile(path, Buffer.from(await res.arrayBuffer()));
    const factor = PITCH[line.speaker];
    if (factor) raisePitch(path, factor);
    console.log(`ok   ${line.id}`);
  }
}

main();
