/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals';
import { validateDocument, getGrade, getScoreColor, validateJDContent } from '../js/validator.js';

describe('validateDocument', () => {
  // Helper to create a well-formed JD
  const createGoodJD = (overrides = {}) => {
    const base = `# Senior Software Engineer

## About the Role
Join our collaborative team to build scalable systems.

## Key Responsibilities
- Own the authentication service and ship 2 features per quarter
- Mentor junior engineers through code reviews
- Collaborate with product teams on technical decisions

## Required Qualifications
- 3+ years experience with Python or Go
- Experience with distributed systems
- Proficiency in SQL databases

## Preferred Qualifications
- Experience with Kubernetes
- Open source contributions

## What We Offer
- Compensation: $170,000 - $220,000 base salary
- Benefits: Health, dental, 401k match
- Remote-first culture

## To Apply
Submit your resume. If you meet 60-70% of these qualifications, we encourage you to apply.
`;
    return overrides.text || base;
  };

  it('should return high score for well-formed JD', () => {
    const result = validateDocument(createGoodJD());
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.grade).toMatch(/[AB]/);
  });

  it('should penalize very short documents', () => {
    const result = validateDocument('Hello world');
    expect(result.score).toBeLessThan(80);
    expect(result.wordCount).toBe(2);
  });

  it('should penalize documents that are too long', () => {
    const longText = createGoodJD() + '\n\n' + 'Additional content here with more words. '.repeat(150);
    const result = validateDocument(longText);
    expect(result.wordCount).toBeGreaterThan(700);
    // Should still have a reasonable score but with length penalty
    expect(result.feedback.some(f => f.includes('Long'))).toBe(true);
  });

  it('should penalize masculine-coded words', () => {
    const badJD = createGoodJD().replace('collaborative', 'aggressive rockstar ninja');
    const result = validateDocument(badJD);
    expect(result.warningCount).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.type === 'masculine-coded')).toBe(true);
  });

  it('should penalize missing compensation range', () => {
    const noComp = createGoodJD().replace('$170,000 - $220,000', 'Competitive salary');
    const result = validateDocument(noComp);
    expect(result.feedback.some(f => f.includes('compensation'))).toBe(true);
  });

  it('should reward encouragement statement', () => {
    const withEncouragement = createGoodJD();
    const withoutEncouragement = createGoodJD().replace(
      'If you meet 60-70% of these qualifications, we encourage you to apply.',
      'Apply now.'
    );
    const resultWith = validateDocument(withEncouragement);
    const resultWithout = validateDocument(withoutEncouragement);
    expect(resultWith.score).toBeGreaterThan(resultWithout.score);
  });

  it('should cap score at 100', () => {
    const result = validateDocument(createGoodJD());
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('should floor score at 0', () => {
    // Create a terrible JD with all problems
    const terribleJD = 'aggressive ninja rockstar fast-paced hustle grind';
    const result = validateDocument(terribleJD);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('should return warnings array from JD content validation', () => {
    const badJD = 'Looking for an aggressive rockstar in a fast-paced environment';
    const result = validateDocument(badJD);
    expect(result.warnings).toBeDefined();
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(result.warningCount).toBe(result.warnings.length);
  });
});

describe('getGrade', () => {
  it('should return A for scores >= 90', () => {
    expect(getGrade(90)).toBe('A');
    expect(getGrade(95)).toBe('A');
    expect(getGrade(100)).toBe('A');
  });

  it('should return B for scores 80-89', () => {
    expect(getGrade(80)).toBe('B');
    expect(getGrade(85)).toBe('B');
    expect(getGrade(89)).toBe('B');
  });

  it('should return C for scores 70-79', () => {
    expect(getGrade(70)).toBe('C');
    expect(getGrade(75)).toBe('C');
  });

  it('should return D for scores 60-69', () => {
    expect(getGrade(60)).toBe('D');
    expect(getGrade(65)).toBe('D');
  });

  it('should return F for scores < 60', () => {
    expect(getGrade(59)).toBe('F');
    expect(getGrade(30)).toBe('F');
    expect(getGrade(0)).toBe('F');
  });
});

describe('getScoreColor', () => {
  it('should return green for high scores', () => {
    expect(getScoreColor(80)).toBe('text-green-400');
    expect(getScoreColor(100)).toBe('text-green-400');
  });

  it('should return yellow for medium scores', () => {
    expect(getScoreColor(60)).toBe('text-yellow-400');
    expect(getScoreColor(79)).toBe('text-yellow-400');
  });

  it('should return orange for low-medium scores', () => {
    expect(getScoreColor(40)).toBe('text-orange-400');
    expect(getScoreColor(59)).toBe('text-orange-400');
  });

  it('should return red for low scores', () => {
    expect(getScoreColor(0)).toBe('text-red-400');
    expect(getScoreColor(39)).toBe('text-red-400');
  });
});

describe('JD Validator - Inclusive Language', () => {
  it('flags masculine-coded words', () => {
    const result = validateJDContent('Looking for an aggressive rockstar ninja');
    expect(result.warnings.some(w => w.type === 'masculine-coded')).toBe(true);
    expect(result.valid).toBe(false);
  });

  it('flags multiple masculine-coded words', () => {
    const result = validateJDContent('We need a dominant, driven, fearless leader');
    const masculineWarnings = result.warnings.filter(w => w.type === 'masculine-coded');
    expect(masculineWarnings.length).toBeGreaterThan(0);
  });

  it('flags extrovert-only signals', () => {
    const result = validateJDContent('Must be outgoing and high-energy');
    expect(result.warnings.some(w => w.type === 'extrovert-bias')).toBe(true);
    expect(result.valid).toBe(false);
  });

  it('flags red flag phrases', () => {
    const result = validateJDContent('Fast-paced environment, we are like a family');
    expect(result.warnings.some(w => w.type === 'red-flag')).toBe(true);
    expect(result.valid).toBe(false);
  });

  it('flags multiple red flag phrases', () => {
    const result = validateJDContent('Hustle culture, wear many hats, always-on mentality');
    const redFlagWarnings = result.warnings.filter(w => w.type === 'red-flag');
    expect(redFlagWarnings.length).toBeGreaterThan(0);
  });

  it('does NOT flag company-mandated preamble sections', () => {
    const jd = `
      [COMPANY_PREAMBLE]
      We are an aggressive equal opportunity employer...
      [/COMPANY_PREAMBLE]
      Regular content here.
    `;
    const result = validateJDContent(jd);
    // Should not flag "aggressive" since it's in company preamble
    expect(result.warnings.filter(w => w.word === 'aggressive' || w.phrase === 'aggressive')).toHaveLength(0);
  });

  it('does NOT flag company-mandated legal text sections', () => {
    const jd = `
      [COMPANY_LEGAL_TEXT]
      This is a fast-paced company with aggressive growth targets.
      [/COMPANY_LEGAL_TEXT]
      We are looking for collaborative engineers.
    `;
    const result = validateJDContent(jd);
    // Should not flag "fast-paced" or "aggressive" since they're in legal text
    const flaggedInLegal = result.warnings.filter(w =>
      (w.word === 'fast-paced' || w.phrase === 'fast-paced' ||
       w.word === 'aggressive' || w.phrase === 'aggressive')
    );
    expect(flaggedInLegal).toHaveLength(0);
  });

  it('returns valid=true when no issues found', () => {
    const result = validateJDContent('We are looking for a collaborative engineer');
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBe(0);
  });

  it('is case-insensitive', () => {
    const result1 = validateJDContent('Looking for an AGGRESSIVE developer');
    const result2 = validateJDContent('Looking for an aggressive developer');
    expect(result1.warnings.length).toBe(result2.warnings.length);
  });

  it('returns warnings with type, word/phrase, and suggestion', () => {
    const result = validateJDContent('We need a rockstar ninja');
    expect(result.warnings.length).toBeGreaterThan(0);
    const warning = result.warnings[0];
    expect(warning).toHaveProperty('type');
    expect(warning).toHaveProperty('word');
    expect(warning).toHaveProperty('suggestion');
  });

  it('avoids false positives with word boundaries', () => {
    const result = validateJDContent('We are a team of steamship engineers');
    // Should not flag "team" in "steamship"
    const teamWarnings = result.warnings.filter(w => w.word === 'team' || w.phrase === 'team');
    expect(teamWarnings).toHaveLength(0);
  });
});
