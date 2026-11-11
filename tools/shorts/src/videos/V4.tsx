import React from 'react';
import {C, Cam, clamp01, Data, Dust, GlowDefs, H, lerp, Pop, prog, sceneTimes, Scenes, Script, Shell, useT, W, wt, dash} from '../common';

type Mem = {draw?: number; v?: number; blurHouse?: number; balloon?: number; x?: number; y?: number; s?: number; label?: string; op?: number; marks?: number[]};

/** A remembered picture: hills, house, tree, sun. v morphs it (0 = original). */
const Memory: React.FC<Mem> = ({draw = 1, v = 0, blurHouse = 0, balloon = 0, x = 540, y = 860, s = 1, label, op = 1, marks = []}) => {
  const ink = {fill: 'none', stroke: C.ink, strokeWidth: 6 / s, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const d = (k: number) => dash(draw * 1.6 - k * 0.15);
  const treeX = lerp(150, 110, v), sunR = lerp(42, 60, v), sunX = lerp(160, 140, v), roof = lerp(-70, -100, v);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <rect x={-290} y={-360} width={580} height={700} rx={16} fill="#121925" stroke={C.dim} strokeWidth={4 / s} />
      <rect x={-250} y={-320} width={500} height={500} rx={6} fill="rgba(127,178,255,0.05)" />
      <g>
        <path {...ink} pathLength={1} style={d(0)} d="M -250 80 Q -120 0 0 60 T 250 40" />
        <circle {...ink} cx={-sunX} cy={-200} r={sunR} stroke={C.accent} pathLength={1} style={d(1)} />
        <g style={{filter: blurHouse > 0 ? `blur(${blurHouse * 9}px)` : undefined}}>
          <path {...ink} pathLength={1} style={d(2)} d={`M -40 70 L -40 -40 L 80 -40 L 80 70 M -60 -40 L 20 ${roof} L 100 -40`} />
          <rect {...ink} x={0} y={0} width={34} height={70} pathLength={1} style={d(3)} />
          <rect {...ink} x={-28} y={-24} width={26} height={26} pathLength={1} style={d(3)} />
        </g>
        <path {...ink} pathLength={1} style={d(4)} d={`M ${treeX} 70 L ${treeX} -10`} />
        <circle {...ink} cx={treeX} cy={-50} r={48} pathLength={1} style={d(4)} />
        {balloon > 0 && (
          <g filter="url(#glow)">
            <ellipse cx={-150} cy={-150} rx={34} ry={42} fill="none" stroke={C.accent} strokeWidth={6 / s} pathLength={1} style={dash(balloon * 1.4)} />
            <path d="M -150 -108 q 10 30 -6 60" fill="none" stroke={C.accent} strokeWidth={4 / s} pathLength={1} style={dash(balloon * 1.4 - 0.4)} />
          </g>
        )}
      </g>
      {marks.map((m, k) => {
        const pos = [[20, 10, 110], [-150, -150, 70], [treeX, -40, 80]][k];
        return m > 0 ? <circle key={k} cx={pos[0]} cy={pos[1]} r={pos[2] * (1.4 - 0.4 * m)} fill="none" stroke={C.accent} strokeWidth={6 / s}
          strokeDasharray="14 10" opacity={m} filter="url(#glow)" /> : null;
      })}
      {label && <text x={0} y={290} fill={C.ink} fontFamily="JetBrains Mono" fontSize={44} letterSpacing={6} textAnchor="middle">{label}</text>}
    </g>
  );
};

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <GlowDefs />
    {children}
  </svg>
);

export const V4: React.FC<{d: Data; sc: Script}> = ({d, sc}) => {
  const times = sceneTimes(d, sc);
  const T = useT();
  const P = d.phrases;
  return (
    <Shell d={d} sc={sc} tint="#13202a">
      <Scenes
        times={times}
        render={(i, t, dur) => {
          if (i === 0) {
            const scan = prog(T, wt(d, 'speicherst'), P[0].e + 0.3, (x) => x);
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.06}>
                <Dust seed="m" />
                <Svg>
                  <Memory draw={prog(T, 0, 2.2, (x) => x)} />
                  {scan > 0 && scan < 1 && (
                    <rect x={250} y={500 + scan * 700} width={580} height={8} fill={C.accent} filter="url(#glowBig)" />
                  )}
                  {scan >= 1 && <Memory x={560} y={880} op={0.35} />}
                </Svg>
              </Cam>
            );
          }
          if (i === 1) {
            const v = prog(T, wt(d, 'Erinnerung'), P[1].e + 0.2);
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.08}>
                <Svg>
                  <Memory v={v} x={540 + Math.sin(T * 30) * 4 * (v > 0 && v < 1 ? 1 : 0)} />
                </Svg>
              </Cam>
            );
          }
          if (i === 2)
            return (
              <Cam t={t} dur={dur} from={1.15} to={1.3} oy={44}>
                <Svg>
                  <Memory v={1} blurHouse={prog(T, wt(d, 'unscharf'), wt(d, 'unscharf') + 0.5)} marks={[prog(T, wt(d, 'Detail'), wt(d, 'Detail') + 0.3)]} />
                </Svg>
              </Cam>
            );
          if (i === 3)
            return (
              <Cam t={t} dur={dur} from={1.15} to={1.25} oy={40}>
                <Svg>
                  <Memory v={1} blurHouse={1} balloon={prog(T, wt(d, 'anderes'), P[3].e)} marks={[0, prog(T, wt(d, 'dazu'), wt(d, 'dazu') + 0.3)]} />
                </Svg>
              </Cam>
            );
          if (i === 4) {
            const m = (w: string) => prog(T, wt(d, w), wt(d, w) + 0.3);
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.05}>
                <Dust seed="m2" n={25} />
                <Svg>
                  <Memory x={295} y={900} s={0.78} label="GESTERN" draw={1} />
                  <Memory x={785} y={900} s={0.78} label="HEUTE" v={1} blurHouse={1} balloon={1} marks={[m('gerade'), m('mehr'), m('gestern')]} />
                </Svg>
              </Cam>
            );
          }
          const shown = ['jedes', 'abrufst', 'verändert', 'wieder'].map((w) => prog(T, wt(d, w, w === 'jedes' ? 1 : 0), wt(d, w, w === 'jedes' ? 1 : 0) + 0.25));
          const out = prog(T, d.duration - 0.45, d.duration);
          return (
            <Cam t={t} dur={dur} from={1.0} to={1.08}>
              <Svg>
                {shown.map((p, k) => (
                  <Memory key={k} x={540 + (k - 1.5) * 34 * p} y={860 - (k - 1.5) * 40 * p} s={0.92} v={clamp01((k + 1) / 4)}
                    blurHouse={k / 4} balloon={k >= 2 ? 1 : 0} op={p * (0.45 + 0.15 * k) * (1 - out)} />
                ))}
              </Svg>
            </Cam>
          );
        }}
      />
      <Pop text="neu." s={wt(d, 'neu')} e={P[0].e + 0.6} accent />
      <Pop text="verändern" s={wt(d, 'verändern')} e={P[1].e + 0.3} />
      <Pop text="unscharf" s={wt(d, 'unscharf')} e={P[2].e + 0.15} />
      <Pop text="+ dazu" s={wt(d, 'dazu')} e={P[3].e + 0.3} accent />
      <Pop text="nicht dieselbe" s={wt(d, 'dieselbe')} e={P[4].e + 0.4} size={120} accent />
      <Pop text="wieder." s={wt(d, 'wieder')} e={d.duration + 1} accent />
    </Shell>
  );
};
