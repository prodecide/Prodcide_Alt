// Compare the Discovery chat on Gemini and on Claude with the same scripted conversations.
//
//   GEMINI_API_KEY=... ANTHROPIC_API_KEY=... node scripts/compare-ai.mjs
//
// Optional: AI_MODEL=claude-sonnet-5-5 to try a different Claude model (default claude-haiku-5-5).
// Each provider answers every scripted user message in turn; read the output side by side and judge
// tone, whether it follows "short, simple English, ask one question", and the options it offers.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true });

const scenarios = [
  { name: 'Student, unsure', domain: 'Career Path Selection', turns: ["I'm a student choosing a career", '12th, science stream', 'I like maths and coding but not sure about engineering'] },
  { name: 'Professional switching', domain: 'Strategic Job Transitioning', turns: ["I'm working and thinking of a switch", 'Working Professional, 4 years in sales', 'I want to move into product management'] },
  { name: 'Two options', domain: 'Career Path Selection', turns: ['Help me choose between two options', 'MBA vs a software job after B.Tech', 'I want a stable income in 2 years'] },
];

const providers = [
  { name: 'gemini', env: { AI_PROVIDER: 'gemini' }, needs: 'GEMINI_API_KEY' },
  { name: 'claude', env: { AI_PROVIDER: 'claude' }, needs: 'ANTHROPIC_API_KEY' },
];

const { default: handler } = await import('../api/discovery-chat.js');
let n = 0;

async function ask(provider, domain, messages) {
  Object.assign(process.env, provider.env);
  let status = 200, body;
  const res = {
    setHeader() { return res; },
    status(c) { status = c; return res; },
    json(b) { body = b; return res; },
  };
  const t0 = Date.now();
  // a fresh fake IP per call keeps the local rate limiter out of the way
  await handler({ method: 'POST', headers: { 'x-forwarded-for': `10.9.${Math.floor(n / 250)}.${n++ % 250}` }, body: { messages, selectedDomain: domain } }, res);
  return { status, body, ms: Date.now() - t0 };
}

for (const p of providers) {
  if (!process.env[p.needs]) { console.log(`\nSkipping ${p.name}: ${p.needs} is not set.`); p.skip = true; }
}

for (const sc of scenarios) {
  console.log(`\n=== ${sc.name} ===`);
  for (const p of providers.filter((x) => !x.skip)) {
    console.log(`\n--- ${p.name} ---`);
    const messages = [{ sender: 'ai', text: 'Hi! What career decision is on your mind? Tell me in your own words, or pick one below.' }];
    for (const turn of sc.turns) {
      messages.push({ sender: 'user', text: turn });
      const r = await ask(p, sc.domain, messages);
      if (r.status !== 200) { console.log(`User: ${turn}\n  ERROR ${r.status}: ${JSON.stringify(r.body).slice(0, 200)}`); break; }
      const b = r.body;
      console.log(`User: ${turn}\n  AI (${r.ms} ms): ${b.text}\n  options: ${(b.options || []).join(' | ')}\n  skills: ${(b.currentSkills || []).join(', ')} | gaps: ${(b.criticalGaps || []).join(', ')}`);
      messages.push({ sender: 'ai', text: b.text });
    }
  }
}
process.exit(0);
