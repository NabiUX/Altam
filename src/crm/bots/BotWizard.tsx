// BotWizard.tsx — Wizard de configuración del bot (recrea los pasos de bots-form).
//
// Presentacional: el prop `step` (1..5) controla qué paso se ve, para animar el
// avance como escenas. Un stepper arriba marca el progreso.
//   1. Identidad (tipo, nombre, descripción)
//   2. Prompt del sistema
//   3. Base de conocimiento
//   4. Escalamiento
//   5. Etiquetas disparadoras
import * as React from "react";
import { Bot, FileText, BookOpen, LifeBuoy, Tag, Check } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Switch } from "../ui/Switch";
import type { BotConfig } from "../mock/types";

const STEPS = [
  { n: 1, label: "Identidad", icon: Bot },
  { n: 2, label: "Instrucciones", icon: FileText },
  { n: 3, label: "Conocimiento", icon: BookOpen },
  { n: 4, label: "Escalamiento", icon: LifeBuoy },
  { n: 5, label: "Etiquetas", icon: Tag },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function InputBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900">
      {children}
    </div>
  );
}

export function BotWizard({ config, step = 1 }: { config: BotConfig; step?: number }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col bg-gray-50 p-8 font-sans">
      {/* Título */}
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-theme-100">
          <Bot className="h-6 w-6 text-theme-700" />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Configurar bot</h1>
          <p className="text-sm text-gray-500">{config.name}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-6 flex items-center">
        {STEPS.map((s, i) => {
          const done = s.n < step;
          const current = s.n === step;
          return (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    done
                      ? "bg-theme-600 text-white"
                      : current
                      ? "bg-theme-100 text-theme-700 ring-2 ring-theme-500"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : s.n}
                </span>
                <span
                  className={`text-[10px] ${current ? "font-semibold text-theme-700" : "text-gray-400"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-1 h-0.5 flex-1 ${done ? "bg-theme-500" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Contenido del paso */}
      <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <>
            <Field label="Tipo de bot">
              <Badge color="#3b82f6">Conversacional</Badge>
            </Field>
            <Field label="Nombre">
              <InputBox>{config.name}</InputBox>
            </Field>
            <Field label="Descripción">
              <InputBox>{config.description}</InputBox>
            </Field>
          </>
        )}

        {step === 2 && (
          <Field label="Prompt del sistema (cómo se comporta el bot)">
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm leading-relaxed text-gray-700">
              {config.systemPrompt}
            </div>
          </Field>
        )}

        {step === 3 && (
          <Field label="Bases de conocimiento conectadas">
            <div className="flex flex-wrap gap-2">
              {config.knowledgeBases.map((kb) => (
                <span
                  key={kb}
                  className="flex items-center gap-1.5 rounded-lg border border-theme-200 bg-theme-50 px-3 py-1.5 text-sm text-theme-800"
                >
                  <BookOpen className="h-4 w-4" />
                  {kb}
                </span>
              ))}
            </div>
          </Field>
        )}

        {step === 4 && (
          <>
            <Field label="Máximo de turnos de IA antes de escalar">
              <InputBox>{config.maxAiTurns} turnos</InputBox>
            </Field>
            <Field label="Escalar automáticamente a un humano">
              <div className="flex items-center gap-2">
                <Switch checked={config.autoEscalate} />
                <span className="text-sm text-gray-700">
                  {config.autoEscalate ? "Activado" : "Desactivado"}
                </span>
              </div>
            </Field>
            <Field label="Asesor de escalamiento">
              <InputBox>{config.escalationSeller}</InputBox>
            </Field>
          </>
        )}

        {step === 5 && (
          <Field label="Etiquetas que activan este bot">
            <div className="flex flex-wrap gap-2">
              {config.triggerTags.map((t) => (
                <Badge key={t.name} color={t.color}>
                  <Tag className="h-3 w-3" />
                  {t.name}
                </Badge>
              ))}
            </div>
          </Field>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <span className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500">
          Atrás
        </span>
        <span className="rounded-lg bg-theme-600 px-5 py-2 text-sm font-medium text-white">
          {step === STEPS.length ? "Guardar bot" : "Siguiente"}
        </span>
      </div>
    </div>
  );
}
