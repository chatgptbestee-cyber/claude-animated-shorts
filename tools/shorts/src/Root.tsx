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
import {V6} from './videos/V6';
import {V7} from './videos/V7';
import {V8} from './videos/V8';
import {V9} from './videos/V9';
import {V10} from './videos/V10';
import d6 from './data/v6.json';
import d7 from './data/v7.json';
import d8 from './data/v8.json';
import d9 from './data/v9.json';
import d10 from './data/v10.json';

const list: [string, React.FC<{d: Data; sc: Script}>, Data, Script][] = [
  ['V1', V1, d1 as Data, scripts.v1],
  ['V2', V2, d2 as Data, scripts.v2],
  ['V3', V3, d3 as Data, scripts.v3],
  ['V4', V4, d4 as Data, scripts.v4],
  ['V5', V5, d5 as Data, scripts.v5],
  ['V6', V6, d6 as Data, scripts.v6],
  ['V7', V7, d7 as Data, scripts.v7],
  ['V8', V8, d8 as Data, scripts.v8],
  ['V9', V9, d9 as Data, scripts.v9],
  ['V10', V10, d10 as Data, scripts.v10],
];

export const Root: React.FC = () => (
  <>
    {list.map(([id, Comp, d, sc]) => (
      <Composition key={id} id={id} component={Comp as React.FC<any>} defaultProps={{d, sc}}
        durationInFrames={Math.round(d.duration * FPS)} fps={FPS} width={W} height={H} />
    ))}
  </>
);
