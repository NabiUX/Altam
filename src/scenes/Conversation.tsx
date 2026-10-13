import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { smoothSpring } from "../components/anim";
import { BotFace } from "./BotSetup";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  Info,
  LayoutGrid,
  Mic,
  MoreVertical,
  MousePointer2,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Smile,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { Theme, getTheme, floatingTextColor, floatingTextShadow } from "../theme";

// Escena 3: recreación custom del CRM de Altam en modo OSCURO (tipo WhatsApp en
// PC, 3 columnas), según public/chat CRM.jpeg. v1 = layout estático para calzar
// la estética; la animación de la conversación se añade después.

// Paleta local del CRM oscuro (afinada contra la referencia).
// Paleta OSCURA del CRM (la original).
export const crmDark = {
  // Mismo azul de fondo que el cuadro "Configura tu bot" (theme.bgFrom = #1B2E5C),
  // con pasos tonales sutiles para que el CRM se siga leyendo como una app.
  bg: "#1B2E5C",
  panel: "#182a54",
  panel2: "#223a6b",
  hover: "#213868",
  border: "rgba(255,255,255,0.09)",
  border2: "rgba(255,255,255,0.12)",
  text: "#e7ecf4",
  muted: "#9aa6c0",
  faint: "#7182a4",
  accent: "#4D82FF",
  accentSoft: "rgba(77,130,255,0.18)",
  bubbleIn: "#284677",
  bubbleOut: "#123038",
  green: "#22c55e",
  orange: "#f59e0b",
  orangeSoft: "rgba(245,158,11,0.12)",
  red: "#ef4444",
  redSoft: "rgba(239,68,68,0.12)",
  tagGreen: "rgba(34,197,94,0.16)",
  tagGreenText: "#5fd08a",
};

type CrmPalette = typeof crmDark;

// Paleta CLARA del CRM (para la versión de fondo claro): paneles blancos/gris
// muy claro, texto oscuro; colores de marca (azul/verde/naranja/rojo) intactos.
export const crmLight: CrmPalette = {
  bg: "#eef1f6",
  panel: "#ffffff",
  panel2: "#eef2f7",
  hover: "#e6ebf3",
  border: "rgba(15,23,42,0.08)",
  border2: "rgba(15,23,42,0.12)",
  text: "#0f172a",
  muted: "#64748b",
  faint: "#94a3b8",
  accent: "#2E6BFF",
  accentSoft: "rgba(46,107,255,0.12)",
  bubbleIn: "#ffffff",
  bubbleOut: "#d1e3ff",
  green: "#16a34a",
  orange: "#d97706",
  orangeSoft: "rgba(217,119,6,0.14)",
  red: "#dc2626",
  redSoft: "rgba(220,38,38,0.12)",
  tagGreen: "rgba(22,163,74,0.14)",
  tagGreenText: "#15803d",
};

// La paleta del CRM = oscura en fondo oscuro, clara en fondo claro. Se provee por
// contexto para no cambiar el cuerpo de cada componente (siguen usando `C.`).
export const CrmCtx = React.createContext<CrmPalette>(crmDark);

const BUSINESS = "Finanzas desde Cero";
const CLIENT = { name: "Andrés Ramírez", num: "593987654321", ini: "A" };
const AGENT = "Ana Gómez";

// Mismo "pop" horneado de la Escena 1 para el flujo de chats.
const SND_POPS = staticFile("sounds/pops.mp3");
const SND_SWOOSH = staticFile("sounds/whip.mp3"); // acercamiento (zoom) a la escala
const SND_BELL = staticFile("sounds/campanita_ding.mp3"); // la pantalla da vuelta → bot
const SND_BLINK = staticFile("sounds/parpadeo_blink.mp3"); // el bot guiña
const SND_CLICK = staticFile("sounds/click.mp3"); // click del cursor en Andrés
// Pista ÚNICA con TODOS los efectos de la escena ya horneados (ffmpeg) en su
// onset. Un solo <Audio> no rompe el preview del Studio; los <Audio> sueltos sí.
const SND_SCENE3 = staticFile("sounds/scene3_fx.mp3");

// Mensajes del chat. who: client (izq, gris) | biz (der, teal: bot o asesor).
const MSGS: { who: "client" | "biz"; text: string; t: string }[] = [
  { who: "client", text: "Hola, vi su curso de finanzas personales 👀 ¿cómo funciona?", t: "20:58" },
  { who: "biz", text: "¡Hola! Son 8 módulos con clases + plantillas para organizar y hacer crecer tu dinero, a tu ritmo.", t: "20:58" },
  { who: "client", text: "Mmm no sé… ¿de verdad vale la pena? Ya intenté organizarme antes y nada 😕", t: "20:59" },
  { who: "biz", text: "Te entiendo 💯 Justo por eso es paso a paso: aplicas el módulo 1 y en la primera semana ya ves orden en tus gastos. Y tienes 7 días de garantía.", t: "20:59" },
  { who: "client", text: "Ok, me convenciste 🙌 quiero inscribirme", t: "21:00" },
  // → aquí va la escala (banner)
  { who: "biz", text: "¡Perfecto! ¿Qué método de pago prefieres? 😊", t: "21:00" },
];
const ESCALATION_AFTER = 4; // el banner va tras el índice 4 (decisión de compra)

