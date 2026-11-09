import React from 'react';
import {random} from 'remotion';
import {Data, prog, Script, wt} from '../common';
import {Bed, Chair, Guy, LessonFrame, P, Person, Room, Say, Shot, Table, usePhraseScene, Window, WH, WW} from '../lesson';
import {Nightstand} from './V11';

const YOU: Partial<Person> = {top: '#6a7f6a', bottom: '#3b4252', hair: 'short', hairCol: P.hair.brown, skin: P.skin[0]};
const KID: Partial<Person> = {kid: true, top: '#e0a33c', bottom: '#4d6a8f', hair: 'short', hairCol: P.hair.brown, skin: P.skin[0]};

const Drawing: React.FC<{x: number; y: number; s?: number; p?: number}> = ({x, y, s = 1, p = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-160} y={-120} width={320} height={240} fill="#fbf8f1" />
    <circle cx={110} cy={-70} r={28} fill="none" stroke="#f0b33c" strokeWidth={6} opacity={p} />
    {Array.from({length: 8}).map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <line key={i} x1={110 + Math.cos(a) * 36} y1={-70 + Math.sin(a) * 36} x2={110 + Math.cos(a) * 50} y2={-70 + Math.sin(a) * 50} stroke="#f0b33c" strokeWidth={5} opacity={p} />;
    })}
    <g stroke="#3b5ea8" strokeWidth={6} fill="none" strokeLinecap="round" opacity={p}>
      <circle cx={-40} cy={-40} r={22} />
      <path d="M -40 -18 L -40 50 M -40 0 L -80 -30 M -40 0 L 0 -30 M -40 50 L -64 100 M -40 50 L -16 100" />
    </g>
    <path d="M -100 -100 l 8 18 l 20 2 l -15 13 l 5 19 l -18 -10 l -18 10 l 5 -19 l -15 -13 l 20 -2 Z" fill="#e5484d" opacity={p} />
    <text x={20} y={80} fontFamily="DejaVu Sans" fontWeight={700} fontSize={26} fill="#e5484d" opacity={p}>ICH!</text>
  </g>
);

const Yard: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect width={WW} height={WH} fill="#a9c8e2" />
    <rect x={0} y={170} width={WW} height={400} fill="#d9b48f" />
    {Array.from({length: 10}).map((_, i) => <rect key={i} x={40 + (i % 5) * 180} y={210 + Math.floor(i / 5) * 140} width={90} height={90} fill="#f4e6c8" />)}
    <rect y={560} width={WW} height={WH - 560} fill="#9a9a96" />
    <Guy x={200} y={600} {...KID} bag="#c4473f" face={1} s={1.15} />
    {[520, 620, 720].map((x, i) => (
      <Guy key={i} x={x} y={600} s={1.5} face={-1} top={['#5a6f8f', '#8f5a6a', '#4f6f5a'][i]} bottom="#33363f" hair={(['short', 'long', 'pony'] as const)[i]}
        hairCol={[P.hair.black, P.hair.blond, P.hair.red][i]} skin={P.skin[i % 3]} lean={2 * Math.sin(t * 2 + i)} />
    ))}
  </g>
);

const Night: React.FC<{t: number; children?: React.ReactNode; lamp?: number}> = ({t, children, lamp = 0}) => (
  <Room wall="#2c3550" floor="#232a40" floorY={590}>
    <Window x={610} y={110} w={200} h={220} mode="night" t={t} />
    <Nightstand x={600} y={590} lamp={lamp} />
    {children}
  </Room>
);

const Fridge: React.FC<{strike: number}> = ({strike}) => (
  <Room wall="#e9dcc4" floor="#b89a78">
    <rect x={300} y={90} width={320} height={480} rx={18} fill="#f4f4f2" />
    <rect x={300} y={250} width={320} height={6} fill="#d9d9d6" />
    <rect x={580} y={140} width={10} height={70} rx={4} fill="#c9c9c6" />
    <rect x={580} y={290} width={10} height={90} rx={4} fill="#c9c9c6" />
    <g transform="rotate(-3 460 380)">
      <rect x={350} y={280} width={220} height={200} fill="#fff7c9" />
      <circle cx={460} cy={286} r={8} fill="#e5484d" />
      <text x={370} y={322} fontFamily="DejaVu Sans" fontWeight={700} fontSize={22} fill="#4a3b2a">REGELN</text>
      {['20 Uhr ins Bett', 'Kein Eis vorm', 'Essen', 'Erst Hausaufgaben'].map((l, i) => (
        <text key={i} x={370} y={360 + i * 30} fontFamily="DejaVu Sans" fontSize={18} fill="#4a3b2a">{(i === 2 ? '  ' : '• ') + l}</text>
      ))}
      {[0, 1, 3].map((i, k) => <line key={k} x1={366} y1={354 + i * 30} x2={366 + 190 * prog(strike, k * 0.3, k * 0.3 + 0.3)} y2={354 + i * 30} stroke="#e5484d" strokeWidth={5} strokeLinecap="round" />)}
    </g>
  </Room>
);

