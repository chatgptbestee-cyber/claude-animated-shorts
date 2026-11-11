import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {C, Cam, Data, Dust, GlowDefs, H, Pop, prog, sceneTimes, Scenes, Script, Shell, useT, W, wt, dash} from '../common';

/** Corner brackets like a face detector, snapping onto a box. */
export const Brackets: React.FC<{x: number; y: number; w: number; h: number; p: number; label?: string}> = ({x, y, w, h, p, label}) => {
  if (p <= 0) return null;
  const g = 60 * (1 - p);
  const X = x - g, Y = y - g, Wd = w + 2 * g, Hd = h + 2 * g, L = Math.min(Wd, Hd) * 0.22;
  const corner = (cx: number, cy: number, sx: number, sy: number) => `M ${cx} ${cy + sy * L} L ${cx} ${cy} L ${cx + sx * L} ${cy}`;
  return (
    <g opacity={p} filter="url(#glow)">
      <path d={[corner(X, Y, 1, 1), corner(X + Wd, Y, -1, 1), corner(X, Y + Hd, 1, -1), corner(X + Wd, Y + Hd, -1, -1)].join(' ')}
        fill="none" stroke={C.accent} strokeWidth={8} strokeLinecap="round" />
      {label && (
        <text x={X} y={Y - 22} fill={C.accent} fontFamily="JetBrains Mono" fontSize={28} letterSpacing={3}>{label}</text>
      )}
    </g>
  );
};

const Cloud: React.FC<{cx: number; cy: number; s: number; op: number; seed: string}> = ({cx, cy, s, op, seed}) => (
  <g opacity={op} filter="url(#soft)">
    {Array.from({length: 7}).map((_, i) => (
      <circle key={i} cx={cx + (random(`${seed}x${i}`) - 0.5) * 300 * s} cy={cy + (random(`${seed}y${i}`) - 0.5) * 90 * s}
        r={(70 + random(`${seed}r${i}`) * 70) * s} fill="#b9c6d6" />
    ))}
  </g>
);

/** Night sky with drifting clouds; the big one can show a face. */
const Sky: React.FC<{face: number; trace: number; brackets?: number}> = ({face, trace, brackets = 0}) => {
  const t = useT();
  const dx = t * 12;
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <GlowDefs />
      {Array.from({length: 70}).map((_, i) => (
        <circle key={i} cx={random(`sx${i}`) * W} cy={random(`sy${i}`) * 1300} r={1 + random(`sr${i}`) * 2}
          fill={C.ink} opacity={0.2 + 0.5 * random(`so${i}`) * (0.6 + 0.4 * Math.sin(t * 2 + i))} />
      ))}
      <Cloud cx={220 + dx} cy={520} s={0.8} op={0.35} seed="a" />
      <Cloud cx={900 - dx} cy={1180} s={0.7} op={0.3} seed="b" />
      <g transform={`translate(${dx * 0.5}, 0)`}>
        <g opacity={0.75} filter="url(#soft)">
          {[[-170, 0, 190], [60, -60, 220], [250, 20, 170], [-30, 110, 200], [180, 140, 150], [-250, 110, 130]].map(([x, y, r], i) => (
            <circle key={i} cx={540 + x} cy={850 + y} r={r} fill="#c3cfde" />
          ))}
        </g>
        <g opacity={face * 0.8} filter="url(#soft)">
          <ellipse cx={450} cy={800} rx={50} ry={62} fill={C.bg0} />
          <ellipse cx={650} cy={790} rx={48} ry={58} fill={C.bg0} />
          <path d="M 420 960 Q 545 1040 670 950" stroke={C.bg0} strokeWidth={46} fill="none" strokeLinecap="round" />
        </g>
        <g fill="none" stroke={C.accent} strokeWidth={6} strokeLinecap="round" strokeDasharray="1" filter="url(#glow)">
          <ellipse cx={450} cy={800} rx={56} ry={68} pathLength={1} style={{strokeDashoffset: 1 - Math.min(1, trace * 3)}} />
          <ellipse cx={650} cy={790} rx={54} ry={64} pathLength={1} style={{strokeDashoffset: 1 - Math.min(1, Math.max(0, trace * 3 - 1))}} />
          <path d="M 420 960 Q 545 1040 670 950" pathLength={1} style={{strokeDashoffset: 1 - Math.min(1, Math.max(0, trace * 3 - 2))}} />
        </g>
        <Brackets x={360} y={690} w={380} h={380} p={brackets} label="GESICHT" />
      </g>
    </svg>
  );
};

/** Field of random dots; the detector keeps finding "faces" in them. */
const DotField: React.FC<{t: number}> = ({t}) => {
  const pts = Array.from({length: 90}, (_, i) => [90 + random(`fx${i}`) * 900, 470 + random(`fy${i}`) * 780]);
  const hits = [[180, 560], [600, 640], [300, 900], [700, 1000], [430, 760], [160, 1080], [640, 820]];
  const n = Math.floor(t / 0.55);
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <GlowDefs />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5} fill={C.ink} opacity={0.35} />
      ))}
      {hits.slice(0, Math.min(hits.length, n + 1)).map(([x, y], i) => {
        const p = prog(t, i * 0.55, i * 0.55 + 0.25);
        const old = i < n ? 0.35 : 1;
        return (
          <g key={i} opacity={old}>
            <circle cx={x + 50} cy={y + 55} r={9} fill={C.accent} />
            <circle cx={x + 130} cy={y + 55} r={9} fill={C.accent} />
            <path d={`M ${x + 55} ${y + 120} Q ${x + 90} ${y + 140} ${x + 125} ${y + 120}`} stroke={C.accent} strokeWidth={7} fill="none" strokeLinecap="round" />
            <Brackets x={x} y={y} w={180} h={180} p={p} />
          </g>
        );
      })}
    </svg>
  );
};

