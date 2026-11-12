import {el} from './el.mjs';
const q = process.argv[2] || '';
for (const gender of ['female', 'male']) {
  const r = await (await el(`/v1/shared-voices?page_size=40&language=pt&accent=brazilian&gender=${gender}&sort=usage_character_count_1y${q}`)).json();
  console.log('==', gender, r.voices.length);
  for (const v of r.voices) console.log(v.public_owner_id, v.voice_id, '|', v.name, '|', v.age, '|', v.use_case, '|', v.descriptive, '|', (v.description||'').slice(0,70).replace(/\n/g,' '), '| free_users:', v.free_users_allowed);
}
