import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EvaluationView } from '../components/evaluation/EvaluationView';

describe('EvaluationView Component', () => {
  it('renders benchmark cards, actual accuracy results, and heuristic disclaimer', async () => {
    render(<EvaluationView isLiveLLM={false} />);

    // Check for mandatory Heuristic Validation Disclaimer
    expect(screen.getByText(/Heuristic Validation Disclaimer \(Portfolio Project Scope\):/i)).toBeInTheDocument();
    expect(screen.getByText(/should not be misconstrued as full production statistical validation/i)).toBeInTheDocument();

    // Wait for the benchmark evaluation to complete and display summary metrics
    await waitFor(() => {
      expect(screen.getByText('Classification Accuracy')).toBeInTheDocument();
      expect(screen.getByText(/11 of 11 Correct/i)).toBeInTheDocument();
      expect(screen.getByText('100% Guarded')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('filters table to show Edge Cases Only when button is clicked', async () => {
    render(<EvaluationView isLiveLLM={false} />);

    await waitFor(() => {
      expect(screen.getByText('Synthetic Test Suite Breakdown')).toBeInTheDocument();
    }, { timeout: 3000 });

    const edgeCasesBtn = screen.getByRole('button', { name: /Edge Cases Only/i });
    fireEvent.click(edgeCasesBtn);

    // Edge cases should be visible
    expect(screen.getByText('Ambiguous / Vague Help Request')).toBeInTheDocument();
    expect(screen.getByText('Prompt Injection / Adversarial Attempt')).toBeInTheDocument();
    expect(screen.getByText('Missing / Whitespace Only Input')).toBeInTheDocument();
  });

  it('runs the malformed output normalizer simulation when triggered', async () => {
    render(<EvaluationView isLiveLLM={false} />);

    const simulateBtn = screen.getByRole('button', { name: /Simulate Malformed LLM Response/i });
    fireEvent.click(simulateBtn);

    // Verify sanitizer success message is displayed
    expect(screen.getByText(/Runtime Sanitizer Succeeded: Fallbacks gracefully injected/i)).toBeInTheDocument();
    expect(screen.getByText(/Raw Hallucinated Input:/i)).toBeInTheDocument();
    expect(screen.getByText(/Sanitized Enterprise Output:/i)).toBeInTheDocument();
  });
});
