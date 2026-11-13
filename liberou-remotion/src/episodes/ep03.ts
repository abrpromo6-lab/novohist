import type {Actor, SceneSpec, Vote} from '../engine/types';
import VOTOS from './ep03-votos.json';

// Parte 3 — "Vai ou Volta?" · estilo escuro, um lugar só (o ponto à noite)
// Regra: quem cair aqui sem ter visto nada precisa entender a história pelas falas.

const PI = Math.PI;
const BUS_PARADO = {z: [-7, -7] as [number, number]};
const NOITE = {set: 'busstop' as const, time: 'night' as const, dark: true, lampsOn: [0]};

// mascarado: primeiro sob o poste 0 (o único aceso), depois mais perto
const MASC_LONGE: [number, number, number] = [1.7, 0, 3.3];
const MASC_PERTO: [number, number, number] = [-2.6, 0, 0.9];
const masc = (extra: Partial<Actor> = {}): Actor => ({
  id: 'masc',
  char: 'mascarado',
  pos: MASC_LONGE,
  rotY: -2.2,
  mask: 1,
  headTilt: 0.18,
  speaker: 'mascarado',
  ...extra,
});

export const EP03: SceneSpec[] = [
  // 0 — A VOTAÇÃO
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
  // 1 — contexto: o homem do mercado está no ônibus
  {
    id: 1,
    ...NOITE,
    stopLamp: 'on',
    silhouettes: true,
    stamp: 'SEXTA · 18:29',
    hook: 'O HOMEM DO MERCADO|TÁ NO ÔNIBUS',
    bus: {...BUS_PARADO, door: [1, 1]},
    hands: 'idle',
    cam: {from: [-4.45, 1.55, -0.9], to: [-4.4, 1.55, -1.05], look: [-3.7, 1.25, -2.4]},
    actors: [{id: 'biel', char: 'biel', pos: [-3.95, 0.15, -2.25], rotY: 0.35, speaker: 'biel', expression: 'scared', look: [0.3, 0]}],
    sfx: [{id: 'motor_onibus', vol: 0.7, loop: true}, {id: 'noite_vazia', vol: 0.6, loop: true}],
    lines: [
      {who: 'biel', text: 'Mano... o homem do mercado tá lá dentro.'},
      {who: 'voce', text: 'Eu sei. É ele que quer pegar a mãe.'},
      {who: 'biel', text: 'E se ele pegar a gente?'},
      {who: 'voce', text: 'Fica do meu lado. Ninguém encosta em você.'},
    ],
  },
  // 2 — o Biel sobe primeiro
  {
    id: 2,
    ...NOITE,
    stopLamp: 'on',
    silhouettes: true,
    bus: {...BUS_PARADO, door: [1, 1]},
    hands: 'reach',
    cam: {from: [-4.35, 1.55, -1.3], to: [-4.1, 1.55, -1.8], look: [-3.2, 1.35, -2.8]},
    actors: [{id: 'biel', char: 'biel', pos: [-3.75, 0.15, -2.8], to: [-3.05, 0.5, -2.8], rotY: PI / 2, speaker: 'biel', expression: 'scared'}],
    sfx: [{id: 'motor_onibus', vol: 0.75, loop: true}, {id: 'noite_vazia', vol: 0.6, loop: true}],
    lines: [{who: 'voce', text: 'Sobe, Biel. Eu vou logo atrás.'}],
  },
  // 3 — a porta fecha na sua cara
  {
    id: 3,
    ...NOITE,
    stopLamp: 'on',
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
      {who: 'motorista', text: 'Lotou.', filtro: 'abafado'},
    ],
    captionOffset: 12,
  },
  // 4 — o ônibus vai embora; o homem do mercado acena
  {
    id: 4,
    ...NOITE,
    stopLamp: 'on',
    silhouettes: true,
    stamp: 'FALTAM 29 MIN',
    stampAlert: true,
    bus: {z: [-7, 34], arriveSec: 5, depart: true},
    hands: 'idle',
    cam: {from: [-4.75, 1.55, -2.4], to: [-4.65, 1.55, -2.0], look: [-2.4, 1.6, -1.0], lookTo: [-2.0, 1.4, 22]},
    sfx: [{id: 'onibus_partindo', vol: 0.95}, {id: 'noite_vazia', vol: 0.6, loop: true}],
    lines: [
      {who: 'voce', text: 'Ele tá acenando... o homem do mercado tá acenando pra mim.'},
      {who: 'voce', text: 'Biel!'},
    ],
  },
  // 5 — a luz do ponto morre
  {
    id: 5,
    ...NOITE,
    stopLamp: 'dies',
    hands: 'idle',
    cam: {from: [-4.1, 1.55, -1.0], look: [-4.6, 2.3, -2.0], lookTo: [-3.6, 1.2, -3.5], shake: 0.006},
    sfx: [{id: 'lampada', vol: 0.8}, {id: 'noite_vazia', vol: 0.7, loop: true}],
    lines: [{who: 'voce', text: 'Calma... pensa. Pensa.'}],
    captionOffset: 30,
  },
  // 6 — número desconhecido
  {
    id: 6,
    ...NOITE,
    stopLamp: 'off',
    hands: 'phone',
    captionTop: true,
    phone: {title: 'Desconhecido', text: ['relaxa. ele tá comigo.', '> quem é você?'], clock: '18:31'},
    cam: {from: [-4.1, 1.6, -1.0], look: [-3.6, 1.5, -3.0], shake: 0.003},
    sfx: [{id: 'notificacao', vol: 0.9}, {id: 'noite_vazia', vol: 0.7, loop: true}],
    lines: [
      {who: 'voce', text: '"Relaxa. Ele tá comigo."'},
      {who: 'voce', text: 'Quem é você?'},
    ],
    captionOffset: 16,
  },
  // 7 — a resposta liga tudo: é o irmão do Marquinhos
  {
    id: 7,
    ...NOITE,
    stopLamp: 'off',
    hands: 'phone',
    captionTop: true,
    phone: {
      title: 'Desconhecido',
      text: ['relaxa. ele tá comigo.', '> quem é você?', 'o irmão do marquinhos.', 'ponto final. sozinho. antes das sete.'],
      clock: '18:32',
    },
    cam: {from: [-4.1, 1.6, -1.0], look: [-3.6, 1.5, -3.0], shake: 0.003},
    sfx: [{id: 'notificacao', vol: 0.9}, {id: 'coracao', vol: 0.6}, {id: 'noite_vazia', vol: 0.6, loop: true}],
    lines: [
      {who: 'voce', text: 'O irmão do Marquinhos... o menino que morreu no posto.'},
      {who: 'voce', text: '"Ponto final. Sozinho. Antes das sete."'},
    ],
    captionOffset: 16,
  },
  // 8 — três batidas no vidro: o mascarado sob o poste
  {
    id: 8,
    ...NOITE,
    stopLamp: 'off',
    blur: 'start',
    hands: 'idle',
    cam: {from: [-4.15, 1.6, -1.1], look: [-4.9, 1.4, -2.0], lookTo: [1.7, 1.6, 3.3], fast: 0.55, shake: 0.01},
    actors: [masc({mask: [0.75, 1]})],
    sfx: [{id: 'batidas_vidro', vol: 0.95}, {id: 'drone', at: 0.6, vol: 0.8}, {id: 'noite_vazia', vol: 0.5, loop: true}],
    lines: [{who: 'mascarado', text: 'Eu sei onde fica o ponto final.'}],
    captionOffset: 50,
  },
  // 9 — ele chega perto
  {
    id: 9,
    ...NOITE,
    stopLamp: 'off',
    hands: 'idle',
    cam: {from: [-4.15, 1.6, -1.1], to: [-4.2, 1.6, -1.2], look: [-2.6, 1.6, 0.9], shake: 0.006},
    actors: [masc({pos: [0.6, 0, 2.5], to: MASC_PERTO, rotY: -2.47})],
    sfx: [{id: 'drone', vol: 0.8}, {id: 'noite_vazia', vol: 0.5, loop: true}],
    lines: [
      {who: 'voce', text: 'Foi você que deu a máscara pro Biel.'},
      {who: 'mascarado', text: 'Dei pra ele não ser escolhido.'},
      {who: 'mascarado', text: 'Vem comigo... ou ele fica sozinho com o irmão do Marquinhos.'},
    ],
  },
  // 10 — a mãe liga
  {
    id: 10,
    ...NOITE,
    stopLamp: 'off',
    hands: 'phone',
    captionTop: true,
    phone: {title: 'MÃE', text: '', clock: '18:33', call: true},
    cam: {from: [-4.1, 1.6, -1.0], look: [-3.0, 1.5, 0.5], shake: 0.004},
    actors: [masc({pos: MASC_PERTO, rotY: -2.47, speaker: undefined})],
    sfx: [{id: 'toque_celular', vol: 0.75}, {id: 'batidas', at: 3.2, vol: 0.4}, {id: 'drone', vol: 0.6}],
    lines: [
      {who: 'cida', text: 'Filho... tão batendo no portão. Cadê o Biel?', filtro: 'telefone'},
      {who: 'voce', text: 'Mãe, tranca tudo! Eu...'},
    ],
    captionOffset: 34,
  },
  // 11 — o dilema dito em voz alta
  {
    id: 11,
    ...NOITE,
    stopLamp: 'off',
    red: true,
    stamp: 'FALTAM 27 MIN',
    stampAlert: true,
    hands: 'idle',
    cam: {from: [-4.15, 1.6, -1.1], to: [-4.0, 1.6, -0.9], look: [-2.6, 1.55, 0.9], shake: 0.006},
    actors: [masc({pos: MASC_PERTO, rotY: -2.47, pose: 'give', speaker: undefined})],
    sfx: [{id: 'coracao', vol: 0.8}, {id: 'drone', vol: 0.8}],
    lines: [
      {who: 'voce', text: 'Se eu for... a mãe fica sozinha.'},
      {who: 'voce', text: 'Se eu voltar... o Biel fica com ele.'},
    ],
  },
];

export const EP03_END = {
  title: 'VAI OU VOLTA?',
  opt1: 'VAI|atrás do Biel (com o mascarado)',
  opt2: 'VOLTA|pra salvar a mãe (o Biel fica sozinho)',
  next: 4,
};
