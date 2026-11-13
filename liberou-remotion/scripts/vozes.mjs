// Gera todas as falas do episódio com ElevenLabs v3 [whispers], normaliza o volume
// e grava src/episodes/<ep>-voz.json com a duração de cada fala.
// uso: node scripts/vozes.mjs ep01
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {buildSync} from 'esbuild';
import {tts} from './tts.mjs';

const ep = process.argv[2] || 'ep01';
const EP = ep.toUpperCase();

// Elenco: vozes BRASILEIRAS da biblioteca ElevenLabs (plano Starter)
// Tom: amedrontado, suave/"angelical", baixo e limpo (sem chiado, sem sussurro com ar)
const TOM = '[softly] [scared]';
export const VOZES = {
  voce: {id: 'Hmn4B9B77pf6ttydteJ8', nome: 'Kaique (suave, limpo)', tag: TOM},
  cida: {id: 'JgC47uWQV1gKpJtcT73r', nome: 'Angela (meia-idade, calma)', tag: TOM},
  biel: {id: 'iTvRNZPNPS0EiSgOCQG0', nome: 'Graziella (voz infantil)', tag: TOM},
  mulher: {id: 'MLAEAegxkMReslK34j8T', nome: 'Helen Mariane (doce)', tag: TOM},
  briga1: {id: 'ycxdm1PRMs962FxyyuJ0', nome: 'Otto (agressivo)', tag: '[tense] [angry]'},
  homem1: {id: 'hwnuNyWkl9DjdTFykrN6', nome: 'Adriano (grave)', tag: '[softly] [menacing]'},
  homem2: {id: 'WFSxKvz27RguNRD3Phoq', nome: 'Wesley Bessa', tag: '[softly] [suspicious]'},
  caixa: {id: 'YklVF5l1Q8os8glyd5SM', nome: 'Camilla', tag: '[softly]'},
  tiarosa: {id: 'WlyexGXUZChMcXINS0SV', nome: 'Amanda (calma)', tag: TOM},
  tonho: {id: 'bqGNAuwlV9Yp1InN7IgE', nome: 'Wilson Wong (idoso)', tag: '[urgent] [worried]'},
  motorista: {id: 'yxcG28bYeAMra6K4nj10', nome: 'Osmar (calmo)', tag: '[flat] [tired]'},
  mascarado: {id: 'GIuLCSVfgJaUuh7hYOY8', nome: 'Lucas (grave, calmo)', tag: '[softly] [calm] [menacing]'},
};

buildSync({entryPoints: [`src/episodes/${ep}.ts`], bundle: true, format: 'esm', platform: 'node', outfile: `out/${ep}.mjs`, logLevel: 'error', external: ['three', 'react']});
const mod = await import(new URL(`../out/${ep}.mjs`, import.meta.url));
const scenes = mod[EP];

const dir = `public/voz/${ep}`;
fs.mkdirSync(dir, {recursive: true});
const jsonPath = `src/episodes/${ep}-voz.json`;
const db = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf8')) : {};
const force = process.argv.includes('--force');
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);

for (const s of scenes) {
  for (const [i, l] of s.lines.entries()) {
    const key = `${s.id}-${i}`;
    const v = VOZES[l.who];
    const raw = `${dir}/${key}.raw.mp3`;
    const out = `${dir}/${key}.mp3`;
    if (only.length && !only.includes(key)) continue;
    if (!force && !only.length && db[key] && db[key].text === l.text && db[key].filtro === l.filtro && fs.existsSync(out)) continue;
    await tts(v.id, 'eleven_v3', `${v.tag} ${l.text}`, raw, {stability: 0.5, similarity_boost: 0.8});
    // corta silêncio das pontas, tira grave, comprime e deixa ALTO (-14 LUFS, pico -1 dB)
    // telefone: só a faixa de voz do celular; abafado: atrás de vidro/porta
    const extra = l.filtro === 'telefone' ? ',highpass=f=350,lowpass=f=3400,acrusher=bits=12:mix=0.15' : l.filtro === 'abafado' ? ',lowpass=f=900' : '';
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-af',
      'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.1,areverse,' +
      'highpass=f=80,afftdn=nf=-35,deesser=i=0.4,acompressor=threshold=-22dB:ratio=2.5:attack=10:release=120:makeup=3,loudnorm=I=-14:TP=-1.5:LRA=7' + extra.replace(/^,/, ','),
      '-ar', '44100', '-b:a', '192k', out]);
    fs.unlinkSync(raw);
    const sec = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString());
    db[key] = {file: `voz/${ep}/${key}.mp3`, sec: Math.round(sec * 100) / 100, who: l.who, text: l.text, filtro: l.filtro};
    console.log(key, l.who, sec.toFixed(2) + 's', l.text);
  }
}
fs.writeFileSync(jsonPath, JSON.stringify(db, null, 2));
console.log('ok', Object.keys(db).length, 'falas');
