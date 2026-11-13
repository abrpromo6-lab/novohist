import type {CharSpec, Expression, Pose} from '../three/Character';
import type {HandPose} from '../three/Hands';
import type {TimeOfDay} from '../three/sets/common';

export type V3 = [number, number, number];

export type Speaker =
  | 'voce'
  | 'cida'
  | 'biel'
  | 'mulher'
  | 'briga1'
  | 'homem1'
  | 'homem2'
  | 'caixa'
  | 'tiarosa'
  | 'tonho'
  | 'motorista'
  | 'mascarado';

export const SPEAKER_COLOR: Record<Speaker, string> = {
  voce: '#ffffff',
  cida: '#ffd23f',
  biel: '#7fd6ff',
  mulher: '#ffa94d',
  briga1: '#9be15d',
  homem1: '#ff7b54',
  homem2: '#c3a6ff',
  caixa: '#ff8fab',
  tiarosa: '#ff9ee5',
  tonho: '#ffa94d',
  motorista: '#d7dee3',
  mascarado: '#ff5a4f',
};

export type Line = {who: Speaker; text: string; sec?: number; audio?: string; filtro?: 'telefone' | 'abafado'};

export type Actor = {
  id: string;
  char: string | CharSpec; // chave do CAST ou spec própria
  pos: V3;
  to?: V3; // anda até aqui durante a cena
  rotY?: number;
  expression?: Expression;
  pose?: Pose;
  speaker?: Speaker; // mexe a boca quando esse personagem fala
  mask?: number | [number, number];
  maskInPocket?: boolean;
  headTilt?: number;
  headYaw?: number | [number, number];
  look?: [number, number];
  hold?: 'jug' | 'chain' | 'padlock' | 'list' | 'none';
  cart?: boolean;
};

export type SetId =
  | 'kitchen'
  | 'street'
  | 'street-house'
  | 'market-entrance'
  | 'market-food'
  | 'market-hardware'
  | 'market-party'
  | 'market-checkout'
  | 'black'
  | 'end'
  | 'bedroom'
  | 'street-run'
  | 'busstop'
  | 'bus-inside'
  | 'vote';

export type Cam = {
  from: V3;
  to?: V3;
  look: V3;
  lookTo?: V3;
  fast?: number; // segundos do movimento (senão dura a cena toda)
  shake?: number;
};

// Efeito sonoro: arquivo em public/sfx/<id>.mp3, começa em "at" segundos
export type Sfx = {id: string; at?: number; vol?: number; loop?: boolean};

export type Vote = {
  parte: number;
  pergunta: string; // ex.: "SOBE OU FICA?"
  opcoes: [string, string];
  pct: [number, number];
  total: number;
  comentarios: {user: string; text: string; opt: 1 | 2}[];
  resultado: string; // ex.: "EMPATE"
  depois?: string; // frase embaixo
};

export type SceneSpec = {
  id: number;
  set: SetId;
  time?: TimeOfDay;
  stamp?: string;
  cam?: Cam;
  hands?: HandPose;
  basketContents?: boolean;
  actors?: Actor[];
  lines: Line[];
  minSec?: number;
  red?: boolean;
  blur?: 'start' | 'all';
  peek?: boolean;
  phone?: {title: string; text: string | string[]; clock: string; call?: boolean};
  sparks?: boolean;
  sign?: boolean;
  captionTop?: boolean; // legenda no alto (ex.: cena do celular)
  sfx?: Sfx[];
  hook?: string; // texto grande dos primeiros segundos
  stampAlert?: boolean; // etiqueta vermelha (contagem regressiva)
  doorOpen?: boolean; // porta abrindo na frente da câmera
  ringing?: boolean; // celular vibrando no quarto
  bus?: {z: [number, number]; door?: [number, number]; arriveSec?: number; depart?: boolean};
  glare?: boolean; // brilho do farol
  maskReveal?: {pos: V3; rotY: [number, number]; size?: number};
  captionOffset?: number; // frames até a 1ª fala (padrão 6)
  dark?: boolean; // estilo escuro de cinema (uma fonte de luz, cor apagada, granulação)
  stopLamp?: 'on' | 'flicker' | 'dies' | 'off';
  lampsOn?: number[]; // quais postes da rua ficam acesos
  silhouettes?: boolean; // silhuetas nas janelas do ônibus
  vote?: Vote;
};
