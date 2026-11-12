import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SceneView} from './engine/Scene';
import {fontFamily} from './engine/Overlays';
import type {SceneSpec} from './engine/types';

// Capa: frame do mascarado sorrindo + título grande
export const Capa: React.FC<{spec: SceneSpec; ep: string; hook: string}> = ({spec, ep, hook}) => (
  <AbsoluteFill>
    <SceneView spec={{...spec, lines: [], sfx: []}} />
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.9) 100%)',
      }}
    />
    {/* título */}
    <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center'}}>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 210,
          letterSpacing: 6,
          color: '#e5322d',
          WebkitTextStroke: '18px #0b0b0b',
          paintOrder: 'stroke fill',
          lineHeight: 1,
          textShadow: '0 0 60px rgba(229,50,45,0.6)',
        }}
      >
        LIBEROU
      </div>
      <div
        style={{
          display: 'inline-block',
          marginTop: 22,
          background: '#ffd23f',
          color: '#0b0b0b',
          fontFamily,
          fontWeight: 900,
          fontSize: 64,
          padding: '8px 34px',
          borderRadius: 16,
          border: '7px solid #0b0b0b',
          transform: 'rotate(-3deg)',
        }}
      >
        {ep}
      </div>
    </div>
    {/* gancho */}
    <div
      style={{
        position: 'absolute',
        bottom: 170,
        left: 60,
        right: 60,
        textAlign: 'center',
        fontFamily,
        fontWeight: 900,
        fontSize: 104,
        lineHeight: 1.02,
        color: '#ffffff',
        WebkitTextStroke: '16px #0b0b0b',
        paintOrder: 'stroke fill',
      }}
    >
      {hook}
    </div>
  </AbsoluteFill>
);
