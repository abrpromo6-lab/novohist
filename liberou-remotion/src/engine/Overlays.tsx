import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Nunito';
import {SPEAKER_COLOR} from './types';
import type {Line, Vote} from './types';

export const {fontFamily} = loadFont('normal', {weights: ['800', '900'], subsets: ['latin', 'latin-ext']});

export const lineFrames = (l: Line, fps: number) =>
  Math.round((l.sec ?? Math.max(1.7, l.text.length * 0.062 + 0.7)) * fps);

export const Stamp: React.FC<{text: string; alert?: boolean}> = ({text, alert}) => (
  <div
    style={{
      position: 'absolute',
      top: 92,
      left: '50%',
      transform: 'translateX(-50%)',
      background: alert ? 'rgba(170,20,20,0.92)' : 'rgba(16,22,40,0.88)',
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
  const a = 0.17 + Math.sin(frame / 8) * 0.03;
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

export const EndCard: React.FC<{opt1: string; opt2: string; next: number; icon1?: string; icon2?: string; title?: string}> = ({
  opt1,
  opt2,
  next,
  title,
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
          {main.includes('|') ? (
            <div>
              <div style={{fontSize: main.split('|')[0].length > 4 ? 92 : 112, lineHeight: 0.95, letterSpacing: -1, color: n === 1 ? '#c41f1f' : '#1655c4'}}>{main.split('|')[0]}</div>
              <div style={{fontSize: 44, lineHeight: 1.1, marginTop: 14}}>{main.split('|')[1]}</div>
            </div>
          ) : (
            main
          )}
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
        {title ? (
          title
        ) : (
          <>
            O QUE VOCÊ
            <br />
            FARIA?
          </>
        )}
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
          SIGA PRA NÃO PERDER A PARTE {next}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Texto-gancho dos primeiros segundos: entra rápido e firme, sem efeito brega
export const HookText: React.FC<{text: string; sec?: number}> = ({text, sec = 2.6}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = sec * fps;
  const inT = interpolate(frame, [0, 5], [0, 1], {extrapolateRight: 'clamp'});
  const out = interpolate(frame, [end - 6, end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (frame > end) return null;
  const [a, b] = text.split('|');
  return (
    <div
      style={{
        position: 'absolute',
        top: '17%',
        left: 50,
        right: 50,
        textAlign: 'center',
        opacity: inT * out,
        transform: `scale(${1.06 - inT * 0.06})`,
        fontFamily,
        fontWeight: 900,
        lineHeight: 1.04,
        WebkitTextStroke: '16px #0b0b0b',
        paintOrder: 'stroke fill',
        textShadow: '0 8px 0 rgba(0,0,0,0.35)',
      }}
    >
      <div style={{fontSize: 86, color: '#ffd23f'}}>{a}</div>
      {b ? <div style={{fontSize: 104, color: '#ffffff', marginTop: 8}}>{b}</div> : null}
    </div>
  );
};

// Brilho do farol: suave, cresce com a chegada do ônibus
export const Glare: React.FC<{strength: number}> = ({strength}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 55% 30% at 50% 52%, rgba(255,246,214,${0.55 * strength}) 0%, rgba(255,230,170,${0.18 * strength}) 45%, rgba(0,0,0,0) 75%)`,
      mixBlendMode: 'screen',
    }}
  />
);

// Granulação de filme bem leve (não pode parecer sujeira)
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const id = `g${frame % 8}`;
  return (
    <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 8} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

// Tela de votação com os comentários reais
export const VoteScreen: React.FC<{vote: Vote}> = ({vote}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sp = (d: number, damping = 12) => spring({frame: frame - d, fps, config: {damping, stiffness: 160, mass: 0.7}});
  const COR: [string, string] = ['#e5322d', '#2f7bff'];
  const fill = interpolate(frame, [10, 46], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const stampAt = 58;
  const st = sp(stampAt, 9);
  const [w1, w2] = vote.pergunta.replace('?', '').split(' OU ');
  const live = Math.floor(frame / 15) % 2 === 0;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #1a1d27 0%, #0a0b0f 70%)', alignItems: 'center', fontFamily}}>
      <div style={{marginTop: 150, display: 'flex', alignItems: 'center', gap: 16, opacity: sp(0)}}>
        <div style={{width: 18, height: 18, borderRadius: 9, background: live ? '#e5322d' : '#5a1212'}} />
        <div style={{color: '#cfd3dc', fontWeight: 800, fontSize: 38, letterSpacing: 4}}>PARTE {vote.parte} · A VOTAÇÃO</div>
      </div>
      <div
        style={{
          marginTop: 26,
          fontWeight: 900,
          fontSize: 132,
          lineHeight: 1,
          transform: `scale(${0.85 + sp(2) * 0.15})`,
          opacity: sp(2),
          WebkitTextStroke: '10px #000',
          paintOrder: 'stroke fill',
        }}
      >
        <span style={{color: COR[0]}}>{w1}</span>
        <span style={{color: '#ffffff', fontSize: 80}}> OU </span>
        <span style={{color: COR[1]}}>{w2}</span>
        <span style={{color: '#ffffff'}}>?</span>
      </div>
      <div style={{color: '#8b91a0', fontWeight: 800, fontSize: 36, marginTop: 14}}>
        {Math.round(vote.total * fill)} {vote.total === 1 ? 'VOTO' : 'VOTOS'}
      </div>
      <div style={{width: 900, marginTop: 50}}>
        {[0, 1].map((i) => (
          <div key={i} style={{marginBottom: 26}}>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 900, fontSize: 46, marginBottom: 10}}>
              <span>
                <span style={{color: COR[i]}}>{i + 1}</span> {vote.opcoes[i]}
              </span>
              <span>{Math.round(vote.pct[i] * fill)}%</span>
            </div>
            <div style={{height: 34, borderRadius: 17, background: '#1e2230', overflow: 'hidden'}}>
              <div
                style={{
                  width: `${vote.pct[i] * fill}%`,
                  height: '100%',
                  borderRadius: 17,
                  background: `linear-gradient(90deg, ${COR[i]}aa, ${COR[i]})`,
                  boxShadow: `0 0 24px ${COR[i]}88`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{width: 900, marginTop: 24}}>
        {vote.comentarios.map((cm, i) => {
          const a = sp(18 + i * 9);
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                background: '#161923',
                border: `3px solid ${COR[cm.opt - 1]}66`,
                borderRadius: 22,
                padding: '20px 26px',
                marginBottom: 18,
                opacity: a,
                transform: `translateX(${(1 - a) * (i % 2 ? 120 : -120)}px)`,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  background: COR[cm.opt - 1],
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: 38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {cm.opt}
              </div>
              <div>
                <div style={{color: '#8b91a0', fontWeight: 800, fontSize: 30}}>{cm.user}</div>
                <div style={{color: '#ffffff', fontWeight: 800, fontSize: 42}}>{cm.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1230,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: frame >= stampAt ? 1 : 0,
        }}
      >
        <div
          style={{
            border: '12px solid #e5322d',
            color: '#e5322d',
            background: 'rgba(10,11,15,0.88)',
            borderRadius: 18,
            padding: '6px 46px',
            fontWeight: 900,
            fontSize: 150,
            letterSpacing: 6,
            transform: `rotate(-7deg) scale(${1.5 - st * 0.5})`,
            boxShadow: '0 0 60px rgba(229,50,45,0.45)',
          }}
        >
          {vote.resultado}
        </div>
      </div>
      {vote.depois && (
        <div
          style={{
            position: 'absolute',
            bottom: 200,
            left: 60,
            right: 60,
            textAlign: 'center',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: 70,
            opacity: interpolate(frame, [stampAt + 14, stampAt + 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            WebkitTextStroke: '8px #000',
            paintOrder: 'stroke fill',
          }}
        >
          {vote.depois}
        </div>
      )}
    </AbsoluteFill>
  );
};
