import React from 'react';
import {random} from 'remotion';
import {clamp01, Data, prog, Script, wt} from '../common';
import {Door, Guy, LessonFrame, P, Person, Phone, Room, Say, Shot, usePhraseScene, WH, WW} from '../lesson';
import {PhoneBg} from './V11';

const YOU: Partial<Person> = {top: '#5a6f8f', bottom: '#3b4252', hair: 'short', hairCol: P.hair.brown, skin: P.skin[0]};
const THEM: Partial<Person> = {top: '#b86b8a', bottom: '#3b3f55', hair: 'long', hairCol: P.hair.black, skin: P.skin[2]};
const MSG = 'Hey, hast du Lust, am Samstag mitzukommen?';

const Stopwatch: React.FC<{sec: number; t: number; nein?: number}> = ({sec, t, nein = 0}) => {
  const p = clamp01(sec / 5);
  const a = p * Math.PI * 2 - Math.PI / 2;
  const R = 190;
  const large = p > 0.5 ? 1 : 0;
  return (
    <g>
      <rect width={WW} height={WH} fill="#1d2130" />
      <g transform={`translate(${WW / 2} ${WH / 2 + 30})`}>
        <rect x={-26} y={-R - 62} width={52} height={36} rx={8} fill="#c9ccd4" />
        <circle r={R + 22} fill="#e9ebef" />
        <circle r={R} fill="#f8f8fa" />
        {p > 0 && p < 1 && <path d={`M 0 0 L 0 ${-R + 12} A ${R - 12} ${R - 12} 0 ${large} 1 ${Math.cos(a) * (R - 12)} ${Math.sin(a) * (R - 12)} Z`} fill="#ff8a5c" opacity={0.35} />}
        {p >= 1 && <circle r={R - 12} fill="#ff8a5c" opacity={0.35} />}
        {Array.from({length: 5}).map((_, k) => {
          const b = (k / 5) * Math.PI * 2 - Math.PI / 2;
          return <line key={k} x1={Math.cos(b) * (R - 30)} y1={Math.sin(b) * (R - 30)} x2={Math.cos(b) * (R - 8)} y2={Math.sin(b) * (R - 8)} stroke="#2b2a2e" strokeWidth={6} />;
        })}
        <line x1={0} y1={0} x2={Math.cos(a) * (R - 40)} y2={Math.sin(a) * (R - 40)} stroke="#e5484d" strokeWidth={8} strokeLinecap="round" />
        <circle r={12} fill="#2b2a2e" />
      </g>
      {nein > 0 && <Say x={WW / 2 + 250} y={180} text="Nein." p={nein} size={26} />}
    </g>
  );
};

const BusInside: React.FC<{t: number; talk?: number}> = ({t, talk = 0}) => (
  <g>
    <rect width={WW} height={WH} fill="#c9c3b5" />
    {[0, 1, 2].map((k) => (
      <g key={k}>
        <rect x={60 + k * 290} y={110} width={250} height={190} rx={18} fill="#8fb3d6" />
        {Array.from({length: 4}).map((_, j) => {
          const xx = ((j * 160 - t * 420) % 640 + 640) % 640;
          return <rect key={j} x={60 + k * 290 + xx * 0.39} y={230 - 40 * random(`tr${j}`)} width={24} height={70} fill="#5f8a5a" opacity={0.6} />;
        })}
      </g>
    ))}
    <rect x={0} y={340} width={WW} height={10} fill="#a9a293" />
    <rect y={560} width={WW} height={WH - 560} fill="#6e6a62" />
    {[200, 650].map((x, k) => (
      <g key={x}>
        <rect x={x - 60} y={440} width={120} height={22} rx={8} fill="#3d6fb6" />
        <rect x={x + (k ? 50 : -70)} y={330} width={20} height={130} rx={8} fill="#3d6fb6" />
      </g>
    ))}
    <rect x={455} y={120} width={10} height={440} fill="#d0a43c" />
    <Guy x={208} y={560} pose="sit" face={1} s={1.15} {...YOU} lean={-6 * talk} />
    <Guy x={642} y={560} pose="sit" face={-1} s={1.15} {...THEM} />
    <path d="M 628 418 q 0 -26 18 -30" stroke="#1f1f24" strokeWidth={5} fill="none" />
    <rect x={640} y={386} width={10} height={16} rx={3} fill="#1f1f24" />
    {talk > 0 && <Say x={320} y={330} text="Hi! 🙂" p={talk} size={22} />}
  </g>
);

const Hall: React.FC<{t: number; walkAway?: number; enter?: number}> = ({t, walkAway = 0, enter = 0}) => (
  <g>
    <rect width={WW} height={WH} fill="#2d3550" />
    <rect x={150} y={120} width={620} height={440} fill="#7c8698" />
    {[0, 1, 2].map((k) => <rect key={k} x={190 + k * 190} y={160} width={150} height={90} fill="#ffe7b0" opacity={0.85} />)}
    <rect y={560} width={WW} height={WH - 560} fill="#3a3f4b" />
    <Door x={400} y={560} w={130} h={230} col="#5a6170" open={enter} light={enter} />
    <rect x={540} y={320} width={170} height={90} rx={6} fill="#f4efe6" />
    <text x={625} y={356} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={20} fill={P.ink}>PROBETRAINING</text>
    <text x={625} y={388} textAnchor="middle" fontFamily="Inter" fontSize={18} fill={P.ink}>Di · 18 Uhr</text>
    <ellipse cx={465} cy={560} rx={130} ry={20} fill="#ffe7b0" opacity={0.3 * (1 + enter)} />
    {enter > 0 ? (
      <Guy x={330 + 120 * enter} y={600} s={1.15} face={1} pose="walk" walk={t * 6} {...YOU} bag="#c4793f" />
    ) : (
      <Guy x={260 - 160 * walkAway} y={610} s={1.15} face={walkAway > 0.05 ? -1 : 1} pose={walkAway > 0.05 ? 'walk' : 'stand'} walk={t * 6} {...YOU} bag="#c4793f" />
    )}
  </g>
);

