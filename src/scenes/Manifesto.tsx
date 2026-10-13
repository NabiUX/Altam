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
import { Theme, floatingTextColor, floatingTextShadow } from "../theme";

const SND_WHOOSH = staticFile("sounds/whip.mp3");
const SND_BELL = staticFile("sounds/bell.mp3");
const SND_RAPIDO = staticFile("sounds/rapido_s.mp3");
// Todos los efectos del manifiesto HORNEADOS en una pista (no rompe el preview).
const SND_MANIFESTO = staticFile("sounds/manifesto_fx.mp3");

// Interludio entre Escena 1 y 2: una CAJA 3D con una frase en cada cara que
// rota verticalmente (eje X) mostrando cara 1 → 2 → 3.
const PARTS = ["Por eso creamos", "una plataforma para vender", "rápida, simple y medible"];

const BOX_W = 1320;
const BOX_H = 240;
const DEPTH = BOX_H / 2; // translateZ de cada cara

export const Manifesto: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();

  // La caja gira 0 → -90 → -180 (dos vueltas de un cuarto), con holds.
  const r1 = interpolate(frame, [20, 28], [0, -90], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const r2 = interpolate(frame, [86, 94], [0, -90], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rot = r1 + r2;

  // Entrada desde abajo (relevo del texto de la Escena 1 que sube) y salida.
  const enter = interpolate(frame, [0, 6], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enterY = interpolate(enter, [0, 1], [150, 0]);

  // Salida de la 3ª frase ("rápida, simple y medible"): SOLO "rápida" hace 2
  // rebotes cortos y toma impulso a la izquierda; luego TODA la línea se desliza
  // súper rápido a la derecha (rápida lidera y se lleva las demás palabras).
  const EXIT = 112;
  // Offset extra solo para "rápida": 2 rebotes → impulso izquierda → vuelve a 0
  // al lanzarse (sale disparada a la derecha liderando).
  // SOLO "rápida": toma impulso a la izquierda y al lanzarse vuelve a 0 (sale
  // disparada a la derecha).
  const rapidaImpulseX = interpolate(
    frame,
    [EXIT + 12, EXIT + 20, EXIT + 28],
    [0, -80, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  // Flexibilidad: al tomar impulso se curva/inclina hacia atrás, y al lanzarse
  // se inclina hacia adelante y se estira (elástico, como una liga).
  const rapidaSkew = interpolate(
    frame,
    [EXIT + 12, EXIT + 20, EXIT + 26, EXIT + 31],
    [0, 16, -22, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rapidaStretch = interpolate(frame, [EXIT + 20, EXIT + 24, EXIT + 31], [1, 1.22, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Deslizamiento de TODA la línea a la derecha, súper rápido, tras el impulso.
  const slide = interpolate(frame, [EXIT + 20, EXIT + 30], [0, 2600], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Ráfaga de velocidad hecha con TIZA: líneas horizontales que salen disparadas
  // a la derecha (como un carro acelerando) al lanzarse "rápida".
  const streakP = interpolate(frame, [EXIT + 18, EXIT + 32], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const streakOp = interpolate(
    frame,
    [EXIT + 18, EXIT + 22, EXIT + 28, EXIT + 35],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const sc = 1;
  const tx = slide;
  const ty = enterY;
  const opacity =
    enter *
    interpolate(frame, [EXIT + 24, EXIT + 33], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // 3 líneas de "tiza" tipo destello/ráfaga alrededor de "vender" (flash rápido,
  // escalonadas) cuando la cara 2 está al frente.
  const sparkAt = (start: number) =>
    interpolate(frame, [start, start + 7], [0, 1], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const sparks = [sparkAt(36), sparkAt(40), sparkAt(44)];

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {/* Difuminado 2D GRADUAL (FUERA de la caja 3D): 3 capas apiladas, de suave y
          grande por fuera a muy borrosa y pequeña en el centro. Donde se solapan
          (centro) el blur se acumula → muy borroso; hacia los bordes afloja.
          SIN tinte de color. */}
      {[
        { w: 1120, h: 420, blur: 14, solid: "56%", fade: "90%" },
        { w: 900, h: 330, blur: 30, solid: "52%", fade: "86%" },
        { w: 700, h: 250, blur: 55, solid: "48%", fade: "82%" },
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
            opacity,
            pointerEvents: "none",
          }}
        />
      ))}
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
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <div
                  style={{
                    position: "relative",
                    fontSize: 108,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: floatingTextColor(theme),
                    textAlign: "center",
                    lineHeight: 1.06,
                    textShadow: floatingTextShadow(theme, "0 8px 40px rgba(0,0,0,0.6)"),
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
                          "M388 54 L 380 18", // ↑ arriba (sobre la "r" de vender)
                          "M406 50 L 438 24", // ↗ diagonal
                          "M420 66 L 460 56", // → derecha
                        ].map((d, k) => (
                          <path
                            key={k}
                            d={d}
                            pathLength={1}
                            fill="none"
                            stroke={floatingTextColor(theme)}
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
                ) : i === 2 ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        transformOrigin: "center bottom",
                        transform: `translateX(${rapidaImpulseX}px) skewX(${rapidaSkew}deg) scaleX(${rapidaStretch})`,
                      }}
                    >
                      rápida,
                    </span>
                    {" simple y medible"}
                  </>
                ) : (
                  text
                )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ráfaga de velocidad con TIZA: líneas horizontales que salen disparadas
          a la derecha al lanzarse "rápida" (estilo carro acelerando). */}
      {streakOp > 0.01 && (
        <svg
          viewBox="0 0 1920 1080"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: streakOp,
          }}
        >
          <defs>
            <filter id="chalk-speed" x="-40%" y="-40%" width="180%" height="180%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9 0.5" numOctaves="2" seed="7" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
            </filter>
          </defs>
          <g
            filter="url(#chalk-speed)"
            stroke={floatingTextColor(theme)}
            strokeLinecap="round"
            fill="none"
            transform={`translate(${streakP * 760}, 0)`}
          >
            {[
              { y: 496, x1: 380, x2: 900, w: 6, o: 0.7 },
              { y: 566, x1: 400, x2: 920, w: 6, o: 0.7 },
            ].map((l, k) => (
              <line
                key={k}
                x1={l.x1}
                y1={l.y}
                x2={l.x2}
                y2={l.y}
                strokeWidth={l.w}
                opacity={l.o}
              />
            ))}
          </g>
        </svg>
      )}

      {/* Sonidos HORNEADOS en UNA pista (manifesto_fx.mp3): un solo <Audio> no
          rompe el preview. Fuente = bloque {false} de abajo; re-hornear si cambia timing. */}
      <Audio src={SND_MANIFESTO} />

      {/* Audio original (fuente del bake) — DESACTIVADO */}
      {false && (
        <>
          {/* Whoosh en cada giro de la caja */}
          <Sequence from={20} durationInFrames={20}>
            <Audio src={SND_WHOOSH} volume={1.1} playbackRate={1.1} />
          </Sequence>
          <Sequence from={86} durationInFrames={20}>
            <Audio src={SND_WHOOSH} volume={1.1} playbackRate={1.1} />
          </Sequence>
          {/* Campanita seguida del whoosh, al aparecer "una plataforma para vender" */}
          <Sequence from={26} durationInFrames={24}>
            <Audio src={SND_BELL} volume={1.15} />
          </Sequence>
          {/* "Rápido" JUSTO cuando "rápida" sale disparada a la derecha (EXIT+18) */}
          <Sequence from={EXIT + 18} durationInFrames={40}>
            <Audio src={SND_RAPIDO} volume={1.2} playbackRate={1.5} />
          </Sequence>
        </>
      )}
    </AbsoluteFill>
  );
};
