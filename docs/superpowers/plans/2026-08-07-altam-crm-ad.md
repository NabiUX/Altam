# Anuncio del CRM de WhatsApp de Altam (~60s) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir en Remotion un anuncio horizontal de ~60s (1920×1080, 30fps, tema oscuro) del CRM de WhatsApp de Altam, animando los componentes React reales del paquete `crm-tutorial-remotion`.

**Architecture:** Nueva composición `AltamCrmAd` (1800 frames) que encadena 5 escenas con `Sequence` y leve solape, sobre el `Background` oscuro existente. Las pantallas del CRM (tema claro) se muestran como paneles luminosos flotantes vía un envoltorio `ScreenFrame`. Las escenas custom (caos, cierre) usan estilos inline; las de producto (bot, conversación, ordenado) envuelven los componentes vendored del CRM (Tailwind v4).

**Tech Stack:** Remotion 4, React 19, TypeScript, `@remotion/google-fonts` (Inter), `lucide-react`, **Tailwind v4** vía `@remotion/tailwind-v4`.

## Global Constraints

- **Formato:** 1920×1080, 30fps, horizontal. Composición `AltamCrmAd` = **1800 frames** (60s).
- **Tema principal:** oscuro (tokens de `src/theme.ts`). No inventar colores nuevos de marca; acento `#4D82FF`.
- **Sin voz en off ni música** (se añade al mp4 después). Sin `Math.random()`/`Date.now()` en componentes (rompen el render determinista) — usar `useCurrentFrame()`.
- **Grounded en la UI real:** animar los componentes de `crm-tutorial-remotion` por props; no reescribir su markup salvo la edición puntual de `ChatPanel` (Task 6).
- **Íconos:** lucide-react (nunca emojis en UI propia; los emojis que ya vienen en los textos del guión mock se respetan).
- **Negocio del guión:** Boutique Aurora · clienta María Torres · bot "Aurora Bot" · vendedor "Carlos Méndez" (ya en los mocks).
- **Verificación (dominio video):** cada tarea se valida compilando y renderizando un **still** en un frame representativo con `npx remotion still ...`, seguido de revisión visual del PNG. No hay runner de unit tests en el proyecto; la única lógica pura (mapeo de beats) se valida con un script Node de asserts. Esta es la estrategia de test apropiada para trabajo visual en Remotion.

---

## File Structure

**Nuevos:**
- `src/crm/…` — copia de `reference/crm/crm-tutorial-remotion/` (componentes + mocks + `theme.css`).
- `src/tailwind.css` — entry de Tailwind v4 (`@import "tailwindcss";` + `@import "./crm/theme.css";`).
- `src/components/ScreenFrame.tsx` — marco luminoso tipo ventana para paneles del CRM.
- `src/scenes/ChaosInbox.tsx` — escena 1 (bandeja WhatsApp desbordada, custom).
- `src/scenes/BotSetup.tsx` — escena 2 (diálogo + wizard del bot).
- `src/scenes/conversationBeats.ts` — timings + helper puro de visibilidad por beat.
- `src/scenes/Conversation.tsx` — escena 3 (bandeja real, 7 beats).
- `src/scenes/Organized.tsx` — escena 4 (acercamiento al panel de contacto).
- `src/scenes/CrmClosing.tsx` — escena 5 (cierre con CTA de diagnóstico).
- `src/AltamCrmAd.tsx` — composición: `Background` + 5 `Sequence`.
- `scripts/check-beats.mjs` — asserts de la lógica de beats.

**Modificados:**
- `remotion.config.ts` — override de webpack para Tailwind.
- `src/Root.tsx` — registrar `AltamCrmAd` (y variante clara si sale gratis).
- `src/index.ts` — importar `./tailwind.css`.
- `src/crm/inbox/ChatPanel.tsx` — prop `escalationAfterId` para intercalar el banner.
- `package.json` — script `render:crm` + deps de Tailwind.

---

### Task 1: Activar Tailwind v4 e importar el CRM a `src/crm/`

Prueba la integración renderizando una pantalla del CRM con estilos aplicados.

