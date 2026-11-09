import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {clamp01, Data, H, prog, useT, W} from './common';

/* "Life lesson" look: one flat 2D scene per sentence inside a rounded TV-like
   window on black, one big serif word at a time in the middle. */

export const WW = 920;
export const WH = 712;
const WX = (W - WW) / 2;
const WY = 900 - WH / 2;

/** Superellipse outline of the window (window coordinates). */
const squircle = (() => {
  const n = 4.6, a = WW / 2, b = WH / 2, pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const th = (i / 160) * Math.PI * 2;
    const c = Math.cos(th), s = Math.sin(th);
    const x = a + a * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = b + b * Math.sign(s) * Math.abs(s) ** (2 / n);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
})();

export const P = {
  skin: ['#f2c9a8', '#e0a985', '#b9805c', '#8a5a3d'],
  hair: {black: '#2a2321', brown: '#5b3b2a', blond: '#c9a25f', grey: '#9a9590', red: '#8e3f24'},
  ink: '#2b2a2e',
};

/* ---------- people ---------- */

export type Person = {
  x: number; y: number; s?: number; face?: 1 | -1; kid?: boolean; skin?: string;
  hair?: 'short' | 'long' | 'bun' | 'pony' | 'curly' | 'none'; hairCol?: string; top?: string; bottom?: string;
  pose?: 'stand' | 'sit' | 'walk'; armF?: number; armB?: number; walk?: number; op?: number; eyes?: boolean; lean?: number;
  bag?: string; cape?: string; capeWave?: number;
};

