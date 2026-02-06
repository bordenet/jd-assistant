/**
 * Tests for validator/js/prompts.js
 * Tests prompt generation functions for LLM-based Job Description scoring
 */

import { describe, test, expect } from '@jest/globals';
import {
  generateLLMScoringPrompt,
  generateCritiquePrompt,
  generateRewritePrompt,
  cleanAIResponse
} from '../js/prompts.js';

describe('prompts.js', () => {
  const sampleContent = `# Senior Software Engineer - Backend
## About the Role
Join our team to build scalable backend services that power millions of users.
## Responsibilities
- Design and implement RESTful APIs
- Optimize database queries for performance
- Mentor junior engineers
## Requirements
- 5+ years of experience with Python or Go
- Experience with PostgreSQL or MySQL
- Strong understanding of distributed systems`;

  describe('generateLLMScoringPrompt', () => {
    test('should generate a prompt containing the content', () => {
      const prompt = generateLLMScoringPrompt(sampleContent);
      expect(prompt).toContain(sampleContent);
    });

    test('should include scoring rubric sections', () => {
      const prompt = generateLLMScoringPrompt(sampleContent);
      expect(prompt).toContain('SCORING RUBRIC');
      expect(prompt).toContain('/100');
    });

    test('should include calibration guidance', () => {
      const prompt = generateLLMScoringPrompt(sampleContent);
      expect(prompt).toContain('CALIBRATION');
    });
  });

  describe('generateCritiquePrompt', () => {
    const mockResult = {
      score: 65,
      grade: 'C',
      wordCount: 400,
      warnings: ['Missing team context', 'Too vague responsibilities']
    };

    test('should generate a prompt containing the content', () => {
      const prompt = generateCritiquePrompt(sampleContent, mockResult);
      expect(prompt).toContain(sampleContent);
    });

    test('should include current validation results', () => {
      const prompt = generateCritiquePrompt(sampleContent, mockResult);
      expect(prompt).toContain('65');
      expect(prompt).toContain('C');
    });

    test('should handle missing result fields gracefully', () => {
      const minimalResult = { score: 50, grade: 'D', wordCount: 300 };
      const prompt = generateCritiquePrompt(sampleContent, minimalResult);
      expect(prompt).toContain('50');
    });

    test('should accept postingType parameter', () => {
      const prompt = generateCritiquePrompt(sampleContent, mockResult, 'internal');
      expect(prompt).toBeDefined();
    });
  });

  describe('generateRewritePrompt', () => {
    const mockResult = { score: 45, grade: 'D', wordCount: 300 };

    test('should generate a prompt containing the content', () => {
      const prompt = generateRewritePrompt(sampleContent, mockResult);
      expect(prompt).toContain(sampleContent);
    });

    test('should include current score', () => {
      const prompt = generateRewritePrompt(sampleContent, mockResult);
      expect(prompt).toContain('45');
    });

    test('should accept postingType parameter', () => {
      const prompt = generateRewritePrompt(sampleContent, mockResult, 'internal');
      expect(prompt).toBeDefined();
    });
  });

  describe('cleanAIResponse', () => {
    test('should remove common prefixes', () => {
      const response = "Here's the evaluation:\nSome content";
      expect(cleanAIResponse(response)).toBe('Some content');
    });

    test('should extract content from markdown code blocks', () => {
      const response = '```markdown\nExtracted content\n```';
      expect(cleanAIResponse(response)).toBe('Extracted content');
    });

    test('should handle code blocks without language specifier', () => {
      const response = '```\nExtracted content\n```';
      expect(cleanAIResponse(response)).toBe('Extracted content');
    });

    test('should trim whitespace', () => {
      const response = '  Some content with spaces  ';
      expect(cleanAIResponse(response)).toBe('Some content with spaces');
    });

    test('should handle responses without prefixes or code blocks', () => {
      const response = 'Plain response text';
      expect(cleanAIResponse(response)).toBe('Plain response text');
    });
  });
});

