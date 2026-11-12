import React from 'react';
import {Audio, Composition, Series, staticFile} from 'remotion';
import {SceneView, sceneFrames} from './engine/Scene';
import {EndCard} from './engine/Overlays';
import {Capa} from './Capa';
import {EP01 as EP01_RAW, EP01_END} from './episodes/ep01';
import VOZ01 from './episodes/ep01-voz.json';
import type {SceneSpec} from './engine/types';

// Encaixa o áudio de cada fala: a fala dura o tamanho do áudio + respiro
const PAUSA = 0.2;
const comVoz = (scenes: SceneSpec[], db: Record<string, {file: string; sec: number; text: string}>) =>
  scenes.map((s) => ({
    ...s,
    lines: s.lines.map((l, i) => {
      const v = db[`${s.id}-${i}`];
      return v && v.text === l.text ? {...l, sec: v.sec + PAUSA, audio: v.file} : l;
    }),
  }));
const EP01 = comVoz(EP01_RAW, VOZ01);

const FPS = 30;
const END_FRAMES = 6 * FPS;

const Ep01: React.FC = () => (
  <Series>
    {EP01.map((s) => (
      <Series.Sequence key={s.id} durationInFrames={sceneFrames(s, FPS)}>
        <SceneView spec={s} />
      </Series.Sequence>
    ))}
    <Series.Sequence durationInFrames={END_FRAMES}>
      <EndCard {...EP01_END} />
      <Audio src={staticFile('sfx/impacto.mp3')} volume={0.9} />
    </Series.Sequence>
  </Series>
);

const total = EP01.reduce((a, s) => a + sceneFrames(s, FPS), 0) + END_FRAMES;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ep01" component={Ep01} durationInFrames={total} fps={FPS} width={1080} height={1920} />
    <Composition
      id="Capa01"
      component={() => (
        <Capa spec={EP01.find((s) => s.id === 7)!} ep="EP 01" hook={'ELES SABEM ONDE VOCÊ MORA'} />
      )}
      durationInFrames={150}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition id="Final" component={() => <EndCard {...EP01_END} />} durationInFrames={END_FRAMES} fps={FPS} width={1080} height={1920} />
    {EP01.map((s) => (
      <Composition
        key={s.id}
        id={`Cena${String(s.id).padStart(2, '0')}`}
        component={() => <SceneView spec={s} />}
        durationInFrames={sceneFrames(s, FPS)}
        fps={FPS}
        width={1080}
        height={1920}
      />
    ))}
  </>
);
