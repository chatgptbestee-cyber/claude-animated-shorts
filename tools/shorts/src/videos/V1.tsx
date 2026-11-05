import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {C, Cam, Data, Dust, GlowDefs, H, Pop, prog, sceneTimes, Scenes, Script, Shell, useT, W, wt, clamp01, dash, lerp} from '../common';

/** Notebook page whose lines get written, then half of them evaporate. */
const Notebook: React.FC<{write: number; fade: number; check?: number; dark?: number}> = ({write, fade, check = 0, dark = 0}) => {
  const t = useT();
  const rows = 11;
  const order = Array.from({length: rows}, (_, i) => i).sort((a, b) => random(`o${a}`) - random(`o${b}`));
  const fading = new Set(order.slice(0, 6));
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <GlowDefs />
      <ellipse cx={540} cy={880} rx={520} ry={600} fill={C.cool} opacity={0.05 * (1 - dark)} filter="url(#soft)" />
      <rect x={210} y={470} width={660} height={820} rx={20} fill="rgba(255,255,255,0.035)" stroke={C.dim} strokeWidth={3} />
      <line x1={300} y1={470} x2={300} y2={1290} stroke={C.accentSoft} strokeWidth={2} />
      {Array.from({length: rows}).map((_, i) => {
        const y = 560 + i * 64;
        const words = 3 + Math.floor(random(`n${i}`) * 4);
        const fadeRank = order.indexOf(i);
        const gone = fading.has(i) ? clamp01(fade * 6 - fadeRank) : 0;
        const appear = clamp01(write * rows - i);
        let x = 330;
        return (
          <g key={i} opacity={(1 - 0.92 * gone) * (1 - 0.4 * dark)} transform={`translate(${gone * 30 * (random(`dx${i}`) - 0.5)}, ${-gone * 40})`}>
            <line x1={240} y1={y + 18} x2={840} y2={y + 18} stroke={C.faint} strokeWidth={2} />
            {Array.from({length: words}).map((__, k) => {
              const w = 40 + random(`w${i}${k}`) * 90;
              const x0 = x;
              x += w + 18;
              if (x0 > 800) return null;
              const vis = clamp01(appear * words - k);
              return <rect key={k} x={x0} y={y} width={Math.min(w, 820 - x0) * vis} height={14} rx={7} fill={C.ink} opacity={0.8} />;
            })}
            {gone > 0 &&
              Array.from({length: 10}).map((__, k) => (
                <circle key={k} cx={340 + random(`px${i}${k}`) * 440} cy={y - gone * (40 + random(`py${i}${k}`) * 160)} r={2.5}
                  fill={C.ink} opacity={0.6 * (1 - gone) * Math.min(1, gone * 4)} />
              ))}
          </g>
        );
      })}
      <path d="M 640 1180 l 40 40 l 90 -110" pathLength={1} fill="none" stroke={C.accent} strokeWidth={14} strokeLinecap="round"
        strokeLinejoin="round" filter="url(#glow)" style={dash(check)} opacity={check > 0 ? 1 : 0} />
      <circle cx={540 + Math.sin(t) * 6} cy={400} r={0} />
    </svg>
  );
};

