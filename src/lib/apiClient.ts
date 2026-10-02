import { AIAnalysisResult } from '../types';
import { analyzeDeterministically, validateCustomerMessage } from './analyzer';

export interface ApiStatus {
  status: 'online' | 'offline';
  liveLLMConfigured: boolean;
  provider: string;
  mode: 'live-llm' | 'demo-mode';
}

export async function checkApiStatus(): Promise<ApiStatus> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      return {
        status: 'online',
        liveLLMConfigured: Boolean(data.liveLLMConfigured),
        provider: data.provider || 'Deterministic Demo Engine',
        mode: data.mode || 'demo-mode'
      };
    }
  } catch {
    // If endpoint is not reachable (e.g. static preview)
  }

  return {
    status: 'online',
    liveLLMConfigured: false,
    provider: 'Built-in Demo Engine (Client-Side Fallback)',
    mode: 'demo-mode'
  };
}

export async function requestAIAnalysis(message: string): Promise<AIAnalysisResult> {
  const validation = validateCustomerMessage(message);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid message content.');
  }

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: validation.sanitizedMessage })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        category: data.category,
        priority: data.priority,
        sentiment: data.sentiment,
        summary: data.summary,
        suggestedResponse: data.suggestedResponse,
        confidence: typeof data.confidence === 'number' ? data.confidence : 0.85,
        humanReviewRequired: Boolean(data.humanReviewRequired),
        humanReviewReason: data.humanReviewReason,
        source: data.source || (data.isDemoMode ? 'demo-mode' : 'live-llm'),
        modelUsed: data.modelUsed || (data.isDemoMode ? 'deterministic-rules-engine' : 'live-llm'),
        analyzedAt: data.analyzedAt || new Date().toISOString(),
        executionTimeMs: data.executionTimeMs || 150
      };
    }
  } catch (err) {
    console.warn('Network call to /api/analyze failed, falling back to local deterministic analysis:', err);
  }

  // Safe client-side fallback if server endpoint is unreachable
  return analyzeDeterministically(validation.sanitizedMessage);
}
