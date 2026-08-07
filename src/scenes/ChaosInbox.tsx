import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Theme } from "../theme";

// --- Fotos subidas por la usuaria (public/avatars/) ---
const AVATARS = [
  "retrato 1.jpeg",
  "retrato2.jpeg",
  "retrato 3.jpeg",
  "retrato 4.jpeg",
  "retrato 5.jpeg",
  "retrato 6.jpeg",
  "retrao 7.jpeg",
  "retrato 8.jpeg",
  "retrao 9.jpeg",
  "retrato 10.jpeg",
  "retrao 11.jpeg",
  "retrato 12.jpeg",
  "retrato 13.jpeg",
  "retrato 14.jpeg",
].map((f) => staticFile(`avatars/${f}`));

const NAMES = [
  "María", "Carlos", "Lucía", "Andrés", "Sofía", "Diego", "Valentina",
  "Mateo", "Camila", "Sebastián", "Isabella", "Nicolás", "Daniela", "Julián",
];

// Arco: primero INTERÉS por el producto…
const INTEREST = [
  "Hola, estoy interesado 😊",
  "¿Aún está disponible?",
  "Quiero adquirirlo",
  "Hola! Me interesa este producto",
  "¿Me das más información?",
  "¿Sigue a la venta?",
  "Buenas, quiero comprarlo",
  "¿Cómo lo adquiero?",
];
// …y después INSISTENCIA de clientes cansados de esperar respuesta.
const INSIST = [
  "¿Hola? ¿Siguen ahí?",
  "Llevo horas esperando 😠",
  "¿Me van a responder?",
  "¿???",
  "Sigo esperando… 😤",
  "¿En serio nadie contesta?",
  "Hola??? 🙄",
  "Ya me cansé de esperar 😡",
  "Respondan por favor 😠",
  "Mejor busco en otro lado…",
  "¿Van a atender o no? 😤",
  "¿Hay alguien ahí?",
];

// PRNG determinista por índice (sin Math.random, render reproducible).
const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const BLUR_START = 80; // el fondo de mensajes empieza a desenfocarse
const PHRASE_START = 82; // empieza a "tipearse" la frase en el centro
const EXIT_START = 136; // salida: la frase hace amago de subir y desaparece
const EXIT_DUR = 8; // más rápido

// --- Sonidos (public/sounds/) ---
// Los pops de todos los mensajes van HORNEADOS en una sola pista (pops.mp3)
// para no renderizar decenas de <Audio> (causaban "Maximum update depth").
const SND_POPS = staticFile("sounds/pops.mp3");
const SND_WHIP = staticFile("sounds/whip.mp3");
const SND_TYPE = staticFile("sounds/type_kbd.mp3");

const BUBBLE_W = 560;

// --- Fase 1 (CALMA): rejilla 4×4 que cubre toda la pantalla (incl. esquinas),
// apariciones espaciadas y con desvanecimiento. Permutación fija (no aritmética
// → sin diagonal) que reparte apariciones consecutivas en puntos lejanos.
const COLS_X = [40, 480, 920, 1320];
const ROWS_Y = [70, 330, 590, 850];
const CELLS = [0, 15, 3, 12, 5, 10, 6, 9, 1, 14, 8, 7, 2, 13, 11, 4];

const CALM = Array.from({ length: 5 }).map((_, i) => {
  const cell = CELLS[i];
  const col = cell % 4;
  const row = Math.floor(cell / 4);
  const text = INTEREST[i];
  return {
    start: i * 9 - 12,
    appearDur: 20, // aparición lenta y fluida
    fade: true, // se desvanece tras su vida
    life: 62,
    x: COLS_X[col] + (rand(i * 5 + 1) - 0.5) * 70,
    y: ROWS_Y[row] + (rand(i * 9 + 2) - 0.5) * 80,
    size: 1.35 + rand(i * 3 + 5) * 0.35,
    avatar: (i * 5) % AVATARS.length,
    name: NAMES[(i * 3) % NAMES.length],
    text,
    unread: 1 + Math.floor(rand(i * 11 + 7) * 6),
  };
});