export const Guy: React.FC<Person> = (p) => {
  const s = p.s ?? 1, f = p.face ?? 1, kid = !!p.kid;
  const legL = kid ? 52 : 84, torH = kid ? 50 : 72, torW = kid ? 34 : 40, headR = kid ? 17 : 18, neck = kid ? 3 : 5;
  const sit = p.pose === 'sit';
  const hipY = sit ? -50 : -legL;
  const shY = hipY - torH + 10;
  const hcY = hipY - torH - neck - headR;
  const skin = p.skin ?? P.skin[0], top = p.top ?? '#4d6a8f', bottom = p.bottom ?? '#3a3f4b', hc = p.hairCol ?? P.hair.brown;
  const sw = p.pose === 'walk' ? Math.sin(p.walk ?? 0) * 22 : 0;
  const leg = (ang: number, col: string, key: string) =>
    sit ? (
      <g key={key}>
        <rect x={f > 0 ? -6 : -46} y={hipY - 8} width={52} height={16} rx={8} fill={col} />
        <rect x={f * 40 - 8} y={hipY - 4} width={15} height={-hipY + 4} rx={7} fill={col} />
        <rect x={f * 40 - 8 + (f > 0 ? 0 : -10)} y={-8} width={24} height={9} rx={4} fill="#2c2a2a" />
      </g>
    ) : (
      <g key={key} transform={`rotate(${ang} 0 ${hipY})`}>
        <rect x={-8} y={hipY - 4} width={16} height={legL + 4} rx={8} fill={col} />
        <rect x={f > 0 ? -8 : -14} y={-8} width={22} height={9} rx={4} fill="#2c2a2a" />
      </g>
    );
  const arm = (ang: number, col: string) => (
    <g transform={`rotate(${-f * ang} 0 ${shY})`}>
      <rect x={-6.5} y={shY - 4} width={13} height={kid ? 46 : 62} rx={6.5} fill={col} />
      <circle cx={0} cy={shY + (kid ? 44 : 60)} r={6.5} fill={skin} />
    </g>
  );
  const back = -f;
  const hairEl = (() => {
    const cap = `M ${-headR - 1} ${hcY + 2} A ${headR + 1} ${headR + 2} 0 0 1 ${headR + 1} ${hcY - 2} Q ${back * 4} ${hcY - headR + 6} ${back * (headR + 1)} ${hcY + 6} Z`;
    switch (p.hair ?? 'short') {
      case 'none': return null;
      case 'long': return <g fill={hc}><path d={cap} /><rect x={back > 0 ? 0 : -headR - 3} y={hcY - 6} width={headR + 3} height={headR * 2 + 10} rx={8} /></g>;
      case 'bun': return <g fill={hc}><path d={cap} /><circle cx={back * (headR - 2)} cy={hcY - headR + 2} r={8} /></g>;
      case 'pony': return <g fill={hc}><path d={cap} /><ellipse cx={back * (headR + 4)} cy={hcY + 4} rx={7} ry={15} /></g>;
      case 'curly': return <g fill={hc}>{[[-10, -12], [0, -16], [10, -12], [back * 14, -2], [back * 12, 8]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={hcY + dy} r={10} />)}</g>;
      default: return <path d={cap} fill={hc} />;
    }
  })();
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${s}) rotate(${p.lean ?? 0} 0 ${hipY})`} opacity={p.op ?? 1}>
      <ellipse cx={0} cy={2} rx={34} ry={6} fill="#000" opacity={0.18} />
      {p.cape && <path d={`M ${-torW / 2 + 4} ${shY - 4} L ${torW / 2 - 4} ${shY - 4} L ${-f * (40 + 8 * Math.sin(p.capeWave ?? 0))} ${hipY + 20} L ${-f * 70} ${hipY + 4} Z`} fill={p.cape} />}
      {arm(p.armB ?? -8, shade(top))}
      {p.bag && <rect x={-f * (torW / 2 + 10) - 13} y={shY - 2} width={26} height={kid ? 40 : 52} rx={8} fill={p.bag} />}
      {leg(-sw, shade(bottom), 'lb')}
      <rect x={-torW / 2} y={hipY - torH} width={torW} height={torH + 8} rx={13} fill={top} />
      {leg(sw, bottom, 'lf')}
      <rect x={-5} y={hcY + headR - 4} width={10} height={neck + 8} fill={skin} />
      <circle cx={f * 2} cy={hcY} r={headR} fill={skin} />
      {hairEl}
      {(p.eyes ?? true) && <circle cx={f * 10} cy={hcY - 2} r={2.2} fill={P.ink} />}
      {arm(p.armF ?? 8, top)}
    </g>
  );
};

/** Darker version of a hex colour, for limbs that are further away. */
export const shade = (hex: string, k = 0.78) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
};

/** Person lying in bed, seen from the side. */
export const Bed: React.FC<{x: number; y: number; w?: number; who?: Person | null; blanket?: string; eyesOpen?: boolean}> = ({x, y, w = 380, who, blanket = '#7d8fb3', eyesOpen = true}) => (
  <g>
    <rect x={x} y={y - 120} width={22} height={120} rx={6} fill="#6b4f3a" />
    <rect x={x + w - 14} y={y - 70} width={18} height={70} rx={6} fill="#6b4f3a" />
    <rect x={x} y={y - 62} width={w} height={40} rx={10} fill="#e9e3d8" />
    <rect x={x + 6} y={y - 24} width={w - 12} height={24} rx={4} fill="#5a4332" />
    <rect x={x + 28} y={y - 88} width={92} height={34} rx={16} fill="#f6f1e8" />
    {who && (
      <g>
        <circle cx={x + 82} cy={y - 92} r={19} fill={who.skin ?? P.skin[0]} />
        {(who.hair ?? 'short') !== 'none' && <path d={`M ${x + 63} ${y - 88} A 20 21 0 0 1 ${x + 101} ${y - 96} Q ${x + 84} ${y - 118} ${x + 64} ${y - 100} Z`} fill={who.hairCol ?? P.hair.brown} />}
        {eyesOpen ? <circle cx={x + 90} cy={y - 96} r={2.3} fill={P.ink} /> : <path d={`M ${x + 86} ${y - 95} q 4 3 8 0`} stroke={P.ink} strokeWidth={2} fill="none" />}
      </g>
    )}
    <path d={`M ${x + 96} ${y - 58} Q ${x + 120} ${y - 102} ${x + 200} ${y - 92} Q ${x + w - 40} ${y - 84} ${x + w - 8} ${y - 60} L ${x + w - 8} ${y - 30} L ${x + 96} ${y - 30} Z`} fill={blanket} />
  </g>
);

/* ---------- rooms & props ---------- */

export const Room: React.FC<{wall: string; floor: string; floorY?: number; children?: React.ReactNode}> = ({wall, floor, floorY = 560, children}) => (
  <g>
    <rect width={WW} height={WH} fill={wall} />
    <rect y={floorY} width={WW} height={WH - floorY} fill={floor} />
    <rect y={floorY - 6} width={WW} height={8} fill={shade(wall, 0.8)} />
    {children}
  </g>
);

export const Window: React.FC<{x: number; y: number; w: number; h: number; mode: 'night' | 'day' | 'dusk' | 'rain' | 'dawn'; t?: number}> = ({x, y, w, h, mode, t = 0}) => {
  const sky = {night: ['#1b2238', '#2d3a5c'], day: ['#9cc3e6', '#d7e8f5'], dusk: ['#f0a77a', '#6b5a8e'], rain: ['#6f7c8c', '#9aa6b3'], dawn: ['#f4c9a0', '#8aa6cf']}[mode];
  const id = `sky${x}${y}${mode}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient>
      </defs>
      <rect x={x - 10} y={y - 10} width={w + 20} height={h + 20} fill="#e8e2d6" rx={4} />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
      {mode === 'night' && <circle cx={x + w * 0.72} cy={y + h * 0.3} r={Math.min(w, h) * 0.11} fill="#f3eccf" />}
      {mode === 'night' && [0, 1, 2, 3].map((i) => <circle key={i} cx={x + w * (0.15 + 0.2 * i)} cy={y + h * (0.2 + 0.15 * (i % 2))} r={1.8} fill="#fff" opacity={0.7} />)}
      {mode === 'rain' && Array.from({length: 14}).map((_, i) => {
        const yy = y + ((random(`r${i}`) * h + t * 300) % h);
        return <line key={i} x1={x + random(`rx${i}`) * w} y1={yy} x2={x + random(`rx${i}`) * w - 3} y2={yy + 14} stroke="#dfe7ef" strokeWidth={2} opacity={0.6} />;
      })}
      <rect x={x + w / 2 - 4} y={y} width={8} height={h} fill="#e8e2d6" />
      <rect x={x} y={y + h / 2 - 4} width={w} height={8} fill="#e8e2d6" />
    </g>
  );
};

