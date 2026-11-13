import React from 'react';
import {Audio, Composition, Series, staticFile} from 'remotion';
import {SceneView, sceneFrames} from './engine/Scene';
import {EndCard} from './engine/Overlays';
import {Capa} from './Capa';
import {EP01 as EP01_RAW, EP01_END} from './episodes/ep01';
import {EP02 as EP02_RAW, EP02_END} from './episodes/ep02';
import {EP03 as EP03_RAW, EP03_END} from './episodes/ep03';
import VOZ01 from './episodes/ep01-voz.json';
import VOZ02 from './episodes/ep02-voz.json';
import VOZ03 from './episodes/ep03-voz.json';
import type {SceneSpec} from './engine/types';

// Encaixa o áudio de cada fala: a fala dura o tamanho do áudio + respiro
const PAUSA = 0.2;
type Voz = Record<string, {file: string; sec: number; text: string}>;
const comVoz = (scenes: SceneSpec[], db: Voz) =>
  scenes.map((s) => ({
    ...s,
    lines: s.lines.map((l, i) => {
      const v = db[`${s.id}-${i}`];
      return v && v.text === l.text ? {...l, sec: v.sec + PAUSA, audio: v.file} : l;
    }),
  }));
const EP01 = comVoz(EP01_RAW, VOZ01);
const EP02 = comVoz(EP02_RAW, VOZ02 as Voz);
const EP03 = comVoz(EP03_RAW, VOZ03 as Voz);

const FPS = 30;
const END_FRAMES = 6 * FPS;

type End = {opt1: string; opt2: string; next: number; title?: string};
const Episode: React.FC<{scenes: SceneSpec[]; end: End}> = ({scenes, end}) => (
  <Series>
    {scenes.map((s) => (
      <Series.Sequence key={s.id} durationInFrames={sceneFrames(s, FPS)}>
        <SceneView spec={s} />
      </Series.Sequence>
    ))}
    <Series.Sequence durationInFrames={END_FRAMES}>
      <EndCard {...end} />
      <Audio src={staticFile('sfx/impacto.mp3')} volume={0.8} />
    </Series.Sequence>
  </Series>
);
const total = (scenes: SceneSpec[]) => scenes.reduce((a, s) => a + sceneFrames(s, FPS), 0) + END_FRAMES;

const cenas = (prefix: string, scenes: SceneSpec[]) =>
  scenes.map((s) => (
    <Composition
      key={prefix + s.id}
      id={`${prefix}Cena${String(s.id).padStart(2, '0')}`}
      component={() => <SceneView spec={s} />}
      durationInFrames={sceneFrames(s, FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
  ));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ep01" component={() => <Episode scenes={EP01} end={EP01_END} />} durationInFrames={total(EP01)} fps={FPS} width={1080} height={1920} />
    <Composition id="Ep03" component={() => <Episode scenes={EP03} end={EP03_END} />} durationInFrames={total(EP03)} fps={FPS} width={1080} height={1920} />
    <Composition id="Final03" component={() => <EndCard {...EP03_END} />} durationInFrames={END_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="Ep02" component={() => <Episode scenes={EP02} end={EP02_END} />} durationInFrames={total(EP02)} fps={FPS} width={1080} height={1920} />
    <Composition
      id="Capa01"
      component={() => <Capa spec={EP01.find((s) => s.id === 7)!} ep="EP 01" hook={'ELES SABEM ONDE VOCÊ MORA'} />}
      durationInFrames={150}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="Capa02"
      component={() => <Capa spec={EP02.find((s) => s.id === 13)!} ep="EP 02" hook={'O NOME DENTRO DA MÁSCARA'} />}
      durationInFrames={150}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="Capa03"
      component={() => <Capa spec={EP03.find((s) => s.id === 7)!} ep="PARTE 3" cta="SIGA PRA NÃO PERDER" hook={'“ELE TÁ COMIGO.”'} />}
      durationInFrames={150}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition id="Final" component={() => <EndCard {...EP01_END} />} durationInFrames={END_FRAMES} fps={FPS} width={1080} height={1920} />
    {cenas('', EP01)}
    {cenas('E2', EP02)}
    {cenas('E3', EP03)}
  </>
);
