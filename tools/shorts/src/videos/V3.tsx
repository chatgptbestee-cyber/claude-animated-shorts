import React from 'react';
import {C, Cam, clamp01, Data, Dust, GlowDefs, H, lerp, Pop, prog, sceneTimes, Scenes, Script, Shell, useT, W, wt} from '../common';

const DAYS = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];
const CX = (i: number) => 144 + i * 132;
const CY = (i: number) => 880 + Math.abs(i - 3) ** 1.6 * 16;

const Icon: React.FC<{i: number; x: number; y: number}> = ({i, x, y}) => {
  const s = {fill: 'none', stroke: C.ink, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (i) {
    case 0: return <path {...s} d={`M ${x - 34} ${y + 6} L ${x + 34} ${y - 14} M ${x - 8} ${y - 2} L ${x + 6} ${y + 22} M ${x - 2} ${y - 4} L ${x - 14} ${y - 26}`} />;
    case 1: return <text x={x} y={y + 22} fill={C.dim} fontFamily="Inter" fontWeight={800} fontSize={64} textAnchor="middle">?</text>;
    case 2: case 5: return <path {...s} d={`M ${x - 40} ${y} q 10 -16 20 0 t 20 0 t 20 0 t 20 0 M ${x - 40} ${y + 18} q 10 -16 20 0 t 20 0 t 20 0 t 20 0`} />;
    case 3: return (
      <g {...s} stroke={C.accent}>
        <circle cx={x} cy={y} r={18} />
        {Array.from({length: 8}).map((_, k) => {
          const a = (k / 8) * Math.PI * 2;
          return <line key={k} x1={x + Math.cos(a) * 26} y1={y + Math.sin(a) * 26} x2={x + Math.cos(a) * 36} y2={y + Math.sin(a) * 36} />;
        })}
      </g>
    );
    case 4: return <path {...s} d={`M ${x} ${y + 34} Q ${x + 4} ${y} ${x} ${y - 20} M ${x} ${y - 20} q -24 -6 -36 8 M ${x} ${y - 20} q 24 -6 36 8 M ${x} ${y - 20} q -10 -18 -26 -22 M ${x} ${y - 20} q 10 -18 26 -22`} />;
    default: return <g {...s}><rect x={x - 30} y={y - 16} width={60} height={42} rx={8} /><path d={`M ${x - 12} ${y - 16} v -10 h 24 v 10`} /></g>;
  }
};

type CardState = {in: number; hi: number; dim: number; blur: number; lift: number};

const Cards: React.FC<{st: (i: number) => CardState; graph?: number}> = ({st, graph = 0}) => {
  const t = useT();
  const heights = [0.35, 0.15, 0.4, 1, 0.45, 0.3, 0.6];
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <GlowDefs />
      {graph > 0 && (
        <g>
          <polyline points={heights.slice(0, 7).map((h, i) => `${CX(i)},${560 - h * 140}`).join(' ')} fill="none" stroke={C.ink} strokeWidth={6}
            strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - graph} filter="url(#glow)" />
          <circle cx={CX(3)} cy={560 - 140} r={16 + 6 * Math.sin(t * 6)} fill={C.accent} opacity={clamp01(graph * 2 - 1)} filter="url(#glowBig)" />
        </g>
      )}
      {DAYS.map((_, i) => i).sort((a, b) => st(a).hi + st(a).lift * 2 - (st(b).hi + st(b).lift * 2)).map((i) => {
        const day = DAYS[i];
        const s = st(i);
        const x = CX(i), y = CY(i) - s.lift * 220 + (1 - s.in) * 260;
        const sc = 1.4 + 0.2 * s.hi + 0.1 * s.lift;
        const rot = (i - 3) * 5 * (1 - s.lift);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={s.in * (1 - 0.8 * s.dim)}
            style={{filter: s.blur > 0 ? `blur(${s.blur}px)` : undefined}}>
            {s.hi > 0 && <rect x={-70} y={-95} width={140} height={190} rx={14} fill={C.accent} opacity={0.35 * s.hi} filter="url(#glowBig)" />}
            <rect x={-62} y={-88} width={124} height={176} rx={12} fill="#141b27" stroke={s.hi > 0.5 ? C.accent : C.dim} strokeWidth={4} />
            <rect x={-50} y={-76} width={100} height={110} rx={6} fill="rgba(255,255,255,0.05)" />
            <Icon i={i} x={0} y={-22} />
            <text x={0} y={70} fill={s.hi > 0.5 ? C.accent : C.ink} fontFamily="JetBrains Mono" fontWeight={700} fontSize={28} textAnchor="middle">{day}</text>
          </g>
        );
      })}
    </svg>
  );
};

