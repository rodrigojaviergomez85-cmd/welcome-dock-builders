# Simplificar la pantalla final de la misión

La pantalla de cierre hoy muestra mucho texto para adultos (estadísticas, aclaraciones) y una lista larga de nueve frases con dos botones cada una. Para un niño de 8 a 12 años es demasiado.

## Cómo quedará

1. **Celebración corta**: avatar, "¡Rescate completado!", las 4 mochilas rescatadas y la etiqueta con su nombre. Nada más en la primera pantalla.
2. **Repaso como tarjetas, de a una**: una sola frase grande a la vez, con su significado en español debajo y un botón grande para escuchar. El botón reproduce primero el español y luego el inglés, sin que el niño tenga que elegir.
3. **Avance simple**: un botón "Siguiente" y un contador visual de tarjetas (por ejemplo 3 de 9). Al final, "¡Listo!".
4. **Dos salidas claras al terminar**: "Volver al mapa" y "Jugar otra vez".
5. **Los datos para adultos salen de la vista del niño**: intentos, ayudas, frases dichas y la aclaración de que no es una certificación pasan al panel de adulto.
6. El nombre se muestra tal como el niño lo escribió, pero con la primera letra en mayúscula y el resto normal, para evitar cosas como "ROdrigo".

## Detalle técnico

- `src/components/game/MissionComplete.tsx`: dividir en dos fases (`celebración` y `repaso`), reemplazar la lista `REVIEW_PHRASES` por una tarjeta con índice, y encadenar `playClip(esClip)` seguido de `playClip(slowClip ?? clip en inglés)` en un único botón.
- Añadir un helper de normalización del alias (solo presentación, no cambia el perfil guardado).
- Mover el bloque de estadísticas y el texto de "no es una certificación" a `src/routes/adulto.tsx`, leyendo el mismo progreso de `kids-platform-progress-v1`.
- Sin cambios de contenido, audio, grabación ni progreso guardado.
- Verificación en móvil 394x702 recorriendo celebración, las tarjetas y las dos salidas.
