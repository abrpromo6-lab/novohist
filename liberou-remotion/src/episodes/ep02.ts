import type {Actor, SceneSpec} from '../engine/types';

// Ep 02 — "O Ponto". Empate nos comentários: o Biel decidiu sozinho.

const PI = Math.PI;

const cida = (extra: Partial<Actor> = {}): Actor => ({
  id: 'cida',
  char: 'cida',
  pos: [-0.1, 0, 0.85],
  rotY: PI,
  speaker: 'cida',
  expression: 'scared',
  ...extra,
});

// Biel sentado no banco do ponto, de frente pra rua (+x)
const bielSentado = (extra: Partial<Actor> = {}): Actor => ({
  id: 'biel',
  char: 'biel',
  pos: [-4.85, 0.27, -2],
  rotY: PI / 2,
  pose: 'sit',
  speaker: 'biel',
  expression: 'neutral',
  ...extra,
});

// passageiros sentados olhando pra frente (pra câmera)
const passageiros = (): Actor[] => {
  const skins = ['#5b3a22', '#a87650', '#c18a5f', '#7a4a2a', '#d1a27a', '#8a5a36'];
  const tops = ['#7d4bb3', '#4c9a4c', '#e8a33d', '#262626', '#c62d2d', '#f2f2f2'];
  // só nas fileiras da frente, pra ninguém ficar colado na câmera na cena 17
  const lugares: [number, number][] = [
    [-0.72, 0],
    [0.72, 1],
    [-0.72, 2],
    [0.72, 2],
    [0.72, 3],
    [-0.72, 1],
  ];
  return lugares.map(([x, i], k) => ({
    id: `p${k}`,
    char: {
      skin: skins[k],
      top: tops[k],
      bottom: '#3d5a80',
      hair: (['short', 'bun', 'cap', 'curly', 'long', 'bald'] as const)[k],
      hairColor: k === 2 ? '#7a7a7a' : '#1b1b1b',
      female: k === 1 || k === 4,
    },
    pos: [x + (k % 2 ? -0.2 : 0.2), 0.1, -1.6 - i * 1.25],
    pose: 'sit',
    expression: 'neutral',
    look: [0, 0.35],
  }));
};

const homem1Fundo = (extra: Partial<Actor> = {}): Actor => ({
  id: 'h1',
  char: 'homem1',
  pos: [0, 0.15, -9.85],
  pose: 'sit',
  speaker: 'homem1',
  expression: 'smile',
  ...extra,
});

const BUS_PARADO = {z: [-7, -7] as [number, number]};