**Files:**
- Create: `src/crm/` (copia de `reference/crm/crm-tutorial-remotion/`)
- Create: `src/tailwind.css`
- Modify: `remotion.config.ts`
- Modify: `src/index.ts`
- Modify: `package.json` (deps)

**Interfaces:**
- Produces: componentes del CRM importables desde `../crm/inbox/InboxScreen`, `../crm/bots/BotWizard`, etc.; mocks desde `../crm/mock/*`. Clases Tailwind + utilidades `.bg-theme-*` funcionando.

- [ ] **Step 1: Instalar dependencias de Tailwind**

```bash
cd /home/nabi/git/altam-videos
npm i -D @remotion/tailwind-v4 tailwindcss
```

- [ ] **Step 2: Copiar los componentes del CRM a `src/crm/`**

```bash
cp -R reference/crm/crm-tutorial-remotion src/crm
```

- [ ] **Step 3: Activar Tailwind en el bundler de Remotion**

Editar `remotion.config.ts` (según README de `@remotion/tailwind-v4`), añadiendo:

```ts
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
Config.overrideWebpackConfig(enableTailwind);
```

- [ ] **Step 4: Crear el entry de Tailwind `src/tailwind.css`**

```css
@import "tailwindcss";
@import "./crm/theme.css";
```

- [ ] **Step 5: Importar el CSS una sola vez**

En `src/index.ts`, antes de `registerRoot`:

```ts
import "./tailwind.css";
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

- [ ] **Step 6: Composición temporal de prueba**

Añadir en `src/Root.tsx` una composición temporal que renderice `InboxScreen` a pantalla completa (se elimina en Task 3):

```tsx
import { AbsoluteFill } from "remotion";
import { InboxScreen } from "./crm/inbox/InboxScreen";
import { conversationList, activeConversation, messages, escalation } from "./crm/mock/conversation";
import { contact } from "./crm/mock/contact";

const TWCheck: React.FC = () => (
  <AbsoluteFill style={{ width: 1920, height: 1080 }}>
    <InboxScreen
      conversations={conversationList}
      activeConversation={activeConversation}
      contact={contact}
      messages={messages}
      showEscalation
      escalation={escalation}
      typing={null}
    />
  </AbsoluteFill>
);
// <Composition id="TWCheck" component={TWCheck} durationInFrames={30} fps={30} width={1920} height={1080} />
```

- [ ] **Step 7: Renderizar still y verificar que Tailwind aplica**

Run: `npx remotion still TWCheck out/_tw.png --frame=0`
Expected: PASS. El PNG muestra la bandeja de 3 columnas con estilos (bordes, colores de marca azules, burbujas). Si sale sin estilos (texto plano apilado), Tailwind no se activó → revisar Steps 3–5.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(crm-ad): activar Tailwind v4 e importar componentes del CRM"
```

---

### Task 2: `ScreenFrame` — marco luminoso para paneles del CRM

**Files:**
- Create: `src/components/ScreenFrame.tsx`
- Modify: `src/Root.tsx` (composición temporal de prueba, reutiliza `TWCheck`)

**Interfaces:**
- Consumes: `Theme` de `../theme`.
- Produces: `ScreenFrame: React.FC<{ theme: Theme; progress?: number; children: React.ReactNode }>`. Renderiza sus children (una pantalla del CRM diseñada a 1920×1080) escalados dentro de un marco tipo ventana de 1560×920 centrado, con barra de navegador, glow azul y sombra. `progress` (0→1) anima entrada (opacidad + leve escala + blur→enfoque).

- [ ] **Step 1: Implementar `ScreenFrame`**

