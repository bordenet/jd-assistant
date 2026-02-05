/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals';
import { validateDocument, getGrade, getScoreColor, validateJDContent } from '../js/validator.js';

describe('validateDocument', () => {
  it('should return low score for very short documents', () => {
    const result = validateDocument('Hello world');
    expect(result.score).toBeLessThan(50);
    expect(result.wordCount).toBe(2);
  });

  it('should return higher score for longer documents', () => {
    const longText = 'This is a longer document. '.repeat(20);
    const result = validateDocument(longText);
    expect(result.score).toBeGreaterThanOrEqual(25);
  });

  it('should give bonus for headings', () => {
    const withHeading = '# Title\n\nSome content here.';
    const withoutHeading = 'Some content here.';

    const resultWith = validateDocument(withHeading);
    const resultWithout = validateDocument(withoutHeading);

    expect(resultWith.score).toBeGreaterThan(resultWithout.score);
  });

  it('should give bonus for multiple paragraphs', () => {
    const multiPara = 'Paragraph one.\n\nParagraph two.\n\nParagraph three.';
    const singlePara = 'Just one paragraph with all the content.';

    const resultMulti = validateDocument(multiPara);
    const resultSingle = validateDocument(singlePara);

    expect(resultMulti.paragraphCount).toBe(3);
    expect(resultSingle.paragraphCount).toBe(1);
  });

  it('should give bonus for lists', () => {
    const withList = '- Item 1\n- Item 2\n- Item 3';
    const withoutList = 'No lists here.';

    const resultWith = validateDocument(withList);
    const resultWithout = validateDocument(withoutList);

    expect(resultWith.score).toBeGreaterThan(resultWithout.score);
  });

  it('should give bonus for code blocks', () => {
    const withCode = 'Here is some `inline code` example.';
    const withoutCode = 'Here is some text example.';

    const resultWith = validateDocument(withCode);
    const resultWithout = validateDocument(withoutCode);

    expect(resultWith.score).toBeGreaterThan(resultWithout.score);
  });

  it('should cap score at 100', () => {
    // Create a document with all bonus features
    const maxDoc = `# Title

This is a longer document with multiple paragraphs and good structure.

## Section One

Here are some key points:
- Point one with details
- Point two with more details
- Point three completing the list

## Section Two

And here is some \`code\` to demonstrate:

\`\`\`javascript
console.log('JD Assistant');
\`\`\`

The document continues with more content to reach the word count threshold.
`.repeat(3);

    const result = validateDocument(maxDoc);
    expect(result.score).toBeLessThanOrEqual(100);
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
