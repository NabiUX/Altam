import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Theme, getTheme, floatingTextColor, floatingTextShadow, LIGHT_TEXT_ACCENT } from "../theme";
import { smoothSpring } from "../components/anim";

// Escena 2: chat en modo oscuro. El bot pide los datos del negocio y el
// usuario (negocio ficticio "Finanzas desde Cero") responde con 3 mensajes
// que van llegando con pop, uno tras otro (sin tipear).
const BOT1 = "¡Hola! 👋 Soy tu asistente de ventas. ¿Qué vende tu negocio?";

// --- Intro dinámico (frames locales) ---
// 1) aparece la frase "Configura tu bot" grande y centrada.
// 2) la ventana de chat se desliza al centro desde abajo.
// 3) la frase viaja a la cabecera y se vuelve el subtítulo (bajo "Asistente…").
const TITLE = "Configura tu bot";
const PANEL_RISE = 4; // la ventana empieza a deslizarse desde abajo
const DOCK_START = 20; // la frase se queda grande más tiempo antes de viajar a la cabecera
const DOCK_END = 30; // ya es el subtítulo; el bot saluda justo aquí (BOT1_AT=30)

// Ritmo del chat (desplazado tras el intro). El bot responde al instante y
// nuestros 3 mensajes caen directos con pop (sin puntitos), rápidos y seguidos.
const BOT1_AT = 30; // saludo del bot
// Los 3 mensajes del usuario: `at` = frame en el que "cae" (pop).
const USER_MSGS = [
  { text: "Se llama Finanzas desde Cero", at: 50 },
  { text: "Cursos de finanzas personales", at: 66 },
  { text: "Para organizar tu economía", at: 82 },
];
const BOT2 = "¡Perfecto! 🚀 Con eso ya podemos empezar.";
const BOT2_AT = 104; // cierre del bot → zoom + guiño

const PANEL_W = 1120;
const PANEL_H = 860;

// --- Sonidos (versiones recortadas: los originales tenían ~2s de silencio al
// inicio, por eso no sonaban) ---
const SND_BELL = staticFile("sounds/campanita_ding.mp3"); // el círculo del bot crece
const SND_BLINK = staticFile("sounds/parpadeo_blink.mp3"); // el bot guiña
const SND_SWOOSH = staticFile("sounds/whip.mp3"); // el bot sale barriendo el mensaje
// Todos los efectos de la escena HORNEADOS en una pista (no rompe el preview).
const SND_BOTSETUP = staticFile("sounds/botsetup_fx.mp3");

// Carita de robot (mismo trazo que el ícono del bot) pero con el ojo izquierdo
// animable para que pueda GUIÑAR. wink: 0 = ojos abiertos, 1 = ojo cerrado.
export const BotFace: React.FC<{ size?: number; wink?: number }> = ({
  size = 30,
  wink = 0,
}) => {
  const w = Math.min(1, Math.max(0, wink));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      {/* ojo derecho: siempre abierto */}
      <path d="M15 13v2" />
      {/* ojo izquierdo: crossfade de abierto (línea) a guiñado (curva "‿") */}
      <path d="M9 13v2" opacity={1 - w} />
      <path d="M7.7 13.5 Q9 15.7 10.3 13.5" opacity={w} />
    </svg>
  );
};

