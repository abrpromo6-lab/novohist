// Gera os efeitos sonoros com a API de Sound Effects da ElevenLabs e normaliza.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {el} from './el.mjs';

export const SFX = {
  marteladas: {p: 'distant hammering nails into wooden planks in a quiet neighborhood, late afternoon, no music', d: 10, amb: true},
  rua: {p: 'evening street ambience in a poor brazilian neighborhood, distant hammering, welding sparks crackling, a dog barking far away, no music', d: 12, amb: true},
  mercado: {p: 'crowded busy supermarket ambience, people murmuring, shopping carts rattling, no music, no announcements', d: 15, amb: true},
  correntes: {p: 'metal chains rattling and padlocks clinking on a store shelf, two men struggling', d: 4},
  drone: {p: 'low dark tense horror drone, subtle, ominous, cinematic, no melody', d: 12, amb: true},
  whoosh: {p: 'fast camera whip pan whoosh', d: 1},
  coracao: {p: 'slow heavy heartbeat thumping in silence', d: 5},
  caixas: {p: 'supermarket checkout scanner beeps and quiet murmur', d: 12, amb: true},
  cesta: {p: 'plastic shopping basket dropped on tile floor', d: 1.5},
  corrida: {p: 'fast running footsteps on supermarket tile floor with panicked breathing', d: 6},
  casa: {p: 'quiet small kitchen room tone, wall clock ticking softly, distant street', d: 12, amb: true},
  notificacao: {p: 'smartphone message notification ping', d: 1},
  portao: {p: 'old metal gate creaking slowly', d: 2.5},
  batidas: {p: 'three slow loud knocks on a metal gate, distant, ominous', d: 4},
  impacto: {p: 'deep cinematic horror impact hit with reverb tail', d: 3},
  abertura: {p: 'subtle tense cinematic low hit with soft reverse swell, clean, not loud, horror short', d: 2},
  porta_quarto: {p: 'wooden bedroom door pushed open quickly, short creak', d: 1.5},
  vento: {p: 'evening wind blowing through an open bedroom window, curtain fabric flapping softly, no music', d: 10, amb: true},
  vibracao: {p: 'smartphone vibrating on a mattress under a pillow with a muffled ringtone', d: 4},
  chaves: {p: 'house keys grabbed quickly from a table, jingle', d: 1.2},
  portao_batendo: {p: 'metal house gate slammed shut and padlocked in the distance', d: 2},
  onibus_chegando: {p: 'city bus approaching at night and stopping with loud air brake hiss', d: 5},
  porta_onibus: {p: 'pneumatic bus door opening with air hiss', d: 2},
  porta_onibus_fecha: {p: 'pneumatic bus door closing with air hiss and thud', d: 2},
  motor_onibus: {p: 'city bus diesel engine idling, heard from inside, steady low rumble, no music', d: 10, amb: true},
  murro_porta: {p: 'fists banging hard on a glass bus door from outside, desperate, three hits', d: 2},
  onibus_partindo: {p: 'city bus pulling away and accelerating into the distance at night, diesel engine fading', d: 6},
  lampada: {p: 'fluorescent tube light buzzing, flickering with electric clicks and then dying out', d: 3},
  batidas_vidro: {p: 'three slow deliberate knocks on a glass panel of a bus shelter at night, close', d: 3},
  toque_celular: {p: 'smartphone ringtone ringing, simple marimba melody, close', d: 4},
  noite_vazia: {p: 'empty street at night, distant city hum, crickets, very quiet and tense, no music', d: 12, amb: true},
  rua_noite: {p: 'quiet street at dusk, distant dogs barking, a gate closing far away, light wind, no music', d: 12, amb: true},
};

if (process.argv[1].endsWith('sfx.mjs')) {
  fs.mkdirSync('public/sfx', {recursive: true});
  for (const [k, v] of Object.entries(SFX)) {
    const out = `public/sfx/${k}.mp3`;
    if (fs.existsSync(out) && !process.argv.includes('--force')) continue;
    const r = await el('/v1/sound-generation', {method: 'POST', body: JSON.stringify({text: v.p, duration_seconds: v.d, prompt_influence: 0.5})});
    const raw = `public/sfx/${k}.raw.mp3`;
    fs.writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
    // ambiências mais baixas, efeitos pontuais mais presentes
    const I = v.amb ? -24 : -17;
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-af', `afftdn=nf=-40,loudnorm=I=${I}:TP=-2:LRA=11`, '-ar', '44100', '-b:a', '192k', out]);
    fs.unlinkSync(raw);
    console.log('ok', k);
  }
}
