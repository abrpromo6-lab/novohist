import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Box, Cyl, Ball, ToonMat, useCanvasTex} from '../toon';
import {Sky, tileTex} from './common';
import type {TimeOfDay} from './common';

// Cozinha da casa da família (Conjunto Esperança). Câmera padrão em z≈1.4 olhando -z.
export const Kitchen: React.FC<{time?: TimeOfDay}> = ({time = 'dusk'}) => {
  const floor = useMemo(() => {
    const t = tileTex('#d9c9a8', '#c4b08c', 8);
    t.repeat.set(3, 3);
    return t;
  }, []);
  const wallTile = useMemo(() => {
    const t = tileTex('#f1ece0', '#e6dfcf', 12);
    t.repeat.set(2, 1);
    return t;
  }, []);
  const cloth = useCanvasTex(
    256,
    256,
    (c) => {
      c.fillStyle = '#f4efe2';
      c.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 26; i++) {
        const x = (i * 71) % 256;
        const y = (i * 113) % 256;
        c.fillStyle = i % 2 ? '#e0533d' : '#e88a3d';
        for (let p = 0; p < 5; p++) {
          c.beginPath();
          c.ellipse(x + Math.cos((p / 5) * 6.28) * 9, y + Math.sin((p / 5) * 6.28) * 9, 7, 5, (p / 5) * 6.28, 0, 6.28);
          c.fill();
        }
        c.fillStyle = '#4c9a4c';
        c.fillRect(x + 8, y + 8, 10, 4);
      }
    },
    [],
  );
  const W = 4.2;
  const D = 4.4;
  const H = 2.7;
  return (
    <group>
      <Sky time={time} />
      {/* piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[W, D + 2]} />
        <ToonMat map={floor} />
      </mesh>
      {/* teto */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D + 2]} />
        <ToonMat color="#e9e3d6" />
      </mesh>
      {/* paredes laterais */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-W / 2, H / 2, 0]}>
        <planeGeometry args={[D + 2, H]} />
        <ToonMat color="#9fc7b8" side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[W / 2, H / 2, 0]}>
        <planeGeometry args={[D + 2, H]} />
        <ToonMat color="#9fc7b8" side={THREE.DoubleSide} />
      </mesh>
      {/* parede de trás com janela (vazada) */}
      {(
        [
          [W, 0.95, [0, 0.475]],
          [W, 0.75, [0, H - 0.375]],
          [1.35, 1.0, [-W / 2 + 0.675, 1.45]],
          [1.85, 1.0, [W / 2 - 0.925, 1.45]],
        ] as [number, number, [number, number]][]
      ).map(([w, h, [x, y]], i) => (
        <mesh key={i} position={[x, y, -D / 2]}>
          <planeGeometry args={[w, h]} />
          <ToonMat map={i === 0 ? wallTile : null} color={i === 0 ? '#ffffff' : '#9fc7b8'} />
        </mesh>
      ))}
      {/* moldura e tábuas pregadas na janela */}
      <Box size={[1.05, 0.06, 0.08]} color="#d7d2c6" position={[-0.05, 0.97, -D / 2 + 0.02]} />
      <Box size={[1.05, 0.06, 0.08]} color="#d7d2c6" position={[-0.05, 1.93, -D / 2 + 0.02]} />
      <Box size={[0.75, 0.13, 0.04]} color="#8a5a32" position={[-0.05, 1.7, -D / 2 + 0.06]} rotation={[0, 0, 0.12]} />
      <Box size={[0.75, 0.13, 0.04]} color="#7a4e2a" position={[-0.05, 1.2, -D / 2 + 0.06]} rotation={[0, 0, -0.08]} />
      {[[-0.38, 1.7], [0.28, 1.74], [-0.38, 1.17], [0.28, 1.23]].map(([x, y], i) => (
        <Ball key={i} r={0.012} color="#cfcfcf" position={[x - 0.05, y, -D / 2 + 0.09]} outline={false} />
      ))}
      {/* geladeira */}
      <group position={[-1.55, 0, -1.75]}>
        <Box size={[0.75, 1.75, 0.65]} color="#f4f4f0" position={[0, 0.875, 0]} />
        <Box size={[0.04, 0.3, 0.05]} color="#9a9a9a" position={[0.3, 1.25, 0.34]} />
        <Box size={[0.12, 0.12, 0.01]} color="#4c9a4c" position={[-0.1, 1.4, 0.33]} />
        <Box size={[0.16, 0.1, 0.01]} color="#f2c14e" position={[0.1, 1.1, 0.33]} />
        {/* vaso de planta em cima */}
        <Cyl r={0.1} h={0.14} color="#b5532d" position={[0, 1.82, 0]} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Ball key={i} r={0.09} color="#3f8f3f" position={[Math.cos(i) * 0.12, 1.95 + (i % 2) * 0.05, Math.sin(i) * 0.1]} />
        ))}
      </group>
      {/* pia e fogão */}
      <group position={[1.15, 0, -1.85]}>
        <Box size={[1.6, 0.88, 0.6]} color="#c9b48f" position={[0, 0.44, 0]} />
        <Box size={[1.62, 0.05, 0.62]} color="#e4e1da" position={[0, 0.9, 0]} />
        <Box size={[0.5, 0.06, 0.38]} color="#9aa3a8" position={[-0.4, 0.92, 0]} />
        <Cyl r={0.02} h={0.28} color="#b0b0b0" position={[-0.4, 1.06, -0.2]} />
        {/* fogão */}
        <Box size={[0.6, 0.86, 0.58]} color="#efefef" position={[0.95, 0.43, 0.02]} />
        <Box size={[0.48, 0.32, 0.01]} color="#2a2a2a" position={[0.95, 0.42, 0.32]} />
        <Cyl r={0.15} h={0.2} color="#c7c7c7" position={[0.85, 0.98, 0]} />
        {/* azulejo sobre a pia */}
        <mesh position={[0.2, 1.35, -0.29]}>
          <planeGeometry args={[2.2, 0.8]} />
          <ToonMat map={wallTile} />
        </mesh>
      </group>
      {/* mesa com toalha florida */}
      <group position={[-1.3, 0, 0.1]}>
        <Box size={[1.0, 0.06, 0.8]} color="#ffffff" map={cloth} position={[0, 0.78, 0]} />
        <Box size={[1.02, 0.25, 0.01]} color="#ffffff" map={cloth} position={[0, 0.66, 0.4]} />
        {[[-0.42, -0.32], [0.42, -0.32], [-0.42, 0.32], [0.42, 0.32]].map(([x, z], i) => (
          <Box key={i} size={[0.06, 0.76, 0.06]} color="#7a5232" position={[x, 0.38, z]} />
        ))}
        <Cyl r={0.08} h={0.2} color="#e0e0e0" position={[0.2, 0.9, 0]} />
        <Box size={[0.12, 0.24, 0.08]} color="#f2c14e" position={[-0.2, 0.93, 0.05]} />
      </group>
      {/* lâmpada */}
      <Cyl r={0.006} h={0.4} color="#222" position={[0, H - 0.2, -0.3]} outline={false} />
      <mesh position={[0, H - 0.45, -0.3]}>
        <sphereGeometry args={[0.08, 16, 12]} />
        <meshBasicMaterial color="#fff6d0" />
      </mesh>
      <pointLight position={[0, H - 0.6, 1.2]} intensity={0.8} distance={5} color="#ffe8b0" />
    </group>
  );
};