```tsx
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Theme } from "../theme";

const FRAME_W = 1560;
const CHROME_H = 44;
const SCREEN_W = 1920; // tamaño nativo de las pantallas del CRM
const SCREEN_H = 1080;
const SCALE = FRAME_W / SCREEN_W; // ~0.8125
const SCREEN_AREA_H = SCREEN_H * SCALE; // ~877

export const ScreenFrame: React.FC<{
  theme: Theme;
  progress?: number;
  children: React.ReactNode;
}> = ({ theme, progress = 1, children }) => {
  const opacity = progress;
  const scale = interpolate(progress, [0, 1], [0.94, 1]);
  const blur = interpolate(progress, [0, 1], [12, 0]);
  const y = interpolate(progress, [0, 1], [24, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: FRAME_W,
          borderRadius: 20,
          overflow: "hidden",
          background: "#ffffff",
          boxShadow: `0 60px 140px rgba(0,0,0,0.55), 0 0 120px ${theme.accentGlow}`,
          border: `1px solid ${theme.cardBorder}`,
          opacity,
          filter: `blur(${blur}px)`,
          transform: `translateY(${y}px) scale(${scale})`,
        }}
      >
        {/* Barra tipo navegador */}
        <div
          style={{
            height: CHROME_H,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 16px",
            background: "#f3f4f6",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} style={{ width: 12, height: 12, borderRadius: 999, background: c }} />
          ))}
          <span
            style={{
              marginLeft: 16,
              fontSize: 13,
              color: "#6b7280",
              background: "#fff",
              borderRadius: 8,
              padding: "3px 14px",
            }}
          >
            app.altam.io
          </span>
        </div>
        {/* Área de pantalla: children a 1920×1080 escalados */}
        <div style={{ width: FRAME_W, height: SCREEN_AREA_H, overflow: "hidden" }}>
          <div
            style={{
              width: SCREEN_W,
              height: SCREEN_H,
              transform: `scale(${SCALE})`,
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Probar `ScreenFrame` con `TWCheck`**

Envolver el `InboxScreen` de `TWCheck` en `<ScreenFrame theme={getTheme("dark")} progress={1}>` con `<Background theme={getTheme("dark")} />` detrás.

- [ ] **Step 3: Renderizar still y verificar el panel luminoso**

Run: `npx remotion still TWCheck out/_frame.png --frame=0`
Expected: PASS. La bandeja aparece como panel blanco con barra de navegador, glow azul y sombra, centrado sobre el fondo oscuro.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(crm-ad): ScreenFrame (marco luminoso para pantallas del CRM)"
```

---

### Task 3: Composición `AltamCrmAd` + esqueleto de escenas

**Files:**
- Create: `src/AltamCrmAd.tsx`
- Modify: `src/Root.tsx` (registrar `AltamCrmAd`; eliminar `TWCheck`)

**Interfaces:**
- Consumes: `Background`, `getTheme`, `fontFamily`.
- Produces: composición `AltamCrmAd` de 1800 frames. Importa 5 escenas (`ChaosInbox`, `BotSetup`, `Conversation`, `Organized`, `CrmClosing`) que en esta tarea son stubs mínimos (un `<AbsoluteFill>` con el nombre de la escena) para validar el encadenado y los solapes.

- [ ] **Step 1: Crear stubs de las 5 escenas**

Crear `src/scenes/{ChaosInbox,BotSetup,Conversation,Organized,CrmClosing}.tsx`, cada uno:

```tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { Theme } from "../theme";
export const ChaosInbox: React.FC<{ theme: Theme }> = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", color: "#fff", fontSize: 60 }}>
    ChaosInbox
  </AbsoluteFill>
);
```

(idéntico patrón por archivo, cambiando el nombre del componente y el texto).

- [ ] **Step 2: Crear la composición `AltamCrmAd`**

```tsx
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { getTheme, ThemeName } from "./theme";
import { fontFamily } from "./fonts";
import { Background } from "./components/Background";
import { ChaosInbox } from "./scenes/ChaosInbox";
import { BotSetup } from "./scenes/BotSetup";
import { Conversation } from "./scenes/Conversation";
import { Organized } from "./scenes/Organized";
import { CrmClosing } from "./scenes/CrmClosing";

export const AltamCrmAd: React.FC<{ theme: ThemeName }> = ({ theme }) => {
  const t = getTheme(theme);
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: t.bgTo }}>
      <Background theme={t} />
      <Sequence from={0} durationInFrames={160}><ChaosInbox theme={t} /></Sequence>
      <Sequence from={150} durationInFrames={340}><BotSetup theme={t} /></Sequence>
      <Sequence from={480} durationInFrames={730}><Conversation theme={t} /></Sequence>
      <Sequence from={1200} durationInFrames={250}><Organized theme={t} /></Sequence>
      <Sequence from={1440} durationInFrames={360}><CrmClosing theme={t} /></Sequence>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Registrar la composición y quitar `TWCheck`**

En `src/Root.tsx`, eliminar `TWCheck` y añadir:

```tsx
import { AltamCrmAd } from "./AltamCrmAd";
// …
<Composition
  id="AltamCrmAd"
  component={AltamCrmAd}
  durationInFrames={1800}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{ theme: "dark" as const }}
