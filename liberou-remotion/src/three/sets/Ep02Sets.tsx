import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Ball, Box, Cyl, ToonMat, TexPlane, useCanvasTex} from '../toon';
import {Sky, textTex, tileTex} from './common';
import type {TimeOfDay} from './common';
import {House, Street} from './Street';
import {maskTexture} from '../Character';

/* ---------------- props ---------------- */

// Bilhete do Biel (letra de criança)
export const noteTexture = () => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 384;
  const x = c.getContext('2d')!;
  x.fillStyle = '#fbfaf3';
  x.fillRect(0, 0, 512, 384);
  x.strokeStyle = '#a9c4e8';
  x.lineWidth = 2;
  for (let y = 70; y < 384; y += 52) {
    x.beginPath();
    x.moveTo(0, y);
    x.lineTo(512, y);
    x.stroke();
  }
  x.strokeStyle = '#e8a0a0';
  x.beginPath();
  x.moveTo(52, 0);
  x.lineTo(52, 384);
  x.stroke();
  x.fillStyle = '#1d3f9a';
  x.font = '700 46px "Segoe Print", "Comic Sans MS", cursive';
  x.fillText('fui pra tia rosa.', 66, 112);
  x.fillText('não briga com', 66, 216);
  x.fillText('o meu irmão', 66, 268);
  // coração
  x.fillStyle = '#d93a3a';
  x.beginPath();
  x.moveTo(420, 262);
  x.bezierCurveTo(420, 236, 384, 230, 384, 256);
  x.bezierCurveTo(384, 276, 410, 290, 420, 304);
  x.bezierCurveTo(430, 290, 456, 276, 456, 256);
  x.bezierCurveTo(456, 230, 420, 236, 420, 262);
  x.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const callTexture = () => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#1b2a4a');
  g.addColorStop(1, '#0d1424');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 512);
  x.fillStyle = '#7fd6ff';
  x.beginPath();
  x.arc(128, 150, 54, 0, 6.28);
  x.fill();
  x.fillStyle = '#ffffff';
  x.textAlign = 'center';
  x.font = '900 40px Nunito, Arial';
  x.fillText('IRMÃO', 128, 270);
  x.font = '700 24px Nunito, Arial';
  x.fillText('chamando...', 128, 305);
  x.fillStyle = '#2ecc71';
  x.beginPath();
  x.arc(128, 430, 34, 0, 6.28);
  x.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// Máscara pequena de dois lados: frente sorrindo, dentro escrito MARQUINHOS
const maskInsideTexture = () => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const x = c.getContext('2d')!;
  x.fillStyle = '#d9c8a4';
  x.strokeStyle = '#141414';
  x.lineWidth = 8;
  x.beginPath();
  x.ellipse(128, 128, 112, 122, 0, 0, Math.PI * 2);
  x.fill();
  x.stroke();
  // fibras de papel machê
  x.strokeStyle = 'rgba(120,100,70,0.35)';
  x.lineWidth = 2;
  for (let i = 0; i < 40; i++) {
    x.beginPath();
    x.moveTo(30 + ((i * 53) % 200), 20 + ((i * 37) % 210));
    x.lineTo(50 + ((i * 53) % 200), 26 + ((i * 37) % 210));
    x.stroke();
  }
  // buracos dos olhos (vistos por dentro, espelhados)
  x.fillStyle = '#050505';
  for (const [px, r] of [
    [84, 0.35],
    [172, -0.35],
  ] as const) {
    x.beginPath();
    x.ellipse(px, 92, 24, 12, r, 0, Math.PI * 2);
    x.fill();
  }
  // nome à caneta
  x.save();
  x.translate(128, 178);
  x.rotate(-0.06);
  x.fillStyle = '#111111';
  x.textAlign = 'center';
  x.font = '700 29px "Segoe Print", "Comic Sans MS", cursive';
  x.fillText('MARQUINHOS', 0, 0);
  x.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

export const MaskProp: React.FC<{position: [number, number, number]; rotY: number; size?: number}> = ({position, rotY, size = 0.34}) => {
  const inside = useMemo(maskInsideTexture, []);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[size, size * 1.08]} />
        <meshToonMaterial map={maskTexture(1)} transparent alphaTest={0.3} />
      </mesh>
      <mesh position={[0, 0, -0.004]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[size, size * 1.08]} />
        <meshToonMaterial map={inside} transparent alphaTest={0.3} />
      </mesh>
    </group>
  );
};

/* ---------------- quarto do Biel ---------------- */

