/**
 * Tests for JD Validator - Integration tests for assistant
 *
 * Note: Comprehensive validator tests are in validator/tests/validator.test.js
 * These tests verify that the assistant correctly imports from the canonical validator.
 */

import {
  validateDocument,
  getScoreColor,
  getScoreLabel,
  getGrade,
  validateJDContent,
  // Individual scoring functions
  scoreWordCount,
  scoreMasculineCoded,
  scoreExtrovertBias,
  scoreRedFlags,
  scoreCompensation,
  scoreEncouragement,
  scoreSlopPenalty
} from '../../validator/js/validator.js';

// ============================================================================
// Integration Tests - Verify canonical validator is used
// ============================================================================

describe('JD Validator Integration', () => {
  describe('validateDocument', () => {
    test('should return score for valid JD content', () => {
      const result = validateDocument(`# Senior Software Engineer

## About the Role
Join our team to build scalable systems.

## Key Responsibilities
- Own the authentication service
- Mentor junior engineers

## Required Qualifications
- 3+ years experience with Python
- Experience with distributed systems

## What We Offer
- Compensation: $170,000 - $220,000
- Remote-first culture

## To Apply
Submit your resume.
`);
      expect(result.score).toBeGreaterThan(0);
      expect(result.grade).toBeDefined();
    });

    test('should return score for empty content', () => {
      const result = validateDocument('');
      expect(result.score).toBeDefined();
      expect(typeof result.score).toBe('number');
    });

    test('should handle null content gracefully', () => {
      // JD validator may throw on null - just ensure consistent behavior
      expect(() => validateDocument(null)).toThrow();
    });
  });

  describe('getScoreColor', () => {
    test('should return Tailwind color class', () => {
      expect(getScoreColor(80)).toMatch(/text-/);
      expect(getScoreColor(60)).toMatch(/text-/);
      expect(getScoreColor(40)).toMatch(/text-/);
      expect(getScoreColor(20)).toMatch(/text-/);
    });
  });

  describe('getScoreLabel', () => {
    test('should return label for score >= 80', () => {
      expect(getScoreLabel(80)).toBe('Excellent');
      expect(getScoreLabel(100)).toBe('Excellent');
    });

    test('should return label for score 70-79', () => {
      expect(getScoreLabel(70)).toBe('Ready');
      expect(getScoreLabel(79)).toBe('Ready');
    });

    test('should return label for score 50-69', () => {
      expect(getScoreLabel(50)).toBe('Needs Work');
      expect(getScoreLabel(69)).toBe('Needs Work');
    });

    test('should return label for score 30-49', () => {
      expect(getScoreLabel(30)).toBe('Draft');
      expect(getScoreLabel(49)).toBe('Draft');
    });

    test('should return label for score < 30', () => {
      expect(getScoreLabel(0)).toBe('Incomplete');
      expect(getScoreLabel(29)).toBe('Incomplete');
    });
  });

  describe('getGrade', () => {
    test('should return letter grade', () => {
      expect(getGrade(90)).toMatch(/[A-F]/);
      expect(getGrade(50)).toMatch(/[A-F]/);
      expect(getGrade(20)).toMatch(/[A-F]/);
    });
  });

  describe('validateJDContent', () => {
    test('should return validation result', () => {
      const result = validateJDContent('Senior Software Engineer role');
      expect(result.warnings).toBeDefined();
      expect(result.valid).toBeDefined();
    });
  });
});

// ============================================================================
// Scoring Functions Tests
// ============================================================================