// Ancho de las tarjetas flotantes del caos.
const CHAOS_W = 500;
// Cada conversación FLOTA en el caos (fx, fy) y luego ENTRA EN ORDEN a la lista
// (`at`), encogiéndose. `floatStart` = cuándo aparece flotando; `tagAt` = cuándo
// se auto-etiqueta. Posición flotante con secuencia R2 (baja discrepancia).
// `first` = mensaje de interés (con el que llegan → etiqueta "Interesado").
// `last` = a dónde deriva la conversación. `tag` = etiqueta FINAL (a la que el
// bot RE-ETIQUETA tras seguir conversando). Si `tag` = interesado, no cambia.
// Cada conversación EVOLUCIONA en vivo durante la asignación de etiquetas: un
// guion de pasos (cliente/bot). `who`: "c" cliente | "b" bot. Al responder el
// bot se añade la etiqueta "bot" (el bot es con quien hablan). `tags` = etiquetas
// acumuladas en ese paso. `first`/`last`/`tag` se conservan para el caos/chat.
type Step = { who: "c" | "b"; text: string; tags: TagKind[] };
const CONV_BASE: { name: string; num: string; first: string; last: string; tag: TagKind; ini: string; sel?: boolean; steps: Step[] }[] = [
  { name: "Valentina Ríos", num: "593980112233", first: "Hola, me interesa el curso 😊", last: "¡Perfecto! ¿cómo lo compro?", tag: "interesado", ini: "V", steps: [
    { who: "c", text: "Hola, ¿de qué se trata?", tags: ["interesado"] },
    { who: "b", text: "¡Hola V! Es un curso para ordenar y hacer crecer tu dinero 💰", tags: ["interesado", "bot"] },
    { who: "c", text: "¡Me encanta! Lo quiero 🙌", tags: ["bot", "interesado"] },
  ] },
  { name: "Diego Salas", num: "593981445566", first: "Hola, vi el curso 👀", last: "Ya compré pero no puedo entrar 😕", tag: "soporte", ini: "D", steps: [
    { who: "c", text: "Compré pero no puedo entrar 😕", tags: ["soporte"] },
    { who: "b", text: "Hola D, ya reactivé tu acceso, prueba de nuevo 🔧", tags: ["soporte", "bot"] },
    { who: "c", text: "Listo, ya entré. ¡Gracias! 🙌", tags: ["bot", "soporte"] },
  ] },
  { name: "Camila Ortiz", num: "593984778899", first: "Me interesa, ¿cómo pago?", last: "Quiero pagar con tarjeta 💳", tag: "tarjeta", ini: "C", steps: [
    { who: "c", text: "Me interesa, ¿cómo pago?", tags: ["interesado"] },
    { who: "b", text: "¡Hola C! Con tarjeta o efectivo, como prefieras 💳", tags: ["interesado", "bot"] },
    { who: "c", text: "Listo, pagué con tarjeta ✅", tags: ["bot", "tarjeta"] },
  ] },
  { name: "Mateo Ríos", num: "593982667788", first: "¿Está disponible?", last: "Prefiero pagar en efectivo", tag: "efectivo", ini: "M", steps: [
    { who: "c", text: "¿Está disponible?", tags: ["interesado"] },
    { who: "b", text: "¡Sí, M! Y puedes pagar en efectivo si prefieres 💵", tags: ["interesado", "bot"] },
    { who: "c", text: "Perfecto, ya lo deposité", tags: ["bot", "efectivo"] },
  ] },
  { name: "Sofía Marín", num: "593985998877", first: "Quiero info del curso", last: "Gracias, el asesor ya me ayudó 🙌", tag: "asesor", ini: "S", steps: [
    { who: "c", text: "Quiero info del curso", tags: ["interesado"] },
    { who: "b", text: "¡Hola S! Son 8 módulos, ¿te ayudo a inscribirte?", tags: ["interesado", "bot"] },
    { who: "c", text: "Estoy lista para pagar", tags: ["asesor"] },
  ] },
  { name: "Julián Prado", num: "593989334455", first: "Hola, me interesa 😊", last: "¿Aún está disponible? 👀", tag: "interesado", ini: "J", steps: [
    { who: "c", text: "Hola, me interesa 😊", tags: ["interesado"] },
    { who: "b", text: "¡Hola J! Te cuento todo, ¿qué quieres saber?", tags: ["interesado", "bot"] },
    { who: "c", text: "¿Aún está disponible? 👀", tags: ["bot", "interesado"] },
  ] },
  { name: "Lucía Torres", num: "593986221100", first: "Me interesa el curso", last: "No me carga el módulo 2", tag: "soporte", ini: "L", steps: [
    { who: "c", text: "No me carga el módulo 2 😕", tags: ["soporte"] },
    { who: "b", text: "Hola L, ya lo revisé, prueba ahora 🔧", tags: ["soporte", "bot"] },
    { who: "c", text: "Ya funciona, ¡gracias!", tags: ["bot", "soporte"] },
  ] },
  { name: "Carlos Vega", num: "593983556677", first: "¿Cómo funciona?", last: "Quiero comprar ya 🙌", tag: "interesado", ini: "C", steps: [
    { who: "c", text: "¿Cómo funciona?", tags: ["interesado"] },
    { who: "b", text: "¡Hola C! Es paso a paso, a tu ritmo 📈", tags: ["interesado", "bot"] },
    { who: "c", text: "Genial, ya pagué con tarjeta 🙌", tags: ["bot", "tarjeta"] },
  ] },
  { name: "Isabella Ruiz", num: "593988990011", first: "Me interesa 👀", last: "¿Puedo pagar en efectivo?", tag: "efectivo", ini: "I", steps: [
    { who: "c", text: "Me interesa 👀", tags: ["interesado"] },
    { who: "b", text: "¡Hola I! ¿Prefieres tarjeta o efectivo?", tags: ["interesado", "bot"] },
    { who: "c", text: "Efectivo, ya lo deposité", tags: ["bot", "efectivo"] },
  ] },
  // Andrés queda AL FINAL (el "1 sin leer"): sobre él hará click el cursor.
  { name: "Andrés Ramírez", num: "593987654321", first: "Hola, vi su curso 👀", last: "Hola, vi su curso 👀", tag: "interesado", ini: "A", sel: true, steps: [
    { who: "c", text: "Hola, vi su curso 👀", tags: ["interesado"] },
    { who: "b", text: "¡Hola A! ¿Te cuento cómo funciona? 😊", tags: ["interesado", "bot"] },
    { who: "c", text: "Sí, cuéntame más", tags: ["bot", "interesado"] },
  ] },
];
export const LIST = CONV_BASE.map((c, i) => ({
  ...c,
  day: "Hoy",
  av: (i * 5) % 14,
  fx: 30 + (((i + 1) * 0.7548776662 + 0.1) % 1) * (1920 - 60 - CHAOS_W),
  fy: 30 + (((i + 1) * 0.569840291 + 0.32) % 1) * (1080 - 60 - 120),
  floatStart: i * 4, // aparece flotando (escalonado)
  at: 100 + i * 7, // entra a la lista EN ORDEN (con etiqueta "Interesado")
  tagAt: 100 + i * 7 + 12, // aparece la etiqueta "Interesado"
  // El reetiquetado ocurre DESPUÉS de que todas llegaron (así "sin leer" sube a
  // ~10 y luego baja mientras el bot va reetiquetando de arriba hacia abajo).
  retagAt: 172 + i * 11, // (legacy)
  // Solo las primeras 5 EVOLUCIONAN en vivo (variadas); el resto quedan estáticas
  // (ya resueltas) para que la sección sea más corta. La cámara baja siguiéndolas.
  evolve: i < 5,
  evolveAt: 172 + i * 11,
}));

// Ritmo de la evolución de cada conversación (frames locales desde `evolveAt`).
const STEP_GAP = 13; // cada paso del guion
const STEP_POP = 8; // fade/pop al cambiar de paso

// Filas de RELLENO para el "flood": muchísimos mensajes llegando que pasan
// rápido mientras el contador sube (por eso el "sin leer" sigue subiendo).
// Reutilizan conversaciones base (sin Andrés) con nombres variados.
const FILLER_NAMES = ["Paula", "Andrés M.", "Kevin", "Daniela", "Bruno", "Gabriela", "Óscar", "Renata", "Iván", "Melisa", "Tomás", "Fernanda", "Nicolás", "Sara", "Emilio", "Lucas", "Ariana", "Pablo", "Noa", "Vera", "Hugo", "Elsa"];
const FILLER = FILLER_NAMES.map((n, k) => {
  const c = CONV_BASE[k % (CONV_BASE.length - 1)];
  return { name: n, num: c.num, first: c.first, ini: n[0], filler: true };
});

// ---------- Intro: callback al caos de la Escena 1 + succión ----------
// Se replica el flujo de chats de la Escena 1 y, en vez de la frase, entra el
// CRM (levantándose en 3D) mientras los chats son SUCCIONADOS al centro para
// ordenarse en la lista de conversaciones.
const FLY_DUR = 18; // cuánto tarda un chat en volar/entrar a la lista
export const RISE_AT = 62; // el CRM se levanta ANTES de que aterricen los chats
const INTRO_END = 168; // referencia (la lista termina de llenarse ~152)
const SUCK_TARGET = { x: 960, y: 700 }; // hacia la lista (centro-bajo del CRM)

// Dimensiones de la ventana flotante del CRM (recortada sobre el fondo).
export const W_LEFT = 380; // columna izquierda (lista)
const W_CENTER = 1080; // columna central (chat)
const W_RIGHT = 360; // columna derecha (contacto)
const W_INNER = W_LEFT + W_CENTER + W_RIGHT; // 1820
export const WIN_H = 960;
const FACE_W = [W_LEFT, W_CENTER, W_RIGHT]; // ancho de cada cara del "deck"

export const AVATARS = [
  "retrato 1.jpeg", "retrato2.jpeg", "retrato 3.jpeg", "retrato 4.jpeg",
  "retrato 5.jpeg", "retrato 6.jpeg", "retrao 7.jpeg", "retrato 8.jpeg",
  "retrao 9.jpeg", "retrato 10.jpeg", "retrao 11.jpeg", "retrato 12.jpeg",
  "retrato 13.jpeg", "retrato 14.jpeg",
].map((f) => staticFile(`avatars/${f}`));
const NAMES = ["María", "Carlos", "Lucía", "Andrés", "Sofía", "Diego", "Valentina", "Mateo", "Camila", "Sebastián", "Isabella", "Nicolás", "Daniela", "Julián"];

