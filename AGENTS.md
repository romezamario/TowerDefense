# AGENTS.md

Este archivo documenta el contexto operativo para agentes automáticos (por ejemplo, Codex) y para cualquier persona que colabore en el repositorio.

## 1) Propósito general del proyecto

**TowerDefense** es un juego de defensa de torres en navegador (HTML + JavaScript vanilla) con foco en:

- Gestión de oleadas de enemigos.
- Colocación y mejora de torres.
- Balance de dificultad mediante constantes y estado compartido.
- UI simple y desacoplada de la lógica principal de juego.

La base actual es una app web estática sin backend obligatorio.

## 2) Cómo ejecutar el proyecto localmente

No hay, por ahora, `package.json` ni scripts de npm/pnpm.

### Opción recomendada (servidor estático local)

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

### Opción alternativa

```bash
npx serve .
```

> Evitar abrir `index.html` directamente con `file://` cuando se necesite comportamiento consistente de navegador.

## 3) Comandos de prueba y validación

Como no existe un runner de tests formal, usar estas validaciones mínimas antes de mergear:

```bash
# Validación sintáctica de JS
node --check js/constants.js
node --check js/state.js
node --check js/entities.js
node --check js/upgrades.js
node --check js/game.js
node --check js/ui.js
node --check js/main.js
node --check js/ads.js
```

Checklist manual recomendada:

1. El juego carga sin errores en consola.
2. Se puede iniciar una partida.
3. Las oleadas avanzan.
4. Las torres disparan correctamente.
5. Las mejoras impactan estadísticas/UI como corresponde.

## 4) Convenciones de estilo y buenas prácticas

- Mantener JavaScript en módulos simples dentro de `js/`.
- Evitar acoplamiento fuerte entre UI y lógica de simulación.
- Preferir funciones pequeñas y con responsabilidades claras.
- Reutilizar constantes de `js/constants.js`; no “hardcodear” valores duplicados.
- Mantener nombres descriptivos en español o inglés, pero ser consistente dentro del archivo.
- No introducir frameworks grandes sin acuerdo previo (el proyecto hoy es vanilla).
- Si se corrige balance/jugabilidad, documentar el motivo en el PR.

## 5) Dependencias críticas y configuración del entorno

- Navegador moderno (Chrome/Firefox/Edge recientes).
- Node.js >= 18 para usar `node --check` y herramientas auxiliares.
- Python 3 opcional para levantar servidor estático.

Actualmente no hay variables de entorno obligatorias ni servicios externos.

## 6) Mantenimiento obligatorio y aprendizaje continuo

**Este AGENTS.md es un documento vivo y de actualización obligatoria en cada modificación de código.**

Reglas obligatorias por cada PR/commit que modifique código (`.js`, `index.html` u otra lógica):

1. Revisar si cambian estructura, flujo, comandos o convenciones.
2. Actualizar `AGENTS.md` en la misma rama cuando haya cualquier cambio relevante.
3. Registrar de forma explícita _qué cambió_ y _cómo afecta_ ejecución, validación o mantenimiento.
4. No cerrar PR si la documentación quedó desalineada con el comportamiento real del código.

Objetivo de “aprendizaje” del repositorio:

- Cada cambio de código debe dejar trazabilidad documental para que agentes y personas “aprendan” el estado actual del proyecto.
- La documentación debe capturar nuevos patrones recurrentes (arquitectura, pruebas, estilo, herramientas, decisiones técnicas).

## 7) Sincronización obligatoria de documentación adicional

Además de `AGENTS.md`, se debe evaluar y actualizar en cada cambio de código:

- `README.md`: ejecución, estructura y uso real del proyecto.
- `CONTRIBUTING.md`: flujo de trabajo y checklist de PR vigente.
- `STYLEGUIDE.md`: convenciones y buenas prácticas activas.

Si alguno no requiere cambios, dejar constancia en el PR: “revisado, sin cambios”.

## 8) Checklist de documentación por cambio de código

Antes de mergear, confirmar:

- [ ] `AGENTS.md` actualizado o explícitamente validado sin cambios.
- [ ] `README.md` actualizado o explícitamente validado sin cambios.
- [ ] `CONTRIBUTING.md` actualizado o explícitamente validado sin cambios.
- [ ] `STYLEGUIDE.md` actualizado o explícitamente validado sin cambios.
- [ ] El PR describe cómo estos archivos reflejan el estado más reciente del código.


## 9) Registro de cambios recientes (aprendizaje)

- Se agregó un MVP de monetización con anuncio recompensado simulado en `js/ads.js` (sin dependencia de proveedor real).
- La UI incorpora botón de recompensa y estado del anuncio en el sidebar del juego.
- Reglas actuales: recompensa en créditos por oleada, cooldown entre visualizaciones y límite por partida.
- Impacto de mantenimiento: futuros cambios de SDK deben implementarse en `js/ads.js` para evitar acoplar la lógica de juego.

- UI de anuncio recompensado movida a overlay en la esquina inferior derecha del canvas para evitar ocupar espacio del sidebar.
- Se añadió estado global `isPaused` y control de pausa/reanudación del loop durante el flujo del anuncio recompensado.