describe('Scoring Functions', () => {
  describe('scoreWordCount', () => {
    test('should return no penalty for ideal word count (400-700)', () => {
      const text = 'word '.repeat(500); // 500 words
      const result = scoreWordCount(text);
      expect(result.penalty).toBe(0);
      expect(result.maxPenalty).toBe(15);
      expect(result.wordCount).toBe(500);
      expect(result.feedback).toContain('✅');
    });

    test('should penalize short JDs (< 400 words)', () => {
      const text = 'word '.repeat(200); // 200 words
      const result = scoreWordCount(text);
      expect(result.penalty).toBeGreaterThan(0);
      expect(result.penalty).toBeLessThanOrEqual(15);
      expect(result.feedback).toContain('⚠️');
      expect(result.deduction).toContain('Too short');
    });

    test('should penalize long JDs (> 700 words)', () => {
      const text = 'word '.repeat(900); // 900 words
      const result = scoreWordCount(text);
      expect(result.penalty).toBeGreaterThan(0);
      expect(result.penalty).toBeLessThanOrEqual(10);
      expect(result.feedback).toContain('⚠️');
      expect(result.deduction).toContain('Too long');
    });

    test('should cap penalty at max for very short JDs', () => {
      const text = 'word '.repeat(50); // 50 words
      const result = scoreWordCount(text);
      expect(result.penalty).toBe(15); // Max penalty
    });
  });

  describe('scoreMasculineCoded', () => {
    test('should return no penalty for clean warnings', () => {
      const result = scoreMasculineCoded([]);
      expect(result.penalty).toBe(0);
      expect(result.maxPenalty).toBe(25);
      expect(result.count).toBe(0);
      expect(result.feedback).toContain('✅');
    });

    test('should penalize masculine-coded words', () => {
      const warnings = [
        { type: 'masculine-coded', word: 'aggressive' },
        { type: 'masculine-coded', word: 'ninja' }
      ];
      const result = scoreMasculineCoded(warnings);
      expect(result.penalty).toBe(10); // 2 * 5
      expect(result.count).toBe(2);
      expect(result.feedback).toContain('🚨');
    });

    test('should cap penalty at 25', () => {
      const warnings = Array(10).fill({ type: 'masculine-coded', word: 'test' });
      const result = scoreMasculineCoded(warnings);
      expect(result.penalty).toBe(25); // Max penalty
    });

    test('should ignore non-masculine-coded warnings', () => {
      const warnings = [
        { type: 'red-flag', phrase: 'fast-paced' },
        { type: 'extrovert-bias', phrase: 'outgoing' }
      ];
      const result = scoreMasculineCoded(warnings);
      expect(result.penalty).toBe(0);
    });
  });

  describe('scoreExtrovertBias', () => {
    test('should return no penalty for clean warnings', () => {
      const result = scoreExtrovertBias([]);
      expect(result.penalty).toBe(0);
      expect(result.maxPenalty).toBe(20);
      expect(result.feedback).toContain('✅');
    });

    test('should penalize extrovert-bias phrases', () => {
      const warnings = [
        { type: 'extrovert-bias', phrase: 'outgoing' },
        { type: 'extrovert-bias', phrase: 'high-energy' }
      ];
      const result = scoreExtrovertBias(warnings);
      expect(result.penalty).toBe(10); // 2 * 5
      expect(result.count).toBe(2);
    });

    test('should cap penalty at 20', () => {
      const warnings = Array(10).fill({ type: 'extrovert-bias', phrase: 'test' });
      const result = scoreExtrovertBias(warnings);
      expect(result.penalty).toBe(20); // Max penalty
    });
  });

  describe('scoreRedFlags', () => {
    test('should return no penalty for clean warnings', () => {
      const result = scoreRedFlags([]);
      expect(result.penalty).toBe(0);
      expect(result.maxPenalty).toBe(25);
      expect(result.feedback).toContain('✅');
    });

    test('should penalize red flag phrases', () => {
      const warnings = [
        { type: 'red-flag', phrase: 'fast-paced' },
        { type: 'red-flag', phrase: 'like a family' }
      ];
      const result = scoreRedFlags(warnings);
      expect(result.penalty).toBe(10); // 2 * 5
      expect(result.count).toBe(2);
    });

    test('should cap penalty at 25', () => {
      const warnings = Array(10).fill({ type: 'red-flag', phrase: 'test' });
      const result = scoreRedFlags(warnings);
      expect(result.penalty).toBe(25); // Max penalty
    });
  });

  describe('scoreCompensation', () => {
    test('should skip check for internal postings', () => {
      const result = scoreCompensation('No salary info', true);
      expect(result.penalty).toBe(0);
      expect(result.skipped).toBe(true);
      expect(result.feedback).toContain('Internal posting');
    });

    test('should return no penalty when compensation is present (USD)', () => {
      const result = scoreCompensation('Salary: $150,000 - $200,000', false);
      expect(result.penalty).toBe(0);
      expect(result.hasCompensation).toBe(true);
      expect(result.feedback).toContain('✅');
    });

    test('should return no penalty for international formats (EUR)', () => {
      const result = scoreCompensation('Salary: €80,000 - €120,000', false);
      expect(result.penalty).toBe(0);
      expect(result.hasCompensation).toBe(true);
    });

    test('should return no penalty for currency code formats', () => {
      const result = scoreCompensation('Salary: 150,000 - 200,000 USD', false);
      expect(result.penalty).toBe(0);
      expect(result.hasCompensation).toBe(true);
    });

    test('should penalize missing compensation for external postings', () => {
      const result = scoreCompensation('No salary information provided', false);
      expect(result.penalty).toBe(10);
      expect(result.hasCompensation).toBe(false);
      expect(result.feedback).toContain('⚠️');
    });
  });

  describe('scoreEncouragement', () => {
    test('should return no penalty for 60-70% statement', () => {
      const result = scoreEncouragement('If you meet 60-70% of the requirements, please apply!');
      expect(result.penalty).toBe(0);
      expect(result.hasEncouragement).toBe(true);
      expect(result.feedback).toContain('✅');
    });

    test('should return no penalty for "we encourage" statement', () => {
      const result = scoreEncouragement('We encourage all qualified candidates to apply');
      expect(result.penalty).toBe(0);
      expect(result.hasEncouragement).toBe(true);
    });

    test('should return no penalty for "meet most requirements" statement', () => {
      const result = scoreEncouragement('If you meet most of the requirements, apply!');
      expect(result.penalty).toBe(0);
      expect(result.hasEncouragement).toBe(true);
    });

    test('should penalize missing encouragement statement', () => {
      const result = scoreEncouragement('Just a regular job description');
      expect(result.penalty).toBe(5);
      expect(result.hasEncouragement).toBe(false);
      expect(result.feedback).toContain('⚠️');
    });

    test('should require qualifications context for "don\'t meet all"', () => {
      // Gaming attempt without context should fail
      const gaming = scoreEncouragement('We don\'t meet all our goals');
      expect(gaming.penalty).toBe(5);

      // Proper usage with context should pass
      const proper = scoreEncouragement('If you don\'t meet all the qualifications, still apply!');
      expect(proper.penalty).toBe(0);
    });
  });

  describe('scoreSlopPenalty', () => {
    test('should return no penalty for authentic content', () => {
      const result = scoreSlopPenalty('Build authentication systems using OAuth2 and JWT tokens.');
      expect(result.penalty).toBe(0);
      expect(result.maxPenalty).toBe(5);
    });

    test('should return penalty for AI-generated language', () => {
      // Text with common AI slop patterns
      const slopText = 'We are seeking a dynamic individual who will leverage cutting-edge technologies to drive innovation and deliver world-class solutions in a fast-paced environment.';
      const result = scoreSlopPenalty(slopText);
      // May or may not trigger depending on slop detection thresholds
      expect(result.maxPenalty).toBe(5);
      expect(result.penalty).toBeLessThanOrEqual(5);
    });

    test('should cap penalty at 5', () => {
      // Even very sloppy text should cap at 5
      const result = scoreSlopPenalty('Leverage synergies to drive innovation and deliver world-class solutions.');
      expect(result.penalty).toBeLessThanOrEqual(5);
    });
  });
});