export const V12: React.FC<{d: Data; sc: Script}> = ({d}) => {
  const Pp = d.phrases;
  const {i, lt, dur, t} = usePhraseScene(d, Pp.map((_, k) => k));
  const scene = () => {
    switch (i) {
      case 0:
        return (
          <Shot t={lt} dur={dur} wash="#ffcf8a" washOp={0.12}>
            <Room wall="#e6d4b8" floor="#a88a6c">
              <Window x={80} y={110} w={200} h={220} mode="dusk" />
              <Guy x={380} y={590} {...KID} face={1} s={1.25} armF={60} />
              <Guy x={560} y={590} {...YOU} face={-1} s={1.45} />
              <path transform={`translate(380 ${300 - 10 * Math.sin(t * 2)})`} d="M 0 -20 l 6 13 l 15 1 l -11 10 l 4 14 l -14 -8 l -14 8 l 4 -14 l -11 -10 l 15 -1 Z" fill="#f0b33c" />
            </Room>
          </Shot>
        );
      case 1: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]} ox={300}><Yard t={t} /></Shot>;
      case 2:
        return (
          <Shot t={lt} dur={dur}>
            <Night t={t} lamp={1}>
              <Bed x={120} y={590} w={420} />
              <Guy x={300} y={540} pose="sit" face={1} s={1.15} {...YOU} armF={70} />
              <rect x={360} y={470} width={70} height={46} rx={4} fill="#c9d6ff" />
              <ellipse cx={395} cy={480} rx={80} ry={60} fill="#9fb6ff" opacity={0.25} />
              <text x={660} y={473} fontFamily="JetBrains Mono" fontWeight={700} fontSize={22} fill="#ff6b5f">{`02:${String(14 + Math.floor(lt * 3)).padStart(2, '0')}`}</text>
            </Night>
          </Shot>
        );
      case 3:
        return (
          <Shot t={lt} dur={dur} wash="#ffd88a" washOp={0.1}>
            <Room wall="#e8d9bf" floor="#b89a78">
              <Window x={560} y={100} w={240} h={230} mode="day" />
              <Table x={240} y={440} w={380} h={120} />
              <Chair x={250} y={560} face={1} />
              <Guy x={262} y={560} pose="sit" face={1} s={1.15} {...YOU} armF={75} />
              <path d="M 400 438 L 560 438 L 540 418 L 420 418 Z" fill="#e8c27c" />
              <g transform="translate(470 428)">
                <path d="M -60 4 L 0 -26 L 60 4 Z" fill="#f2b24a" />
                {[-20, 10, 28].map((x, k) => <circle key={k} cx={x} cy={-6 + (k % 2) * 4} r={6} fill="#c8432f" />)}
              </g>
              <text x={120} y={90} fontFamily="JetBrains Mono" fontWeight={700} fontSize={26} fill="#6b5a46">07:30</text>
            </Room>
          </Shot>
        );
      case 4: return <Shot t={lt} dur={dur} zoom={[1.05, 1.15]} oy={380}><Fridge strike={prog(lt, 0.1, dur, (x) => x)} /></Shot>;
      case 5:
        return (
          <Shot t={lt} dur={dur} zoom={[1.0, 1.08]} ox={260} oy={480} wash="#4a5a8a" washOp={0.25}>
            <Night t={t}>
              <Bed x={130} y={590} w={420} who={YOU as Person} blanket="#55638a" />
              {['nicht gut genug', 'die anderen sind weiter', 'was wird aus mir?'].map((s, k) => (
                <Say key={k} x={240 + k * 120} y={300 - k * 60} text={s} dark size={21} p={0.75 * prog(lt, 0.4 + k * 0.5, 0.8 + k * 0.5)} />
              ))}
            </Night>
          </Shot>
        );
      case 6:
        return (
          <Shot t={lt} dur={dur} wash="#ffcf8a" washOp={0.15}>
            <Room wall="#d9c4a2" floor="#a88a6c">
              <ellipse cx={460} cy={360} rx={300} ry={220} fill="#ffe2a8" opacity={0.3} />
              <Table x={300} y={430} w={360} h={130} />
              <Chair x={300} y={560} face={1} />
              <Guy x={312} y={560} pose="sit" {...KID} face={1} s={1.25} armF={80 + 10 * Math.sin(t * 9)} />
              <g transform="translate(500 425) scale(0.32) skewX(-20)"><Drawing x={0} y={0} p={prog(lt, 0.2, dur)} /></g>
              {['#e5484d', '#3b5ea8', '#f0b33c'].map((c, k) => <rect key={k} x={590 + k * 14} y={418} width={8} height={12} rx={2} fill={c} />)}
            </Room>
          </Shot>
        );
      case 7:
        return (
          <Shot t={lt} dur={dur} wash="#ffd88a" washOp={0.1}>
            <Room wall="#cfe0ef" floor="#a8b7c4">
              <Window x={600} y={100} w={220} h={220} mode="day" />
              <Bed x={180} y={590} w={400} blanket="#e0a33c" />
              <Guy x={380} y={530} {...KID} face={1} s={1.35} cape="#d6453d" capeWave={t * 5} armF={160} armB={150} lean={-4} />
              {Array.from({length: 5}).map((_, k) => <circle key={k} cx={300 + k * 60} cy={190 + 20 * Math.sin(t * 3 + k)} r={4} fill="#f0b33c" />)}
            </Room>
          </Shot>
        );
      case 8:
        return <Shot t={lt} dur={dur} zoom={[1.0, 1.1]}><rect width={WW} height={WH} fill="#c9a77f" /><Drawing x={WW / 2} y={WH / 2} s={1.7} /></Shot>;
      default:
        return (
          <Shot t={lt} dur={dur} zoom={[1.0, 1.08]} ox={330} oy={430} wash="#ffcf8a" washOp={0.1}>
            <Night t={t} lamp={1}>
              <Bed x={120} y={590} w={420} />
              <Guy x={300} y={540} pose="sit" face={1} s={1.15} {...YOU} armF={60} />
              <g transform="translate(400 470) rotate(-8) scale(0.28)"><Drawing x={0} y={0} /></g>
              <ellipse cx={400} cy={470} rx={70} ry={50} fill="#ffe2a8" opacity={0.25 + 0.1 * Math.sin(t * 3)} />
            </Night>
          </Shot>
        );
    }
  };
  return <LessonFrame d={d} scene={scene} />;
};

export {random, wt};