export const Table: React.FC<{x: number; y: number; w: number; h?: number; col?: string}> = ({x, y, w, h = 110, col = '#8a6a4f'}) => (
  <g>
    <rect x={x} y={y} width={w} height={12} rx={3} fill={col} />
    <rect x={x + 14} y={y + 12} width={10} height={h} fill={shade(col)} />
    <rect x={x + w - 24} y={y + 12} width={10} height={h} fill={shade(col)} />
  </g>
);

export const Chair: React.FC<{x: number; y: number; face?: 1 | -1; col?: string}> = ({x, y, face = 1, col = '#6b4f3a'}) => (
  <g>
    <rect x={x - 26} y={y - 54} width={52} height={9} rx={3} fill={col} />
    <rect x={x - face * 26 - 4} y={y - 120} width={8} height={120} rx={3} fill={col} />
    <rect x={x + face * 20 - 4} y={y - 54} width={8} height={54} rx={3} fill={shade(col)} />
  </g>
);

export const CeilingLamp: React.FC<{x: number; on?: number; len?: number; col?: string}> = ({x, on = 1, len = 120, col = '#ffe2a8'}) => (
  <g>
    <defs>
      <radialGradient id={`lg${x}`}><stop offset="0" stopColor={col} stopOpacity={0.55 * on} /><stop offset="1" stopColor={col} stopOpacity={0} /></radialGradient>
    </defs>
    <ellipse cx={x} cy={len + 60} rx={300} ry={260} fill={`url(#lg${x})`} />
    <line x1={x} y1={0} x2={x} y2={len} stroke="#2f2b28" strokeWidth={3} />
    <path d={`M ${x - 36} ${len + 28} L ${x - 16} ${len} L ${x + 16} ${len} L ${x + 36} ${len + 28} Z`} fill="#3a3530" />
    <ellipse cx={x} cy={len + 28} rx={22} ry={6} fill={col} opacity={0.4 + 0.6 * on} />
  </g>
);

