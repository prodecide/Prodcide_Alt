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

// Google answers 503 ("high demand") or 429 now and then; a short retry usually succeeds.
// Delays are short because serverless functions have a time limit.
const RETRY_DELAYS_MS = [700, 1500];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function postWithRetry(model, apiKey, body) {
  let res = await post(model, apiKey, body);
  for (const delay of RETRY_DELAYS_MS) {
    if (res.status !== 503 && res.status !== 429) break;
    await wait(delay);
    res = await post(model, apiKey, body);
  }
  return res;
}

export async function geminiFetch(apiKey, body) {
  const pinned = process.env.GEMINI_MODEL;
  const model = pinned || cachedModel || DEFAULT_MODEL;
  let res = await postWithRetry(model, apiKey, body);
  if (res.status === 404 && !pinned) {
    const found = await pickModel(apiKey);
    if (found && found !== model) {
      console.warn(`Gemini model ${model} was not found for this key; using ${found} instead.`);
      cachedModel = found;
      res = await postWithRetry(found, apiKey, body);
    }
  }
  return res;
}
