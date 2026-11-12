import {el} from './el.mjs';
const q = process.argv[2];
const r = await (await el(`/v1/shared-voices?page_size=30&language=pt&search=${encodeURIComponent(q)}`)).json();
for (const v of r.voices) console.log(v.voice_id, '|', v.name, '|', v.accent, v.gender, v.age, '|', (v.description||'').slice(0,80).replace(/\n/g,' '));