const Dome: React.FC<{t: number; hits: number}> = ({t, hits}) => (
  <Room wall="#3b3550" floor="#2b2638" floorY={590}>
    <Guy x={460} y={590} pose="sit" face={1} s={1.15} {...YOU} armF={60} armB={40} />
    <path d="M 270 592 A 190 210 0 0 1 650 592 Z" fill="#bfe0ff" opacity={0.16} />
    <path d="M 270 592 A 190 210 0 0 1 650 592" fill="none" stroke="#d9efff" strokeWidth={4} opacity={0.7} />
    <path d="M 330 470 A 150 170 0 0 1 430 400" fill="none" stroke="#fff" strokeWidth={6} opacity={0.5} strokeLinecap="round" />
    {hits > 0 && ['Nein.', 'peinlich…'].map((s, k) => {
      const p = clamp01(hits * 2 - k);
      const side = k ? 1 : -1;
      const x = 460 + side * (420 - 160 * Math.sin(Math.min(1, p) * Math.PI));
      return p > 0 ? <Say key={k} x={x} y={300 + k * 90} text={s} size={22} p={Math.min(1, p * 3)} /> : null;
    })}
  </Room>
);

const Seasons: React.FC<{t: number; p: number}> = ({t, p}) => {
  const k = p * 3;
  const sky = k < 1 ? '#e7b98a' : k < 2 ? '#c9d3df' : '#a9d0e8';
  const leaf = k < 1 ? '#d98a3c' : k < 2 ? '#f4f4f6' : '#7fb069';
  return (
    <g>
      <rect width={WW} height={WH} fill={sky} />
      <rect y={540} width={WW} height={WH - 540} fill={k >= 1 && k < 2 ? '#eef1f5' : '#8f8f8a'} />
      {[140, 480, 800].map((x, i) => (
        <g key={x} transform={`translate(${((x - t * 60) % 1000 + 1000) % 1000 - 40} 0)`}>
          <rect x={-8} y={380} width={16} height={160} fill="#6b4f3a" />
          <circle cx={0} cy={350} r={70} fill={leaf} opacity={k >= 1 && k < 2 ? 0.9 : 1} />
        </g>
      ))}
      {k >= 1 && k < 2 && Array.from({length: 30}).map((_, i) => (
        <circle key={i} cx={random(`s${i}`) * WW} cy={(random(`y${i}`) * WH + t * 60) % WH} r={3} fill="#fff" opacity={0.8} />
      ))}
      <Guy x={420} y={580} s={1.2} face={1} pose="walk" walk={t * 6} {...YOU} top={k < 1 ? '#8a5a3c' : k < 2 ? '#3b4a6b' : '#6a7f6a'} />
      <Say x={470} y={300} text="Was wäre, wenn …" dark size={20} />
    </g>
  );
};

export const V13: React.FC<{d: Data; sc: Script}> = ({d}) => {
  const Pp = d.phrases;
  const {i, lt, dur, t} = usePhraseScene(d, Pp.map((_, k) => k));
  const scene = () => {
    switch (i) {
      case 0: return <Shot t={lt} dur={dur} zoom={[1.0, 1.05]}><Stopwatch sec={prog(lt, 0.2, dur - 0.1, (x) => x) * 5} t={t} /></Shot>;
      case 1: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]}><BusInside t={t} /></Shot>;
      case 2: {
        const n = MSG.length;
        const tt = prog(lt, 0.1, dur * 0.55, (x) => x), del = prog(lt, dur * 0.65, dur - 0.1, (x) => x);
        const typed = MSG.slice(0, Math.round(n * tt * (1 - del)));
        return <Shot t={lt} dur={dur}><PhoneBg t={t} /><Phone t={lt} name="Sam" msgs={[]} typed={typed} /></Shot>;
      }
      case 3: return <Shot t={lt} dur={dur} zoom={[1.0, 1.05]}><Hall t={t} walkAway={prog(lt, dur * 0.4, dur, (x) => x)} /></Shot>;
      case 4: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]} oy={460}><Dome t={t} hits={0} /></Shot>;
      case 5: return <Shot t={lt} dur={dur} zoom={[1.06, 1.1]} oy={460}><Dome t={t} hits={prog(lt, 0, dur, (x) => x)} /></Shot>;
      case 6: {
        const sec = prog(lt, 0.1, dur - 0.4, (x) => x) * 5;
        return <Shot t={lt} dur={dur}><Stopwatch sec={sec} t={t} nein={sec < 5 ? 1 - sec / 5 : 0} /></Shot>;
      }
      case 7: return <Shot t={lt} dur={dur} zoom={[1.0, 1.04]}><Seasons t={t} p={prog(lt, 0, dur, (x) => x)} /></Shot>;
      case 8: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]}><BusInside t={t} talk={prog(lt, 0.05, 0.3)} /></Shot>;
      case 9: return <Shot t={lt} dur={dur}><PhoneBg t={t} /><Phone t={lt} name="Sam" msgs={[{text: MSG, me: true, at: 0.15}]} /></Shot>;
      case 10: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]}><Hall t={t} enter={prog(lt, 0, dur, (x) => x)} /></Shot>;
      default: return <Shot t={lt} dur={dur}><Stopwatch sec={0} t={t} /></Shot>;
    }
  };
  return <LessonFrame d={d} scene={scene} />;
};

export {wt};
