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
  validateJDContent
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
