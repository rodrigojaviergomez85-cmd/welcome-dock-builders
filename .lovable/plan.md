# Prompt 1 — Reemplazar contenido del lunes (contenido exacto)

## Objetivo
Aplicar exactamente el contenido pegado por el usuario, sin inventar nada más.

## Cambios
1. Reescribir `src/content/missions/types.ts` con el contenido exacto del Prompt 1:
   - `TimeOfDay` gana `"night"`; nuevo `SkyId`.
   - Nuevos bloques: `MicCheckBlock`, `SunClockBlock`, `NameTagBlock`.
   - `TapPickBlock` acepta style `"sky"`.
   - `ShowcaseBlock` acepta `time: "auto"`, `saveAs` y `teaser`.
   - `Mission` gana `pip?: PipConfig`.
2. Reescribir `src/content/missions/monday.ts` con el contenido exacto del Prompt 1:
   - Misión "El reloj del sol" con bloques micCheck → sunClock → tapPick (sky) → nameTag → dialogue → showcase.
3. **No tocar nada más.** No crear vistas nuevas ni adaptar componentes: eso corresponde a los prompts 2 y 3.

## Consecuencia esperada (aceptada por el usuario)
La app no compilará después de este paso: los bloques `micCheck`, `sunClock` y `nameTag` no tienen vista, y `night` no tiene fondo en `BACKGROUNDS`. Es temporal y se resuelve en los prompts siguientes.

## Detalles técnicos
- Reemplazo total de los dos archivos, byte a byte con lo pegado.
- Sin ejecución de typecheck como criterio de éxito (fallará hasta el prompt 3).
