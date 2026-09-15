# Simplificar la misión para un niño de 8 años

La pantalla actual de práctica muestra al mismo tiempo audio en español, audio en inglés, versión lenta, significado y repetición. Se reemplazará por un recorrido guiado donde el niño solo decide una cosa por vez.

## Recorrido paso a paso

1. **Escuchar en español**
   - Mostrar únicamente qué quiere decir la frase y un botón grande: “Escuchar”.
   - Al terminar el audio, habilitar “Seguir”.

2. **Escuchar en inglés**
   - Reemplazar la vista anterior por la frase en inglés con su traducción pequeña debajo.
   - Reproducir el modelo automáticamente al entrar.
   - Dejar un único botón “Escuchar otra vez”.
   - La versión lenta se usará automáticamente en la segunda escucha, sin botón separado.

3. **Repetir**
   - Mostrar un único botón principal: “Ahora decilo vos”.
   - Después de grabar, mantener la respuesta amable de la IA y ofrecer “Otra vez” o “Seguir”.
   - “Seguir sin grabar” quedará como opción secundaria y discreta, no compitiendo con la acción principal.

## Resto de la misión

- Aplicar la misma regla de una acción principal por pantalla a diálogos, mochilas y ejercicios de escucha.
- Eliminar de las escenas los botones simultáneos “Lento” y “¿Qué significa?”.
- Mantener siempre visible la traducción en español; no hará falta pedirla con otro botón.
- Conservar los controles bilingües del repaso final, porque allí el niño explora libremente y ya no está resolviendo una actividad.
- Mantener intactos grabación, validación de voz, sonidos de acierto/error y progreso guardado.

## Detalles técnicos

- Convertir la preparación oral en estados consecutivos: español → inglés → repetición.
- Dar al reproductor de audio una señal de finalización para revelar el siguiente paso sin depender de tiempos fijos.
- Simplificar `BilingualLine` para que pueda presentar una sola acción según el momento, en vez de renderizar siempre todas las ayudas.
- Revisar la misión completa en el tamaño móvil mostrado para asegurar que no haya acciones duplicadas ni contenido fuera de vista.