export const Door: React.FC<{x: number; y: number; w?: number; h?: number; open?: number; col?: string; light?: number; sign?: string}> = ({x, y, w = 120, h = 250, open = 0, col = '#a8835f', light = 0, sign}) => (
  <g>
    <rect x={x - 8} y={y - h - 8} width={w + 16} height={h + 8} fill={shade(col, 0.7)} />
    <rect x={x} y={y - h} width={w} height={h} fill={light > 0 ? '#ffe7b3' : '#1d1b1f'} opacity={light > 0 ? 0.4 + 0.6 * light : 1} />
    <rect x={x} y={y - h} width={w * (1 - open * 0.75)} height={h} fill={col} />
    <circle cx={x + w * (1 - open * 0.75) - 14} cy={y - h / 2} r={5} fill="#3a2f26" />
    {sign && <g><rect x={x + 14} y={y - h + 30} width={w - 28} height={36} rx={4} fill="#f4efe6" /><text x={x + w / 2} y={y - h + 54} fontFamily="Inter" fontWeight={700} fontSize={15} textAnchor="middle" fill={P.ink}>{sign}</text></g>}
  </g>
);

/** Close-up phone held in a hand, with a chat. */
export type Msg = {text: string; me?: boolean; at?: number; typing?: string};
export const Phone: React.FC<{x?: number; y?: number; s?: number; name?: string; msgs: Msg[]; t: number; glow?: number; typed?: string; dark?: boolean; buzz?: number; hand?: boolean; post?: React.ReactNode}> = ({
  x = WW / 2, y = WH / 2 + 20, s = 1, name = 'Mama', msgs, t, glow = 1, typed, buzz = 0, hand = true, post,
}) => {
  const bx = buzz * Math.sin(t * 90) * 4;
  return (
    <g transform={`translate(${x + bx} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={300} ry={330} fill="#7fa8ff" opacity={0.12 * glow} />
      <rect x={-150} y={-280} width={300} height={560} rx={38} fill="#141518" />
      <rect x={-138} y={-266} width={276} height={532} rx={30} fill="#0d0e10" />
      {post ? post : (
        <g>
          <rect x={-138} y={-266} width={276} height={70} rx={30} fill="#1b1c20" />
          <circle cx={-96} cy={-226} r={17} fill="#d9a98a" />
          <text x={-68} y={-220} fill="#f1f1f3" fontFamily="Inter" fontWeight={700} fontSize={20}>{name}</text>
          {(() => {
            let yy = -170;
            return msgs.filter((m) => (m.at ?? -1) <= t).map((m, i) => {
              const lines = wrap(m.text, 20);
              const hgt = 18 + lines.length * 24;
              const p = clamp01((t - (m.at ?? -1)) / 0.18);
              const el = (
                <g key={i} opacity={p} transform={`translate(0 ${(1 - p) * 12})`}>
                  <rect x={m.me ? 120 - widthOf(lines) : -122} y={yy} width={widthOf(lines)} height={hgt} rx={16} fill={m.me ? '#3478f6' : '#2a2b30'} />
                  {lines.map((l, k) => (
                    <text key={k} x={m.me ? 120 - widthOf(lines) + 14 : -108} y={yy + 30 + k * 24} fill="#fff" fontFamily="Inter" fontSize={19}>{l}</text>
                  ))}
                </g>
              );
              yy += hgt + 12;
              return el;
            });
          })()}
          {typed !== undefined && (
            <g>
              <rect x={-124} y={110} width={248} height={70} rx={22} fill="#1f2024" stroke="#3a3b40" />
              {wrap(typed + (Math.floor(t * 2.5) % 2 ? '|' : ' '), 22).slice(-2).map((l, k) => (
                <text key={k} x={-108} y={140 + k * 24} fill="#f1f1f3" fontFamily="Inter" fontSize={19}>{l}</text>
              ))}
            </g>
          )}
        </g>
      )}
      {hand && (
        <g fill={P.skin[0]}>
          <path d="M -150 120 Q -190 160 -170 260 L -110 330 L 60 330 L 160 250 Q 175 190 150 150 L 150 260 L -150 260 Z" opacity={0} />
          <rect x={-176} y={60} width={44} height={120} rx={22} transform="rotate(-12 -150 120)" />
          <path d="M -150 200 Q -170 300 -60 330 L 120 330 Q 170 300 154 200 Z" />
          {[0, 1, 2].map((i) => <rect key={i} x={140} y={-20 + i * 52} width={40} height={36} rx={18} />)}
        </g>
      )}
    </g>
  );
};
const wrap = (s: string, n: number) => {
  const out: string[] = [];
  let cur = '';
  s.split(' ').forEach((w) => {
    if ((cur + ' ' + w).trim().length > n) {
      out.push(cur.trim());
      cur = w;
    } else cur += ' ' + w;
  });
  if (cur.trim()) out.push(cur.trim());
  return out;
};
const widthOf = (lines: string[]) => Math.min(244, 28 + Math.max(...lines.map((l) => l.length)) * 10.5);

/** Small speech bubble in the scene. */
export const Say: React.FC<{x: number; y: number; text: string; p?: number; dark?: boolean; size?: number}> = ({x, y, text, p = 1, dark, size = 18}) => {
  const w = Math.max(60, text.length * size * 0.55 + 30);
  return (
    <g opacity={p} transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * p})`}>
      <rect x={-w / 2} y={-22} width={w} height={40} rx={14} fill={dark ? '#26272b' : '#f7f4ee'} />
      <path d="M -8 18 L -14 30 L 4 18 Z" fill={dark ? '#26272b' : '#f7f4ee'} />
      <text x={0} y={5} textAnchor="middle" fontFamily="Inter" fontSize={size} fill={dark ? '#f1f1f3' : P.ink}>{text}</text>
    </g>
  );
};

