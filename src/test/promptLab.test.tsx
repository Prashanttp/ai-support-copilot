import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptLabView } from '../components/prompt-lab/PromptLabView';

describe('PromptLabView Component', () => {
  it('clearly displays Simulated Demo Mode label when isLiveLLM is false', () => {
    render(<PromptLabView isLiveLLM={false} />);

    expect(screen.getByText(/Simulated Heuristic Benchmarking \(Demo Mode\)/i)).toBeInTheDocument();
  });

  it('renders both Naive Basic Prompt and Production Structured Prompt outputs side by side', () => {
    render(<PromptLabView isLiveLLM={false} />);

    expect(screen.getAllByText('Naive / Basic Prompt').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Production Structured Prompt').length).toBeGreaterThan(0);

    // Verify structured guarantees are shown
    expect(screen.getByText(/Production Engineering Guarantees:/i)).toBeInTheDocument();
    expect(screen.getByText(/100% VALID JSON/i)).toBeInTheDocument();

    // Verify naive flaws are shown
    expect(screen.getByText(/Production Risks & Failures Detected:/i)).toBeInTheDocument();
    expect(screen.getByText(/FAILED \(Unstructured\)/i)).toBeInTheDocument();

    // Verify architectural breakdown table is present
    expect(screen.getByText('Architectural Prompt Engineering Breakdown')).toBeInTheDocument();
  });

  it('updates side-by-side comparison when selecting a different scenario', () => {
    render(<PromptLabView isLiveLLM={false} />);

    const injectionBtn = screen.getByRole('button', { name: /Prompt Injection Jailbreak/i });
    fireEvent.click(injectionBtn);

    // Naive prompt fails with critical vulnerability message on injection
    expect(screen.getByText(/VULNERABILITY: Basic prompt succumbed to prompt injection/i)).toBeInTheDocument();
  });
});
