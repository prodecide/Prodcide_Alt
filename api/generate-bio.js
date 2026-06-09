export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { pdfData } = req.body;
  if (!pdfData) {
    return res.status(400).json({ error: 'pdfData (base64) is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable');
    return res.status(500).json({ error: 'Gemini API key is not configured on the server' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are an expert recruitment and profile-writing agent. Analyze the attached PDF resume/CV and extract the professional details into the specified JSON structure:
- bio: A concise, highly professional summary of the candidate's core expertise, tenure, and strategic vision (2-4 sentences). Written in a premium, executive tone.
- experienceDetails: A list of objects containing:
  - duration: The years of employment (e.g., "2018 - Present" or "2012 - 2018")
  - role: Job title
  - company: Company name
  - description: A brief summary of key responsibilities or achievements in that role
- educationDetails: A list of objects containing:
  - degree: Degree title or certificate
  - school: Academic institution
  - year: Graduation year (e.g., "2010")
- expertise: An array of skills or areas of specialization (max 8 items, concise).`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: pdfData
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            bio: { type: 'string' },
            experienceDetails: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  duration: { type: 'string' },
                  role: { type: 'string' },
                  company: { type: 'string' },
                  description: { type: 'string' }
                },
                required: ['duration', 'role', 'company']
              }
            },
            educationDetails: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  degree: { type: 'string' },
                  school: { type: 'string' },
                  year: { type: 'string' }
                },
                required: ['degree', 'school', 'year']
              }
            },
            expertise: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['bio', 'experienceDetails', 'educationDetails', 'expertise']
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
      console.error('Gemini API call failed:', errorText);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const responseData = await response.json();
    
    // Parse response content text which is expected to be a JSON string
    const textContent = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('Empty response from Gemini API');
    }

    const parsedData = JSON.parse(textContent);
    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('Error generating bio:', error);
    return res.status(500).json({ error: 'Failed to generate profile structure: ' + error.message });
  }
}
