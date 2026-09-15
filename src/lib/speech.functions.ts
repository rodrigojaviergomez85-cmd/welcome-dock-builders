/**
 * Transcribe el intento del niño. El audio viaja solo para convertirse en texto:
 * no se guarda en el servidor y la grabación sigue viviendo en el dispositivo.
 */
import { createServerFn } from "@tanstack/react-start";

export type TranscribeResult = { ok: true; text: string } | { ok: false; reason: string };

export const transcribeAttempt = createServerFn({ method: "POST" })
  .inputValidator((input: { audioBase64: string }) => {
    if (!input || typeof input.audioBase64 !== "string" || input.audioBase64.length === 0) {
      throw new Error("Falta el audio");
    }
    // ~1.4 MB de audio como máximo (unos 40 segundos en 16 kHz mono).
    if (input.audioBase64.length > 2_000_000) throw new Error("El audio es demasiado largo");
    return input;
  })
  .handler(async ({ data }): Promise<TranscribeResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false, reason: "sin-servicio" };

    const bytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
    if (bytes.byteLength < 2048) return { ok: false, reason: "audio-vacio" };

    const form = new FormData();
    form.append("model", "google/gemini-3.5-transcribe");
    form.append("file", new Blob([bytes], { type: "audio/wav" }), "intento.wav");
    form.append("language", "en");

    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      });
    } catch {
      return { ok: false, reason: "sin-conexion" };
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`Transcripción falló [${res.status}]: ${body}`);
      if (res.status === 402 || res.status === 403) return { ok: false, reason: "sin-creditos" };
      if (res.status === 429) return { ok: false, reason: "ocupado" };
      return { ok: false, reason: "error" };
    }

    const json = (await res.json().catch(() => null)) as { text?: string } | null;
    const text = json?.text?.trim() ?? "";
    if (!text) return { ok: false, reason: "no-se-entendio" };
    return { ok: true, text };
  });