/* ---------- frame ---------- */

/** One scene inside the window: slow push-in and a colour wash. */
export const Shot: React.FC<{t: number; dur: number; children: React.ReactNode; zoom?: [number, number]; ox?: number; oy?: number; wash?: string; washOp?: number}> = ({
  t, dur, children, zoom = [1.0, 1.07], ox = WW / 2, oy = WH / 2, wash, washOp = 0.18,
}) => {
  const z = zoom[0] + (zoom[1] - zoom[0]) * clamp01(t / Math.max(0.1, dur));
  return (
    <g>
      <g transform={`translate(${ox} ${oy}) scale(${z}) translate(${-ox} ${-oy})`}>{children}</g>
      {wash && <rect width={WW} height={WH} fill={wash} opacity={washOp} style={{mixBlendMode: 'multiply'}} />}
    </g>
  );
};

/** The black page with the TV-like window and the single-word subtitles. */
export const LessonFrame: React.FC<{d: Data; scene: (t: number) => React.ReactNode}> = ({d, scene}) => {
  const t = useT();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <clipPath id="win"><path d={squircle} /></clipPath>
          <radialGradient id="vig" cx="50%" cy="50%" r="62%">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.75} />
          </radialGradient>
          <filter id="edge" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22" /></filter>
          <filter id="grainL">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 11} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <g transform={`translate(${WX} ${WY})`}>
          <g clipPath="url(#win)">
            {scene(t)}
            <rect width={WW} height={WH} fill="url(#vig)" />
            <path d={squircle} fill="none" stroke="#000" strokeWidth={70} filter="url(#edge)" opacity={0.85} />
            <rect width={WW} height={WH} filter="url(#grainL)" opacity={0.07} style={{mixBlendMode: 'screen'}} />
          </g>
        </g>
      </svg>
      <OneWord d={d} />
    </AbsoluteFill>
  );
};

/** Single word at a time, big serif, centred in the window. */
export const OneWord: React.FC<{d: Data}> = ({d}) => {
  const t = useT();
  const ws = d.words;
  const i = ws.findIndex((w, k) => {
    const nx = ws[k + 1];
    const end = nx && nx.s - w.e < 0.6 ? nx.s - 0.02 : w.e + 0.35;
    return t >= w.s - 0.04 && t < end;
  });
  if (i < 0) return null;
  const w = ws[i];
  const p = clamp01((t - (w.s - 0.04)) / 0.07);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 900 - 50, textAlign: 'center'}}>
      <span style={{
        fontFamily: 'Liberation Serif', fontWeight: 700, fontSize: 84, color: '#f7f4ee', letterSpacing: -0.5,
        textShadow: '0 3px 18px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.7)', opacity: p, display: 'inline-block',
        transform: `scale(${0.96 + 0.04 * p})`,
      }}>{w.w.replace(/[„“"]/g, '')}</span>
    </div>
  );
};

/** Pick the scene for the current phrase; returns [index, local time, duration]. */
export const usePhraseScene = (d: Data, starts: number[]) => {
  const t = useT();
  const times = starts.map((p, i) => (i === 0 ? 0 : Math.max(0, d.phrases[p].s - 0.08)));
  let i = 0;
  times.forEach((s, k) => {
    if (t >= s) i = k;
  });
  const end = i + 1 < times.length ? times[i + 1] : d.duration;
  return {i, lt: t - times[i], dur: end - times[i], t};
};

export {prog};
