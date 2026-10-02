export type TicketCategory = 'billing' | 'product' | 'feedback' | 'account access' | 'other';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketSentiment = 'positive' | 'neutral' | 'negative' | 'frustrated';

export type TicketStatus = 'new' | 'needs review' | 'approved' | 'resolved';

export interface AIAnalysisResult {
  category: TicketCategory;
  priority: TicketPriority;
  sentiment: TicketSentiment;
  summary: string;
  suggestedResponse: string;
  confidence: number; // 0 to 1
  humanReviewRequired: boolean;
  humanReviewReason?: string;
  source: 'live-llm' | 'demo-mode';
  modelUsed?: string;
  analyzedAt: string;
  executionTimeMs?: number;
}

export interface Ticket {
  id: string;
  customerName: string;
  customerEmail: string;
  customerTier: 'Free' | 'Pro' | 'Enterprise';
  subject: string;
  message: string;
  createdAt: string;
  status: TicketStatus;
  category: TicketCategory;
  priority: TicketPriority;
  sentiment: TicketSentiment;
  analysis?: AIAnalysisResult;
  reviewedBy?: string;
  reviewedAt?: string;
  editedDraftResponse?: string;
}

export interface PromptComparisonResult {
  message: string;
  basicOutput: {
    rawOutput: string;
    parsedCategory: string;
    parsedPriority: string;
    executionTimeMs: number;
    issuesIdentified: string[];
    isStructuredJson: boolean;
  };
  structuredOutput: {
    result: AIAnalysisResult;
    rawJson: string;
    executionTimeMs: number;
    schemaAdherence: boolean;
    edgeCaseHandled: boolean;
  };
  isDemoMode: boolean;
}

export interface EvaluationCase {
  id: string;
  name: string;
  inputMessage: string;
  expectedCategory: TicketCategory;
  expectedPriority: TicketPriority;
  expectedSentiment: TicketSentiment;
  expectedHumanReview: boolean;
  edgeCaseType?: 'missing_input' | 'adversarial' | 'ambiguous' | 'standard';
  notes: string;
}

export interface EvaluationResultItem {
  testCase: EvaluationCase;
  actualResult: AIAnalysisResult | null;
  categoryMatch: boolean;
  priorityMatch: boolean;
  sentimentMatch: boolean;
  humanReviewMatch: boolean;
  error?: string;
  passed: boolean;
}

export interface EvaluationSummary {
  total: number;
  passed: number;
  categoryAccuracy: number;
  overallAccuracy: number;
  categoryBreakdown: Record<TicketCategory, { total: number; correct: number }>;
  averageConfidence: number;
  edgeCasesTested: number;
  edgeCasesPassed: number;
  executedAt: string;
  mode: 'demo-mode' | 'live-llm';
}
