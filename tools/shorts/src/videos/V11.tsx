import React from 'react';
import {random} from 'remotion';
import {clamp01, Data, prog, Script, wt} from '../common';
import {Bed, CeilingLamp, Chair, Door, Guy, LessonFrame, P, Person, Phone, Room, Say, shade, Shot, Table, usePhraseScene, Window, WH, WW} from '../lesson';

const YOU: Partial<Person> = {top: '#5a6f8f', bottom: '#3b4252', hair: 'short', hairCol: P.hair.brown, skin: P.skin[0]};
const MAMA: Partial<Person> = {top: '#b86b5a', bottom: '#4a4a55', hair: 'bun', hairCol: '#6b5446', skin: P.skin[1]};
const LINE = 'Schreib mir, wenn du angekommen bist ❤️';

export const PhoneBg: React.FC<{t: number; tint?: string}> = ({t, tint = '#1a1d2b'}) => (
  <g>
    <rect width={WW} height={WH} fill={tint} />
    {Array.from({length: 12}).map((_, i) => (
      <circle key={i} cx={random(`b${i}`) * WW} cy={random(`c${i}`) * WH} r={20 + random(`r${i}`) * 50}
        fill={i % 3 ? '#e8b86a' : '#7a8cc9'} opacity={0.06 + 0.05 * Math.sin(t + i)} />
    ))}
  </g>
);

export const Nightstand: React.FC<{x: number; y: number; lamp?: number}> = ({x, y, lamp = 0}) => (
  <g>
    <rect x={x} y={y - 110} width={120} height={110} rx={6} fill="#6b4f3a" />
    <rect x={x + 10} y={y - 70} width={100} height={4} fill="#4f3a2b" />
    <rect x={x + 54} y={y - 112} width={12} height={0} />
    <g>
      <ellipse cx={x + 40} cy={y - 150} rx={120} ry={110} fill="#ffd28a" opacity={0.22 * lamp} />
      <rect x={x + 37} y={y - 170} width={6} height={60} fill="#3a3530" />
      <path d={`M ${x + 14} ${y - 168} L ${x + 24} ${y - 205} L ${x + 56} ${y - 205} L ${x + 66} ${y - 168} Z`} fill={lamp > 0.5 ? '#f2d6a2' : '#8b7f70'} />
    </g>
  </g>
);

const Party: React.FC<{t: number}> = ({t}) => (
  <Room wall="#2a1f3d" floor="#1b1526">
    {[['#ff5fa2', 0], ['#5fd0ff', 2], ['#ffd25f', 4]].map(([c, k], i) => (
      <ellipse key={i} cx={WW / 2 + Math.sin(t * 1.4 + (k as number)) * 300} cy={260 + Math.cos(t + (k as number)) * 80} rx={170} ry={120} fill={c as string} opacity={0.22} />
    ))}
    <line x1={WW / 2} y1={0} x2={WW / 2} y2={60} stroke="#888" strokeWidth={2} />
    <circle cx={WW / 2} cy={80} r={22} fill="#cfd3dc" />
    {[160, 300, 460, 610, 760].map((x, i) => (
      <Guy key={i} x={x} y={600} s={1.25} face={i % 2 ? -1 : 1} top="#2a2238" bottom="#1a1622" skin="#3b3044" hairCol="#120e16" eyes={false}
        hair={(['short', 'long', 'pony', 'curly', 'short'] as const)[i]} armF={150 + 20 * Math.sin(t * 6 + i)} armB={140 + 20 * Math.cos(t * 6 + i)} lean={4 * Math.sin(t * 3 + i)} />
    ))}
  </Room>
);

const Trip: React.FC<{t: number}> = ({t}) => (
  <g>
    <defs><linearGradient id="dusk1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6b5a8e" /><stop offset="1" stopColor="#f0a77a" /></linearGradient></defs>
    <rect width={WW} height={WH} fill="url(#dusk1)" />
    <rect x={40} y={200} width={420} height={360} fill="#c9a27e" />
    {Array.from({length: 8}).map((_, i) => <rect key={i} x={70 + (i % 4) * 96} y={240 + Math.floor(i / 4) * 120} width={60} height={70} fill="#ffe2a8" opacity={0.85} />)}
    <rect y={560} width={WW} height={WH - 560} fill="#4a4a52" />
    <g transform={`translate(${380 - 30 * clamp01(t)} 0)`}>
      <rect x={0} y={380} width={500} height={170} rx={26} fill="#e9edf2" />
      <rect x={0} y={470} width={500} height={22} fill="#3d6fb6" />
      {Array.from({length: 5}).map((_, i) => <rect key={i} x={30 + i * 92} y={400} width={74} height={56} rx={8} fill="#2a3442" />)}
      {[90, 410].map((x) => <g key={x}><circle cx={x} cy={552} r={32} fill="#1f1f24" /><circle cx={x} cy={552} r={12} fill="#9a9aa2" /></g>)}
    </g>
    {[220, 300].map((x, i) => <Guy key={i} x={x} y={600} s={1.1} face={1} {...YOU} top={i ? '#7a8f5f' : '#5a6f8f'} hair={i ? 'pony' : 'short'} walk={t * 6 + i} pose="walk" />)}
  </g>
);

