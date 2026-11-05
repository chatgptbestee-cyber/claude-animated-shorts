"""Word-level alignment of a known script to a voiceover.

1. Split the audio into voiced segments by level (like ffmpeg silencedetect).
2. Transcribe each segment with Whisper (sherpa-onnx) to verify the text.
3. Map script phrases to segment groups by text similarity (monotonic DP).
4. Spread each phrase's words over its voiced time by syllable weight, then
   snap word boundaries to the nearest dip in the level curve.

Usage: python align.py <video_key> <audio_path> <model_dir> <out_json>
"""
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 16000
HOP = 0.01  # 10 ms


def load_audio(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def level_db(x):
    win, hop = int(0.025 * SR), int(HOP * SR)
    n = max(1, (len(x) - win) // hop + 1)
    frames = np.lib.stride_tricks.sliding_window_view(x, win)[::hop][:n]
    rms = np.sqrt(np.mean(frames ** 2, axis=1) + 1e-12)
    return 20 * np.log10(rms + 1e-9)


def voiced_segments(db, thr=-40.0, min_gap=0.15, min_len=0.06):
    on = db > thr
    segs, i, n = [], 0, len(on)
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]:
                j += 1
            segs.append([i * HOP, j * HOP])
            i = j
        else:
            i += 1
    merged = []
    for s in segs:
        if merged and s[0] - merged[-1][1] < min_gap:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    return [s for s in merged if s[1] - s[0] >= min_len]


def norm(t):
    t = t.lower().replace("ß", "ss")
    return re.sub(r"[^a-zäöü ]+", "", t).strip()


def syllables(w):
    groups = re.findall(r"(?:ie|ei|ai|au|eu|äu|[aeiouyäöü])+", w.lower())
    return max(1, len(groups))


def main():
    key, audio_path, model_dir, out = sys.argv[1:5]
    script = json.loads(Path(__file__).with_name("scripts.json").read_text())[key]
    phrases = script["phrases"]

    x = load_audio(audio_path)
    duration = len(x) / SR
    db = level_db(x)
    segs = voiced_segments(db)

    import sherpa_onnx

    md = Path(model_dir)
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(next(md.glob("*encoder.int8.onnx"))),
        decoder=str(next(md.glob("*decoder.int8.onnx"))),
        tokens=str(next(md.glob("*tokens.txt"))),
        language="de", task="transcribe", num_threads=4,
    )
    asr = []
    for s, e in segs:
        a, b = int(max(0, s - 0.15) * SR), int(min(duration, e + 0.15) * SR)
        st = rec.create_stream()
        st.accept_waveform(SR, x[a:b])
        rec.decode_stream(st)
        asr.append(st.result.text.strip())

    # Monotonic DP: each phrase takes a contiguous group of segments;
    # segments may be skipped (breaths, clicks) with a penalty by length.
    P, S = len(phrases), len(segs)
    NEG = -1e9
    dp = np.full((P + 1, S + 1), NEG)
    back = {}
    dp[0][0] = 0
    for i in range(P + 1):
        for j in range(S + 1):
            if dp[i][j] == NEG:
                continue
            if j < S:  # skip segment j
                pen = 0.05 if len(norm(asr[j])) < 4 else 0.6
                if dp[i][j] - pen > dp[i][j + 1]:
                    dp[i][j + 1] = dp[i][j] - pen
                    back[(i, j + 1)] = ("skip", i, j)
            if i < P:
                for k in range(j + 1, min(S, j + 4) + 1):
                    hyp = norm(" ".join(asr[j:k]))
                    sc = difflib.SequenceMatcher(None, norm(phrases[i]), hyp).ratio()
                    if dp[i][j] + sc > dp[i + 1][k]:
                        dp[i + 1][k] = dp[i][j] + sc
                        back[(i + 1, k)] = ("take", i, j)
    groups, i, j = [None] * P, P, S
    while (i, j) != (0, 0):
        kind, pi, pj = back[(i, j)]
        if kind == "take":
            groups[pi] = (pj, j)
        i, j = pi, pj

    words_out, phrases_out = [], []
    for pi, (a, b) in enumerate(groups):
        parts = segs[a:b]
        words = phrases[pi].split()
        wts = np.array([0.4 + syllables(w) + 0.03 * len(w) for w in words])
        voiced = sum(e - s for s, e in parts)
        cum = np.concatenate([[0], np.cumsum(wts) / wts.sum() * voiced])

        def at(t):  # voiced-time offset -> absolute time
            for s, e in parts:
                if t <= e - s + 1e-9:
                    return s + t
                t -= e - s
            return parts[-1][1]

        bounds = [at(t) for t in cum]
        # Snap inner boundaries to the lowest level within +-70 ms.
        for k in range(1, len(bounds) - 1):
            c = int(round(bounds[k] / HOP))
            lo, hi = max(c - 7, int(bounds[k - 1] / HOP) + 3), min(c + 7, len(db) - 1)
            if hi > lo:
                bounds[k] = (lo + int(np.argmin(db[lo:hi + 1]))) * HOP
        for k, w in enumerate(words):
            words_out.append({"w": w, "s": round(bounds[k], 3), "e": round(bounds[k + 1], 3), "p": pi})
        phrases_out.append({
            "text": phrases[pi], "s": round(parts[0][0], 3), "e": round(parts[-1][1], 3),
            "asr": " ".join(asr[a:b]),
            "match": round(difflib.SequenceMatcher(None, norm(phrases[pi]), norm(" ".join(asr[a:b]))).ratio(), 2),
        })

    data = {"key": key, "slug": script["slug"], "duration": round(duration, 3),
            "phrases": phrases_out, "words": words_out,
            "skipped": [{"s": s, "e": e, "asr": t} for k, ((s, e), t) in enumerate(zip(segs, asr))
                        if not any(g[0] <= k < g[1] for g in groups)]}
    Path(out).write_text(json.dumps(data, ensure_ascii=False, indent=1))
    for p in phrases_out:
        print(f"{p['s']:6.2f}-{p['e']:6.2f} match={p['match']:.2f} | {p['text']}\n{'':21}asr: {p['asr']}")
    for s in data["skipped"]:
        print(f"  skipped {s['s']:.2f}-{s['e']:.2f}: {s['asr']!r}")


if __name__ == "__main__":
    main()
