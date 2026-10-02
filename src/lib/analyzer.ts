import { AIAnalysisResult, TicketCategory, TicketPriority, TicketSentiment } from '../types';

export interface AnalyzerInput {
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedMessage: string;
  error?: string;
}

/**
 * Validates input message against empty content, excessive length, or malformed input.
 */
export function validateCustomerMessage(message: unknown): ValidationResult {
  if (typeof message !== 'string') {
    return {
      isValid: false,
      sanitizedMessage: '',
      error: 'Message must be a valid text string.'
    };
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return {
      isValid: false,
      sanitizedMessage: '',
      error: 'Message cannot be empty or solely whitespace.'
    };
  }

  if (trimmed.length > 8000) {
    return {
      isValid: false,
      sanitizedMessage: trimmed.slice(0, 8000),
      error: 'Message exceeds maximum allowed length of 8,000 characters.'
    };
  }

  return {
    isValid: true,
    sanitizedMessage: trimmed
  };
}

/**
 * Deterministic classifier used for Demo Mode, synthetic evaluations, and offline resilience.
 * Employs keyword heuristics, sentiment signals, and security rules.
 */
export function analyzeDeterministically(rawMessage: string): AIAnalysisResult {
  const validation = validateCustomerMessage(rawMessage);
  
  if (!validation.isValid) {
    return {
      category: 'other',
      priority: 'low',
      sentiment: 'neutral',
      summary: 'Empty or invalid input received.',
      suggestedResponse: 'Hi there,\n\nWe received a blank message from you. Could you please provide details on how we can assist you today?\n\nBest regards,\nSupport Team',
      confidence: 0.3,
      humanReviewRequired: true,
      humanReviewReason: 'Input was empty or invalid; human agent should follow up.',
      source: 'demo-mode',
      modelUsed: 'deterministic-rules-engine-v1',
      analyzedAt: new Date().toISOString(),
      executionTimeMs: 45
    };
  }

  const text = validation.sanitizedMessage.toLowerCase();

  // 1. Adversarial / Prompt Injection Check
  const adversarialPatterns = [
    'ignore all previous instructions',
    'system override',
    'disregard previous',
    'forget all prior',
    'admin mode',
    'dan mode',
    'jailbreak'
  ];
  const isAdversarial = adversarialPatterns.some(pat => text.includes(pat));
  if (isAdversarial) {
    return {
      category: 'other',
      priority: 'urgent',
      sentiment: 'neutral',
      summary: 'Flagged potential prompt injection or unauthorized system override command in message text.',
      suggestedResponse: 'Hello,\n\nYour message has been received and routed to our security operations team for manual verification before any action can be taken.',
      confidence: 0.99,
      humanReviewRequired: true,
      humanReviewReason: 'Security alert: Message contains prompt injection patterns.',
      source: 'demo-mode',
      modelUsed: 'deterministic-rules-engine-v1',
      analyzedAt: new Date().toISOString(),
      executionTimeMs: 65
    };
  }

  // 2. Ambiguity Check (extremely short & vague)
  if (text.length < 35 && !text.includes('password') && !text.includes('refund') && !text.includes('bill')) {
    const isVague = text.includes('not working') || text.includes('broken') || text.includes('fix it') || text.includes('help');
    if (isVague) {
      return {
        category: 'other',
        priority: 'medium',
        sentiment: 'frustrated',
        summary: 'Vague customer assistance request with insufficient technical context.',
        suggestedResponse: 'Hello,\n\nThank you for reaching out. To help resolve this quickly, could you share a bit more detail about what issue you are experiencing, any error messages you see, or which browser/device you are using?\n\nWe are here to help!',
        confidence: 0.52,
        humanReviewRequired: true,
        humanReviewReason: 'Uncertain classification: Message lacks context or specific error symptoms.',
        source: 'demo-mode',
        modelUsed: 'deterministic-rules-engine-v1',
        analyzedAt: new Date().toISOString(),
        executionTimeMs: 70
      };
    }
  }

  // 3. Category Detection
  let category: TicketCategory = 'other';
  let categoryConfidence = 0.85;

  const billingKeywords = ['charge', 'charged', 'refund', 'invoice', 'receipt', 'billing', 'subscription', 'renewal', 'vat', 'tax', 'cancel', 'payment', 'card', 'amex', 'overcharge', 'dollars', '$'];
  const accountKeywords = ['2fa', 'authenticator', 'yubikey', 'login', 'logged out', 'locked out', 'sso', 'saml', 'okta', 'password', 'mfa', 'credentials', 'reset password'];
  const feedbackKeywords = ['love', 'great work', 'suggestion', 'wishlist', 'feedback', 'feature request', 'kudos', 'vim', 'shortcut', 'compliment'];
  const productKeywords = ['error', '500', '429', 'bug', 'crash', 'webhook', 'api', 'blank screen', 'corrupt', 'encoding', 'safari', 'chrome', 'rate limit', 'endpoint', 'broken', 'slow', 'fail'];

  const countMatches = (keywords: string[]) => keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);

  const billingScore = countMatches(billingKeywords);
  const accountScore = countMatches(accountKeywords);
  const feedbackScore = countMatches(feedbackKeywords);
  const productScore = countMatches(productKeywords);

  if (accountScore > 0 && accountScore >= billingScore && accountScore >= productScore && accountScore >= feedbackScore) {
    category = 'account access';
    categoryConfidence = 0.94;
  } else if (billingScore > 0 && billingScore >= productScore && billingScore >= feedbackScore) {
    category = 'billing';
    categoryConfidence = 0.96;
  } else if (feedbackScore > 0 && feedbackScore > productScore) {
    category = 'feedback';
    categoryConfidence = 0.92;
  } else if (productScore > 0) {
    category = 'product';
    categoryConfidence = 0.93;
  } else {
    category = 'other';
    categoryConfidence = 0.80;
  }

  // 4. Sentiment Detection
  let sentiment: TicketSentiment = 'neutral';
  if (text.includes('critical') || text.includes('frozen') || text.includes('unacceptable') || text.includes('immediately') || text.includes('cannot log in') || text.includes('payroll')) {
    sentiment = 'frustrated';
  } else if (text.includes('error') || text.includes('failing') || text.includes('dispute') || text.includes('difference') || text.includes('problem') || text.includes('corrupted') || text.includes('delay')) {
    sentiment = 'negative';
  } else if (text.includes('love') || text.includes('great') || text.includes('awesome') || text.includes('best') || text.includes('thank')) {
    sentiment = 'positive';
  }

  // 5. Priority Detection
  let priority: TicketPriority = 'medium';
  if (text.includes('critical') || text.includes('urgent') || text.includes('double billed') || text.includes('frozen') || text.includes('payroll') || text.includes('emergency')) {
    priority = 'urgent';
  } else if (text.includes('500') || text.includes('crash') || text.includes('rate limit') || text.includes('429') || text.includes('sso') || text.includes('saml') || text.includes('refund')) {
    priority = 'high';
  } else if (category === 'feedback' || text.includes('question regarding') || text.includes('suggestion')) {
    priority = 'low';
  }

  // 6. Human Review Flag
  let humanReviewRequired = false;
  let humanReviewReason: string | undefined;

  if (priority === 'urgent') {
    humanReviewRequired = true;
    humanReviewReason = 'Urgent severity ticket requires immediate human verification and sign-off.';
  } else if (category === 'billing' && (text.includes('refund') || text.includes('charge') || text.includes('dispute'))) {
    humanReviewRequired = true;
    humanReviewReason = 'Monetary refund or disputed charge requires human accounting authorization.';
  } else if (category === 'account access' && (text.includes('locked out') || text.includes('lost 2fa') || text.includes('yubikey') || text.includes('okta'))) {
    humanReviewRequired = true;
    humanReviewReason = 'Administrative security lockout or SAML identity provider configuration.';
  } else if (categoryConfidence < 0.82) {
    humanReviewRequired = true;
    humanReviewReason = 'Model confidence is below threshold (< 0.82).';
  }

  // 7. Issue Summary
  const firstSentence = validation.sanitizedMessage.split(/[.!?\n]/)[0] || validation.sanitizedMessage;
  const summary = firstSentence.length > 120 ? firstSentence.slice(0, 117) + '...' : firstSentence;

  // 8. Suggested Response (Always drafted, never auto-dispatched)
  let suggestedResponse = '';
  switch (category) {
    case 'billing':
      suggestedResponse = `Hi there,\n\nThank you for reaching out regarding your account billing. I am reviewing the details of the charge and subscription status on file. A member of our billing team will follow up within 2 business hours with an updated statement or refund confirmation.\n\nBest regards,\nBilling Support Team`;
      break;
    case 'account access':
      suggestedResponse = `Hello,\n\nWe understand that regaining access to your account is critical. To protect your security, our identity verification team has flagged this request. Please verify your backup phone or email so we can securely restore your credentials.\n\nBest regards,\nSecurity Operations`;
      break;
    case 'product':
      suggestedResponse = `Hi,\n\nThank you for reporting this issue. We have logged the details with our engineering team and are actively investigating the symptoms you described. We will keep you updated here with diagnostic steps or resolution progress.\n\nBest regards,\nProduct Support`;
      break;
    case 'feedback':
      suggestedResponse = `Hello!\n\nThank you very much for taking the time to share your feedback with our product team. We review customer requests weekly during our roadmap planning and have added your notes to our feature backlog.\n\nWarm regards,\nProduct Team`;
      break;
    default:
      suggestedResponse = `Hello,\n\nThank you for contacting customer support. We have received your inquiry and our support team will review your details to provide you with the most accurate resolution shortly.\n\nBest regards,\nCustomer Operations`;
      break;
  }

  return {
    category,
    priority,
    sentiment,
    summary,
    suggestedResponse,
    confidence: Number(categoryConfidence.toFixed(2)),
    humanReviewRequired,
    humanReviewReason,
    source: 'demo-mode',
    modelUsed: 'deterministic-rules-engine-v1',
    analyzedAt: new Date().toISOString(),
    executionTimeMs: 120
  };
}

