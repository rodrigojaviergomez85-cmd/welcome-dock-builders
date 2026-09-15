# Hacer que la práctica oral enseñe de verdad

La pantalla actual exige que el niño relacione por sí solo “Your turn!”, “En inglés se dice”, una frase larga, su traducción y el botón de grabar. Para quien todavía no sabe inglés, eso parece una prueba antes de haber practicado. La experiencia se convertirá en un eco guiado: el personaje enseña una parte por vez, el niño la imita y recién después dice la frase completa.

## Recorrido de aprendizaje

1. **Entender la intención**
   - El personaje habla únicamente en español: “Vas a decir: Hola, me llamo ddf. Estoy bien”.
   - Se muestra una sola acción grande: **Escuchar**.
   - Al terminar, aparece **Ya entendí**; no se mezclará todavía la frase inglesa.

2. **Escuchar por partes**
   - Separar frases largas en unidades que el niño pueda retener, por ejemplo:
     - `Hello!` — `¡Hola!`
     - `My name is ddf.` — `Me llamo ddf.`
     - `I am fine.` — `Estoy bien.`
   - Reproducir y resaltar una parte a la vez, con su significado pegado debajo.
   - La instrucción será breve y siempre en español: **Escuchá esta parte**.

3. **Hacer eco**
   - Después de cada fragmento, mostrar **Ahora repetí** con un único botón de micrófono.
   - La escucha de la IA dará una respuesta corta y amable: **¡Te escuché!** o **Probemos otra vez**.
   - Un intento imperfecto no bloqueará el avance; el objetivo sigue siendo animarse a hablar.

4. **Decir la frase completa**
   - Reunir los fragmentos ya practicados en una sola frase grande.
   - Reemplazar el globo en inglés “Your turn!” por **¡Ahora completa!**.
   - Mostrar un único micrófono circular con **Tocá y hablá**, siguiendo la dirección “Immersive echo tutor”.
   - Mantener la aceptación flexible de cualquier nombre y las variantes válidas ya configuradas.

5. **Cerrar con una devolución comprensible**
   - Si se entendió: celebración breve, repetir lo que la IA oyó y ofrecer **Seguir**.
   - Si no se entendió: explicar en español qué parte conviene repetir y ofrecer **Otra vez** como acción principal; **Seguir** queda discreto.
   - No mostrar puntajes de pronunciación ni mensajes que parezcan castigo.

## Interfaz elegida

- Mantener la escena tropical y el personaje como guía, reduciendo su protagonismo mientras aparece la tarea.
- Usar la paleta elegida: turquesa, amarillo, coral y fondo cálido; todos como tokens del diseño.
- Usar Outfit en títulos y Figtree en textos, con frases grandes y sin párrafos largos.
- Mostrar un indicador simple de tres momentos: **Escuchá → Practicá → Decilo**; indica progreso, no funciona como menú.
- Reservar una zona fija al alcance del pulgar para una sola acción principal.
- Evitar controles simultáneos, traducciones alejadas, palabras técnicas y duplicación de instrucciones.
- Resaltar visualmente el fragmento que suena y usar una pulsación suave únicamente mientras el micrófono está activo.

## Aplicación en la misión del lunes

- Aplicar este recorrido a cada respuesta oral de los diálogos del lunes.
- Mantener las actividades de elegir personaje o mochila como juegos de selección, pero simplificar sus instrucciones a una pregunta en español y una acción de avance.
- Conservar grabación, validación con IA, sonidos de acierto/reintento y progreso guardado.
- Conservar el repaso final bilingüe como exploración libre, fuera del recorrido guiado.

## Verificación

- Probar la misión completa en el tamaño móvil actual de 394 × 702.
- Confirmar que cada estado tenga una sola acción principal visible y que la frase/traducción no se corte.
- Confirmar el orden real de los audios, la grabación de cada fragmento y de la frase completa, la aceptación de nombres distintos y el avance aunque la IA no entienda un intento.
- Revisar que no haya reproducciones dobles, pantallas sin salida ni errores durante toda la misión.

## Detalles técnicos

- Ampliar el flujo oral con estados explícitos para intención, fragmento escuchado, eco del fragmento, frase completa y resultado.
- Derivar fragmentos bilingües desde el contenido de cada turno para no duplicar textos en la interfaz.
- Reutilizar la grabación y validación existentes, enviando a cada intento el objetivo correspondiente: fragmento o frase completa.
- Ajustar los componentes visuales y los tokens globales a la dirección elegida sin alterar el guardado ni la estructura de progreso de la misión.
