export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages, selectedDomain, onboardingContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
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
Your goal is to guide the user through a professional discovery dialogue to understand their current background, identify technical and business gaps for their desired transition, perform a skill analysis by asking targeted questions, and suggest potential career transition options.

Guidelines:
1. Use very simple, clear English. Keep your responses short, concise, and focused (no long or vague paragraphs).
2. On your very first message, you must ask the user about their current role or educational level (e.g., whether they are in school, university, or working). Provide exact options in the "options" array for this (e.g., ["10th", "12th", "Grad", "Post Grad", "Working Professional"]).
3. For every single response where you ask a question, you must provide a list of 2 to 5 short, clickable option strings in the "options" array that the user can click to answer your question (e.g., ["Technical", "Business", "Design"] or ["Yes", "No", "Not Sure"]). Do not leave the "options" array empty when asking a question.
4. Continuously enquire and ask targeted, step-by-step questions to understand more specific details about their experience, background, and goals.
5. Maintain a list of "currentSkills", "criticalGaps", and "suggestedPaths" based on the entire conversation history.
6. If they mention skills, add them to "currentSkills".
7. If you identify knowledge or qualification barriers for their desired career path, add them to "criticalGaps" (e.g. "GRID PHYSICS", "PPA PRICING", "FINANCIAL MODELING").
8. If you identify potential strategic paths they could target, add them to "suggestedPaths".
9. When you feel you have gathered enough information (typically after 2-3 turns of active dialogue assessing their background and skills), set "readyToSuggest" to true. Do not set it to true immediately on the first turn unless the user's query is extremely specific and fully detailed.

You must respond with a JSON object matching this schema:
- text: (string) Your response to the user. Your response must be short, precise, and in simple English. Explain the context, and ask one targeted follow-up question.
- options: (array of strings) 2 to 5 short option strings the user can click to answer your question (e.g. ["10th", "12th", "Grad", "Post Grad", "Working Professional"]). Must not be empty.
- criticalGaps: (array of strings) The list of critical gaps identified so far (e.g. ["GRID PHYSICS", "PPA PRICING"]).
- currentSkills: (array of strings) The list of identified skills (e.g. ["M&A / Capital Markets", "Corporate Finance"]).
- suggestedPaths: (array of objects containing "title" [string] and "icon" [string]) Suggested strategic options (e.g. [{"title": "Sustainable Energy", "icon": "bolt"}]). Icon should be a valid Google Material Symbols icon name like: "bolt", "settings_suggest", "public", "account_balance", "trending_up", "psychology".
- readyToSuggest: (boolean) Set to true when you have sufficient information to confidently recommend suggested paths and transition them to the next phase.`;

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
    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('Error in discovery-chat handler:', error);
    return res.status(500).json({ error: 'Failed to process discovery chat: ' + error.message });
  }
}
