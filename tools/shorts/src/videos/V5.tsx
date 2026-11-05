import React from 'react';
import {random} from 'remotion';
import {C, Cam, clamp01, Data, Dust, GlowDefs, H, lerp, Pop, prog, sceneTimes, Scenes, Script, Shell, useT, W, wt, dash} from '../common';

const ink = {fill: 'none', stroke: C.ink, strokeWidth: 6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};

/** Dream fragments: small glowing symbols. */
const Frag: React.FC<{k: number; x: number; y: number; s?: number; op: number}> = ({k, x, y, s = 1, op}) => {
  const col = k % 2 ? C.cool : C.accent;
  const st = {...ink, stroke: col, strokeWidth: 6 / s};
  const shapes = [
    <path {...st} d="M 20 -34 A 36 36 0 1 0 20 34 A 28 28 0 1 1 20 -34 Z" />,
    <path {...st} d="M -30 30 h 20 v -20 h 20 v -20 h 20 v -20" />,
    <g {...st}><rect x={-24} y={-40} width={48} height={80} rx={4} /><circle cx={12} cy={2} r={4} fill={col} /></g>,
    <path {...st} d="M -36 0 Q -6 -30 24 0 Q -6 30 -36 0 Z M 24 0 L 42 -16 L 42 16 Z" />,
    <g {...st}><circle cx={-18} cy={0} r={16} /><path d="M -2 0 H 40 M 28 0 v 14 M 38 0 v 10" /></g>,
    <path {...st} d="M 0 -36 L 10 -10 L 36 -10 L 15 6 L 23 32 L 0 16 L -23 32 L -15 6 L -36 -10 L -10 -10 Z" />,
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op} filter="url(#glow)">
      {shapes[k % shapes.length]}
    </g>
  );
};

const FR = [[300, 560], [520, 480], [760, 560], [380, 720], [640, 700], [860, 760]];

/** Bedroom line drawing: window with dawn, bed, nightstand, lamp, notebook. */
const Room: React.FC<{dawn: number; lamp?: number; dark?: number; frags?: (k: number) => {op: number; dx?: number; dy?: number; s?: number}}> = ({
  dawn, lamp = 0, dark = 0, frags,
}) => {
  const t = useT();
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <GlowDefs />
      <defs>
        <linearGradient id="dawn" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffb547" stopOpacity={0.55 * dawn} />
          <stop offset="1" stopColor="#7fb2ff" stopOpacity={0.25 * dawn} />
        </linearGradient>
      </defs>
      <g opacity={1 - 0.6 * dark}>
        <rect x={640} y={420} width={300} height={360} rx={8} fill="url(#dawn)" />
        <path {...ink} d="M 640 420 h 300 v 360 h -300 Z M 790 420 v 360 M 640 600 h 300" />
        <polygon points="640,780 940,780 1000,1300 560,1300" fill={C.accent} opacity={0.05 * dawn} />
        <path {...ink} d="M 110 1240 V 860 Q 110 830 140 830 H 200 Q 230 830 230 860 V 1000" />
        <path {...ink} d="M 110 1010 H 760 V 1160 H 110 M 130 1160 V 1240 M 740 1160 V 1240" />
        <path {...ink} d="M 150 1010 Q 150 950 210 950 H 300 Q 340 950 340 1010" />
        <path {...ink} d="M 360 1010 Q 420 960 520 975 T 760 990" opacity={0.7} />
        <path {...ink} d="M 800 1240 V 1080 H 980 V 1240 M 800 1150 H 980" />
        <path {...ink} d="M 930 1080 V 990 M 895 990 H 965 L 945 940 H 915 Z" />
        <polygon points="905,995 955,995 1040,1080 820,1080" fill={C.accent} opacity={0.22 * lamp} filter="url(#soft)" />
        <circle cx={930} cy={965} r={22} fill={C.accent} opacity={lamp} filter="url(#glowBig)" />
        <rect x={830} y={1062} width={80} height={16} rx={3} fill={lamp > 0.5 ? C.accent : C.dim} />
      </g>
      {frags &&
        FR.map(([x, y], k) => {
          const f = frags(k);
          return <Frag key={k} k={k} x={x + (f.dx ?? 0) + Math.sin(t * 0.9 + k) * 14} y={y + (f.dy ?? 0) + Math.cos(t * 0.7 + k) * 12} s={f.s ?? 1} op={f.op} />;
        })}
    </svg>
  );
};

