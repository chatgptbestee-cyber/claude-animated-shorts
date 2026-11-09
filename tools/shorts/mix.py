"""Mix a voiceover with a synthesized ambient bed and cut whooshes.

- Music: slow pad (Am-F-C-G), soft low pulse, ducked under the voice.
- SFX: a filtered-noise whoosh on every scene cut, a soft sub hit at 0 s.
- Output: 48 kHz stereo WAV, loudness-normalized afterwards with ffmpeg.

Usage: python mix.py <video_key> <voice.mp3> <data.json> <out.wav>
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def lp_fast(x, fc):
    # Cheap low-pass: FFT brick wall with a soft edge (fine for pads/noise).
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)


def pad(n, seed=0):
    t = np.arange(n) / SR
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G (MIDI)
    seg = 4.0
    out = np.zeros(n, np.float32)
    for ci in range(int(np.ceil(n / SR / seg)) + 1):
        notes = chords[(ci + seed) % 4]
        a, b = int(ci * seg * SR), int(min(n, (ci + 1) * seg * SR + SR))
        if a >= n:
            break
        tt = t[a:b] - ci * seg
        env = np.minimum(1, tt / 1.2) * np.minimum(1, np.maximum(0, (seg + 1.0 - tt) / 1.0))
        for m in notes + [notes[0] - 12]:
            f = 440 * 2 ** ((m - 69) / 12)
            for det in (-0.12, 0.12):
                ph = 2 * np.pi * f * (1 + det / 100) * tt
                out[a:b] += (np.sin(ph) + 0.3 * np.sin(2 * ph)) * env * 0.05
    return lp_fast(out, 1400)


def pulse(n, bpm=84):
    t = np.arange(n) / SR
    beat = 60 / bpm
    out = np.zeros(n, np.float32)
    for k in range(int(n / SR / beat) + 1):
        a = int(k * beat * SR)
        L = int(0.35 * SR)
        if a >= n:
            break
        tt = np.arange(min(L, n - a)) / SR
        f = 48 + 30 * np.exp(-tt * 30)
        out[a:a + len(tt)] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * (0.5 if k % 2 else 0.8)
    return out * 0.22


def whoosh(seed):
    rng = np.random.default_rng(seed)
    L = int(0.5 * SR)
    noise = rng.standard_normal(L).astype(np.float32)
    tt = np.arange(L) / L
    env = (np.sin(np.pi * tt) ** 2) * np.where(tt < 0.6, tt / 0.6, 1)
    lo = lp_fast(noise, 900)
    hi = lp_fast(noise, 5000) - lo
    mix = lo * (1 - tt) + hi * tt
    return (mix * env * 0.35).astype(np.float32)


def sub_hit():
    L = int(0.9 * SR)
    tt = np.arange(L) / SR
    f = 40 + 60 * np.exp(-tt * 18)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 4) * 0.6).astype(np.float32)


def piano(n, seed=0):
    """Soft arpeggiated piano-like bed (Am-F-C-G), with a short room reverb."""
    rng = np.random.default_rng(seed)
    chords = [[45, 57, 64, 69, 72, 76], [41, 53, 60, 65, 69, 72], [48, 55, 64, 67, 72, 76], [43, 55, 62, 67, 71, 74]]
    order = [1, 2, 3, 4, 5, 4, 3, 2]
    step, bar = 0.5, 4.0
    out = np.zeros(n + SR * 3, np.float32)
    L = int(2.6 * SR)
    tt = np.arange(L) / SR
    env = np.exp(-tt * 2.2) * (1 - np.exp(-tt * 300))
    def note(m, vel, long=False):
        f = 440 * 2 ** ((m - 69) / 12)
        e = np.exp(-tt * (1.0 if long else 2.2)) * (1 - np.exp(-tt * 300))
        w = sum(a * np.sin(2 * np.pi * f * k * tt) for k, a in ((1, 1.0), (2, 0.45), (3, 0.18), (4, 0.08)))
        return (w * e * vel).astype(np.float32)
    nb = int(np.ceil(n / SR / bar)) + 1
    for b in range(nb):
        ch = chords[(b + seed) % 4]
        a0 = int(b * bar * SR)
        if a0 >= n:
            break
        x = note(ch[0], 0.35, long=True)
        out[a0:a0 + L] += x[:len(out) - a0][:L]
        for j, o in enumerate(order):
            a = int((b * bar + j * step) * SR)
            if a >= n:
                break
            x = note(ch[o], 0.16 * (0.85 + 0.3 * rng.random()))
            out[a:a + L] += x[:len(out[a:a + L])]
    out = out[:n]
    ir_len = int(1.2 * SR)
    ir = (rng.standard_normal(ir_len) * np.exp(-np.arange(ir_len) / SR * 4.0)).astype(np.float32) * 0.02
    ir[0] = 1.0
    wet = np.fft.irfft(np.fft.rfft(out, n + ir_len) * np.fft.rfft(ir, n + ir_len), n + ir_len)[:n].astype(np.float32)
    return lp_fast(wet, 3200)


def place(buf, clip, at):
    a = int(at * SR)
    if a < 0:
        clip, a = clip[-a:], 0
    b = min(len(buf), a + len(clip))
    if b > a:
        buf[a:b] += clip[:b - a]


def main():
    key, voice_path, data_path, out = sys.argv[1:5]
    data = json.loads(Path(data_path).read_text())
    sc = json.loads(Path(__file__).with_name("scripts.json").read_text())[key]
    voice = load(voice_path)
    n = int(round(data["duration"] * SR))
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]
    # Bring every voiceover to the same level so the music sits the same under it.
    act = voice[np.abs(voice) > 0.02]
    voice = voice * (0.12 / (np.sqrt(np.mean(act ** 2)) + 1e-9))

    style = sc.get('music', 'pad')
    music = (0.35 * pad(n, seed=int(key[1:])) + piano(n, seed=int(key[1:]))) if style == 'piano' else pad(n, seed=int(key[1:])) + pulse(n)
    # Duck the music under the voice (fast attack, slow release).
    env = np.abs(voice)
    k = int(0.05 * SR)
    env = np.convolve(env, np.ones(k) / k, mode="same")
    env = env / (env.max() + 1e-9)
    duck = 1 - 0.55 * np.clip(env * 3, 0, 1)
    duck = onepole_lp(duck.astype(np.float32), 6)
    music *= duck * (0.085 if style == 'piano' else 0.17)

    sfx = np.zeros(n, np.float32)
    phrases = data["phrases"]
    cuts = [phrases[p]["s"] - 0.1 for p in sc["scenes"][1:]]
    if style != 'piano':
        for i, c in enumerate(cuts):
            place(sfx, whoosh(i), c - 0.3)
        place(sfx, sub_hit(), 0.0)

    # Short fades so the loop restarts cleanly.
    fade = int(0.04 * SR)
    for arr in (music, sfx):
        arr[:fade] *= np.linspace(0, 1, fade)
        arr[-fade:] *= np.linspace(1, 0, fade)

    left = voice + music * 0.9 + sfx * 0.8
    right = voice + music * 1.0 + sfx * 0.7
    st = np.stack([left, right], 1)
    st /= max(1.0, np.abs(st).max() / 0.95)
    import soundfile as sf
    sf.write(out, st, SR, subtype="FLOAT")
    print(f"{key}: {len(cuts)} cuts, {data['duration']:.2f}s -> {out}")


if __name__ == "__main__":
    main()
