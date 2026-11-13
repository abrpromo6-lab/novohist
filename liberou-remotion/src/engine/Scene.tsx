import React, {useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Fisheye} from '@react-three/drei';
import {CAST, Character} from '../three/Character';
import {Hands} from '../three/Hands';
import {Kitchen} from '../three/sets/Kitchen';
import {House, Street} from '../three/sets/Street';
import {Cart, ChainCoil, Jug, Market, Padlock} from '../three/sets/Market';
import {Lights, Sky} from '../three/sets/common';
import {Bedroom, BusInside, BusStop, MaskProp, StreetRun} from '../three/sets/Ep02Sets';
import {Box} from '../three/toon';
import {activeSpeaker, Black, Captions, Glare, Grain, HookText, Peek, RedTint, Stamp, Vignette, VoteScreen, lineFrames} from './Overlays';
import type {Actor, SceneSpec, V3} from './types';

export const USE_FISHEYE = true;
export const FISH_ZOOM = 1.1;

export const sceneFrames = (s: SceneSpec, fps: number) => {
  const talk = s.lines.reduce((a, l) => a + lineFrames(l, fps), 0) + 14;
  return Math.max(talk, Math.round((s.minSec ?? 0) * fps));
};

const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// Posiciona câmera e mãos (as mãos seguem a câmera)
const Rig: React.FC<{spec: SceneSpec; frame: number; dur: number; children: React.ReactNode}> = ({spec, frame, dur, children}) => {
  const {camera} = useThree();
  const cam = spec.cam ?? {from: [0, 1.62, 1.4] as V3, look: [0, 1.5, -1] as V3};
  const {fps} = useVideoConfig();
  const moveDur = cam.fast ? cam.fast * fps : dur;
  const t = interpolate(frame, [0, moveDur], [0, 1], {
    extrapolateRight: 'clamp',
    easing: cam.fast ? Easing.out(Easing.cubic) : Easing.inOut(Easing.sin),
  });
  const pos = lerp3(cam.from, cam.to ?? cam.from, t);
  const look = lerp3(cam.look, cam.lookTo ?? cam.look, t);
  const sh = cam.shake ?? 0.012;
  pos[0] += Math.sin(frame / 11) * sh;
  pos[1] += Math.sin(frame / 7.3) * sh * 0.8;
  camera.position.set(...pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(new THREE.Vector3(...look));
  camera.updateMatrixWorld();
  return (
    <group position={camera.position.clone()} quaternion={camera.quaternion.clone()}>
      {children}
    </group>
  );
};

const holdFor = (h: Actor['hold']) => {
  if (h === 'jug') return <Jug />;
  if (h === 'chain') return <ChainCoil />;
  if (h === 'padlock') return <Padlock />;
  if (h === 'list')
    return (
      <group position={[0, -0.02, 0.08]} rotation={[-1.2, 0, 0]}>
        <Box size={[0.16, 0.22, 0.005]} color="#fbfbf2" outline={0.004} />
        <Box size={[0.15, 0.07, 0.006]} color="#c9a86a" position={[0.06, -0.08, 0.005]} outline={0.004} />
      </group>
    );
  return null;
};

const ActorView: React.FC<{a: Actor; frame: number; dur: number; speaking: string | null}> = ({a, frame, dur, speaking}) => {
  const spec = typeof a.char === 'string' ? CAST[a.char] : a.char;
  const t = Math.min(1, frame / dur);
  const pos = a.to ? lerp3(a.pos, a.to, t) : a.pos;
  const mask = Array.isArray(a.mask)
    ? interpolate(frame, [0, dur * 0.8], a.mask, {extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)})
    : a.mask;
  const headYaw = Array.isArray(a.headYaw)
    ? interpolate(frame, [dur * 0.35, dur * 0.75], a.headYaw, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : a.headYaw;
  return (
    <group position={pos}>
      <Character
        spec={spec}
        rotY={a.rotY ?? 0}
        expression={a.expression}
        pose={a.cart ? 'cart' : a.pose}
        talking={!!a.speaker && a.speaker === speaking}
        frame={frame}
        mask={mask}
        maskInPocket={a.maskInPocket}
        headTilt={a.headTilt}
        headYaw={headYaw}
        look={a.look}
        walk={a.to ? frame / 4 : undefined}
        props={holdFor(a.hold)}
      />
      {a.cart && (
        <group rotation={[0, a.rotY ?? 0, 0]}>
          <group position={[0, 0, 0.75]}>
            <Cart seed={a.id.length * 7 + Math.round(a.pos[2] * 10)} />
          </group>
        </group>
      )}
    </group>
  );
};

const wrap = (x: CanvasRenderingContext2D, text: string, max: number) => {
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    const t = cur ? cur + ' ' + w : w;
    if (x.measureText(t).width > max) {
      out.push(cur);
      cur = w;
    } else cur = t;
  }
  out.push(cur);
  return out;
};

