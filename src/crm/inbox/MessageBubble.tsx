// MessageBubble.tsx — Burbuja de mensaje estilo WhatsApp Web.
// Saliente (verde, derecha) / entrante (blanca, izquierda). Muestra remitente
// (Bot o vendedor) en salientes, hora e íconos de estado (✓ / ✓✓).
import * as React from "react";
import { Check, CheckCheck, Bot, Clock } from "lucide-react";
import type { Message } from "../mock/types";

function StatusIcon({ status }: { status?: Message["status"] }) {
  if (status === "PENDING") return <Clock className="h-3.5 w-3.5 text-gray-500" />;
  if (status === "READ") return <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />;
  if (status === "DELIVERED") return <CheckCheck className="h-3.5 w-3.5 text-gray-500" />;
  return <Check className="h-3.5 w-3.5 text-gray-500" />;
}

export function MessageBubble({ message }: { message: Message }) {
  const isOutbound = message.direction === "OUTBOUND";
  const isBot = message.sender === "bot";
  const isSeller = message.sender === "seller";

  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[70%] rounded-lg px-3 py-2 shadow-sm ${
          isOutbound ? "bg-[#d9fdd3] text-gray-900" : "bg-white text-gray-900"
        }`}
      >
        {/* Etiqueta de remitente (solo salientes de bot o vendedor) */}
        {isOutbound && (isBot || isSeller) && message.senderName && (
          <div className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-gray-500">
            {isBot && <Bot className="h-3 w-3 text-theme-600" />}
            <span>{message.senderName}</span>
          </div>
        )}

        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.text}
        </p>

        <div className="mt-0.5 flex items-center justify-end gap-1">
          <span className="text-[10px] text-gray-500">{message.time}</span>
          {isOutbound && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}