/>
```

- [ ] **Step 4: Renderizar stills en cada escena**

Run: `npx remotion still AltamCrmAd out/_s.png --frame=60` (y repetir con `--frame=300`, `--frame=800`, `--frame=1300`, `--frame=1600`)
Expected: PASS en los 5. Cada frame muestra el nombre de su escena sobre el fondo oscuro.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(crm-ad): composición AltamCrmAd + esqueleto de escenas"
```

---

### Task 4: Escena `ChaosInbox` (0–5s)

Bandeja de WhatsApp desbordada: filas entrando en cascada, no leídos subiendo, una fila se apaga en gris (la fuga), y frase final.

**Files:**
- Modify: `src/scenes/ChaosInbox.tsx`

**Interfaces:**
- Consumes: `Theme`, `smoothSpring`, `useCurrentFrame`, `spring`, `interpolate`.
- Produces: `ChaosInbox: React.FC<{ theme: Theme }>` (reemplaza el stub).

- [ ] **Step 1: Implementar `ChaosInbox`**

```tsx
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Theme } from "../theme";
import { smoothSpring } from "../components/anim";

// 8 chats ficticios que entran en avalancha. El índice 3 es "la fuga".
const ROWS = [
  { name: "Cliente 1", msg: "Hola, me interesa…" },
  { name: "Cliente 2", msg: "¿Sigue disponible?" },
  { name: "Cliente 3", msg: "¿Cómo pago?" },
  { name: "Cliente 4", msg: "¿Hacen envíos?" },
  { name: "Cliente 5", msg: "Quiero uno 🙌" },
  { name: "Cliente 6", msg: "¿Precio?" },
  { name: "Cliente 7", msg: "Info por favor" },
  { name: "Cliente 8", msg: "Hola!!" },
];
const LEAK = 3;

export const ChaosInbox: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = spring({ frame, fps, config: smoothSpring });
  const line = interpolate(frame, [95, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineBlur = interpolate(line, [0, 1], [14, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 40 }}>
      <div style={{ width: 720, opacity: interpolate(frame, [92, 120], [1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        {ROWS.map((r, i) => {
          const enter = spring({ frame: frame - i * 7, fps, config: smoothSpring });
          const isLeak = i === LEAK;
          const leak = isLeak ? spring({ frame: frame - 60, fps, config: smoothSpring }) : 0;
          const unread = Math.min(15, Math.floor(interpolate(frame - i * 7, [0, 60], [1, 15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 18px", marginBottom: 8, borderRadius: 14,
              background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
              opacity: enter * (isLeak ? 1 - leak * 0.85 : 1),
              transform: `translateX(${interpolate(enter, [0, 1], [40, 0])}px) translateY(${isLeak ? leak * 40 : 0}px)`,
              filter: isLeak ? `grayscale(${leak})` : "none",
            }}>
              <span style={{ width: 44, height: 44, borderRadius: 999, background: theme.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", color: theme.accent, fontWeight: 700 }}>{r.name[8]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: theme.text, fontWeight: 600, fontSize: 20 }}>{r.name}</div>
                <div style={{ color: theme.textMuted, fontSize: 16 }}>{r.msg}</div>
              </div>
              <span style={{ background: "#25D366", color: "#fff", borderRadius: 999, minWidth: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, opacity: isLeak ? 1 - leak : 1 }}>{unread}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", fontSize: 76, fontWeight: 800, letterSpacing: "-0.03em", color: theme.text, textAlign: "center", opacity: line, filter: `blur(${lineBlur}px)` }}>
        ¿Cuántas ventas<br />se te escapan?
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Renderizar stills (avalancha y frase)**

Run: `npx remotion still AltamCrmAd out/_chaos1.png --frame=55` y `--frame=145`
Expected: PASS. A frame 55 se ven filas entrando con contadores altos y la fila 4 apagándose; a 145 domina la frase "¿Cuántas ventas se te escapan?".

- [ ] **Step 3: Revisión visual**

Leer ambos PNG. Ajustar tiempos si la fuga o la frase se sienten apuradas.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(crm-ad): escena 1 — bandeja de WhatsApp desbordada"
```

