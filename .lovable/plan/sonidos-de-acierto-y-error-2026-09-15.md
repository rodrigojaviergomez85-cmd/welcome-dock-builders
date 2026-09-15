# Sonidos de acierto y error

## Qué vas a ver y escuchar

- **Respuesta correcta**: un sonido alegre corto (tipo “¡ding-ding!” ascendente) apenas el niño acierta en las rondas de escuchar y elegir, y al unir mochilas correctamente.
- **Respuesta incorrecta**: un sonido suave de “probá otra vez” (tono descendente, no intimidante), sin palabras de castigo.
- **Al hablar**: “¡Te escuché!” suena el tono de acierto; si no se entendió, suena el tono suave de reintento.
- **Al terminar la misión**: una mini fanfarria de celebración junto a la etiqueta final.

## Cómo se implementa

- Nuevo módulo `src/lib/feedback-sounds.ts` con tonos sintetizados con Web Audio (sin archivos, sin descargas, funciona sin internet): `playSuccess()`, `playTryAgain()`, `playFanfare()`. Volumen moderado y apto para auriculares.
- Se dispara en:
  - `ListenPickView` y `BagMatchView`: acierto/error al elegir.
  - `RecordTurn`: “heard” (acierto) / “unclear” (reintento suave).
  - `MissionComplete`: fanfarria al mostrar la recompensa (solo la primera vez que aparece, no en cada render).
- Respeta el audio de los personajes: el tono suena después o encima sin cortar la voz que esté reproduciéndose (canal separado, no reemplaza `audio.ts`).
- Si el niño no interactuó todavía con la página (bloqueo de autoplay del navegador), el sonido simplemente no suena; nada se rompe.

## Verificación

- Recorrido con Playwright: acertar y errar en escucha y mochilas, y confirmar que se invocan los sonidos (sin errores de consola) en cada caso.
- `bunx tsgo --noEmit` limpio y build OK.

## Fuera de alcance (por ahora)

- Efectos de sonido grabados/orquestados definitivos: si más adelante querés audios de producción, se reemplazan estas funciones por archivos sin tocar el resto del juego.
- Control de volumen para adultos: se puede agregar después en el panel de adultos si lo pedís.
