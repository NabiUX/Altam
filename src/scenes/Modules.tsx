import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MessageCircle, Sparkles, Boxes } from "lucide-react";
import { Theme } from "../theme";
import { fadeInOut, smoothSpring } from "../components/anim";

const MODULES = [
  { Icon: MessageCircle, title: "WhatsApp CRM", sub: "Ventas en un solo inbox" },
  { Icon: Sparkles, title: "Ventas + IA", sub: "Cierra más, con IA" },
  { Icon: Boxes, title: "Inventario", sub: "10,000+ productos" },
];

// Módulos clave: 3 tarjetas que entran con spring, una tras otra.
export const Modules: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const groupOpacity = fadeInOut(frame, 190, 18, 22);

  // Kicker superior.
  const kicker = spring({ frame: frame - 4, fps, config: smoothSpring });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: groupOpacity,
        gap: 60,
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: 34,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: theme.textMuted,
          opacity: kicker,
          transform: `translateY(${interpolate(kicker, [0, 1], [16, 0])}px)`,
        }}
      >
        Todo tu negocio, en un solo lugar
      </div>

      <div style={{ display: "flex", gap: 48 }}>
        {MODULES.map(({ Icon, title, sub }, i) => {
          const delay = 16 + i * 12;
          const p = spring({ frame: frame - delay, fps, config: smoothSpring });
          const y = interpolate(p, [0, 1], [60, 0]);

          return (
            <div
              key={title}
              style={{
                width: 400,
                height: 340,
                borderRadius: 32,
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                boxShadow: theme.cardShadow,
                backdropFilter: "blur(12px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                padding: 44,
                gap: 26,
                opacity: p,
                transform: `translateY(${y}px)`,
              }}
            >
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 24,
                  background: theme.accentSoft,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon size={48} color={theme.accent} strokeWidth={2} />
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: theme.text,
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: 26, fontWeight: 500, color: theme.textMuted }}>
                {sub}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
