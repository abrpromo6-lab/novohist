import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Nunito';
import {SPEAKER_COLOR} from './types';
import type {Line} from './types';

export const {fontFamily} = loadFont('normal', {weights: ['800', '900'], subsets: ['latin', 'latin-ext']});

export const lineFrames = (l: Line, fps: number) =>
  Math.round((l.sec ?? Math.max(1.7, l.text.length * 0.062 + 0.7)) * fps);

export const Stamp: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      position: 'absolute',
      top: 92,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(16,22,40,0.88)',
      color: '#fff',
      fontFamily,
      fontWeight: 900,
      fontSize: 40,
      letterSpacing: 2,
      padding: '12px 30px',
      borderRadius: 14,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);

export const Captions: React.FC<{lines: Line[]; offset?: number; top?: boolean}> = ({lines, offset = 6, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  let t = offset;
  let current: Line | null = null;
  for (const l of lines) {
    const d = lineFrames(l, fps);
    if (frame >= t && frame < t + d) current = l;
    t += d;
  }
  if (!current) return null;
  const color = SPEAKER_COLOR[current.who];
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: top ? '9%' : '66%',
        textAlign: 'center',
        fontFamily,
        fontWeight: 900,
        fontSize: 64,
        lineHeight: 1.15,
        color,
        WebkitTextStroke: '14px #141414',
        paintOrder: 'stroke fill',
        textShadow: '0 6px 0 rgba(0,0,0,0.35)',
      }}
    >
      {current.text}
    </div>
  );
};

// Quem está falando agora (para mexer a boca)
export const activeSpeaker = (lines: Line[], frame: number, fps: number, offset = 6) => {
  let t = offset;
  for (const l of lines) {
    const d = lineFrames(l, fps);
    if (frame >= t && frame < t + d - 6) return l.who;
    t += d;
  }
  return null;
};

