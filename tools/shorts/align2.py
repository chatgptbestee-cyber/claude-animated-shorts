"""Word-level alignment of a known script, robust to sentences without pauses.

1. Split the audio into voiced segments by level.
2. Transcribe each segment with Whisper (sherpa-onnx).
3. Align script words to Whisper words (difflib on normalized words), so every
   script word gets the segment it was spoken in.
4. Inside each segment, spread the words by syllable weight and snap the
   boundaries to dips in the level curve.

Usage: python align2.py <video_key> <audio_path> <model_dir> <out_json>
"""
import difflib
import json
import sys
from pathlib import Path

import numpy as np

from align import HOP, SR, level_db, load_audio, norm, syllables, voiced_segments


def main():
    key, audio_path, model_dir, out = sys.argv[1:5]
    script = json.loads(Path(__file__).with_name("scripts.json").read_text())[key]
    phrases = script["phrases"]

    x = load_audio(audio_path)
    duration = len(x) / SR
    db = level_db(x)
    thr = max(-48.0, float(np.percentile(db, 95)) - 32.0)
    segs = voiced_segments(db, thr=thr, min_gap=0.12)

    import sherpa_onnx

    md = Path(model_dir)
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(next(md.glob("*encoder.int8.onnx"))),
        decoder=str(next(md.glob("*decoder.int8.onnx"))),
        tokens=str(next(md.glob("*tokens.txt"))),
        language="de", task="transcribe", num_threads=4,
    )
    asr_words = []  # (normalized word, segment index)
    asr_text = []
    for k, (s, e) in enumerate(segs):
        a, b = int(max(0, s - 0.15) * SR), int(min(duration, e + 0.15) * SR)
        st = rec.create_stream()
        st.accept_waveform(SR, x[a:b])
        rec.decode_stream(st)
        txt = st.result.text.strip()
        asr_text.append(txt)
        asr_words += [(w, k) for w in norm(txt).split() if w]

    words = []  # (display word, phrase index)
    for pi, p in enumerate(phrases):
        words += [(w, pi) for w in p.split()]
    sw = [norm(w) for w, _ in words]
    aw = [w for w, _ in asr_words]
    seg_of = [None] * len(words)
    sm = difflib.SequenceMatcher(None, sw, aw, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                seg_of[i1 + k] = asr_words[j1 + k][1]
        elif tag == "replace":
            for k in range(i2 - i1):
                seg_of[i1 + k] = asr_words[j1 + min(j2 - j1 - 1, int(k * (j2 - j1) / (i2 - i1)))][1]
    # Fill gaps from neighbours, keep monotonic.
    last = 0
    for i in range(len(words)):
        if seg_of[i] is None:
            nxt = next((seg_of[j] for j in range(i + 1, len(words)) if seg_of[j] is not None), last)
            seg_of[i] = last if last is not None else nxt
        seg_of[i] = max(seg_of[i], last)
        last = seg_of[i]

    times = [None] * len(words)
    for k, (s, e) in enumerate(segs):
        idx = [i for i in range(len(words)) if seg_of[i] == k]
        if not idx:
            continue
        wts = np.array([0.4 + syllables(words[i][0]) + 0.03 * len(words[i][0]) for i in idx])
        # Extra time after sentence ends inside a segment (short pause).
        wts += np.array([0.5 if words[i][0][-1] in ".?!…:" and i != idx[-1] else 0 for i in idx])
        cum = s + np.concatenate([[0], np.cumsum(wts)]) / wts.sum() * (e - s)
        b = list(cum)
        for j in range(1, len(b) - 1):
            c = int(round(b[j] / HOP))
            lo, hi = max(c - 7, int(b[j - 1] / HOP) + 3), min(c + 7, len(db) - 1)
            if hi > lo:
                b[j] = (lo + int(np.argmin(db[lo:hi + 1]))) * HOP
        for j, i in enumerate(idx):
            times[i] = (round(b[j], 3), round(b[j + 1], 3))

    out_words = [{"w": w, "s": t[0], "e": t[1], "p": p} for (w, p), t in zip(words, times)]
    out_phr = []
    for pi, p in enumerate(phrases):
        ws = [w for w in out_words if w["p"] == pi]
        out_phr.append({"text": p, "s": ws[0]["s"], "e": ws[-1]["e"]})
    data = {"key": key, "slug": script["slug"], "duration": round(duration, 3), "phrases": out_phr, "words": out_words,
            "asr": [{"s": s, "e": e, "text": t} for (s, e), t in zip(segs, asr_text)]}
    Path(out).write_text(json.dumps(data, ensure_ascii=False, indent=1))
    ratio = difflib.SequenceMatcher(None, sw, aw, autojunk=False).ratio()
    print(f"{key}: {len(segs)} segments, word match {ratio:.2f}, duration {duration:.2f}s")
    for p in out_phr:
        print(f"  {p['s']:6.2f}-{p['e']:6.2f} {p['text']}")
    for (w, p), t, n in zip(words, times, sw):
        pass
    miss = [words[i][0] for i, op in enumerate(sw) if op not in aw]
    if miss:
        print("  not heard as written:", " ".join(miss))


if __name__ == "__main__":
    main()
