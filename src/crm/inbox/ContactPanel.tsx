// ContactPanel.tsx — Panel derecho: info del contacto, etiquetas, asignación a
// vendedor, toggle "Pausar IA" y notas.
import * as React from "react";
import { Phone, Tag, UserCog, Bot, StickyNote } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Switch } from "../ui/Switch";
import type { Contact } from "../mock/types";

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 px-4 py-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

export function ContactPanel({ contact }: { contact: Contact }) {
  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white">
      {/* Cabecera */}
      <div className="flex flex-col items-center gap-2 px-4 py-5">
        <Avatar name={contact.name} src={contact.avatarUrl} size={72} />
        <div className="text-center">
          <div className="text-base font-semibold text-gray-900">{contact.name}</div>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
            <Phone className="h-3.5 w-3.5" />
            {contact.phone}
          </div>
        </div>
      </div>

      {/* Etiquetas */}
      <Section icon={<Tag className="h-3.5 w-3.5" />} title="Etiquetas">
        <div className="flex flex-wrap gap-1.5">
          {contact.labels.map((l) => (
            <span
              key={l.name}
              className="rounded-md border px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${l.color}1a`, color: l.color, borderColor: `${l.color}55` }}
            >
              {l.name}
            </span>
          ))}
        </div>
      </Section>

      {/* Vendedor asignado */}
      <Section icon={<UserCog className="h-3.5 w-3.5" />} title="Vendedor asignado">
        {contact.assignedSeller ? (
          <div className="flex items-center gap-2">
            <Avatar name={contact.assignedSeller} size={28} />
            <span className="text-sm text-gray-800">{contact.assignedSeller}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Sin asignar</span>
        )}
      </Section>

      {/* Pausar IA */}
      <Section icon={<Bot className="h-3.5 w-3.5" />} title="Automatización">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-800">Pausar IA</span>
          <Switch checked={contact.aiPaused} />
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {contact.aiPaused
            ? "La IA está pausada. Responde un asesor humano."
            : "La IA responde automáticamente."}
        </p>
      </Section>

      {/* Notas */}
      <Section icon={<StickyNote className="h-3.5 w-3.5" />} title="Notas">
        <div className="flex flex-col gap-2">
          {contact.notes.map((n, i) => (
            <div key={i} className="rounded-md bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
              {n}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
