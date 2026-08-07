// Badge.tsx — Etiqueta/pill presentacional. Acepta un color HEX (etiquetas del CRM).
import * as React from "react";

interface BadgeProps {
  children: React.ReactNode;
  /** Color HEX. Si se pasa, pinta el badge en tono claro con texto del color. */
  color?: string;
  className?: string;
}

/** Convierte un HEX a un estilo tipo "etiqueta" (fondo tenue + texto/borde del color). */
export function labelStyle(color: string): React.CSSProperties {
  return {
    backgroundColor: `${color}1a`, // ~10% alpha
    color,
    borderColor: `${color}55`,
  };
}

export function Badge({ children, color, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}
      style={color ? labelStyle(color) : undefined}
    >
      {children}
    </span>
  );
}
