import React from 'react';
import * as THREE from 'three';
import {useCanvasTex} from '../toon';

export type TimeOfDay = 'dusk' | 'late' | 'night';

export const SKY: Record<TimeOfDay, [string, string, string]> = {
  dusk: ['#3c5aa8', '#f08a4b', '#f7c27a'],
  late: ['#24305e', '#b0506a', '#e08a5a'],
  night: ['#0b1030', '#18224d', '#2a3466'],
};

// Céu com silhueta de cidade e morro
export const Sky: React.FC<{time: TimeOfDay; radius?: number}> = ({time, radius = 60}) => {
  const tex = useCanvasTex(
    1024,
    512,
    (c) => {
      const [a, b, d] = SKY[time];
      const g = c.createLinearGradient(0, 0, 0, 512);
      g.addColorStop(0, a);
      g.addColorStop(0.55, b);
      g.addColorStop(0.75, d);
      c.fillStyle = g;
      c.fillRect(0, 0, 1024, 512);
      // nuvens
      if (time !== 'night') {
        c.fillStyle = 'rgba(255,200,170,0.35)';
        for (let i = 0; i < 6; i++) {
          c.beginPath();
          c.ellipse(80 + i * 170, 150 + (i % 2) * 40, 90, 18, 0, 0, Math.PI * 2);
          c.fill();
        }
      } else {
        c.fillStyle = '#ffffff';
        for (let i = 0; i < 70; i++) c.fillRect((i * 137) % 1024, (i * 61) % 220, 2, 2);
      }
      // prédios
      c.fillStyle = time === 'night' ? '#141a38' : '#8a7a98';
      for (let x = 0; x < 1024; x += 38) {
        const h = 40 + ((x * 7) % 90);
        c.fillRect(x, 400 - h, 30, h + 112);
      }
      // janelas acesas
      c.fillStyle = time === 'night' ? '#f7d36b' : '#f3d9a8';
      for (let x = 4; x < 1024; x += 38)
        for (let y = 330; y < 400; y += 12) if ((x * y) % 7 < 3) c.fillRect(x + ((y / 12) % 3) * 8, y, 4, 5);
      // morro com casinhas
      c.fillStyle = time === 'night' ? '#20264a' : '#c9705a';
      c.beginPath();
      c.moveTo(0, 512);
      c.quadraticCurveTo(300, 360, 620, 420);
      c.quadraticCurveTo(820, 450, 1024, 400);
      c.lineTo(1024, 512);
      c.fill();
      const cols = ['#e46f6f', '#6fb3e4', '#f2c14e', '#86cf86', '#e9e9e9', '#d68ad6'];
      for (let i = 0; i < 260; i++) {
        const x = (i * 97) % 1024;
        const y = 420 + ((i * 53) % 90);
        c.fillStyle = time === 'night' ? (i % 5 === 0 ? '#f7d36b' : '#2b3260') : cols[i % cols.length];
        c.fillRect(x, y, 10, 7);
      }
    },
    [time],
  );
  return (
    <mesh>
      <sphereGeometry args={[radius, 32, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
};

export const Lights: React.FC<{time: TimeOfDay | 'indoor' | 'market'}> = ({time}) => {
  if (time === 'market')
    return (
      <>
        <ambientLight intensity={0.65} color="#f2f6ff" />
        <directionalLight position={[1, 6, 4]} intensity={0.9} color="#ffffff" />
      </>
    );
  if (time === 'night')
    return (
      <>
        <ambientLight intensity={0.55} color="#7f8fd6" />
        <directionalLight position={[-4, 6, 3]} intensity={0.8} color="#a8b6ff" />
        <pointLight position={[2, 4, 0]} intensity={8} distance={10} color="#ffcf7a" />
      </>
    );
  return (
    <>
      <ambientLight intensity={0.72} color={time === 'indoor' ? '#fff4ea' : '#ffece0'} />
      <directionalLight position={[3, 6, 6]} intensity={0.85} color="#fff0de" />
    </>
  );
};

export const tileTex = (a: string, b: string, n = 8) => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const s = 256 / n;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      ctx.fillStyle = (i + j) % 2 ? a : b;
      ctx.fillRect(i * s, j * s, s, s);
    }
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= n; i++) {
    ctx.beginPath();
    ctx.moveTo(i * s, 0);
    ctx.lineTo(i * s, 256);
    ctx.moveTo(0, i * s);
    ctx.lineTo(256, i * s);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

export const textTex = (
  lines: string[],
  opts: {bg?: string; fg?: string; w?: number; h?: number; font?: string; border?: string} = {},
) => {
  const w = opts.w ?? 512;
  const h = opts.h ?? 128;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = opts.bg ?? '#ffffff';
  ctx.fillRect(0, 0, w, h);
  if (opts.border) {
    ctx.strokeStyle = opts.border;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, w - 10, h - 10);
  }
  ctx.fillStyle = opts.fg ?? '#141414';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fs = Math.floor((h / lines.length) * 0.62);
  ctx.font = opts.font ?? `900 ${fs}px Nunito, Arial Black, sans-serif`;
  lines.forEach((l, i) => ctx.fillText(l, w / 2, (h / lines.length) * (i + 0.5)));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
