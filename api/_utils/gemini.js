// Shared Gemini call. Uses GEMINI_MODEL if set; otherwise tries gemini-2.5-flash and, if Google says that model
// is unavailable to this key (404), picks the newest stable Flash model the key can use and remembers it.
const DEFAULT_MODEL = 'gemini-2.5-flash';
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
let cachedModel = null;

const post = (model, apiKey, body) =>
  fetch(`${BASE}/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

async function pickModel(apiKey) {
  const r = await fetch(`${BASE}/models?pageSize=200&key=${apiKey}`);
  if (!r.ok) return null;
  const { models = [] } = await r.json();
  const stable = models
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => String(m.name).replace(/^models\//, ''))
    .map((id) => ({ id, v: /^gemini-(\d+(?:\.\d+)?)-flash$/.exec(id)?.[1] }))
    .filter((m) => m.v)
    .sort((a, b) => Number(b.v) - Number(a.v));
  return stable[0]?.id || null;
}

export async function geminiFetch(apiKey, body) {
  const pinned = process.env.GEMINI_MODEL;
  const model = pinned || cachedModel || DEFAULT_MODEL;
  let res = await post(model, apiKey, body);
  if (res.status === 404 && !pinned) {
    const found = await pickModel(apiKey);
    if (found && found !== model) {
      console.warn(`Gemini model ${model} was not found for this key; using ${found} instead.`);
      cachedModel = found;
      res = await post(found, apiKey, body);
    }
  }
  return res;
}
