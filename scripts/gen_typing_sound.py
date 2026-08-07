#!/usr/bin/env python3
# Genera un sonido de TECLEO articulado (teclas distinguibles, no un "zzzip").
# Cada tecla = transiente corto + "tick" agudo + "tock" grave, con caída seca.
# Salida: public/sounds/type_kbd.wav
import wave, struct, math, random

SR = 44100
DUR = 0.8
n = int(SR * DUR)
buf = [0.0] * n
random.seed(11)

# Clicks bien separados → se oye cada tecla (tecleo rápido pero articulado).
clicks = []
t = 0.02
while t < DUR - 0.05:
    clicks.append(t)
    t += random.uniform(0.05, 0.085)  # ~12-20 teclas/seg

for c in clicks:
    start = int(c * SR)
    body = int(SR * 0.04)  # 40 ms por tecla
    click_f = random.uniform(2200, 3600)  # "tick" del contacto
    thock_f = random.uniform(170, 280)    # "tock" del fondo de tecla
    amp = random.uniform(0.7, 1.0)
    for i in range(body):
        idx = start + i
        if idx >= n:
            break
        tt = i / SR
        transient = random.uniform(-1, 1) * math.exp(-tt / 0.0025) * 0.9
        click = math.sin(2 * math.pi * click_f * tt) * math.exp(-tt / 0.010) * 0.45
        thock = math.sin(2 * math.pi * thock_f * tt) * math.exp(-tt / 0.024) * 0.55
        buf[idx] += amp * (transient + click + thock)

peak = max(1e-6, max(abs(x) for x in buf))
scale = 0.9 / peak
with wave.open("public/sounds/type_kbd.wav", "w") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for x in buf:
        v = int(max(-1.0, min(1.0, x * scale)) * 32767)
        frames += struct.pack("<h", v)
    w.writeframes(bytes(frames))

print(f"type_kbd.wav: {len(clicks)} teclas en {DUR}s")