---

### Task 5: Escena `BotSetup` (5–16s)

Diálogo "Crear bot" → resalta "Especialista en ventas" → wizard recorre 5 pasos. Frase de cierre de escena.

**Files:**
- Modify: `src/scenes/BotSetup.tsx`

**Interfaces:**
- Consumes: `ScreenFrame`, `BotCreateDialog`, `BotWizard`, mocks `botTemplates`/`botGroups`/`exampleBot`.
- Produces: `BotSetup: React.FC<{ theme: Theme }>`.

- [ ] **Step 1: Implementar `BotSetup`**

Duración local ~340 frames. Sub-tiempos: 0–95 diálogo (resalta "ventas" desde f≈45); 95–320 wizard (paso = 1..5, ~45 frames c/u); frase superpuesta desde f≈250.

```tsx
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Theme } from "../theme";
import { smoothSpring } from "../components/anim";
import { ScreenFrame } from "../components/ScreenFrame";
import { BotCreateDialog } from "../crm/bots/BotCreateDialog";
import { BotWizard } from "../crm/bots/BotWizard";
import { botTemplates, botGroups, exampleBot } from "../crm/mock/bots";

export const BotSetup: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: smoothSpring });

  const showWizard = frame >= 95;
  const step = Math.min(5, Math.floor((frame - 95) / 45) + 1);
  const highlightId = frame >= 45 ? "ventas" : undefined;

  const line = interpolate(frame, [250, 285], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <ScreenFrame theme={theme} progress={progress}>
        {showWizard ? (
          <div className="h-full w-full bg-gray-50">
            <BotWizard config={exampleBot} step={step} />
          </div>
        ) : (
          <BotCreateDialog templates={botTemplates} groups={botGroups} highlightId={highlightId} />
        )}
      </ScreenFrame>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 70 }}>
        <div style={{ fontSize: 46, fontWeight: 700, color: theme.text, opacity: line, textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
          Un bot que vende como tú le enseñes.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Renderizar stills (diálogo y wizard)**

Run: `npx remotion still AltamCrmAd out/_bot1.png --frame=540` (diálogo, resalta ventas), `--frame=700` (wizard paso ~2, prompt), `--frame=770` (frase visible)
Expected: PASS. Diálogo con tarjeta "Especialista en ventas" resaltada en azul; wizard mostrando el prompt del sistema; frase visible.

- [ ] **Step 3: Revisión visual** — leer los PNG; verificar que el `step` cae en el paso deseado a cada tiempo.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(crm-ad): escena 2 — configuración del bot (diálogo + wizard)"
```

---

### Task 6: Helper de beats + edición de `ChatPanel` + escena `Conversation` (16–40s)

El corazón: la bandeja real con los 7 beats. Incluye la edición para intercalar el banner de escalamiento antes del mensaje del vendedor.

**Files:**
- Create: `src/scenes/conversationBeats.ts`
- Create: `scripts/check-beats.mjs`
- Modify: `src/crm/inbox/ChatPanel.tsx`
- Modify: `src/crm/inbox/InboxScreen.tsx`
- Modify: `src/scenes/Conversation.tsx`

**Interfaces:**
- Produces: `BEAT_AT: Record<number, number>`; `visibleMessages(messages, frame)`; `typingAt(frame)`; `Conversation: React.FC<{ theme: Theme }>`. `ChatPanel`/`InboxScreen` aceptan `escalationAfterId?: string`.

- [ ] **Step 1: Escribir el test de la lógica de beats (falla primero)**

`scripts/check-beats.mjs`:

