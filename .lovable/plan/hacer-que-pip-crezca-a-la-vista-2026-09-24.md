# Hacer que Pip crezca a la vista

## Objetivo
Convertir cada frase hablada y practicada en una celebración visible donde Pip come, crece y, al completar ocho frases, evoluciona con su nueva gorra.

## Cambios
- Guardar `totalFeeds` de por vida y calcular el tamaño de Pip con una función compartida; conservar `feeds` como avance de la misión.
- Aplicar ese tamaño en la esquina de la misión, la ayuda, el cierre, el mapa y el perfil, con límite visual apropiado en cada contexto.
- Reemplazar los puntos de la esquina por una silueta de Pip que se llena verticalmente y el contador actual.
- Crear el momento Pip a pantalla completa: frase-galleta que vuela, doble mordida, chispas, crecimiento, sonido y medidor animado.
- Extender ese momento al llegar a ocho frases: giro, destello, accesorio, confeti, mensaje de evolución y cierre manual.
- Hacer tocable al Pip de la esquina para mostrar durante dos segundos cuántas frases comió y cuánto le falta para crecer.
- Añadir el arpegio sintetizado de crecimiento y retirar la celebración breve anterior para evitar sonidos o animaciones duplicados.

## Integración
- Cada vista oral enviará además la frase objetivo ya resuelta al controlador central.
- El avance de la misión esperará a que termine o se cierre el momento Pip, evitando que cambie la pantalla detrás de la celebración.
- `pending` seguirá guardando la práctica oral, pero no alimentará a Pip ni abrirá la celebración.
- Los progresos anteriores cargarán con `totalFeeds` derivado de los datos disponibles, sin perder guardado existente.

## Validación
- Ejecutar lint y typecheck.
- Recorrer el lunes en 1280 × 800 y capturar: frase volando, crecimiento con 3/8, esquina antes/después, evolución con accesorio y tarjeta al tocar Pip.
- Confirmar que el progreso persiste y que no aparecen errores en pantalla.
