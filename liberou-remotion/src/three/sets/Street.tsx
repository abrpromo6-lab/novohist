import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Box, Cyl, Ball, ToonMat, rng} from '../toon';
import {Sky, tileTex} from './common';
import type {TimeOfDay} from './common';

const facadeTex = (wall: string, night: boolean, seed: number) => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 256, 512);
  const r = rng(seed);
  for (let fl = 0; fl < 4; fl++)
    for (let w = 0; w < 3; w++) {
      const x = 22 + w * 80;
      const y = 40 + fl * 120;
      const lit = night && r() > 0.6;
      ctx.fillStyle = lit ? '#f7d36b' : night ? '#1c2244' : '#5b8fc0';
      ctx.fillRect(x, y, 52, 62);
      ctx.strokeStyle = '#141414';
      ctx.lineWidth = 5;
      ctx.strokeRect(x, y, 52, 62);
      // tábuas pregadas em algumas janelas
      if (r() > 0.55) {
        ctx.fillStyle = '#8a5a32';
        ctx.save();
        ctx.translate(x + 26, y + 31);
        ctx.rotate(0.5);
        ctx.fillRect(-36, -6, 72, 12);
        ctx.rotate(-1);
        ctx.fillRect(-36, -6, 72, 12);
        ctx.restore();
      }
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const Block: React.FC<{pos: [number, number, number]; rotY: number; wall: string; night: boolean; seed: number}> = ({
  pos,
  rotY,
  wall,
  night,
  seed,
}) => {
  const tex = useMemo(() => facadeTex(wall, night, seed), [wall, night, seed]);
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Box size={[5, 8, 4]} color={wall} position={[0, 4, 0]} outline={0.03} />
      <mesh position={[0, 4, 2.01]}>
        <planeGeometry args={[5, 8]} />
        <ToonMat map={tex} />
      </mesh>
      <Box size={[5.2, 0.2, 4.2]} color="#7a7a7a" position={[0, 8.1, 0]} outline={0.02} />
      {/* caixa d'água */}
      <Cyl r={0.5} h={0.7} color="#3a78c2" position={[1.4, 8.55, 0.6]} outline={0.02} />
    </group>
  );
};

// Casinha térrea com portão (o portão da família é verde)
export const House: React.FC<{
  pos: [number, number, number];
  rotY?: number;
  wall: string;
  gate: string;
  night?: boolean;
}> = ({pos, rotY = 0, wall, gate, night}) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Box size={[3.2, 2.8, 3]} color={wall} position={[0, 1.4, -1.6]} outline={0.02} />
    <Box size={[0.8, 0.9, 0.05]} color={night ? '#1c2244' : '#5b8fc0'} position={[-0.8, 1.7, -0.08]} />
    <Box size={[0.95, 0.12, 0.06]} color="#8a5a32" position={[-0.8, 1.75, -0.03]} rotation={[0, 0, 0.3]} />
    <Box size={[0.95, 0.12, 0.06]} color="#8a5a32" position={[-0.8, 1.65, -0.03]} rotation={[0, 0, -0.3]} />
    {/* muro */}
    <Box size={[0.9, 1.9, 0.2]} color={wall} position={[-1.15, 0.95, 0.8]} outline={0.015} />
    <Box size={[0.4, 1.9, 0.2]} color={wall} position={[1.4, 0.95, 0.8]} outline={0.015} />
    {/* portão de grade */}
    <group position={[0.35, 0, 0.8]}>
      <Box size={[1.7, 0.08, 0.06]} color={gate} position={[0, 1.8, 0]} outline={0.008} />
      <Box size={[1.7, 0.08, 0.06]} color={gate} position={[0, 0.1, 0]} outline={0.008} />
      <Box size={[1.7, 0.06, 0.06]} color={gate} position={[0, 0.95, 0]} outline={0.008} />
      {Array.from({length: 13}).map((_, i) => (
        <Box key={i} size={[0.04, 1.75, 0.04]} color={gate} position={[-0.8 + i * 0.133, 0.95, 0]} outline={0.006} />
      ))}
      <Box size={[1.7, 0.85, 0.02]} color={gate} position={[0, 0.5, -0.02]} outline={0.008} />
    </group>
  </group>
);

export const Neighbor: React.FC<{children: React.ReactNode}> = ({children}) => <>{children}</>;

export const Street: React.FC<{time?: TimeOfDay; frame: number; sparks?: boolean}> = ({time = 'dusk', frame, sparks}) => {
  const night = time === 'night';
  const asphalt = useMemo(() => {
    const t = tileTex('#5d5f66', '#575960', 4);
    t.repeat.set(4, 20);
    return t;
  }, []);
  const walls = ['#e9a38a', '#f2d17a', '#9cc7e6', '#e3e3e3', '#c9a0dc', '#a6d6a0'];
  return (
    <group>
      <Sky time={time} radius={80} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 80]} />
        <ToonMat map={asphalt} />
      </mesh>
      {/* calçadas */}
      {[-4.2, 4.2].map((x) => (
        <Box key={x} size={[1.4, 0.15, 80]} color="#a9a59c" position={[x, 0.075, 0]} outline={0.01} />
      ))}
      {/* blocos do conjunto */}
      {Array.from({length: 7}).map((_, i) => (
        <React.Fragment key={i}>
          <Block pos={[-8.2, 0, 6 - i * 6.2]} rotY={Math.PI / 2} wall={walls[i % 6]} night={night} seed={i * 11 + 3} />
          <Block pos={[8.2, 0, 3 - i * 6.2]} rotY={-Math.PI / 2} wall={walls[(i + 3) % 6]} night={night} seed={i * 7 + 5} />
        </React.Fragment>
      ))}
      {/* postes e fios */}
      {Array.from({length: 6}).map((_, i) => (
        <group key={i} position={[3.8, 0, 4 - i * 8]}>
          <Cyl r={0.1} h={6.5} color="#8c8c8c" position={[0, 3.25, 0]} outline={0.015} />
          <Box size={[1.2, 0.08, 0.08]} color="#6d6d6d" position={[-0.6, 6.2, 0]} />
          <mesh position={[-1.1, 6.1, 0]}>
            <sphereGeometry args={[0.16, 12, 10]} />
            <meshBasicMaterial color={night ? '#ffd27a' : '#fff1c6'} />
          </mesh>
          {night && <pointLight position={[-1.1, 5.8, 0]} intensity={14} distance={11} color="#ffc26a" />}
          <Cyl r={0.012} h={8} color="#111" position={[0, 6.4, -4]} rotation={[Math.PI / 2, 0, 0]} outline={false} />
          <Cyl r={0.012} h={9} color="#111" position={[-3.8, 6.0, 0]} rotation={[0, 0, Math.PI / 2]} outline={false} />
        </group>
      ))}
      {/* faíscas de solda num portão */}
      {sparks &&
        Array.from({length: 10}).map((_, i) => {
          const r = rng(i * 31 + Math.floor(frame / 2));
          return (
            <mesh key={i} position={[3.2 + r() * 0.4, 1.0 + r() * 0.5, -6 + r() * 0.4]}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshBasicMaterial color={r() > 0.5 ? '#fff3a0' : '#ffb13d'} />
            </mesh>
          );
        })}
    </group>
  );
};

export {Ball};
