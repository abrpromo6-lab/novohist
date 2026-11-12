import type {Actor, SceneSpec} from '../engine/types';
import {rng} from '../three/toon';

// Figurantes em FAIXAS: cada faixa tem um x fixo e uma direção.
// Na mesma faixa todos andam juntos na mesma velocidade e com espaço entre si,
// e faixas vizinhas ficam a >= 1 m de distância, então ninguém atravessa ninguém.
type Lane = {x: number; dir: 1 | -1 | 0};
const crowd = (seed: number, lanes: Lane[], zFrom: number, zTo: number, walk = 1.0): Actor[] => {
  const r = rng(seed);
  const skins = ['#5b3a22', '#7a4a2a', '#a87650', '#c18a5f', '#d1a27a', '#8a5a36'];
  const tops = ['#2f6fb3', '#e8a33d', '#4c9a4c', '#c62d2d', '#f2f2f2', '#7d4bb3', '#262626', '#e46f6f'];
  const hairs = ['short', 'bald', 'curly', 'long', 'cap', 'bun'] as const;
  const holds = ['jug', 'chain', 'padlock', 'jug', 'none'] as const;
  const out: Actor[] = [];
  lanes.forEach((lane, li) => {
    // começa num ponto aleatório pra faixas não ficarem alinhadas
    let z = zFrom + r() * 0.8;
    let i = 0;
    while (z < zTo) {
      const cart = lane.dir !== 0 && r() > 0.6;
      const hair = hairs[Math.floor(r() * hairs.length)];
      const facing = lane.dir === -1 ? Math.PI : lane.dir === 1 ? 0 : r() > 0.5 ? 0 : Math.PI;
      // carrinho fica na frente da pessoa (0.75 m): reserva espaço extra
      const zz = cart && facing === 0 ? z : cart ? z + 0.75 : z;
      out.push({
        id: `x${seed}-${li}-${i++}`,
        char: {
          skin: skins[Math.floor(r() * skins.length)],
          top: tops[Math.floor(r() * tops.length)],
          bottom: r() > 0.5 ? '#3d5a80' : '#444444',
          hair,
          hairColor: hair === 'cap' ? tops[Math.floor(r() * tops.length)] : '#1b1b1b',
          female: hair === 'long' || hair === 'bun',
          scale: 0.95 + r() * 0.1,
        },
        pos: [lane.x, 0, zz],
        to: lane.dir ? [lane.x, 0, zz + lane.dir * walk] : undefined,
        rotY: facing,
        pose: cart ? 'cart' : 'jug',
        cart,
        hold: cart ? 'none' : holds[Math.floor(r() * holds.length)],
        expression: r() > 0.5 ? 'worried' : 'serious',
      });
      z += (cart ? 2.1 : 1.3) + r() * 0.6;
    }
  });
  return out;
};

const cida = (extra: Partial<Actor> = {}): Actor => ({
  id: 'cida',
  char: 'cida',
  pos: [0, 0, -0.5],
  speaker: 'cida',
  expression: 'serious',
  ...extra,
});
const biel = (extra: Partial<Actor> = {}): Actor => ({
  id: 'biel',
  char: 'biel',
  pos: [0.85, 0, -0.2],
  speaker: 'biel',
  expression: 'worried',
  ...extra,
});

