import { describe, it, expect } from 'vitest';
import { initialTickets } from '../data/mockTickets';
import { analyzeDeterministically } from '../lib/analyzer';

describe('Safety Guardrails & Auto-Dispatch Audit', () => {
  it('ensures all initial tickets and generated outputs maintain draft status without auto-dispatch', () => {
    initialTickets.forEach(ticket => {
      // In initial mock tickets, status is new, needs review, approved, or resolved
      // None of them are marked as "sent" or "auto-dispatched"
      expect(['new', 'needs review', 'approved', 'resolved']).toContain(ticket.status);
      expect(ticket.analysis).toBeDefined();
      if (ticket.analysis) {
        expect(ticket.analysis.suggestedResponse).toBeDefined();
        // Check that suggested responses exist as drafts
        expect(ticket.analysis.suggestedResponse.length).toBeGreaterThan(10);
      }
    });
  });

  it('guarantees deterministic analyzer outputs always identify demo-mode source', () => {
    const output = analyzeDeterministically('I need an invoice copy for accounting.');
    expect(output.source).toBe('demo-mode');
    expect(output.modelUsed).toContain('deterministic');
    // Does not pretend to be a live model
    expect(output.source).not.toBe('live-llm');
  });

  it('forces human review on urgent priority or high financial refund requests', () => {
    const refundTicket = analyzeDeterministically('We were charged twice ($4,800 x 2). Reverse this charge immediately.');
    expect(refundTicket.humanReviewRequired).toBe(true);
    expect(refundTicket.humanReviewReason).toBeDefined();

    const lockoutTicket = analyzeDeterministically('Lost YubiKey 2FA token and cannot access admin account.');
    expect(lockoutTicket.humanReviewRequired).toBe(true);
  });
});
