import React from 'react';
import {AbsoluteFill, Composition, interpolate, useCurrentFrame} from 'remotion';

const Clip: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 150], [0, 600]);
  return (
    <AbsoluteFill
      style={{
        background: '#101820',
        color: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 96,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{transform: `translateX(${x}px)`}}>Remotion OK</div>
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <Composition id="Test" component={Clip} durationInFrames={150} fps={30} width={1080} height={1920} />
);
