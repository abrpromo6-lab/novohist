import fs from 'node:fs';
import {el} from './el.mjs';
// uso: node tts.mjs voiceId model "texto" saida.mp3
export const tts = async (voice, model, text, out, settings = {}) => {
  const body = {text, model_id: model, voice_settings: {stability: 0.5, similarity_boost: 0.8, ...settings}};
  if (model === 'eleven_v3') body.language_code = 'pt';
  const r = await el(`/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {method: 'POST', body: JSON.stringify(body)});
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
};
if (process.argv[1].endsWith('tts.mjs')) {
  const [, , voice, model, text, out] = process.argv;
  try { await tts(voice, model, text, out); console.log('ok', out); } catch (e) { console.log('ERRO', e.message); }
}
