# Diseño — Anuncio del CRM de WhatsApp de Altam (~60s)

**Fecha:** 2026-08-07
**Proyecto:** altam-videos
**Estado:** Aprobado, listo para plan de implementación
**Depende de:** plantilla base creada en `2026-08-06-altam-ad-design.md`

## Objetivo

Anuncio estilo Apple de **~1 minuto**, horizontal, sobre el producto real de
[altam.io/lanzamientos](https://altam.io/lanzamientos): un **CRM de WhatsApp**
para agencias de lanzamientos, expertos e infoproductores que manejan miles de
chats sin perder ninguno.

Arco híbrido con peso en el dolor: **caos (chats que se escapan) → configuras un
bot → la conversación fluye sola y escala al humano → todo queda ordenado, sin
fugas → cierre con CTA**.

Grounded en la UI **real** del CRM: se anima el paquete de componentes React
que entregó el equipo (`reference/crm/crm-tutorial-remotion/`), no mockups
inventados.

## Formato

- **16:9 horizontal, 1920×1080, 30fps.**
- **Duración:** ~60s = **1800 frames**.
- **Tema principal: oscuro** (mismo `theme.ts` del anuncio de 15s). La versión
  clara queda disponible pero es secundaria.
- **Sin voz en off:** texto en pantalla + movimiento. La música se agrega al
  `.mp4` después.
- Las escenas se solapan levemente para crossfades suaves.

## Decisión visual clave: el producto **brilla**

Los componentes del CRM son de **tema claro** (blanco, estilo WhatsApp Web) y el
anuncio es **oscuro/cinematográfico**. En vez de chocar, se aprovecha: las
pantallas del CRM aparecen como **paneles luminosos flotando** en el espacio
oscuro, dentro de un **marco sutil tipo navegador/ventana** con glow azul detrás
y sombra profunda. El producto literalmente ilumina la escena (estilo keynote de
Apple mostrando un dispositivo).

Un componente envoltorio (`ScreenFrame`) da ese marco y el glow, y recibe
cualquier pantalla del CRM como `children`.

## Sistema visual

Reusa los tokens de `src/theme.ts` (fondo azul profundo, glow que respira, texto
blanco, acento `#4D82FF`). Además:

- **Tipografía:** Inter (los componentes del CRM usan `font-sans` → se mapea a
  Inter). Números en tabular donde haya cifras.
- **Verde de WhatsApp** solo como señal puntual y de autenticidad (burbuja
  saliente `#d9fdd3`, checks, punto "en línea") — ya viene en `theme.css` del
  paquete. El azul de marca manda.
- **Movimiento:** springs suaves (`smoothSpring`), blur→enfoque en texto de las
  frases, entrada escalonada de burbujas (fade + desplazamiento), typing antes de
  cada mensaje entrante, glow de fondo que respira.

## Storyboard (frames a 30fps)

| # | Frames | Tiempo | Escena | Contenido |
|---|--------|--------|--------|-----------|
| 1 | 0–150 | 0–5s | **El caos** | Bandeja de WhatsApp desbordada: chats entrando sin parar, contadores de no leídos subiendo (2→7→15…), un chat se apaga en gris y "cae" (la fuga). Cierra con frase grande blur→enfoque: **"¿Cuántas ventas se te escapan?"** |
| 2 | 150–480 | 5–16s | **Configuras el bot** | Panel luminoso con el diálogo **"Crear bot"** → el cursor recorre las tarjetas y se resalta **"Especialista en ventas"** → transición al **wizard**, que recorre sus 5 pasos (identidad → **instrucciones/prompt** → conocimiento → escalamiento → etiquetas). Se enfoca el paso 2 (el prompt, "cómo habla"). Frase: **"Un bot que vende como tú le enseñes."** |
| 3 | 480–1200 | 16–40s | **La conversación (corazón)** | Panel luminoso con la **bandeja real**. Aparecen los 7 beats del guión: (1) template de campaña → (2) María responde → (3) **el bot** conversa → (4) "¿cómo pago?" → (5) **el bot escala** → (6) banner "escalada a un asesor" → (7) entra **Carlos (vendedor)**. Typing ~1s antes de cada entrante. El panel de contacto pasa a **IA pausada** + vendedor asignado en el beat 6. |
| 4 | 1200–1440 | 40–48s | **Todo ordenado** | Acercamiento al **panel de contacto** (`ContactPanel`) y a la lista con etiquetas: Campaña, Interesado, vendedor asignado, IA pausada, notas. Frase: **"Cada chat, ordenado y sin fugas."** |
| 5 | 1440–1800 | 48–60s | **Cierre** | Reusa/extiende el cierre actual: isotipo + wordmark `altam.` + tagline + CTA **"Diagnóstico de fugas en WhatsApp"** + pill `altam.io`. |

**El gancho de las "fugas" se paga sin métricas inventadas:** la fuga era *chats
sin responder*; la solución se ve en vivo (el bot responde siempre y escala al
humano en el momento justo). **Fuera de alcance** en esta versión: pantalla de
embudo/pipeline y panel de métricas (no existen en el React entregado; se pueden
sumar después como escena estilizada si se desea).

## Assets entregados (a reusar)

Paquete `reference/crm/crm-tutorial-remotion/` — componentes presentacionales
(todo por props, sin estado ni API):

- **Inbox:** `InboxScreen` (ensambla `ConversationList` · `ChatPanel` ·
  `ContactPanel`), `MessageBubble`, `TemplateBubble`, `TypingIndicator`,
  `EscalationChip`.
- **Bots:** `BotCreateDialog`, `BotWizard` (prop `step` 1..5).
- **UI:** `Badge`, `Avatar`, `Switch`.
- **Mock/guión:** `mock/conversation.ts` (mensajes con `beat` 1–7, lista de
  chats, etiquetas, `escalation`), `mock/contact.ts`, `mock/bots.ts`
  (`botTemplates`, `botGroups`, `exampleBot`), `mock/types.ts`.
- **Estilos:** `theme.css` (paleta de marca `--theme-50..950` azul + colores
  WhatsApp + utilidades). Se importa una vez.

Negocio de ejemplo del guión: **Boutique Aurora** (ropa, Quito); clienta **María
Torres**; bot **Aurora Bot**; vendedor **Carlos Méndez**.

## Integración técnica

Los componentes del CRM dependen de **Tailwind v4**, que el proyecto aún no
tiene. Pasos de integración:

1. Instalar `@remotion/tailwind-v4` y `tailwindcss`; activar el override de
   webpack en `remotion.config.ts` (según README oficial de `@remotion/tailwind-v4`).
2. Copiar `reference/crm/crm-tutorial-remotion/` a `src/crm/` e importar
   `theme.css` una vez (en el entry de Tailwind o en `Root.tsx`).
3. Mapear `font-sans` a **Inter** (ya cargada vía `@remotion/google-fonts`).
4. Crear los componentes nuevos de escena en `src/scenes/`:
   - `ChaosInbox.tsx` — escena 1 (bandeja WhatsApp desbordada; homenaje
     estilizado, sin clonar el logo de WhatsApp).
   - `BotSetup.tsx` — escena 2 (envuelve `BotCreateDialog` + `BotWizard` en
     `ScreenFrame`, avanza `highlightId`/`step` por frame).
   - `Conversation.tsx` — escena 3 (envuelve `InboxScreen` en `ScreenFrame`;
     revela mensajes por `beat` según el frame; typing + escalamiento + contacto
     que cambia a IA pausada).
   - `Organized.tsx` — escena 4 (acercamiento al `ContactPanel`/etiquetas).
   - Cierre: extender el `Closing.tsx` existente con la CTA de diagnóstico.
5. `ScreenFrame.tsx` en `src/components/` — marco tipo ventana + glow + sombra
   para los paneles luminosos sobre fondo oscuro.
6. Nueva composición en `Root.tsx`: **`AltamCrmAd`** (1800 frames), que encadena
   las 5 escenas con `Sequence` y leve solape. Mantener también variante clara si
   sale gratis.

## Reuso de la base existente

- `src/components/Background.tsx` (fondo + glow que respira) — reusar.
- `src/theme.ts`, `src/fonts.ts`, `src/components/anim.ts` — reusar.
- `src/scenes/Closing.tsx` — extender para el cierre con CTA.

## Salida y comandos

- Nueva composición `AltamCrmAd` (oscuro) → `out/altam-crm-ad-dark.mp4`.
- Añadir scripts `render` correspondientes en `package.json`.
- Validación por frames: `remotion still` en momentos clave de cada escena antes
  del render completo.

## Fuera de alcance / futuro

- Escena de **métricas/embudo** estilizada (pitch de "medir/detectar").
- Versión **vertical 9:16** para Reels/TikTok/Stories.
- Música/locución.
- Reemplazar el placeholder de imagen del template por el banner real de campaña.
