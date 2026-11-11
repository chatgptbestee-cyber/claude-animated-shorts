import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, Data, H, prog, useT, W} from './common';
import {squircle, WH, WW} from './lesson';

/* Follower-focused layout: hook headline from frame 0, a bigger scene window,
   a numbered list that fills while it is spoken, and a follow prompt at the end. */

export const K = 1.098; // window scale (920x712 scene -> 1010x782 on screen)
const X0 = (W - WW * K) / 2;
const Y0 = 360;
export const SUB_Y = Y0 + 640 * K - 50;

export type Row = {label: string; at: number; from: number; to: number};

const GOLD = '#f5c04a';

const Headline: React.FC<{t: number; ctaAt: number; dur: number}> = ({t, ctaAt, dur}) => {
  const c = prog(t, ctaAt, ctaAt + 0.3);
  const base: React.CSSProperties = {position: 'absolute', left: 50, right: 50, top: 150, textAlign: 'center', fontFamily: 'Inter', fontWeight: 800,
    color: '#fff', lineHeight: 1.12, letterSpacing: -1, textShadow: '0 2px 14px rgba(0,0,0,0.8)'};
  return (
    <>
      <div style={{...base, fontSize: 66, opacity: 1 - c}}>
        Du warst einer von<br />diesen <span style={{color: GOLD}}>5</span> 👇
      </div>
      <div style={{...base, fontSize: 56, opacity: c, transform: `translateY(${(1 - c) * 10}px)`}}>
        Teil 2: Die 5 Lehrer,<br />die jede Schule hatte 👀
        <div style={{marginTop: 18, fontSize: 40, color: GOLD}}>Folg mir, damit du ihn nicht verpasst</div>
      </div>
    </>
  );
};

const List: React.FC<{t: number; rows: Row[]}> = ({t, rows}) => (
  <div style={{position: 'absolute', left: 80, right: 120, top: Y0 + WH * K + 34}}>
    {rows.map((r, i) => {
      const shown = t >= r.at;
      const active = t >= r.from && t < r.to;
      const p = clamp01((t - r.at) / 0.2);
      const last = i === rows.length - 1;
      return (
        <div key={i} style={{display: 'flex', alignItems: 'center', height: 66, transform: `scale(${active ? 1.04 : 1})`, transformOrigin: 'left center'}}>
          <div style={{
            width: 50, height: 50, borderRadius: 25, background: active ? GOLD : 'rgba(245,192,74,0.85)', color: '#121212',
            fontFamily: 'Inter', fontWeight: 900, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 22,
            boxShadow: active ? '0 0 24px rgba(245,192,74,0.6)' : 'none',
          }}>{i + 1}</div>
          {shown ? (
            <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 40, color: active ? GOLD : '#f2f2f2', opacity: 0.6 + 0.4 * p,
              transform: `translateX(${(1 - p) * 16}px)`, whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>{r.label}</div>
          ) : (
            <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 40, color: last ? GOLD : 'rgba(255,255,255,0.28)'}}>{last ? '?' : '· · ·'}</div>
          )}
        </div>
      );
    })}
  </div>
);

/** One big serif word at a time, placed low in the window so faces stay free. */
const Word: React.FC<{d: Data; t: number}> = ({d, t}) => {
  const ws = d.words;
  const i = ws.findIndex((w, k) => {
    const nx = ws[k + 1];
    const end = nx && nx.s - w.e < 0.6 ? nx.s - 0.02 : w.e + 0.35;
    return t >= w.s - 0.04 && t < end;
  });
  if (i < 0) return null;
  const w = ws[i];
  const p = clamp01((t - (w.s - 0.04)) / 0.07);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: SUB_Y, textAlign: 'center'}}>
      <span style={{fontFamily: 'Liberation Serif', fontWeight: 700, fontSize: 80, color: '#f7f4ee', opacity: p, display: 'inline-block',
        textShadow: '0 3px 18px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)', transform: `scale(${0.96 + 0.04 * p})`}}>{w.w.replace(/[„“":]/g, '')}</span>
    </div>
  );
};

export const ListFrame: React.FC<{d: Data; scene: (t: number) => React.ReactNode; rows: Row[]; ctaAt: number}> = ({d, scene, rows, ctaAt}) => {
  const t = useT();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <clipPath id="winL"><path d={squircle} /></clipPath>
          <radialGradient id="vigL" cx="50%" cy="50%" r="64%">
            <stop offset="0.6" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.6} />
          </radialGradient>
          <filter id="edgeL" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="20" /></filter>
          <filter id="grainLL">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 11} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <g transform={`translate(${X0} ${Y0}) scale(${K})`}>
          <g clipPath="url(#winL)">
            {scene(t)}
            <rect width={WW} height={WH} fill="url(#vigL)" />
            <path d={squircle} fill="none" stroke="#000" strokeWidth={60} filter="url(#edgeL)" opacity={0.7} />
            <rect width={WW} height={WH} filter="url(#grainLL)" opacity={0.06} style={{mixBlendMode: 'screen'}} />
          </g>
        </g>
      </svg>
      <Headline t={t} ctaAt={ctaAt} dur={d.duration} />
      <Word d={d} t={t} />
      <List t={t} rows={rows} />
    </AbsoluteFill>
  );
};
