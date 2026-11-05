import React from 'react';
import {clamp01, Data, lerp, prog, Script, useT, wt} from '../common';
import {Bubble, Cam2, Fig, Figure, FLOOR, G, Headers, Heart, keyed, Series, Stage} from '../stage';

/** Backpack on a figure's back; size grows with weight (1 = normal). */
const Pack: React.FC<{f: Fig; size: number; op?: number}> = ({f, size, op = 1}) => {
  const s = f.s ?? 1.2, face = f.face ?? 1;
  const w = 62 * size, h = 96 * size;
  const x = f.x - face * (30 + w / 2) * s, y = (f.y ?? FLOOR) - 176 * s;
  return (
    <g transform={`rotate(${f.lean ?? 0} ${f.x} ${f.y ?? FLOOR})`} opacity={op}>
      <rect x={x - (w * s) / 2} y={y - (h * s) / 2} width={w * s} height={h * s} rx={18 * s} fill="#8a6a45" stroke="#c99a62" strokeWidth={5} />
      <rect x={x - (w * s) / 2 + 8} y={y - 4} width={w * s - 16} height={(h * s) / 2 - 6} rx={10} fill="none" stroke="#c99a62" strokeWidth={4} opacity={0.8} />
    </g>
  );
};

const Stone: React.FC<{x: number; y: number; r?: number; op?: number}> = ({x, y, r = 22, op = 1}) => (
  <path transform={`translate(${x} ${y})`} opacity={op} fill="#8d929b" stroke="#c4c8cf" strokeWidth={3}
    d={`M ${-r} ${r * 0.2} Q ${-r} ${-r * 0.8} ${0} ${-r * 0.8} Q ${r} ${-r * 0.9} ${r} ${r * 0.1} Q ${r * 0.8} ${r * 0.8} 0 ${r * 0.75} Q ${-r * 0.9} ${r * 0.8} ${-r} ${r * 0.2} Z`} />
);

export const V8: React.FC<{d: Data; sc: Script}> = ({d}) => {
  const T0 = useT();
  const T = T0 > d.duration - 0.3 ? 0 : T0;
  const P = d.phrases;
  const at = (i: number) => P[i].s - 0.15;
  const focus = keyed(T, [[0, 0], [at(2), -1], [at(5), 1], [at(8), 0], [at(9), -0.7], [at(11), 0.7], [at(12), 0]], 0.6);
  const zoom = keyed(T, [[0, 0], [at(2), 1], [at(5), 1], [at(8), 0], [at(9), 0.45], [at(11), 0.45], [at(12), 0.1]], 0.6);
  const onL = keyed(T, [[0, 1], [at(5), 0.35], [at(8), 1], [at(11), 0.4], [at(12), 0.3]]);
  const onR = keyed(T, [[0, 1], [at(2), 0.35], [at(5), 1], [at(9), 0.4], [at(11), 1]]);

  // Stones: three drop into his pack (left), four come out of her pack (right).
  const inT = [wt(d, 'jedem'), wt(d, 'Streit'), wt(d, 'Stein')];
  const outT = [wt(d, 'packen'), wt(d, 'aus', 1), wt(d, 'damals'), wt(d, 'nicht', 0)];
  const nIn = inT.filter((x) => T >= x + 0.35).length;
  const nOut = outT.filter((x) => T >= x + 0.35).length;
  const hill = prog(T, wt(d, 'bergauf'), wt(d, 'bergauf') + 0.8);
  const climb = prog(T, wt(d, 'Rechts'), P[11].e + 0.6, (x) => x);
  const strain = prog(T, at(9), at(9) + 0.6);

  const slopeY = (side: number, x: number) => FLOOR - hill * Math.max(0, x - (side - 270)) * 0.3;
  const lm = 190 - 40 * hill, lw = 350 - 40 * hill;
  const lMan: Fig = {x: lm, y: slopeY(270, lm), face: 1, lean: 4 * hill + 12 * strain, aL: -14, aR: 14};
  const lHer: Fig = {x: lw, y: slopeY(270, lw), face: hill > 0.5 ? 1 : -1, her: true, lean: 4 * hill, aL: -14, aR: 14};
  const rm = lerp(730, 620, hill) + 170 * climb, rw = rm + lerp(160, 150, hill);
  const rMan: Fig = {x: rm, y: slopeY(810, rm), face: 1, lean: 5 * hill, aL: -14, aR: lerp(14, 40, prog(T, at(7), at(7) + 0.3))};
  const rHer: Fig = {x: rw, y: slopeY(810, rw), face: hill > 0.5 ? 1 : -1, her: true, lean: 5 * hill, aL: -14, aR: 14};
  const kgL = 8 + nIn * 6, kgR = Math.max(1, 13 - nOut * 3);

  return (
    <Series d={d} q="Packst du aus oder schleppst du weiter?" a="WEITERSCHLEPPEN" b="AUSPACKEN" qPhrase={13}
      headers={<Headers l="ZUGEPACKT" r="AUSGEPACKT" ls={`GEWICHT: ${kgL} KG`} rs={`GEWICHT: ${kgR} KG`} op={prog(T, P[1].s, P[1].s + 0.4)} />}>
      <Cam2 focus={focus} zoom={zoom}>
        <Stage onL={onL} onR={onR}>
          {hill > 0 && [270, 810].map((sx) => (
            <polygon key={sx} points={`${sx - 270},${FLOOR + 2} ${sx + 270},${FLOOR + 2} ${sx + 270},${slopeY(sx, sx + 270)}`} fill="#15171c" stroke="#2e3239" strokeWidth={4} opacity={hill} />
          ))}
          <Figure {...lMan} />
          <Pack f={lMan} size={1 + nIn * 0.22} />
          <Figure {...lHer} />
          {inT.map((x, i) => {
            const p = prog(T, x, x + 0.35, (v) => v * v);
            return p > 0 && p < 1 ? <Stone key={i} x={lm - 70} y={lerp(560, 960, p)} /> : null;
          })}
          <Figure {...rMan} />
          <Figure {...rHer} />
          <Pack f={rHer} size={Math.max(0.5, 1.5 - nOut * 0.25)} />
          {outT.map((x, i) => {
            const p = prog(T, x, x + 0.35);
            const sx = 960 - i * 46;
            return p > 0 ? <Stone key={i} x={lerp(rw + 60, sx, p)} y={lerp(980, FLOOR - 18, p) - Math.sin(p * Math.PI) * 80} op={1 - hill} /> : null;
          })}
          <Bubble x={240} y={700} text="MEINE EX HAT DAS AUCH IMMER GESAGT." s={P[4].s - 0.1} e={P[4].e + 0.4} />
          <Bubble x={860} y={700} text="DAS HAT MICH DAMALS VERLETZT." s={P[6].s - 0.1} e={P[6].e + 0.2} />
          <Bubble x={760} y={700} text="ICH BIN NICHT ER." s={P[7].s - 0.1} e={P[7].e + 0.5} gold />
          {strain > 0 && <text x={290} y={640} fill={G.white} opacity={strain * (1 - clamp01(hill - 1))} fontFamily="JetBrains Mono" fontWeight={700} fontSize={34} textAnchor="middle">ZU SCHWER</text>}
          <Heart x={rm + 80} y={slopeY(810, rm) - 430} p={prog(T, wt(d, 'Vergangenheit'), wt(d, 'Vergangenheit') + 0.4)} s={1.3} />
        </Stage>
      </Cam2>
    </Series>
  );
};
