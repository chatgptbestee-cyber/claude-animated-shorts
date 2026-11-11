import React from 'react';
import {Data, prog, Script, wt} from '../common';
import {Chair, Guy, P, Person, Room, Say, Shot, Table, usePhraseScene, Window, WH, WW} from '../lesson';
import {ListFrame, Row} from '../list';

const XS = [170, 315, 460, 605, 755];
const KIDS: Partial<Person>[] = [
  {top: '#e07a5f', bottom: '#3b4252', hair: 'curly', hairCol: P.hair.black, skin: P.skin[2]},
  {top: '#6a7fb0', bottom: '#3b4252', hair: 'pony', hairCol: P.hair.blond, skin: P.skin[0]},
  {top: '#7a8f5f', bottom: '#4a4a55', hair: 'short', hairCol: P.hair.brown, skin: P.skin[1]},
  {top: '#b86b8a', bottom: '#3b4252', hair: 'long', hairCol: P.hair.black, skin: P.skin[3]},
  {top: '#8d939c', bottom: '#4a4a55', hair: 'short', hairCol: '#3a3330', skin: P.skin[0]},
];

/** active: 0 = everyone, 1..5 = that student in focus; dusk: the empty classroom later on. */
const Classroom: React.FC<{t: number; active: number; dusk?: number}> = ({t, active, dusk = 0}) => {
  const dim = (k: number) => (active === 0 || active === k + 1 ? undefined : 'brightness(0.5) saturate(0.7)');
  const focusX = active ? XS[active - 1] : WW / 2;
  return (
    <g>
      <Room wall={dusk ? '#b99a86' : '#ece2cc'} floor={dusk ? '#7d6250' : '#b8956f'}>
        <rect x={80} y={70} width={400} height={190} fill="#2f4a3c" stroke="#8a6a4f" strokeWidth={10} />
        <text x={110} y={120} fontFamily="DejaVu Sans" fontWeight={700} fontSize={28} fill="#e8f0e8" opacity={0.9}>Klasse 9b</text>
        <path d="M 110 170 q 40 -30 80 0 t 80 0" stroke="#e8f0e8" strokeWidth={4} fill="none" opacity={0.7} />
        <Window x={640} y={80} w={200} h={210} mode={dusk ? 'dusk' : 'day'} />
        {XS.map((x, k) => (
          <g key={k}>
            <Table x={x - 128} y={452} w={104} h={108} />
            <Chair x={x + 2} y={560} face={-1} />
          </g>
        ))}
        {XS.map((x, k) => {
          const isActive = active === k + 1;
          const gone = dusk > 0 && k < 4;
          const common = {...KIDS[k], face: -1 as const, s: 1.02};
          let fig: React.ReactNode;
          if (k === 0 && isActive) fig = <Guy x={x + 30} y={560} {...common} armF={160 + 15 * Math.sin(t * 8)} armB={140} lean={6 * Math.sin(t * 6)} />;
          else if (k === 1 && isActive) fig = <Guy x={x} y={560} pose="sit" {...common} armF={172} />;
          else if (k === 3 && isActive) fig = <Guy x={x + 20} y={560} {...common} armF={75} armB={75} />;
          else fig = <Guy x={x} y={560} pose="sit" {...common} armF={70} />;
          return (
            <g key={k} style={{filter: dim(k)}} opacity={gone ? 0.18 : 1}>
              {fig}
              {k === 1 && <circle cx={x - 10} cy={413} r={7} fill="none" stroke="#2b2a2e" strokeWidth={2.5} />}
            </g>
          );
        })}
        {active === 3 && <rect x={XS[2] - 110} y={440} width={56} height={12} fill="#fbf9f4" />}
        {active === 1 && [XS[1], XS[2], XS[3]].map((x, k) => <Say key={k} x={x} y={300 - 14 * k} text="haha" size={24} p={prog(t, 0.2 + k * 0.15, 0.4 + k * 0.15)} />)}
        {active === 1 && <Say x={XS[0] + 40} y={250} text="🤪" size={30} />}
        {active === 2 && <Say x={XS[1] - 20} y={270} text="Ich weiß es!" size={24} p={prog(t, 0.2, 0.4)} />}
        {active === 3 && <Say x={XS[2] + 40} y={290} text="Mein Hund hat sie gefressen!" size={23} p={prog(t, 0.3, 0.5)} />}
        {active === 4 && <Say x={XS[3] - 10} y={280} text="Hey, vertragt euch 🙂" size={24} p={prog(t, 0.2, 0.4)} />}
        {active === 5 && dusk === 0 && <ellipse cx={XS[4]} cy={440} rx={120} ry={170} fill="#fff1c9" opacity={0.25} />}
        {dusk > 0 && <ellipse cx={XS[4]} cy={420} rx={160} ry={200} fill="#ffc98a" opacity={0.3 * dusk} />}
      </Room>
      {active > 0 && (
        <g>
          <defs>
            <radialGradient id={`spot${active}`} cx={focusX / WW} cy={0.62} r={0.42}>
              <stop offset="0.35" stopColor="#000" stopOpacity={0} />
              <stop offset="1" stopColor="#000" stopOpacity={0.45} />
            </radialGradient>
          </defs>
          <rect width={WW} height={WH} fill={`url(#spot${active})`} />
        </g>
      )}
    </g>
  );
};

export const V16: React.FC<{d: Data; sc: Script}> = ({d}) => {
  const Pp = d.phrases;
  const {i, lt, dur, t} = usePhraseScene(d, Pp.map((_, k) => k));
  const nums = ['eins', 'zwei', 'drei', 'vier'];
  const numAt = (k: number) => (k < 4 ? wt(d, nums[k]) : wt(d, 'fünf', 1));
  const rows: Row[] = [
    {label: 'Der Klassenclown', at: wt(d, 'Klassenclown'), from: numAt(0), to: numAt(1)},
    {label: 'Die, die alles wusste', at: wt(d, 'immer'), from: numAt(1), to: numAt(2)},
    {label: 'Der mit den Ausreden', at: wt(d, 'Hausaufgaben'), from: numAt(2), to: numAt(3)},
    {label: 'Die Streitschlichterin', at: wt(d, 'Streit'), from: numAt(3), to: numAt(4)},
    {label: 'Die, die keiner bemerkt hat', at: wt(d, 'keiner'), from: numAt(4), to: Pp[7].s - 0.1},
  ];
  const scene = () => {
    if (i === 0) return <Shot t={lt} dur={dur} zoom={[1.14, 1.0]}><Classroom t={lt} active={0} /></Shot>;
    if (i >= 1 && i <= 5) {
      const x = XS[i - 1];
      return <Shot t={lt} dur={dur} zoom={[1.1, 1.18]} ox={x} oy={430}><Classroom t={lt} active={i} /></Shot>;
    }
    if (i === 6) return <Shot t={lt} dur={dur} zoom={[1.12, 1.24]} ox={XS[4]} oy={430}><Classroom t={lt} active={5} dusk={prog(lt, 0, 0.5)} /></Shot>;
    return <Shot t={lt} dur={dur} zoom={[1.0, 1.14]}><Classroom t={lt} active={0} /></Shot>;
  };
  return <ListFrame d={d} scene={scene} rows={rows} ctaAt={Pp[6].s - 0.1} />;
};