/** Close-up notebook: pen lines get written, fragments fly into it. */
const Page: React.FC<{write: number; fly: number; fade?: number}> = ({write, fly, fade = 0}) => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <GlowDefs />
    <rect x={180} y={520} width={720} height={720} rx={20} fill="rgba(255,255,255,0.04)" stroke={C.dim} strokeWidth={4} />
    {Array.from({length: 7}).map((_, i) => (
      <g key={i}>
        <line x1={230} y1={640 + i * 80} x2={850} y2={640 + i * 80} stroke={C.faint} strokeWidth={2} />
        <path d={`M 240 ${628 + i * 80} q 40 -24 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 70 0`} pathLength={1} fill="none" stroke={C.accent}
          strokeWidth={6} strokeLinecap="round" style={dash(clamp01(write * 7 - i) * (1 - (fade > 0 ? clamp01(fade * 7 - (6 - i)) : 0)))}
          opacity={0.9} filter="url(#glow)" />
      </g>
    ))}
    {FR.map(([x, y], k) => {
      const p = clamp01(fly * 6 - k);
      if (p >= 1) return null;
      const tx = 300 + (k % 3) * 220, ty = 660 + Math.floor(k / 3) * 160;
      return <Frag key={k} k={k} x={lerp(x, tx, p)} y={lerp(y - 160, ty, p)} s={lerp(1, 0.3, p)} op={1 - p * 0.6} />;
    })}
  </svg>
);

const clock = (m: number) => (m < 60 ? `06:${m}` : `07:0${m - 60}`);

export const V5: React.FC<{d: Data; sc: Script}> = ({d, sc}) => {
  const times = sceneTimes(d, sc);
  const T = useT();
  const P = d.phrases;
  return (
    <Shell d={d} sc={sc} tint="#101a2c">
      <Scenes
        times={times}
        render={(i, t, dur) => {
          if (i === 0)
            return <Cam t={t} dur={dur} from={1.12} to={1.0}><Room dawn={prog(T, 0, 1.3)} /></Cam>;
          if (i === 1)
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.08}>
                <Room dawn={1} frags={(k) => ({op: prog(T, P[1].s + k * 0.22, P[1].s + k * 0.22 + 0.4)})} />
              </Cam>
            );
          if (i === 2) {
            const g = prog(T, wt(d, 'meist'), P[2].e + 0.2, (x) => x);
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.06}>
                <Room dawn={1} frags={(k) => ({op: 1 - clamp01(g * 6 - k), dy: -40 * clamp01(g * 6 - k)})} />
              </Cam>
            );
          }
          if (i === 3) {
            const fall = prog(T, P[3].s, P[3].e, (x) => x);
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.05}>
                <Dust seed="n" n={20} />
                <svg width={W} height={H} style={{position: 'absolute'}}>
                  <GlowDefs />
                  <g opacity={0.6}>
                    {Array.from({length: 9}).map((_, k) => (
                      <line key={k} x1={140 + k * 100} y1={880} x2={140 + k * 100} y2={1000} stroke={C.dim} strokeWidth={4} />
                    ))}
                    <line x1={120} y1={880} x2={960} y2={880} stroke={C.dim} strokeWidth={4} />
                    <line x1={120} y1={1000} x2={960} y2={1000} stroke={C.dim} strokeWidth={4} />
                  </g>
                  {FR.map(([x], k) => {
                    const p = clamp01(fall * 1.6 - k * 0.12);
                    const y = lerp(520, 1250, p);
                    return (
                      <g key={k}>
                        <Frag k={k} x={x} y={y} op={p < 0.55 ? 0.6 : (1 - p) * 1.3} />
                        {p > 0.55 && Array.from({length: 8}).map((__, j) => (
                          <circle key={j} cx={x + (random(`p${k}${j}`) - 0.5) * 120 * p} cy={y + random(`q${k}${j}`) * 80} r={3}
                            fill={k % 2 ? C.cool : C.accent} opacity={1 - p} />
                        ))}
                      </g>
                    );
                  })}
                </svg>
              </Cam>
            );
          }
          if (i === 4) return <Cam t={t} dur={dur} from={1.0} to={1.12} ox={86} oy={55}><Room dawn={0.6} lamp={prog(t, 0.05, 0.4)} /></Cam>;
          if (i === 5)
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.06}>
                <Dust seed="w" n={20} />
                <Page write={prog(T, wt(d, 'schreib'), P[5].e + 0.3, (x) => x)} fly={prog(T, wt(d, 'geträumt'), wt(d, 'schreib') + 0.8, (x) => x)} />
              </Cam>
            );
          const out = prog(T, P[6].s, wt(d, 'weg', 1) + 0.6, (x) => x);
          return (
            <Cam t={t} dur={dur} from={1.06} to={1.12}>
              <Room dawn={lerp(1, 0, prog(T, d.duration - 1.2, d.duration))} lamp={1 - out} dark={0.3 * out} />
            </Cam>
          );
        }}
      />
      <Pop text={clock(Math.floor(lerp(57, 63.99, prog(T, P[2].s, P[2].e + 0.3, (x) => x))))} s={P[2].s - 0.05} e={P[2].e + 0.3} size={160} />
      <Pop text="nicht fest" s={wt(d, 'fest')} e={P[3].e + 0.2} accent />
      <Pop text="sofort auf." s={wt(d, 'sofort', 1)} e={P[5].e + 0.3} accent />
      <Pop text="weg." s={wt(d, 'weg', 1)} e={wt(d, 'bevor') + 0.8} accent size={170} />
    </Shell>
  );
};
