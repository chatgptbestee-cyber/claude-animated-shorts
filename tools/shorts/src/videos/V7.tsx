import React from 'react';
import {random} from 'remotion';
import {Data, lerp, prog, Script, useT, wt} from '../common';
import {Cam2, Fig, Figure, G, Headers, Heart, keyed, Series, Stage} from '../stage';

const Notes: React.FC<{speed: number; t: number}> = ({speed, t}) => (
  <g>
    {Array.from({length: 14}).map((_, i) => {
      const x = 60 + random(`nx${i}`) * 960;
      const y = 1000 - (((random(`ny${i}`) * 700 + t * 90 * speed) % 700));
      return (
        <text key={i} x={x + Math.sin(t * 2 + i) * 14} y={y} fill={G.gold} opacity={0.15 + 0.35 * Math.sin(((1000 - y) / 700) * Math.PI)}
          fontSize={40 + random(`ns${i}`) * 24} fontFamily="DejaVu Sans">{i % 2 ? '♪' : '♫'}</text>
      );
    })}
  </g>
);

export const V7: React.FC<{d: Data; sc: Script}> = ({d}) => {
  const T0 = useT();
  const T = T0 > d.duration - 0.3 ? 0 : T0;
  const P = d.phrases;
  const at = (i: number) => P[i].s - 0.15;
  const focus = keyed(T, [[0, 0], [at(2), -1], [at(5), 1], [at(7), 0], [at(8), -0.7], [at(9), 0.7], [at(10), 0]], 0.6);
  const zoom = keyed(T, [[0, 0], [at(2), 1], [at(5), 1], [at(7), 0], [at(8), 0.45], [at(9), 0.45], [at(10), 0.1]], 0.6);
  const onL = keyed(T, [[0, 1], [at(5), 0.35], [at(7), 1], [at(9), 0.4], [at(10), 0.3]]);
  const onR = keyed(T, [[0, 1], [at(2), 0.35], [at(5), 1], [at(8), 0.4], [at(9), 1]]);
  const fast = prog(T, wt(d, 'schneller'), wt(d, 'schneller') + 0.4);
  const bpm = Math.round(lerp(90, 140, fast));

  // Left: both pull, step on toes, then let go.
  const pull = prog(T, wt(d, 'zieht'), wt(d, 'rechts'));
  const ouch = prog(T, wt(d, 'Füße'), wt(d, 'Füße') + 0.15) * (1 - prog(T, wt(d, 'Füße') + 0.6, wt(d, 'Füße') + 0.9));
  const go = prog(T, wt(d, 'los'), wt(d, 'los') + 0.6);
  const sway = Math.sin(T * 3.2) * 8 * (1 - pull);
  const jolt = Math.sin(T * 60) * 6 * ouch;
  const lMan: Fig = {x: 195 - 30 * pull - 70 * go + sway + jolt, face: 1, lean: -16 * pull * (1 - go), aL: -14, aR: lerp(lerp(48, 80, pull), 10, go)};
  const lHer: Fig = {x: 345 + 30 * pull + 70 * go + sway - jolt, face: -1, her: true, lean: 16 * pull * (1 - go), aL: lerp(lerp(-48, -80, pull), -10, go), aR: 12};

  // Right: they turn around each other; speed doubles when the music gets faster.
  let th = 0;
  const trip0 = wt(d, 'stolpert'), trip1 = P[6].e;
  for (let k = 0; k < Math.round(T * 30); k++) {
    const tk = k / 30;
    const sp = tk < P[1].s ? 0 : lerp(1.3, 3.0, prog(tk, wt(d, 'schneller'), wt(d, 'schneller') + 0.4)) * (tk > trip0 && tk < trip1 ? 0.25 : 1);
    th += sp / 30;
  }
  const trip = prog(T, trip0, trip0 + 0.25) * (1 - prog(T, trip1 - 0.2, trip1 + 0.2));
  const c = 810, rad = 78;
  const mx = c - Math.cos(th) * rad, hx = c + Math.cos(th) * rad;
  const depth = Math.sin(th);
  const rMan: Fig = {x: mx, s: 1.2 + 0.06 * depth, face: mx < hx ? 1 : -1, aL: mx < hx ? -14 : -50, aR: mx < hx ? 50 : 14};
  const rHer: Fig = {x: hx, s: 1.2 - 0.06 * depth, face: hx > mx ? -1 : 1, her: true, lean: (hx > mx ? 1 : -1) * 26 * trip,
    aL: hx > mx ? -50 : -14, aR: hx > mx ? 14 : 50};
  const leadHim = T >= wt(d, 'er', 1) && T < wt(d, 'sie', 2);
  const leadHer = T >= wt(d, 'sie', 2) && T < P[5].e + 0.6;
  const glow = prog(T, P[9].s, P[9].s + 0.5) * (1 - prog(T, d.duration - 0.6, d.duration));

  return (
    <Series d={d} q="Willst du führen oder zusammen tanzen?" a="FÜHREN" b="ZUSAMMEN TANZEN" qPhrase={12}
      headers={<Headers l="JEDER FÜHRT" r="IM TAKT" ls={go > 0.5 ? 'TAKT: VERLOREN' : `TEMPO: ${bpm} BPM`} rs={`TEMPO: ${bpm} BPM`} op={prog(T, P[1].s, P[1].s + 0.4)} />}>
      <Cam2 focus={focus} zoom={zoom}>
        <Stage onL={onL} onR={onR}>
          <Notes speed={1 + fast * 1.5} t={T} />
          <ellipse cx={c} cy={1186} rx={190} ry={30} fill="none" stroke={G.gold} strokeWidth={4} opacity={0.7 * glow} filter="url(#gl)" />
          <Figure {...lMan} />
          <Figure {...lHer} />
          {ouch > 0 && (
            <g transform={`translate(270 1150) scale(${0.6 + 0.4 * ouch})`} opacity={ouch}>
              <path d="M 0 -50 L 12 -16 L 48 -18 L 20 4 L 32 40 L 0 18 L -32 40 L -20 4 L -48 -18 L -12 -16 Z" fill={G.gold} filter="url(#gl)" />
              <text x={0} y={-70} fill={G.white} fontFamily="JetBrains Mono" fontWeight={700} fontSize={40} textAnchor="middle">AUA</text>
            </g>
          )}
          {depth > 0 ? <><Figure {...rHer} /><Figure {...rMan} /></> : <><Figure {...rMan} /><Figure {...rHer} /></>}
          {(leadHim || leadHer) && (
            <path transform={`translate(${leadHim ? mx : hx} ${770})`} d="M -18 -14 L 18 -14 L 0 12 Z" fill={G.gold} filter="url(#gl)" />
          )}
          <Heart x={c} y={700} p={prog(T, wt(d, 'Takt', 1), wt(d, 'Takt', 1) + 0.4)} s={1.4} />
        </Stage>
      </Cam2>
    </Series>
  );
};
