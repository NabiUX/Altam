// TypingIndicator.tsx — Burbuja de "escribiendo…" (tres puntos).
// La animación de los puntos la puede manejar la diseñadora en Remotion
// (o el CSS animate-bounce de Tailwind, activo por defecto aquí).
import * as React from "react";

export function TypingIndicator({ align = "left" }: { align?: "left" | "right" }) {
  return (
    <div className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}>
      <div className="flex items-center gap-1 rounded-lg bg-white px-3 py-2.5 shadow-sm">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
