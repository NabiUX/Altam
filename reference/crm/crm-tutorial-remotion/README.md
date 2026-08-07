# CRM Tutorial — Componentes para video (React → mp4 con Remotion)

Paquete de **componentes React autocontenidos** que recrean dos pantallas del CRM
de WhatsApp (Altam), listos para animar en **Remotion** y exportar a mp4:

1. **Inbox** — bandeja de entrada estilo WhatsApp Web (lista de chats · chat · panel de contacto).
2. **Configuración de BOTS** — diálogo "Crear bot" + wizard de configuración.

> Estos componentes son **presentacionales**: reciben todo por props, no tienen
> estado ni llamadas a API. Tú controlas qué aparece en cada frame desde Remotion.

---

## 1. Requisitos

En tu proyecto Remotion necesitas estas dependencias:

```bash
npm i lucide-react
npm i -D @remotion/tailwind-v4 tailwindcss
```

- **Tailwind v4** (motor de las clases: `flex`, `px-4`, `rounded-lg`, etc.).
  Actívalo en Remotion con `@remotion/tailwind-v4` (ver su README oficial).
- **lucide-react** (íconos).
- Importa **`theme.css`** una sola vez (define el color de marca y utilidades):

```ts
import "./theme.css"; // ajusta la ruta según dónde copies esta carpeta
```

Copia toda esta carpeta (`crm-tutorial-remotion/`) dentro de `src/` de tu proyecto Remotion.

---

## 2. Mapa de archivos

```
theme.css                 Tokens: paleta de marca (azul) + colores WhatsApp + utilidades
mock/
  types.ts                Tipos de las props (Message, Conversation, Contact, BotTemplate…)
  conversation.ts         EL GUION del chat (mensajes en orden) + lista de chats + etiquetas
  contact.ts              Datos del panel derecho
  bots.ts                 Plantillas del diálogo "Crear bot" + config de ejemplo del wizard
inbox/
  InboxScreen.tsx         Ensambla las 3 columnas (usa este como raíz de la escena Inbox)
  ConversationList.tsx    Columna izquierda (lista de chats)
  ChatPanel.tsx           Columna central (mensajes + composer). Aquí controlas qué se ve.
  MessageBubble.tsx       Burbuja de texto (saliente/entrante, estado, remitente)
  TemplateBubble.tsx      Template de campaña (imagen + body + botones)
  TypingIndicator.tsx     "Escribiendo…" (tres puntos)
  EscalationChip.tsx      Banner de escalamiento a humano
  ContactPanel.tsx        Columna derecha (etiquetas, vendedor, pausar IA, notas)
bots/
  BotCreateDialog.tsx     Diálogo "Crear bot" (secciones + tarjetas plantilla)
  BotWizard.tsx           Wizard de configuración (prop `step` 1..5)
ui/
  Badge.tsx  Avatar.tsx  Switch.tsx   Primitivos reutilizables
```

**Resolución sugerida del video:** 1920×1080 (Full HD). Las pantallas están
pensadas para ese lienzo; envuélvelas en un contenedor de ese tamaño.

---

## 3. Escena INBOX

`InboxScreen` recibe qué mensajes están visibles, si hay "escribiendo…" y si se
muestra el banner de escalamiento. Para animar, pásale un **slice creciente** de
`messages` según el frame.

### Beats de animación (orden del guion)

El guion vive en `mock/conversation.ts`. Cada mensaje tiene un campo `beat`:

| beat | Qué aparece | Detalle |
|------|-------------|---------|
| 1 | **Template de campaña** (saliente) | imagen + body + botones "Ver catálogo" / "Hablar con un asesor" |
| 2 | Cliente responde (entrante) | precede con `typing={{ align: "left" }}` 1–2 s |
| 3 | **Bot** responde (saliente) | etiqueta "Aurora Bot" con ícono |
| 4 | Cliente responde (entrante) | "¿Cómo puedo pagar?" |
| 5 | **Bot** avisa escalamiento (saliente) | "te paso con un asesor…" |
| 6 | **Banner de escalamiento** | `showEscalation` = true (usa `escalation` del mock) |
| 7 | **Vendedor** humano escribe (saliente) | etiqueta "Carlos Méndez" |

Sugerencia de duración: ~2.5–3 s por beat (≈ 20 s total a 30 fps). Antes de cada
mensaje entrante, muestra el typing ~1 s.

**Detalle bonito:** en el panel derecho, `contact.aiPaused` pasa de `false` a
`true` y `assignedSeller` aparece **al llegar el beat 6** (escalamiento). Puedes
pasar dos versiones del objeto `contact` según el frame.

### Ejemplo (Remotion)