export const Bedroom: React.FC<{frame: number; doorOpen?: boolean; ringing?: boolean; time?: TimeOfDay}> = ({
  frame,
  doorOpen,
  ringing,
  time = 'late',
}) => {
  const floor = useMemo(() => {
    const t = tileTex('#b9875a', '#a9774c', 6);
    t.repeat.set(2, 2);
    return t;
  }, []);
  const note = useMemo(noteTexture, []);
  const call = useMemo(callTexture, []);
  const poster = useMemo(() => textTex(['VILA', 'F.C.'], {bg: '#1f6fe5', fg: '#ffd23f', w: 256, h: 320, border: '#ffffff'}), []);
  const blanket = useCanvasTex(
    128,
    128,
    (c) => {
      c.fillStyle = '#3c6fb8';
      c.fillRect(0, 0, 128, 128);
      c.fillStyle = '#5c8fd8';
      for (let i = 0; i < 128; i += 32) c.fillRect(i, 0, 14, 128);
    },
    [],
  );
  const W = 3.6;
  const D = 4.2;
  const H = 2.6;
  // porta: começa fechada na frente da câmera e abre rápido (gancho dos 3 s)
  const doorAng = doorOpen ? -(Math.min(1, frame / 10) ** 0.6) * 1.75 : -1.75;
  // cortina balançando com o vento
  const sway = Math.sin(frame / 9) * 0.28 + Math.sin(frame / 4.3) * 0.08;
  const buzz = ringing && Math.floor(frame / 2) % 3 !== 0 ? (frame % 2 ? 0.006 : -0.006) : 0;
  return (
    <group>
      <Sky time={time} radius={50} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D + 2]} />
        <ToonMat map={floor} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D + 2]} />
        <ToonMat color="#eae4d8" />
      </mesh>
      {[-W / 2, W / 2].map((x) => (
        <mesh key={x} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} position={[x, H / 2, 0]}>
          <planeGeometry args={[D + 2, H]} />
          <ToonMat color="#f2c9a0" />
        </mesh>
      ))}
      {/* parede de trás com janela vazada */}
      {(
        [
          [W, 1.0, [0, 0.5]],
          [W, 0.55, [0, H - 0.275]],
          [1.0, 1.05, [-W / 2 + 0.5, 1.525]],
          [1.6, 1.05, [W / 2 - 0.8, 1.525]],
        ] as [number, number, [number, number]][]
      ).map(([w, h, [x, y]], i) => (
        <mesh key={i} position={[x, y, -D / 2]}>
          <planeGeometry args={[w, h]} />
          <ToonMat color="#f2c9a0" />
        </mesh>
      ))}
      {/* folhas da janela abertas pra fora */}
      <group position={[-0.8, 1.525, -D / 2]}>
        <Box size={[1.02, 0.05, 0.1]} color="#ffffff" position={[0.5, 0.52, 0]} />
        <Box size={[1.02, 0.05, 0.1]} color="#ffffff" position={[0.5, -0.52, 0]} />
        <group rotation={[0, 1.1 + Math.sin(frame / 12) * 0.08, 0]}>
          <Box size={[0.5, 1.0, 0.04]} color="#bfe3f2" position={[0.25, 0, 0]} outline={0.008} />
        </group>
        <group position={[1.0, 0, 0]} rotation={[0, -1.0 - Math.sin(frame / 10) * 0.08, 0]}>
          <Box size={[0.5, 1.0, 0.04]} color="#bfe3f2" position={[-0.25, 0, 0]} outline={0.008} />
        </group>
      </group>
      {/* cortinas */}
      {[-0.95, 0.35].map((x, i) => (
        <group key={x} position={[x, 2.1, -D / 2 + 0.12]} rotation={[sway * (i ? 0.7 : 1), 0, (i ? -1 : 1) * sway * 0.25]}>
          <mesh position={[0, -0.6, 0]}>
            <planeGeometry args={[0.5, 1.2]} />
            <ToonMat color="#f7e08a" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* cama */}
      <group position={[1.15, 0, -1.05]}>
        <Box size={[1.05, 0.32, 2.0]} color="#8a5a32" position={[0, 0.16, 0]} />
        <Box size={[1.0, 0.18, 1.95]} color="#f4f1e6" position={[0, 0.41, 0]} />
        <Box size={[1.04, 0.1, 1.2]} color="#ffffff" map={blanket} position={[0, 0.54, 0.35]} />
        <Box size={[0.5, 0.14, 0.5]} color="#3c6fb8" map={blanket} position={[-0.1, 0.62, 0.55]} />
        {/* travesseiro com o bilhete */}
        <Box size={[0.7, 0.14, 0.4]} color="#ffffff" position={[0, 0.57, -0.72]} />
        <mesh position={[-0.02, 0.646, -0.68]} rotation={[-Math.PI / 2, 0, 0.12]}>
          <planeGeometry args={[0.32, 0.24]} />
          <meshBasicMaterial map={note} toneMapped={false} />
        </mesh>
        {/* celular do Biel saindo de baixo do travesseiro */}
        <group position={[0.22 + buzz, 0.512, -0.4]} rotation={[-Math.PI / 2, 0, -0.4]}>
          <Box size={[0.08, 0.16, 0.012]} color="#1a1a1a" outline={0.004} />
          <mesh position={[0, 0, 0.007]}>
            <planeGeometry args={[0.072, 0.15]} />
            <meshBasicMaterial map={call} toneMapped={false} color={ringing ? '#ffffff' : '#333333'} />
          </mesh>
          {ringing && <pointLight position={[0, 0, 0.06]} intensity={0.25} distance={0.45} color="#9fd8ff" />}
        </group>
      </group>
      {/* escrivaninha, pôster, bola */}
      <group position={[-1.45, 0, -0.6]}>
        <Box size={[0.6, 0.06, 1.1]} color="#e9d2a8" position={[0, 0.75, 0]} />
        <Box size={[0.05, 0.75, 0.05]} color="#8a5a32" position={[-0.25, 0.375, -0.5]} />
        <Box size={[0.05, 0.75, 0.05]} color="#8a5a32" position={[-0.25, 0.375, 0.5]} />
        <Box size={[0.05, 0.75, 0.05]} color="#8a5a32" position={[0.25, 0.375, -0.5]} />
        <Box size={[0.05, 0.75, 0.05]} color="#8a5a32" position={[0.25, 0.375, 0.5]} />
        <Box size={[0.25, 0.04, 0.32]} color="#c62d2d" position={[0, 0.8, 0.2]} />
        <Box size={[0.2, 0.03, 0.28]} color="#f2c14e" position={[0.02, 0.83, -0.25]} />
      </group>
      <TexPlane w={0.5} h={0.62} tex={poster} position={[-W / 2 + 0.01, 1.65, -0.5]} rotation={[0, Math.PI / 2, 0]} />
      <Ball r={0.12} color="#ffffff" position={[-0.6, 0.12, 0.4]} />
      {/* porta + batente perto da câmera */}
      <group position={[-0.45, 0, 1.55]}>
        <Box size={[0.08, 2.1, 0.12]} color="#d9d2c4" position={[-0.04, 1.05, 0]} />
        <Box size={[0.08, 2.1, 0.12]} color="#d9d2c4" position={[0.94, 1.05, 0]} />
        <group rotation={[0, doorAng, 0]}>
          <Box size={[0.86, 2.05, 0.05]} color="#9b6a3e" position={[0.45, 1.03, 0]} outline={0.008} />
          <Ball r={0.035} color="#c9c9c9" position={[0.8, 1.0, 0.04]} outline={false} />
        </group>
      </group>
      {/* paredes que fecham a parte da frente */}
      <mesh position={[-1.32, H / 2, 1.55]}>
        <planeGeometry args={[0.96, H]} />
        <ToonMat color="#f2c9a0" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.14, H / 2, 1.55]}>
        <planeGeometry args={[1.32, H]} />
        <ToonMat color="#f2c9a0" side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 2.2, 0.2]} intensity={0.7} distance={5} color="#ffe2b8" />
    </group>
  );
};

