import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {Box, Cyl, ToonMat, TexPlane, rng, toonGradient} from '../toon';
import {textTex, tileTex} from './common';
import {maskTexture} from '../Character';

export type Section = 'food' | 'hardware' | 'party';

type Item = {p: [number, number, number]; s: [number, number, number]; c: string};

// Muitos produtos num só draw call
const Instanced: React.FC<{items: Item[]; geo?: 'box' | 'cyl'}> = ({items, geo = 'box'}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.scale.set(...it.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, new THREE.Color(it.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      {geo === 'box' ? <boxGeometry args={[1, 1, 1]} /> : <cylinderGeometry args={[0.5, 0.5, 1, 12]} />}
      <meshToonMaterial gradientMap={toonGradient()} />
    </instancedMesh>
  );
};

const FOOD = ['#e0533d', '#f2c14e', '#3c8fd6', '#7bc96f', '#ffffff', '#e88a3d', '#b56bd6', '#d9d0b8'];
const PARTY = ['#ff4fa3', '#ffd400', '#2ec4ff', '#7cff6b', '#ff7a1a', '#b56bd6'];

const Shelf: React.FC<{x: number; z0: number; len: number; side: 1 | -1; section: Section; seed: number}> = ({
  x,
  z0,
  len,
  side,
  section,
  seed,
}) => {
  const {boxes, cyls} = useMemo(() => {
    const r = rng(seed);
    const boxes: Item[] = [];
    const cyls: Item[] = [];
    const levels = [0.25, 0.75, 1.25, 1.75];
    for (const y of levels) {
      // prateleira esvaziada (todo mundo comprando): buracos
      for (let z = z0; z > z0 - len; z -= 0.22) {
        if (r() < (section === 'hardware' ? 0.55 : 0.35)) continue;
        if (section === 'food') {
          if (r() > 0.5) {
            const h = 0.14 + r() * 0.1;
            cyls.push({p: [x - side * 0.05, y + h / 2 + 0.03, z], s: [0.13, h, 0.13], c: FOOD[Math.floor(r() * FOOD.length)]});
          } else {
            const h = 0.2 + r() * 0.15;
            boxes.push({p: [x - side * 0.05, y + h / 2 + 0.03, z], s: [0.22, h, 0.17], c: FOOD[Math.floor(r() * FOOD.length)]});
          }
        } else if (section === 'hardware') {
          // cadeados e rolos de corrente
          boxes.push({p: [x - side * 0.05, y + 0.1, z], s: [0.1, 0.12, 0.05], c: r() > 0.5 ? '#d4a72c' : '#9aa0a6'});
        } else {
          const h = 0.15 + r() * 0.2;
          if (r() > 0.5) cyls.push({p: [x - side * 0.05, y + h / 2 + 0.03, z], s: [0.14, h, 0.14], c: PARTY[Math.floor(r() * PARTY.length)]});
          else boxes.push({p: [x - side * 0.05, y + h / 2 + 0.03, z], s: [0.2, h, 0.16], c: PARTY[Math.floor(r() * PARTY.length)]});
        }
      }
    }
    return {boxes, cyls};
  }, [x, z0, len, side, section, seed]);
  const masks = useMemo(() => {
    if (section !== 'party') return [];
    const r = rng(seed + 9);
    return Array.from({length: 10}).map((_, i) => ({
      z: z0 - 0.4 - i * (len / 10),
      y: [0.5, 1.0, 1.5][i % 3],
      s: r(),
    }));
  }, [section, seed, z0, len]);
  return (
    <group>
      {/* estrutura */}
      <Box size={[0.5, 2.1, len]} color="#c7ccd2" position={[x + side * 0.2, 1.05, z0 - len / 2]} outline={0.02} />
      {[0.22, 0.72, 1.22, 1.72, 2.1].map((y) => (
        <Box key={y} size={[0.62, 0.04, len]} color="#e9ecef" position={[x, y, z0 - len / 2]} outline={0.008} />
      ))}
      <Instanced items={boxes} />
      <Instanced items={cyls} geo="cyl" />
      {masks.map((m, i) => (
        <mesh key={i} position={[x - side * 0.1, m.y + 0.2, m.z]} rotation={[0, -side * Math.PI / 2, 0]}>
          <planeGeometry args={[0.22, 0.25]} />
          <meshToonMaterial map={maskTexture(0.3 + m.s * 0.7)} transparent alphaTest={0.3} />
        </mesh>
      ))}
      {section === 'hardware' &&
        // correntes penduradas
        Array.from({length: 6}).map((_, i) => (
          <group key={i} position={[x - side * 0.12, 1.95, z0 - 0.6 - i * (len / 6)]}>
            {Array.from({length: 9}).map((__, k) => (
              <mesh key={k} position={[0, -k * 0.07, 0]} rotation={[0, k % 2 ? Math.PI / 2 : 0, 0]}>
                <torusGeometry args={[0.03, 0.009, 6, 10]} />
                <ToonMat color="#8f969c" />
              </mesh>
            ))}
          </group>
        ))}
    </group>
  );
};

// Bandeirinhas
const Bunting: React.FC<{z0: number; len: number}> = ({z0, len}) => (
  <group>
    {Array.from({length: Math.floor(len / 0.35)}).map((_, i) => (
      <mesh key={i} position={[i % 2 ? 0.75 : -0.75, 2.5 - (i % 3) * 0.04, z0 - Math.floor(i / 2) * 0.7]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.1, 0.18, 3]} />
        <ToonMat color={PARTY[i % PARTY.length]} />
      </mesh>
    ))}
  </group>
);