```tsx
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { InboxScreen } from "./inbox/InboxScreen";
import { conversationList, activeConversation, messages, escalation } from "./mock/conversation";
import { contact } from "./mock/contact";
import "./theme.css";

// Frame en el que aparece cada beat (a 30 fps). Ajusta a gusto.
const BEAT_AT = { 1: 15, 2: 90, 3: 150, 4: 240, 5: 310, 6: 380, 7: 430 };

export const InboxScene = () => {
  const frame = useCurrentFrame();

  // Mensajes visibles = los cuyo beat ya "llegó".
  const visible = messages.filter((m) => frame >= BEAT_AT[m.beat as 1]);

  // Typing 30 frames antes de cada mensaje entrante (beats 2 y 4).
  const typing =
    (frame >= BEAT_AT[2] - 30 && frame < BEAT_AT[2]) ||
    (frame >= BEAT_AT[4] - 30 && frame < BEAT_AT[4])
      ? { align: "left" as const }
      : null;

  const showEscalation = frame >= BEAT_AT[6];

  // El contacto se "escala" en el beat 6.
  const contactNow = showEscalation
    ? contact
    : { ...contact, aiPaused: false, assignedSeller: undefined };

  return (
    <AbsoluteFill style={{ width: 1920, height: 1080 }}>
      <InboxScreen
        conversations={conversationList}
        activeConversation={activeConversation}
        contact={contactNow}
        messages={visible}
        typing={typing}
        showEscalation={showEscalation}
        escalation={escalation}
      />
    </AbsoluteFill>
  );
};
```

> Para la entrada suave de cada burbuja puedes envolver cada mensaje en un
> `<Sequence from={BEAT_AT[beat]}>` y aplicar `spring()`/`interpolate()` (fade +
> desplazamiento). Los componentes no imponen animación: la controlas tú.

---

## 4. Escena BOTS

Dos momentos: elegir plantilla (`BotCreateDialog`) y configurar (`BotWizard`).

### 4a. Diálogo "Crear bot"

`BotCreateDialog` recibe las plantillas y `highlightId` (la tarjeta resaltada,
para simular que el usuario la elige).

```tsx
import { BotCreateDialog } from "./bots/BotCreateDialog";
import { botTemplates, botGroups } from "./mock/bots";

// Anima: primero highlightId undefined, luego resalta "ventas" (border azul).
<BotCreateDialog templates={botTemplates} groups={botGroups} highlightId="ventas" />
```

**Beats:** (1) entra el diálogo, (2) el cursor recorre las tarjetas, (3) se resalta
"Especialista en ventas" (`highlightId="ventas"`), (4) transición al wizard.

### 4b. Wizard de configuración

`BotWizard` recibe la config de ejemplo y `step` (1..5). Cambia `step` por escena
para recorrer los pasos.

```tsx
import { BotWizard } from "./bots/BotWizard";
import { exampleBot } from "./mock/bots";

<BotWizard config={exampleBot} step={2} />
```

| step | Pantalla |
|------|----------|
| 1 | Identidad (tipo, nombre, descripción) |
| 2 | Instrucciones (prompt del sistema) |
| 3 | Conocimiento (bases conectadas) |
| 4 | Escalamiento (turnos, auto-escalar, asesor) |
| 5 | Etiquetas disparadoras |

**Beats:** ~2.5 s por paso; el stepper superior marca el avance (los pasos
completados quedan con check azul).

```tsx
// Ejemplo: recorrer los 5 pasos según el frame.
const step = Math.min(5, Math.floor(frame / 75) + 1); // ~2.5 s por paso a 30 fps
<BotWizard config={exampleBot} step={step} />
```

---

## 5. Personalización

- **Imágenes:** la del template de campaña es un placeholder
  (`mock/conversation.ts` → `imageUrl`). Reemplázala por la imagen real (banner de
  la campaña). Los avatares, si no hay `avatarUrl`, muestran la inicial sobre el
  color de marca.
- **Textos:** todo el guion (nombres, mensajes, horas) está en `mock/`. Cámbialos
  sin tocar los componentes.
- **Color de acento:** es azul y vive en `theme.css` (`--theme-50..950`). Si el
  video necesita otro color de marca, cambia esas variables (usa una escala HSL de
  claro a oscuro) y todo el acento se actualiza.
- **Negocio de ejemplo:** "Boutique Aurora" (tienda de ropa). Cámbialo libremente.

---

## 6. Notas técnicas

- No hay backend, WebSocket ni hooks del dashboard: es 100% estático + props.
- Los componentes no importan nada del monorepo; solo `react`, `lucide-react` y
  archivos de esta carpeta.
- El `animate-bounce` del typing y las transiciones que quieras las controlas en
  Remotion; los componentes no fuerzan timing.
- Fuente: usa una sans (system-ui o la que prefieras). Las clases asumen `font-sans`.
```