const Simple: React.FC<{p: number}> = ({p}) => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <GlowDefs />
    <circle cx={450} cy={820} r={34} fill={C.ink} opacity={p} filter="url(#glow)" />
    <circle cx={630} cy={820} r={34} fill={C.ink} opacity={p} filter="url(#glow)" />
    <path d="M 440 1000 L 640 1000" pathLength={1} stroke={C.ink} strokeWidth={18} strokeLinecap="round" style={dash(p * 1.2 - 0.2)} />
    <Brackets x={340} y={690} w={400} h={420} p={prog(p, 0.5, 1)} />
  </svg>
);

const Outlet: React.FC<{p: number}> = ({p}) => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <GlowDefs />
    <g stroke={C.ink} strokeWidth={8} fill="none" filter="url(#glow)">
      <rect x={300} y={600} width={480} height={480} rx={60} pathLength={1} style={dash(p * 1.5)} />
      <circle cx={540} cy={840} r={170} pathLength={1} style={dash(p * 1.5 - 0.2)} />
      <rect x={515} y={668} width={50} height={26} rx={6} opacity={p} />
      <rect x={515} y={986} width={50} height={26} rx={6} opacity={p} />
    </g>
    <circle cx={470} cy={830} r={30} fill={C.ink} opacity={p} />
    <circle cx={610} cy={830} r={30} fill={C.ink} opacity={p} />
    <Brackets x={370} y={680} w={340} h={340} p={prog(p, 0.4, 1)} />
  </svg>
);

const Car: React.FC<{p: number}> = ({p}) => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <GlowDefs />
    <g stroke={C.ink} strokeWidth={8} fill="none" strokeLinejoin="round" filter="url(#glow)">
      <path d="M 250 1040 L 250 900 Q 260 840 320 830 L 400 690 Q 420 660 470 660 L 610 660 Q 660 660 680 690 L 760 830 Q 820 840 830 900 L 830 1040 Z"
        pathLength={1} style={dash(p * 1.4)} />
      <path d="M 410 820 L 460 700 L 620 700 L 670 820 Z" pathLength={1} style={dash(p * 1.4 - 0.2)} opacity={0.6} />
      <rect x={290} y={1040} width={90} height={50} rx={14} opacity={p} />
      <rect x={700} y={1040} width={90} height={50} rx={14} opacity={p} />
    </g>
    <ellipse cx={340} cy={910} rx={52} ry={34} fill={C.accent} opacity={p} filter="url(#glowBig)" />
    <ellipse cx={740} cy={910} rx={52} ry={34} fill={C.accent} opacity={p} filter="url(#glowBig)" />
    <rect x={430} y={950} width={220} height={60} rx={30} fill="none" stroke={C.ink} strokeWidth={8} opacity={p} />
    <Brackets x={260} y={840} w={560} h={210} p={prog(p, 0.4, 1)} />
  </svg>
);

export const V2: React.FC<{d: Data; sc: Script}> = ({d, sc}) => {
  const times = sceneTimes(d, sc);
  const T = useT();
  const P = d.phrases;
  return (
    <Shell d={d} sc={sc} tint="#0e1a2e">
      <Scenes
        times={times}
        render={(i, t, dur) => {
          if (i === 0) return <Cam t={t} dur={dur} from={1.15} to={1.0}><Sky face={0} trace={0} /></Cam>;
          if (i === 1)
            return (
              <Cam t={t} dur={dur} from={1.0} to={1.1}>
                <Sky face={prog(T, P[1].s, wt(d, 'Gesicht'))} trace={prog(T, wt(d, 'Gesicht'), P[1].e + 1.2, (x) => x)} />
              </Cam>
            );
          if (i === 2) return <Cam t={t} dur={dur}><Dust seed="z" n={30} /><Simple p={prog(t, 0.1, 1.2)} /></Cam>;
          if (i === 3) return <Cam t={t} dur={dur} from={1.0} to={1.06}><DotField t={t} /></Cam>;
          if (i === 4) return <Cam t={t} dur={dur}><Sky face={1} trace={1} brackets={prog(t, 0.05, 0.3)} /></Cam>;
          if (i === 5) return <Cam t={t} dur={dur}><Dust seed="o" n={20} /><Outlet p={prog(t, 0, 0.6)} /></Cam>;
          if (i === 6) return <Cam t={t} dur={dur}><Dust seed="c" n={20} /><Car p={prog(t, 0, 0.6)} /></Cam>;
          return (
            <Cam t={t} dur={dur} from={1.0} to={1.15}>
              <Sky face={0.4 + 0.6 * prog(T, wt(d, 'Gesicht', 2), wt(d, 'da', 0, true))} trace={prog(T, wt(d, 'Gesicht', 2), d.duration, (x) => x) * 0.35} />
            </Cam>
          );
        }}
      />
      <Pop text="kein Zufall." s={wt(d, 'kein')} e={P[2].e + 0.3} accent />
      <Pop text="Gesichter" s={wt(d, 'Gesichter')} e={P[4].e + 0.2} />
      <Pop text="Wolken" s={P[5].s - 0.05} e={P[6].s - 0.15} size={120} />
      <Pop text="Steckdosen" s={P[6].s - 0.05} e={P[7].s - 0.15} size={120} />
      <Pop text="Autos" s={P[7].s - 0.05} e={P[8].s - 0.2} size={120} />
    </Shell>
  );
};
