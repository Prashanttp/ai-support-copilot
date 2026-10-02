import { analyzeDeterministically, validateAndNormalizeModelOutput, validateCustomerMessage } from '../src/lib/analyzer';
import { STRUCTURED_PROMPT } from '../src/lib/prompts';

interface RequestBody {
  message: string;
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
    const hasGemini = Boolean(process.env.GEMINI_API_KEY);
    return res.status(200).json({
      status: 'online',
      liveLLMConfigured: hasOpenAI || hasGemini,
      provider: hasOpenAI ? 'OpenAI (GPT-4o-mini)' : hasGemini ? 'Google Gemini' : 'None (Deterministic Demo Mode)',
      mode: hasOpenAI || hasGemini ? 'live-llm' : 'demo-mode'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const startTime = Date.now();
  const body: RequestBody = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { message } = body;

  const validation = validateCustomerMessage(message);
  if (!validation.isValid) {
    return res.status(400).json({
      error: validation.error,
      fallbackResult: analyzeDeterministically(message || '')
    });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Try OpenAI if configured
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: STRUCTURED_PROMPT.systemPrompt },
            { role: 'user', content: STRUCTURED_PROMPT.userPromptTemplate(validation.sanitizedMessage) }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error:', errorText);
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const data: any = await response.json();
      const rawContent = data.choices?.[0]?.message?.content;
      const parsed = JSON.parse(rawContent);
      const executionTimeMs = Date.now() - startTime;

      const normalized = validateAndNormalizeModelOutput({
        ...parsed,
        modelUsed: data.model || 'gpt-4o-mini',
        executionTimeMs
      }, 'live-llm');

      return res.status(200).json({
        ...normalized,
        isDemoMode: false,
        source: 'live-llm'
      });
    } catch (err: any) {
      console.warn('Falling back to deterministic demo analyzer due to LLM error:', err.message);
      // Graceful fallback with clear indication
      const deterministic = analyzeDeterministically(validation.sanitizedMessage);
      return res.status(200).json({
        ...deterministic,
        isDemoMode: true,
        source: 'demo-mode',
        notice: `API call failed (${err.message}). Safe demo mode fallback utilized.`
      });
    }
  }

  // 2. Try Gemini if configured
  if (geminiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${STRUCTURED_PROMPT.systemPrompt}\n\n${STRUCTURED_PROMPT.userPromptTemplate(validation.sanitizedMessage)}` }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data: any = await response.json();
      const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawContent);
      const executionTimeMs = Date.now() - startTime;

      const normalized = validateAndNormalizeModelOutput({
        ...parsed,
        modelUsed: 'gemini-1.5-flash',
        executionTimeMs
      }, 'live-llm');

      return res.status(200).json({
        ...normalized,
        isDemoMode: false,
        source: 'live-llm'
      });
    } catch (err: any) {
      console.warn('Gemini fallback to demo mode:', err.message);
      const deterministic = analyzeDeterministically(validation.sanitizedMessage);
      return res.status(200).json({
        ...deterministic,
        isDemoMode: true,
        source: 'demo-mode',
        notice: `Gemini API call failed (${err.message}). Demo mode fallback utilized.`
      });
    }
  }

  // 3. Demo Mode (Default when no API key configured)
  const deterministicResult = analyzeDeterministically(validation.sanitizedMessage);
  const executionTimeMs = Date.now() - startTime;

  return res.status(200).json({
    ...deterministicResult,
    executionTimeMs,
    isDemoMode: true,
    source: 'demo-mode',
    notice: 'Demo mode active: No server API key configured. Deterministic heuristic rules engine utilized.'
  });
}
