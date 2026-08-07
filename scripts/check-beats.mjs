import { BEAT_AT, visibleMessages, typingAt } from "../src/scenes/conversationBeats.mjs";
import assert from "node:assert";

const msgs = [{ beat: 1 }, { beat: 3 }, { beat: 7 }];
assert.equal(visibleMessages(msgs, 0).length, 0, "nada antes del beat 1");
assert.equal(visibleMessages(msgs, BEAT_AT[1]).length, 1, "solo beat 1 al inicio");
assert.equal(visibleMessages(msgs, BEAT_AT[7]).length, 3, "todos al final");
assert.equal(typingAt(BEAT_AT[2] - 10), "left", "typing antes del entrante");
assert.equal(typingAt(BEAT_AT[3] + 5), null, "sin typing tras el bot");
console.log("beats OK");