```js
import { BEAT_AT, visibleMessages, typingAt } from "../src/scenes/conversationBeats.mjs";
import assert from "node:assert";

const msgs = [{ beat: 1 }, { beat: 3 }, { beat: 7 }];
assert.equal(visibleMessages(msgs, 0).length, 0, "nada antes del beat 1");
assert.equal(visibleMessages(msgs, BEAT_AT[1]).length, 1, "solo beat 1 al inicio");
assert.equal(visibleMessages(msgs, BEAT_AT[7]).length, 3, "todos al final");
assert.equal(typingAt(BEAT_AT[2] - 10), "left", "typing antes del entrante");
assert.equal(typingAt(BEAT_AT[3] + 5), null, "sin typing tras el bot");
console.log("beats OK");
```

- [ ] **Step 2: Ejecutar el test y verlo fallar**

Run: `node scripts/check-beats.mjs`
Expected: FAIL (módulo `conversationBeats.mjs` no existe).

- [ ] **Step 3: Implementar `conversationBeats.ts`**

Frames LOCALES a la escena (dura ~730). `.mjs` gemelo solo para el test:

```ts
// src/scenes/conversationBeats.ts
export const BEAT_AT: Record<number, number> = { 1: 20, 2: 130, 3: 230, 4: 350, 5: 460, 6: 545, 7: 620 };
const TYPING_LEAD = 30; // frames de "escribiendo…" antes de cada mensaje entrante

export function visibleMessages<T extends { beat: number }>(messages: T[], frame: number): T[] {
  return messages.filter((m) => frame >= BEAT_AT[m.beat]);
}
export function typingAt(frame: number): "left" | null {
  const inbound = [2, 4];
  return inbound.some((b) => frame >= BEAT_AT[b] - TYPING_LEAD && frame < BEAT_AT[b]) ? "left" : null;
}
```

Crear `src/scenes/conversationBeats.mjs` con el mismo cuerpo en JS puro (sin tipos) para el script de asserts.

- [ ] **Step 4: Ejecutar el test y verlo pasar**

Run: `node scripts/check-beats.mjs`
Expected: PASS ("beats OK").

- [ ] **Step 5: Intercalar el banner en `ChatPanel`**

En `src/crm/inbox/ChatPanel.tsx`, añadir a la interfaz `escalationAfterId?: string;` y reemplazar el bloque de render de mensajes para intercalar el chip tras el mensaje indicado:

```tsx
{messages.map((m) => (
  <React.Fragment key={m.id}>
    {m.template ? <TemplateBubble message={m} /> : <MessageBubble message={m} />}
    {showEscalation && escalation && escalationAfterId === m.id && (
      <EscalationChip text={escalation.text} seller={escalation.seller} time={escalation.time} />
    )}
  </React.Fragment>
))}
{/* fallback: si no se indicó escalationAfterId, va al final (comportamiento previo) */}
{showEscalation && escalation && !escalationAfterId && (
  <EscalationChip text={escalation.text} seller={escalation.seller} time={escalation.time} />
)}
{typing && <TypingIndicator align={typing.align} />}
```

Propagar `escalationAfterId` en `InboxScreen.tsx` (añadir a props y pasarlo a `ChatPanel`).

- [ ] **Step 6: Implementar la escena `Conversation`**

El banner va **después del mensaje del bot que avisa el escalamiento** (`m-5`, beat 5). El contacto pasa a IA pausada + vendedor en el beat 6.

```tsx
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Theme } from "../theme";
import { smoothSpring } from "../components/anim";
import { ScreenFrame } from "../components/ScreenFrame";
import { InboxScreen } from "../crm/inbox/InboxScreen";
import { conversationList, activeConversation, messages, escalation } from "../crm/mock/conversation";
import { contact } from "../crm/mock/contact";
import { BEAT_AT, visibleMessages, typingAt } from "./conversationBeats";

export const Conversation: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: smoothSpring });

  const visible = visibleMessages(messages, frame);
  const talign = typingAt(frame);
  const showEscalation = frame >= BEAT_AT[6];
  const contactNow = showEscalation ? contact : { ...contact, aiPaused: false, assignedSeller: undefined };

  return (
    <ScreenFrame theme={theme} progress={progress}>
      <InboxScreen
        conversations={conversationList}
        activeConversation={activeConversation}
        contact={contactNow}
        messages={visible}
        typing={talign ? { align: talign } : null}
        showEscalation={showEscalation}
        escalation={escalation}
        escalationAfterId="m-5"
      />
    </ScreenFrame>
  );
};
```

