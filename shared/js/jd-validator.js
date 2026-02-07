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
export function validateDocument(text, postingType = 'external') {
  let score = 100;
  const issues = [];
  const isInternal = postingType === 'internal';

  const jdValidation = validateJDContent(text);

  // Word count
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  let lengthDeduction = 0;
  if (wordCount < 400) {
    lengthDeduction = Math.min(15, Math.floor((400 - wordCount) / 20));
    score -= lengthDeduction;
    if (lengthDeduction > 0) {
      issues.push(`Short (${wordCount} words)`);
    }
  } else if (wordCount > 700) {
    lengthDeduction = Math.min(10, Math.floor((wordCount - 700) / 50));
    score -= lengthDeduction;
    if (lengthDeduction > 0) {
      issues.push(`Long (${wordCount} words)`);
    }
  }

  // Masculine-coded words (-5 pts each, max -25)
  const masculineCount = jdValidation.warnings.filter(w => w.type === 'masculine-coded').length;
  const masculineDeduction = Math.min(25, masculineCount * 5);
  if (masculineCount > 0) {
    score -= masculineDeduction;
    issues.push(`${masculineCount} masculine-coded word(s)`);
  }

  // Extrovert-bias (-5 pts each, max -20)
  const extrovertCount = jdValidation.warnings.filter(w => w.type === 'extrovert-bias').length;
  const extrovertDeduction = Math.min(20, extrovertCount * 5);
  if (extrovertCount > 0) {
    score -= extrovertDeduction;
    issues.push(`${extrovertCount} extrovert-bias phrase(s)`);
  }

  // Red flags (-5 pts each, max -25)
  const redFlagCount = jdValidation.warnings.filter(w => w.type === 'red-flag').length;
  const redFlagDeduction = Math.min(25, redFlagCount * 5);
  if (redFlagCount > 0) {
    score -= redFlagDeduction;
    issues.push(`${redFlagCount} red flag phrase(s)`);
  }

  // Compensation - skip for internal postings (-10 pts if missing)
  let compensationDeduction = 0;
  if (!isInternal) {
    const hasCompensation = /\$[\d,]+\s*[-–—]\s*\$[\d,]+/i.test(text) ||
                            /salary.*\$[\d,]+/i.test(text) ||
                            /\$[\d,]+k?\s*[-–—]\s*\$[\d,]+k?/i.test(text);
    if (!hasCompensation) {
      compensationDeduction = 10;
      score -= compensationDeduction;
      issues.push('No compensation range');
    }
  }

  // Encouragement statement (-5 pts if missing)
  const hasEncouragement = /60.*70.*%|meet.*most|don't.*meet.*all|encouraged.*apply/i.test(text);
  let encouragementDeduction = 0;
  if (!hasEncouragement) {
    encouragementDeduction = 5;
    score -= encouragementDeduction;
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

  // Category breakdowns for UI display
  // IMPORTANT: Categories must sum to totalScore for UX clarity
  // Calculate raw category scores first, then adjust to ensure sum matches total
  const rawLength = 25 - lengthDeduction;
  const rawInclusivity = Math.max(0, 25 - masculineDeduction - extrovertDeduction);
  const rawCulture = Math.max(0, 25 - redFlagDeduction - slopDeduction);
  const rawTransparency = 25 - compensationDeduction - encouragementDeduction;

  // Calculate the difference between raw sum and actual total
  const rawSum = rawLength + rawInclusivity + rawCulture + rawTransparency;
  const adjustment = rawSum - score;

  // Apply adjustment to the last category (transparency) to ensure sum matches
  // This handles cases where deductions exceed category caps
  const adjustedTransparency = Math.max(0, rawTransparency - adjustment);

  const categories = {
    length: {
      score: rawLength,
      maxScore: 25,
      issues: lengthDeduction > 0 ? (wordCount < 400 ? [`Short (${wordCount} words)`] : [`Long (${wordCount} words)`]) : []
    },
    inclusivity: {
      score: rawInclusivity,
      maxScore: 25,
      issues: [
        ...jdValidation.warnings.filter(w => w.type === 'masculine-coded').map(w => `Masculine-coded: "${w.word}"`),
        ...jdValidation.warnings.filter(w => w.type === 'extrovert-bias').map(w => `Extrovert-bias: "${w.phrase}"`)
      ]
    },
    culture: {
      score: rawCulture,
      maxScore: 25,
      issues: [
        ...jdValidation.warnings.filter(w => w.type === 'red-flag').map(w => `Red flag: "${w.phrase}"`),
        ...(slopDeduction > 0 ? [`AI patterns detected (-${slopDeduction})`] : [])
      ]
    },
    transparency: {
      score: adjustedTransparency,
      maxScore: 25,
      issues: [
        ...(compensationDeduction > 0 ? ['No compensation range'] : []),
        ...(encouragementDeduction > 0 ? ['Missing encouragement statement'] : [])
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