/* ---------------- ônibus ---------------- */

const busSideTexture = (night: boolean) => {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const x = c.getContext('2d')!;
  x.fillStyle = '#f2f2f2';
  x.fillRect(0, 0, 1024, 256);
  x.fillStyle = '#1f5fbf';
  x.fillRect(0, 168, 1024, 36);
  x.fillStyle = '#ffd23f';
  x.fillRect(0, 204, 1024, 10);
  for (let i = 0; i < 8; i++) {
    x.fillStyle = night ? '#f2c98a' : '#6f9fc8';
    x.fillRect(30 + i * 124, 34, 104, 104);
    x.strokeStyle = '#141414';
    x.lineWidth = 5;
    x.strokeRect(30 + i * 124, 34, 104, 104);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// Ônibus andando no eixo z (frente aponta para +z). Porta fica no lado -x.
export const Bus: React.FC<{position: [number, number, number]; door?: number; night?: boolean; lightsOn?: boolean}> = ({
  position,
  door = 0,
  night = true,
  lightsOn = true,
}) => {
  const side = useMemo(() => busSideTexture(night), [night]);
  const dest = useMemo(() => textTex(['ÚLTIMO · CENTRO'], {bg: '#111111', fg: '#ffb13d', w: 512, h: 96}), []);
  const L = 11;
  return (
    <group position={position}>
      <Box size={[2.5, 2.8, L]} color="#f2f2f2" position={[0, 1.75, 0]} outline={0.02} />
      {/* laterais com janelas acesas */}
      <mesh position={[-1.26, 1.85, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[L, 2.6]} />
        <meshToonMaterial map={side} />
      </mesh>
      <mesh position={[1.26, 1.85, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[L, 2.6]} />
        <meshToonMaterial map={side} />
      </mesh>
      {/* frente */}
      <Box size={[2.3, 1.3, 0.05]} color="#1c2a44" position={[0, 2.2, L / 2 + 0.01]} outline={0.01} />
      <TexPlane w={1.8} h={0.32} tex={dest} position={[0, 2.95, L / 2 + 0.04]} basic />
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, 0.85, L / 2 + 0.03]}>
          <circleGeometry args={[0.16, 20]} />
          <meshBasicMaterial color={lightsOn ? '#fff6d8' : '#777'} toneMapped={false} />
        </mesh>
      ))}
      {lightsOn && (
        <>
          <pointLight position={[0, 1.0, L / 2 + 2.5]} intensity={12} distance={14} color="#fff2cc" />
          <pointLight position={[0, 2.0, 0]} intensity={4} distance={6} color="#ffd9a0" />
        </>
      )}
      {/* rodas */}
      {[-1.2, 1.2].map((x) =>
        [-3.6, 3.4].map((z) => (
          <Cyl key={`${x}${z}`} r={0.5} h={0.3} color="#1a1a1a" position={[x, 0.5, z]} rotation={[0, 0, Math.PI / 2]} />
        )),
      )}
      {/* porta dianteira (lado -x), duas folhas que abrem */}
      <group position={[-1.28, 0, L / 2 - 1.3]}>
        <mesh position={[-0.01, 1.45, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.1, 2.3]} />
          <meshBasicMaterial color={door > 0.05 ? '#f3d29a' : '#2a2f3a'} toneMapped={false} />
        </mesh>
        <group position={[0, 0, 0.55]} rotation={[0, -door * 1.4, 0]}>
          <Box size={[0.06, 2.2, 0.55]} color="#9fc4d8" position={[0, 1.45, -0.27]} outline={0.008} />
        </group>
        <group position={[0, 0, -0.55]} rotation={[0, door * 1.4, 0]}>
          <Box size={[0.06, 2.2, 0.55]} color="#9fc4d8" position={[0, 1.45, 0.27]} outline={0.008} />
        </group>
        {/* degraus e luz interna */}
        <Box size={[0.5, 0.2, 1.0]} color="#3a3f47" position={[0.3, 0.45, 0]} outline={false} />
        {door > 0.3 && <pointLight position={[0.8, 2.0, 0]} intensity={3} distance={4} color="#ffe2b0" />}
      </group>
    </group>
  );
};

