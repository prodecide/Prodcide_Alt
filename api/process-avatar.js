import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, image, mimeType } = req.body;
  if (!email || !image || !mimeType) {
    return res.status(400).json({ error: 'Email, image (base64), and mimeType are required' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable');
    return res.status(500).json({ error: 'Gemini API key is not configured on the server' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are an expert image styling and professional avatar agent. Analyze the attached profile photo. 
Identify the person's key visual traits (apparent gender, age, ethnicity, hair style/color, facial hair, glasses, expression) and describe them. 
Then, construct a detailed prompt for generating a professional corporate headshot. 
The new headshot MUST have: professional business attire, a neutral studio backdrop (e.g., solid grey or soft office blur), professional soft studio lighting, realistic portrait photography style, high definition, clean framing. 
Keep the subject's key visual identity from the photo, but transform the setting, clothing, and quality into a premium corporate headshot.
Return a JSON object with:
- description: A short description of the person's traits.
- headshotPrompt: A detailed, high-quality prompt for generating the headshot.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: image
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
            description: { type: 'string' },
            headshotPrompt: { type: 'string' }
          },
          required: ['description', 'headshotPrompt']
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
    const textContent = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('Empty response from Gemini API');
    }

    const parsedData = JSON.parse(textContent);
    
    // Construct the avatar URL using Pollinations.ai (using seed for consistency)
    const seed = Math.floor(Math.random() * 1000000);
    const avatarUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(parsedData.headshotPrompt)}?width=500&height=500&nologo=true&seed=${seed}`;

    // Update in database
    const client = await clientPromise;
    const database = client.db('prodecide');
    const userProfiles = database.collection('user_profiles');
    const normalizedEmail = email.toLowerCase().trim();

    const originalAvatarUrl = `data:${mimeType};base64,${image}`;

    await userProfiles.updateOne(
      { email: normalizedEmail },
      { 
        $set: { 
          avatar: avatarUrl,
          aiAvatar: avatarUrl,
          originalAvatar: originalAvatarUrl,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );

    return res.status(200).json({ 
      success: true, 
      avatarUrl, 
      originalAvatarUrl,
      description: parsedData.description,
      headshotPrompt: parsedData.headshotPrompt
    });
  } catch (error) {
    console.error('Error processing avatar:', error);
    return res.status(500).json({ error: 'Failed to process avatar: ' + error.message });
  }
}
