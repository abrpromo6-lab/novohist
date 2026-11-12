import fs from 'node:fs';
import {el} from './el.mjs';
const [, , name, desc, sample] = process.argv;
const r = await el('/v1/text-to-voice/design', {method: 'POST', body: JSON.stringify({voice_description: desc, model_id: 'eleven_ttv_v3', text: sample})});
const j = await r.json();
fs.mkdirSync('public/voz/design', {recursive: true});
j.previews.forEach((p, i) => {
  fs.writeFileSync(`public/voz/design/${name}-${i}.mp3`, Buffer.from(p.audio_base_64, 'base64'));
  console.log(name, i, p.generated_voice_id, p.duration_secs);
});
