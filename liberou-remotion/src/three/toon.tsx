import React, {useMemo} from 'react';
import * as THREE from 'three';


// Gradiente de 3 tons = sombreado "de desenho"
let _grad: THREE.DataTexture | null = null;
export const toonGradient = () => {
  if (_grad) return _grad;
  const data = new Uint8Array([110, 190, 255]);
  const t = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  _grad = t;
  return t;
};

export const ToonMat: React.FC<{
  color?: string;
  map?: THREE.Texture | null;
  transparent?: boolean;
  side?: THREE.Side;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
}> = ({color = '#ffffff', map, transparent, side, emissive, emissiveIntensity, opacity}) => (
  <meshToonMaterial
    color={color}
    map={map ?? null}
    gradientMap={toonGradient()}
    transparent={transparent}
    side={side ?? THREE.FrontSide}
    emissive={emissive ?? '#000000'}
    emissiveIntensity={emissiveIntensity ?? 0}
    opacity={opacity ?? 1}
  />
);

type V3 = [number, number, number];

// Contorno preto "casca invertida": desenha só o lado de dentro de uma cópia maior
export const InkMat: React.FC = () => <meshBasicMaterial color="#141414" side={THREE.BackSide} />;

export const Box: React.FC<{
  size: V3;
  color: string;
  position?: V3;
  rotation?: V3;
  outline?: number | false;
  map?: THREE.Texture | null;
  children?: React.ReactNode;
}> = ({size, color, position, rotation, outline = 0.012, map, children}) => (
  <mesh position={position} rotation={rotation}>
    <boxGeometry args={size} />
    <ToonMat color={color} map={map} />
    {outline !== false && (
      <mesh>
        <boxGeometry args={[size[0] + outline * 2, size[1] + outline * 2, size[2] + outline * 2]} />
        <InkMat />
      </mesh>
    )}
    {children}
  </mesh>
);

export const Ball: React.FC<{
  r: number;
  color: string;
  position?: V3;
  scale?: V3;
  outline?: number | false;
}> = ({r, color, position, scale, outline = 0.012}) => (
  <mesh position={position} scale={scale}>
    <sphereGeometry args={[r, 20, 16]} />
    <ToonMat color={color} />
    {outline !== false && (
      <mesh>
        <sphereGeometry args={[r + outline, 20, 16]} />
        <InkMat />
      </mesh>
    )}
  </mesh>
);

export const Cyl: React.FC<{
  r: number;
  h: number;
  color: string;
  position?: V3;
  rotation?: V3;
  outline?: number | false;
  transparent?: boolean;
  opacity?: number;
}> = ({r, h, color, position, rotation, outline = 0.012, transparent, opacity}) => (
  <mesh position={position} rotation={rotation}>
    <cylinderGeometry args={[r, r, h, 16]} />
    <ToonMat color={color} transparent={transparent} opacity={opacity} />
    {outline !== false && !transparent && (
      <mesh>
        <cylinderGeometry args={[r + outline, r + outline, h + outline * 2, 16]} />
        <InkMat />
      </mesh>
    )}
  </mesh>
);

// Plano com textura de canvas (placas, céu, rostos)
export const TexPlane: React.FC<{
  w: number;
  h: number;
  tex: THREE.Texture;
  position?: V3;
  rotation?: V3;
  basic?: boolean;
  transparent?: boolean;
}> = ({w, h, tex, position, rotation, basic, transparent = true}) => (
  <mesh position={position} rotation={rotation}>
    <planeGeometry args={[w, h]} />
    {basic ? (
      <meshBasicMaterial map={tex} transparent={transparent} toneMapped={false} />
    ) : (
      <meshToonMaterial map={tex} transparent={transparent} gradientMap={toonGradient()} />
    )}
  </mesh>
);

// RNG com semente: mesma cena = mesmo resultado em todo frame
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

export const useCanvasTex = (
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  deps: unknown[],
) =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    draw(ctx);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

export const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];