const phoneTexture = (title: string, text: string | string[], clock: string, call?: boolean) => {
  const W = 540;
  const H = 1120;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  if (call) {
    // tela de chamada recebida
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1b2a4a');
    g.addColorStop(1, '#0a0f1c');
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    x.fillStyle = '#fff';
    x.font = '800 32px Nunito, Arial';
    x.fillText(clock, 28, 46);
    x.textAlign = 'center';
    x.fillStyle = '#ffd23f';
    x.beginPath();
    x.arc(W / 2, 330, 110, 0, 6.28);
    x.fill();
    x.fillStyle = '#fff';
    x.font = '900 78px Nunito, Arial';
    x.fillText(title, W / 2, 560);
    x.font = '700 38px Nunito, Arial';
    x.fillText('chamando...', W / 2, 620);
    x.fillStyle = '#e5322d';
    x.beginPath();
    x.arc(150, 930, 62, 0, 6.28);
    x.fill();
    x.fillStyle = '#2ecc71';
    x.beginPath();
    x.arc(W - 150, 930, 62, 0, 6.28);
    x.fill();
  } else {
    x.fillStyle = '#0f1115';
    x.fillRect(0, 0, W, H);
    x.fillStyle = '#1c1f26';
    x.fillRect(0, 0, W, 190);
    x.fillStyle = '#fff';
    x.font = '800 32px Nunito, Arial';
    x.fillText(clock, 28, 46);
    x.beginPath();
    x.arc(70, 130, 40, 0, 6.28);
    x.fillStyle = '#4a4f5c';
    x.fill();
    x.fillStyle = '#fff';
    x.font = '900 42px Nunito, Arial';
    x.fillText(title, 128, 145);
    // balões
    let y = 230;
    x.font = '800 40px Nunito, Arial';
    for (const raw of Array.isArray(text) ? text : [text]) {
      // "> texto" = mensagem enviada por você (verde, à direita)
      const sent = raw.startsWith('> ');
      const msg = sent ? raw.slice(2) : raw;
      const lines = wrap(x, msg, 380);
      const bw = Math.min(W - 60, Math.max(...lines.map((l) => x.measureText(l).width)) + 56);
      const bh = lines.length * 50 + 40;
      const bx = sent ? W - 24 - bw : 24;
      x.fillStyle = sent ? '#1f6f4f' : '#2a2e38';
      x.beginPath();
      x.roundRect(bx, y, bw, bh, 26);
      x.fill();
      x.fillStyle = '#f2f2f2';
      lines.forEach((l, i) => x.fillText(l, bx + 26, y + 52 + i * 50));
      y += bh + 18;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// Posição do ônibus e abertura da porta ao longo da cena
const busState = (spec: SceneSpec, frame: number, dur: number) => {
  if (!spec.bus) return undefined;
  const fps = 30;
  const arrive = (spec.bus.arriveSec ?? dur / fps) * fps;
  const z = interpolate(frame, [0, arrive], spec.bus.z, {
    extrapolateRight: 'clamp',
    easing: spec.bus.depart ? Easing.in(Easing.quad) : Easing.out(Easing.cubic),
  });
  const door = spec.bus.door
    ? interpolate(frame, [dur * 0.2, dur * 0.45], spec.bus.door, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 0;
  return {z, door};
};

const World: React.FC<{spec: SceneSpec; frame: number; dur: number; speaking: string | null}> = ({spec, frame, dur, speaking}) => {
  const time = spec.time ?? 'dusk';
  const phoneTex = useMemo(
    () => (spec.phone ? phoneTexture(spec.phone.title, spec.phone.text, spec.phone.clock, spec.phone.call) : undefined),
    [spec.phone],
  );
  const set = spec.set;
  return (
    <>
      <Lights
        time={
          spec.dark
            ? 'dark'
            : set.startsWith('market') || set === 'bus-inside'
              ? 'market'
              : set === 'kitchen' || set === 'bedroom'
                ? 'indoor'
                : time
        }
      />
      {set === 'bedroom' && <Bedroom frame={frame} doorOpen={spec.doorOpen} ringing={spec.ringing} time={time} />}
      {set === 'street-run' && <StreetRun frame={frame} time={time} />}
      {set === 'busstop' && (
        <BusStop
          frame={frame}
          dur={dur}
          time={time}
          bus={busState(spec, frame, dur)}
          stopLamp={spec.stopLamp}
          lampsOn={spec.lampsOn}
          silhouettes={spec.silhouettes}
        />
      )}
      {set === 'bus-inside' && <BusInside frame={frame} />}
      {spec.maskReveal && (
        <MaskProp
          position={spec.maskReveal.pos}
          size={spec.maskReveal.size}
          rotY={interpolate(frame, [dur * 0.15, dur * 0.45], spec.maskReveal.rotY, {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.inOut(Easing.cubic),
          })}
        />
      )}
      {set === 'kitchen' && <Kitchen time={time} />}
      {set === 'street' && <Street time={time} frame={frame} sparks={spec.sparks} />}
      {set === 'street-house' && (
        <group>
          <Street time={time} frame={frame} />
          <House pos={[0, 0, -14]} wall="#e9e3d6" gate="#2f9e4f" night={time === 'night'} />
          <House pos={[-3.4, 0, -14]} wall="#e9a3b8" gate="#7a7a7a" night={time === 'night'} />
          <House pos={[3.4, 0, -14]} wall="#f2d17a" gate="#2f5fbf" night={time === 'night'} />
        </group>
      )}
      {set.startsWith('market') && <Sky time="dusk" radius={45} />}
      {set === 'market-entrance' && <Market layout="entrance" />}
      {set === 'market-food' && <Market layout="aisle" section="food" />}
      {set === 'market-hardware' && <Market layout="aisle" section="hardware" showSign={spec.sign} />}
      {set === 'market-party' && <Market layout="aisle" section="party" />}
      {set === 'market-checkout' && <Market layout="checkout" />}
      {(spec.actors ?? []).map((a) => (
        <ActorView key={a.id} a={a} frame={frame} dur={dur} speaking={speaking} />
      ))}
      <Rig spec={spec} frame={frame} dur={dur}>
        <Hands pose={spec.hands ?? 'idle'} frame={frame} phoneTex={phoneTex} basketContents={spec.basketContents} />
      </Rig>
    </>
  );
};

// Um <Audio> por fala, começando junto com a legenda
const Voices: React.FC<{spec: SceneSpec}> = ({spec}) => {
  const {fps} = useVideoConfig();
  let t = spec.captionOffset ?? 6;
  return (
    <>
      {(spec.sfx ?? []).map((s, i) => (
        <Sequence key={'fx' + i} from={Math.round((s.at ?? 0) * fps)} layout="none">
          <Audio src={staticFile(`sfx/${s.id}.mp3`)} volume={s.vol ?? 1} loop={s.loop} />
        </Sequence>
      ))}
      {spec.lines.map((l, i) => {
        const from = t;
        t += lineFrames(l, fps);
        return l.audio ? (
          <Sequence key={i} from={from} layout="none">
            <Audio src={staticFile(l.audio)} volume={1} />
          </Sequence>
        ) : null;
      })}
    </>
  );
};

export const SceneView: React.FC<{spec: SceneSpec}> = ({spec}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const dur = sceneFrames(spec, fps);
  const speaking = activeSpeaker(spec.lines, frame, fps, spec.captionOffset ?? 6);
  const blur =
    spec.blur === 'all' ? 6 : spec.blur === 'start' ? interpolate(frame, [0, 10], [14, 0], {extrapolateRight: 'clamp'}) : 0;

  if (spec.set === 'vote' && spec.vote) {
    return (
      <AbsoluteFill>
        <VoteScreen vote={spec.vote} />
        <Voices spec={spec} />
      </AbsoluteFill>
    );
  }

  if (spec.set === 'black') {
    return (
      <AbsoluteFill>
        <Black />
        <Voices spec={spec} />
        <Captions lines={spec.lines} offset={spec.captionOffset} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill
        style={{
          filter:
            [blur ? `blur(${blur}px)` : '', spec.dark ? 'saturate(0.72) contrast(1.12) brightness(0.95)' : '']
              .filter(Boolean)
              .join(' ') || undefined,
        }}
      >
        <ThreeCanvas
          width={width}
          height={height}
          camera={{fov: 75, near: 0.05, far: 200, position: [0, 1.6, 2]}}
          gl={{antialias: true, preserveDrawingBuffer: true}}
          flat
        >
          {USE_FISHEYE ? (
            <Fisheye zoom={FISH_ZOOM} resolution={1280}>
              <World spec={spec} frame={frame} dur={dur} speaking={speaking} />
            </Fisheye>
          ) : (
            <World spec={spec} frame={frame} dur={dur} speaking={speaking} />
          )}
        </ThreeCanvas>
      </AbsoluteFill>
      <Vignette strength={spec.dark ? 0.85 : spec.time === 'night' ? 0.75 : 0.4} />
      {spec.dark && <Grain />}
      {spec.red && <RedTint />}
      {spec.peek && <Peek />}
      {spec.glare && <Glare strength={interpolate(frame, [0, dur * 0.7], [0.1, 1], {extrapolateRight: 'clamp'})} />}
      {spec.stamp && <Stamp text={spec.stamp} alert={spec.stampAlert} />}
      {spec.hook && <HookText text={spec.hook} />}
      <Captions lines={spec.lines} top={spec.captionTop} offset={spec.captionOffset} />
      <Voices spec={spec} />
    </AbsoluteFill>
  );
};
