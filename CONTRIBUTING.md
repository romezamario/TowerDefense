# CONTRIBUTING.md

¡Gracias por contribuir a TowerDefense!

## Flujo de contribución

1. Crea una rama desde `main`.
2. Implementa cambios pequeños y enfocados.
3. Ejecuta validaciones locales (ver `AGENTS.md`).
4. Sincroniza documentación (obligatorio): `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `STYLEGUIDE.md`.
5. Abre PR con:
   - Qué cambia.
   - Por qué cambia.
   - Cómo fue validado.
   - Riesgos conocidos.
   - Qué archivos `.md` se actualizaron (o justificación de “revisado, sin cambios”).

## Qué incluir en cada PR

- Resumen funcional claro.
- Archivos impactados.
- Evidencia de validación (comandos y/o checklist manual).
- Capturas de pantalla si hay cambios visuales.
- Evidencia de actualización documental asociada al cambio de código.

## Criterios de calidad mínimos

- Sin errores de sintaxis JS (`node --check`, incluyendo `js/ads.js` cuando aplique).
- Sin errores de consola al cargar el juego.
- Sin cambios colaterales no relacionados.
- Código legible y consistente con `STYLEGUIDE.md`.
- Documentación alineada con el estado real del código.

## Política de aprendizaje del repositorio

- Cada cambio debe dejar contexto para futuros colaboradores y agentes.
- La documentación no es opcional: forma parte del “Definition of Done”.
- Si cambia una práctica recurrente, debe reflejarse en los `.md` correspondientes dentro del mismo PR.

## Issues y propuestas

- Reporta bugs con pasos para reproducir.
- Para cambios de diseño/balance, justifica objetivo y trade-offs.
- Si el cambio es grande, abrir discusión antes de implementar.

## Nota para cambios de monetización

- Si se modifica el balance de anuncios (cooldown, límite o recompensa), documentar el motivo y el impacto esperado en el PR.
