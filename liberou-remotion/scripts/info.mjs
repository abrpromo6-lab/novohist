import {el} from './el.mjs';
const sub = await (await el('/v1/user/subscription')).json();
console.log('plano', sub.tier, 'chars usados', sub.character_count, '/', sub.character_limit, 'vozes custom', sub.voice_slots_used ?? '', '/', sub.voice_limit);
const v = await (await el('/v1/voices')).json();
for (const x of v.voices) console.log(x.voice_id, '|', x.name, '|', x.category, '|', JSON.stringify(x.labels));
