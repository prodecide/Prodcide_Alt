export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages, selectedDomain } = req.body;
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

    const systemPrompt = `You are the ProDecide Senior Strat-Agent, an expert career strategist. 
The user is facing a challenge in the domain of "${selectedDomain || 'Career Path Selection'}".
Your goal is to guide the user through a professional discovery dialogue to understand their current background, identify technical and business gaps for their desired transition, perform a skill analysis by asking targeted questions, and suggest potential career transition options.

Guidelines:
1. Actively listen and address their concerns in a premium, strategic, and encouraging tone.
2. Maintain a list of "currentSkills", "criticalGaps", and "suggestedPaths" based on the entire conversation history.
3. If they mention skills, add them to "currentSkills".
4. If you identify knowledge or qualification barriers for their desired career path, add them to "criticalGaps" (e.g. "GRID PHYSICS", "PPA PRICING", "FINANCIAL MODELING").
5. If you identify potential strategic paths they could target, add them to "suggestedPaths".
6. When you feel you have gathered enough information (typically after 2-3 turns of active dialogue assessing their background and skills), set "readyToSuggest" to true. Do not set it to true immediately on the first turn unless the user's query is extremely specific and fully detailed.

You must respond with a JSON object matching this schema:
- text: (string) Your response to the user. Acknowledge their input, analyze the bridge strategic transition, and ask a follow-up question.
- criticalGaps: (array of strings) The list of critical gaps identified so far (e.g. ["GRID PHYSICS", "PPA PRICING"]).
- currentSkills: (array of strings) The list of identified skills (e.g. ["M&A / Capital Markets", "Corporate Finance"]).
- suggestedPaths: (array of objects containing "title" [string] and "icon" [string]) Suggested strategic options (e.g. [{"title": "Sustainable Energy", "icon": "bolt"}]). Icon should be a valid Google Material Symbols icon name like: "bolt", "settings_suggest", "public", "account_balance", "trending_up", "psychology".
- readyToSuggest: (boolean) Set to true when you have sufficient information to confidently recommend suggested paths and transition them to the next phase.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\nHere is the conversation history so far:\n${conversationHistory}\nProvide the JSON response.`
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
          required: ['text', 'criticalGaps', 'currentSkills', 'suggestedPaths', 'readyToSuggest']
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
