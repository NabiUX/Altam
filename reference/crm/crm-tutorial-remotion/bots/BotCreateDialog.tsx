// BotCreateDialog.tsx — Diálogo "Crear bot" (recrea el de DASHBOARD).
// Secciones (Bot principal / Especialistas / Otros) + grid de tarjetas plantilla.
//
// Presentacional: `highlightId` marca la tarjeta "seleccionada/hover" para animar
// el momento en que el usuario elige una plantilla.
import * as React from "react";
import {
  Bot,
  MessageCircle,
  ShoppingCart,
  LifeBuoy,
  Target,
  UserCog,
  X,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import type { BotTemplate } from "../mock/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageCircle,
  ShoppingCart,
  LifeBuoy,
  Target,
  UserCog,
};

interface BotCreateDialogProps {
  templates: BotTemplate[];
  groups: { key: string; title: string; subtitle?: string }[];
  /** id de la plantilla resaltada (hover/selección) para la animación. */
  highlightId?: string;
}

export function BotCreateDialog({ templates, groups, highlightId }: BotCreateDialogProps) {
  return (
    // Backdrop
    <div className="flex h-full w-full items-center justify-center bg-black/40 p-6 font-sans">
      {/* Dialog */}
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Crear bot</h2>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              Conversamos para entender tu negocio y generamos el bot por ti. Elige una
              plantilla como punto de partida y la personalizamos con tus respuestas.
            </p>
          </div>
          <X className="h-5 w-5 shrink-0 text-gray-400" />
        </div>

        {/* Secciones */}
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-6 pb-6 pt-4">
          {groups.map((g) => {
            const items = templates.filter((t) => t.group === g.key);
            if (items.length === 0) return null;
            return (
              <div key={g.key}>
                <h3 className="text-sm font-semibold text-gray-900">{g.title}</h3>
                {g.subtitle && <p className="mb-2 text-xs text-gray-500">{g.subtitle}</p>}
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((t) => {
                    const Icon = ICONS[t.icon] ?? Bot;
                    const active = highlightId === t.id;
                    return (
                      <div
                        key={t.id}
                        className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                          active ? "border-theme-500 bg-theme-50" : "border-gray-200"
                        }`}
                      >
                        <span className="mt-0.5 flex items-center gap-1 rounded-md bg-theme-100 px-2 py-2">
                          <Bot className="h-4 w-4 text-theme-700/70" />
                          <Icon className="h-5 w-5 text-theme-700" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 font-medium text-gray-900">
                            {t.name}
                            {t.roleTag && (
                              <Badge color={t.roleTag.color} className="h-4 px-1 text-[9px]">
                                {t.roleTag.name}
                              </Badge>
                            )}
                          </span>
                          <span className="block text-sm text-gray-500">{t.description}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