- [ ] **Step 7: Renderizar stills de beats clave**

Run: `npx remotion still AltamCrmAd out/_conv1.png --frame=530` (bot, +typing previo), `--frame=1040` (bot escala + banner), `--frame=1130` (entra el vendedor, banner arriba del mensaje del vendedor)
Expected: PASS. A frame ≈1130 el orden es: mensaje del bot "te paso con un asesor" → **banner de escalamiento** → mensaje del vendedor Carlos. Panel derecho con IA pausada y "Carlos Méndez" asignado.

- [ ] **Step 8: Revisión visual del orden del banner** — confirmar que el banner queda ENTRE el bot y el vendedor.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat(crm-ad): escena 3 — conversación (7 beats) + banner intercalado"
```

---

### Task 7: Escena `Organized` (40–48s)

Acercamiento al panel de contacto / etiquetas: "Cada chat, ordenado y sin fugas."

**Files:**
- Modify: `src/scenes/Organized.tsx`

**Interfaces:**
- Consumes: `ScreenFrame`, `InboxScreen`, mocks, `contact` (ya escalado).
- Produces: `Organized: React.FC<{ theme: Theme }>`.

- [ ] **Step 1: Implementar `Organized`**

Reutiliza la bandeja completa con todos los mensajes visibles, pero aplica un **zoom/paneo hacia el panel derecho** y superpone la frase.

```tsx
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Theme } from "../theme";
import { smoothSpring } from "../components/anim";
import { ScreenFrame } from "../components/ScreenFrame";
import { InboxScreen } from "../crm/inbox/InboxScreen";
import { conversationList, activeConversation, messages, escalation } from "../crm/mock/conversation";
import { contact } from "../crm/mock/contact";