/* ---------------- ponto de ônibus ---------------- */

export const BusStop: React.FC<{frame: number; time?: TimeOfDay; bus?: {z: number; door: number}}> = ({frame, time = 'late', bus}) => {
  const sign = useMemo(() => textTex(['PONTO', 'DE ÔNIBUS'], {bg: '#1f5fbf', fg: '#ffffff', w: 256, h: 192, border: '#ffffff'}), []);
  return (
    <group>
      <Street time={time} frame={frame} />
      {/* abrigo do ponto */}
      <group position={[-4.6, 0.15, -2]}>
        <Box size={[1.4, 0.08, 3.4]} color="#7a7f88" position={[0, 2.5, 0]} outline={0.015} />
        <Box size={[0.08, 2.5, 0.08]} color="#7a7f88" position={[-0.6, 1.25, -1.6]} />
        <Box size={[0.08, 2.5, 0.08]} color="#7a7f88" position={[-0.6, 1.25, 1.6]} />
        <mesh position={[-0.62, 1.4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.2, 1.9]} />
          <meshToonMaterial color="#a8d0e0" transparent opacity={0.45} />
        </mesh>
        {/* banco */}
        <Box size={[0.45, 0.06, 2.4]} color="#8a5a32" position={[-0.25, 0.45, 0]} />
        <Box size={[0.06, 0.45, 0.06]} color="#555" position={[-0.25, 0.22, -1.1]} />
        <Box size={[0.06, 0.45, 0.06]} color="#555" position={[-0.25, 0.22, 1.1]} />
      </group>
      {/* placa */}
      <group position={[-3.7, 0.15, -0.1]}>
        <Cyl r={0.04} h={2.6} color="#9aa0a6" position={[0, 1.3, 0]} />
        <TexPlane w={0.6} h={0.45} tex={sign} position={[0, 2.4, 0.03]} basic />
        <mesh position={[0, 2.4, -0.03]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.6, 0.45]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
      {bus && <Bus position={[-2.0, 0, bus.z]} door={bus.door} night />}
    </group>
  );
};

