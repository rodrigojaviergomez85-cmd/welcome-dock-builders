# Quitar la voz de Pip

Pip deja de repetir la frase en voz alta después de que el niño habla.

## Qué cambia
- En el momento Pip (galleta, mordidas, crecimiento) ya no suena la vocecita ni aparece la burbuja "Pip: frase". El momento dura lo mismo que la animación y se cierra solo.
- En la barriga de palabras, la lista de frases queda solo como texto, sin botón de sonido.
- Todo lo demás sigue igual: Pip come en cada frase (también con "Lo dije"), crece, la vara sube, las grabaciones del niño se siguen guardando para el panel del adulto.

## Detalles técnicos
- `PipFeedMoment.tsx`: eliminar la llamada a `playPipVoice` y la burbuja; cerrar tras el mínimo de la animación.
- `PipBelly.tsx`: reemplazar el botón por un `<li>` de texto.
- `MissionPlayer.tsx`: dejar de pasar `voice`; mantener `takeLastTake()` para `learned.recordingKey`.
- `pip-voice.ts`: eliminar `playPipVoice`/`stopPipVoice` si quedan sin uso; conservar `setLastTake`/`takeLastTake`.
- Verificar typecheck/lint y un momento Pip en tablet 1280×800 sin audio de Pip.
