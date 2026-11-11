import React from 'react';
import {random} from 'remotion';
import {clamp01, Data, prog, Script} from '../common';
import {Bed, Chair, Guy, LessonFrame, P, Person, Phone, Room, Say, Shot, Table, usePhraseScene, Window, WH, WW} from '../lesson';
import {PhoneBg} from './V11';

const YOU: Partial<Person> = {top: '#7a6a8f', bottom: '#3b4252', hair: 'pony', hairCol: P.hair.brown, skin: P.skin[0]};

const Calendar: React.FC<{t: number}> = ({t}) => (
  <Room wall="#b9b4ab" floor="#8c867c">
    <Window x={560} y={110} w={240} h={260} mode="rain" t={t} />
    <g transform="rotate(-2 280 300)">
      <rect x={150} y={150} width={260} height={300} rx={8} fill="#f6f3ec" />
      <rect x={150} y={150} width={260} height={70} rx={8} fill="#6b7f99" />
      <text x={280} y={198} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={30} fill="#fff">DIENSTAG</text>
      <text x={280} y={360} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={120} fill="#3a3a40">14</text>
    </g>
  </Room>
);

const Beach: React.FC<{t: number; tries: number; flash: number}> = ({t, tries, flash}) => {
  const k = Math.floor(t * 5);
  return (
    <g>
      <rect width={WW} height={WH} fill="#8ec5ea" />
      <circle cx={760} cy={130} r={60} fill="#ffe08a" />
      <rect y={360} width={WW} height={140} fill="#3f8fc4" />
      {[0, 1, 2].map((j) => <path key={j} d={`M 0 ${390 + j * 40} q 115 -12 230 0 t 230 0 t 230 0 t 230 0`} stroke="#bfe3f7" strokeWidth={3} fill="none" opacity={0.6} />)}
      <rect y={500} width={WW} height={WH - 500} fill="#ecd3a2" />
      <Guy x={330} y={590} s={1.3} face={1} {...YOU} top="#f2f2f2" bottom="#e07a5f" armF={[160, 30, 120, 60][k % 4]} armB={[20, 150, 60, 110][k % 4]} lean={[0, -4, 3, -2][k % 4]} />
      <Guy x={640} y={600} s={1.3} face={-1} top="#5a8f8f" bottom="#3b4252" hair="short" hairCol={P.hair.black} skin={P.skin[2]} armF={95} />
      <rect x={545} y={420} width={22} height={38} rx={4} fill="#1f2024" />
      <rect width={WW} height={WH} fill="#fff" opacity={0.6 * flash} />
      {tries > 0 && <Say x={460} y={150} text={`Versuch ${tries}`} size={26} />}
    </g>
  );
};

const Post: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect x={-138} y={-266} width={276} height={532} rx={30} fill="#fff" />
    <circle cx={-104} cy={-230} r={16} fill="#e0a985" />
    <text x={-80} y={-224} fontFamily="Inter" fontWeight={700} fontSize={17} fill={P.ink}>lea.und.tim</text>
    <rect x={-138} y={-200} width={276} height={276} fill="#f2c2a0" />
    <circle cx={60} cy={-150} r={30} fill="#ffe7b0" />
    <rect x={-138} y={-20} width={276} height={96} fill="#e8a27f" />
    <Guy x={-30} y={70} s={0.9} face={1} top="#5a6f8f" bottom="#3b4252" hair="short" hairCol={P.hair.black} armF={60} />
    <Guy x={30} y={70} s={0.9} face={-1} top="#d97a7a" bottom="#3b4252" hair="long" hairCol={P.hair.blond} skin={P.skin[1]} armF={60} />
    <path transform="translate(0 -110) scale(1.2)" d="M 0 12 C -24 -6 -16 -28 0 -16 C 16 -28 24 -6 0 12 Z" fill="#ff5a6e" />
    <path transform="translate(-112 104) scale(0.8)" d="M 0 12 C -24 -6 -16 -28 0 -16 C 16 -28 24 -6 0 12 Z" fill="#ff3b5c" />
    <text x={-80} y={112} fontFamily="Inter" fontWeight={700} fontSize={16} fill={P.ink}>{`${(1200 + Math.floor(t * 300)).toLocaleString('de-DE')} „Gefällt mir“`}</text>
    <text x={-122} y={146} fontFamily="Inter" fontSize={17} fill={P.ink}>1 Jahr mit dir ❤️ #perfekt</text>
  </g>
);