/* ---------------- rua com casas (corrida) ---------------- */

export const StreetRun: React.FC<{frame: number; time?: TimeOfDay}> = ({frame, time = 'late'}) => (
  <group>
    <Street time={time} frame={frame} />
    <House pos={[-6, 0, 1]} rotY={Math.PI / 2} wall="#9cc7e6" gate="#7a7a7a" />
    <House pos={[-6, 0, -3]} rotY={Math.PI / 2} wall="#f2d17a" gate="#c62d2d" />
    <House pos={[-6, 0, -7]} rotY={Math.PI / 2} wall="#e9a3b8" gate="#2f5fbf" />
    <House pos={[-6, 0, -11]} rotY={Math.PI / 2} wall="#a6d6a0" gate="#555555" />
  </group>
);

/* ---------------- dentro do ônibus ---------------- */

export const BusInside: React.FC<{frame: number}> = ({frame}) => {
  const floor = useMemo(() => {
    const t = tileTex('#4a4f58', '#454a52', 4);
    t.repeat.set(1, 6);
    return t;
  }, []);
  const flicker = frame % 47 < 2 ? 0.55 : 1;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5]}>
        <planeGeometry args={[2.5, 12]} />
        <ToonMat map={floor} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.3, -5]}>
        <planeGeometry args={[2.5, 12]} />
        <ToonMat color="#d9dde2" />
      </mesh>
      {/* faixas de luz */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 2.28, -5]}>
          <boxGeometry args={[0.12, 0.03, 10]} />
          <meshBasicMaterial color={flicker < 1 ? '#a8a08a' : '#fff4d6'} />
        </mesh>
      ))}
      <pointLight position={[0, 2.0, -3]} intensity={3 * flicker} distance={7} color="#ffe8c0" />
      <pointLight position={[0, 2.0, -8]} intensity={3 * flicker} distance={7} color="#ffe8c0" />
      {/* paredes com janelas escuras */}
      {[-1.25, 1.25].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.55, -5]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            <planeGeometry args={[12, 1.1]} />
            <ToonMat color="#e6e6e6" />
          </mesh>
          <mesh position={[x, 1.6, -5]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            <planeGeometry args={[12, 1.0]} />
            <meshBasicMaterial color="#141c34" />
          </mesh>
          {Array.from({length: 8}).map((_, i) => (
            <Box key={i} size={[0.05, 1.0, 0.06]} color="#cfcfcf" position={[x * 0.99, 1.6, 0.5 - i * 1.4]} outline={false} />
          ))}
        </group>
      ))}
      <mesh position={[0, 1.15, -10.6]}>
        <planeGeometry args={[2.5, 2.3]} />
        <meshBasicMaterial color="#141c34" />
      </mesh>
      {/* bancos virados pra frente (+z) */}
      {Array.from({length: 6}).map((_, i) =>
        [-0.72, 0.72].map((x) => (
          <group key={`${i}${x}`} position={[x, 0, -1.6 - i * 1.25]}>
            <Box size={[0.95, 0.12, 0.5]} color="#2f5fbf" position={[0, 0.5, 0]} />
            <Box size={[0.95, 0.65, 0.1]} color="#2f5fbf" position={[0, 0.85, -0.25]} />
            <Box size={[0.06, 0.45, 0.06]} color="#777" position={[0, 0.22, 0]} outline={false} />
          </group>
        )),
      )}
      {/* banco de trás inteiro */}
      <group position={[0, 0, -9.9]}>
        <Box size={[2.4, 0.12, 0.55]} color="#2f5fbf" position={[0, 0.55, 0]} />
        <Box size={[2.4, 0.75, 0.1]} color="#2f5fbf" position={[0, 0.95, -0.28]} />
      </group>
      {/* barras amarelas */}
      {[-0.22, 0.22].map((x) => (
        <Cyl key={x} r={0.025} h={10} color="#f2c14e" position={[x, 2.05, -5]} rotation={[Math.PI / 2, 0, 0]} />
      ))}
      {[-2.2, -4.7, -7.2].map((z) => (
        <Cyl key={z} r={0.025} h={2.3} color="#f2c14e" position={[0.28, 1.15, z]} />
      ))}
    </group>
  );
};
