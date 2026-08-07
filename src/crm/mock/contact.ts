// contact.ts — Datos del panel derecho (ContactPanel) para la conversación activa.
import type { Contact } from "./types";
import { LABELS } from "./conversation";

export const contact: Contact = {
  name: "María Torres",
  phone: "+593 99 123 4567",
  avatarUrl: "", // placeholder → inicial "M"
  labels: [LABELS.campana, LABELS.interesado],
  // Antes del escalamiento no hay vendedor; tras escalar → "Carlos Méndez".
  assignedSeller: "Carlos Méndez",
  // Antes del escalamiento la IA está activa (false); tras escalar se pausa (true).
  aiPaused: true,
  notes: [
    "Llegó por la campaña 'Nueva Colección · Octubre'.",
    "Interesada en chaqueta de mezclilla talla M ($45).",
  ],
};