export const EP02: SceneSpec[] = [
  // 1 — GANCHO: porta abre na cara, cama vazia, janela aberta
  {
    id: 1,
    set: 'bedroom',
    time: 'late',
    stamp: 'SEXTA · 18:12',
    hook: 'DEU EMPATE...|O BIEL DECIDIU SOZINHO',
    doorOpen: true,
    hands: 'idle',
    captionOffset: 4,
    cam: {from: [0.05, 1.6, 2.1], to: [0.1, 1.55, 1.15], look: [0.2, 1.25, -2], lookTo: [0.5, 1.0, -1.8], shake: 0.01},
    sfx: [
      {id: 'abertura', vol: 0.7},
      {id: 'porta_quarto', vol: 0.8},
      {id: 'vento', vol: 0.9, loop: true},
    ],
    lines: [{who: 'cida', text: 'Biel? ...Biel?!'}],
    minSec: 2.8,
  },
  // 2
  {
    id: 2,
    set: 'bedroom',
    time: 'late',
    hands: 'idle',
    cam: {from: [0.1, 1.6, 0.9], to: [-0.3, 1.6, -1.0], look: [-0.3, 1.5, -3]},
    sfx: [{id: 'vento', vol: 1, loop: true}],
    lines: [{who: 'voce', text: 'A janela tá aberta, mãe.'}],
  },
  // 3 — bilhete
  {
    id: 3,
    set: 'bedroom',
    time: 'late',
    hands: 'none',
    cam: {from: [1.05, 1.3, -1.2], to: [1.08, 1.15, -1.35], look: [1.13, 0.64, -1.73], shake: 0.004},
    sfx: [{id: 'vento', vol: 0.7, loop: true}],
    lines: [{who: 'voce', text: 'Fui pra Tia Rosa... não briga com o meu irmão.'}],
  },
  // 4
  {
    id: 4,
    set: 'bedroom',
    time: 'late',
    hands: 'none',
    cam: {from: [0.2, 1.6, -0.6], to: [0.15, 1.6, -0.4], look: [-0.1, 1.65, 1.2]},
    actors: [cida()],
    sfx: [{id: 'vento', vol: 0.6, loop: true}],
    lines: [{who: 'cida', text: 'Ele foi pro ponto. O mascarado tá no ponto!'}],
  },
  // 5 — o celular toca dentro do quarto
  {
    id: 5,
    set: 'bedroom',
    time: 'late',
    ringing: true,
    hands: 'none',
    captionOffset: 36,
    cam: {from: [0.5, 1.55, -0.2], to: [0.75, 1.3, -0.7], look: [1.45, 0.55, -1.65]},
    sfx: [{id: 'vibracao', vol: 1}],
    lines: [{who: 'voce', text: 'Ele deixou o celular.'}],
  },
  // 6
  {
    id: 6,
    set: 'bedroom',
    time: 'late',
    hands: 'none',
    cam: {from: [0.15, 1.6, -0.4], look: [-0.1, 1.6, 1.2], shake: 0.008},
    actors: [cida({expression: 'serious', pose: 'phone'})],
    sfx: [{id: 'chaves', at: 0.1, vol: 0.9}],
    lines: [{who: 'cida', text: 'Eu vou atrás dele.'}],
  },
  // 7 — contagem regressiva
  {
    id: 7,
    set: 'bedroom',
    time: 'late',
    stamp: 'FALTAM 47 MIN',
    stampAlert: true,
    hands: 'reach',
    cam: {from: [0.1, 1.6, -0.1], to: [0.0, 1.62, 0.15], look: [-0.1, 1.65, 1.2]},
    actors: [cida({expression: 'worried'})],
    lines: [{who: 'voce', text: 'Não. É você que eles querem. Tranca tudo.'}],
  },
  // 8 — corrida na rua
  {
    id: 8,
    set: 'street-run',
    time: 'late',
    hands: 'run',
    cam: {from: [-1.2, 1.55, 5], to: [-1.2, 1.55, -12], look: [-1.8, 1.5, -25], shake: 0.035},
    actors: [
      {id: 'tonho', char: 'tonho', pos: [-5.55, 0.45, -3], rotY: PI / 2, pose: 'give', speaker: 'tonho', expression: 'worried'},
      {id: 'viz', char: 'mulher', pos: [-5.3, 0, -7.4], rotY: PI / 2, pose: 'pull', expression: 'scared'},
    ],
    sfx: [
      {id: 'corrida', vol: 0.9},
      {id: 'rua_noite', vol: 0.8, loop: true},
      {id: 'portao_batendo', at: 2.2, vol: 0.7},
    ],
    lines: [{who: 'tonho', text: 'Volta pra dentro, moleque! Já vai dar sete horas!'}],
  },
  // 9
  {
    id: 9,
    set: 'black',
    sfx: [{id: 'coracao', vol: 0.9}],
    lines: [{who: 'voce', text: 'Tá lá, Biel... por favor, tá lá.'}],
  },
  // 10 — alívio falso
  {
    id: 10,
    set: 'busstop',
    time: 'late',
    stamp: 'SEXTA · 18:21',
    hands: 'idle',
    cam: {from: [-3.0, 1.6, 7], to: [-3.4, 1.6, 0.6], look: [-4.6, 1.0, -2]},
    actors: [bielSentado()],
    sfx: [{id: 'corrida', vol: 0.6}, {id: 'rua_noite', vol: 0.8, loop: true}],
    lines: [{who: 'voce', text: 'Biel!'}],
    minSec: 3,
  },
  // 11
  {
    id: 11,
    set: 'busstop',
    time: 'late',
    hands: 'none',
    cam: {from: [-3.55, 1.25, -1.3], to: [-3.7, 1.15, -1.5], look: [-4.85, 1.05, -2]},
    actors: [bielSentado({look: [0.5, 0]})],
    sfx: [{id: 'rua_noite', vol: 0.7, loop: true}, {id: 'drone', vol: 0.5}],
    lines: [{who: 'biel', text: 'Ele foi embora. Disse que volta às sete.'}],
  },
  // 12
  {
    id: 12,
    set: 'busstop',
    time: 'late',
    hands: 'gate',
    cam: {from: [-3.8, 1.0, -1.6], look: [-4.85, 1.0, -2], shake: 0.006},
    actors: [bielSentado({look: [0.5, 0]})],
    sfx: [{id: 'rua_noite', vol: 0.6, loop: true}],
    lines: [{who: 'voce', text: 'Quem? O mascarado?'}],
  },
  // 13 — a máscara pequena
  {
    id: 13,
    set: 'busstop',
    time: 'late',
    hands: 'none',
    cam: {from: [-3.8, 1.05, -1.75], to: [-3.95, 1.0, -1.85], look: [-4.6, 0.95, -2]},
    actors: [bielSentado({pose: 'sit', look: [0.5, 0]})],
    maskReveal: {pos: [-4.42, 0.92, -2], rotY: [PI / 2, PI / 2], size: 0.3},
    sfx: [{id: 'rua_noite', vol: 0.5, loop: true}, {id: 'drone', vol: 0.8}],
    lines: [{who: 'biel', text: 'Ele me deu isso. Falou que quem tá de máscara não é escolhido.'}],
  },
  // 14 — último ônibus
  {
    id: 14,
    set: 'busstop',
    time: 'late',
    stamp: '18:29 · ÚLTIMO ÔNIBUS',
    stampAlert: true,
    glare: true,
    hands: 'idle',
    bus: {z: [-42, -7], arriveSec: 3.6},
    cam: {from: [-3.6, 1.5, -0.6], look: [-2.2, 1.3, -25], shake: 0.008},
    sfx: [{id: 'onibus_chegando', vol: 0.9}, {id: 'rua_noite', vol: 0.5, loop: true}],
    lines: [],
    minSec: 4.2,
  },
  // 15 — porta abre
  {
    id: 15,
    set: 'busstop',
    time: 'late',
    hands: 'idle',
    bus: {...BUS_PARADO, door: [0, 1]},
    cam: {from: [-4.95, 1.6, 1.0], to: [-4.85, 1.6, 0.7], look: [-3.2, 1.45, -2.9]},
    sfx: [{id: 'porta_onibus', at: 0.3, vol: 0.9}, {id: 'motor_onibus', vol: 0.7, loop: true}],
    lines: [{who: 'motorista', text: 'Último. Sobe ou fica?'}],
    captionOffset: 22,
  },
  // 16 — dentro do ônibus: o homem do mercado
  {
    id: 16,
    set: 'bus-inside',
    hands: 'none',
    cam: {from: [0, 1.7, 0.6], to: [0, 1.65, -0.6], look: [0, 1.25, -10]},
    actors: [...passageiros(), homem1Fundo({expression: 'neutral'})],
    sfx: [{id: 'motor_onibus', vol: 0.8, loop: true}, {id: 'drone', vol: 0.8}],
    lines: [{who: 'voce', text: 'É ele... o do mercado.'}],
    minSec: 3.2,
  },
  // 17
  {
    id: 17,
    set: 'bus-inside',
    hands: 'none',
    cam: {from: [0, 1.5, -6.2], to: [0, 1.45, -7.2], look: [0, 1.25, -9.9], shake: 0.005},
    actors: [...passageiros(), homem1Fundo({pose: 'give'})],
    sfx: [{id: 'motor_onibus', vol: 0.8, loop: true}, {id: 'coracao', vol: 0.5}],
    lines: [{who: 'homem1', text: 'Sobe, menino. Tem lugar pra vocês dois.'}],
  },
  // 18 — MARQUINHOS
  {
    id: 18,
    set: 'busstop',
    time: 'late',
    hands: 'none',
    bus: {...BUS_PARADO, door: [1, 1]},
    cam: {from: [-3.8, 1.22, -0.38], to: [-3.88, 1.15, -0.5], look: [-4.38, 1.02, -1.0], shake: 0.004},
    actors: [{id: 'biel', char: 'biel', pos: [-4.62, 0, -1.25], rotY: PI / 4, pose: 'give', speaker: 'biel', expression: 'worried'}],
    maskReveal: {pos: [-4.36, 1.0, -0.98], rotY: [PI / 4, PI / 4 + PI], size: 0.4},
    sfx: [{id: 'motor_onibus', vol: 0.6, loop: true}, {id: 'impacto', at: 1.0, vol: 0.55}],
    lines: [{who: 'biel', text: 'Quem é Marquinhos?'}],
    captionOffset: 34,
    minSec: 3.6,
  },
  // 19 — a porta vai fechar
  {
    id: 19,
    set: 'busstop',
    time: 'late',
    red: true,
    hands: 'idle',
    bus: {...BUS_PARADO, door: [1, 0.55]},
    cam: {from: [-4.85, 1.6, 0.7], to: [-4.75, 1.6, 0.45], look: [-3.2, 1.45, -2.9]},
    sfx: [{id: 'porta_onibus_fecha', at: 0.9, vol: 0.8}, {id: 'motor_onibus', vol: 0.7, loop: true}, {id: 'drone', vol: 0.8}],
    lines: [{who: 'motorista', text: 'Vou fechar a porta.'}],
  },
];

export const EP02_END = {
  opt1: 'Subir no ônibus com o Biel (o homem do mercado tá lá dentro)',
  opt2: 'Voltar pra casa com o Biel (é lá que eles vão atacar)',
  next: 3,
};
