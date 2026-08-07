import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Theme } from "../theme";

// Marco tipo ventana para mostrar las pantallas del CRM (tema claro) como
// paneles luminosos flotando sobre el fondo oscuro. Los children se diseñan a
// 1920×1080 (tamaño nativo del CRM) y se escalan dentro del marco.
const FRAME_W = 1560;
const CHROME_H = 44;
const SCREEN_W = 1920;
const SCREEN_H = 1080;
const SCALE = FRAME_W / SCREEN_W; // ~0.8125
const SCREEN_AREA_H = SCREEN_H * SCALE; // ~877

export const ScreenFrame: React.FC<{
  theme: Theme;
  progress?: number;
  children: React.ReactNode;
}> = ({ theme, progress = 1, children }) => {
  const opacity = progress;
  const scale = interpolate(progress, [0, 1], [0.94, 1]);
  const blur = interpolate(progress, [0, 1], [12, 0]);
  const y = interpolate(progress, [0, 1], [24, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: FRAME_W,
          borderRadius: 20,
          overflow: "hidden",
          background: "#ffffff",
          boxShadow: `0 60px 140px rgba(0,0,0,0.55), 0 0 120px ${theme.accentGlow}`,
          border: `1px solid ${theme.cardBorder}`,
          opacity,
          filter: `blur(${blur}px)`,
          transform: `translateY(${y}px) scale(${scale})`,
        }}
      >
        {/* Barra tipo navegador */}
        <div
          style={{
            height: CHROME_H,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 16px",
            background: "#f3f4f6",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span
              key={c}
              style={{ width: 12, height: 12, borderRadius: 999, background: c }}
            />
          ))}
          <span
            style={{
              marginLeft: 16,
              fontSize: 13,
              color: "#6b7280",
              background: "#fff",
              borderRadius: 8,
              padding: "3px 14px",
            }}
          >
            app.altam.io
          </span>
        </div>
        {/* Área de pantalla: children a 1920×1080 escalados */}
        <div style={{ width: FRAME_W, height: SCREEN_AREA_H, overflow: "hidden" }}>
          <div
            style={{
              width: SCREEN_W,
              height: SCREEN_H,
              transform: `scale(${SCALE})`,
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