const Car: React.FC<{t: number}> = ({t}) => (
  <g>
    <defs><linearGradient id="cdusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b5a8e" /><stop offset="1" stopColor="#e0a37f" /></linearGradient></defs>
    <rect width={WW} height={WH} fill="url(#cdusk)" />
    {Array.from({length: 6}).map((_, i) => {
      const x = ((i * 200 - t * 300) % 1200 + 1200) % 1200 - 140;
      return <rect key={i} x={x} y={360 - 60 * random(`hb${i}`)} width={110} height={200 + 60 * random(`hb${i}`)} fill="#4a4870" opacity={0.6} />;
    })}
    <rect y={560} width={WW} height={WH - 560} fill="#3c3c44" />
    {Array.from({length: 6}).map((_, i) => <rect key={i} x={((i * 180 - t * 500) % 1080 + 1080) % 1080 - 80} y={620} width={80} height={8} fill="#e8e2d0" />)}
    <g transform={`translate(0 ${2 * Math.sin(t * 20)})`}>
      <path d="M 220 540 L 220 470 Q 230 440 270 436 L 340 380 Q 360 366 400 366 L 560 366 Q 600 366 620 386 L 680 436 Q 720 440 730 470 L 730 540 Z" fill="#c9433f" />
      <path d="M 350 436 L 400 388 L 470 388 L 470 436 Z M 490 436 L 490 388 L 560 388 Q 590 390 610 436 Z" fill="#b8d4ea" />
      <circle cx={430} cy={414} r={16} fill={P.skin[0]} /><path d="M 414 410 A 16 17 0 0 1 446 406 Q 430 392 414 404 Z" fill={P.hair.black} />
      <circle cx={530} cy={414} r={16} fill={P.skin[1]} /><path d="M 514 410 A 16 17 0 0 1 546 406 Q 552 430 546 438 L 540 412 Z" fill={P.hair.blond} />
      {[300, 650].map((x) => <g key={x}><circle cx={x} cy={545} r={36} fill="#1f1f24" /><circle cx={x} cy={545} r={14} fill="#8a8a92" /></g>)}
    </g>
    {[0, 1].map((k) => (
      <path key={k} transform={`translate(${430 + k * 100} ${300 - 6 * Math.sin(t * 9 + k)})`} d="M -30 0 L -15 -16 L 0 0 L 15 -16 L 30 0" stroke={k ? '#ffd25f' : '#ff6b5f'} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </g>
);

const Gym: React.FC<{t: number; dark?: boolean}> = ({t, dark}) => {
  const lift = (Math.sin(t * 3) + 1) / 2;
  return (
    <Room wall={dark ? '#2a3044' : '#d9dde3'} floor={dark ? '#1f2433' : '#7a7f89'}>
      <rect x={80} y={120} width={460} height={300} fill={dark ? '#39415a' : '#eef1f5'} stroke={dark ? '#4a5272' : '#c4c9d1'} strokeWidth={6} />
      <text x={700} y={130} fontFamily="JetBrains Mono" fontWeight={700} fontSize={30} fill={dark ? '#8fa3d6' : '#6b7280'}>{dark ? '06:00' : ''}</text>
      <Guy x={330} y={590} s={1.35} face={1} top={dark ? '#3a4a6b' : '#c94f4f'} bottom="#2f3346" hair="short" hairCol={P.hair.black} skin={P.skin[1]} armF={170} armB={170} />
      <g transform={`translate(0 ${-20 * lift})`}>
        <rect x={190} y={290} width={300} height={10} rx={4} fill="#3a3a40" />
        {[200, 214, 464, 478].map((x) => <rect key={x} x={x - 6} y={262} width={12} height={66} rx={3} fill="#2a2a30" />)}
      </g>
      <rect x={680} y={360} width={6} height={200} fill="#2a2a30" transform="rotate(-8 683 560)" />
      <rect x={700} y={360} width={6} height={200} fill="#2a2a30" transform="rotate(8 703 560)" />
      <rect x={672} y={330} width={44} height={60} rx={6} fill="#1f2024" />
      <circle cx={694} cy={346} r={6} fill="#ff4b4b" opacity={0.5 + 0.5 * (Math.floor(t * 2) % 2)} />
    </Room>
  );
};

const Card: React.FC<{x: number; y: number; kind: number; op: number}> = ({x, y, kind, op}) => (
  <g transform={`translate(${x} ${y})`} opacity={op}>
    <rect x={-70} y={-80} width={140} height={160} rx={10} fill="#fff" />
    <rect x={-62} y={-72} width={124} height={110} rx={6} fill={['#8ec5ea', '#f2c2a0', '#d9dde3'][kind]} />
    {kind === 0 && <><circle cx={30} cy={-46} r={14} fill="#ffe08a" /><rect x={-62} y={-10} width={124} height={48} fill="#ecd3a2" /></>}
    {kind === 1 && <path transform="translate(0 -20) scale(1.2)" d="M 0 12 C -24 -6 -16 -28 0 -16 C 16 -28 24 -6 0 12 Z" fill="#ff5a6e" />}
    {kind === 2 && <rect x={-40} y={-26} width={80} height={8} rx={3} fill="#3a3a40" />}
    <rect x={-60} y={48} width={70} height={8} rx={4} fill="#d4d4d8" />
    <rect x={-60} y={62} width={100} height={8} rx={4} fill="#e4e4e8" />
  </g>
);

const BedScroll: React.FC<{t: number; lt: number}> = ({t, lt}) => (
  <Room wall="#2c3550" floor="#232a40" floorY={600}>
    <Bed x={160} y={600} w={440} who={YOU as Person} blanket="#55638a" />
    <ellipse cx={300} cy={470} rx={160} ry={110} fill="#9fb6ff" opacity={0.18} />
    <rect x={270} y={455} width={26} height={40} rx={5} fill="#c9d6ff" transform="rotate(-20 283 475)" />
    {[0, 1, 2, 0, 1, 2].map((k, i) => {
      const y = 360 - ((lt * 90 + i * 140) % 520) + 160;
      return <Card key={i} x={520 + (i % 2) * 170} y={y} kind={k} op={clamp01(1 - Math.abs(y - 260) / 260)} />;
    })}
  </Room>
);

const RainyDesk: React.FC<{t: number}> = ({t}) => (
  <Room wall="#a9a69f" floor="#7d7a73">
    <Window x={560} y={100} w={250} h={260} mode="rain" t={t} />
    <rect x={120} y={140} width={150} height={170} rx={6} fill="#f6f3ec" />
    <rect x={120} y={140} width={150} height={40} rx={6} fill="#6b7f99" />
    <text x={195} y={168} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={18} fill="#fff">DIENSTAG</text>
    <Table x={260} y={450} w={320} h={110} col="#8a7a66" />
    <Chair x={320} y={560} face={1} />
    <Guy x={332} y={560} pose="sit" face={1} s={1.15} {...YOU} armF={70} />
    <rect x={420} y={424} width={90} height={26} rx={4} fill="#f4f4f2" />
    <path d="M 520 440 a 26 14 0 0 0 52 0 Z" fill="#e8e3d6" />
  </Room>
);

const Friends: React.FC<{t: number}> = ({t}) => (
  <g>
    <defs><linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4c98a" /><stop offset="1" stopColor="#e89a6a" /></linearGradient></defs>
    <rect width={WW} height={WH} fill="url(#gold)" />
    {Array.from({length: 7}).map((_, i) => <rect key={i} x={i * 140 - 30} y={240 - 50 * random(`fb${i}`)} width={120} height={330} fill="#d58a6a" opacity={0.5} />)}
    <rect y={560} width={WW} height={WH - 560} fill="#9a7f6e" />
    <Guy x={380} y={600} s={1.3} face={1} pose="walk" walk={t * 6} {...YOU} lean={-4 + 4 * Math.sin(t * 8)} armF={110} />
    <Guy x={490} y={600} s={1.3} face={-1} pose="walk" walk={t * 6 + 1} top="#4f7f6a" bottom="#3b4252" hair="curly" hairCol={P.hair.black} skin={P.skin[3]} lean={4 * Math.sin(t * 8 + 1)} />
    <Say x={440} y={300} text="haha 😂" size={22} p={0.5 + 0.5 * Math.abs(Math.sin(t * 2))} />
  </g>
);

const FilmStrip: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect width={WW} height={WH} fill="#1d1f26" />
    <g transform={`translate(${-((t * 140) % 260)} 0)`}>
      <rect x={-40} y={200} width={WW + 400} height={320} fill="#0f1014" />
      {Array.from({length: 40}).map((_, i) => <rect key={i} x={-30 + i * 36} y={214} width={18} height={22} rx={3} fill="#e8e3d6" opacity={0.8} />)}
      {Array.from({length: 40}).map((_, i) => <rect key={i} x={-30 + i * 36} y={484} width={18} height={22} rx={3} fill="#e8e3d6" opacity={0.8} />)}
      {Array.from({length: 6}).map((_, i) => (
        <g key={i} transform={`translate(${i * 260} 0)`}>
          <rect x={0} y={250} width={230} height={220} fill={['#a9a69f', '#8ec5ea', '#f4c98a', '#2c3550', '#d9dde3', '#e8d9bf'][i]} />
          <Guy x={115} y={455} s={0.75} face={1} {...YOU} />
        </g>
      ))}
    </g>
  </g>
);

export const V14: React.FC<{d: Data; sc: Script}> = ({d}) => {
  const Pp = d.phrases;
  const {i, lt, dur, t} = usePhraseScene(d, Pp.map((_, k) => k));
  const scene = () => {
    switch (i) {
      case 0: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]} ox={280} oy={300}><Calendar t={t} /></Shot>;
      case 1: return <Shot t={lt} dur={dur}><Beach t={t} tries={0} flash={prog(lt, 0.4, 0.45) * (1 - prog(lt, 0.45, 0.65))} /></Shot>;
      case 2: {
        const n = Math.min(47, 30 + Math.floor(lt * 14));
        const fl = Math.max(0, 1 - ((lt * 5) % 1) * 4);
        return <Shot t={lt} dur={dur} zoom={[1.05, 1.1]}><Beach t={t} tries={n} flash={fl * 0.5} /></Shot>;
      }
      case 3: return <Shot t={lt} dur={dur}><PhoneBg t={t} tint="#2a2236" /><Phone t={lt} msgs={[]} post={<Post t={lt} />} /></Shot>;
      case 4: return <Shot t={lt} dur={dur}><Car t={t} /></Shot>;
      case 5: return <Shot t={lt} dur={dur}><Gym t={t} /></Shot>;
      case 6: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]}><Gym t={t} dark /></Shot>;
      case 7: return <Shot t={lt} dur={dur} zoom={[1.0, 1.05]}><BedScroll t={t} lt={lt} /></Shot>;
      case 8: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]} wash="#7d8796" washOp={0.25}><RainyDesk t={t} /></Shot>;
      case 9: return <Shot t={lt} dur={dur} wash="#ffcf8a" washOp={0.1}><Friends t={t} /></Shot>;
      case 10: return <Shot t={lt} dur={dur}><FilmStrip t={t} /></Shot>;
      default: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]} ox={280} oy={300}><Calendar t={t} /></Shot>;
    }
  };
  return <LessonFrame d={d} scene={scene} />;
};
