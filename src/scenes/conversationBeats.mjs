// Gemelo en JS puro de conversationBeats.ts (solo para scripts/check-beats.mjs).
// Mantener sincronizado con el .ts.
export const BEAT_AT = {
  1: 20,
  2: 130,
  3: 230,
  4: 350,
  5: 460,
  6: 545,
  7: 620,
};

const TYPING_LEAD = 30;

export function visibleMessages(messages, frame) {
  return messages.filter((m) => frame >= BEAT_AT[m.beat]);
}

export function typingAt(frame) {
  const inbound = [2, 4];
  return inbound.some((b) => frame >= BEAT_AT[b] - TYPING_LEAD && frame < BEAT_AT[b])
    ? "left"
    : null;
}
