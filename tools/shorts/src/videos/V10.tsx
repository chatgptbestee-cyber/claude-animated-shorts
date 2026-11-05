import React from 'react';
import {Data, lerp, prog, Script, useT, wt} from '../common';
import {Bubble, Cam2, Fig, Figure, G, Headers, Heart, keyed, Series, Stage} from '../stage';

type Side = 'tab' | 'hole' | 'flat';
const S = 150;

const piecePath = (r: Side, l: Side, c = 0) => {
  const h = S / 2, k = S * 0.17;
  const arc = (x: number, y: number, side: Side) => (side === 'flat' ? `L ${x} ${y}` : `A ${k} ${k} 0 1 ${side === 'tab' ? 1 : 0} ${x} ${y}`);
  return [
    `M ${-h + c} ${-h}`, `L ${h} ${-h}`, `L ${h} ${-k}`, arc(h, k, r), `L ${h} ${h}`, `L ${-h} ${h}`, `L ${-h} ${k}`, arc(-h, -k, l),
    `L ${-h} ${-h + c}`, 'Z',
  ].join(' ');
};

const Piece: React.FC<{x: number; y: number; rot?: number; r: Side; l: Side; c?: number; gold?: boolean; glow?: number; s?: number}> = ({
  x, y, rot = 0, r, l, c = 0, gold, glow = 0, s = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {glow > 0 && <path d={piecePath(r, l, c)} fill="none" stroke={G.gold} strokeWidth={10} opacity={glow} filter="url(#gl)" />}
    <path d={piecePath(r, l, c)} fill={gold ? G.gold : '#e6e8ec'} stroke={gold ? '#ffe3a1' : '#ffffff'} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

const Scissors: React.FC<{x: number; y: number; snip: number; op: number}> = ({x, y, snip, op}) => {
  const a = 10 + 18 * Math.abs(Math.sin(snip * Math.PI * 3));
  return (
    <g transform={`translate(${x} ${y})`} opacity={op} stroke={G.white} strokeWidth={6} fill="none" strokeLinecap="round">
      <g transform={`rotate(${-a})`}><line x1={0} y1={0} x2={-90} y2={0} /><circle cx={34} cy={0} r={18} /></g>
      <g transform={`rotate(${a})`}><line x1={0} y1={0} x2={-90} y2={0} /><circle cx={34} cy={0} r={18} /></g>
    </g>
  );
};

export const V10: React.FC<{d: Data; sc: Script}> = ({d}) => {
  const T0 = useT();
  const T = T0 > d.duration - 0.3 ? 0 : T0;
  const P = d.phrases;
  const at = (i: number) => P[i].s - 0.15;
  const focus = keyed(T, [[0, 0], [at(2), -1], [at(6), 1], [at(7), 0], [at(8), -0.7], [at(9), 0.7], [at(10), 0]], 0.6);
  const zoom = keyed(T, [[0, 0], [at(2), 1], [at(6), 1], [at(7), 0], [at(8), 0.45], [at(9), 0.45], [at(10), 0.1]], 0.6);
  const onL = keyed(T, [[0, 1], [at(6), 0.35], [at(7), 1], [at(9), 0.4], [at(10), 0.3]]);
  const onR = keyed(T, [[0, 1], [at(2), 0.35], [at(6), 1], [at(8), 0.4], [at(9), 1]]);
  const Y = 640;

  // Left: she cuts his piece until it "fits", and he no longer recognizes himself.
  const cut1 = T >= wt(d, 'Ecke');
  const cut2 = T >= wt(d, 'eine', 1);
  const push = prog(T, wt(d, 'Links'), wt(d, 'Links') + 0.8);
  const lost = prog(T, wt(d, 'erkennt'), wt(d, 'erkennt') + 0.5);
  const scis = prog(T, P[4].s - 0.3, P[4].s) * (1 - prog(T, P[5].e, P[5].e + 0.3));
  const fall1 = prog(T, wt(d, 'Ecke'), wt(d, 'Ecke') + 0.7, (x) => x * x);
  const fall2 = prog(T, wt(d, 'eine', 1), wt(d, 'eine', 1) + 0.7, (x) => x * x);
  const lHimX = lerp(270 - 120, 270 - 75 * 0.85 - 75, push), lHerX = lerp(270 + 120, 270 + 75, push);

  // Right: they turn the pieces until they interlock.
  const turn = prog(T, wt(d, 'drehen'), wt(d, 'ineinandergreifen', 0, true));
  const join = prog(T, wt(d, 'ineinandergreifen') - 0.2, wt(d, 'ineinandergreifen', 0, true) + 0.3);
  const rHimX = lerp(810 - 120, 810 - 75, join), rHerX = lerp(810 + 120, 810 + 75, join);
  const glowR = join * (0.6 + 0.4 * Math.sin(T * 4));

  const lMan: Fig = {x: 190, face: 1, aL: -14, aR: 14, tint: lost > 0.5 ? '#80858e' : undefined};
  const lHer: Fig = {x: 350, face: -1, her: true, aL: lerp(-14, -150, scis), aR: 14};
  const rMan: Fig = {x: 730, face: 1, aL: -14, aR: lerp(14, 150, turn * (1 - join))};
  const rHer: Fig = {x: 890, face: -1, her: true, aL: lerp(-14, -150, turn * (1 - join)), aR: 14};
  const cuts = (cut1 ? 1 : 0) + (cut2 ? 1 : 0);

  return (
    <Series d={d} q="Veränderst du deinen Partner oder suchst du, wie ihr passt?" a="VERÄNDERN" b="PASSEN" qPhrase={11}
      headers={<Headers l="ANGEPASST" r="GEDREHT" ls={`ABGESCHNITTEN: ${cuts}`} rs="ABGESCHNITTEN: 0" op={prog(T, P[1].s, P[1].s + 0.4)} />}>
      <Cam2 focus={focus} zoom={zoom}>
        <Stage onL={onL} onR={onR}>
          <Figure {...lMan} />
          <Figure {...lHer} />
          <Figure {...rMan} />
          <Figure {...rHer} />
          <Piece x={lHimX} y={Y} r={cut1 ? 'flat' : 'tab'} l="flat" c={cut2 ? 50 : 0} s={cut2 ? 0.85 : 1} />
          <Piece x={lHerX} y={Y} r="flat" l="hole" gold />
          {cut1 && fall1 < 1 && <circle cx={lHimX + 82} cy={lerp(Y, 1180, fall1)} r={24} fill="#e6e8ec" opacity={1 - fall1} />}
          {cut2 && fall2 < 1 && <polygon points={`${lHimX - 64},${Y - 64 + fall2 * 520} ${lHimX - 24},${Y - 64 + fall2 * 520} ${lHimX - 64},${Y - 24 + fall2 * 520}`} fill="#e6e8ec" opacity={1 - fall2} />}
          <Scissors x={lHimX + 130} y={Y - 10} snip={T} op={scis} />
          {lost > 0 && <text x={190} y={770} fill={G.white} opacity={lost} fontFamily="Inter" fontWeight={900} fontSize={64} textAnchor="middle">?</text>}
          <Piece x={rHimX} y={Y} rot={lerp(90, 0, turn)} r="tab" l="flat" glow={glowR} />
          <Piece x={rHerX} y={Y} rot={lerp(-90, 0, turn)} r="flat" l="hole" gold glow={glowR} />
          <Heart x={810} y={500} p={prog(T, wt(d, 'passt', 2), wt(d, 'passt', 2) + 0.4)} s={1.3} />
          <Bubble x={400} y={770} text="ZIEH DAS NICHT AN." s={P[3].s - 0.1} e={P[3].e + 0.4} />
        </Stage>
      </Cam2>
    </Series>
  );
};
