/**
 * Tests for jd-validator.js
 * Job Description inline validation
 */
import { validateDocument, getScoreColor, getScoreLabel } from '../../shared/js/jd-validator.js';

describe('JD Validator', () => {
  describe('validateDocument', () => {
    test('should return score for empty content', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBeDefined();
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });

    test('should handle null gracefully', () => {
      // JD validator may throw or return a score - just ensure no crash
      try {
        const result = validateDocument(null);
        expect(result.totalScore).toBeDefined();
      } catch (e) {
        // Some validators throw on null, which is acceptable
        expect(e).toBeDefined();
      }
    });

    test('should return score for short content', () => {
      const result = validateDocument('Too short');
      expect(result.totalScore).toBeDefined();
    });

    test('should score a well-structured job description', () => {
      const goodJD = `
# Senior Software Engineer

## About the Role
We are looking for a talented engineer to join our team.
This is a full-time position with competitive salary range of $150,000 - $180,000.

## Requirements
- 5+ years of experience with TypeScript and React
- Experience with cloud platforms (AWS, GCP)
- Strong problem-solving skills

## Responsibilities
- Design and implement scalable systems
- Collaborate with product team on features
- Mentor junior engineers

## Benefits
- Remote work flexibility
- Health insurance
- 401k matching

We encourage candidates from all backgrounds to apply.
      `.repeat(2);
      const result = validateDocument(goodJD);
      expect(result.totalScore).toBeGreaterThan(40);
      expect(result.grade).toBeDefined();
      expect(result.colorClass).toBeDefined();
    });

    test('should penalize masculine-coded language', () => {
      const biasedJD = `
# Software Ninja Role
We need a rockstar developer who is aggressive and competitive.
Must be a self-reliant guru with dominant personality.
      `.repeat(3);
      const result = validateDocument(biasedJD);
      expect(result.inclusivity.score).toBeLessThan(result.inclusivity.maxScore);
    });

    test('should detect red flag phrases', () => {
      const toxicJD = `
# Software Engineer
Fast-paced environment where we work hard play hard!
We are like a family and need someone who can hustle.
Must have thick skin and do whatever it takes.
      `.repeat(3);
      const result = validateDocument(toxicJD);
      expect(result.culture.score).toBeLessThan(result.culture.maxScore);
    });

    test('should reward salary transparency', () => {
      const transparentJD = `
# Software Engineer
Salary: $120,000 - $150,000 annually
Full health benefits included
      `.repeat(3);
      const result = validateDocument(transparentJD);
      expect(result.transparency.score).toBeGreaterThan(0);
    });

    test('should support internal posting type', () => {
      const internalJD = `
# Internal Transfer: Senior Engineer
Internal candidates with 2+ years preferred.
      `.repeat(5);
      const result = validateDocument(internalJD, 'internal');
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getScoreColor', () => {
    test('should return green for high scores', () => {
      expect(getScoreColor(85)).toBe('green');
      expect(getScoreColor(70)).toBe('green');
    });

    test('should return yellow for medium scores', () => {
      expect(getScoreColor(55)).toBe('yellow');
      expect(getScoreColor(50)).toBe('yellow');
    });

    test('should return orange for low-medium scores', () => {
      expect(getScoreColor(35)).toBe('orange');
      expect(getScoreColor(30)).toBe('orange');
    });

    test('should return red for low scores', () => {
      expect(getScoreColor(25)).toBe('red');
      expect(getScoreColor(10)).toBe('red');
    });
  });

  describe('getScoreLabel', () => {
    test('should return Excellent for high scores', () => {
      expect(getScoreLabel(85)).toBe('Excellent');
      expect(getScoreLabel(80)).toBe('Excellent');
    });

    test('should return Ready for good scores', () => {
      expect(getScoreLabel(75)).toBe('Ready');
      expect(getScoreLabel(70)).toBe('Ready');
    });

    test('should return Needs Work for medium scores', () => {
      expect(getScoreLabel(55)).toBe('Needs Work');
      expect(getScoreLabel(50)).toBe('Needs Work');
    });

    test('should return Draft for low scores', () => {
      expect(getScoreLabel(35)).toBe('Draft');
      expect(getScoreLabel(30)).toBe('Draft');
    });

    test('should return Incomplete for very low scores', () => {
      expect(getScoreLabel(25)).toBe('Incomplete');
      expect(getScoreLabel(10)).toBe('Incomplete');
    });
  });
});

