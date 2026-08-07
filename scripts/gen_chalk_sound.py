#!/usr/bin/env python3
# Sonido de TIZA trazando 3 líneas: 3 rasguños ásperos y GRANULADOS (grano
# aleatorio, sin tono → no zumba), espaciados para que se oiga cada trazo.
# Salida: public/sounds/chalk.wav
import wave, struct, math, random

SR = 44100
DUR = 0.7
n = int(SR * DUR)
buf = [0.0] * n
random.seed(9)

SCRATCHES = [0.00, 0.166, 0.333]  # ~5 frames entre trazos (a 30fps)
SCRATCH_LEN = 0.26

prev = 0.0
for st in SCRATCHES:
    start = int(st * SR)
    length = int(SR * SCRATCH_LEN)
    grain = 0.6
    grain_hold = int(SR * 0.0035)  # el grano cambia cada ~3.5 ms
    for i in range(length):
        idx = start + i
        if idx >= n:
            break
        t = i / SR
        # envolvente: ataque corto, cuerpo, caída
        env = min(1.0, t / 0.006) * math.exp(-t / 0.16)
        if i % grain_hold == 0:
            grain = random.uniform(0.25, 1.0)  # aspereza irregular (no periódica)
        nw = random.uniform(-1.0, 1.0)
        hp = nw - prev  # brillo (high-pass por diferencia)
        prev = nw
        body = 0.7 * hp + 0.3 * nw
        buf[idx] += env * body * grain * 0.9

peak = max(1e-6, max(abs(x) for x in buf))
scale = 0.9 / peak
with wave.open("public/sounds/chalk.wav", "w") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for x in buf:
        v = int(max(-1.0, min(1.0, x * scale)) * 32767)
        frames += struct.pack("<h", v)
    w.writeframes(bytes(frames))
print(f"chalk.wav: {DUR}s, {len(SCRATCHES)} rasguños de {SCRATCH_LEN}s")
