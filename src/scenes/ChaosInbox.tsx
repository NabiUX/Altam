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

  const line = interpolate(frame, [95, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineBlur = interpolate(line, [0, 1], [14, 0]);
  const listFade = interpolate(frame, [92, 120], [1, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <div style={{ width: 720, opacity: listFade }}>
        {ROWS.map((r, i) => {
          const enter = spring({ frame: frame - i * 7, fps, config: smoothSpring });
          const isLeak = i === LEAK;
          const leak = isLeak
            ? spring({ frame: frame - 60, fps, config: smoothSpring })
            : 0;
          const unread = Math.min(
            15,
            Math.floor(
              interpolate(frame - i * 7, [0, 60], [1, 15], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            ),
          );
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                marginBottom: 8,
                borderRadius: 14,
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                opacity: enter * (isLeak ? 1 - leak * 0.85 : 1),
                transform: `translateX(${interpolate(enter, [0, 1], [40, 0])}px) translateY(${
                  isLeak ? leak * 40 : 0
                }px)`,
                filter: isLeak ? `grayscale(${leak})` : "none",
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  background: theme.accentSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.accent,
                  fontWeight: 700,
                }}
              >
                {r.name[8]}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ color: theme.text, fontWeight: 600, fontSize: 20 }}>
                  {r.name}
                </div>
                <div style={{ color: theme.textMuted, fontSize: 16 }}>{r.msg}</div>
              </div>
              <span
                style={{
                  background: "#25D366",
                  color: "#fff",
                  borderRadius: 999,
                  minWidth: 26,
                  height: 26,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  padding: "0 6px",
                  opacity: isLeak ? 1 - leak : 1,
                }}
              >
                {unread}
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          fontSize: 76,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: theme.text,
          textAlign: "center",
          lineHeight: 1.1,
          opacity: line,
          filter: `blur(${lineBlur}px)`,
          textShadow: "0 6px 40px rgba(0,0,0,0.6)",
        }}
      >
        ¿Cuántas ventas
        <br />
        se te escapan?
      </div>
    </AbsoluteFill>
  );
};
