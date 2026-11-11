import React from 'react';
import {Data, prog, Script, wt} from '../common';
import {Chair, Door, Guy, LessonFrame, P, Person, Phone, Room, Say, Shot, Table, usePhraseScene, WH, WW} from '../lesson';
import {PhoneBg} from './V11';

const YOU: Partial<Person> = {top: '#5a7f8f', bottom: '#3b4252', hair: 'short', hairCol: P.hair.brown, skin: P.skin[0]};
const FRIEND: Partial<Person> = {top: '#d9a441', bottom: '#4a4a55', hair: 'curly', hairCol: P.hair.black, skin: P.skin[2]};

const TestPaper: React.FC<{fade: number}> = ({fade}) => (
  <g>
    <rect width={WW} height={WH} fill="#8a6a4f" />
    <g transform="rotate(-4 460 360)">
      <rect x={230} y={70} width={460} height={600} fill="#fbf9f4" />
      <text x={260} y={130} fontFamily="Inter" fontWeight={800} fontSize={30} fill="#3a3a40">MATHEARBEIT</text>
      {Array.from({length: 9}).map((_, i) => (
        <g key={i}>
          <text x={260} y={190 + i * 50} fontFamily="DejaVu Sans" fontSize={20} fill="#4a5a7a">{`${i + 1})`}</text>
          <rect x={300} y={176 + i * 50} width={120 + ((i * 53) % 200)} height={8} rx={4} fill="#9aa6bd" />
        </g>
      ))}
      <g opacity={1 - 0.85 * fade}>
        <circle cx={600} cy={130} r={50} fill="none" stroke="#d63c3c" strokeWidth={6} />
        <text x={600} y={152} textAnchor="middle" fontFamily="DejaVu Serif" fontWeight={700} fontSize={56} fill="#d63c3c">4-</text>
      </g>
    </g>
  </g>
);

const Classroom: React.FC<{t: number; children?: React.ReactNode; board?: string}> = ({t, children, board = 'BIO-KLAUSUR'}) => (
  <Room wall="#d9cdb2" floor="#a88a6c">
    <rect x={150} y={80} width={520} height={230} fill="#2f4a3c" stroke="#8a6a4f" strokeWidth={10} />
    <text x={180} y={130} fontFamily="DejaVu Sans" fontWeight={700} fontSize={30} fill="#e8f0e8" opacity={0.9}>{board}</text>
    <circle cx={540} cy={220} r={56} fill="none" stroke="#e8f0e8" strokeWidth={4} opacity={0.8} />
    <circle cx={540} cy={220} r={18} fill="none" stroke="#e8f0e8" strokeWidth={4} opacity={0.8} />
    {[0, 1, 2, 3].map((k) => <circle key={k} cx={510 + k * 18} cy={190 + (k % 2) * 40} r={4} fill="#e8f0e8" opacity={0.8} />)}
    <circle cx={780} cy={130} r={40} fill="#f4efe6" stroke="#6b5a46" strokeWidth={5} />
    <line x1={780} y1={130} x2={780 + 26 * Math.sin(t * 0.8)} y2={130 - 26 * Math.cos(t * 0.8)} stroke="#2b2a2e" strokeWidth={4} />
    {children}
  </Room>
);

const Exam: React.FC<{t: number}> = ({t}) => (
  <Classroom t={t}>
    {[150, 460].map((x, k) => (
      <g key={x}>
        <Table x={x} y={450} w={260} h={110} />
        <Chair x={x + 40} y={560} face={1} />
        <Guy x={x + 52} y={560} pose="sit" face={1} s={1.1} {...(k ? FRIEND : YOU)} armF={78 + 6 * Math.sin(t * 10 + k)} />
        <rect x={x + 120} y={442} width={60} height={8} fill="#fbf9f4" />
      </g>
    ))}
  </Classroom>
);

