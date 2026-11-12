import fs from 'node:fs';
import {KEY} from './el.mjs';
const f = process.argv[2];
const fd = new FormData();
fd.append('model_id', 'scribe_v1');
fd.append('diarize', 'true');
fd.append('tag_audio_events', 'true');
fd.append('timestamps_granularity', 'word');
fd.append('file', new Blob([fs.readFileSync(f)]), 'a.mp3');
const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {method: 'POST', headers: {'xi-api-key': KEY}, body: fd});
const j = await r.json();
fs.writeFileSync(f + '.json', JSON.stringify(j, null, 1));
// agrupa por falante
let cur = null, line = '', t0 = 0;
const out = [];
for (const w of j.words || []) {
  if (w.speaker_id !== cur) { if (line) out.push(`[${t0.toFixed(1)}s ${cur}] ${line.trim()}`); cur = w.speaker_id; line = ''; t0 = w.start; }
  line += w.text;
}
if (line) out.push(`[${t0.toFixed(1)}s ${cur}] ${line.trim()}`);
console.log(j.language_code, j.language_probability);
console.log(out.join('\n'));
