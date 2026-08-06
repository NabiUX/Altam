# Diseño — Anuncio estilo Apple para altam.io

**Fecha:** 2026-08-06
**Proyecto:** altam-videos (separado de Focus Asistente)
**Estado:** Aprobado, en implementación

## Objetivo

Crear animaciones estilo anuncio de Apple para **altam.io** (plataforma de
automatización de negocios con IA: WhatsApp CRM, ventas, inventario, RRHH…),
renderizadas a archivos de video **.mp4**.

Estrategia: empezar con **una plantilla muy pulida** y crecer el catálogo desde ahí.

## Tecnología

- **Remotion** (React + TypeScript) — se escribe el video como componentes de
  React y se exporta a .mp4 por línea de comandos. Mismo stack que Focus Asistente.
- Tipografía **Inter** vía `@remotion/google-fonts` (cercana a la SF Pro de Apple).
- Íconos **lucide-react** (los mismos que ya usa Nayeli).

## Primera plantilla — especificaciones

- **Formato:** horizontal 16:9, 1920×1080, 30fps.
- **Duración:** ~15 segundos (450 frames). Teaser corto y minimalista.
- **Tema dual:** una sola plantilla soporta **modo claro y oscuro** vía tokens de
  color (`src/theme.ts`). Se elige al renderizar (dos composiciones: `AltamAd`
  oscuro y `AltamAdLight` claro).

### Storyboard

| Tiempo | Frames | Escena | Contenido |
|--------|--------|--------|-----------|
| 0–3s | 0–100 | **Apertura** | Tagline "Tu negocio, digital y automático con IA" palabra por palabra, blur→enfoque. "IA" en color de acento. |
| 3–9s | 90–280 | **Módulos** | Kicker + 3 tarjetas con spring escalonado: WhatsApp CRM, Ventas + IA, Inventario. |
| 9–12s | 270–360 | **Unificación** | "Todo en un solo lugar" con blur→enfoque y leve escala. |
| 12–15s | 360–450 | **Cierre** | Wordmark `altam.` + tagline + pill `altam.io`. |

Las escenas se solapan levemente para crossfades suaves.

### Estilo visual (tokens de tema)

| Token | Claro | Oscuro |
|-------|-------|--------|
| Fondo | Blanco → gris muy claro | Azul profundo → casi negro |
| Texto | Azul casi negro | Blanco |
| Acento | Azul Altam (#2E6BFF) | Azul brillante (#4D82FF) con glow |
| Tarjetas | Blanco con sombra | Azul translúcido con borde tenue |

**Movimiento:** springs suaves (sin rebotes), blur→enfoque en textos, opacidad +
desplazamiento/escala lentos, y un glow de fondo que "respira" sutilmente.

## Arquitectura de archivos

```
src/
  index.ts            registerRoot
  Root.tsx            2 composiciones (AltamAd / AltamAdLight)
  AltamAd.tsx         composición principal: encadena las 4 escenas
  theme.ts            tokens claro/oscuro
  fonts.ts            carga de Inter
  components/
    Background.tsx    fondo con degradado + glow que respira
    anim.ts           helpers de fade y config de spring
  scenes/
    Opening.tsx       apertura (tagline)
    Modules.tsx       3 tarjetas de módulos
    Unify.tsx         frase de unificación
    Closing.tsx       cierre con wordmark
```

Cada escena es un componente aislado que recibe el `theme` y anima según su frame
local. Se pueden entender, ajustar y probar por separado.

## Cómo se usa

- `npm run dev` — abre Remotion Studio (preview con timeline). Cambia entre
  `AltamAd` (oscuro) y `AltamAdLight` (claro) para ver ambos temas.
- `npm run render:dark` — exporta `out/altam-ad-dark.mp4`.
- `npm run render:light` — exporta `out/altam-ad-light.mp4`.

## Pendientes / crecimiento futuro

- Reemplazar el wordmark tipográfico por el **SVG real del logo** (dejarlo en
  `/public` y cargarlo con `<Img>`).
- Ajustar textos/módulos definitivos con Nayeli.
- Siguiente fase: versión vertical 9:16 y, más adelante, animaciones web
  interactivas (objetivo original #2).