/** Forgetting curve with repetitions that make it flatter. */
const Curve: React.FC<{p: number; reps: number[]}> = ({p, reps}) => {
  const x0 = 170, y0 = 1180, w = 760, h = 520;
  const ks = [3.4, 1.5, 0.6];
  const val = (x: number) => {
    let last = 0, k = ks[0];
    reps.forEach((r, i) => {
      if (x >= r) {
        last = r;
        k = ks[i + 1];
      }
    });
    return Math.exp(-k * (x - last));
  };
  const pts = (fn: (x: number) => number, upto: number) =>
    Array.from({length: 161}, (_, i) => i / 160).filter((x) => x <= upto).map((x) => `${x0 + x * w},${y0 - fn(x) * h}`).join(' ');
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <GlowDefs />
      <line x1={x0} y1={y0} x2={x0 + w} y2={y0} stroke={C.dim} strokeWidth={3} />
      <line x1={x0} y1={y0} x2={x0} y2={y0 - h - 40} stroke={C.dim} strokeWidth={3} />
      <text x={x0 - 14} y={y0 - h + 8} fill={C.dim} fontFamily="JetBrains Mono" fontSize={26} textAnchor="end">100%</text>
      <text x={x0 + w} y={y0 + 50} fill={C.dim} fontFamily="JetBrains Mono" fontSize={26} textAnchor="end">ZEIT →</text>
      <polyline points={pts((x) => Math.exp(-ks[0] * x), Math.min(1, p * 1.6))} fill="none" stroke={C.dim} strokeWidth={4} strokeDasharray="10 12" />
      <polyline points={pts(val, p)} fill="none" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" filter="url(#glow)" />
      {reps.map((r, i) => {
        const on = prog(p, r, r + 0.05);
        return (
          <g key={i} opacity={on}>
            <line x1={x0 + r * w} y1={y0} x2={x0 + r * w} y2={y0 - h} stroke={C.accentSoft} strokeWidth={3} strokeDasharray="6 10" />
            <circle cx={x0 + r * w} cy={y0 - h} r={14 + 10 * (1 - on)} fill={C.accent} filter="url(#glow)" />
            <text x={x0 + r * w} y={y0 - h - 34} fill={C.accent} fontFamily="Inter" fontWeight={800} fontSize={30} textAnchor="middle">
              WDH. {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const V1: React.FC<{d: Data; sc: Script}> = ({d, sc}) => {
  const times = sceneTimes(d, sc);
  const T = useT();
  const P = d.phrases;
  return (
    <Shell d={d} sc={sc}>
      <Scenes
        times={times}
        render={(i, t, dur) => {
          const abs = T;
          if (i === 0)
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.08}>
                <Dust seed="a" />
                <Notebook write={prog(abs, 0, 1.6)} fade={prog(abs, wt(d, 'Hälfte'), P[0].e + 0.6, (x) => x)} />
              </Cam>
            );
          if (i === 1)
            return (
              <Cam t={t} dur={dur} from={1.12} to={1.2} oy={55}>
                <Notebook write={1} fade={1} check={prog(abs, wt(d, 'merkst'), wt(d, 'nicht', 0, true))} dark={0.5} />
              </Cam>
            );
          if (i === 2)
            return (
              <Cam t={t} dur={dur}>
                <AbsoluteFill style={{background: `radial-gradient(60% 40% at 50% 45%, rgba(255,181,71,0.16), transparent 70%)`}} />
              </Cam>
            );
          if (i === 3)
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.05}>
                <Dust seed="c" n={25} />
                <Curve p={lerp(0.02, 1, prog(abs, P[3].s - 0.1, P[3].e + 0.2, (x) => x))} reps={[0.3, 0.6]} />
              </Cam>
            );
          return (
            <Cam t={t} dur={dur} from={1.0} to={1.08}>
              <Dust seed="a" />
              <Notebook write={1} fade={prog(abs, wt(d, 'während'), d.duration - 0.2, (x) => x)} />
            </Cam>
          );
        }}
      />
      <Pop text="1 Stunde" s={wt(d, 'Stunde')} e={wt(d, 'Hälfte') - 0.05} />
      <Pop text="die Hälfte" s={wt(d, 'Hälfte')} e={P[0].e + 0.6} accent />
      <Pop text="Der Trick" s={P[2].s - 0.08} e={P[2].e + 0.15} y={780} size={170} />
      <Pop text="Wiederholen" s={wt(d, 'Wiederhole')} e={P[3].e + 0.2} accent />
      <Pop text="weg." s={wt(d, 'weg', 1)} e={d.duration + 1} accent size={170} />
    </Shell>
  );
};
