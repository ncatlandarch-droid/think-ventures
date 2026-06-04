/**
 * Bella TTS — Netlify Serverless Proxy
 * 
 * Securely proxies Gemini Neural TTS requests.
 * API key is in Netlify env vars, never exposed to browser.
 * 
 * POST /.netlify/functions/bella-tts
 * Body: { "text": "...", "voice": "Kore" }
 * Returns: { "audio": "base64...", "mimeType": "audio/L16;rate=24000" }
 */

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const { text, voice = 'Kore' } = JSON.parse(event.body || '{}');

    if (!text || text.length > 500) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Text required (max 500 chars)' }) };
    }

    // Rate limit: basic check (production would use Redis/KV)
    // For now, just limit text length to prevent abuse

    const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } }
            }
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini TTS error:', response.status, err.substring(0, 200));
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'TTS generation failed' }) };
    }

    const data = await response.json();
    const audioPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (!audioPart) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'No audio returned' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        audio: audioPart.inlineData.data,
        mimeType: audioPart.inlineData.mimeType || 'audio/L16;rate=24000'
      })
    };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