const DatePark: React.FC<{t: number}> = ({t}) => (
  <g>
    <defs><linearGradient id="dusk2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3c3a6b" /><stop offset="1" stopColor="#d98c74" /></linearGradient></defs>
    <rect width={WW} height={WH} fill="url(#dusk2)" />
    <rect y={540} width={WW} height={WH - 540} fill="#4f6a45" />
    <ellipse cx={700} cy={330} rx={190} ry={170} fill="#ffe2a8" opacity={0.25} />
    <rect x={696} y={250} width={8} height={300} fill="#2f2f36" />
    <circle cx={700} cy={250} r={16} fill="#ffe7b8" />
    <rect x={250} y={500} width={300} height={12} rx={4} fill="#7a5a40" />
    <rect x={250} y={450} width={300} height={10} rx={4} fill="#7a5a40" />
    {[270, 520].map((x) => <rect key={x} x={x} y={512} width={10} height={40} fill="#5a4230" />)}
    <Guy x={340} y={552} pose="sit" face={1} s={1.1} {...YOU} />
    <Guy x={470} y={552} pose="sit" face={-1} s={1.1} top="#c98a5a" bottom="#3b3f55" hair="long" hairCol={P.hair.blond} skin={P.skin[1]} />
    <path transform={`translate(405 ${360 - 20 * Math.sin(t * 2)}) scale(1.2)`} d="M 0 12 C -24 -6 -16 -28 0 -16 C 16 -28 24 -6 0 12 Z" fill="#ff6f86" opacity={0.85} />
  </g>
);

const Bedroom: React.FC<{who: boolean; t: number; lamp?: number; grey?: boolean}> = ({who, t, lamp = 0, grey}) => (
  <Room wall={grey ? '#4a4d55' : '#2c3550'} floor={grey ? '#3a3c42' : '#232a40'} floorY={590}>
    <Window x={600} y={110} w={200} h={220} mode="night" t={t} />
    <rect x={150} y={150} width={90} height={70} fill="#f1e6d0" opacity={0.6} />
    <Bed x={140} y={590} w={420} who={who ? (MAMA as Person) : null} blanket={grey ? '#7b7f88' : '#7d8fb3'} />
    <Nightstand x={600} y={590} lamp={lamp} />
    <rect x={650} y={468} width={22} height={12} rx={3} fill="#111" />
  </Room>
);

const Hallway: React.FC<{t: number}> = ({t}) => (
  <Room wall="#3a332d" floor="#2a2420" floorY={580}>
    <ellipse cx={460} cy={600} rx={260} ry={40} fill="#ffd28a" opacity={0.25} />
    <Door x={110} y={580} w={130} h={280} col="#6e5a46" />
    <Door x={680} y={580} w={130} h={280} col="#6e5a46" open={0.15} />
    <rect x={380} y={230} width={70} height={90} fill="#c9b79c" opacity={0.7} />
    <rect x={470} y={250} width={60} height={60} fill="#b08f6e" opacity={0.7} />
    <CeilingLamp x={460} on={0.9 + 0.1 * Math.sin(t * 2)} len={110} />
  </Room>
);

const City: React.FC<{t: number}> = ({t}) => (
  <g>
    <defs><linearGradient id="dusk3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b3a66" /><stop offset="1" stopColor="#e39b7a" /></linearGradient></defs>
    <rect width={WW} height={WH} fill="url(#dusk3)" />
    {Array.from({length: 11}).map((_, i) => {
      const x = i * 86 - 20, h = 180 + random(`h${i}`) * 260;
      return (
        <g key={i}>
          <rect x={x} y={WH - h} width={80} height={h} fill={i % 2 ? '#2f2c45' : '#38345a'} />
          {Array.from({length: 10}).map((__, k) => random(`w${i}${k}`) > 0.55 && (
            <rect key={k} x={x + 10 + (k % 3) * 22} y={WH - h + 20 + Math.floor(k / 3) * 34} width={12} height={16} fill="#ffd98a" opacity={0.8} />
          ))}
        </g>
      );
    })}
    <rect x={560} y={300} width={110} height={130} fill="#ffe2a8" />
    <Guy x={615} y={430} s={0.9} face={-1} {...YOU} top="#2f3346" bottom="#2f3346" skin="#2f3346" hairCol="#2f3346" eyes={false} />
  </g>
);

const Kitchen: React.FC<{t: number}> = ({t}) => (
  <Room wall="#e8d9bf" floor="#b89a78">
    <Window x={560} y={110} w={240} h={220} mode="day" />
    <Table x={260} y={440} w={360} h={120} />
    <Chair x={250} y={560} face={1} />
    <Guy x={262} y={560} pose="sit" face={1} s={1.15} {...MAMA} armF={70} />
    <rect x={360} y={410} width={30} height={32} rx={5} fill="#f4efe6" />
    {[0, 1].map((i) => <path key={i} d={`M ${368 + i * 12} 400 q 6 -14 0 -26 q -6 -12 0 -24`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.4 + 0.3 * Math.sin(t * 3 + i)} />)}
  </Room>
);

