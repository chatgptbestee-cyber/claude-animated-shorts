import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const C = {
  bg0: '#05070b',
  bg1: '#101826',
  ink: '#e6ecf3',
  dim: 'rgba(230,236,243,0.32)',
  faint: 'rgba(230,236,243,0.12)',
  accent: '#ffb547',
  accentSoft: 'rgba(255,181,71,0.35)',
  cool: '#7fb2ff',
};

export type Word = {w: string; s: number; e: number; p: number};
export type Phrase = {text: string; s: number; e: number};
export type Data = {key: string; slug: string; duration: number; phrases: Phrase[]; words: Word[]};
export type Script = {label: string; scenes: number[]};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0..1 progress of t between a and b with easing. */
export const prog = (t: number, a: number, b: number, fn: (x: number) => number = ease) =>
  fn(clamp01((t - a) / Math.max(1e-6, b - a)));

export const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
};

/** Start time of the n-th occurrence of a word (case-insensitive, punctuation ignored). */
export const wt = (d: Data, word: string, n = 0, end = false) => {
  const clean = (x: string) => x.toLowerCase().replace(/[^a-zäöüß]/g, '');
  const hits = d.words.filter((w) => clean(w.w) === clean(word));
  const h = hits[Math.min(n, hits.length - 1)];
  if (!h) throw new Error(`word not found: ${word}`);
  return end ? h.e : h.s;
};

/** Scene boundaries: each scene starts just before its first phrase. */
export const sceneTimes = (d: Data, sc: Script) => {
  const starts = sc.scenes.map((p, i) => (i === 0 ? 0 : Math.max(0, d.phrases[p].s - 0.1)));
  return starts.map((s, i) => ({s, e: i + 1 < starts.length ? starts[i + 1] : d.duration}));
};

