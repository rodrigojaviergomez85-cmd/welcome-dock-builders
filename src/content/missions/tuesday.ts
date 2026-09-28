import type { Mission } from "./types";

/**
 * Martes — Level 0 · Week 1 · Day 2: países.
 *  ICEBREAKER  How are you?                         → bloque "tue-warmup"
 *  PRACTICE    Where are you from? / I am from ___   → "tue-boat" y "tue-myflag"
 *  AF          Tell me about yourself (saludo, nombre, país) → "tue-show"
 * Mecánica nueva del día: el barco de banderas.
 * Nueve turnos hablados: w1 w2 · b1 b2 b3 b4 · t1 t2 · t3. Cada frase una sola vez.
 */
export const tuesdayMission: Mission = {
  id: "tuesday",
  order: 2,
  dayEs: "Martes",
  title: "El barco de banderas",
  status: "available",
  objective: "Where are you from? / I am from ______.",
  storyProblem:
    "Llega un barco con cuatro exploradores de distintos países. Hay que escuchar de dónde es cada uno y darle su bandera.",
  prerequisites: ["monday"],
  models: [
    "{greeting}",
    "I am fine, thank you.",
    "I am from {country}.",
    "Where are you from?",
    "{greeting} My name is {alias}. I am from {country}.",
  ],
  reward: { id: "flag-sticker", label: "Tu bandera en la mochila" },
  evidence: "Reconoce países dichos en inglés, dice de dónde es y lo pregunta.",
  counter: { icon: "star", label: "Banderas" },
  pip: { feedsToEvolve: 9, rewardLabel: "Pip gana un pañuelo con tu bandera" },
  reviewPhrases: [
    "{greeting}",
    "I am fine, thank you.",
    "I am from Mexico.",
    "I am from Brazil.",
    "I am from Colombia.",
    "I am from El Salvador.",
    "I am from {country}.",
    "Where are you from?",
    "{greeting} My name is {alias}. I am from {country}.",
  ],
  blocks: [
    /* ───────────── 1. CALENTAMIENTO CON PIP (1,5 min) · 2 turnos ───────────── */
    {
      kind: "warmup",
      id: "tue-warmup",
      estimatedMinutes: 1.5,
      helpEs: "Saludá según la hora y contestale a Luna.",
      time: "auto",
      introClip: "es-warmup-intro",
      steps: [
        {
          record: {
            id: "w1",
            role: "repeat",
            promptEs: "Saludá según la hora.",
            targetEn: "{greeting}",
            modelClip: "model-{greetingClip}",
          },
        },
        {
          line: { speaker: "luna", clip: "luna-how-are-you", en: "How are you?", es: "¿Cómo estás?" },
          record: {
            id: "w2",
            role: "answer",
            promptEs: "Contestale a Luna.",
            targetEn: "I am fine, thank you.",
            modelClip: "model-i-am-fine-thank-you",
          },
        },
      ],
    },

    /* ───────────── 2. EL BARCO DE BANDERAS (5 min) · 4 turnos ───────────── */
    {
      kind: "flagBoat",
      id: "tue-boat",
      estimatedMinutes: 5,
      helpEs: "Escuchá de dónde es cada explorador, tocá su bandera y repetí.",
      time: "morning",
      introClip: "es-boat-intro",
      flags: ["c-mexico", "c-brazil", "c-colombia", "c-el-salvador"],
      explorers: [
        {
          speaker: "leo",
          country: "c-mexico",
          line: { speaker: "leo", clip: "leo-from-mexico", en: "Hello! I am from Mexico.", es: "¡Hola! Soy de México." },
          repeat: {
            id: "b1",
            role: "repeat",
            promptEs: "Repetí lo que dijo Leo.",
            targetEn: "I am from Mexico.",
            modelClip: ["p-i-am-from", "w-c-mexico"],
          },
        },
        {
          speaker: "mia",
          country: "c-brazil",
          line: { speaker: "mia", clip: "mia-from-brazil", en: "Hello! I am from Brazil.", es: "¡Hola! Soy de Brasil." },
          repeat: {
            id: "b2",
            role: "repeat",
            promptEs: "Repetí lo que dijo Mia.",
            targetEn: "I am from Brazil.",
            modelClip: ["p-i-am-from", "w-c-brazil"],
          },
        },
        {
          speaker: "luna",
          country: "c-colombia",
          line: {
            speaker: "luna",
            clip: "luna-from-colombia",
            en: "Hello! I am from Colombia.",
            es: "¡Hola! Soy de Colombia.",
          },
          repeat: {
            id: "b3",
            role: "repeat",
            promptEs: "Repetí lo que dijo Luna.",
            targetEn: "I am from Colombia.",
            modelClip: ["p-i-am-from", "w-c-colombia"],
          },
        },
        {
          speaker: "boti",
          country: "c-el-salvador",
          line: {
            speaker: "boti",
            clip: "boti-from-el-salvador",
            en: "Hello! I am from El Salvador.",
            es: "¡Hola! Soy de El Salvador.",
          },
          repeat: {
            id: "b4",
            role: "repeat",
            promptEs: "Repetí lo que dijo Boti.",
            targetEn: "I am from El Salvador.",
            modelClip: ["p-i-am-from", "w-c-el-salvador"],
          },
        },
      ],
      done: { speaker: "boti", clip: "boti-boat-done", en: "Welcome, explorers!", es: "¡Bienvenidos, exploradores!" },
    },

    /* ───────────── 3. MI BANDERA (4 min) · 2 turnos ───────────── */
    {
      kind: "pickProfile",
      id: "tue-myflag",
      estimatedMinutes: 4,
      helpEs: "Elegí tu bandera. Leo te pregunta de dónde sos; después preguntale vos a Mia.",
      time: "afternoon",
      field: "country",
      promptEs: "¿Cuál es tu bandera?",
      introClip: "es-myflag-intro",
      options: [
        "c-el-salvador",
        "c-mexico",
        "c-guatemala",
        "c-colombia",
        "c-peru",
        "c-argentina",
        "c-brazil",
        "c-united-states",
      ],
      asker: "leo",
      ask: { speaker: "leo", clip: "leo-where-from", en: "Where are you from?", es: "¿De dónde sos?" },
      say: {
        id: "t1",
        mode: "guided",
        role: "answer",
        targetEn: "I am from {country}.",
        promptEs: "Decile a Leo de dónde sos.",
        modelClip: ["p-i-am-from", "{countryClip}"],
      },
      sticker: true,
      swap: {
        record: {
          id: "t2",
          role: "ask",
          promptEs: "Preguntale a Mia de dónde es.",
          promptClip: "es-ask-mia-from",
          confusedWith: "I am from {country}.",
          targetEn: "Where are you from?",
          modelClip: "p-where-from",
        },
        answer: { speaker: "mia", clip: "mia-from-brazil-short", en: "I am from Brazil!", es: "¡Soy de Brasil!" },
      },
    },

    /* ───────────── 4. PRESENTACIÓN EN EL MUELLE (2 min) · 1 turno ───────────── */
    {
      kind: "showcase",
      id: "tue-show",
      estimatedMinutes: 2,
      helpEs: "Saludá según la hora, decí tu nombre y de dónde sos. Es tu presentación de hoy.",
      time: "auto",
      introClip: "es-tue-show-intro",
      audience: ["luna", "leo", "mia", "boti"],
      intro: { speaker: "luna", clip: "luna-tell-me", en: "Tell me about yourself!", es: "¡Contame de vos!" },
      previousLines: ["{greeting} My name is {alias}."],
      steps: [
        {
          id: "t3",
          role: "answer",
          promptEs: "Saludá, decí tu nombre y de dónde sos.",
          targetEn: "{greeting} My name is {alias}. I am from {country}.",
          modelClip: ["model-{greetingClip}", "model-my-name-is", "p-i-am-from", "{countryClip}"],
        },
      ],
      cheer: {
        speaker: "luna",
        clip: "luna-cheer",
        en: "Yay! Welcome to Explorer Island!",
        es: "¡Bien! ¡Bienvenido a la Isla de los Exploradores!",
      },
      saveAs: "presentation-day2",
      teaser: {
        speaker: "boti",
        clip: "boti-teaser-wednesday",
        en: "Tomorrow: how old are you?",
        es: "Mañana: ¿cuántos años tenés?",
      },
    },
  ],
};
