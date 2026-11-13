import React from 'react';
import * as THREE from 'three';
import {Box, Cyl, ToonMat, useCanvasTex} from './toon';

export type HandPose = 'none' | 'idle' | 'reach' | 'basket' | 'basketLow' | 'phone' | 'gate' | 'run';

const SKIN = '#5a3620';
const SLEEVE = '#7d7f86';

// Uma mão/antebraço, apontando pra -z (pra frente)
const Arm: React.FC<{side: 1 | -1; palmUp?: boolean; watch?: boolean; grip?: boolean}> = ({side, palmUp, watch, grip}) => (
  <group rotation={[0, 0, palmUp ? side * Math.PI * 0.95 : 0]}>
    {/* manga do moletom */}
    <Box size={[0.11, 0.1, 0.24]} color={SLEEVE} position={[0, 0, 0.1]} outline={0.006} />
    {/* punho */}
    <Box size={[0.085, 0.07, 0.12]} color={SKIN} position={[0, 0, -0.04]} outline={0.005} />
    {watch && (
      <group position={[0, 0.04, -0.03]}>
        <Box size={[0.095, 0.02, 0.05]} color="#151515" outline={0.004} />
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 0.03]} />
          <meshBasicMaterial color="#9fb59a" />
        </mesh>
      </group>
    )}
    {/* palma */}
    <Box size={[0.1, 0.035, 0.1]} color={SKIN} position={[0, 0, -0.14]} outline={0.005} />
    {/* dedos */}
    {[-0.036, -0.012, 0.012, 0.036].map((x, i) => (
      <group key={x} position={[x, 0, -0.19]} rotation={[grip ? 1.3 : 0.15, 0, 0]}>
        <Box size={[0.02, 0.022, i === 0 || i === 3 ? 0.055 : 0.065]} color={SKIN} position={[0, 0, -0.03]} outline={0.004} />
        {/* unha */}
        <Box size={[0.014, 0.004, 0.014]} color="#e9d2c0" position={[0, 0.012, -0.055]} outline={false} />
      </group>
    ))}
    {/* polegar */}
    <group position={[-side * 0.055, 0, -0.12]} rotation={[0, side * 0.7, 0]}>
      <Box size={[0.022, 0.024, 0.06]} color={SKIN} position={[0, 0, -0.03]} outline={0.004} />
    </group>
  </group>
);

export const Basket: React.FC<{contents?: boolean}> = ({contents}) => {
  const slots = useCanvasTex(
    128,
    64,
    (c) => {
      c.fillStyle = '#d42a2a';
      c.fillRect(0, 0, 128, 64);
      c.fillStyle = '#7a0f0f';
      for (let x = 6; x < 128; x += 14) for (let y = 8; y < 60; y += 18) c.fillRect(x, y, 8, 12);
    },
    [],
  );
  return (
    <group>
      {/* paredes */}
      {(
        [
          [[0.44, 0.2, 0.01], [0, 0, 0.14]],
          [[0.44, 0.2, 0.01], [0, 0, -0.14]],
          [[0.01, 0.2, 0.28], [0.22, 0, 0]],
          [[0.01, 0.2, 0.28], [-0.22, 0, 0]],
          [[0.44, 0.01, 0.28], [0, -0.1, 0]],
        ] as [[number, number, number], [number, number, number]][]
      ).map(([s, p], i) => (
        <Box key={i} size={s} color="#ffffff" map={slots} position={p} outline={0.006} />
      ))}
      {/* alça */}
      <Box size={[0.36, 0.025, 0.03]} color="#1b1b1b" position={[0, 0.13, 0]} outline={0.004} />
      {contents && (
        <group>
          <Box size={[0.16, 0.12, 0.1]} color="#f4f1e6" position={[-0.09, -0.03, 0]} outline={0.005} />
          {[0, 1, 2].map((i) => (
            <Cyl key={i} r={0.015} h={0.2} color="#fffbe8" position={[0.08 + i * 0.035, 0, 0.02]} rotation={[0.3, 0, 0]} outline={0.003} />
          ))}
          <Box size={[0.08, 0.05, 0.05]} color="#3a3a3a" position={[0.12, -0.05, -0.06]} outline={0.004} />
        </group>
      )}
    </group>
  );
};

