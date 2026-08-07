#!/usr/bin/env python3
# Hornea todos los "pops" de mensaje en UNA sola pista (evita decenas de
# <Audio> que disparan "Maximum update depth" en Remotion).
# Coloca el ding (pop_src.wav) en el frame de aparición de cada mensaje.
import wave, struct, array

SR = 44100
FPS = 30
TOTAL_SEC = 6.4  # cubre la Escena 1 (190 frames)

# ding fuente (mono 16-bit)
w = wave.open("public/sounds/pop_src.wav", "r")
ch = w.getnchannels()
ding = array.array("h")
ding.frombytes(w.readframes(w.getnframes()))
w.close()
if ch == 2:
    ding = ding[0::2]
dlen = len(ding)

# Tiempos (en frames) idénticos a los de EVENTS en ChaosInbox.tsx:
# CALM: i*9-12 (i=0..4) → solo >=0 ; BURST: 46 + j*2.4 (j=0..39)
times = [t for t in (i * 9 - 12 for i in range(5)) if t >= 0]
times += [46 + j * 2.4 for j in range(40)]

N = int(SR * TOTAL_SEC)
buf = [0.0] * N
GAIN = 0.5
for t in times:
    start = int((t / FPS) * SR)
    for i in range(dlen):
        idx = start + i
        if idx >= N:
            break
        buf[idx] += GAIN * (ding[i] / 32768.0)

peak = max(1e-6, max(abs(x) for x in buf))
scale = min(1.0, 0.85 / peak)
out = array.array("h", (int(max(-1.0, min(1.0, x * scale)) * 32767) for x in buf))

w = wave.open("public/sounds/pops_track.wav", "w")
w.setnchannels(1)
w.setsampwidth(2)
w.setframerate(SR)
w.writeframes(out.tobytes())
w.close()
print(f"pops_track.wav: {TOTAL_SEC}s, {len(times)} dings")
