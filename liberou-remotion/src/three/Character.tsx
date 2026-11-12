import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Ball, Box, Cyl, ToonMat} from './toon';


export type Expression = 'neutral' | 'worried' | 'scared' | 'serious' | 'smile' | 'sad';
export type Pose =
  | 'idle'
  | 'give' // estende as duas mãos pra frente
  | 'cart' // empurrando carrinho
  | 'jug' // carregando galão
  | 'chain' // segurando corrente
  | 'hammer' // pregando tábua (braço levantado)
  | 'pull' // puxando algo (briga)
  | 'whisper' // inclinado pro lado
  | 'phone'
  | 'sit';

export type CharSpec = {
  skin: string;
  top: string;
  bottom: string;
  shoes?: string;
  hair?: 'curly' | 'short' | 'bald' | 'long' | 'bun' | 'cap';
  hairColor?: string;
  grey?: boolean;
  mustache?: boolean;
  female?: boolean;
  scale?: number;
  dress?: boolean;
};

export type CharProps = {
  spec: CharSpec;
  position?: [number, number, number];
  rotY?: number;
  expression?: Expression;
  talking?: boolean;
  frame?: number;
  mask?: number; // 0..1 = tamanho do sorriso da máscara; undefined = sem máscara
  maskInPocket?: boolean;
  headTilt?: number;
  headYaw?: number;
  look?: [number, number]; // pupilas
  pose?: Pose;
  props?: React.ReactNode; // objeto na mão direita
  walk?: number; // fase de caminhada
};

/* ---------- texturas ---------- */
// pupilas/olhos maiores = mais expressivo
const faceCache = new Map<string, THREE.CanvasTexture>();
const mkTex = (key: string, draw: (c: CanvasRenderingContext2D) => void) => {
  const hit = faceCache.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 256;
  const ctx = cv.getContext('2d')!;
  draw(ctx);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  faceCache.set(key, t);
  return t;
};