// --- Fase 2 (CLÍMAX): ráfaga RÁPIDA que se renueva (cada burbuja vive poco y
// se va), de modo que hay mucho movimiento pero POCOS mensajes a la vez.
// Sigue apareciendo durante toda la frase (fondo desenfocado vivo).
const BURST_START = 46;
const BURST = Array.from({ length: 40 }).map((_, j) => {
  const k = j + 30;
  return {
    start: BURST_START + j * 2.4,
    appearDur: 7, // aparición súper rápida
    fade: true, // se renueva (no se apila)
    life: 28, // vida corta → pocos simultáneos
    // Secuencia R2 (baja discrepancia): reparto parejo por toda la pantalla
    // desde el primer mensaje, alternando lados (sin agolparse a la izquierda).
    x: 30 + (((j + 1) * 0.7548776662 + 0.5) % 1) * (1920 - 30 - BUBBLE_W),
    y: 50 + (((j + 1) * 0.569840291 + 0.5) % 1) * (1080 - 50 - 210),
    size: 1.2 + rand(k * 3 + 5) * 0.4,
    avatar: (k * 5) % AVATARS.length,
    name: NAMES[(k * 3) % NAMES.length],
    text: INSIST[j % INSIST.length],
    unread: 3 + Math.floor(rand(k * 11 + 7) * 10), // insistencia = más no leídos
  };
});

const EVENTS = [...CALM, ...BURST];