export const Background: React.FC<{tint?: string}> = ({tint = C.bg1}) => (
  <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 42%, ${tint} 0%, ${C.bg0} 72%)`}} />
);

/** Film grain + vignette on top of everything. */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.09, mixBlendMode: 'screen'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 13} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(90% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};

/** Slow drifting dust specks. */
export const Dust: React.FC<{n?: number; seed?: string; color?: string}> = ({n = 40, seed = 'd', color = C.ink}) => {
  const t = useT();
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      {Array.from({length: n}).map((_, i) => {
        const x = random(`${seed}x${i}`) * W;
        const y0 = random(`${seed}y${i}`) * H;
        const sp = 8 + random(`${seed}s${i}`) * 22;
        const y = (((y0 - t * sp) % H) + H) % H;
        const r = 1 + random(`${seed}r${i}`) * 2.2;
        const tw = 0.15 + 0.25 * (0.5 + 0.5 * Math.sin(t * (0.8 + random(`${seed}t${i}`)) + i));
        return <circle key={i} cx={x + Math.sin(t * 0.4 + i) * 10} cy={y} r={r} fill={color} opacity={tw} />;
      })}
    </svg>
  );
};

/** Camera: punch-in on a cut, then a slow drift. */
export const Cam: React.FC<{t: number; dur: number; from?: number; to?: number; children: React.ReactNode; ox?: number; oy?: number}> = ({
  t, dur, from = 1.0, to = 1.07, children, ox = 50, oy = 45,
}) => {
  const punch = 1 + 0.06 * (1 - prog(t, 0, 0.35));
  const drift = from + (to - from) * prog(t, 0, dur, (x) => x);
  return (
    <AbsoluteFill style={{transform: `scale(${punch * drift})`, transformOrigin: `${ox}% ${oy}%`}}>{children}</AbsoluteFill>
  );
};

export const GlowDefs: React.FC = () => (
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="glowBig" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="22" />
    </filter>
  </defs>
);

/** Stroke that draws itself on from p=0 to p=1 (path must set pathLength=1). */
export const dash = (p: number) => ({strokeDasharray: 1, strokeDashoffset: 1 - clamp01(p)});

/** Small series label, top left. */
export const Label: React.FC<{text: string}> = ({text}) => {
  const t = useT();
  return (
    <div
      style={{
        position: 'absolute', left: 72, top: 190, fontFamily: 'JetBrains Mono', fontSize: 26, letterSpacing: 5,
        color: C.ink, opacity: 0.55 * prog(t, 0, 0.4), display: 'flex', alignItems: 'center', gap: 14,
      }}
    >
      <span style={{width: 10, height: 10, borderRadius: 5, background: C.accent, boxShadow: `0 0 14px ${C.accent}`}} />
      {text}
    </div>
  );
};

/** Big keyword text with an accent bar that wipes in. */
export const Pop: React.FC<{text: string; s: number; e: number; y?: number; size?: number; accent?: boolean}> = ({
  text, s, e, y = 280, size = 140, accent = false,
}) => {
  const t = useT();
  if (t < s - 0.01 || t > e + 0.25) return null;
  const pin = prog(t, s, s + 0.22);
  const pout = prog(t, e, e + 0.2);
  const op = pin * (1 - pout);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: op}}>
      <div
        style={{
          fontFamily: 'Inter Display', fontWeight: 900, fontSize: size, letterSpacing: -4, lineHeight: 1,
          color: accent ? C.accent : C.ink, transform: `scale(${0.82 + 0.18 * pin}) translateY(${(1 - pin) * 24}px)`,
          textShadow: accent ? `0 0 40px ${C.accentSoft}` : '0 0 30px rgba(0,0,0,0.8)', textAlign: 'center', maxWidth: 940,
        }}
      >
        {text}
      </div>
      <div style={{marginTop: 22, height: 8, borderRadius: 4, background: C.accent, width: 180 * prog(t, s + 0.1, s + 0.45), boxShadow: `0 0 18px ${C.accent}`}} />
    </div>
  );
};

/** Word-by-word subtitles: chunks of up to 3 words, current word in an accent box. */
export const Subtitles: React.FC<{d: Data; y?: number}> = ({d, y = 1330}) => {
  const t = useT();
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  d.words.forEach((w, i) => {
    const prev = d.words[i - 1];
    if (cur.length && (cur.length >= 3 || w.p !== prev.p || /[,:.?!]$/.test(prev.w))) {
      chunks.push(cur);
      cur = [];
    }
    cur.push(w);
  });
  if (cur.length) chunks.push(cur);
  const idx = chunks.findIndex((c, i) => {
    const s = c[0].s - 0.05;
    const next = chunks[i + 1];
    const e = next && next[0].s - c[c.length - 1].e < 0.7 ? next[0].s - 0.05 : c[c.length - 1].e + 0.3;
    return t >= s && t < e;
  });
  if (idx < 0) return null;
  const c = chunks[idx];
  const tin = prog(t, c[0].s - 0.05, c[0].s + 0.1);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10}}>
      {c.map((w, i) => {
        const on = t >= w.s - 0.03 && (i === c.length - 1 ? true : t < c[i + 1].s - 0.03);
        const spoken = t >= w.s - 0.03;
        return (
          <span
            key={i}
            style={{
              fontFamily: 'Inter', fontWeight: 800, fontSize: 60, letterSpacing: -1, lineHeight: 1.15,
              padding: '6px 16px', borderRadius: 14,
              background: on ? C.accent : 'rgba(5,7,11,0.55)',
              color: on ? '#0b0d12' : spoken ? C.ink : 'rgba(230,236,243,0.55)',
              boxShadow: on ? `0 0 30px ${C.accentSoft}` : 'none',
              transform: `translateY(${(1 - tin) * 14}px) scale(${on ? 1.04 : 1})`, opacity: tin,
            }}
          >
            {w.w.replace(/[„“"]/g, '')}
          </span>
        );
      })}
    </div>
  );
};

/** Quick light flash on every cut. */
export const CutFlash: React.FC<{times: number[]}> = ({times}) => {
  const t = useT();
  const k = times.reduce((m, s) => (s > 0 && t >= s && t < s + 0.12 ? Math.max(m, 1 - (t - s) / 0.12) : m), 0);
  return <AbsoluteFill style={{background: '#fff', opacity: 0.1 * k, pointerEvents: 'none'}} />;
};

/** Renders the scene whose time window contains t, with local time. */
export const Scenes: React.FC<{times: {s: number; e: number}[]; render: (i: number, t: number, dur: number) => React.ReactNode}> = ({times, render}) => {
  const t = useT();
  const i = Math.max(0, times.findIndex((x) => t >= x.s && t < x.e));
  const cur = times[i] ?? times[times.length - 1];
  return <>{render(i, t - cur.s, cur.e - cur.s)}</>;
};

export const Shell: React.FC<{d: Data; sc: Script; children: React.ReactNode; tint?: string}> = ({d, sc, children, tint}) => (
  <AbsoluteFill style={{background: C.bg0, overflow: 'hidden'}}>
    <Background tint={tint} />
    {children}
    <CutFlash times={sceneTimes(d, sc).map((x) => x.s)} />
    <Label text={sc.label} />
    <Subtitles d={d} />
    <Finish />
  </AbsoluteFill>
);

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const fadeIO = (t: number, dur: number, a = 0.2) => prog(t, 0, a) * (1 - prog(t, dur - a, dur));
export {interpolate};