export const faceTexture = (
  exp: Expression,
  open: boolean,
  look: [number, number],
  mustache: boolean,
  female: boolean,
) =>
  mkTex(`f-${exp}-${open}-${look.join(',')}-${mustache}-${female}`, (c) => {
    c.lineCap = 'round';
    c.lineJoin = 'round';
    const scared = exp === 'scared';
    const ex = [86, 170];
    const ey = 112;
    const rx = scared ? 34 : 30;
    const ry = scared ? 42 : 36;
    // olhos
    for (const x of ex) {
      c.fillStyle = '#ffffff';
      c.strokeStyle = '#141414';
      c.lineWidth = 7;
      c.beginPath();
      c.ellipse(x, ey, rx, ry, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.fillStyle = '#141414';
      c.beginPath();
      c.arc(x + look[0] * 10, ey + 4 + look[1] * 10, scared ? 9 : 13, 0, Math.PI * 2);
      c.fill();
      if (female) {
        c.lineWidth = 5;
        c.beginPath();
        c.moveTo(x - rx + 2, ey - ry + 14);
        c.lineTo(x - rx - 10, ey - ry + 4);
        c.moveTo(x + rx - 2, ey - ry + 14);
        c.lineTo(x + rx + 10, ey - ry + 4);
        c.stroke();
      }
    }
    // sobrancelhas
    c.strokeStyle = '#141414';
    c.lineWidth = 10;
    const by = ey - ry - 14;
    const brow = (x1: number, y1: number, x2: number, y2: number) => {
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.stroke();
    };
    if (exp === 'worried' || exp === 'sad' || exp === 'scared') {
      brow(56, by + 4, 108, by - 10);
      brow(148, by - 10, 200, by + 4);
    } else if (exp === 'serious') {
      brow(56, by - 8, 110, by + 6);
      brow(146, by + 6, 200, by - 8);
    } else {
      brow(58, by - 2, 108, by - 6);
      brow(148, by - 6, 198, by - 2);
    }
    // nariz
    c.lineWidth = 6;
    c.beginPath();
    c.arc(128, 160, 10, 0.2, Math.PI - 0.2);
    c.stroke();
    // bigode
    if (mustache) {
      c.fillStyle = '#141414';
      c.beginPath();
      c.ellipse(112, 180, 22, 9, -0.2, 0, Math.PI * 2);
      c.ellipse(144, 180, 22, 9, 0.2, 0, Math.PI * 2);
      c.fill();
    }
    // boca
    const my = mustache ? 204 : 196;
    c.lineWidth = 7;
    if (open || scared) {
      c.fillStyle = '#5a1414';
      c.beginPath();
      c.ellipse(128, my, scared ? 22 : 30, open ? 24 : 12, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.fillStyle = '#e8737a';
      c.beginPath();
      c.ellipse(128, my + 8, 11, 5, 0, 0, Math.PI * 2);
      c.fill();
    } else if (exp === 'smile') {
      c.beginPath();
      c.arc(128, my - 18, 26, 0.3, Math.PI - 0.3);
      c.stroke();
    } else if (exp === 'worried' || exp === 'sad') {
      c.beginPath();
      c.arc(128, my + 18, 20, Math.PI + 0.5, -0.5);
      c.stroke();
    } else {
      brow(108, my, 148, my);
    }
  });

export const maskTexture = (smile: number) => {
  const s = Math.round(Math.max(0, Math.min(1, smile)) * 6) / 6;
  return mkTex(`mask-${s}`, (c) => {
    c.lineJoin = 'round';
    c.lineCap = 'round';
    // base papel machê
    c.fillStyle = '#f3d27a';
    c.strokeStyle = '#141414';
    c.lineWidth = 8;
    c.beginPath();
    c.ellipse(128, 128, 112, 122, 0, 0, Math.PI * 2);
    c.fill();
    // manchas de tinta
    const blot = (x: number, y: number, r: number, col: string) => {
      c.fillStyle = col;
      c.beginPath();
      c.ellipse(x, y, r, r * 0.7, 0.6, 0, Math.PI * 2);
      c.fill();
    };
    blot(58, 150, 26, '#e0533d');
    blot(198, 150, 26, '#e0533d');
    blot(128, 36, 30, '#3c8fd6');
    blot(70, 60, 16, '#7bc96f');
    blot(190, 64, 14, '#b56bd6');
    c.beginPath();
    c.ellipse(128, 128, 112, 122, 0, 0, Math.PI * 2);
    c.stroke();
    // olhos vazados (apertam com o sorriso)
    c.fillStyle = '#050505';
    const squint = 1 - s * 0.45;
    for (const [x, rot] of [
      [84, -0.35],
      [172, 0.35],
    ] as const) {
      c.beginPath();
      c.ellipse(x, 102, 26, 15 * squint, rot, 0, Math.PI * 2);
      c.fill();
    }
    // sobrancelhas pintadas
    c.strokeStyle = '#141414';
    c.lineWidth = 7;
    c.beginPath();
    c.moveTo(56, 70);
    c.quadraticCurveTo(84, 56 - s * 10, 110, 72);
    c.moveTo(146, 72);
    c.quadraticCurveTo(172, 56 - s * 10, 200, 70);
    c.stroke();
    // sorriso enorme
    const w = 60 + s * 40;
    const h = 22 + s * 34;
    const y0 = 168;
    c.fillStyle = '#7a1010';
    c.beginPath();
    c.moveTo(128 - w, y0 - s * 12);
    c.quadraticCurveTo(128, y0 + h * 2, 128 + w, y0 - s * 12);
    c.quadraticCurveTo(128, y0 + h * 0.6, 128 - w, y0 - s * 12);
    c.fill();
    // dentes
    c.save();
    c.clip();
    c.fillStyle = '#fbf6e6';
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = '#141414';
    c.lineWidth = 3;
    for (let i = -6; i <= 6; i++) {
      c.beginPath();
      c.moveTo(128 + i * (w / 6), 140);
      c.lineTo(128 + i * (w / 6), 240);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(128 - w, y0 + h * 0.55);
    c.quadraticCurveTo(128, y0 + h * 1.3, 128 + w, y0 + h * 0.55);
    c.stroke();
    c.restore();
    c.strokeStyle = '#141414';
    c.lineWidth = 7;
    c.beginPath();
    c.moveTo(128 - w, y0 - s * 12);
    c.quadraticCurveTo(128, y0 + h * 2, 128 + w, y0 - s * 12);
    c.quadraticCurveTo(128, y0 + h * 0.6, 128 - w, y0 - s * 12);
    c.stroke();
    // rachaduras
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(40, 120);
    c.lineTo(52, 132);
    c.lineTo(46, 146);
    c.moveTo(214, 96);
    c.lineTo(204, 110);
    c.stroke();
  });
};

/* ---------- personagem ---------- */
const ARM_POSES: Record<Pose, {l: [number, number]; r: [number, number]}> = {
  // [rot X (pra frente = negativo), rot Z (abrir)]
  idle: {l: [0, 0.12], r: [0, -0.12]},
  give: {l: [-1.25, -0.15], r: [-1.25, 0.15]},
  cart: {l: [-1.0, -0.05], r: [-1.0, 0.05]},
  jug: {l: [0, 0.12], r: [-0.25, -0.05]},
  chain: {l: [-0.6, 0.1], r: [-0.7, -0.1]},
  hammer: {l: [-1.4, 0.1], r: [-2.6, -0.2]},
  pull: {l: [-1.3, -0.2], r: [-1.3, 0.2]},
  whisper: {l: [0, 0.12], r: [-0.4, -0.2]},
  phone: {l: [0, 0.12], r: [-2.4, -0.6]},
  sit: {l: [-0.6, 0.1], r: [-0.6, -0.1]},
};

export const Character: React.FC<CharProps> = ({
  spec,
  position = [0, 0, 0],
  rotY = 0,
  expression = 'neutral',
  talking = false,
  frame = 0,
  mask,
  maskInPocket,
  headTilt = 0,
  headYaw = 0,
  look = [0, 0],
  pose = 'idle',
  props,
  walk,
}) => {
  const sc = spec.scale ?? 1;
  const open = talking && Math.floor(frame / 4) % 2 === 0;
  const face = useMemo(
    () => faceTexture(expression, open, look, !!spec.mustache, !!spec.female),
    [expression, open, look[0], look[1], spec.mustache, spec.female],
  );
  const maskTex = mask !== undefined ? maskTexture(mask) : null;
  const ap = ARM_POSES[pose];
  const breathe = Math.sin(frame / 18) * 0.01;
  const sw = walk !== undefined ? Math.sin(walk) * 0.45 : 0;
  const hairColor = spec.hairColor ?? '#1b1b1b';
  const headY = 1.74;
  const hr = 0.27;

  return (
    <group
      position={pose === 'sit' ? [position[0], position[1] - 0.4 * sc, position[2]] : position}
      rotation={[0, rotY, 0]}
      scale={sc}
    >
      {/* pernas */}
      {spec.dress ? (
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.24, 0.36, 0.62, 16]} />
          <ToonMat color={spec.top} />
        </mesh>
      ) : null}
      {[-0.11, 0.11].map((x, i) => (
        <group
          key={x}
          position={[x, 0.86, 0]}
          rotation={[pose === 'sit' ? -1.35 + Math.sin(frame / 6 + i * 2) * 0.12 : (i ? -sw : sw) * 0.8, 0, 0]}
        >
          <Box size={[0.17, 0.82, 0.19]} color={spec.dress ? spec.skin : spec.bottom} position={[0, -0.41, 0]} />
          <Box size={[0.19, 0.08, 0.28]} color={spec.shoes ?? '#2b2b2b'} position={[0, -0.84, 0.04]} />
        </group>
      ))}
      {/* tronco */}
      <group position={[0, 1.2 + breathe, 0]}>
        <Box size={[0.56, 0.66, 0.32]} color={spec.top} outline={0.016} />
        {maskInPocket && (
          <mesh position={[0.14, -0.3, -0.17]} rotation={[0, Math.PI, 0.25]}>
            <planeGeometry args={[0.2, 0.22]} />
            <meshToonMaterial map={maskTexture(0.8)} transparent side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
      {/* braços */}
      {(['l', 'r'] as const).map((side) => {
        const sgn = side === 'l' ? -1 : 1;
        const [rx, rz] = ap[side];
        const swing = side === 'l' ? -sw : sw;
        return (
          <group key={side} position={[sgn * 0.36, 1.48 + breathe, 0]} rotation={[rx + swing * 0.6, 0, rz]}>
            <Box size={[0.15, 0.58, 0.15]} color={spec.top} position={[0, -0.27, 0]} />
            <Ball r={0.085} color={spec.skin} position={[0, -0.6, 0]} />
            {side === 'r' && props ? <group position={[0, -0.66, 0]}>{props}</group> : null}
          </group>
        );
      })}
      {/* cabeça */}
      <group position={[0, headY + breathe, 0]} rotation={[0, headYaw, headTilt]}>
        <Cyl r={0.08} h={0.14} color={spec.skin} position={[0, -0.27, 0]} outline={false} />
        <Ball r={hr} color={spec.skin} />
        {/* orelhas */}
        <Ball r={0.06} color={spec.skin} position={[-hr, 0, 0]} />
        <Ball r={0.06} color={spec.skin} position={[hr, 0, 0]} />
        {/* rosto */}
        {maskTex ? (
          <mesh position={[0, 0, hr + 0.035]}>
            <planeGeometry args={[0.6, 0.66]} />
            <meshToonMaterial map={maskTex} transparent alphaTest={0.3} />
          </mesh>
        ) : (
          <mesh position={[0, -0.01, hr + 0.006]}>
            <planeGeometry args={[0.46, 0.46]} />
            <meshBasicMaterial map={face} transparent alphaTest={0.2} toneMapped={false} />
          </mesh>
        )}
        {/* cabelo */}
        {spec.hair === 'curly' && (
          <group>
            {Array.from({length: 22}).map((_, i) => {
              const a = (i / 22) * Math.PI * 2;
              const up = i % 3 === 0 ? 0.2 : 0.12;
              const col = spec.grey && i % 4 === 0 ? '#bdbdbd' : hairColor;
              return (
                <Ball
                  key={i}
                  r={0.1}
                  color={col}
                  outline={0.008}
                  position={[Math.cos(a) * 0.24, up + Math.abs(Math.sin(a)) * 0.08, Math.sin(a) * 0.2 - 0.06]}
                />
              );
            })}
            <Ball r={0.22} color={hairColor} position={[0, 0.18, -0.06]} outline={0.008} />
          </group>
        )}
        {spec.hair === 'short' && (
          <mesh position={[0, 0.05, -0.02]} scale={[1.04, 0.9, 1.04]}>
            <sphereGeometry args={[hr, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
            <ToonMat color={hairColor} />
          </mesh>
        )}
        {spec.hair === 'cap' && (
          <group position={[0, 0.12, 0]}>
            <mesh scale={[1.06, 0.8, 1.06]}>
              <sphereGeometry args={[hr, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <ToonMat color={hairColor} />
            </mesh>
            <Box size={[0.36, 0.03, 0.2]} color={hairColor} position={[0, 0, 0.3]} />
          </group>
        )}
        {(spec.hair === 'long' || spec.hair === 'bun') && (
          <group>
            <mesh position={[0, 0.04, -0.03]} scale={[1.08, 1, 1.08]}>
              <sphereGeometry args={[hr, 20, 16, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
              <ToonMat color={hairColor} />
            </mesh>
            {spec.hair === 'long' ? (
              <Box size={[0.5, 0.5, 0.12]} color={hairColor} position={[0, -0.22, -0.2]} />
            ) : (
              <Ball r={0.13} color={hairColor} position={[0, 0.26, -0.14]} />
            )}
          </group>
        )}
      </group>
    </group>
  );
};

/* ---------- elenco ---------- */
export const CAST: Record<string, CharSpec> = {
  cida: {skin: '#7a4a2a', top: '#8ec5e8', bottom: '#5f8fb0', hair: 'curly', hairColor: '#2a2a2a', grey: true, female: true},
  biel: {skin: '#9a6338', top: '#d93a3a', bottom: '#2f4f8f', hair: 'short', scale: 0.74, shoes: '#ffffff'},
  homem1: {skin: '#5b3a22', top: '#262626', bottom: '#3d5a80', hair: 'bald'},
  homem2: {skin: '#a87650', top: '#5d7a3a', bottom: '#6b5a44', hair: 'short'},
  mascarado: {skin: '#b98455', top: '#d8cdb2', bottom: '#5b4636', hair: 'short', hairColor: '#3a2a1a'},
  mascarada: {skin: '#8a5a36', top: '#7d4bb3', bottom: '#7d4bb3', hair: 'bun', female: true, dress: true},
  caixa: {skin: '#c18a5f', top: '#c62d2d', bottom: '#333333', hair: 'bun', female: true},
  mulher: {skin: '#6e4529', top: '#e8a33d', bottom: '#3b3b6b', hair: 'long', female: true},
  briga1: {skin: '#d1a27a', top: '#2f6fb3', bottom: '#444444', hair: 'cap', hairColor: '#b33'},
  briga2: {skin: '#6b4026', top: '#f2f2f2', bottom: '#1f3b5c', hair: 'short'},
  tonho: {skin: '#6b4026', top: '#ece6d4', bottom: '#4a4a4a', hair: 'short', hairColor: '#d4d4d4', mustache: true},
  motorista: {skin: '#a87650', top: '#2f5fbf', bottom: '#2b2b2b', hair: 'cap', hairColor: '#1f3b7a'},
};