// Cada conversación FLOTA (fx,fy) y luego VUELA a la lista (encogiéndose, SIN
// rotar), entrando en orden justo cuando aparece en la lista (`at`).
const ChaosCard: React.FC<{ ev: (typeof LIST)[number]; frame: number; theme: Theme }> = ({ ev, frame, theme }) => {
  if (frame < ev.floatStart || frame >= ev.at) return null;
  const appear = interpolate(frame - ev.floatStart, [0, 14], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fly = interpolate(frame, [ev.at - FLY_DUR, ev.at], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cx = ev.fx + CHAOS_W / 2;
  const cy = ev.fy + 45;
  const nx = interpolate(fly, [0, 1], [cx, SUCK_TARGET.x]);
  const ny = interpolate(fly, [0, 1], [cy, SUCK_TARGET.y]);
  const scale = 1.05 * (0.7 + appear * 0.3) * (1 - fly * 0.85); // se encoge al entrar (sin rotar)
  const op = appear * (1 - fly);
  const blur = interpolate(appear, [0, 1], [14, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: nx - CHAOS_W / 2,
        top: ny - 45,
        width: CHAOS_W,
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
        transformOrigin: "center",
        filter: `blur(${blur}px)`,
      }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 999, overflow: "hidden", flexShrink: 0, border: `2px solid ${theme.cardBorder}` }}>
        <Img src={AVATARS[ev.av]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: theme.text, fontWeight: 700, fontSize: 19, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.name}</div>
        <div style={{ color: theme.textMuted, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.first}</div>
      </div>
      <span style={{ background: "#25D366", color: "#fff", borderRadius: 999, minWidth: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, padding: "0 8px", flexShrink: 0 }}>{2 + (ev.av % 7)}</span>
    </div>
  );
};

export const ChaosIntro: React.FC<{ frame: number; theme: Theme }> = ({ frame, theme }) => (
  // Las burbujas voladoras (callback al caos) se DESVANECEN al entrar el zoom a
  // la lista, para no tapar el contador. La lista misma muestra los chats entrando.
  <AbsoluteFill style={{ opacity: interpolate(frame, [108, 126], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
    {LIST.map((ev, i) => (
      <ChaosCard key={i} ev={ev} frame={frame} theme={theme} />
    ))}
  </AbsoluteFill>
);

// ---------- Subcomponentes ----------

const Avatar: React.FC<{ ini: string; size?: number; bg?: string }> = ({
  ini,
  size = 40,
  bg,
}) => {
  const C = React.useContext(CrmCtx);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: bg ?? C.accentSoft,
        color: C.accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {ini}
    </div>
  );
};

type TagKind =
  | "ia"
  | "seller"
  | "biz"
  | "bot"
  | "interesado"
  | "soporte"
  | "asesor"
  | "tarjeta"
  | "efectivo";

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const TAG_STYLE: Record<TagKind, { base: string; emoji?: string; label?: string }> = {
  ia: { base: "#4D82FF", emoji: "🤖" },
  seller: { base: "#4D82FF" },
  biz: { base: "#22c55e" },
  bot: { base: "#4D82FF", label: "Bot" }, // el bot está atendiendo (ícono BotFace)
  interesado: { base: "#22c55e", emoji: "🔥", label: "Interesado" },
  soporte: { base: "#8b5cf6", emoji: "🛟", label: "Soporte" },
  asesor: { base: "#f59e0b", emoji: "🎧", label: "Con asesor" },
  tarjeta: { base: "#38bdf8", emoji: "💳", label: "Pago tarjeta" },
  efectivo: { base: "#34d399", emoji: "💵", label: "Pago efectivo" },
};

const ListTag: React.FC<{ label: string; kind: TagKind; pop?: number }> = ({
  label,
  kind,
  pop = 1,
}) => {
  const s = TAG_STYLE[kind];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 13,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 7,
        background: rgba(s.base, 0.15),
        color: s.base,
        border: `1px solid ${rgba(s.base, 0.32)}`,
        whiteSpace: "nowrap",
        opacity: pop,
        transform: `scale(${0.6 + pop * 0.4})`,
      }}
    >
      {s.emoji && <span style={{ fontSize: 12 }}>{s.emoji}</span>}
      {kind === "bot" && <BotFace size={13} />}
      {kind === "seller" && !s.emoji && <UserRound style={{ width: 12, height: 12 }} />}
      {s.label ?? label}
    </span>
  );
};

const TopBar: React.FC = () => {
  const C = React.useContext(CrmCtx);
  return (
  <div
    style={{
      height: 50,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "0 20px",
      background: C.panel,
      borderBottom: `1px solid ${C.border}`,
      color: C.muted,
    }}
  >
    <LayoutGrid style={{ width: 20, height: 20 }} />
    <span style={{ color: C.text, fontWeight: 600, fontSize: 15 }}>Inicio</span>
    <div style={{ width: 1, height: 22, background: C.border }} />
    <span style={{ fontSize: 14 }}>WhatsApp</span>
    <span style={{ fontSize: 12 }}>›</span>
    <span style={{ fontSize: 14, color: C.text }}>Inbox</span>
    <div style={{ flex: 1 }} />
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.green, fontWeight: 600 }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: C.green }} />
      En vivo
    </div>
    <Bell style={{ width: 20, height: 20 }} />
    <Avatar ini="A" size={34} />
  </div>
  );
};

const ITEM_H = 118; // alto aprox. de una tarjeta de la lista
const LIST_VIS_H = 430; // alto visible del área de tarjetas (aprox.)