const DeskPair: React.FC<{t: number}> = ({t}) => (
  <Classroom t={t} board="">
    <Table x={260} y={450} w={420} h={110} />
    <Chair x={330} y={560} face={1} />
    <Chair x={560} y={560} face={-1} />
    <Guy x={342} y={560} pose="sit" face={1} s={1.2} {...YOU} armF={70} />
    <Guy x={548} y={560} pose="sit" face={-1} s={1.2} {...FRIEND} armF={70} lean={-3 * Math.sin(t * 2)} />
    <ellipse cx={450} cy={380} rx={260} ry={180} fill="#ffe2a8" opacity={0.18} />
  </Classroom>
);

const Bench: React.FC<{t: number; give: number}> = ({t, give}) => (
  <g>
    <rect width={WW} height={WH} fill="#a9c8e2" />
    <rect x={0} y={160} width={WW} height={400} fill="#c9a27e" />
    {Array.from({length: 5}).map((_, i) => <rect key={i} x={40 + i * 180} y={200} width={100} height={100} fill="#f4e6c8" />)}
    <rect x={720} y={300} width={22} height={260} fill="#6b4f3a" />
    <circle cx={730} cy={270} r={90} fill="#6f9a5b" />
    <rect y={560} width={WW} height={WH - 560} fill="#9a9a96" />
    <rect x={250} y={500} width={360} height={12} rx={4} fill="#7a5a40" />
    {[270, 580].map((x) => <rect key={x} x={x} y={512} width={10} height={48} fill="#5a4230" />)}
    <Guy x={330} y={560} pose="sit" face={1} s={1.15} {...YOU} armF={60} />
    <Guy x={520} y={560} pose="sit" face={-1} s={1.15} {...FRIEND} armF={60 + 30 * give} />
    <g transform={`translate(${470 - 70 * give} ${430 - 10 * give})`}>
      <ellipse cx={0} cy={0} rx={22} ry={14} fill="#c98a4a" />
      <path d="M -18 -2 q 18 -8 36 0" stroke="#e6b47a" strokeWidth={3} fill="none" />
    </g>
  </g>
);

const OutsideDoor: React.FC<{t: number}> = ({t}) => (
  <Room wall="#cfc5b0" floor="#8f8a80">
    <Door x={380} y={560} w={150} h={300} col="#7a6a5a" sign="9b" />
    {[180, 690].map((x) => <rect key={x} x={x - 50} y={200} width={100} height={120} fill="#9cc3e6" />)}
    <Guy x={300} y={600} s={1.3} face={1} {...YOU} lean={-6 + 6 * Math.abs(Math.sin(t * 9))} armF={120} />
    <Guy x={620} y={600} s={1.3} face={-1} {...FRIEND} lean={6 - 6 * Math.abs(Math.sin(t * 9 + 1))} armF={130} />
    <Say x={460} y={220} text="hahaha" size={24} p={0.6 + 0.4 * Math.abs(Math.sin(t * 4))} />
  </Room>
);

const Zeugnis: React.FC = () => (
  <g>
    <rect width={WW} height={WH} fill="#6b5240" />
    <g transform="rotate(2 460 360)">
      <rect x={230} y={60} width={460} height={620} fill="#f6f1e4" />
      <text x={460} y={130} textAnchor="middle" fontFamily="DejaVu Serif" fontWeight={700} fontSize={40} fill="#3a3a40">ZEUGNIS</text>
      {[['Deutsch', '2'], ['Mathematik', '4'], ['Englisch', '2'], ['Biologie', '3'], ['Geschichte', '2'], ['Sport', '1']].map(([f, n], i) => (
        <g key={f}>
          <text x={270} y={210 + i * 60} fontFamily="DejaVu Serif" fontSize={24} fill="#3a3a40">{f}</text>
          <line x1={430} y1={214 + i * 60} x2={600} y2={214 + i * 60} stroke="#b9b2a2" strokeDasharray="4 6" />
          <text x={640} y={210 + i * 60} textAnchor="middle" fontFamily="DejaVu Serif" fontWeight={700} fontSize={26} fill="#3a3a40">{n}</text>
        </g>
      ))}
    </g>
  </g>
);

