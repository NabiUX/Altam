import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Trash2 } from "lucide-react";
import { Theme } from "../theme";

const SND_WHOOSH = staticFile("sounds/whip.mp3");
const SND_BELL = staticFile("sounds/bell.mp3");
const SND_ERROR = staticFile("sounds/err.mp3");
const SND_TRASH = staticFile("sounds/trash_s.mp3");
const SND_CHALK = staticFile("sounds/chalk.mp3");

// Interludio entre Escena 1 y 2: una CAJA 3D con una frase en cada cara que
// rota verticalmente (eje X) mostrando cara 1 → 2 → 3.
const PARTS = ["Por eso creamos", "una plataforma para vender", "no para decorar dashboards"];

const BOX_W = 1320;
const BOX_H = 240;
const DEPTH = BOX_H / 2; // translateZ de cada cara

export const Manifesto: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();

  // La caja gira 0 → -90 → -180 (dos vueltas de un cuarto), con holds.
  const r1 = interpolate(frame, [52, 64], [0, -90], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const r2 = interpolate(frame, [128, 140], [0, -90], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rot = r1 + r2;

  // Entrada desde abajo (relevo del texto de la Escena 1 que sube) y salida.
  const enter = interpolate(frame, [0, 16], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enterY = interpolate(enter, [0, 1], [150, 0]);

  // Salida de la 3ª frase: simplemente se ENCOGE (sin giros) bajando recto
  // hasta la papelera centrada abajo.
  const bye = interpolate(frame, [176, 200], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sc = 1 - bye * 0.95; // se hace más pequeño hasta casi nada
  const tx = 0;
  const ty = enterY + bye * 445; // baja hasta la papelera
  const opacity = enter * interpolate(frame, [198, 204], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Papelera: aparece con la 3ª frase y rebota al recibir el papel.
  const binIn = interpolate(frame, [150, 160], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const binBump = interpolate(frame, [196, 202, 209], [1, 1.32, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const binScale = interpolate(binIn, [0, 1], [0.6, 1]) * binBump;

  // 3 líneas de "tiza" tipo destello/ráfaga alrededor de "vender" (flash rápido,
  // escalonadas) cuando la cara 2 está al frente.
  const sparkAt = (start: number) =>
    interpolate(frame, [start, start + 7], [0, 1], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const sparks = [sparkAt(70), sparkAt(75), sparkAt(80)];

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ perspective: 1800, opacity }}>
        <div
          style={{
            position: "relative",
            width: BOX_W,
            height: BOX_H,
            transformStyle: "preserve-3d",
            transform: `translate(${tx}px, ${ty}px) scale(${sc}) rotateX(${rot}deg)`,
          }}
        >
          {PARTS.map((text, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 60px",
                boxSizing: "border-box",
                backfaceVisibility: "hidden",
                transform: `rotateX(${i * 90}deg) translateZ(${DEPTH}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 78,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: theme.text,
                  textAlign: "center",
                  lineHeight: 1.06,
                  textShadow: "0 8px 40px rgba(0,0,0,0.6)",
                  whiteSpace: "nowrap",
                }}
              >
                {i === 1 ? (
                  <>
                    una plataforma para{" "}
                    <span style={{ position: "relative", display: "inline-block" }}>
                      vender
                      <svg
                        viewBox="0 0 480 220"
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 480,
                          height: 220,
                          overflow: "visible",
                          pointerEvents: "none",
                        }}
                      >
                        <defs>
                          <filter id="chalk-vender" x="-40%" y="-40%" width="180%" height="180%">
                            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.6" numOctaves="2" seed="4" result="n" />
                            <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
                          </filter>
                        </defs>
                        {/* 3 líneas de ráfaga separadas, saliendo de la "r" */}
                        {[
                          "M350 54 L 342 18", // ↑ arriba
                          "M368 50 L 400 24", // ↗ diagonal
                          "M382 66 L 422 56", // → derecha
                        ].map((d, k) => (
                          <path
                            key={k}
                            d={d}
                            pathLength={1}
                            fill="none"
                            stroke="#F4F1E6"
                            strokeWidth={7}
                            strokeLinecap="round"
                            strokeDasharray={1}
                            strokeDashoffset={1 - sparks[k]}
                            opacity={sparks[k]}
                            filter="url(#chalk-vender)"
                          />
                        ))}
                      </svg>
                    </span>
                  </>
                ) : (
                  text
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Papelera centrada abajo: recibe la 3ª frase */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 70,
          opacity: binIn,
          transform: `translateX(-50%) scale(${binScale})`,
          transformOrigin: "center bottom",
          color: theme.textMuted,
          filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))",
        }}
      >
        <Trash2 style={{ width: 96, height: 96 }} strokeWidth={1.75} />
      </div>

      {/* Whoosh en cada giro de la caja */}
      <Sequence from={52} durationInFrames={20}>
        <Audio src={SND_WHOOSH} volume={0.7} playbackRate={1.1} />
      </Sequence>
      <Sequence from={128} durationInFrames={20}>
        <Audio src={SND_WHOOSH} volume={0.7} playbackRate={1.1} />
      </Sequence>
      {/* Campanita seguida del whoosh, al aparecer "una plataforma para vender" */}
      <Sequence from={60} durationInFrames={40}>
        <Audio src={SND_BELL} volume={0.75} />
      </Sequence>
      {/* Tiza trazando los 3 destellos alrededor de "vender" */}
      <Sequence from={70} durationInFrames={26}>
        <Audio src={SND_CHALK} volume={0.7} />
      </Sequence>
      {/* Error seguido del 2º whoosh, al aparecer "no para decorar dashboards" */}
      <Sequence from={134} durationInFrames={40}>
        <Audio src={SND_ERROR} volume={0.8} />
      </Sequence>
      {/* Trash cuando el texto entra a la papelera */}
      <Sequence from={196} durationInFrames={26}>
        <Audio src={SND_TRASH} volume={0.9} />
      </Sequence>
    </AbsoluteFill>
  );
};
