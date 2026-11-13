import type {SceneSpec, Vote} from '../engine/types';
import VOTOS from './ep03-votos.json';

// Parte 3 — "Vai ou Volta?" · estilo escuro, um lugar só (o ponto à noite)

const PI = Math.PI;
const BUS_PARADO = {z: [-7, -7] as [number, number]};

// mascarado sob o poste 0 (o único aceso)
const MASC_POS: [number, number, number] = [1.7, 0, 3.3];

export const EP03: SceneSpec[] = [
  // 0 — A VOTAÇÃO (gancho dos primeiros segundos)
  {
    id: 0,
    set: 'vote',
    vote: VOTOS as Vote,
    sfx: [
      {id: 'notificacao', at: 0.6, vol: 0.35},
      {id: 'notificacao', at: 0.9, vol: 0.35},
      {id: 'impacto', at: 1.93, vol: 0.6},
    ],
    lines: [],
    minSec: 4.4,
  },
  // 1 — o Biel sobe
  {
    id: 1,
    set: 'busstop',
    time: 'night',
    dark: true,
    stopLamp: 'on',
    lampsOn: [0],
    silhouettes: true,
    bus: {...BUS_PARADO, door: [1, 1]},
    hands: 'reach',
    cam: {from: [-4.35, 1.55, -1.3], to: [-4.1, 1.55, -1.8], look: [-3.2, 1.35, -2.8]},
    actors: [{id: 'biel', char: 'biel', pos: [-3.75, 0.15, -2.8], to: [-3.05, 0.5, -2.8], rotY: PI / 2, speaker: 'biel', expression: 'scared'}],
    sfx: [{id: 'motor_onibus', vol: 0.75, loop: true}, {id: 'noite_vazia', vol: 0.6, loop: true}],
    lines: [{who: 'voce', text: 'Sobe, Biel. Eu vou logo atrás.'}],
  },
  // 2 — a porta fecha na sua cara
  {
    id: 2,
    set: 'busstop',
    time: 'night',
    dark: true,
    stopLamp: 'on',
    lampsOn: [0],
    silhouettes: true,
    bus: {...BUS_PARADO, door: [1, 0]},
    hands: 'idle',
    cam: {from: [-4.55, 1.55, -1.5], to: [-4.3, 1.55, -1.85], look: [-3.1, 1.45, -2.85], shake: 0.03},
    sfx: [
      {id: 'porta_onibus_fecha', at: 0.15, vol: 0.9},
      {id: 'murro_porta', at: 1.6, vol: 0.85},
      {id: 'motor_onibus', vol: 0.8, loop: true},
    ],
    lines: [
      {who: 'biel', text: 'Mano!', filtro: 'abafado'},
      {who: 'voce', text: 'Abre! Abre a porta!'},
    ],
    captionOffset: 12,
  },
  // 3 — o ônibus vai embora; uma silhueta acena
  {
    id: 3,
    set: 'busstop',
    time: 'night',
    dark: true,
    stopLamp: 'on',
    lampsOn: [0],
    silhouettes: true,
    stamp: 'FALTAM 29 MIN',
    stampAlert: true,
    bus: {z: [-7, 34], arriveSec: 4.2, depart: true},
    hands: 'idle',
    cam: {from: [-4.75, 1.55, -2.4], to: [-4.65, 1.55, -2.0], look: [-2.4, 1.6, -1.0], lookTo: [-2.0, 1.4, 22]},
    sfx: [{id: 'onibus_partindo', vol: 0.95}, {id: 'noite_vazia', vol: 0.6, loop: true}],
    lines: [{who: 'voce', text: 'Não... não, não, não.'}],
    minSec: 4.4,
  },
  // 4 — a luz do ponto morre
  {
    id: 4,
    set: 'busstop',
    time: 'night',
    dark: true,
    stopLamp: 'dies',
    lampsOn: [0],
    hands: 'idle',
    cam: {from: [-4.1, 1.55, -1.0], look: [-4.6, 2.3, -2.0], lookTo: [-3.6, 1.2, -3.5], shake: 0.006},
    sfx: [{id: 'lampada', vol: 0.8}, {id: 'noite_vazia', vol: 0.7, loop: true}],
    lines: [],
    minSec: 2.4,
  },
  // 5 — número desconhecido
  {
    id: 5,
    set: 'busstop',
    time: 'night',
    dark: true,
    stopLamp: 'off',
    lampsOn: [0],
    hands: 'phone',
    captionTop: true,
    phone: {title: 'Desconhecido', text: ['relaxa. ele tá comigo.'], clock: '18:31'},
    cam: {from: [-4.1, 1.6, -1.0], look: [-3.6, 1.5, -3.0], shake: 0.003},
    sfx: [{id: 'notificacao', vol: 0.9}, {id: 'noite_vazia', vol: 0.7, loop: true}],
    lines: [{who: 'voce', text: 'Relaxa. Ele tá comigo.'}],
    captionOffset: 16,
  },
  // 6 — segunda mensagem
  {
    id: 6,
    set: 'busstop',
    time: 'night',
    dark: true,
    stopLamp: 'off',
    lampsOn: [0],
    hands: 'phone',
    captionTop: true,
    phone: {title: 'Desconhecido', text: ['relaxa. ele tá comigo.', 'ponto final. sozinho. antes das sete.'], clock: '18:32'},
    cam: {from: [-4.1, 1.6, -1.0], look: [-3.6, 1.5, -3.0], shake: 0.003},
    sfx: [{id: 'notificacao', vol: 0.9}, {id: 'coracao', vol: 0.6}, {id: 'noite_vazia', vol: 0.6, loop: true}],
    lines: [{who: 'voce', text: 'Ponto final. Sozinho. Antes das sete.'}],
    captionOffset: 16,
  },
  // 7 — três batidas no vidro: o mascarado sob o poste
  {
    id: 7,
    set: 'busstop',
    time: 'night',
    dark: true,
    stopLamp: 'off',
    lampsOn: [0],
    blur: 'start',
    hands: 'idle',
    cam: {from: [-4.15, 1.6, -1.1], look: [-4.9, 1.4, -2.0], lookTo: [1.7, 1.6, 3.3], fast: 0.55, shake: 0.01},
    actors: [{id: 'masc', char: 'mascarado', pos: MASC_POS, rotY: -2.2, mask: [0.75, 1], headTilt: 0.18, speaker: 'mascarado'}],
    sfx: [{id: 'batidas_vidro', vol: 0.95}, {id: 'drone', at: 0.6, vol: 0.8}, {id: 'noite_vazia', vol: 0.5, loop: true}],
    lines: [{who: 'mascarado', text: 'Eu sei onde fica o ponto final.'}],
    captionOffset: 50,
  },
  // 8 — a mãe liga
  {
    id: 8,
    set: 'busstop',
    time: 'night',
    dark: true,
    red: true,
    stopLamp: 'off',
    lampsOn: [0],
    hands: 'phone',
    captionTop: true,
    phone: {title: 'MÃE', text: '', clock: '18:33', call: true},
    cam: {from: [-4.1, 1.6, -1.0], look: [-3.0, 1.5, 0.5], shake: 0.004},
    actors: [{id: 'masc', char: 'mascarado', pos: MASC_POS, rotY: -2.2, mask: 1, headTilt: 0.18}],
    sfx: [{id: 'toque_celular', vol: 0.8}, {id: 'drone', vol: 0.7}, {id: 'batidas', at: 2.6, vol: 0.45}],
    lines: [{who: 'cida', text: 'Filho... tão batendo no portão.', filtro: 'telefone'}],
    captionOffset: 40,
  },
];

export const EP03_END = {
  title: 'VAI OU VOLTA?',
  opt1: 'VAI|atrás do Biel (com o mascarado)',
  opt2: 'VOLTA|pra salvar a mãe (o Biel fica sozinho)',
  next: 4,
};
