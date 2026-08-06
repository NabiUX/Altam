import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Theme } from "../theme";
import { fadeInOut, smoothSpring } from "../components/anim";

// Unificación: todo converge en una sola frase.
export const Unify: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = fadeInOut(frame, 100, 20, 22);
  const p = spring({ frame: frame - 6, fps, config: smoothSpring });
  const blur = interpolate(p, [0, 1], [18, 0]);
  const scale = interpolate(p, [0, 1], [0.94, 1]);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity }}
    >
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: theme.text,
          filter: `blur(${blur}px)`,
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        Todo en <span style={{ color: theme.accent }}>un solo lugar</span>
      </div>
    </AbsoluteFill>
  );
};
