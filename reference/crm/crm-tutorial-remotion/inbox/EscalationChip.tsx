// EscalationChip.tsx — Banner centrado de escalamiento a un asesor humano.
// Estilo ámbar, igual que los eventos de sistema del inbox real.
import * as React from "react";
import { UserCheck } from "lucide-react";

interface EscalationChipProps {
  text: string;
  seller?: string;
  time?: string;
}

export function EscalationChip({ text, seller, time }: EscalationChipProps) {
  return (
    <div className="flex justify-center py-1">
      <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
        <UserCheck className="h-3.5 w-3.5" />
        <span>
          {text}
          {seller ? ` · ${seller}` : ""}
        </span>
        {time && <span className="text-amber-500">{time}</span>}
      </div>
    </div>
  );
}