const base = (o: Partial<CardState> = {}): CardState => ({in: 1, hi: 0, dim: 0, blur: 0, lift: 0, ...o});

export const V3: React.FC<{d: Data; sc: Script}> = ({d, sc}) => {
  const times = sceneTimes(d, sc);
  const T = useT();
  const P = d.phrases;
  return (
    <Shell d={d} sc={sc} tint="#1a1622">
      <Scenes
        times={times}
        render={(i, t, dur) => {
          if (i === 0)
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.06}>
                <Dust seed="u" />
                <Cards st={(k) => base({in: prog(T, k * 0.12, k * 0.12 + 0.5)})} />
              </Cam>
            );
          if (i === 1) {
            const z = prog(t, 0, 0.6);
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.6} ox={(CX(1) / W) * 100} oy={(CY(1) / H) * 100}>
                <Cards st={(k) => base(k === 1 ? {hi: 0} : {dim: 0.6 * z})} />
              </Cam>
            );
          }
          if (i === 2) {
            const a = prog(T, wt(d, 'Anfang'), wt(d, 'Anfang') + 0.3);
            const e = prog(T, wt(d, 'Ende'), wt(d, 'Ende') + 0.3);
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.05}>
                <Dust seed="u2" />
                <Cards st={(k) => base(k === 0 ? {hi: a} : k === 6 ? {hi: e} : {dim: 0.55 * a})} />
              </Cam>
            );
          }
          if (i === 3) {
            const g = prog(t, 0.05, 1.0, (x) => x);
            const peak = prog(T, wt(d, 'stärksten'), wt(d, 'stärksten') + 0.4);
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.06}>
                <Cards graph={g} st={(k) => base(k === 3 ? {hi: peak, lift: peak} : k === 0 || k === 6 ? {hi: 1, dim: 0.2} : {dim: 0.55})} />
              </Cam>
            );
          }
          if (i === 4) {
            const b = prog(t, 0.1, dur, (x) => x);
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.08}>
                <Cards st={(k) => ([0, 3, 6].includes(k) ? base({hi: 1}) : base({blur: 14 * b, dim: 0.5 + 0.4 * b}))} />
              </Cam>
            );
          }
          const end = prog(T, wt(d, 'Anfang', 1), wt(d, 'Anfang', 1) + 0.4);
          const fadeAll = prog(T, d.duration - 0.35, d.duration);
          return (
            <Cam t={t} dur={dur} from={1.0} to={1.08}>
              <Dust seed="u" />
              <Cards st={(k) => base(k === 0 ? {hi: end, dim: 0.9 * fadeAll} : {dim: lerp(0, 0.85, end) + 0.15 * fadeAll})} />
            </Cam>
          );
        }}
      />
      <Pop text="Urlaub?" s={wt(d, 'Urlaub')} e={P[0].e + 0.5} />
      <Pop text="Dienstag?" s={wt(d, 'Dienstag')} e={P[1].e + 0.3} accent />
      <Pop text="Anfang" s={wt(d, 'Anfang')} e={wt(d, 'Ende') - 0.1} accent />
      <Pop text="+ Ende" s={wt(d, 'Ende')} e={P[3].e + 0.5} accent />
      <Pop text="stärkster Moment" s={wt(d, 'stärksten')} e={P[4].e + 0.5} size={110} />
      <Pop text="verschwimmt." s={wt(d, 'verschwimmt')} e={P[5].e + 0.4} size={120} />
      <Pop text="Anfang." s={wt(d, 'Anfang', 1)} e={d.duration + 1} accent />
    </Shell>
  );
};
