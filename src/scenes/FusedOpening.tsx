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
import { Theme, floatingTextColor, floatingTextShadow } from "../theme";
import { smoothSpring } from "../components/anim";
import { AVATARS, crmDark, crmLight, LIST, RISE_AT } from "./Conversation";

// ---------------------------------------------------------------------------
// Escena 1 FUSIONADA (v3): el caos de chats se ORGANIZA literalmente dentro de
// la columna — cada conversación FLOTA y VUELA a su fila, y la lista hace SCROLL
// conforme entran (los viejos se van bajo el encabezado). Con ZOOM a la columna.
// La pregunta "¿Cuántas ventas…?" va encima del caos desenfocado; el manifiesto
// (caja 3D) va aparte, sincronizado con el levantamiento de la columna.
// ---------------------------------------------------------------------------

const SND_POPS = staticFile("sounds/pops.mp3");
const SND_POP = staticFile("sounds/bubble_pop.mp3");
// Todos los efectos de la escena HORNEADOS en una sola pista (no rompe el preview).
const SND_FUSED = staticFile("sounds/fused_fx.mp3");

// Geometría de la columna (centrada; corta para que quepa con más zoom).
const COL_W = 380;
const COL_H = 600;
const COL_LEFT = (1920 - COL_W) / 2; // 770
const COL_TOP = (1080 - COL_H) / 2; // 240
const HEADER_H = 150;
const ROW_H = 64;
const PAD = 16;
const CHAOS_W = 500;
const DOCK_W = COL_W - 2 * PAD; // 348
const DOCK_SCALE = DOCK_W / CHAOS_W; // ~0.696
const LIST_H = COL_H - HEADER_H - 12; // alto visible de la lista

// Timing de la succión (por conversación, en orden). Cada tarjeta APARECE justo
// antes de volar (sin pausa larga) y se reparten a lo largo de todo el llenado,
// para que fluyan continuamente hasta terminar de entrar.
const dockStartOf = (i: number) => 72 + i * 7;
const dockEndOf = (i: number) => dockStartOf(i) + 13;
const floatStartOf = (i: number) => dockStartOf(i) - 14;

// Flujo CONTINUO de mensajes de fondo (blureados): aparecen todo el tiempo y se
// renuevan, para que nunca haya "unos pocos congelados". Nombres de relleno.
const FNAMES = ["Paula", "Kevin", "Bruno", "Gabriela", "Óscar", "Renata", "Iván", "Melisa", "Tomás", "Fernanda", "Nicolás", "Sara", "Emilio", "Lucas", "Ariana", "Pablo", "Noa", "Vera", "Hugo", "Elsa", "Marco", "Lía", "Benja", "Rita"];
const FTEXTS = ["Hola, ¿sigue disponible?", "Me interesa 😊", "¿Cómo lo compro?", "¿Me das info?", "Quiero comprarlo", "¿Aún a la venta?", "¿Hola? ¿siguen ahí?", "Respondan porfa 😠", "¿Me responden?", "Sigo esperando 😤"];
// Distribución ORGÁNICA (secuencia R2 de baja discrepancia, sin banding). SIN
// offset en X: así la secuencia alcanza valores cerca de 0 (borde izquierdo) —
// que es justo lo que el offset anterior tapaba. fx puede ser negativo → cubre
// x=0. Reparto parejo por toda la pantalla sin líneas ni rejilla.
const FLOOD = Array.from({ length: 80 }).map((_, k) => {
  const n = k + 1;
  const fracX = (n * 0.7548776662) % 1;
  const fracY = (n * 0.5698402909) % 1;
  return {
    // start muy negativo en los primeros → MUCHOS ya presentes en frame 0.
    start: k * 2.2 - 34, // denso y continuo (~-34..140)
    life: 46,
    fx: -30 + fracX * (1920 - 30 - 430),
    fy: -20 + fracY * (1080 - 20 - 90),
    size: 0.95 + ((k * 0.31) % 1) * 0.3,
    av: (k * 3) % AVATARS.length,
    name: FNAMES[k % FNAMES.length],
    text: FTEXTS[k % FTEXTS.length],
  };
});

// Scroll: cuando una fila entra y pasa del alto visible, la lista sube.
const DOCK_ENDS = LIST.map((_, i) => dockEndOf(i));
const SCROLLS = LIST.map((_, i) => Math.max(0, (i + 1) * ROW_H - LIST_H));

// Pregunta de la Escena 1.
const LINES = ["¿Cuántas ventas", "se te escapan?"];
const Q_START = 3;
const Q_ENTER = 5;
const Q_EXIT = 24; // sale antes (menos tiempo la 1ª frase; ese tiempo va a la última)
const Q_EXIT_DUR = 8;

