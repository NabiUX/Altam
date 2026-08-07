// TemplateBubble.tsx — Template de campaña dentro del chat (imagen + body + footer + botones).
// Recrea el look de DASHBOARD `TemplatePreview`: tarjeta blanca con header imagen.
import * as React from "react";
import { ExternalLink, Phone, Reply, Megaphone, Check, CheckCheck } from "lucide-react";
import type { Message } from "../mock/types";

function ButtonIcon({ type }: { type: string }) {
  if (type === "URL") return <ExternalLink className="h-3 w-3" />;
  if (type === "PHONE_NUMBER") return <Phone className="h-3 w-3" />;
  return <Reply className="h-3 w-3" />;
}

export function TemplateBubble({ message }: { message: Message }) {
  const t = message.template!;
  return (
    <div className="flex justify-end">
      <div className="relative max-w-[70%] rounded-lg bg-[#d9fdd3] px-2 py-2 shadow-sm">
        {/* Etiqueta de campaña */}
        {message.campaignName && (
          <div className="mb-1 flex items-center gap-1 px-1 text-[10px] text-gray-500">
            <Megaphone className="h-3 w-3" />
            <span className="max-w-[160px] truncate">{message.campaignName}</span>
          </div>
        )}

        {/* Tarjeta del template */}
        <div className="w-[280px] max-w-full overflow-hidden rounded-lg bg-white shadow-sm">
          {/* Header: imagen */}
          <div className="h-40 w-full bg-gray-100">
            <img src={t.imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
          {/* Body */}
          <div className="px-3 pt-2">
            <p className="whitespace-pre-wrap break-words text-sm text-gray-900">
              {t.body}
            </p>
          </div>
          {/* Footer */}
          {t.footer && (
            <div className="px-3 pb-2 pt-1">
              <p className="text-xs text-gray-400">{t.footer}</p>
            </div>
          )}
          {/* Botones */}
          {t.buttons.length > 0 && (
            <div className="border-t border-gray-100">
              {t.buttons.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center gap-1.5 border-t border-gray-100 py-2 text-sm font-medium text-[#00a5f4] first:border-t-0"
                >
                  <ButtonIcon type={b.type} />
                  {b.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hora + estado */}
        <div className="mt-1 flex items-center justify-end gap-1 px-1">
          <span className="text-[10px] text-gray-600">{message.time}</span>
          {message.status === "READ" ? (
            <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
          ) : message.status === "DELIVERED" ? (
            <CheckCheck className="h-3.5 w-3.5 text-gray-500" />
          ) : (
            <Check className="h-3.5 w-3.5 text-gray-500" />
          )}
        </div>
      </div>
    </div>
  );
}