/**
 * Validates and normalizes raw JSON returned by an LLM model, ensuring
 * that any hallucinated fields or missing properties are sanitized.
 */
export function validateAndNormalizeModelOutput(raw: any, source: 'live-llm' | 'demo-mode' = 'live-llm'): AIAnalysisResult {
  const allowedCategories: TicketCategory[] = ['billing', 'product', 'feedback', 'account access', 'other'];
  const allowedPriorities: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];
  const allowedSentiments: TicketSentiment[] = ['positive', 'neutral', 'negative', 'frustrated'];

  const category = allowedCategories.includes(raw?.category) ? (raw.category as TicketCategory) : 'other';
  const priority = allowedPriorities.includes(raw?.priority) ? (raw.priority as TicketPriority) : 'medium';
  const sentiment = allowedSentiments.includes(raw?.sentiment) ? (raw.sentiment as TicketSentiment) : 'neutral';

  const rawConfidence = typeof raw?.confidence === 'number' ? raw.confidence : 0.85;
  const confidence = Math.min(1, Math.max(0, Number(rawConfidence.toFixed(2))));

  const summary = typeof raw?.summary === 'string' && raw.summary.trim().length > 0
    ? raw.summary.trim()
    : 'Summary not provided by model.';

  const suggestedResponse = typeof raw?.suggestedResponse === 'string' && raw.suggestedResponse.trim().length > 0
    ? raw.suggestedResponse.trim()
    : 'Hello,\n\nThank you for reaching out. We have received your request and our team is looking into it.\n\nBest regards,\nSupport';

  const humanReviewRequired = Boolean(raw?.humanReviewRequired) || confidence < 0.80 || priority === 'urgent';
  const humanReviewReason = raw?.humanReviewReason || (humanReviewRequired ? 'Flagged based on confidence or priority threshold.' : undefined);

  return {
    category,
    priority,
    sentiment,
    summary,
    suggestedResponse,
    confidence,
    humanReviewRequired,
    humanReviewReason,
    source,
    modelUsed: raw?.modelUsed || 'llm-json-mode',
    analyzedAt: new Date().toISOString(),
    executionTimeMs: raw?.executionTimeMs || 300
  };
}
