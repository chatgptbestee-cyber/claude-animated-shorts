import React from 'react';
import {Composition} from 'remotion';
import scripts from '../scripts.json';
import {Data, FPS, H, Script, W} from './common';
import d1 from './data/v1.json';
import d2 from './data/v2.json';
import d3 from './data/v3.json';
import d4 from './data/v4.json';
import d5 from './data/v5.json';
import {V1} from './videos/V1';
import {V2} from './videos/V2';
import {V3} from './videos/V3';
import {V4} from './videos/V4';
import {V5} from './videos/V5';

const list: [string, React.FC<{d: Data; sc: Script}>, Data, Script][] = [
  ['V1', V1, d1 as Data, scripts.v1],
  ['V2', V2, d2 as Data, scripts.v2],
  ['V3', V3, d3 as Data, scripts.v3],
  ['V4', V4, d4 as Data, scripts.v4],
  ['V5', V5, d5 as Data, scripts.v5],
];

export const Root: React.FC = () => (
  <>
    {list.map(([id, Comp, d, sc]) => (
      <Composition key={id} id={id} component={Comp as React.FC<any>} defaultProps={{d, sc}}
        durationInFrames={Math.round(d.duration * FPS)} fps={FPS} width={W} height={H} />
    ))}
  </>
);
