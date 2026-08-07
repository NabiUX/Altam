// Lógica pura de la escena Conversation: en qué frame LOCAL aparece cada beat,
// qué mensajes son visibles y cuándo mostrar "escribiendo…".
// Frames locales a la escena (dura ~730). Ver gemelo .mjs para los asserts.
export const BEAT_AT: Record<number, number> = {
  1: 20,
  2: 130,
  3: 230,
  4: 350,
  5: 460,
  6: 545,
  7: 620,
};

const TYPING_LEAD = 30; // frames de "escribiendo…" antes de cada mensaje entrante

export function visibleMessages<T extends { beat: number }>(
  messages: T[],
  frame: number,
): T[] {
  return messages.filter((m) => frame >= BEAT_AT[m.beat]);
}

export function typingAt(frame: number): "left" | null {
  const inbound = [2, 4];
  return inbound.some((b) => frame >= BEAT_AT[b] - TYPING_LEAD && frame < BEAT_AT[b])
    ? "left"
    : null;
}