// Una burbuja del flujo continuo (aparece, vive corto, se desvanece → renueva).
const FloodBubble: React.FC<{ ev: (typeof FLOOD)[number]; frame: number; theme: Theme }> = ({ ev, frame, theme }) => {
  const age = frame - ev.start;
  if (age < 0 || age > ev.life) return null;
  const appear = interpolate(age, [0, 10], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const disappear = interpolate(age, [ev.life - 10, ev.life], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const op = Math.min(appear, disappear);
  return (
    <div style={{ position: "absolute", left: ev.fx, top: ev.fy, transform: `scale(${ev.size * (0.82 + appear * 0.18)})`, transformOrigin: "top left", opacity: op }}>
      <CardVisual conv={{ av: ev.av, name: ev.name, first: ev.text }} theme={theme} shadow={0.4} plainImg />
    </div>
  );
};

const Line: React.FC<{ theme: Theme; text: string }> = ({ theme, text }) => (
  <div
    style={{
      height: 156,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 134,
      fontWeight: 800,
      letterSpacing: "-0.03em",
      color: floatingTextColor(theme),
      lineHeight: 1,
      textShadow: floatingTextShadow(theme, "0 10px 50px rgba(0,0,0,0.85)"),
      whiteSpace: "pre",
    }}
  >
    {text}
  </div>
);

// Contenido de una tarjeta/fila (avatar + nombre + mensaje + badge), ancho CHAOS_W.
const CardVisual: React.FC<{ conv: { av: number; name: string; first: string }; theme: Theme; shadow: number; plainImg?: boolean }> = ({
  conv,
  theme,
  shadow,
  plainImg = false,
}) => (
  <div
    style={{
      width: CHAOS_W,
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 18px",
      borderRadius: 18,
      background: theme.cardBg,
      border: `1px solid ${theme.cardBorder}`,
      boxShadow: `0 22px 60px rgba(0,0,0,${shadow})`,
      boxSizing: "border-box",
    }}
  >
    <div style={{ width: 52, height: 52, borderRadius: 999, overflow: "hidden", flexShrink: 0, border: `2px solid ${theme.cardBorder}` }}>
      {plainImg ? (
        // <img> nativo (sin delayRender) para el flujo de fondo → evita el bucle
        // "Maximum update depth" del preview por churn de muchos <Img>.
        <img src={AVATARS[conv.av]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Img src={AVATARS[conv.av]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ color: theme.text, fontWeight: 700, fontSize: 19, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conv.name}</div>
      <div style={{ color: theme.textMuted, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conv.first}</div>
    </div>
    <span style={{ background: "#25D366", color: "#fff", borderRadius: 999, minWidth: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, padding: "0 8px", flexShrink: 0 }}>{2 + (conv.av % 7)}</span>
  </div>
);

export const FusedOpening: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const C = theme.name === "light" ? crmLight : crmDark;

  // --- Caos ambiental desenfocado (detrás de la pregunta), se atenúa al enfocar ---
  const bgBlur = interpolate(frame, [4, 24], [0, 15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bgDim = interpolate(frame, [4, 24], [1, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scrim = interpolate(frame, [4, 24], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scrimRgb = theme.name === "light" ? "255,255,255" : "5,8,20";
  // El flujo de fondo dura hasta que TODOS terminan de entrar (~148) y luego se va.
  const ambientFade = interpolate(frame, [146, 162], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // --- Columna que se LEVANTA (winEnter en RISE_AT) ---
  const winEnter = spring({ frame: frame - RISE_AT, fps, config: smoothSpring });
  const cardOpacity = interpolate(winEnter, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardRise = interpolate(winEnter, [0, 1], [60, 0]);
  const glassGlow =
    theme.name === "light"
      ? "0 50px 130px rgba(20,40,90,0.28)"
      : "0 50px 130px rgba(0,0,0,0.6), 0 0 120px rgba(77,130,255,0.22)";

  // Scroll de la lista (sigue las entradas).
  const scroll = interpolate(frame, DOCK_ENDS, SCROLLS, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // --- ZOOM hacia la columna cuando empieza la succión ---
  const zoom = interpolate(frame, [62, 92], [1, 1.7], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Salida en TORNILLO (sincronizada con el lanzamiento de la última frase) ---
  const COL_EXIT = 164;
  const colExitP = interpolate(frame, [COL_EXIT, COL_EXIT + 15], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const colSpin = colExitP * 720;
  const colDrop = colExitP * 1400;
  const colExitScale = 1 - colExitP * 0.35;

  const arrived = LIST.filter((_, i) => frame >= dockStartOf(i)).length;

  // --- Pregunta ---
  const qScaleX = interpolate(frame, [Q_START, Q_START + Q_ENTER], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const qEnterOp = interpolate(frame, [Q_START, Q_START + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const qLift = interpolate(frame, [Q_EXIT, Q_EXIT + Q_EXIT_DUR], [0, 1], { easing: Easing.out(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const qY = -qLift * 90;
  const qExitOp = interpolate(frame, [Q_EXIT, Q_EXIT + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Flujo CONTINUO de mensajes de fondo (desenfocado), todo el tiempo hasta
          que terminan de entrar a la columna. */}
      <AbsoluteFill style={{ filter: `blur(${bgBlur}px)`, opacity: bgDim * ambientFade }}>
        {FLOOD.map((ev, i) => (
          <FloodBubble key={i} ev={ev} frame={frame} theme={theme} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill
        style={{ background: `radial-gradient(circle at 50% 50%, rgba(${scrimRgb},${scrim * ambientFade}) 0%, rgba(${scrimRgb},0) 60%)` }}
      />

      {/* Grupo con ZOOM + salida en tornillo */}
      <AbsoluteFill style={{ perspective: 2000 }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}>
          <AbsoluteFill
            style={{
              transform: `translateY(${colDrop}px) rotateY(${colSpin}deg) scale(${colExitScale})`,
              transformOrigin: "center center",
              transformStyle: "preserve-3d",
            }}
          >
            {frame >= RISE_AT - 8 && (
              <div style={{ opacity: cardOpacity, transform: `translateY(${cardRise}px)` }}>
                {/* (a) Fondo del panel */}
                <div
                  style={{
                    position: "absolute",
                    left: COL_LEFT,
                    top: COL_TOP,
                    width: COL_W,
                    height: COL_H,
                    borderRadius: 24,
                    background: C.panel,
                    border: `1px solid ${C.border2}`,
                    boxShadow: glassGlow,
                  }}
                />

                {/* (b) Lista clippeada con SCROLL (las filas ya colocadas) */}
                <div
                  style={{
                    position: "absolute",
                    left: COL_LEFT + PAD,
                    top: COL_TOP + HEADER_H,
                    width: DOCK_W,
                    height: LIST_H,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "absolute", inset: 0, transform: `translateY(${-scroll}px)` }}>
                    {LIST.map((conv, i) =>
                      frame >= dockEndOf(i) ? (
                        <div
                          key={i}
                          style={{
                            position: "absolute",
                            left: 0,
                            top: i * ROW_H,
                            transform: `scale(${DOCK_SCALE})`,
                            transformOrigin: "top left",
                          }}
                        >
                          <CardVisual conv={conv} theme={theme} shadow={0} />
                        </div>
                      ) : null,
                    )}
                  </div>
                </div>

                {/* (c) Tarjetas en VUELO (aún no aterrizan) — sin clip */}
                {LIST.map((conv, i) => {
                  if (frame < floatStartOf(i) || frame >= dockEndOf(i)) return null;
                  const appear = interpolate(frame - floatStartOf(i), [0, 10], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  const dock = interpolate(frame, [dockStartOf(i), dockEndOf(i)], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  const landLeft = COL_LEFT + PAD;
                  const landTop = COL_TOP + HEADER_H - scroll + i * ROW_H;
                  const left = interpolate(dock, [0, 1], [conv.fx, landLeft]);
                  const top = interpolate(dock, [0, 1], [conv.fy, landTop]);
                  const s = interpolate(dock, [0, 1], [1, DOCK_SCALE]);
                  const blur = interpolate(appear, [0, 1], [12, 0]);
                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left,
                        top,
                        transform: `scale(${s})`,
                        transformOrigin: "top left",
                        opacity: appear,
                        filter: `blur(${blur}px)`,
                      }}
                    >
                      <CardVisual conv={conv} theme={theme} shadow={0.5 * (1 - dock)} />
                    </div>
                  );
                })}

                {/* (d) Encabezado OPACO encima (tapa lo que sube bajo él) */}
                <div
                  style={{
                    position: "absolute",
                    left: COL_LEFT,
                    top: COL_TOP,
                    width: COL_W,
                    height: HEADER_H,
                    borderRadius: "24px 24px 0 0",
                    background: C.panel,
                    borderBottom: `1px solid ${C.border}`,
                    padding: "16px 16px 10px",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ color: C.text, fontWeight: 700, fontSize: 17 }}>Conversaciones</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, background: C.accentSoft, borderRadius: 6, padding: "2px 8px" }}>{5691 + arrived}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", color: C.faint, fontSize: 14 }}>Buscar…</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                    {["Todas", "Recientes", "Etiquetas", "Todos"].map((f, i) => (
                      <div key={i} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", color: C.muted, fontSize: 13 }}>{f}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Pregunta de la Escena 1 sobre el caos */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transformOrigin: "center center",
            transform: `translateY(${qY}px) scaleX(${qScaleX})`,
            opacity: qEnterOp * qExitOp,
          }}
        >
          <Line theme={theme} text={LINES[0]} />
          <Line theme={theme} text={LINES[1]} />
        </div>
      </AbsoluteFill>

      {/* Sonidos HORNEADOS en UNA pista (fused_fx.mp3): pops (con su envolvente) +
          el "pop" de la pregunta. Un solo <Audio> no rompe el preview. Fuente = el
          bloque {false} de abajo; RE-HORNEAR si cambia el timing. */}
      <Audio src={SND_FUSED} />

      {/* Audio original (fuente del bake) — DESACTIVADO */}
      {false && (
        <>
          <Audio src={SND_POPS} volume={(f) => interpolate(f, [30, 62], [1.3, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          <Sequence from={Q_START} durationInFrames={20}>
            <Audio src={SND_POP} volume={0.6} playbackRate={1.6} />
          </Sequence>
        </>
      )}
    </AbsoluteFill>
  );
};
