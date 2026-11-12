import fs from 'node:fs';
const env = Object.fromEntries(fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n').filter(Boolean).map(l => l.split('=')));
export const KEY = env.ELEVENLABS_API_KEY.trim();
export const el = async (path, opts = {}) => {
  const r = await fetch('https://api.elevenlabs.io' + path, {...opts, headers: {'xi-api-key': KEY, 'Content-Type': 'application/json', ...(opts.headers || {})}});
  if (!r.ok) throw new Error(r.status + ' ' + (await r.text()).slice(0, 400));
  return r;
};