export const RedTint: React.FC = () => {
  const frame = useCurrentFrame();
  const a = 0.32 + Math.sin(frame / 5) * 0.06;
  return <AbsoluteFill style={{background: `rgba(190,10,10,${a})`, mixBlendMode: 'multiply'}} />;
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <AbsoluteFill
    style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`}}
  />
);

// Espiar pela fresta: máscara em formato de olho
export const Peek: React.FC = () => {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [0, 10], [0.15, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none">
        <defs>
          <mask id="eye">
            <rect width="1080" height="1920" fill="white" />
            <path
              d={`M 40 960 Q 540 ${960 - 620 * open} 1040 960 Q 540 ${960 + 620 * open} 40 960 Z`}
              fill="black"
            />
          </mask>
        </defs>
        <rect width="1080" height="1920" fill="#050505" mask="url(#eye)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Black: React.FC = () => {
  const frame = useCurrentFrame();
  // "piscada": pequeno brilho no meio
  const g = interpolate(frame, [0, 6, 14], [0.0, 0.5, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#050505'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 30% 2% at 50% 50%, rgba(255,190,120,${g}) 0%, rgba(0,0,0,0) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{opt1: string; opt2: string; next: number; icon1?: string; icon2?: string}> = ({
  opt1,
  opt2,
  next,
  icon1 = '1',
  icon2 = '2',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sp = (delay: number, damping = 11) => spring({frame: frame - delay, fps, config: {damping, stiffness: 140, mass: 0.8}});

  // título cai e treme
  const tIn = sp(0, 9);
  const shake = frame < 22 ? Math.sin(frame * 2.2) * (22 - frame) * 0.35 : 0;
  // cards entram pelos lados
  const c1 = sp(8);
  const c2 = sp(14);
  const vs = sp(22, 7);
  const cta = sp(32, 8);
  const glow = 0.5 + Math.sin(frame / 6) * 0.5;

  const card = (n: 1 | 2, text: string, _icon: string, enter: number) => {
    const color = n === 1 ? '#e5322d' : '#1f6fe5';
    const dark = n === 1 ? '#8f1512' : '#123f86';
    const from = n === 1 ? -700 : 700;
    const pulse = frame > 40 ? 1 + Math.sin(frame / 7 + (n === 1 ? 0 : Math.PI)) * 0.03 : 1;
    const tilt = (n === 1 ? -4 : 4) * (1 - enter) + Math.sin(frame / 11 + n) * 1.0;
    // "Ação (porém)" -> ação em destaque, porém embaixo
    const m = text.match(/^(.*?)\s*\((.*)\)\s*$/);
    const main = m ? m[1] : text;
    const sub = m ? m[2] : '';
    return (
      <div
        style={{
          width: 452,
          height: 760,
          background: '#ffffff',
          borderRadius: 40,
          border: '8px solid #141414',
          boxShadow: `0 0 ${30 + glow * 45}px ${color}cc, 0 20px 0 ${dark}`,
          transform: `translateX(${from * (1 - enter)}px) rotate(${tilt}deg) scale(${pulse})`,
          opacity: Math.min(1, enter * 1.5),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* topo colorido com o número */}
        <div
          style={{
            background: `linear-gradient(180deg, ${color} 0%, ${dark} 100%)`,
            height: 190,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '8px solid #141414',
          }}
        >
          <span
            style={{
              fontFamily,
              fontWeight: 900,
              fontSize: 150,
              color: '#ffffff',
              lineHeight: 1,
              WebkitTextStroke: '10px #141414',
              paintOrder: 'stroke fill',
            }}
          >
            {n}
          </span>
        </div>
        {/* ação */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 30px',
            fontFamily,
            fontWeight: 900,
            fontSize: 62,
            color: '#141414',
            textAlign: 'center',
            lineHeight: 1.08,
          }}
        >
          {main}
        </div>
        {/* porém */}
        {sub ? (
          <div
            style={{
              background: '#141414',
              color: n === 1 ? '#ff8a80' : '#8ab8ff',
              fontFamily,
              fontWeight: 800,
              fontSize: 40,
              textAlign: 'center',
              lineHeight: 1.12,
              padding: '24px 26px 28px',
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{background: '#120d0e', alignItems: 'center', justifyContent: 'center'}}>
      {/* brilho vermelho pulsando no fundo */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 48%, rgba(229,50,45,${0.18 + glow * 0.14}) 0%, rgba(0,0,0,0) 62%)`,
        }}
      />
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 112,
          color: '#e5322d',
          textAlign: 'center',
          lineHeight: 1.0,
          WebkitTextStroke: '10px #141414',
          paintOrder: 'stroke fill',
          transform: `translateY(${(1 - tIn) * -500}px) translateX(${shake}px) scale(${0.6 + tIn * 0.4})`,
          marginBottom: 60,
        }}
      >
        O QUE VOCÊ
        <br />
        FARIA?
      </div>
      <div style={{position: 'relative', display: 'flex', gap: 64, alignItems: 'stretch'}}>
        {card(1, opt1, icon1, c1)}
        {card(2, opt2, icon2, c2)}
        {/* VS no meio */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 120,
            height: 120,
            marginLeft: -60,
            marginTop: -60,
            borderRadius: 60,
            background: '#ffd23f',
            border: '8px solid #141414',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily,
            fontWeight: 900,
            fontSize: 52,
            color: '#141414',
            boxShadow: '0 0 30px rgba(255,210,63,0.8)',
            transform: `scale(${vs * (1 + Math.sin(frame / 4) * 0.06)}) rotate(${(1 - vs) * 180}deg)`,
          }}
        >
          OU
        </div>
      </div>
      <div style={{textAlign: 'center', marginTop: 70, transform: `scale(${cta})`}}>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 76,
            color: '#ffd23f',
            WebkitTextStroke: '8px #141414',
            paintOrder: 'stroke fill',
            transform: `translateY(${Math.abs(Math.sin(frame / 5)) * -14}px)`,
          }}
        >
          COMENTA 1 OU 2
        </div>
        <div style={{fontFamily, fontWeight: 800, fontSize: 40, color: '#fff', marginTop: 16}}>
          Segue pra ver a parte {next}
        </div>
      </div>
    </AbsoluteFill>
  );
};
