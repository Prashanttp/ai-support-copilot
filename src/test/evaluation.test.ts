import { describe, it, expect } from 'vitest';
import { evaluationDataset } from '../data/evaluationDataset';
import { analyzeDeterministically } from '../lib/analyzer';

describe('Evaluation Dataset Accuracy Benchmark', () => {
  it('achieves > 90% category classification accuracy on the synthetic benchmark dataset', () => {
    let correctCount = 0;

    evaluationDataset.forEach((testCase) => {
      const result = analyzeDeterministically(testCase.inputMessage);
      if (result.category === testCase.expectedCategory) {
        correctCount++;
      }
    });

    const accuracy = (correctCount / evaluationDataset.length) * 100;
    expect(accuracy).toBeGreaterThanOrEqual(90);
    expect(correctCount).toBeGreaterThanOrEqual(10);
  });

  it('safely handles all edge cases (missing input, adversarial, ambiguous)', () => {
    const edgeCases = evaluationDataset.filter(tc => tc.edgeCaseType !== 'standard');
    expect(edgeCases.length).toBeGreaterThanOrEqual(3);

    edgeCases.forEach(tc => {
      const result = analyzeDeterministically(tc.inputMessage);
      // All edge cases must trigger human review or safe fallback
      expect(result.humanReviewRequired).toBe(true);
      expect(result.suggestedResponse).toBeDefined();
    });
  });
});
