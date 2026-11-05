import React from 'react';
import {Data, lerp, prog, Script, useT, wt} from '../common';
import {Bubble, Cam2, Fig, Figure, G, hand, Headers, Heart, keyed, Series, Stage} from '../stage';

const WATER = 1160;

const Waves: React.FC<{x0: number; amp: number; t: number}> = ({x0, amp, t}) => (
  <g fill="none" stroke="#5f8fc9" strokeLinecap="round">
    {[0, 1, 2].map((k) => {
      const pts = Array.from({length: 28}, (_, i) => {
        const x = x0 + i * 20;
        return `${x},${WATER + k * 34 + amp * Math.sin(x / 55 + t * 2.2 + k)}`;
      }).join(' ');
      return <polyline key={k} points={pts} strokeWidth={5 - k} opacity={0.75 - k * 0.2} />;
    })}
  </g>
);

const Hull: React.FC<{cx: number}> = ({cx}) => (
  <path d={`M ${cx - 170} ${WATER - 70} L ${cx + 170} ${WATER - 70} Q ${cx + 150} ${WATER + 6} ${cx + 90} ${WATER + 14} L ${cx - 90} ${WATER + 14} Q ${cx - 150} ${WATER + 6} ${cx - 170} ${WATER - 70} Z`}
    fill="#23262c" stroke={G.white} strokeWidth={6} strokeLinejoin="round" />
);

/** Rower: arm swings, oar reaches into the water. */
const rower = (x: number, face: 1 | -1, her: boolean, phase: number, amp: number): [Fig, number] => {
  const sw = Math.sin(phase);
  const f: Fig = {x, y: WATER + 40, face, her, aL: -14, aR: face * (70 + 28 * sw * amp), lean: face * 6 * sw * amp};
  return [f, sw];
};

const Oar: React.FC<{f: Fig; sw: number; amp: number}> = ({f, sw, amp}) => {
  const h = hand(f, 'R');
  const bx = h.x - (f.face ?? 1) * (90 + 60 * sw * amp), by = WATER + 30;
  return (
    <g>
      <line x1={h.x} y1={h.y} x2={bx} y2={by} stroke="#c99a62" strokeWidth={8} strokeLinecap="round" />
      <ellipse cx={bx} cy={by} rx={26} ry={10} fill="#c99a62" transform={`rotate(${(f.face ?? 1) * 30} ${bx} ${by})`} />
    </g>
  );
};

export const V9: React.FC<{d: Data; sc: Script}> = ({d}) => {
  const T0 = useT();
  const T = T0 > d.duration - 0.3 ? 0 : T0;
  const P = d.phrases;
  const at = (i: number) => P[i].s - 0.15;
  const focus = keyed(T, [[0, 0], [at(2), -1], [at(6), 1], [at(8), 0], [at(9), -0.7], [at(10), 0.7], [at(11), 0]], 0.6);
  const zoom = keyed(T, [[0, 0], [at(2), 1], [at(6), 1], [at(8), 0], [at(9), 0.45], [at(10), 0.45], [at(11), 0.1]], 0.6);
  const onL = keyed(T, [[0, 1], [at(6), 0.35], [at(8), 1], [at(10), 0.4], [at(11), 0.3]]);
  const onR = keyed(T, [[0, 1], [at(2), 0.35], [at(6), 1], [at(9), 0.4], [at(10), 1]]);
  const amp = lerp(6, 24, prog(T, wt(d, 'Wellen'), wt(d, 'Wellen') + 0.6));
  const drift = prog(T, wt(d, 'treibt'), P[9].e + 0.8);
  const arrive = prog(T, wt(d, 'kommen', 1), P[10].e + 0.4);
  const spin = Math.max(0, T - P[5].s) * 2.6 * (1 - drift);
  const tired = prog(T, wt(d, 'müde'), wt(d, 'müde') + 0.4);

  // Left boat: only she rows, he looks at his phone.
  const cl = 270;
  const [lHer, swL] = rower(cl - 70, 1, true, T * 4.2, 1);
  const lMan: Fig = {x: cl + 70, y: WATER + 40, face: -1, aL: -150, aR: 14};
  const ph = hand(lMan, 'L');
  // Right boat: both row; when she is tired he rows harder.
  const cr = 810 + 90 * arrive;
  const [rHer, swH] = rower(cr - 70, 1, true, T * 4.2, lerp(1, 0.35, tired));
  const [rMan, swM] = rower(cr + 70, 1, false, T * lerp(4.2, 5.4, tired) + 0.4, lerp(1, 1.4, tired));
  const rowedR = prog(T, P[6].s, P[10].e, (x) => x);
  const bob = (cx: number) => `translate(0 ${amp * 0.5 * Math.sin(T * 2 + cx)}) rotate(${amp * 0.22 * Math.sin(T * 1.6 + cx)} ${cx} ${WATER})`;

  return (
    <Series d={d} q="Rudert ihr beide oder nur einer?" a="NUR EINER" b="BEIDE" qPhrase={12}
      headers={<Headers l="EINER RUDERT" r="BEIDE RUDERN" ls={`UFER: ${Math.round(lerp(900, 1600, drift))} M`}
        rs={arrive > 0.9 ? 'ANGEKOMMEN' : `UFER: ${Math.round(lerp(900, 40, rowedR))} M`} op={prog(T, P[1].s, P[1].s + 0.4)} />}>
      <Cam2 focus={focus} zoom={zoom}>
        <Stage onL={onL} onR={onR}>
          <Waves x0={0} amp={amp} t={T} />
          <g opacity={arrive}>
            <rect x={960} y={WATER - 48} width={140} height={18} fill="#3a3229" stroke="#c99a62" strokeWidth={4} />
            {[980, 1040].map((x) => <rect key={x} x={x} y={WATER - 30} width={12} height={90} fill="#3a3229" />)}
            <line x1={1030} y1={WATER - 48} x2={1030} y2={WATER - 200} stroke={G.white} strokeWidth={6} />
            <circle cx={1030} cy={WATER - 210} r={14} fill={G.gold} filter="url(#gl)" />
          </g>
          <g transform={`translate(${-120 * drift} ${-240 * drift}) translate(${cl} ${WATER}) scale(${1 - 0.4 * drift}) translate(${-cl} ${-WATER})`} opacity={1 - 0.5 * drift}>
            <g transform={bob(cl)}>
              <g transform={`translate(${cl} 0) scale(${Math.cos(spin)} 1) translate(${-cl} 0)`}>
                <Figure {...lHer} />
                <Oar f={lHer} sw={swL} amp={1} />
                <Figure {...lMan} />
                <rect x={ph.x - 14} y={ph.y - 30} width={28} height={46} rx={6} fill="#8fc3ff" filter="url(#gl)" />
                <Hull cx={cl} />
              </g>
            </g>
          </g>
          <g transform={bob(cr)}>
            <Figure {...rHer} />
            <Oar f={rHer} sw={swH} amp={lerp(1, 0.35, tired)} />
            <Figure {...rMan} />
            <Oar f={rMan} sw={swM} amp={lerp(1, 1.4, tired)} />
            <Hull cx={cr} />
          </g>
          <Bubble x={300} y={700} text="DU MACHST DAS DOCH GUT." s={P[4].s - 0.1} e={P[4].e + 0.5} />
          <Heart x={cr} y={720} p={prog(T, wt(d, 'rudert', 2), wt(d, 'rudert', 2) + 0.4)} s={1.3} />
        </Stage>
      </Cam2>
    </Series>
  );
};
