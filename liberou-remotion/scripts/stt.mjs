import fs from 'node:fs';
import {KEY} from './el.mjs';
for (const f of process.argv.slice(2)) {
  const fd = new FormData();
  fd.append('model_id', 'scribe_v1');
  fd.append('file', new Blob([fs.readFileSync(f)]), 'a.mp3');
  const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {method: 'POST', headers: {'xi-api-key': KEY}, body: fd});
  const j = await r.json();
  console.log(f, '|', j.language_code, j.language_probability?.toFixed?.(2), '|', j.text ?? JSON.stringify(j).slice(0, 200));
}
