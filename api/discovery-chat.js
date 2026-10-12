import { checkRateLimit } from './_utils/rate-limiter.js';
import clientPromise, { addToCounter } from '../lib/db.js';
import { geminiFetch } from './_utils/gemini.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages, selectedDomain, onboardingContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Rate limit: Max 20 Gemini requests per hour per IP
  const limitCheck = await checkRateLimit(req, 'discovery_chat', 20, 60 * 60 * 1000);
  if (limitCheck.limited) {
    return res.status(429).json({ error: `Too many chat requests. Try again in ${limitCheck.retryAfter} seconds.` });
  }

  // AI provider: Gemini by default. Set AI_PROVIDER=claude (and ANTHROPIC_API_KEY) to use Claude instead.
  // Claude spend is capped per calendar month (AI_BUDGET_INR, default 200). When the cap is reached the chat
  // switches to Gemini if a Gemini key exists, otherwise it returns 503 and the page uses its built-in questions.
  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  let useClaude = process.env.AI_PROVIDER === 'claude';
  if (useClaude) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY environment variable');
      return res.status(500).json({ error: 'Claude API key is not configured on the server' });
    }
    try {
      const { spentInr } = await claudeSpend();
      if (spentInr >= AI_BUDGET_INR) {
        console.warn(`Claude monthly budget reached (about Rs ${spentInr.toFixed(2)} of Rs ${AI_BUDGET_INR}).`);
        useClaude = false;
        if (!geminiKey) return res.status(503).json({ error: 'AI chat is paused for this month.', budgetExhausted: true });
      }
    } catch (e) {
      // If spend cannot be checked, do not risk the cap: stop using Claude for this request.
      console.error('Could not read Claude spend; not calling Claude:', e.message);
      useClaude = false;
      if (!geminiKey) return res.status(503).json({ error: 'AI chat is temporarily unavailable.' });
    }
  }
  const apiKey = useClaude ? process.env.ANTHROPIC_API_KEY : geminiKey;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable');
    return res.status(500).json({ error: 'Gemini API key is not configured on the server' });
  }

  try {

    // Format chat history into a string prompt for the model
    let conversationHistory = '';
    messages.forEach((msg) => {
      const roleName = msg.sender === 'user' ? 'User' : 'ProDecide AI';
      conversationHistory += `${roleName}: ${msg.text}\n\n`;
    });

    const systemPrompt = `You are the ProDecide Decision Consultant, an expert career strategist. 
The user is facing a challenge in the domain of "${selectedDomain || 'Career Path Selection'}".
Your goal is to guide the user through a thorough professional discovery dialogue to understand their current background, identify technical and business gaps for their desired transition, perform a skill analysis by asking targeted questions, and suggest potential career transition options.

Guidelines:
1. Use very simple, clear English. Keep your responses short, concise, and focused (no long or vague paragraphs).
2. On your very first message, you must ask the user about their current role or educational level (e.g., whether they are in school, university, or working). Provide exact options in the "options" array for this (e.g., ["10th", "12th", "Grad", "Post Grad", "Working Professional"]).
3. For every single response where you ask a question, you must provide a list of 2 to 5 short, clickable option strings in the "options" array that the user can click to answer your question (e.g., ["Technical", "Business", "Design"] or ["Yes", "No", "Not Sure"]). Do not leave the "options" array empty when asking a question.
4. Continuously enquire and ask targeted, step-by-step questions to understand more specific details about their experience, background, and goals. Ask at LEAST 5 questions across the conversation covering: (a) current education/role, (b) specific field of interest, (c) existing skills or experience, (d) career goals and timeline, (e) constraints or preferences.
5. PROGRESSIVELY build and maintain "currentSkills", "criticalGaps", and "suggestedPaths" throughout the conversation. From your SECOND response onwards, you must start populating these arrays based on what you've learned so far. Add to them with EVERY response — do not leave them empty after the first turn.
6. If they mention skills or you can infer skills from their background, add them to "currentSkills" immediately. Always include at least 2-3 skills from the second response onward.
7. If you identify knowledge or qualification barriers for their desired career path, add them to "criticalGaps" immediately (e.g. "GRID PHYSICS", "PPA PRICING", "FINANCIAL MODELING"). Always include at least 2-3 gaps from the second response onward.
8. If you identify potential strategic paths they could target, add them to "suggestedPaths". Start suggesting tentative paths from the third response onward.
9. CRITICAL RULE about "readyToSuggest": You must set "readyToSuggest" to false for the FIRST 4 user messages. Only set it to true after you have exchanged AT LEAST 5 rounds of dialogue with the user AND you have populated currentSkills with at least 3 items, criticalGaps with at least 3 items, and suggestedPaths with at least 2 items. NEVER set readyToSuggest to true on the first, second, third, or fourth turn. The conversation MUST have depth.

You must respond with a JSON object matching this schema:
- text: (string) Your response to the user. Your response must be short, precise, and in simple English. Explain the context, and ask one targeted follow-up question.
- options: (array of strings) 2 to 5 short option strings the user can click to answer your question (e.g. ["10th", "12th", "Grad", "Post Grad", "Working Professional"]). Must not be empty when readyToSuggest is false. Can be empty when readyToSuggest is true.
- criticalGaps: (array of strings) The FULL cumulative list of critical gaps identified so far. Must have at least 2-3 items from the second response onward.
- currentSkills: (array of strings) The FULL cumulative list of identified skills. Must have at least 2-3 items from the second response onward.
- suggestedPaths: (array of objects containing "title" [string] and "icon" [string]) Suggested strategic options (e.g. [{"title": "Sustainable Energy", "icon": "bolt"}]). Icon should be a valid Google Material Symbols icon name like: "bolt", "settings_suggest", "public", "account_balance", "trending_up", "psychology". Must have at least 2 items when readyToSuggest is true.
- readyToSuggest: (boolean) Set to true ONLY after at least 5 rounds of dialogue AND all arrays are well-populated. Must be false for the first 4 turns.`;

    let contextInstructions = '';
    if (onboardingContext) {
      const { name, age, class: userClass, subject, job, education } = onboardingContext;
      contextInstructions = `\n\n[USER PROFILE INFO PROVIDED VIA ONBOARDING FORM]:
- Name: ${name || 'Not provided'}
- Age: ${age || 'Not provided'}
${selectedDomain === 'Career Path Selection' ? `
- Current Class/Academic Level: ${userClass || 'Not provided'}
- Major Subject of Study: ${subject || 'Not provided'}
` : selectedDomain === 'Strategic Job Transitioning' ? `
- Current Job / Professional Role: ${job || 'Not provided'}
- Educational Qualification: ${education || 'Not provided'}
` : ''}
Do NOT ask the user for their name, age, class, subject, current job, or educational qualifications in the chat, since they have already provided this information. Acknowledge these details naturally in your opening response (e.g. "Hello ${name || 'there'}!") and skip directly to deeper discovery questions about their specific goals, challenges, or transition preferences.`;
    }

    let parsedData;
    if (useClaude) {
      const { reply, usage } = await callClaude({ apiKey, system: `${systemPrompt}${contextInstructions}`, messages });
      parsedData = reply;
      try {
        await addToCounter('ai_usage', claudeMonth(), 'costUsd', claudeCostUsd(usage));
      } catch (e) {
        console.error('Could not record Claude spend:', e.message);
      }
    } else {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}${contextInstructions}\n\nHere is the conversation history so far:\n${conversationHistory}\nProvide the JSON response.`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            options: {
              type: 'array',
              items: { type: 'string' }
            },
            criticalGaps: {
              type: 'array',
              items: { type: 'string' }
            },
            currentSkills: {
              type: 'array',
              items: { type: 'string' }
            },
            suggestedPaths: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  icon: { type: 'string' }
                },
                required: ['title', 'icon']
              }
            },
            readyToSuggest: { type: 'boolean' }
          },
          required: ['text', 'options', 'criticalGaps', 'currentSkills', 'suggestedPaths', 'readyToSuggest']
        }
      }
    };

    const response = await geminiFetch(apiKey, requestBody);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API call failed in discovery-chat:', errorText);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const responseData = await response.json();
    const textContent = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('Empty response from Gemini API');
    }

      parsedData = JSON.parse(textContent);
    }

    // Server-side guard: force readyToSuggest=false if fewer than 4 user messages
    const userMessageCount = messages.filter(m => m.sender === 'user').length;
    if (userMessageCount < 4 && parsedData.readyToSuggest === true) {
      parsedData.readyToSuggest = false;
    }

    // Ensure readyToSuggest=true only if results are actually populated
    if (parsedData.readyToSuggest === true) {
      const hasPaths = parsedData.suggestedPaths && parsedData.suggestedPaths.length >= 2;
      const hasGaps = parsedData.criticalGaps && parsedData.criticalGaps.length >= 2;
      const hasSkills = parsedData.currentSkills && parsedData.currentSkills.length >= 2;
      if (!hasPaths || !hasGaps || !hasSkills) {
        parsedData.readyToSuggest = false;
      }
    }

    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('Error in discovery-chat handler:', error);
    return res.status(500).json({ error: 'Failed to process discovery chat: ' + error.message });
  }
}


// ─── Claude (Anthropic Messages API) ───
const CLAUDE_MODEL = process.env.AI_MODEL || 'claude-haiku-5-5';

// Spend cap. Prices are USD per million tokens [input, output]; an unknown model is priced like Opus (the highest)
// so the cap stays safe. AI_INR_PER_USD is deliberately on the high side so spend is over-, not under-counted.
const AI_BUDGET_INR = Number(process.env.AI_BUDGET_INR || 200);
const AI_INR_PER_USD = Number(process.env.AI_INR_PER_USD || 95);
const PRICES = { 'claude-haiku-5-5': [0.1, 0.5], 'claude-sonnet-5-5': [2, 10], 'claude-opus-5-5': [4, 20] };

const claudeMonth = () => `claude-${new Date().toISOString().slice(0, 7)}`;

export function claudeCostUsd(usage = {}) {
  const [inPrice, outPrice] = PRICES[CLAUDE_MODEL] || [4, 20];
  const tokensIn = (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0);
  return (tokensIn * inPrice + (usage.output_tokens || 0) * outPrice) / 1e6;
}

async function claudeSpend() {
  const client = await clientPromise;
  const doc = await client.db('prodecide').collection('ai_usage').findOne({ _id: claudeMonth() });
  return { spentInr: Number(doc?.costUsd || 0) * AI_INR_PER_USD };
}

// Claude needs alternating user/assistant turns that start with the user.
function toClaudeMessages(messages) {
  const out = [];
  for (const m of messages) {
    const role = m.sender === 'user' ? 'user' : 'assistant';
    const text = String(m.text ?? '').trim();
    if (!text) continue;
    if (out.length === 0 && role === 'assistant') out.push({ role: 'user', content: '(The user opened the chat.)' });
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += `\n\n${text}`;
    else out.push({ role, content: text });
  }
  return out;
}

export { toClaudeMessages };

async function callClaude({ apiKey, system, messages, clientOptions = {} }) {
  const [{ default: Anthropic }, { zodOutputFormat }, { z }] = await Promise.all([
    import('@anthropic-ai/sdk'),
    import('@anthropic-ai/sdk/helpers/zod'),
    import('zod'),
  ]);

  const Reply = z.object({
    text: z.string(),
    options: z.array(z.string()),
    criticalGaps: z.array(z.string()),
    currentSkills: z.array(z.string()),
    suggestedPaths: z.array(z.object({ title: z.string(), icon: z.string() })),
    readyToSuggest: z.boolean(),
  });

  const client = new Anthropic({ apiKey, ...clientOptions });
  const response = await client.messages.parse({
    model: CLAUDE_MODEL,
    max_tokens: 4000,
    system,
    messages: toClaudeMessages(messages),
    // Short chat turns: keep reasoning light for speed and cost
    output_config: { effort: 'low', format: zodOutputFormat(Reply) },
  });

  if (response.stop_reason === 'refusal') throw new Error('Claude declined this request');
  if (!response.parsed_output) throw new Error('Claude returned an unreadable reply');
  return { reply: response.parsed_output, usage: response.usage };
}

export { callClaude };
