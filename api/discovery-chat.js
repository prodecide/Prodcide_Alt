import { checkRateLimit } from './_utils/rate-limiter.js';

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

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable');
    return res.status(500).json({ error: 'Gemini API key is not configured on the server' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

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

    const parsedData = JSON.parse(textContent);

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
