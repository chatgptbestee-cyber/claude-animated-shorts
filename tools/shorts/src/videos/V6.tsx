import React from 'react';
import {Data, lerp, prog, Script, useT, wt} from '../common';
import {Bubble, Cam2, Figure, G, Headers, Heart, hand, keyed, Rain, Series, Stage, Fig} from '../stage';

const Umbrella: React.FC<{hx: number; hy: number; cx: number; cy: number; open: number; rot?: number}> = ({hx, hy, cx, cy, open, rot = 0}) => {
  const R = 160 * Math.max(0.12, open);
  const sc = Array.from({length: 4}, () => `q ${-R / 4} ${-22 * open} ${-R / 2} 0`).join(' ');
  return (
    <g>
      <line x1={hx} y1={hy} x2={cx} y2={cy} stroke={G.white} strokeWidth={7} strokeLinecap="round" />
      <path d={`M ${hx} ${hy} q 0 22 -18 22`} stroke={G.white} strokeWidth={7} fill="none" strokeLinecap="round" />
      <g transform={`rotate(${rot} ${cx} ${cy})`}>
        <path d={`M ${cx - R} ${cy} A ${R} ${R * 0.75} 0 0 1 ${cx + R} ${cy} ${sc} Z`} fill="#1d222b" stroke={G.white} strokeWidth={6} strokeLinejoin="round" />
        <line x1={cx} y1={cy - R * 0.75} x2={cx} y2={cy - R * 0.75 - 18} stroke={G.white} strokeWidth={6} strokeLinecap="round" />
      </g>
    </g>
  );
};

export const V6: React.FC<{d: Data; sc: Script}> = ({d}) => {
  const T0 = useT();
  const T = T0 > d.duration - 0.3 ? 0 : T0; // reset the stage for the loop
  const P = d.phrases;
  const at = (i: number) => P[i].s - 0.15;
  const focus = keyed(T, [[0, 0], [at(2), -1], [at(4), 1], [at(8), 0], [at(9), -0.7], [at(10), 0.7], [at(11), 0]], 0.6);
  const zoom = keyed(T, [[0, 0], [at(2), 1], [at(4), 1], [at(8), 0], [at(9), 0.45], [at(10), 0.45], [at(11), 0.1]], 0.6);
  const onL = keyed(T, [[0, 1], [at(4), 0.35], [at(8), 1], [at(10), 0.4], [at(11), 0.3]]);
  const onR = keyed(T, [[0, 1], [at(2), 0.35], [at(4), 1], [at(9), 0.4], [at(10), 1]]);
  const storm = prog(T, at(8), at(8) + 0.8);
  const fly = prog(T, wt(d, 'Links'), wt(d, 'allein'), (x) => x);

  // Left couple: he keeps the umbrella for himself.
  const openL = prog(T, at(2), at(2) + 0.6);
  const lMan: Fig = {x: lerp(190, 140, fly), face: 1, aL: -14, aR: lerp(lerp(30, 168, openL), 25, fly)};
  const lHer: Fig = {x: lerp(350, 410, fly), face: -1, her: true, aL: -20, aR: 10, wet: prog(T, wt(d, 'über', 0), wt(d, 'über', 0) + 0.6)};
  const hL = hand(lMan, 'R');
  const flyX = -260 * fly, flyY = -520 * fly;

  // Right couple: he holds it over her, she moves closer, both hold it in the storm.
  const openR = prog(T, at(4), at(4) + 0.6);
  const closer = prog(T, wt(d, 'rückt'), wt(d, 'näher', 0, true));
  const both = prog(T, at(10), at(10) + 0.5);
  const rMan: Fig = {x: lerp(730, 772, closer), face: 1, aL: -14, aR: lerp(lerp(30, 140, openR), 165, closer),
    wet: prog(T, wt(d, 'nass'), wt(d, 'nass') + 0.3) * (1 - prog(T, wt(d, 'drunter'), wt(d, 'drunter') + 0.4))};
  const rHer: Fig = {x: lerp(890, 848, closer), face: -1, her: true, aL: lerp(-20, -158, both), aR: 12};
  const hR = hand(rMan, 'R');
  const canR = {x: lerp(hR.x + 70, hR.x + 18, closer), y: hR.y - 130};
  const wob = Math.sin(T * 9) * 6 * storm;

  const dryL = fly > 0.5 ? '0' : '1';
  const dryR = prog(T, wt(d, 'drunter'), wt(d, 'drunter') + 0.3) > 0.5 ? '2' : '1';

  return (
    <Series d={d} q="Teilst du den Schirm oder bleibst du trocken?" a="TROCKEN BLEIBEN" b="SCHIRM TEILEN" qPhrase={13}
      headers={<Headers l="FÜR SICH" r="ZU ZWEIT" ls={`TROCKEN: ${dryL} VON 2`} rs={`TROCKEN: ${dryR} VON 2`} op={prog(T, P[1].s, P[1].s + 0.4)} />}>
      <Cam2 focus={focus} zoom={zoom} shake={storm * (1 - prog(T, at(11), at(11) + 0.5))}>
        <Stage onL={onL} onR={onR}>
          <Rain n={Math.round(lerp(70, 190, storm))} wind={storm} op={prog(T, 0, 0.6)} />
          <Figure {...lMan} />
          <Figure {...lHer} />
          <g transform={`translate(${flyX} ${flyY}) rotate(${-200 * fly} ${hL.x} ${hL.y - 120})`} opacity={1 - prog(T, wt(d, 'allein'), wt(d, 'allein') + 0.5)}>
            <Umbrella hx={hL.x} hy={hL.y} cx={hL.x} cy={hL.y - 130} open={openL * (1 - fly * 0.3)} rot={fly * 40} />
          </g>
          <Figure {...rMan} />
          <Figure {...rHer} />
          <Umbrella hx={hR.x} hy={hR.y} cx={canR.x + wob} cy={canR.y} open={openR} rot={wob * 0.6} />
          <Bubble x={250} y={500} text="HÄTTEST HALT SELBST EINEN MITGENOMMEN." s={P[3].s - 0.1} e={P[3].e + 0.4} />
          <Heart x={810} y={470} p={prog(T, wt(d, 'teilen'), wt(d, 'teilen') + 0.4)} s={1.4} />
        </Stage>
      </Cam2>
    </Series>
  );
};