const Bubble: React.FC<{ theme: Theme; ev: (typeof EVENTS)[number] }> = ({
  theme,
  ev,
}) => {
  const frame = useCurrentFrame();
  const age = frame - ev.start;
  if (age < 0) return null;
  if (ev.fade && age > ev.life) return null;

  // Aparición suave (easing). En la fase de clímax appearDur es corto (rápido).
  const appear = interpolate(age, [0, ev.appearDur], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Cada burbuja se desvanece al final de su vida (flujo que se renueva).
  const disappear = ev.fade
    ? interpolate(age, [ev.life - 18, ev.life], [1, 0], {
        easing: Easing.in(Easing.cubic),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const op = Math.min(appear, disappear);

  // Emerge desde el fondo (pequeño/borroso → nítido) y se queda en su sitio;
  // luego se desvanece ahí mismo (sin desplazarse hacia arriba).
  const depth = interpolate(appear, [0, 1], [0.6, 1]);
  const scale = ev.size * depth * (1 + (1 - disappear) * 0.08);
  const blur = interpolate(appear, [0, 1], [16, 0]) + (1 - disappear) * 8;
  const top = ev.y;

  return (
    <div
      style={{
        position: "absolute",
        left: ev.x,
        top,
        width: BUBBLE_W,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        borderRadius: 18,
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: "0 22px 60px rgba(0,0,0,0.5)",
        opacity: op,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        filter: `blur(${blur}px)`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          overflow: "hidden",
          flexShrink: 0,
          border: `2px solid ${theme.cardBorder}`,
        }}
      >
        <Img src={AVATARS[ev.avatar]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: theme.text,
            fontWeight: 700,
            fontSize: 21,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {ev.name}
        </div>
        <div
          style={{
            color: theme.textMuted,
            fontSize: 17,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {ev.text}
        </div>
      </div>
      {/* Badge de no leídos estilo WhatsApp */}
      <span
        style={{
          background: "#25D366",
          color: "#fff",
          borderRadius: 999,
          minWidth: 30,
          height: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 800,
          padding: "0 8px",
          flexShrink: 0,
        }}
      >
        {ev.unread}
      </span>
    </div>
  );
};

const LINES = ["¿Cuántas ventas", "se te escapan?"];
const LEN1 = LINES[0].length;
const TOTAL_CHARS = LINES[0].length + LINES[1].length;
const CPS = 1.7; // caracteres por frame al tipear (entrada rápida)

const Line: React.FC<{ theme: Theme; text: string; cursor: boolean }> = ({
  theme,
  text,
  cursor,
}) => (
  <div
    style={{
      height: 112,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 96,
      fontWeight: 800,
      letterSpacing: "-0.03em",
      color: theme.text,
      lineHeight: 1,
      textShadow: "0 10px 50px rgba(0,0,0,0.85)",
      whiteSpace: "pre",
    }}
  >
    {text}
    {cursor && (
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 84,
          marginLeft: 8,
          borderRadius: 3,
          background: theme.accent,
          transform: "translateY(4px)",
        }}
      />
    )}
  </div>
);

export const ChaosInbox: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();

  // Fondo con nervio: glow rojizo tenue que late.
  const pulse = 0.5 + 0.5 * Math.sin(frame / 9);

  // El fondo de mensajes se DESENFOCA (y oscurece un poco) para que la frase
  // se lea encima; los mensajes siguen apareciendo detrás.
  const bgBlur = interpolate(frame, [BLUR_START, BLUR_START + 18], [0, 15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bgDim = interpolate(frame, [BLUR_START, BLUR_START + 18], [1, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scrim = interpolate(frame, [BLUR_START, BLUR_START + 18], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Frase que se "tipea" desde el centro, carácter por carácter, con cursor.
  const typed = Math.min(
    TOTAL_CHARS,
    Math.max(0, Math.floor((frame - PHRASE_START) * CPS)),
  );
  const vis1 = LINES[0].slice(0, Math.min(typed, LEN1));
  const vis2 = typed > LEN1 ? LINES[1].slice(0, typed - LEN1) : "";
  const doneTyping = typed >= TOTAL_CHARS;
  // Cursor sólido mientras escribe y durante la pausa; desaparece al terminar.
  const showCursor = frame >= PHRASE_START && frame < EXIT_START && !doneTyping;
  const cursorOnLine1 = typed <= LEN1;

  // Salida: la frase hace un pequeño amago de SUBIR y enseguida desaparece.
  const lift = interpolate(frame, [EXIT_START, EXIT_START + EXIT_DUR], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitY = -lift * 90;
  const exitOp = interpolate(frame, [EXIT_START, EXIT_START + 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Glow tenso que respira */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, rgba(255,70,70,${0.08 + pulse * 0.09}) 0%, rgba(255,70,70,0) 55%)`,
        }}
      />

      {/* Mensajes de fondo: siguen apareciendo, se desenfocan al llegar la frase */}
      <AbsoluteFill style={{ filter: `blur(${bgBlur}px)`, opacity: bgDim }}>
        {EVENTS.map((ev, i) => (
          <Bubble key={i} theme={theme} ev={ev} />
        ))}
      </AbsoluteFill>

      {/* Scrim central para dar contraste a la frase */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(5,8,20,${scrim}) 0%, rgba(5,8,20,0) 60%)`,
        }}
      />

      {/* Frase tipeada desde el centro; a la salida, succionada al centro */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transformOrigin: "center center",
            transform: `translateY(${exitY}px)`,
            opacity: exitOp,
          }}
        >
          <Line theme={theme} text={vis1} cursor={showCursor && cursorOnLine1} />
          <Line theme={theme} text={vis2} cursor={showCursor && !cursorOnLine1} />
        </div>
      </AbsoluteFill>

      {/* --- Audio (no se ve en stills; suena en el Studio y el mp4) --- */}
      {/* Pops de todos los mensajes (pista horneada). El volumen baja a un
          susurro de fondo justo cuando entra el texto (ducking). */}
      <Audio
        src={SND_POPS}
        volume={(f) =>
          interpolate(f, [72, 98], [0.9, 0.08], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      {/* Tecleo mientras se escribe la frase */}
      <Sequence from={PHRASE_START} durationInFrames={19}>
        <Audio src={SND_TYPE} volume={0.8} />
      </Sequence>
      {/* Whip cuando la frase sale (acelerado = más punzante) */}
      <Sequence from={EXIT_START} durationInFrames={20}>
        <Audio src={SND_WHIP} volume={0.9} playbackRate={1.7} />
      </Sequence>
    </AbsoluteFill>
  );
};
