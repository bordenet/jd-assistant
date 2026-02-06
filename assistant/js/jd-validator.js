/**
 * JD Validator - Minimal validation for Phase 4 completion
 *
 * This is a lightweight version of the validator for use in the assistant.
 * For full validation, use the standalone validator app.
 */

import { getSlopPenalty, calculateSlopScore } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

// Masculine-coded words that discourage women from applying
const MASCULINE_CODED = [
  'aggressive', 'ambitious', 'assertive', 'competitive', 'confident',
  'decisive', 'determined', 'dominant', 'driven', 'fearless',
  'independent', 'ninja', 'rockstar', 'guru', 'self-reliant',
  'self-sufficient', 'superior'
];

// Extrovert-bias phrases that discourage introverts and neurodivergent candidates
const EXTROVERT_BIAS = [
  'outgoing', 'high-energy', 'energetic', 'people person', 'gregarious',
  'strong communicator', 'excellent verbal', 'team player'
];

// Red flag phrases that signal toxic culture or poor work-life balance
const RED_FLAGS = [
  'fast-paced', 'like a family', 'wear many hats', 'always-on',
  'hustle', 'grind', 'unlimited pto', 'work hard play hard',
  'hit the ground running', 'self-starter', 'thick skin',
  'no ego', 'drama-free', 'whatever it takes', 'passion required'
];

/**
 * Extract company-mandated sections from text (skip these during validation)
 */
function extractMandatedSections(text) {
  const mandatedSections = [];
  let cleanText = text;
  const preambleRegex = /\[COMPANY_PREAMBLE\]([\s\S]*?)\[\/COMPANY_PREAMBLE\]/gi;
  const legalRegex = /\[COMPANY_LEGAL_TEXT\]([\s\S]*?)\[\/COMPANY_LEGAL_TEXT\]/gi;
  let match;
  while ((match = preambleRegex.exec(text)) !== null) {
    mandatedSections.push({ type: 'preamble', content: match[1] });
  }
  while ((match = legalRegex.exec(text)) !== null) {
    mandatedSections.push({ type: 'legal', content: match[1] });
  }
  cleanText = text.replace(preambleRegex, '').replace(legalRegex, '');
  return { cleanText, mandatedSections };
}

function isInMandatedSection(word, mandatedSections) {
  const lowerWord = word.toLowerCase();
  return mandatedSections.some(section => section.content.toLowerCase().includes(lowerWord));
}

/**
 * Validate JD content for inclusive language issues
 */
function validateJDContent(text) {
  const warnings = [];
  const { cleanText, mandatedSections } = extractMandatedSections(text);

  MASCULINE_CODED.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(cleanText) && !isInMandatedSection(word, mandatedSections)) {
      warnings.push({ type: 'masculine-coded', word });
    }
  });

  EXTROVERT_BIAS.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    if (regex.test(cleanText) && !isInMandatedSection(phrase, mandatedSections)) {
      warnings.push({ type: 'extrovert-bias', phrase });
    }
  });

  RED_FLAGS.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    if (regex.test(cleanText) && !isInMandatedSection(phrase, mandatedSections)) {
      warnings.push({ type: 'red-flag', phrase });
    }
  });

  return { warnings, valid: warnings.length === 0 };
}

/**
 * Validate a job description and return a score
 * @param {string} text - The JD text to validate
 * @returns {Object} Validation result with score, grade, and feedback
 */
/**
 * Validate a job description and return a score
 * @param {string} text - The job description text to validate
 * @param {string} [postingType='external'] - Whether this is an 'internal' or 'external' posting
 * @returns {Object} Validation result with score, grade, issues, and warnings
 */