export const Phone: React.FC<{tex: THREE.Texture}> = ({tex}) => (
  <group>
    <Box size={[0.13, 0.26, 0.012]} color="#1a1a1a" outline={0.005} />
    <mesh position={[0, 0, 0.007]}>
      <planeGeometry args={[0.118, 0.245]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  </group>
);

const HandsInner: React.FC<{pose: HandPose; frame: number; phoneTex?: THREE.Texture; basketContents?: boolean}> = ({
  pose,
  frame,
  phoneTex,
  basketContents = true,
}) => {
  if (pose === 'none') return null;
  const bob = Math.sin(frame / 7) * (pose === 'run' ? 0.03 : 0.006);
  if (pose === 'basket' || pose === 'basketLow') {
    const low = pose === 'basketLow';
    return (
      <group position={[0, (low ? -0.5 : -0.38) + bob, -0.5]} rotation={[0.35, 0, 0]}>
        <group position={[0, -0.04, -0.05]}>
          <Basket contents={basketContents} />
        </group>
        <group position={[-0.1, 0.11, 0.2]} rotation={[0.1, 0.25, 0]}>
          <Arm side={-1} watch grip />
        </group>
        <group position={[0.1, 0.11, 0.2]} rotation={[0.1, -0.25, 0]}>
          <Arm side={1} grip />
        </group>
      </group>
    );
  }
  if (pose === 'reach') {
    return (
      <group position={[0, -0.27 + bob, -0.42]}>
        <group position={[-0.13, 0, 0]} rotation={[0.2, 0.2, 0]}>
          <Arm side={-1} watch palmUp />
        </group>
        <group position={[0.13, 0, 0]} rotation={[0.2, -0.2, 0]}>
          <Arm side={1} palmUp />
        </group>
      </group>
    );
  }
  if (pose === 'phone') {
    // celular grande no centro, mão esquerda segurando por baixo, polegar na lateral
    return (
      <group position={[0, 0.07 + bob * 0.4, -0.33]}>
        <pointLight position={[0, 0.05, 0.12]} intensity={0.5} distance={0.7} color="#cfe0ff" />
        <group rotation={[0.04, 0, 0]} scale={1.45}>
          {phoneTex && <Phone tex={phoneTex} />}
        </group>
        <group position={[-0.01, -0.3, 0.07]} rotation={[1.45, 0.05, 0]}>
          <Arm side={-1} watch grip />
        </group>
        <group position={[0.21, -0.27, 0.08]} rotation={[0.55, -0.35, 0]}>
          <Arm side={1} />
        </group>
      </group>
    );
  }
  if (pose === 'gate') {
    return (
      <group position={[0, -0.2 + bob, -0.45]}>
        <group position={[-0.14, 0, 0]} rotation={[-0.2, 0.15, 0]}>
          <Arm side={-1} watch />
        </group>
        <group position={[0.14, 0, 0]} rotation={[-0.2, -0.15, 0]}>
          <Arm side={1} />
        </group>
      </group>
    );
  }
  // idle / run
  const sw = pose === 'run' ? Math.sin(frame / 3) * 0.12 : 0;
  return (
    <group position={[0, -0.36 + bob, -0.4]}>
      <group position={[-0.24, sw, 0]} rotation={[0.35, 0.25, 0.2]}>
        <Arm side={-1} watch />
      </group>
      <group position={[0.24, -sw, 0]} rotation={[0.35, -0.25, -0.2]}>
        <Arm side={1} />
      </group>
    </group>
  );
};

export {ToonMat};

// Afasta e aumenta as mãos na mesma proporção: mesmo tamanho na tela, menos distorção da lente
export const Hands: React.FC<{pose: HandPose; frame: number; phoneTex?: THREE.Texture; basketContents?: boolean}> = (p) => (
  <group scale={1.25} position={[0, -0.12, 0]}>
    <HandsInner {...p} />
  </group>
);