export const ListColumn: React.FC<{ frame: number; fps: number; reveal: number; escProgress: number }> = ({ frame, fps, reveal, escProgress }) => {
  const C = React.useContext(CrmCtx);
  // Cuántas conversaciones ya entraron (contador + scroll suben con esto).
  const arrived = LIST.filter((it) => frame >= it.at).length;
  // "Contestadas" por el bot (re-etiquetadas) → bajan el "sin leer". El pendiente
  // (Andrés, sel) NO se contesta: el "sin leer" baja hasta quedar en 1.
  const answered = LIST.filter((it) => frame >= it.retagAt && !it.sel).length;
  // "sin leer": SUBE 1→300 MIENTRAS los chats van entrando (110-163), se mantiene,
  // y BAJA 300→1 con el reetiquetado (queda solo Andrés, el "1 sin leer").
  const sinLeer = Math.round(
    interpolate(frame, [110, 158, 168, 220, 285], [1, 300, 300, 100, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  // Scroll: FLOOD (100→163) recorre rápido las filas de relleno = muchísimos
  // mensajes llegando (por eso sube el "sin leer"); se mantiene en el tope de las
  // conversaciones reales; y durante el reetiquetado (205→282) baja recorriéndolas
  // hasta Andrés.
  const FLOOD_SCROLL = FILLER.length * ITEM_H; // hasta el inicio de las reales
  const settleExtra = Math.max(0, LIST.length * ITEM_H - LIST_VIS_H); // recorrer las reales
  // Solo se muestran las 5 que evolucionan + Andrés. Mini scroll lento durante la
  // evolución y luego BAJA hasta el final (Andrés) para el click.
  // Mini scroll lento durante la evolución (SIN estirón); Andrés ya queda visible
  // abajo. El click va justo al terminar el re-etiquetado.
  // Más zoom → el scroll BAJA siguiendo las conversaciones para no perder cambios.
  const scroll = interpolate(frame, [178, 272], [0, 320], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Se muestran las 5 que evolucionan + Andrés, con ANDRÉS ANTES QUE SOFÍA (la
  // última que evoluciona), para que el click caiga sobre Andrés.
  const evolving = LIST.filter((it) => it.evolve);
  const andres = LIST.filter((it) => it.sel);
  const shownList = [...evolving.slice(0, -1), ...andres, ...evolving.slice(-1)];
  const recentAt = arrived ? Math.max(...LIST.filter((it) => frame >= it.at).map((it) => it.at)) : -999;
  const flash = interpolate(frame - recentAt, [0, 3, 12], [1, 1.32, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const count = 5691 + arrived;
  return (
  <div
    style={{
      width: 380,
      flexShrink: 0,
      background: C.panel,
      borderRight: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      opacity: reveal,
      transform: `translateX(${(1 - reveal) * -30}px)`,
    }}
  >
    {/* Header lista */}
    <div style={{ padding: "16px 16px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ color: C.text, fontWeight: 700, fontSize: 17 }}>Conversaciones</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, background: C.accentSoft, borderRadius: 6, padding: "2px 8px", transform: `scale(${flash})`, display: "inline-block" }}>{count}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: C.orange, background: C.orangeSoft, borderRadius: 6, padding: "2px 8px", transform: `scale(${flash})`, display: "inline-block" }}>{sinLeer} sin leer</span>
      </div>
      {/* Buscador */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px" }}>
        <Search style={{ width: 16, height: 16, color: C.muted }} />
        <span style={{ color: C.faint, fontSize: 14 }}>Buscar…</span>
      </div>
      {/* Filtros */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
        {[
          { label: "Todas", icon: null },
          { label: "Recientes", icon: null },
          { label: "Etiquetas", icon: <Tag style={{ width: 13, height: 13 }} /> },
          { label: "Todos", icon: null },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", color: C.muted, fontSize: 13 }}>
            {f.icon}
            {f.label}
            <div style={{ flex: 1 }} />
            <ChevronDown style={{ width: 13, height: 13 }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", color: C.muted, fontSize: 13, marginTop: 8 }}>
        <Phone style={{ width: 13, height: 13 }} />
        Todos los números
        <div style={{ flex: 1 }} />
        <ChevronDown style={{ width: 13, height: 13 }} />
      </div>
    </div>

    {/* Tarjetas — entran EN ORDEN y la lista hace SCROLL para que quepan todas */}
    <div style={{ flex: 1, overflow: "hidden", paddingTop: 4 }}>
     <div style={{ transform: `translateY(${-scroll}px)` }}>
      {(shownList as any[]).map((it, i) => {
        const real = !it.filler;
        const steps: Step[] = real ? it.steps : [{ who: "c", text: it.first, tags: ["interesado"] }];
        const evolves = real && it.evolve;
        let stepIdx: number;
        let stepProg: number;
        if (evolves) {
          // Evolución en vivo: paso según el reloj local desde evolveAt.
          const local = frame - it.evolveAt;
          stepIdx = local < 0 ? 0 : Math.min(steps.length - 1, Math.floor(local / STEP_GAP));
          const stepStart = it.evolveAt + stepIdx * STEP_GAP;
          stepProg = stepIdx > 0
            ? interpolate(frame, [stepStart, stepStart + STEP_POP], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            : 1;
        } else {
          // Estáticas: resueltas (último paso), salvo Andrés/filler = paso 0 (sin leer).
          stepIdx = real && !it.sel ? steps.length - 1 : 0;
          stepProg = 1;
        }
        const cur = steps[stepIdx];
        const prev = stepIdx > 0 ? steps[stepIdx - 1] : null;
        const lastMsg = cur.text;
        const isBot = cur.who === "b";
        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 16px",
              background: it.sel ? C.accentSoft : "transparent",
              borderLeft: `3px solid ${it.sel ? C.accent : "transparent"}`,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <Avatar ini={it.ini} size={44} bg={it.sel ? "rgba(77,130,255,0.25)" : "rgba(255,255,255,0.06)"} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.text, fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</span>
                <div style={{ flex: 1 }} />
                <span style={{ color: C.faint, fontSize: 12, flexShrink: 0 }}>Hoy</span>
              </div>
              <div style={{ color: C.faint, fontSize: 12, marginTop: 1 }}>{it.num}</div>
              {/* Último mensaje del paso actual. Si responde el bot, va el ícono
                  del bot al lado (paso "b"). Cambia con un fade al avanzar el paso. */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, minWidth: 0, opacity: 0.35 + stepProg * 0.65 }}>
                {isBot && (
                  <span style={{ color: C.accent, display: "inline-flex", flexShrink: 0 }}>
                    <BotFace size={14} />
                  </span>
                )}
                <span style={{ color: isBot ? C.text : C.muted, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lastMsg}</span>
              </div>
              {/* Etiquetas ACUMULADAS del paso actual; las nuevas hacen "pop". */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, height: 26, marginTop: 7 }}>
                {cur.tags.map((t) => {
                  const isNew = !prev || !prev.tags.includes(t);
                  return <ListTag key={t} kind={t} label="" pop={isNew ? stepProg : 1} />;
                })}
              </div>
            </div>
          </div>
        );
      })}
     </div>
    </div>
  </div>
  );
};

const ChatBubble: React.FC<{ who: "client" | "biz"; text: string; t: string; compact?: boolean }> = ({
  who,
  text,
  t,
  compact = false,
}) => {
  const C = React.useContext(CrmCtx);
  const isClient = who === "client";
  // Versión ORIGINAL compacta del CRM (burbujas chicas, sin avatar).
  if (compact) {
    return (
      <div style={{ display: "flex", justifyContent: isClient ? "flex-start" : "flex-end" }}>
        <div style={{ maxWidth: "72%", background: isClient ? C.bubbleIn : C.accent, border: isClient ? `1px solid ${C.border}` : "none", borderRadius: 14, borderTopLeftRadius: isClient ? 4 : 14, borderTopRightRadius: isClient ? 14 : 4, padding: "10px 14px 7px", color: isClient ? C.text : "#fff", fontSize: 16, lineHeight: 1.4 }}>
          {text}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, marginTop: 3 }}>
            <span style={{ color: isClient ? C.faint : "rgba(255,255,255,0.7)", fontSize: 12 }}>{t}</span>
            {!isClient && <CheckCheck style={{ width: 14, height: 14, color: "rgba(255,255,255,0.9)" }} />}
          </div>
        </div>
      </div>
    );
  }
  // Estilo como el chat de "Configura tu bot": burbujas grandes, azules a la
  // derecha, con avatar a la izquierda y buen espaciado.
  return (
    <div style={{ display: "flex", flexDirection: isClient ? "row" : "row-reverse", alignItems: "flex-end", gap: 12 }}>
      {isClient && <Avatar ini={CLIENT.ini} size={48} />}
      <div
        style={{
          maxWidth: 700,
          background: isClient ? C.bubbleIn : C.accent,
          border: isClient ? `1px solid ${C.border}` : "none",
          borderRadius: 26,
          borderBottomLeftRadius: isClient ? 6 : 26,
          borderBottomRightRadius: isClient ? 26 : 6,
          padding: "18px 24px",
          color: isClient ? C.text : "#fff",
          fontSize: 26,
          lineHeight: 1.35,
          fontWeight: 500,
          boxShadow: "0 14px 36px rgba(0,0,0,0.35)",
        }}
      >
        {text}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 6 }}>
          <span style={{ color: isClient ? C.faint : "rgba(255,255,255,0.7)", fontSize: 15 }}>{t}</span>
          {!isClient && <CheckCheck style={{ width: 16, height: 16, color: "rgba(255,255,255,0.9)" }} />}
        </div>
      </div>
    </div>
  );
};

const EscalationBanner: React.FC = () => {
  const C = React.useContext(CrmCtx);
  return (
  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", margin: "4px 0" }}>
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.orangeSoft, border: "1px solid rgba(245,158,11,0.35)", color: C.orange, borderRadius: 9, padding: "8px 14px", fontSize: 13.5, fontWeight: 600 }}>
      <span>⚠️</span>
      Bot escaló a un asesor: cliente listo para inscribirse.
      <span style={{ color: "rgba(245,158,11,0.7)", fontWeight: 500 }}>· 21:00</span>
    </div>
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentSoft, border: "1px solid rgba(77,130,255,0.35)", color: C.accent, borderRadius: 9, padding: "7px 14px", fontSize: 13, fontWeight: 600 }}>
      <span>📋</span>
      {AGENT}: Resumen IA — cliente decidido, listo para pago.
      <span style={{ color: "rgba(77,130,255,0.7)", fontWeight: 500 }}>· 21:00</span>
    </div>
  </div>
  );
};

const ChatColumn: React.FC<{ reveal: number; chatFrame: number; fps: number; escalated: boolean; msgAt: number[]; msgOpacity?: number; bannerInline?: number; compact?: boolean }> = ({ reveal, chatFrame, fps, escalated, msgAt, msgOpacity = 1, bannerInline = 0, compact = false }) => {
  const C = React.useContext(CrmCtx);
  return (
  <div style={{ width: 1080, flexShrink: 0, background: C.bg, display: "flex", flexDirection: "column", opacity: reveal }}>
    {/* Header chat */}
    <div style={{ height: 66, flexShrink: 0, display: "flex", alignItems: "center", gap: 12, padding: "0 20px", background: C.panel, borderBottom: `1px solid ${C.border}` }}>
      <Avatar ini={CLIENT.ini} size={42} />
      <div style={{ flex: 1 }}>
        <div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{CLIENT.name}</div>
        <div style={{ color: C.faint, fontSize: 13 }}>{CLIENT.num}</div>
      </div>
      <Info style={{ width: 20, height: 20, color: C.muted }} />
      <MoreVertical style={{ width: 20, height: 20, color: C.muted }} />
    </div>

    {/* Mensajes */}
    <div style={{ flex: 1, overflow: "hidden", padding: compact ? "20px 24px" : "28px 34px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: compact ? 12 : 22, opacity: msgOpacity }}>
      {MSGS.map((m, i) => {
        if (chatFrame < msgAt[i]) return null;
        const enter = spring({ frame: chatFrame - msgAt[i], fps, config: smoothSpring });
        return (
          <React.Fragment key={i}>
            <div style={{ opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [16, 0])}px)` }}>
              <ChatBubble who={m.who} text={m.text} t={m.t} compact={compact} />
            </div>
            {i === ESCALATION_AFTER && escalated && bannerInline > 0.01 && (
              <div style={{ opacity: bannerInline }}>
                <EscalationBanner />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>

    {/* Barra de escribir + bot pausado */}
    <div style={{ flexShrink: 0, padding: "10px 20px 16px", background: C.panel, borderTop: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: C.orange }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: C.orange }} />
          Bot pausado
        </span>
        <div style={{ flex: 1 }} />
        <Paperclip style={{ width: 17, height: 17, color: C.muted }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px" }}>
        <Plus style={{ width: 18, height: 18, color: C.muted }} />
        <span style={{ flex: 1, color: C.faint, fontSize: 15 }}>Escribe un mensaje… (usa / para atajos)</span>
        <Smile style={{ width: 18, height: 18, color: C.muted }} />
        <Mic style={{ width: 18, height: 18, color: C.muted }} />
        <div style={{ width: 34, height: 34, borderRadius: 999, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Send style={{ width: 17, height: 17, color: "#fff" }} />
        </div>
      </div>
    </div>
  </div>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode; add?: boolean }> = ({
  label,
  children,
  add,
}) => {
  const C = React.useContext(CrmCtx);
  return (
  <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.muted, fontSize: 13, marginBottom: 10 }}>
      {label}
      {add && <Plus style={{ width: 14, height: 14 }} />}
    </div>
    {children}
  </div>
  );
};

const ContactColumn: React.FC<{ reveal: number; vendorAssigned: boolean; iaPaused: boolean }> = ({ reveal, vendorAssigned, iaPaused }) => {
  const C = React.useContext(CrmCtx);
  return (
  <div style={{ width: 360, flexShrink: 0, background: C.panel, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden", opacity: reveal, transform: `translateX(${(1 - reveal) * 30}px)` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px", borderBottom: `1px solid ${C.border}` }}>
      <UserRound style={{ width: 18, height: 18, color: C.accent }} />
      <span style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>Información del Contacto</span>
      <div style={{ flex: 1 }} />
      <X style={{ width: 18, height: 18, color: C.muted }} />
    </div>

    {/* Avatar grande */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 18px 18px", borderBottom: `1px solid ${C.border}` }}>
      <Avatar ini={CLIENT.ini} size={92} />
      <div style={{ color: C.text, fontWeight: 700, fontSize: 20, marginTop: 12 }}>{CLIENT.name}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.faint, fontSize: 13, marginTop: 4 }}>
        <Phone style={{ width: 13, height: 13 }} />
        {CLIENT.num}
      </div>
    </div>

    <Row label="Etiquetas" add>
      <ListTag label={BUSINESS} kind="biz" />
    </Row>
    <Row label="Vendedor" add>
      {vendorAssigned ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: C.accent, background: C.accentSoft, border: "1px solid rgba(77,130,255,0.3)", borderRadius: 8, padding: "5px 11px" }}>
          <UserRound style={{ width: 14, height: 14 }} />
          {AGENT}
        </span>
      ) : (
        <span style={{ color: C.faint, fontSize: 13 }}>Sin asignar</span>
      )}
    </Row>

    {/* Asistente IA: activa hasta la escala; ahí pasa a pausada (silencioso) */}
    <Row label="Asistente IA">
      {iaPaused ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.redSoft, border: "1px solid rgba(239,68,68,0.3)", borderRadius: 9, padding: "10px 12px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: C.red }} />
          <span style={{ color: C.red, fontWeight: 700, fontSize: 14 }}>IA pausada</span>
          <div style={{ flex: 1 }} />
          <span style={{ color: C.accent, fontSize: 13, fontWeight: 600 }}>Reactivar</span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 9, padding: "10px 12px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: C.green }} />
          <span style={{ color: C.green, fontWeight: 700, fontSize: 14 }}>IA activa</span>
          <div style={{ flex: 1 }} />
          <span style={{ color: C.faint, fontSize: 13, fontWeight: 600 }}>Respondiendo…</span>
        </div>
      )}
    </Row>

    {/* Estado */}
    <Row label="Estado de la Conversación">
      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: C.muted }}>Estado</span>
          <span style={{ color: C.green, fontWeight: 600, display: "inline-flex", gap: 5, alignItems: "center" }}><Check style={{ width: 13, height: 13 }} />Activa</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: C.muted }}>Ventana 24h</span>
          <span style={{ color: C.red, fontWeight: 600 }}>Expirada</span>
        </div>
      </div>
    </Row>
  </div>
  );
};

// La Escena 3 ya NO arranca con el caos flotando: empieza directo en la SUCCIÓN
// de los chats a la columna 1 (como termina la Escena 1). Se logra desfasando el
// reloj interno de la escena: arranca en el frame ~INTRO_SKIP (donde los chats
// empiezan a volar a la lista), saltándose la fase de flotar. La escena queda
// INTRO_SKIP frames más corta.
const INTRO_SKIP = 158;

export const Conversation: React.FC<{ theme?: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame() + INTRO_SKIP;
  const { fps } = useVideoConfig();

  // Tema del FONDO (para el texto flotante, que debe contrastar con el fondo).
  const T = theme ?? getTheme("dark");
  // Paleta del CRM: oscura en fondo oscuro, clara en fondo claro.
  const C = T.name === "light" ? crmLight : crmDark;
  // Color del texto flotante: blanco en fondo oscuro; azul de marca en claro.
  const floatText = floatingTextColor(T);
  // Sombra de las tarjetas.
  const glassGlow =
    T.name === "light"
      ? "0 50px 130px rgba(20,40,90,0.28)"
      : "0 50px 130px rgba(0,0,0,0.6), 0 0 120px rgba(77,130,255,0.22)";

  // El CRM aparece como una VENTANA FLOTANTE recortada (rounded + glow + sombra
  // sobre el degradado, como el chat de la Escena 2). Se ENSAMBLA por partes:
  // primero la columna IZQUIERDA, luego el CENTRO, luego la DERECHA — la ventana
  // se va EXPANDIENDO a la derecha.
  // === Presentación por FLIPS: una tarjeta central voltea entre las 3 columnas
  // (lista → chat → contacto) y al final se DESLIZA a la derecha desplegando el
  // CRM completo. El flip a 90° (canto) oculta el intercambio de cara. ===
  const CLICK_AT = 256; // click al terminar el re-etiquetado (justo, sin estirón)
  const HF = 8; // media vuelta del giro columna 1 → columna 2 (más rápido)
  const HFC = 5; // media vuelta MÁS RÁPIDA para los giros de la columna 3 (contacto)

  // Flip 1: lista → chat (al hacer click). El chat arranca al terminar el flip.
  const F1 = CLICK_AT;
  const CHAT_START = F1 + 2 * HF + 2;
  const MSG_GAP = 18;
  const chatFrame = frame - CHAT_START;

  // Escalada al asesor tras el mensaje ESCALATION_AFTER (silenciosa para el cliente).
  const escFrame = CHAT_START + ESCALATION_AFTER * MSG_GAP + 26; // pausa antes de los banners
  const escalated = frame >= escFrame;
  // Re-etiqueta de Andrés en la LISTA (Interesado → Con asesor) al escalar.
  const andresRetag = spring({ frame: frame - escFrame, fps, config: smoothSpring });

  // Los dos mensajes de escala SUBEN desde abajo, centrados en pantalla sobre el
  // chat (overlay), se mantienen y se van. `focus` los anima (0 → 1 → 0).
  const FOCUS_DUR = 26; // sube y CASI enseguida el flip se lo lleva (poco tiempo)
  // El banner SUBE y se QUEDA en 1 (no se desvanece solo); el flip a contacto lo saca.
  const focus = interpolate(frame, [escFrame, escFrame + 12], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // === TOUR de cámara por la LISTA (columna 1): zoom al "sin leer" (arriba) →
  // se mantiene mientras el número baja → paneo hacia abajo viendo el
  // reetiquetado → termina en la fila de Andrés (donde ocurre el click). ===
  // Durante TODO el reetiquetado, la lista se corre a la DERECHA y a la izquierda
  // se queda la frase "Asignación de etiquetas" (describe el reetiquetado). La
  // frase se va cuando la lista vuelve al centro, justo antes de girar a la col. 2.
  const phraseP = interpolate(frame, [166, 174, 256, 261], [0, 1, 1, 0], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Se MANTIENE el zoom durante todo el re-etiquetado (sin alejarse), para que se
  // vean cambiar las etiquetas; solo la CY panea por las filas.
  const baseCS = interpolate(frame, [100, 118, CLICK_AT, CLICK_AT + 24], [1, 1.75, 1.75, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const baseCY = interpolate(frame, [100, 118, CLICK_AT, CLICK_AT + 24], [540, 460, 470, 540], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // La frase sale SOLO desplazando la lista a la DERECHA (sin zoom-out ni bajar).
  const tourCS = baseCS;
  const tourCX = 960 - phraseP * 280; // la lista queda a la DERECHA (hueco a la izquierda)
  const tourCY = baseCY;

  // Entrada en TORNILLO de la columna (reverso de cómo SALIÓ en la Escena 1): al
  // inicio de la escena sube desde abajo GIRANDO. Solo afecta los ~16 primeros frames.
  const screwIn = interpolate(frame, [INTRO_SKIP, INTRO_SKIP + 14], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const screwY = (1 - screwIn) * 120; // sube desde abajo (se duplica por el zoom 2×)
  const screwRot = (1 - screwIn) * 180; // rotateY media vuelta (entra de espaldas y gira al frente)
  const screwScale = 1 - (1 - screwIn) * 0.35;

  // Frase "Bot autónomo": aparece DESDE ARRIBA cuando el bot manda su primer
  // mensaje y se queda arriba del chat (durante la conversación).
  // "Bot autónomo" aparece CON el zoom del chat (al abrirse la columna 2), y baja
  // el cuadro para que se vea el nombre de Andrés desde el inicio del zoom.
  const botPhraseP = interpolate(frame, [F1 + 2 * HF, F1 + 2 * HF + 16, escFrame - 4, escFrame + 10], [0, 1, 1, 0], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Flip 2: chat → contacto (arranca al terminar el "quedarse" del banner). El
  // banner gira DENTRO del cuadro de chat, así que no se vuelve a ver el chat.
  const F2 = escFrame + FOCUS_DUR;

  // La columna 3 aparece SIN vendedor y con IA ACTIVA; luego un ZOOM al área de
  // vendedor/IA asigna a Ana Gómez y PAUSA la IA.
  const CONTACT_SHOWN = F2 + 2 * HFC; // contacto ya visible tras el flip (más rápido)
  const CZOOM_AT = CONTACT_SHOWN + 8; // arranca el zoom
  const CZ_DUR = 30; // zoom → asigna Ana → pausa IA → aleja (bien ágil)
  const F3 = CZOOM_AT + CZ_DUR + 4; // flip contacto → chat (fin de la columna 3)
  // Frase "La asignación a un vendedor es automática": cuando SALE el banner
  // naranja, la columna 2/3 se corre a la DERECHA y a la izquierda entra la frase,
  // que se queda hasta el FINAL de la columna 3 (F3).
  const phrase2P = interpolate(frame, [escFrame, escFrame + 20, F3 - 8, F3 + 2], [0, 1, 1, 0], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const DECK_SHIFT = 240; // cuánto se corre la columna a la derecha
  const czIn = interpolate(frame, [CZOOM_AT, CZOOM_AT + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const czOut = interpolate(frame, [CZOOM_AT + CZ_DUR - 5, CZOOM_AT + CZ_DUR], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const czFocus = Math.min(czIn, czOut); // 0 → 1 → 0
  // En pleno zoom, esperas muy cortas: primero se ASIGNA Ana, luego se PAUSA la IA.
  const vendorAssigned = frame >= CZOOM_AT + 10;
  const iaClickFrame = CZOOM_AT + 16; // el cursor hace click en la IA → pausada
  const iaPaused = frame >= iaClickFrame;

  // Cámara: tour por la lista + ZOOM al vendedor/IA de la columna 3 (no se solapan).
  const CZY = 420; // centro Y del área vendedor/IA (encuadre más arriba)
  const czScale = interpolate(czFocus, [0, 1], [1, 2.4]);
  const camCY = tourCY + (CZY - 540) * czFocus;
  // Al aparecer la columna 2 (chat) + "Bot autónomo", la cámara hace ZOOM para
  // que el chat LLENE la pantalla; vuelve a 1× antes de girar a la columna 3.
  // El chat hace ZOOM (llena la pantalla) en dos momentos: (1) columna 2 con "Bot
  // autónomo"; vuelve al original cuando aparece "Asignación automática" (escFrame).
  // (2) Al volver del contacto (F3) con los dos banners (Bot escaló + Ana Gómez),
  // el chat vuelve a hacer zoom como la columna 2; sale antes del convert (~F3+144).
  // Al reaparecer la conversación (settle, ~F3+70), el zoom BAJA a 1.15× para que
  // se vea el NOMBRE de Andrés (header) y el último mensaje; se queda así hasta el
  // cierre. Los banners grandes siguen a 1.45×.
  const chatZoom = interpolate(
    frame,
    [F1 + 2 * HF, F1 + 2 * HF + 20, escFrame - 12, escFrame, F3 + HFC, F3 + 2 * HFC + 8, F3 + 70, F3 + 98],
    [1, 1.45, 1.45, 1, 1, 1.45, 1.45, 1.15],
    { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const zScale = tourCS * czScale * chatZoom;
  // Durante el ZOOM de contacto, la cámara SIGUE el corrimiento del deck (para
  // encuadrar el contacto que está a la derecha). En la escalada (sin zoom) no lo
  // sigue: el deck se ve corrido a la derecha y la frase queda a la izquierda.
  const camCX = tourCX + phrase2P * czFocus * DECK_SHIFT;
  // En el zoom de contacto, el contacto se QUEDA a la derecha (no se re-centra),
  // dejando la frase libre a la izquierda.
  const zTx = 960 - camCX * zScale + phrase2P * czFocus * 320;
  const zTy = 540 - camCY * zScale;

  // Tras pausar la IA: se aleja (czOut) y GIRA de vuelta a la columna 2 (chat)
  // con el banner naranja; luego sube el banner AZUL.
  const BLUE_AT = F3 + 2 * HFC + 2; // sube el banner azul (Ana Gómez), enseguida del giro
  const blueFocus = interpolate(frame, [BLUE_AT, BLUE_AT + 15], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Los dos banners un momento, luego vuelven a su puesto (inline) y aparecen mensajes.
  const SETTLE_AT = BLUE_AT + 24;
  const SETTLE_DUR = 22;
  const settleP = interpolate(frame, [SETTLE_AT, SETTLE_AT + SETTLE_DUR], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Mensajes: visibles en la conversación; OCULTOS durante los banners; REAPARECEN en el settle.
  const chatMsgOpacity = frame < SETTLE_AT
    ? 1 - interpolate(frame, [escFrame, escFrame + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : settleP;
  // Al final del encogido, los banners inline (en el flujo) toman el relevo.
  const inlineFade = interpolate(settleP, [0.82, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // El CUADRO de chat (header/fondo/barra/mensajes) se OCULTA mientras los banners
  // están GRANDES → solo se ven los banners sobre el fondo. Reaparece (junto con
  // los mensajes) en el settle.
  const chatBoxOpacity = 1 - focus * (1 - settleP);
  // Tras el último mensaje ("¿Qué método de pago prefieres?"): nos QUEDAMOS en el
  // chat una pausa para leerlo y arranca el cierre (el mensaje se centra y gira).
  // Ya NO se compacta el chat ni se arma el CRM completo.
  const ANA_AT = SETTLE_AT + SETTLE_DUR + 12; // último mensaje
  const convertP = 0; // sin conversión a versión compacta (el chat se queda)

  // Estado del deck: qué cara está al frente (0=lista, 1=chat, 2=contacto) y su rotación.
  let face = 0;
  let deckRot = 0;
  if (frame < F1) { face = 0; deckRot = 0; }
  else if (frame < F1 + HF) { face = 0; deckRot = interpolate(frame, [F1, F1 + HF], [0, 90]); }
  else if (frame < F1 + 2 * HF) { face = 1; deckRot = interpolate(frame, [F1 + HF, F1 + 2 * HF], [-90, 0]); }
  else if (frame < F2) { face = 1; deckRot = 0; }
  else if (frame < F2 + HFC) { face = 1; deckRot = interpolate(frame, [F2, F2 + HFC], [0, 90]); }
  else if (frame < F2 + 2 * HFC) { face = 2; deckRot = interpolate(frame, [F2 + HFC, F2 + 2 * HFC], [-90, 0]); }
  else if (frame < F3) { face = 2; deckRot = 0; }
  else if (frame < F3 + HFC) { face = 2; deckRot = interpolate(frame, [F3, F3 + HFC], [0, 90]); }
  else if (frame < F3 + 2 * HFC) { face = 1; deckRot = interpolate(frame, [F3 + HFC, F3 + 2 * HFC], [-90, 0]); }
  else { face = 1; deckRot = 0; }

  const msgAt = MSGS.map((_, i) => (i <= ESCALATION_AFTER ? i * MSG_GAP : ANA_AT - CHAT_START));

  // --- Cierre: el ÚLTIMO mensaje se CENTRA y DA VUELTA → bot GUIÑA → logo Altam ---
  const ANA_FRAME = CHAT_START + msgAt[MSGS.length - 1]; // frame del último mensaje
  const END_START = ANA_FRAME + 22; // pausa para leer el mensaje y arranca el cierre
  const e = frame - END_START;
  const inEnding = e >= 0;
  const FD = 16; // duración de un flip de cierre (giro del chat → robot, más rápido)
  // Cuando ya salió el último mensaje, TODO el chat DA LA VUELTA (rotateY) en su
  // sitio (zoomeado) y detrás aparece el ROBOT que guiña. Sin subir el mensaje.
  const crmRotY = interpolate(e, [0, FD], [0, 90], { easing: Easing.in(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const crmOp = interpolate(e, [FD - 8, FD], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // El cromo de la tarjeta (fondo/borde/glow) se desvanece cuando los banners están
  // grandes (chatBoxOpacity). En el cierre gira completo (no se desvanece por separado).
  const chromeOn = face === 1 ? chatBoxOpacity : 1;
  const cardGlow =
    T.name === "light"
      ? `0 50px 130px rgba(20,40,90,${0.28 * chromeOn})`
      : `0 50px 130px rgba(0,0,0,${0.6 * chromeOn}), 0 0 120px rgba(77,130,255,${0.22 * chromeOn})`;
  const BOT_OUT = FD * 2 + 18; // se voltea enseguida tras guiñar (el logo aparece antes)
  const botRot =
    interpolate(e, [FD, FD * 2], [-90, 0], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" }) +
    interpolate(e, [BOT_OUT, BOT_OUT + FD], [0, 90], { easing: Easing.in(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const botOp = interpolate(e, [FD + 4, FD + 12, BOT_OUT + FD - 10, BOT_OUT + FD - 2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const botWink = interpolate(e, [FD * 2 + 2, FD * 2 + 6, FD * 2 + 16, FD * 2 + 20], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoRot = interpolate(e, [BOT_OUT + FD, BOT_OUT + FD * 2], [-90, 0], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoOp = interpolate(e, [BOT_OUT + FD + 4, BOT_OUT + FD + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // El logo aparece centrado (mismo lugar/tamaño que el bot) y luego SUBE a su
  // posición final; ahí aparece el mensaje de cierre (altam. + CTA).
  const logoRise = interpolate(e, [BOT_OUT + FD * 2, BOT_OUT + FD * 2 + 16], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const columnY = interpolate(logoRise, [0, 1], [170, 0]); // baja el bloque para que el logo quede en el centro, luego sube
  const logoSettle = BOT_OUT + FD * 2 + 16;
  // Las líneas de cierre (altam. / Control comercial real / altam.io) aparecen más juntas y rápidas.
  const closeMsg = (d: number) => interpolate(e, [logoSettle + d, logoSettle + d + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // (Se eliminó la frase "para equipos… cerrar más ventas / sin perder el control"
  // y el ensamblaje del CRM completo: el cierre ocurre dentro del chat.)
  const crmLower = 0;

  // Entrada del deck: la primera tarjeta (lista) se levanta mientras los chats
  // son succionados.
  const winEnter = spring({ frame: frame - RISE_AT, fps, config: smoothSpring });

  // Cursor que hace click en Andrés. ENTRA en pantalla DESPUÉS de que termina el
  // reetiquetado (no antes), se mueve a su fila y hace click.
  const cursorStart = CLICK_AT - 30; // entra antes → LLEGA → click → se va (antes de centrar)
  const cursorMove = spring({ frame: frame - cursorStart, fps, config: smoothSpring });
  const cursorX = interpolate(cursorMove, [0, 1], [1320, 1150]);
  const cursorY = interpolate(cursorMove, [0, 1], [420, 575]);
  // La flecha aparece, hace el click ~CLICK_AT-16 y DESAPARECE antes de que la
  // columna se centre (CLICK_AT).
  const cursorOp = interpolate(frame, [cursorStart, cursorStart + 6, CLICK_AT - 5, CLICK_AT], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursorPress = interpolate(frame, [CLICK_AT - 12, CLICK_AT - 9, CLICK_AT - 4], [1, 0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Cursor que hace CLICK en la fila "IA activa" (dentro del contacto, con zoom)
  // para pausarla. Está en la misma capa → queda sobre la fila al hacer zoom.
  const iaCurStart = iaClickFrame - 16;
  const iaCurMove = spring({ frame: frame - iaCurStart, fps, config: smoothSpring });
  const iaCurX = interpolate(iaCurMove, [0, 1], [1140, 940]) + phrase2P * DECK_SHIFT; // sigue el corrimiento del deck
  const iaCurY = interpolate(iaCurMove, [0, 1], [470, 572]);
  const iaCurOp = interpolate(frame, [iaCurStart, iaCurStart + 6, iaClickFrame + 20, iaClickFrame + 28], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const iaCurPress = interpolate(frame, [iaClickFrame, iaClickFrame + 3, iaClickFrame + 9], [1, 0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <CrmCtx.Provider value={C}>
    <AbsoluteFill style={{ perspective: 2000 }}>
      {/* Pre-carga del LOGO.png desde el frame 0: la máscara CSS del logo del cierre
          NO la pre-carga Remotion, así que sin esto el logo "tarda en cargarse" al
          final. Un <Img> oculto lo deja en caché mucho antes. */}
      <Img
        src={staticFile("LOGO.png")}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      />
      {/* Frase DETRÁS del CRM: sale de atrás de la columna 1 al desplazarse la
          lista (la lista opaca la va destapando). */}
      {phraseP > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: 90,
            top: 0,
            height: "100%",
            width: 900,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            transform: `translateX(${(1 - phraseP) * 380}px)`,
            pointerEvents: "none",
          }}
        >
          <div style={{ color: floatText, fontWeight: 800, fontSize: 120, lineHeight: 1.03, letterSpacing: "-0.025em", textShadow: floatingTextShadow(T, "0 12px 50px rgba(0,0,0,0.6)") }}>
            Asignación de<br />etiquetas
          </div>
        </div>
      )}

      {/* Frase 2 DETRÁS del CRM: sale de atrás de la columna 2/3 al correrse a la
          derecha, y se queda hasta el final de la columna 3. */}
      {phrase2P > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: 90,
            top: 0,
            height: "100%",
            width: 640,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            transform: `translateX(${(1 - phrase2P) * 260}px)`,
            pointerEvents: "none",
          }}
        >
          <div style={{ color: floatText, fontWeight: 800, fontSize: 78, lineHeight: 1.08, letterSpacing: "-0.02em", textShadow: floatingTextShadow(T, "0 12px 50px rgba(0,0,0,0.6)") }}>
            Asignación automática de vendedor
          </div>
        </div>
      )}

      {/* Cara CRM: durante el cierre se DESVANECE en su sitio (la burbuja del
          mensaje toma el relevo, se centra y gira). */}
      <AbsoluteFill
        style={{
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          opacity: 1,
          transformOrigin: "0 0",
          transform: `translate(${zTx}px, ${zTy}px) scale(${zScale})`,
        }}
      >
      {/* DECK: tarjeta central que voltea (rotateY) entre lista → chat → contacto.
          Cada cara es una columna como su propia tarjeta flotante. */}
      {frame >= RISE_AT - 8 && convertP < 1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            perspective: 1800,
            opacity: 1 - convertP,
            // La columna se corre a la DERECHA mientras está la frase "La asignación…"
            transform: `translateX(${phrase2P * DECK_SHIFT}px)`,
          }}
        >
          <div
            style={{
              width: FACE_W[face],
              // La altura del cuadro se REDUCE cuando aparece "Bot autónomo", para
              // darle espacio a la frase arriba (solo la altura).
              height: WIN_H - botPhraseP * 300 - crmLower,
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: cardGlow,
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              // En el CIERRE, la tarjeta entera DA LA VUELTA (rotateY) en su sitio.
              transform: `translateZ(${-convertP * 520}px) translateY(${botPhraseP * 150 + crmLower / 2 + screwY}px) rotateY(${deckRot + screwRot + (inEnding ? crmRotY : 0)}deg) scale(${screwScale})`,
              opacity: (face === 0 ? interpolate(winEnter, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }) : 1) * (inEnding ? crmOp : 1),
            }}
          >
            {/* Cromo de la tarjeta (fondo + borde): se desvanece con el cuadro de
                chat cuando los banners están grandes. */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: C.bg, border: `1px solid ${C.border2}`, opacity: chromeOn }} />
            {face === 0 && (
              <div style={{ width: W_LEFT, height: "100%", display: "flex" }}>
                <ListColumn frame={frame} fps={fps} reveal={1} escProgress={andresRetag} />
              </div>
            )}
            {face === 1 && (
              <div style={{ width: W_CENTER, height: "100%", display: "flex", position: "relative" }}>
                <ChatColumn reveal={chatBoxOpacity} chatFrame={chatFrame} fps={fps} escalated={escalated} msgAt={msgAt} msgOpacity={chatMsgOpacity} bannerInline={inlineFade} />
                {/* Banners de escala DENTRO del cuadro de chat: suben, crecen y GIRAN
                    con la tarjeta. El naranja primero; el azul sube después. En el
                    "settle" se desvanecen (los inline reaparecen abajo de los mensajes). */}
                {(focus > 0.01 || blueFocus > 0.01) && inlineFade < 1 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 18,
                      pointerEvents: "none",
                      // SETTLE: se ENCOGEN y bajan hasta su puesto (abajo de los mensajes).
                      transform: `translateY(${settleP * 300}px) scale(${1 - settleP * 0.58})`,
                      transformOrigin: "center center",
                      opacity: 1 - inlineFade,
                    }}
                  >
                    <div style={{ opacity: focus, transform: `translateY(${(1 - focus) * 300}px) scale(${interpolate(focus, [0, 1], [0.4, 1])})`, transformOrigin: "center center" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 16, maxWidth: 1000, background: `linear-gradient(rgba(245,158,11,0.16), rgba(245,158,11,0.16)), ${C.panel}`, border: "1px solid rgba(245,158,11,0.4)", color: C.orange, borderRadius: 16, padding: "22px 32px", fontSize: 34, fontWeight: 700, lineHeight: 1.25, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
                        <span style={{ fontSize: 42, flexShrink: 0 }}>⚠️</span>
                        <span>Bot escaló a un asesor: cliente listo para inscribirse.</span>
                      </div>
                    </div>
                    {blueFocus > 0.01 && (
                      <div style={{ opacity: blueFocus, transform: `translateY(${(1 - blueFocus) * 300}px) scale(${interpolate(blueFocus, [0, 1], [0.4, 1])})`, transformOrigin: "center center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 16, maxWidth: 1000, background: `linear-gradient(rgba(77,130,255,0.18), rgba(77,130,255,0.18)), ${C.panel}`, border: "1px solid rgba(77,130,255,0.4)", color: C.accent, borderRadius: 16, padding: "20px 30px", fontSize: 30, fontWeight: 700, lineHeight: 1.25, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
                          <span style={{ fontSize: 38, flexShrink: 0 }}>📋</span>
                          <span>{AGENT}: Resumen IA — cliente decidido, listo para pago.</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {face === 2 && (
              <div style={{ width: W_RIGHT, height: "100%", display: "flex" }}>
                <ContactColumn reveal={1} vendorAssigned={vendorAssigned} iaPaused={iaPaused} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Intro: caos de la Escena 1 siendo SUCCIONADO al centro (sobre el CRM
          que se levanta), hasta ordenarse en la lista. */}
      {frame < INTRO_END + 16 && <ChaosIntro frame={frame} theme={T} />}

      {/* --- Audio — DESACTIVADO TEMPORALMENTE para iterar sin el bug del preview
          ("Maximum update depth"). Reactivar/bakear al cerrar la escena. --- */}
      {/* Sonidos de la escena HORNEADOS en UNA sola pista (scene3_fx.mp3): un
          único <Audio> NO rompe el preview del Studio (muchos <Audio> sí). Arranca
          con la escena (frame 0). Se horneó con ffmpeg desde el bloque de abajo
          (desactivado, = fuente de la designación). RE-HORNEAR si cambia el timing. */}
      <Audio src={SND_SCENE3} />

      {/* --- Designación original (fuente del bake). Desactivada: cada sonido en
          su beat vía frames INTERNOS, en un tramo desplazado -INTRO_SKIP. --- */}
      {false && (
      <Sequence from={-INTRO_SKIP}>
      {/* Pops de los chats (misma pista horneada de la Escena 1) */}
      <Sequence from={0} durationInFrames={168}>
        <Audio src={SND_POPS} volume={1.0} />
      </Sequence>
      {/* Swoosh en cada GIRO (flip) del deck: lista→chat, chat→contacto, contacto→chat */}
      {[F1, F2, F3].map((f, i) => (
        <Sequence key={`flip-${i}`} from={f} durationInFrames={20}>
          <Audio src={SND_SWOOSH} volume={0.85} playbackRate={1.15} />
        </Sequence>
      ))}
      {/* Swoosh cuando la lista se desplaza y sale "Asignación de etiquetas" */}
      <Sequence from={158} durationInFrames={22}>
        <Audio src={SND_SWOOSH} volume={0.8} playbackRate={1.1} />
      </Sequence>
      {/* Swoosh cuando la columna se corre a la derecha y sale "Asignación automática de vendedor" */}
      <Sequence from={escFrame} durationInFrames={22}>
        <Audio src={SND_SWOOSH} volume={0.8} playbackRate={1.1} />
      </Sequence>
      {/* Swoosh cuando baja "Bot autónomo" desde arriba */}
      <Sequence from={CHAT_START + MSG_GAP} durationInFrames={20}>
        <Audio src={SND_SWOOSH} volume={0.8} playbackRate={1.25} />
      </Sequence>
      {/* Campanita cuando el cliente manda "Ok, me convenciste 🙌 quiero inscribirme" */}
      <Sequence from={CHAT_START + ESCALATION_AFTER * MSG_GAP} durationInFrames={40}>
        <Audio src={SND_BELL} volume={1.0} />
      </Sequence>
      {/* Campana JUNTO al último mensaje de la conversación (Ana: "¿método de pago?") */}
      <Sequence from={ANA_FRAME} durationInFrames={44}>
        <Audio src={SND_BELL} volume={1.2} />
      </Sequence>
      {/* Parpadeo cuando el bot guiña */}
      <Sequence from={END_START + FD * 2 + 2} durationInFrames={20}>
        <Audio src={SND_BLINK} volume={1.35} />
      </Sequence>
      {/* Click del cursor al abrir el chat de Andrés (adelantado con la flecha) */}
      <Sequence from={CLICK_AT - 16} durationInFrames={12}>
        <Audio src={SND_CLICK} volume={1.35} />
      </Sequence>
      {/* Click del cursor al pausar la IA */}
      <Sequence from={iaClickFrame} durationInFrames={12}>
        <Audio src={SND_CLICK} volume={1.2} />
      </Sequence>
      </Sequence>
      )}

      {/* Cursor que hace CLICK en la fila "IA activa" (→ pausada) */}
      {frame >= iaCurStart && frame < iaClickFrame + 30 && (
        <div
          style={{
            position: "absolute",
            left: iaCurX,
            top: iaCurY,
            opacity: iaCurOp,
            transform: `scale(${iaCurPress})`,
            transformOrigin: "top left",
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.6))",
            pointerEvents: "none",
          }}
        >
          <MousePointer2 style={{ width: 32, height: 32, color: "#0b1220", fill: "#fff" }} />
        </div>
      )}
      </AbsoluteFill>

      {/* Cursor que hace click en Andrés — en ESPACIO DE PANTALLA (fuera del CRM
          transformado) para que no se descuadre con la cámara. */}
      {frame >= cursorStart && frame < CLICK_AT + 34 && (
        <div
          style={{
            position: "absolute",
            left: cursorX,
            top: cursorY,
            opacity: cursorOp,
            transform: `scale(${cursorPress})`,
            transformOrigin: "top left",
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.6))",
            pointerEvents: "none",
            zIndex: 50,
          }}
        >
          <MousePointer2 style={{ width: 36, height: 36, color: "#0b1220", fill: "#fff" }} />
        </div>
      )}

      {/* Frase "Bot autónomo" ARRIBA del chat (entra desde arriba) */}
      {botPhraseP > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            opacity: botPhraseP,
            transform: `translateY(${interpolate(botPhraseP, [0, 1], [-160, 34])}px)`,
            pointerEvents: "none",
          }}
        >
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            {/* Difuminado gradual DETRÁS de la frase (igual que el manifiesto):
                3 capas apiladas, sin tinte, que se desvanecen en los bordes. */}
            {[
              { w: 980, h: 360, blur: 14, solid: "56%", fade: "90%" },
              { w: 780, h: 280, blur: 30, solid: "52%", fade: "86%" },
              { w: 600, h: 210, blur: 55, solid: "48%", fade: "82%" },
            ].map((L, i) => (
              <div
                key={i}
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: L.w,
                  height: L.h,
                  transform: "translate(-50%, -50%)",
                  backdropFilter: `blur(${L.blur}px)`,
                  WebkitBackdropFilter: `blur(${L.blur}px)`,
                  WebkitMaskImage: `radial-gradient(ellipse 50% 50% at center, rgba(0,0,0,1) ${L.solid}, rgba(0,0,0,0) ${L.fade})`,
                  maskImage: `radial-gradient(ellipse 50% 50% at center, rgba(0,0,0,1) ${L.solid}, rgba(0,0,0,0) ${L.fade})`,
                  pointerEvents: "none",
                }}
              />
            ))}
            <div style={{ position: "relative", color: floatText, fontWeight: 800, fontSize: 120, letterSpacing: "-0.02em", textShadow: floatingTextShadow(T, "0 12px 50px rgba(0,0,0,0.65)") }}>
              Bot autónomo
            </div>
          </div>
        </div>
      )}

      {/* (El mensaje que sube/gira ya NO es una copia: es la burbuja real dentro del
          chat, animada con `close`.) */}

      {/* Cara BOT: aparece girando y GUIÑA (cierre) */}
      {inEnding && botOp > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: botOp }}>
          <div
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              transform: `rotateY(${botRot}deg)`,
              width: 280,
              height: 280,
              borderRadius: 999,
              background: T.accentSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.accent,
              boxShadow: `0 40px 120px rgba(0,0,0,0.55), 0 0 110px rgba(77,130,255,0.32)`,
            }}
          >
            <BotFace size={160} wink={botWink} />
          </div>
        </AbsoluteFill>
      )}

      {/* Cara LOGO + cierre — el final. El logo (BLANCO) aparece donde estaba el
          bot (centrado, mismo tamaño) y SUBE a su posición; luego el mensaje. */}
      {inEnding && logoOp > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: logoOp }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, transform: `translateY(${columnY}px)` }}>
            {/* Logo pintado de BLANCO (máscara) para resaltar en el fondo oscuro */}
            <div
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                transform: `rotateY(${logoRot}deg)`,
                width: 210,
                height: 170,
                backgroundColor: floatText,
                WebkitMaskImage: `url(${staticFile("LOGO.png")})`,
                maskImage: `url(${staticFile("LOGO.png")})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
            <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.04em", color: floatText, opacity: closeMsg(0), transform: `translateY(${interpolate(closeMsg(0), [0, 1], [16, 0])}px)` }}>
              altam<span style={{ color: T.accent }}>.</span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 500, color: T.name === "light" ? floatText : T.textMuted, opacity: closeMsg(9) }}>
              Control comercial real
            </div>
            <div style={{ color: T.name === "light" ? floatText : T.textMuted, fontSize: 24, fontWeight: 600, letterSpacing: "0.02em", opacity: closeMsg(18) }}>
              altam.io
            </div>
          </div>
        </AbsoluteFill>
      )}

    </AbsoluteFill>
    </CrmCtx.Provider>
  );
};