export const Organized: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: smoothSpring });
  const zoom = interpolate(frame, [0, 90], [1, 1.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panX = interpolate(frame, [0, 90], [0, -220], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line = interpolate(frame, [60, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${panX}px) scale(${zoom})` }}>
        <ScreenFrame theme={theme} progress={progress}>
          <InboxScreen
            conversations={conversationList}
            activeConversation={activeConversation}
            contact={contact}
            messages={messages}
            typing={null}
            showEscalation
            escalation={escalation}
            escalationAfterId="m-5"
          />
        </ScreenFrame>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 80 }}>
        <div style={{ fontSize: 52, fontWeight: 800, color: theme.text, opacity: line, textShadow: "0 6px 40px rgba(0,0,0,0.6)" }}>
          Cada chat, ordenado y sin fugas.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Renderizar still**

Run: `npx remotion still AltamCrmAd out/_org.png --frame=1360`
Expected: PASS. Se ve el acercamiento al panel derecho (etiquetas Campaña/Interesado, IA pausada, Carlos asignado, notas) con la frase abajo.

- [ ] **Step 3: Revisión visual** — ajustar `zoom`/`panX` si recorta mal el panel.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(crm-ad): escena 4 — todo ordenado (zoom al panel de contacto)"
```

---

### Task 8: Escena `CrmClosing` (48–60s)

Cierre con el logo real + CTA de diagnóstico + dominio. Adapta el `Closing.tsx` existente.

**Files:**
- Create: `src/scenes/CrmClosing.tsx` (basado en `src/scenes/Closing.tsx`)

**Interfaces:**
- Consumes: `Theme`, `staticFile("LOGO.png")`, `smoothSpring`.
- Produces: `CrmClosing: React.FC<{ theme: Theme }>`.

- [ ] **Step 1: Implementar `CrmClosing`**

Copiar la estructura de `src/scenes/Closing.tsx` (isotipo enmascarado + wordmark `altam.`) y cambiar la tagline y el pill por la CTA:

```tsx
// … mismo bloque de isotipo (mask) y wordmark que Closing.tsx …
      <div style={{ fontSize: 34, fontWeight: 500, color: theme.textMuted, opacity: tagline,
        transform: `translateY(${interpolate(tagline, [0, 1], [14, 0])}px)` }}>
        Control comercial real en WhatsApp
      </div>
      <div style={{ marginTop: 12, padding: "18px 44px", borderRadius: 999,
        background: theme.accent, color: "#fff", fontSize: 30, fontWeight: 700,
        opacity: domain, transform: `scale(${interpolate(domain, [0, 1], [0.9, 1])})`,
        boxShadow: `0 0 40px ${theme.accentGlow}` }}>
        Diagnóstico de fugas en WhatsApp
      </div>
      <div style={{ color: theme.textMuted, fontSize: 24, fontWeight: 600, opacity: domain, letterSpacing: "0.02em" }}>
        altam.io
      </div>
```

- [ ] **Step 2: Renderizar still**

Run: `npx remotion still AltamCrmAd out/_close.png --frame=1650`
Expected: PASS. Isotipo + `altam.` + "Control comercial real en WhatsApp" + botón azul "Diagnóstico de fugas en WhatsApp" + `altam.io`.

- [ ] **Step 3: Revisión visual** — leer el PNG.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(crm-ad): escena 5 — cierre con CTA de diagnóstico"
```

---

### Task 9: Render final, script y verificación completa

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `out/altam-crm-ad-dark.mp4`; script `render:crm`.

- [ ] **Step 1: Añadir script de render**

En `package.json` → `scripts`:

```json
"render:crm": "remotion render AltamCrmAd out/altam-crm-ad-dark.mp4"
```

- [ ] **Step 2: Render completo**

Run: `npm run render:crm`
Expected: PASS. `Encoded 1800/1800`; se crea `out/altam-crm-ad-dark.mp4`.

- [ ] **Step 3: Verificación de continuidad**

Extraer 6 frames del mp4 y revisarlos:

```bash
ffmpeg -y -i out/altam-crm-ad-dark.mp4 -vf "select=eq(n\,60)+eq(n\,300)+eq(n\,800)+eq(n\,1130)+eq(n\,1360)+eq(n\,1650)" -vsync 0 out/verify_%02d.png
```

Expected: 6 PNG que corresponden a caos → bot → conversación → escalamiento → ordenado → cierre, con transiciones limpias (sin saltos ni paneles cortados).

- [ ] **Step 4: Limpiar stills temporales**

```bash
rm -f out/_*.png out/verify_*.png
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(crm-ad): render final + script render:crm"
```

---

## Self-Review

**Spec coverage:**
- Formato 16:9 1080p 60s, tema oscuro → Task 3 (composición 1800f) + Global Constraints. ✓
- Paneles luminosos (ScreenFrame, marco ventana, glow) → Task 2. ✓
- Escena caos (WhatsApp desbordado, fuga, gancho) → Task 4. ✓
- Configurar bot (diálogo + wizard 5 pasos, prompt) → Task 5. ✓
- Conversación (7 beats, template→cliente→bot→cliente→bot escala→banner→vendedor; typing; IA pausada) → Task 6. ✓
- Orden del banner (bot escala → banner → vendedor) → Task 6, Steps 5–6 (edición `ChatPanel` + `escalationAfterId="m-5"`). ✓
- Todo ordenado (panel de contacto, etiquetas) → Task 7. ✓
- Cierre con CTA "Diagnóstico de fugas" + `altam.io` → Task 8. ✓
- Integración Tailwind v4 + copiar componentes → Task 1. ✓
- Reuso de Background/theme/fonts/anim → Tasks 3–8. ✓
- Render + script → Task 9. ✓
- Fuera de alcance (métricas/embudo, 9:16, música) → no se implementan (correcto). ✓

**Placeholder scan:** sin "TBD"/"TODO"; los pasos de código llevan bloques reales. La verificación por stills está justificada (dominio visual, sin runner). ✓

**Type consistency:** `visibleMessages`/`typingAt`/`BEAT_AT` idénticos entre definición (Task 6 Step 3) y uso (Steps 1, 6). `escalationAfterId` añadido en `ChatPanel` e `InboxScreen` (Step 5) y usado en Tasks 6–7. `ScreenFrame` firma `{theme, progress?, children}` definida en Task 2 y usada en Tasks 5–8. `AltamCrmAd` prop `{theme}` consistente con `Root.tsx`. ✓
