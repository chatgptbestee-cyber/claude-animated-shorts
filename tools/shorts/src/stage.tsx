import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {clamp01, Data, Finish, H, prog, useT, W, Word} from './common';

/* Look of the "two couples" series: black stage, hanging lamps, white figures,
   left/right comparison, sentence subtitles with a gold current word. */

export const G = {
  gold: '#f5c04a',
  goldSoft: 'rgba(245,192,74,0.35)',
  white: '#f4f5f7',
  shade: '#b9bec7',
  dim: 'rgba(244,245,247,0.45)',
  panel: '#16191f',
};
export const FLOOR = 1180;
export const LX = 270;
export const RX = 810;

export type Fig = {
  x: number; y?: number; s?: number; lean?: number; aL?: number; aR?: number;
  her?: boolean; face?: 1 | -1; op?: number; legs?: number; wet?: number; tint?: string;
};

const SH = {x: 0, y: -212};
const ARM = 105;

/** World position of a hand ('L' = screen-left arm, 'R' = screen-right arm). */
export const hand = (f: Fig, which: 'L' | 'R') => {
  const s = f.s ?? 1.2, a = ((which === 'L' ? f.aL : f.aR) ?? (which === 'L' ? -12 : 12)) * Math.PI / 180;
  const lx = SH.x + Math.sin(a) * ARM, ly = SH.y + Math.cos(a) * ARM;
  const r = ((f.lean ?? 0) * Math.PI) / 180;
  const rx = lx * Math.cos(r) - ly * Math.sin(r), ry = lx * Math.sin(r) + ly * Math.cos(r);
  return {x: f.x + rx * s, y: (f.y ?? FLOOR) + ry * s};
};

export const Figure: React.FC<Fig> = (f) => {
  const s = f.s ?? 1.2, aL = f.aL ?? -12, aR = f.aR ?? 12, face = f.face ?? 1, legs = f.legs ?? 1;
  const arm = (a: number) => {
    const r = (a * Math.PI) / 180;
    return `M ${SH.x} ${SH.y} L ${SH.x + Math.sin(r) * ARM} ${SH.y + Math.cos(r) * ARM}`;
  };
  const body = (col: string, dx: number) => (
    <g stroke={col} strokeLinecap="round" strokeLinejoin="round" fill="none" transform={`translate(${dx} ${dx * 0.6})`}>
      {legs > 0 && <path d={`M 0 -120 L ${-20 * legs} 0 M 0 -120 L ${20 * legs} 0`} strokeWidth={24} />}
      <path d="M 0 -222 L 0 -122" strokeWidth={46} />
      <path d={arm(aL)} strokeWidth={21} />
      <path d={arm(aR)} strokeWidth={21} />
      <circle cx={0} cy={-268} r={36} fill={col} stroke="none" />
      {f.her && <circle cx={-face * 30} cy={-290} r={17} fill={col} stroke="none" />}
      {f.her && <path d={`M ${-face * 30} -290 Q ${-face * 50} -262 ${-face * 40} -236`} strokeWidth={12} />}
    </g>
  );
  return (
    <g transform={`translate(${f.x} ${f.y ?? FLOOR}) rotate(${f.lean ?? 0}) scale(${s})`} opacity={f.op ?? 1}>
      <ellipse cx={0} cy={4} rx={60} ry={10} fill="#000" opacity={0.6} />
      {body(G.shade, 5)}
      {body(f.tint ?? G.white, 0)}
      {(f.wet ?? 0) > 0 &&
        [-30, 0, 26, -14, 18].map((dx, i) => (
          <path key={i} d={`M ${dx} ${-300 + i * 40} q 4 10 0 14 q -4 -4 0 -14`} fill="#8fc3ff" opacity={f.wet} />
        ))}
    </g>
  );
};

