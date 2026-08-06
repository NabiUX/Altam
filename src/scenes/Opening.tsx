import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Theme } from "../theme";
import { smoothSpring } from "../components/anim";

const TAGLINE = "Tu negocio, digital y automático con IA";

// Apertura: la tagline aparece palabra por palabra con blur→enfoque.
export const Opening: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = TAGLINE.split(" ");

  // La escena entera se desvanece al final para el crossfade.
  const exit = interpolate(frame, [82, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: exit,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          textAlign: "center",
          fontSize: 88,
          fontWeight: 700,
          lineHeight: 1.14,
          letterSpacing: "-0.025em",
          color: theme.text,
        }}
      >
        {words.map((word, i) => {
          const delay = 6 + i * 4;
          const p = spring({
            frame: frame - delay,
            fps,
            config: smoothSpring,
          });
          const blur = interpolate(p, [0, 1], [16, 0]);
          const y = interpolate(p, [0, 1], [26, 0]);
          const isAI = word === "IA";

          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.28em",
                opacity: p,
                filter: `blur(${blur}px)`,
                transform: `translateY(${y}px)`,
                color: isAI ? theme.accent : theme.text,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