export const EP01: SceneSpec[] = [
  // 1
  {
    id: 1,
    sfx: [{id: 'marteladas', vol: 0.8, loop: true}],
    set: 'kitchen',
    time: 'dusk',
    stamp: 'MAIS CEDO · 16:40',
    hands: 'reach',
    cam: {from: [0, 1.62, 1.5], to: [0, 1.62, 1.15], look: [0, 1.55, -0.6]},
    actors: [cida({pose: 'give', hold: 'list'})],
    lines: [{who: 'cida', text: 'Arroz, vela e pilha. E volta direto, hein? Hoje não é dia de enrolar.'}],
  },
  // 2
  {
    id: 2,
    sfx: [{id: 'rua', vol: 0.9, loop: true}],
    set: 'street',
    time: 'dusk',
    sparks: true,
    hands: 'idle',
    cam: {from: [-0.5, 1.62, 6], to: [-0.5, 1.62, 1.5], look: [-3, 1.8, -6], lookTo: [-1.5, 1.7, -8]},
    actors: [
      {id: 'viz1', char: 'briga2', pos: [-6.1, 0, 0.2], rotY: -Math.PI / 2, pose: 'hammer', expression: 'serious'},
      {id: 'viz2', char: 'mulher', pos: [-6.1, 0, -5.5], rotY: -Math.PI / 2, pose: 'hammer', expression: 'worried'},
      {id: 'viz3', char: 'homem2', pos: [3.0, 0, -5.8], rotY: Math.PI / 2, pose: 'chain', expression: 'serious'},
    ],
    lines: [{who: 'voce', text: 'Todo ano a mesma coisa...', sec: 2.6}],
    minSec: 3.4,
  },
  // 3
  {
    id: 3,
    sfx: [{id: 'mercado', vol: 0.9, loop: true}],
    set: 'market-entrance',
    stamp: 'SEXTA · 16:52',
    hands: 'idle',
    cam: {from: [0.4, 1.62, 5.5], to: [0.2, 1.62, 3.8], look: [0, 1.6, -3]},
    actors: crowd(3, [{x: -1.5, dir: 1}, {x: -0.45, dir: -1}, {x: 1.5, dir: -1}], -2.2, 2.4),
    lines: [{who: 'voce', text: 'Que isso... parece véspera de Natal.'}],
  },
  // 4
  {
    id: 4,
    sfx: [{id: 'mercado', vol: 0.8, loop: true}],
    set: 'market-food',
    hands: 'basket',
    basketContents: false,
    cam: {from: [0, 1.6, 3], to: [0, 1.6, 1.6], look: [0, 1.4, -6]},
    actors: [
      {id: 'mulher', char: 'mulher', pos: [0.35, 0, 0.1], rotY: 0.2, cart: true, speaker: 'mulher', expression: 'worried'},
      ...crowd(4, [{x: -0.5, dir: -1}, {x: 0.5, dir: 1}], -8, -2.8, 0.8),
    ],
    lines: [{who: 'mulher', text: 'Pega tudo, menino. Amanhã não vai ter nada aberto.'}],
  },
  // 5
  {
    id: 5,
    sfx: [{id: 'mercado', vol: 0.6, loop: true}, {id: 'correntes', at: 0.2, vol: 0.8}],
    set: 'market-hardware',
    hands: 'basket',
    basketContents: false,
    cam: {from: [0, 1.6, 2.6], to: [0, 1.6, 1.9], look: [0, 1.35, -1], shake: 0.03},
    actors: [
      {id: 'b1', char: 'briga1', pos: [-0.38, 0, -0.6], rotY: Math.PI / 2 - 0.3, pose: 'pull', speaker: 'briga1', expression: 'serious', hold: 'padlock'},
      {id: 'b2', char: 'briga2', pos: [0.4, 0, -0.65], rotY: -Math.PI / 2 + 0.3, pose: 'pull', expression: 'serious'},
      ...crowd(5, [{x: -0.5, dir: 0}, {x: 0.5, dir: 0}], -7, -3.2),
    ],
    lines: [{who: 'briga1', text: 'Larga que esse aí é meu! Eu peguei primeiro!'}],
  },
  // 6
  {
    id: 6,
    sfx: [{id: 'mercado', vol: 0.5, loop: true}, {id: 'drone', vol: 0.6}],
    set: 'market-hardware',
    sign: true,
    hands: 'basket',
    basketContents: false,
    cam: {from: [0.1, 1.55, 0.6], to: [0.3, 1.5, 0.1], look: [1.1, 1.45, -0.95]},
    lines: [{who: 'voce', text: 'Acabou o cadeado...', sec: 2.2}],
  },
  // 7
  {
    id: 7,
    sfx: [{id: 'drone', vol: 1}],
    set: 'market-party',
    hands: 'basket',
    basketContents: true,
    cam: {from: [0, 1.6, 2.4], to: [0, 1.6, 1.3], look: [0, 1.65, -3]},
    actors: [{id: 'masc', char: 'mascarado', pos: [0, 0, -2.4], mask: [0.25, 1], headTilt: 0.12}],
    lines: [],
    minSec: 4,
  },
  // 8
  {
    id: 8,
    sfx: [{id: 'whoosh', vol: 0.9}, {id: 'drone', vol: 0.9}],
    set: 'market-party',
    blur: 'start',
    hands: 'basket',
    basketContents: true,
    cam: {from: [0, 1.6, 0], look: [0, 1.6, -5], lookTo: [0, 1.6, 6], fast: 0.4, shake: 0.02},
    actors: [
      {id: 'masc', char: 'mascarado', pos: [0, 0, -2.4], mask: 1},
      {id: 'masc2', char: 'mascarada', pos: [0.1, 0, 3.6], rotY: Math.PI, mask: [0.6, 1], headTilt: 0.4},
    ],
    lines: [{who: 'voce', text: 'Por que eles tão olhando pra mim...'}],
  },
  // 9
  {
    id: 9,
    sfx: [{id: 'coracao', vol: 1}],
    set: 'black',
    lines: [{who: 'voce', text: 'Eles já tão de máscara. Ainda nem é de noite.'}],
  },
  // 10
  {
    id: 10,
    sfx: [{id: 'caixas', vol: 0.8, loop: true}, {id: 'drone', vol: 0.5}],
    set: 'market-checkout',
    hands: 'basket',
    basketContents: true,
    cam: {from: [-0.3, 1.3, 2.2], to: [-0.15, 1.3, 1.95], look: [1.3, 1.45, -0.5], shake: 0.006},
    actors: [
      {id: 'h1', char: 'homem1', pos: [1.05, 0, -0.5], rotY: Math.PI - 0.5, headYaw: -0.6, maskInPocket: true, speaker: 'homem1'},
      {id: 'h2', char: 'homem2', pos: [1.75, 0, -0.75], rotY: Math.PI + 0.6, headYaw: 0.5, speaker: 'homem2'},
      {id: 'cx', char: 'caixa', pos: [-3.05, 0, -2.4], rotY: Math.PI / 2, expression: 'worried'},
      ...crowd(10, [{x: -1.15, dir: 0}], -4.6, -1.2),
    ],
    lines: [{who: 'homem1', text: 'Rua 7. A casa do portão verde.'}],
  },
  // 11
  {
    id: 11,
    sfx: [{id: 'caixas', vol: 0.7, loop: true}, {id: 'coracao', vol: 0.6}],
    set: 'market-checkout',
    hands: 'basket',
    basketContents: true,
    cam: {from: [-0.3, 1.3, 2.0], look: [-0.25, 0.7, 1.3], shake: 0.004},
    lines: [{who: 'homem2', text: 'A da enfermeira? Tem certeza?'}],
  },
  // 12
  {
    id: 12,
    sfx: [{id: 'caixas', vol: 0.7, loop: true}, {id: 'drone', vol: 0.6}],
    set: 'market-checkout',
    hands: 'basket',
    basketContents: true,
    cam: {from: [-0.15, 1.3, 1.9], to: [0.05, 1.3, 1.6], look: [1.3, 1.45, -0.5], shake: 0.005},
    actors: [
      {id: 'h1', char: 'homem1', pos: [1.05, 0, -0.5], rotY: Math.PI - 0.5, headYaw: -0.6, maskInPocket: true, speaker: 'homem1'},
      {id: 'h2', char: 'homem2', pos: [1.75, 0, -0.75], rotY: Math.PI + 0.6, headYaw: 0.5, speaker: 'homem2'},
    ],
    lines: [{who: 'homem1', text: 'Ela deixou meu irmão morrer na fila do posto. Esse ano ela não escapa.'}],
  },
  // 13
  {
    id: 13,
    sfx: [{id: 'caixas', vol: 0.5, loop: true}, {id: 'cesta', at: 1.0, vol: 0.9}, {id: 'impacto', at: 0.2, vol: 0.5}],
    set: 'market-checkout',
    hands: 'basketLow',
    basketContents: true,
    cam: {from: [0.05, 1.3, 1.6], to: [0.05, 0.95, 1.7], look: [1.3, 1.45, -0.5], lookTo: [1.0, 0.8, -0.2], shake: 0.01},
    actors: [
      {id: 'h1', char: 'homem1', pos: [1.05, 0, -0.5], rotY: Math.PI - 0.5, headYaw: -0.6, maskInPocket: true},
      {id: 'h2', char: 'homem2', pos: [1.75, 0, -0.75], rotY: Math.PI + 0.6, headYaw: [0.5, 2.2], speaker: 'homem2', expression: 'serious'},
    ],
    lines: [{who: 'homem2', text: '...tem alguém ouvindo?'}],
    minSec: 2.8,
  },
  // 14
  {
    id: 14,
    sfx: [{id: 'corrida', vol: 1}, {id: 'mercado', vol: 0.5}],
    set: 'market-food',
    blur: 'all',
    hands: 'run',
    cam: {from: [-0.3, 1.55, -8.5], to: [-0.3, 1.55, 0.5], look: [-0.3, 1.5, 10], shake: 0.05},
    actors: crowd(14, [{x: 0.66, dir: 0}], -5, 2.2),
    lines: [{who: 'caixa', text: 'Ô moleque! Teu troco!', sec: 1.8}],
  },
  // 15
  {
    id: 15,
    sfx: [{id: 'rua', vol: 0.8, loop: true}, {id: 'portao', at: 1.2, vol: 0.7}],
    set: 'street-house',
    time: 'late',
    stamp: 'SEXTA · 17:58',
    hands: 'idle',
    cam: {from: [0.3, 1.62, -5], to: [0.3, 1.62, -10.2], look: [0.3, 1.1, -13.2]},
    lines: [{who: 'voce', text: 'Portão verde...', sec: 2.4}],
    minSec: 3.6,
  },
  // 16
  {
    id: 16,
    sfx: [{id: 'casa', vol: 0.9, loop: true}],
    set: 'kitchen',
    time: 'late',
    hands: 'idle',
    cam: {from: [0.2, 1.62, 1.6], to: [0.1, 1.62, 1.4], look: [0.3, 1.45, -0.5]},
    actors: [cida({expression: 'serious'}), biel({pos: [0.95, 0, -0.1], rotY: -0.4})],
    lines: [{who: 'cida', text: 'Cadê o arroz? Cadê a vela?'}],
  },
  // 17
  {
    id: 17,
    sfx: [{id: 'casa', vol: 0.9, loop: true}],
    set: 'kitchen',
    time: 'late',
    hands: 'idle',
    cam: {from: [0, 1.62, 0.9], to: [0, 1.62, 0.7], look: [0, 1.7, -0.5]},
    actors: [cida({expression: 'worried'})],
    lines: [{who: 'voce', text: 'Mãe... dois caras no mercado. Falaram da casa do portão verde. Da enfermeira.'}],
  },
  // 18
  {
    id: 18,
    sfx: [{id: 'casa', vol: 0.8, loop: true}, {id: 'drone', vol: 0.5}],
    set: 'kitchen',
    time: 'late',
    hands: 'none',
    cam: {from: [0.2, 1.45, 1.1], look: [0.85, 1.25, -0.1]},
    actors: [cida({expression: 'worried'}), biel({pos: [0.85, 0, -0.1], rotY: -0.9, look: [-0.6, 0], expression: 'scared'})],
    lines: [{who: 'biel', text: 'Mãe... a enfermeira é você.'}],
  },
  // 19
  {
    id: 19,
    sfx: [{id: 'casa', vol: 0.8, loop: true}],
    set: 'kitchen',
    time: 'late',
    hands: 'idle',
    cam: {from: [0, 1.5, 0.95], to: [0, 1.42, 0.75], look: [0, 1.5, -0.5]},
    actors: [cida({expression: 'sad', headTilt: 0.08, look: [0, 0.6]})],
    lines: [{who: 'cida', text: 'O menino do posto... o Marquinhos. Eu não tinha leito, filho.'}],
  },
  // 20
  {
    id: 20,
    sfx: [{id: 'casa', vol: 0.7, loop: true}, {id: 'notificacao', at: 0.05, vol: 1}],
    set: 'kitchen',
    time: 'late',
    hands: 'phone',
    phone: {title: 'Tia Rosa', text: 'manda pelo menos o Biel pra cá. o último ônibus sai 18:30. o ponto é na esquina', clock: '18:02'},
    cam: {from: [0, 1.62, 1.2], look: [0, 1.5, -1], shake: 0.003},
    captionTop: true,
    lines: [{who: 'tiarosa', text: 'Manda pelo menos o Biel pra cá. O último ônibus sai 18:30. O ponto é na esquina.'}],
  },
  // 21
  {
    id: 21,
    sfx: [{id: 'rua', vol: 0.6, loop: true}, {id: 'batidas', at: 0.4, vol: 0.9}, {id: 'drone', vol: 0.8}],
    set: 'street-house',
    time: 'late',
    hands: 'gate',
    peek: true,
    cam: {from: [0.35, 1.5, -13.5], to: [0.35, 1.5, -13.4], look: [1.8, 1.5, -6.5]},
    actors: [{id: 'masc', char: 'mascarado', pos: [2.4, 0, -7.2], rotY: Math.PI + 0.2, mask: [0.7, 1], headTilt: 0.2}],
    lines: [{who: 'biel', text: 'Ele tá parado no ponto de ônibus...'}],
    minSec: 3,
  },
  // 22
  {
    id: 22,
    sfx: [{id: 'drone', vol: 1}, {id: 'coracao', vol: 0.7}],
    set: 'kitchen',
    time: 'late',
    red: true,
    hands: 'idle',
    cam: {from: [0, 1.62, 1.0], to: [0, 1.62, 0.8], look: [0, 1.7, -0.5]},
    actors: [cida({expression: 'serious'})],
    lines: [
      {who: 'cida', text: 'Eu não saio. É a mim que eles querem.'},
      {who: 'cida', text: 'E o Biel... você decide. Você que viu eles.'},
    ],
  },
];

export const EP01_END = {
  opt1: 'Mandar o Biel sozinho no ônibus (o mascarado tá no ponto)',
  opt2: 'Deixar o Biel em casa com vocês (a casa é o alvo)',
  next: 2,
};