const ClassPhoto: React.FC<{t: number; pin?: number}> = ({t, pin = 0}) => (
  <g>
    <rect width={WW} height={WH} fill={pin ? '#b48b5e' : '#6b5240'} />
    {pin > 0 && <ellipse cx={460} cy={300} rx={340} ry={260} fill="#ffe2a8" opacity={0.25} />}
    <g transform={`translate(460 ${360 - 40 * (1 - pin)}) rotate(${-3 + 3 * pin})`}>
      <rect x={-300} y={-210} width={600} height={420} fill="#fbf9f4" />
      <rect x={-280} y={-190} width={560} height={330} fill="#a9c8e2" />
      <rect x={-280} y={30} width={560} height={110} fill="#c9a27e" />
      {Array.from({length: 9}).map((_, k) => (
        <Guy key={k} x={-240 + k * 60} y={120 + (k % 2) * 6} s={0.75} face={k % 2 ? -1 : 1}
          top={['#5a7f8f', '#d9a441', '#b86b8a', '#6a7f6a', '#7a6a8f'][k % 5]} bottom="#3b4252"
          hair={(['short', 'curly', 'long', 'pony', 'short'] as const)[k % 5]} hairCol={[P.hair.brown, P.hair.black, P.hair.blond, P.hair.red][k % 4]} skin={P.skin[k % 4]} armF={k % 3 ? 10 : 140} />
      ))}
      <text x={0} y={186} textAnchor="middle" fontFamily="DejaVu Sans" fontSize={22} fill="#4a4a50">Klasse 9b</text>
      {pin > 0 && <circle cx={0} cy={-200} r={12} fill="#e5484d" />}
    </g>
  </g>
);

export const V15: React.FC<{d: Data; sc: Script}> = ({d}) => {
  const Pp = d.phrases;
  const {i, lt, dur, t} = usePhraseScene(d, Pp.map((_, k) => k));
  const scene = () => {
    switch (i) {
      case 0: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]} ox={600} oy={140}><TestPaper fade={prog(lt, 0.4, dur, (x) => x) * 0.6} /></Shot>;
      case 1: return <Shot t={lt} dur={dur} zoom={[1.0, 1.05]}><Exam t={t} /></Shot>;
      case 2: return <Shot t={lt} dur={dur} zoom={[1.0, 1.08]} oy={420} wash="#ffcf8a" washOp={0.12}><DeskPair t={t} /></Shot>;
      case 3: return <Shot t={lt} dur={dur}><Bench t={t} give={prog(lt, 0.3, 1.2)} /></Shot>;
      case 4: return <Shot t={lt} dur={dur} zoom={[1.0, 1.05]}><OutsideDoor t={t} /></Shot>;
      case 5: return <Shot t={lt} dur={dur}><PhoneBg t={t} /><Phone t={t} name="Jule" msgs={[{text: 'Morgen ist es so weit 😬', me: true, at: -1}, {text: 'Du schaffst das 💪', at: wt(d, 'schaffst')}]} /></Shot>;
      case 6: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]}><Zeugnis /></Shot>;
      case 7: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]}><ClassPhoto t={t} /></Shot>;
      case 8: return <Shot t={lt} dur={dur} zoom={[1.0, 1.05]}><ClassPhoto t={t} pin={prog(lt, 0, 0.6)} /></Shot>;
      default: return <Shot t={lt} dur={dur} zoom={[1.0, 1.06]} ox={600} oy={140}><TestPaper fade={prog(lt, 0.2, dur, (x) => x) * 0.6} /></Shot>;
    }
  };
  return <LessonFrame d={d} scene={scene} />;
};