const Ceiling: React.FC<{z0: number; len: number; w: number}> = ({z0, len, w}) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.0, z0 - len / 2]}>
      <planeGeometry args={[w, len]} />
      <ToonMat color="#d9dde2" />
    </mesh>
    {Array.from({length: Math.floor(len / 2.2)}).map((_, i) => (
      <group key={i} position={[0, 2.95, z0 - 1 - i * 2.2]}>
        {[-0.9, 0.9].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.18, 0.05, 1.3]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

export const Market: React.FC<{layout: 'entrance' | 'aisle' | 'checkout'; section?: Section; showSign?: boolean}> = ({
  layout,
  section = 'food',
  showSign,
}) => {
  const floor = useMemo(() => {
    const t = tileTex('#eef0f2', '#d7dbe0', 8);
    t.repeat.set(4, 12);
    return t;
  }, []);
  const sign = useMemo(
    () => textTex(['SUPERMERCADO', 'ECONÔMICO'], {bg: '#d42a2a', fg: '#ffe14d', w: 768, h: 256, border: '#ffe14d'}),
    [],
  );
  const esgotado = useMemo(
    () => textTex(['CADEADO', 'ESGOTADO'], {bg: '#fffbe8', fg: '#c41f1f', w: 512, h: 320, border: '#141414'}),
    [],
  );
  const caixaSign = useMemo(() => textTex(['CAIXA 2'], {bg: '#1f5fbf', fg: '#ffffff', w: 384, h: 128}), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]}>
        <planeGeometry args={[14, 30]} />
        <ToonMat map={floor} />
      </mesh>
      {layout === 'aisle' && (
        <group>
          <Ceiling z0={4} len={20} w={4} />
          <Shelf x={-1.3} z0={3} len={14} side={-1} section={section} seed={section.length * 13 + 1} />
          <Shelf x={1.3} z0={3} len={14} side={1} section={section} seed={section.length * 17 + 7} />
          {/* parede de trás (atrás da câmera) */}
          <mesh position={[0, 1.5, 4.4]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[6, 3.2]} />
            <ToonMat color="#cfe3d8" />
          </mesh>
          {[-2.2, 2.2].map((x) => (
            <mesh key={x} position={[x, 1.5, -4]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
              <planeGeometry args={[17, 3.2]} />
              <ToonMat color="#cfe3d8" />
            </mesh>
          ))}
          {/* fundo do corredor */}
          <mesh position={[0, 1.5, -11.5]}>
            <planeGeometry args={[6, 3]} />
            <ToonMat color="#bfe0d0" />
          </mesh>
          {section === 'party' && <Bunting z0={2.5} len={12} />}
          {section === 'hardware' && showSign && (
            <TexPlane w={0.5} h={0.32} tex={esgotado} position={[1.02, 1.45, -0.9]} rotation={[0, -Math.PI / 2 + 0.3, 0.05]} basic />
          )}
        </group>
      )}
      {layout === 'entrance' && (
        <group>
          {/* fachada */}
          <Box size={[12, 4.2, 0.3]} color="#f2f2f2" position={[0, 2.1, -3]} outline={0.02} />
          <TexPlane w={4.2} h={1.4} tex={sign} position={[0, 3.35, -2.82]} basic />
          {/* porta de vidro aberta, mostra o interior */}
          <mesh position={[0, 1.15, -2.83]}>
            <planeGeometry args={[3.2, 2.3]} />
            <meshBasicMaterial color="#cfe6f2" />
          </mesh>
          {/* estacionamento/ calçada */}
          <Box size={[14, 0.12, 4]} color="#a9a59c" position={[0, 0.06, -0.8]} outline={0.01} />
          {/* carrinhos empilhados */}
          {[0, 1, 2].map((i) => (
            <group key={i} position={[-3.2 - i * 0.12, 0, -1.8]}>
              <Box size={[0.6, 0.5, 0.9]} color="#9aa3a8" position={[0, 0.7, 0]} outline={0.01} />
            </group>
          ))}
          <Box size={[0.25, 0.25, 0.25]} color="#f2c14e" position={[3.5, 3.9, -2.7]} />
        </group>
      )}
      {layout === 'checkout' && (
        <group>
          <Ceiling z0={4} len={16} w={10} />
          {[-5, 5].map((x) => (
            <mesh key={x} position={[x, 1.5, -2]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
              <planeGeometry args={[16, 3]} />
              <ToonMat color="#cfe3d8" />
            </mesh>
          ))}
          {/* prateleiras ao fundo */}
          {[-3.6, -1.4, 0.8, 3.0].map((x) => (
            <Box key={x} size={[1.6, 2, 0.5]} color="#e46f6f" position={[x, 1, -5.4]} outline={0.015} />
          ))}
          <mesh position={[0, 1.5, -6]}>
            <planeGeometry args={[12, 3]} />
            <ToonMat color="#bfe0d0" />
          </mesh>
          {/* caixas registradoras */}
          {[-2.2, 1.6].map((x) => (
            <group key={x} position={[x, 0, -2.5]}>
              <Box size={[0.8, 0.9, 2.4]} color="#3a3f47" position={[0, 0.45, 0]} outline={0.015} />
              <Box size={[0.82, 0.04, 2.42]} color="#202328" position={[0, 0.92, 0]} />
              <Box size={[0.35, 0.3, 0.3]} color="#d9d9d9" position={[0.1, 1.1, 0.7]} />
              <Cyl r={0.03} h={1.6} color="#9aa0a6" position={[0.35, 1.7, 0.9]} />
              <TexPlane w={0.5} h={0.17} tex={caixaSign} position={[0.35, 2.55, 0.9]} basic />
            </group>
          ))}
          {/* pilha de caixas de papelão (esconderijo) */}
          {(
            [
              [0.0, 0.3, 0.6],
              [0.65, 0.3, 0.6],
              [0.3, 0.9, 0.6],
              [0.0, 1.5, 0.6],
              [0.65, 0.9, 0.6],
            ] as [number, number, number][]
          ).map((p, i) => (
            <group key={i} position={[p[0] - 0.4, p[1], p[2]]}>
              <Box size={[0.6, 0.6, 0.6]} color="#c9955c" outline={0.012} />
              <Box size={[0.61, 0.08, 0.61]} color="#b5814a" outline={false} />
            </group>
          ))}
        </group>
      )}
    </group>
  );
};

// Objetos de mão para figurantes
export const Jug: React.FC = () => (
  <group position={[0, -0.15, 0.05]}>
    <Cyl r={0.13} h={0.38} color="#5fb4f0" transparent opacity={0.85} outline={0.008} />
    <Cyl r={0.05} h={0.08} color="#1f5fbf" position={[0, 0.23, 0]} outline={0.006} />
  </group>
);

export const ChainCoil: React.FC = () => (
  <group position={[0, -0.1, 0.06]}>
    {Array.from({length: 8}).map((_, k) => (
      <mesh key={k} position={[0, -k * 0.06, 0]} rotation={[0, k % 2 ? Math.PI / 2 : 0, 0]}>
        <torusGeometry args={[0.035, 0.01, 6, 10]} />
        <ToonMat color="#8f969c" />
      </mesh>
    ))}
  </group>
);

export const Padlock: React.FC = () => (
  <group position={[0, -0.05, 0.08]}>
    <Box size={[0.12, 0.1, 0.05]} color="#d4a72c" outline={0.006} />
    <mesh position={[0, 0.07, 0]}>
      <torusGeometry args={[0.04, 0.012, 6, 12, Math.PI]} />
      <ToonMat color="#9aa0a6" />
    </mesh>
  </group>
);

export const Cart: React.FC<{seed?: number}> = ({seed = 1}) => {
  const r = rng(seed);
  return (
    <group>
      <Box size={[0.55, 0.42, 0.8]} color="#aab2b8" position={[0, 0.72, 0]} outline={0.01} />
      {Array.from({length: 6}).map((_, i) => (
        <Box
          key={i}
          size={[0.16, 0.18, 0.16]}
          color={FOOD[Math.floor(r() * FOOD.length)]}
          position={[-0.15 + (i % 3) * 0.15, 0.98, -0.2 + Math.floor(i / 3) * 0.3]}
          outline={0.006}
        />
      ))}
      <Cyl r={0.11} h={0.34} color="#5fb4f0" position={[0.12, 1.05, 0.25]} transparent opacity={0.85} outline={0.006} />
      {[-0.22, 0.22].map((x) =>
        [-0.32, 0.32].map((z) => <Cyl key={`${x}${z}`} r={0.05} h={0.04} color="#222" position={[x, 0.05, z]} rotation={[0, 0, Math.PI / 2]} outline={false} />),
      )}
      <Box size={[0.03, 0.5, 0.03]} color="#aab2b8" position={[-0.2, 0.3, 0]} outline={false} />
      <Box size={[0.03, 0.5, 0.03]} color="#aab2b8" position={[0.2, 0.3, 0]} outline={false} />
    </group>
  );
};