export function validateJD(text, postingType = 'external') {
  let score = 100;
  const issues = [];
  const isInternal = postingType === 'internal';

  const jdValidation = validateJDContent(text);

  // Word count
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 400) {
    score -= Math.min(15, Math.floor((400 - wordCount) / 20));
    issues.push(`Short (${wordCount} words)`);
  } else if (wordCount > 700) {
    score -= Math.min(10, Math.floor((wordCount - 700) / 50));
    issues.push(`Long (${wordCount} words)`);
  }

  // Masculine-coded words
  const masculineCount = jdValidation.warnings.filter(w => w.type === 'masculine-coded').length;
  if (masculineCount > 0) {
    score -= Math.min(25, masculineCount * 5);
    issues.push(`${masculineCount} masculine-coded word(s)`);
  }

  // Extrovert-bias
  const extrovertCount = jdValidation.warnings.filter(w => w.type === 'extrovert-bias').length;
  if (extrovertCount > 0) {
    score -= Math.min(20, extrovertCount * 5);
    issues.push(`${extrovertCount} extrovert-bias phrase(s)`);
  }

  // Red flags
  const redFlagCount = jdValidation.warnings.filter(w => w.type === 'red-flag').length;
  if (redFlagCount > 0) {
    score -= Math.min(25, redFlagCount * 5);
    issues.push(`${redFlagCount} red flag phrase(s)`);
  }

  // Compensation - skip for internal postings
  if (!isInternal) {
    const hasCompensation = /\$[\d,]+\s*[-–—]\s*\$[\d,]+/i.test(text) ||
                            /salary.*\$[\d,]+/i.test(text) ||
                            /\$[\d,]+k?\s*[-–—]\s*\$[\d,]+k?/i.test(text);
    if (!hasCompensation) {
      score -= 10;
      issues.push('No compensation range');
    }
  }

  // Encouragement statement
  const hasEncouragement = /60.*70.*%|meet.*most|don't.*meet.*all|encouraged.*apply/i.test(text);
  if (!hasEncouragement) {
    score -= 5;
    issues.push('Missing encouragement statement');
  }

  // AI slop detection
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
    score -= slopDeduction;
  }

  score = Math.max(0, score);

  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  const colorClass = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';

  // Add category breakdowns for inline quality score display
  const categories = {
    length: {
      score: wordCount >= 400 && wordCount <= 700 ? 25 : Math.max(0, 25 - Math.min(15, Math.abs(wordCount - 550) / 20)),
      maxScore: 25,
      issues: wordCount < 400 ? [`Short (${wordCount} words)`] : wordCount > 700 ? [`Long (${wordCount} words)`] : []
    },
    inclusivity: {
      score: Math.max(0, 25 - masculineCount * 5 - extrovertCount * 5),
      maxScore: 25,
      issues: [
        ...jdValidation.warnings.filter(w => w.type === 'masculine-coded').map(w => `Masculine-coded: "${w.word}"`),
        ...jdValidation.warnings.filter(w => w.type === 'extrovert-bias').map(w => `Extrovert-bias: "${w.phrase}"`)
      ]
    },
    culture: {
      score: Math.max(0, 25 - redFlagCount * 5),
      maxScore: 25,
      issues: jdValidation.warnings.filter(w => w.type === 'red-flag').map(w => `Red flag: "${w.phrase}"`)
    },
    transparency: {
      score: (isInternal || /\$[\d,]+/.test(text) ? 15 : 0) + (hasEncouragement ? 10 : 0),
      maxScore: 25,
      issues: [
        ...(!isInternal && !/\$[\d,]+/.test(text) ? ['No compensation range'] : []),
        ...(!hasEncouragement ? ['Missing encouragement statement'] : [])
      ]
    }
  };

  return {
    score,
    totalScore: score, // Alias for consistency with other validators
    grade,
    colorClass,
    issues,
    warnings: jdValidation.warnings,
    // Category breakdowns for inline quality score
    length: categories.length,
    inclusivity: categories.inclusivity,
    culture: categories.culture,
    transparency: categories.transparency,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    }
  };
}

/**
 * Get color class based on score
 * @param {number} score - Score 0-100
 * @returns {string} Color name for Tailwind classes
 */
export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

/**
 * Get label based on score
 * @param {number} score - Score 0-100
 * @returns {string} Human-readable label
 */
export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}