const Bubble: React.FC<{
  theme: Theme;
  from: "bot" | "user";
  text: string;
  enter: number;
  wink?: number;
  avatarScale?: number;
  exit?: number;
}> = ({ theme, from, text, enter, wink = 0, avatarScale = 1, exit = 0 }) => {
  const isBot = from === "bot";
  const exitSlide = exit * 1250; // el bot se desliza a la derecha para salir
  // El mensaje se borra SIGUIENDO al bot: llega a 100% cuando el bot ya cruzó
  // el ancho del mensaje (por eso el borrado es más veloz que el recorrido).
  const msgWipe = Math.min(1, exit * 1.85);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isBot ? "row" : "row-reverse",
        alignItems: "flex-end",
        gap: 14,
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)`,
      }}
    >
      {isBot && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: theme.accentSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.accent,
            flexShrink: 0,
            transform: `translateX(${exitSlide}px) scale(${avatarScale})`,
            transformOrigin: "right center",
          }}
        >
          <BotFace size={30} wink={wink} />
        </div>
      )}
      <div
        style={{
          maxWidth: 720,
          padding: "20px 26px",
          borderRadius: 26,
          borderBottomLeftRadius: isBot ? 6 : 26,
          borderBottomRightRadius: isBot ? 26 : 6,
          background: isBot ? theme.cardBg : theme.accent,
          border: isBot ? `1px solid ${theme.cardBorder}` : "none",
          color: isBot ? theme.text : "#fff",
          fontSize: 30,
          lineHeight: 1.35,
          fontWeight: 500,
          boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
          clipPath: `inset(0 0 0 ${msgWipe * 100}%)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const BotSetup: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // El cuadro de chat (panel + burbujas) sigue el FONDO: oscuro en la versión
  // oscura, claro en la clara. El título flotante también usa `theme`.
  const card = getTheme(theme.name);
  // El panel y las burbujas conservan su color OPACO; el look "glass" se logra
  // con un reflejo de vidrio POR ENCIMA (glassSheen).
  const panelBg = card.bgFrom ?? "#0b1220";
  const panelBorder = card.cardBorder;
  // En la versión CLARA, el mensaje final del bot queda flotando solo sobre el
  // fondo claro: su burbuja necesita fondo SÓLIDO oscuro (si no, con la burbuja
  // translúcida + texto blanco, no se ve). En la oscura se deja como está.
  // En la versión clara, la burbuja del bot es CELESTE con texto blanco (para
  // que resalte, incl. el mensaje final que queda flotando sobre el fondo claro).
  const bubbleCard: Theme =
    theme.name === "light"
      ? { ...card, cardBg: LIGHT_TEXT_ACCENT, text: "#fff" }
      : card;
  const panelShadow = `0 60px 140px rgba(0,0,0,0.55), 0 0 120px ${card.accentGlow}`;

  // Destino aproximado (offset desde el centro) del título al acomodarse como
  // subtítulo, bajo "Asistente de Altam". Se afina mirando stills.
  const DOCK_X = -388;
  const DOCK_Y = -360;

  // Título "Configura tu bot": entra grande y centrado, luego viaja arriba.
  const titleIn = spring({ frame, fps, config: smoothSpring });
  const dock = interpolate(frame, [DOCK_START, DOCK_END], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale =
    interpolate(titleIn, [0, 1], [0.9, 1]) * interpolate(dock, [0, 1], [1, 0.22]);
  const titleX = interpolate(dock, [0, 1], [0, DOCK_X]);
  const titleY = interpolate(dock, [0, 1], [0, DOCK_Y]);
  const titleOpacity =
    titleIn *
    interpolate(frame, [DOCK_END - 6, DOCK_END], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Ventana de chat: simplemente se desliza al centro desde abajo (sin giros).
  const rise = spring({ frame: frame - PANEL_RISE, fps, config: smoothSpring });
  const panelY = interpolate(rise, [0, 1], [520, 0]);
  const panelOpacity = interpolate(rise, [0, 0.35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // El subtítulo real aparece cuando el título termina de acomodarse (crossfade).
  const subtitleOpacity = interpolate(frame, [DOCK_END - 8, DOCK_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bot1In = spring({ frame: frame - BOT1_AT, fps, config: smoothSpring });
  const bot2In = spring({ frame: frame - BOT2_AT, fps, config: smoothSpring });

  // Cámara: (1) ZOOM a la CONVERSACIÓN cuando el bot manda el 1er mensaje
  // (BOT1_AT): los mensajes llenan la pantalla (el marco/cabecera se recortan);
  // se MANTIENE durante tus 3 respuestas. (2) En el cierre (BOT2_AT) enlaza con
  // el zoom + centrado del mensaje final que ya existía.
  const CONV_ZOOM = 1.5;
  const CONV_X = -90; // desplaza a la izq. para que el texto de tus mensajes (der.) entre
  const CONV_Y = -120;
  const kf = [BOT1_AT, BOT1_AT + 12, BOT2_AT, BOT2_AT + 14];
  const ease = { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const zoom = interpolate(frame, kf, [1, CONV_ZOOM, CONV_ZOOM, 2.0], ease);
  const shiftX = interpolate(frame, kf, [0, CONV_X, CONV_X, 150], ease);
  const shiftY = interpolate(frame, kf, [0, CONV_Y, CONV_Y, -356], ease);
  // Al centrar el mensaje, todo lo demás (marco, cabecera, mensajes previos) se
  // desvanece: queda SOLO el bot + el mensaje final.
  const restOpacity = interpolate(frame, [BOT2_AT + 3, BOT2_AT + 15], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Cuando YA está todo centrado, el círculo del bot da un SALTO grande con
  // rebote, quedando bastante más grande que el mensaje.
  const jump = spring({
    frame: frame - (BOT2_AT + 18),
    fps,
    config: { damping: 9, stiffness: 130, mass: 0.8 },
  });
  const botAvatarScale = 1 + jump * 1.3; // ~2.3× → claramente más grande que el mensaje
  // El guiño va DESPUÉS del salto.
  const wink = interpolate(
    frame,
    [BOT2_AT + 32, BOT2_AT + 36, BOT2_AT + 40, BOT2_AT + 44],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Al terminar el guiño, el bot se desliza a la derecha para SALIR y va
  // BORRANDO el mensaje a su paso (rápido, ambos juntos).
  const exit = interpolate(frame, [BOT2_AT + 44, BOT2_AT + 64], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `translate(${shiftX}px, ${shiftY}px)` }}>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: "35% 91%" }}>
        <div
          style={{
            position: "relative",
            width: PANEL_W,
            height: PANEL_H,
            display: "flex",
            flexDirection: "column",
            opacity: panelOpacity,
            transform: `translateY(${panelY}px)`,
          }}
        >
          {/* Marco del chat (fondo + borde + sombra): se desvanece al centrar
              el mensaje, para dejar SOLO el bot + el mensaje. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 32,
              background: panelBg,
              border: `1px solid ${panelBorder}`,
              boxShadow: panelShadow,
              opacity: restOpacity,
            }}
          />

          {/* Header (se desvanece con el marco) */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "22px 30px",
              borderBottom: `1px solid ${panelBorder}`,
              background: "rgba(255,255,255,0.02)",
              opacity: restOpacity,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                background: card.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <BotFace size={30} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: card.text, fontWeight: 700, fontSize: 26 }}>
                Asistente de Altam
              </div>
              <div
                style={{
                  color: card.textMuted,
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: subtitleOpacity,
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 999, background: "#22c55e" }} />
                {TITLE}
              </div>
            </div>
          </div>

          {/* Mensajes */}
          <div
            style={{
              position: "relative",
              flex: 1,
              padding: "34px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              gap: 26,
            }}
          >
            {/* El bot responde al instante, sin puntitos. Se desvanece al final. */}
            {frame >= BOT1_AT && (
              <Bubble
                theme={bubbleCard}
                from="bot"
                text={BOT1}
                enter={bot1In * restOpacity}
              />
            )}

            {/* Nuestros mensajes: caen directo con pop (sin puntitos).
                También se desvanecen al centrar el mensaje final. */}
            {USER_MSGS.map((m, i) =>
              frame >= m.at ? (
                <Bubble
                  key={i}
                  theme={bubbleCard}
                  from="user"
                  text={m.text}
                  enter={
                    spring({ frame: frame - m.at, fps, config: smoothSpring }) *
                    restOpacity
                  }
                />
              ) : null,
            )}

            {frame >= BOT2_AT && (
              <Bubble
                theme={bubbleCard}
                from="bot"
                text={BOT2}
                enter={bot2In}
                wink={wink}
                avatarScale={botAvatarScale}
                exit={exit}
              />
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Título "Configura tu bot": grande y centrado; luego viaja a la
          cabecera y se desvanece (el subtítulo real aparece en su lugar). */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
            transform: `translate(${titleX}px, ${titleY}px) scale(${titleScale})`,
            fontSize: 145,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: floatingTextColor(theme),
            textShadow: floatingTextShadow(theme, "0 10px 50px rgba(0,0,0,0.7)"),
            whiteSpace: "nowrap",
          }}
        >
          {TITLE}
        </div>
      </AbsoluteFill>

      {/* Sonidos HORNEADOS en UNA pista (botsetup_fx.mp3): un solo <Audio> no
          rompe el preview. Fuente = bloque {false} de abajo; re-hornear si cambia timing. */}
      <Audio src={SND_BOTSETUP} />

      {/* --- Audio original (fuente del bake) — DESACTIVADO --- */}
      {false && (
        <>
          {/* Swish cuando "Configura tu bot" se acomoda como subtítulo */}
          <Sequence from={DOCK_START} durationInFrames={20}>
            <Audio src={SND_SWOOSH} volume={1.1} />
          </Sequence>
          {/* Campanita al EMPEZAR a centrarse el mensaje (mucho antes del salto) */}
          <Sequence from={BOT2_AT} durationInFrames={45}>
            <Audio src={SND_BELL} volume={1.1} />
          </Sequence>
          {/* Parpadeo cuando el círculo empieza a crecer (un poco antes del guiño) */}
          <Sequence from={BOT2_AT + 18} durationInFrames={24}>
            <Audio src={SND_BLINK} volume={1.35} />
          </Sequence>
          {/* Swoosh cuando el bot sale barriendo el mensaje */}
          <Sequence from={BOT2_AT + 44} durationInFrames={18}>
            <Audio src={SND_SWOOSH} volume={1.25} />
          </Sequence>
        </>
      )}
    </AbsoluteFill>
  );
};