export const Lamp: React.FC<{x: number; on: number}> = ({x, on}) => (
  <g>
    <defs>
      <linearGradient id={`cone${x}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff6dc" stopOpacity={0.22 * on} />
        <stop offset="1" stopColor="#fff6dc" stopOpacity={0.02 * on} />
      </linearGradient>
      <radialGradient id={`pool${x}`}>
        <stop offset="0" stopColor="#fff6dc" stopOpacity={0.16 * on} />
        <stop offset="1" stopColor="#fff6dc" stopOpacity={0} />
      </radialGradient>
    </defs>
    <polygon points={`${x - 34},300 ${x + 34},300 ${x + 270},${FLOOR + 10} ${x - 270},${FLOOR + 10}`} fill={`url(#cone${x})`} />
    <ellipse cx={x} cy={FLOOR + 6} rx={300} ry={40} fill={`url(#pool${x})`} />
    <line x1={x} y1={0} x2={x} y2={262} stroke="#3a3d44" strokeWidth={4} />
    <path d={`M ${x - 46} 304 L ${x - 22} 262 L ${x + 22} 262 L ${x + 46} 304 Z`} fill="#2a2d33" />
    <ellipse cx={x} cy={304} rx={30} ry={8} fill="#fff6dc" opacity={0.3 + 0.7 * on} />
  </g>
);

/** Background, floor and lamps (inside the camera). */
export const Stage: React.FC<{onL: number; onR: number; children?: React.ReactNode; tilt?: number}> = ({onL, onR, children}) => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <defs>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#15171c" />
        <stop offset="1" stopColor="#000" />
      </linearGradient>
      <filter id="gl" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width={W} height={H} fill="#050506" />
    <rect y={FLOOR} width={W} height={H - FLOOR} fill="url(#floor)" />
    <Lamp x={LX} on={onL} />
    <Lamp x={RX} on={onR} />
    {children}
    <rect x={0} y={0} width={540} height={H} fill="#000" opacity={0.6 * (1 - onL)} />
    <rect x={540} y={0} width={540} height={H} fill="#000" opacity={0.6 * (1 - onR)} />
  </svg>
);

/** Camera: focus -1 (left couple) .. 0 (both) .. 1 (right couple). */
export const Cam2: React.FC<{focus: number; zoom: number; children: React.ReactNode; shake?: number}> = ({focus, zoom, children, shake = 0}) => {
  const t = useT();
  const tx = 540 + focus * 270;
  const s = 1 + 0.32 * zoom;
  const sx = shake * Math.sin(t * 53) * 6, sy = shake * Math.cos(t * 47) * 6;
  return (
    <AbsoluteFill style={{transform: `translate(${(540 - tx) * zoom + sx}px, ${sy}px) scale(${s})`, transformOrigin: `${tx}px 980px`}}>{children}</AbsoluteFill>
  );
};

/** Column headers with a small live sub-line, like a scoreboard. */
export const Headers: React.FC<{l: string; r: string; ls?: string; rs?: string; op?: number}> = ({l, r, ls, rs, op = 1}) => (
  <div style={{position: 'absolute', top: 128, left: 0, right: 0, display: 'flex', opacity: op}}>
    {[[l, ls], [r, rs]].map(([a, b], i) => (
      <div key={i} style={{width: 540, textAlign: 'center', color: G.white}}>
        <div style={{fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 32, letterSpacing: 7}}>{a}</div>
        {b && <div style={{fontFamily: 'JetBrains Mono', fontSize: 22, letterSpacing: 4, opacity: 0.6, marginTop: 10}}>{b}</div>}
      </div>
    ))}
  </div>
);

/** Small speech label above a figure. */
export const Bubble: React.FC<{x: number; y: number; text: string; s: number; e: number; gold?: boolean}> = ({x, y, text, s, e, gold}) => {
  const t = useT();
  if (t < s || t > e + 0.25) return null;
  const p = prog(t, s, s + 0.2) * (1 - prog(t, e, e + 0.25));
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * p})`} opacity={p}>
      <foreignObject x={-200} y={-70} width={400} height={140}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: 140}}>
          <div style={{
            background: gold ? G.gold : G.white, color: '#101114', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 24,
            letterSpacing: 2, padding: '10px 16px', borderRadius: 12, textAlign: 'center', lineHeight: 1.25, maxWidth: 360,
            boxShadow: '0 0 24px rgba(0,0,0,0.6)',
          }}>{text}</div>
        </div>
      </foreignObject>
    </g>
  );
};

export const Heart: React.FC<{x: number; y: number; p: number; s?: number}> = ({x, y, p, s = 1}) =>
  p > 0 ? (
    <path transform={`translate(${x} ${y - 20 * p}) scale(${s * (0.6 + 0.4 * p)})`} opacity={p} filter="url(#gl)" fill="#ff5a6e"
      d="M 0 18 C -40 -10 -26 -44 0 -26 C 26 -44 40 -10 0 18 Z" />
  ) : null;

export const Rain: React.FC<{n: number; wind?: number; x0?: number; x1?: number; op?: number}> = ({n, wind = 0, x0 = 0, x1 = W, op = 1}) => {
  const t = useT();
  return (
    <g stroke="#9cc8ff" strokeLinecap="round" opacity={op}>
      {Array.from({length: n}).map((_, i) => {
        const sp = 1400 + random(`v${i}`) * 600;
        const y = ((random(`y${i}`) * 1300 + t * sp) % 1300) + 120;
        const x = x0 + random(`x${i}`) * (x1 - x0) + wind * (y - 120) * 0.25;
        return <line key={i} x1={x} y1={y} x2={x - wind * 14} y2={y + 34} strokeWidth={3} opacity={0.35 + 0.3 * random(`o${i}`)} />;
      })}
    </g>
  );
};

/** Sentence subtitles: words appear as spoken, current word in gold. */
export const Subs2: React.FC<{d: Data; hide?: number[]; y?: number}> = ({d, hide = [], y = 1420}) => {
  const t = useT();
  const chunks: Word[][] = [];
  d.phrases.forEach((_, pi) => {
    const ws = d.words.filter((w) => w.p === pi);
    if (hide.includes(pi)) return;
    if (ws.length > 7) {
      const h = Math.ceil(ws.length / 2);
      chunks.push(ws.slice(0, h), ws.slice(h));
    } else chunks.push(ws);
  });
  const idx = chunks.findIndex((c, i) => {
    const nx = chunks[i + 1];
    const end = nx && nx[0].s - c[c.length - 1].e < 0.8 ? nx[0].s - 0.05 : c[c.length - 1].e + 0.45;
    return t >= c[0].s - 0.05 && t < end;
  });
  if (idx < 0) return null;
  const c = chunks[idx];
  return (
    <div style={{position: 'absolute', top: y, left: 80, right: 80, textAlign: 'center', lineHeight: 1.22}}>
      {c.map((w, i) => {
        const vis = clamp01((t - (w.s - 0.06)) / 0.08);
        const cur = t >= w.s - 0.04 && (i === c.length - 1 || t < c[i + 1].s - 0.04);
        return (
          <span key={i} style={{
            fontFamily: 'Inter', fontWeight: 800, fontSize: 58, letterSpacing: -0.5, color: cur ? G.gold : G.white,
            opacity: vis, display: 'inline-block', marginRight: 14, transform: `translateY(${(1 - vis) * 8}px)`,
            textShadow: '0 2px 18px rgba(0,0,0,0.9)',
          }}>{w.w.replace(/[„“"]/g, '')}</span>
        );
      })}
    </div>
  );
};

/** Final question card with two answer buttons. */
export const EndCard: React.FC<{s: number; q: string; a: string; b: string; dur: number}> = ({s, q, a, b, dur}) => {
  const t = useT();
  if (t < s) return null;
  const p = prog(t, s, s + 0.35) * (1 - prog(t, dur - 0.3, dur));
  const pa = prog(t, s + 0.5, s + 0.75), pb = prog(t, s + 0.65, s + 0.9);
  return (
    <AbsoluteFill style={{background: `rgba(0,0,0,${0.82 * p})`}}>
      <div style={{position: 'absolute', top: 640, left: 70, right: 70, textAlign: 'center', opacity: p, transform: `scale(${0.9 + 0.1 * p})`}}>
        <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: q.length > 40 ? 66 : 80, lineHeight: 1.08, letterSpacing: -1.5, color: G.white, textTransform: 'uppercase'}}>{q}</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 28, marginTop: 60}}>
          <div style={{fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 28, letterSpacing: 3, color: G.white, padding: '18px 32px',
            borderRadius: 40, background: G.panel, border: '2px solid rgba(244,245,247,0.35)', opacity: pa, transform: `scale(${0.8 + 0.2 * pa})`}}>{a}</div>
          <div style={{fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 28, letterSpacing: 3, color: '#101114', padding: '18px 32px',
            borderRadius: 40, background: G.gold, boxShadow: `0 0 30px ${G.goldSoft}`, opacity: pb, transform: `scale(${0.8 + 0.2 * pb})`}}>{b}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Shared frame for the series: stage content, headers, subtitles, end card, grain. */
export const Series: React.FC<{
  d: Data; children: React.ReactNode; headers: React.ReactNode; q: string; a: string; b: string; qPhrase: number;
}> = ({d, children, headers, q, a, b, qPhrase}) => {
  const t = useT();
  const qs = d.phrases[qPhrase].s - 0.1;
  const hp = t < qs ? 1 : 1 - prog(t, qs, qs + 0.3);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      {children}
      <div style={{opacity: hp}}>{headers}</div>
      <EndCard s={qs} q={q} a={a} b={b} dur={d.duration} />
      <Subs2 d={d} hide={[qPhrase]} y={t >= qs ? 1300 : 1420} />
      <Finish />
    </AbsoluteFill>
  );
};

/** Smooth step between values at given times: steps = [[time, value], ...]. */
export const keyed = (t: number, steps: [number, number][], dur = 0.5) => {
  let v = steps[0][1];
  for (let i = 1; i < steps.length; i++) {
    const [ts, val] = steps[i];
    v = v + (val - v) * prog(t, ts, ts + dur);
  }
  return v;
};