const Goodbye: React.FC<{t: number; bubble: number}> = ({t, bubble}) => (
  <Room wall="#d8c7ab" floor="#9c7f63">
    <rect x={430} y={200} width={200} height={360} fill="#fff4dc" />
    <rect x={430} y={200} width={200} height={360} fill="#9cc3e6" opacity={0.5} />
    <rect x={600} y={200} width={30} height={360} fill="#8a6a4f" />
    <Guy x={360} y={590} s={1.25} face={1} {...MAMA} armF={150 + 15 * Math.sin(t * 5)} />
    <Guy x={540 + 40 * t} y={590} s={1.2} face={1} pose="walk" walk={t * 6} {...YOU} />
    <rect x={500 + 40 * t} y={420} width={30} height={46} rx={8} fill="#c4793f" />
    <Say x={330} y={300} text="Schreib mir, wenn du angekommen bist." p={bubble} size={17} />
  </Room>
);

export const V11: React.FC<{d: Data; sc: Script}> = ({d}) => {
  const Pp = d.phrases;
  const {i, lt, dur, t} = usePhraseScene(d, Pp.map((_, k) => k));
  const scene = () => {
    switch (i) {
      case 0:
        return <Shot t={lt} dur={dur}><PhoneBg t={t} /><Phone t={lt} msgs={[{text: LINE, at: 0.25}]} /></Shot>;
      case 1:
        return (
          <Shot t={lt} dur={dur} zoom={[1, 1.04]}>
            <PhoneBg t={t} />
            <Phone t={lt} msgs={Array.from({length: 6}, (_, k) => ({text: k % 2 ? 'Schreib mir, wenn du da bist' : 'Schreib mir, wenn du angekommen bist', at: k * 0.28}))} />
          </Shot>
        );
      case 2: return <Shot t={lt} dur={dur}><Party t={t} /></Shot>;
      case 3: return <Shot t={lt} dur={dur}><Trip t={lt} /></Shot>;
      case 4: return <Shot t={lt} dur={dur}><DatePark t={t} /></Shot>;
      case 5:
      case 6: {
        const typed = t < wt(d, 'schreibst') ? '' : 'Ja';
        const sent = t >= wt(d, 'Ja');
        return (
          <Shot t={i === 5 ? lt : lt + 2} dur={i === 5 ? dur : dur + 2} zoom={i === 5 ? [1, 1.05] : [1.25, 1.45]} ox={WW / 2 + 60} oy={WH / 2 - 60}>
            <PhoneBg t={t} />
            <Phone t={t} msgs={[{text: LINE, at: -1}, {text: 'Ja', me: true, at: sent ? wt(d, 'Ja') : 999}]} typed={sent ? '' : typed} />
          </Shot>
        );
      }
      case 7: return <Shot t={lt} dur={dur} zoom={[1.0, 1.08]} ox={240} oy={480}><Bedroom who t={t} /></Shot>;
      case 8: return <Shot t={lt} dur={dur}><Hallway t={t} /></Shot>;
      case 9: {
        const buzz = prog(lt, 0, 0.1) * (1 - prog(lt, 0.7, 0.8));
        return (
          <Shot t={lt} dur={dur} zoom={[1.1, 1.18]} ox={640} oy={420}>
            <Bedroom who t={t} lamp={1 - prog(lt, dur - 0.4, dur)} />
            <g transform="translate(661 455) scale(0.16)">
              <Phone t={t} msgs={[]} hand={false} buzz={buzz} glow={buzz} post={<g><rect x={-138} y={-266} width={276} height={532} rx={30} fill="#26304a" /><rect x={-120} y={-60} width={240} height={90} rx={20} fill="#f4f4f6" opacity={buzz > 0 ? 1 : 0.7} /></g>} />
            </g>
            {buzz > 0 && <ellipse cx={661} cy={455} rx={40} ry={26} fill="#9fc0ff" opacity={0.5 * buzz} />}
          </Shot>
        );
      }
      case 10: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]}><City t={t} /></Shot>;
      case 11: return <Shot t={lt} dur={dur} zoom={[1.0, 1.05]} wash="#8a8f99" washOp={0.3}><Bedroom who={false} t={t} grey /></Shot>;
      case 12: return <Shot t={lt} dur={dur} wash="#ffcf8a" washOp={0.12}><Kitchen t={t} /></Shot>;
      default: return <Shot t={lt} dur={dur} zoom={[1.0, 1.05]}><Goodbye t={lt} bubble={prog(t, wt(d, 'diesen', 1), wt(d, 'diesen', 1) + 0.3)} /></Shot>;
    }
  };
  return <LessonFrame d={d} scene={scene} />;
};

export {shade};
