/**
 * JD Validator - Validation Logic
 *
 * Validates job descriptions for inclusive language, structure, and best practices.
 * Based on research from docs/About.md.
 */

import { calculateSlopScore, getSlopPenalty } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

// ============================================================================
// CONFIGURATION: Language Pattern Dictionaries
// These arrays define the patterns used by detection and scoring functions.
// ============================================================================

/**
 * Masculine-coded words that discourage women from applying
 * Based on Gaucher et al. (2011) JPSP and Textio research
 */
const MASCULINE_CODED = [
  'aggressive', 'ambitious', 'assertive', 'competitive', 'confident',
  'decisive', 'determined', 'dominant', 'driven', 'fearless',
  'independent', 'ninja', 'rockstar', 'guru', 'self-reliant',
  'self-sufficient', 'superior',
  // Added from phase1.md alignment review (8 missing words)
  'leader', 'go-getter', 'hard-charging', 'strong', 'tough',
  'warrior', 'superhero', 'superstar', 'boss'
];

/**
 * Extrovert-bias phrases that discourage introverts and neurodivergent candidates
 * Based on Deloitte neurodiversity research
 */
const EXTROVERT_BIAS = [
  'outgoing', 'high-energy', 'energetic', 'people person', 'gregarious',
  'strong communicator', 'excellent verbal', 'team player'
];

/**
 * Red flag phrases that signal toxic culture or poor work-life balance
 * Based on Glassdoor, Blind, and LinkedIn data
 */
const RED_FLAGS = [
  'fast-paced', 'like a family', 'wear many hats', 'always-on',
  'hustle', 'grind', 'unlimited pto', 'work hard play hard',
  'hit the ground running', 'self-starter', 'thick skin',
  'no ego', 'drama-free', 'whatever it takes', 'passion required'
];

/**
 * Suggestions for replacing problematic language
 */
const SUGGESTIONS = {
  // Masculine-coded
  'aggressive': 'Use "proactive" or "bold" instead',
  'ambitious': 'Use "motivated" or "goal-oriented" instead',
  'assertive': 'Use "confident communicator" instead',
  'competitive': 'Use "collaborative" or "results-oriented" instead',
  'confident': 'Use "capable" or "skilled" instead',
  'decisive': 'Use "sound decision-maker" instead',
  'determined': 'Use "dedicated" or "committed" instead',
  'dominant': 'Use "influential" or "guiding" instead',
  'driven': 'Use "motivated" or "dedicated" instead',
  'fearless': 'Use "resilient" or "innovative" instead',
  'independent': 'Use "self-directed" or "ownership-focused" instead',
  'ninja': 'Use "expert" or "specialist" instead',
  'rockstar': 'Use "expert" or "impact player" instead',
  'guru': 'Use "expert" or "specialist" instead',
  'self-reliant': 'Use "capable" or "resourceful" instead',
  'self-sufficient': 'Use "capable" or "resourceful" instead',
  'superior': 'Use "excellent" or "skilled" instead',
  // Added from phase1.md alignment review (8 missing words)
  'leader': 'Use "guide" or "mentor" instead',
  'go-getter': 'Use "motivated" or "proactive" instead',
  'hard-charging': 'Use "dedicated" or "committed" instead',
  'strong': 'Use "skilled" or "experienced" instead',
  'tough': 'Use "resilient" or "adaptable" instead',
  'warrior': 'Use "advocate" or "champion" instead',
  'superhero': 'Use "expert" or "specialist" instead',
  'superstar': 'Use "high performer" or "expert" instead',
  'boss': 'Use "manager" or "lead" instead',

  // Extrovert-bias
  'outgoing': 'Use "collaborative" or remove if not essential',
  'high-energy': 'Use "dynamic" or "engaged" instead',
  'energetic': 'Use "engaged" or "motivated" instead',
  'people person': 'Use "collaborative" or "team-oriented" instead',
  'gregarious': 'Use "collaborative" instead',
  'strong communicator': 'Use "shares ideas clearly via writing, visuals, or discussion"',
  'excellent verbal': 'Use "communicates effectively" instead',
  'team player': 'Use "contributes to team goals through your strengths"',

  // Red flags
  'fast-paced': 'Use "dynamic projects with clear priorities" instead',
  'like a family': 'Use "supportive, collaborative team" instead',
  'wear many hats': 'Use "versatile role with growth opportunities" instead',
  'always-on': 'Use "flexible hours; async work" instead',
  'hustle': 'Use "dedicated effort" or "commitment" instead',
  'grind': 'Use "dedicated effort" or "commitment" instead',
  'unlimited pto': 'Use "20+ PTO days + recharge policy" instead',
  'work hard play hard': 'Use "balanced work culture" instead',
  'hit the ground running': 'Use "ramp up quickly with support" instead',
  'self-starter': 'Use "self-directed" or "ownership-focused" instead',
  'thick skin': 'Use "resilient" or "adaptable" instead',
  'no ego': 'Use "collaborative" or "humble" instead',
  'drama-free': 'Use "professional" or "respectful" instead',
  'whatever it takes': 'Use "committed to delivering results" instead',
  'passion required': 'Use "deeply engaged in problem-solving" instead'
};

// ============================================================================
// HELPER FUNCTIONS: Mandated Section Handling
// ============================================================================

/**
 * Extract company-mandated sections from text
 * @param {string} text - The text to process
 * @returns {Object} Object with cleanText and mandatedSections
 */
function extractMandatedSections(text) {
  const mandatedSections = [];

  // Extract COMPANY_PREAMBLE sections
  const preambleRegex = /\[COMPANY_PREAMBLE\]([\s\S]*?)\[\/COMPANY_PREAMBLE\]/gi;
  let match;
  while ((match = preambleRegex.exec(text)) !== null) {
    mandatedSections.push({
      type: 'preamble',
      content: match[1]
    });
  }

  // Extract COMPANY_LEGAL_TEXT sections
  const legalRegex = /\[COMPANY_LEGAL_TEXT\]([\s\S]*?)\[\/COMPANY_LEGAL_TEXT\]/gi;
  while ((match = legalRegex.exec(text)) !== null) {
    mandatedSections.push({
      type: 'legal',
      content: match[1]
    });
  }

  // Remove mandated sections from text for validation
  const cleanText = text.replace(preambleRegex, '').replace(legalRegex, '');

  return { cleanText, mandatedSections };
}

/**
 * Check if a word/phrase appears in mandated sections
 * @param {string} word - The word or phrase to check
 * @param {Array} mandatedSections - Array of mandated section objects
 * @returns {boolean} True if word appears in mandated sections
 */
function isInMandatedSection(word, mandatedSections) {
  const lowerWord = word.toLowerCase();
  return mandatedSections.some(section =>
    section.content.toLowerCase().includes(lowerWord)
  );
}

// ============================================================================
// Individual Detection Functions (exported for testing)
// Each returns structured detection results: { found, count, ... }
// Following the genesis pattern: detect*() → score*() → validate*()
// ============================================================================

/**
 * Detect masculine-coded words in text
 * @param {string} text - The text to analyze
 * @returns {Object} { found, count, words }
 */
export function detectMasculineCoded(text) {
  const { cleanText, mandatedSections } = extractMandatedSections(text);
  const foundWords = [];

  MASCULINE_CODED.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(cleanText)) {
      if (!isInMandatedSection(word, mandatedSections)) {
        foundWords.push(word.toLowerCase());
      }
    }
  });

  return {
    found: foundWords.length > 0,
    count: foundWords.length,
    words: foundWords
  };
}

/**
 * Detect extrovert-bias phrases in text
 * @param {string} text - The text to analyze
 * @returns {Object} { found, count, phrases }
 */
export function detectExtrovertBias(text) {
  const { cleanText, mandatedSections } = extractMandatedSections(text);
  const foundPhrases = [];

  EXTROVERT_BIAS.forEach(phrase => {
    const flexiblePattern = phrase.replace(/[-\s]+/g, '[-\\s]+');
    const regex = new RegExp(`\\b${flexiblePattern}\\b`, 'gi');
    if (regex.test(cleanText)) {
      if (!isInMandatedSection(phrase, mandatedSections)) {
        foundPhrases.push(phrase.toLowerCase());
      }
    }
  });

  return {
    found: foundPhrases.length > 0,
    count: foundPhrases.length,
    phrases: foundPhrases
  };
}

/**
 * Detect red flag phrases in text
 * @param {string} text - The text to analyze
 * @returns {Object} { found, count, phrases }
 */
export function detectRedFlags(text) {
  const { cleanText, mandatedSections } = extractMandatedSections(text);
  const foundPhrases = [];

  RED_FLAGS.forEach(phrase => {
    const flexiblePattern = phrase.replace(/[-\s]+/g, '[-\\s]+');
    const regex = new RegExp(`\\b${flexiblePattern}\\b`, 'gi');
    if (regex.test(cleanText)) {
      if (!isInMandatedSection(phrase, mandatedSections)) {
        foundPhrases.push(phrase.toLowerCase());
      }
    }
  });

  return {
    found: foundPhrases.length > 0,
    count: foundPhrases.length,
    phrases: foundPhrases
  };
}

/**
 * Detect compensation information in text
 * @param {string} text - The text to analyze
 * @returns {Object} { found, hasSalaryRange, hasHourlyRange, hasBonusMention }
 */
export function detectCompensation(text) {
  const hasSalaryRange = /\$[\d,]+\s*[-–—]\s*\$[\d,]+/i.test(text) ||
                         /salary.*\$[\d,]+/i.test(text) ||
                         /compensation.*\$[\d,]+/i.test(text) ||
                         /(USD|EUR|GBP|CAD|AUD)\s*[\d,]+\s*[-–—]\s*[\d,]+/i.test(text) ||
                         /[\d,]+\s*(USD|EUR|GBP|CAD|AUD)\s*[-–—]/i.test(text);

  const hasHourlyRange = /\$[\d.]+\s*[-–—]\s*\$[\d.]+\s*\/?\s*(hour|hr)/i.test(text) ||
                         /\$[\d.]+\s*\/?\s*(hour|hr)/i.test(text);

  const hasBonusMention = /bonus|equity|stock|RSU|options/i.test(text);

  return {
    found: hasSalaryRange || hasHourlyRange,
    hasSalaryRange,
    hasHourlyRange,
    hasBonusMention
  };
}

/**
 * Detect encouragement statement in text
 * @param {string} text - The text to analyze
 * @returns {Object} { found, indicators }
 */
export function detectEncouragement(text) {
  const has60to70 = /60[-–]70%|60\s*[-–]\s*70\s*%|60\s+to\s+70\s*%/i.test(text);
  const hasMeetMost = /meet.*most.*(requirements|qualifications)/i.test(text);
  const hasEncourageApply = /we\s+encourage.*apply/i.test(text);
  const hasDontMeetAll = /don't.*meet.*all.*(qualifications|requirements)/i.test(text);

  const found = has60to70 || hasMeetMost || hasEncourageApply || hasDontMeetAll;

  return {
    found,
    indicators: [
      has60to70 && '60-70% threshold mentioned',
      hasMeetMost && 'Meet most requirements language',
      hasEncourageApply && 'Encourage to apply language',
      hasDontMeetAll && 'Don\'t meet all qualifications language'
    ].filter(Boolean)
  };
}

/**
 * Detect word count characteristics
 * @param {string} text - The text to analyze
 * @returns {Object} { wordCount, isIdeal, isTooShort, isTooLong }
 */
export function detectWordCount(text) {
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const isIdeal = wordCount >= 400 && wordCount <= 700;
  const isTooShort = wordCount < 400;
  const isTooLong = wordCount > 700;

  return {
    wordCount,
    isIdeal,
    isTooShort,
    isTooLong
  };
}

// ============================================================================
// Individual Scoring Functions (exported for testing)
// Each returns { penalty, maxPenalty, feedback, deduction? }
// ============================================================================

/**
 * Score word count - ideal range is 400-700 words
 * @param {string} text - The JD text to validate
 * @returns {Object} { penalty, maxPenalty, wordCount, feedback, deduction }
 */
export function scoreWordCount(text) {
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount >= 400 && wordCount <= 700) {
    return {
      penalty: 0,
      maxPenalty: 15,
      wordCount,
      feedback: `✅ Good length: ${wordCount} words (ideal: 400-700)`,
      deduction: null
    };
  } else if (wordCount < 400) {
    const penalty = Math.min(15, Math.floor((400 - wordCount) / 20));
    return {
      penalty,
      maxPenalty: 15,
      wordCount,
      feedback: `⚠️ Short: ${wordCount} words (aim for 400-700)`,
      deduction: `-${penalty} pts: Too short (${wordCount} words, aim for 400+)`
    };
  } else {
    const penalty = Math.min(10, Math.floor((wordCount - 700) / 50));
    return {
      penalty,
      maxPenalty: 10,
      wordCount,
      feedback: `⚠️ Long: ${wordCount} words (aim for ≤700)`,
      deduction: `-${penalty} pts: Too long (${wordCount} words, aim for ≤700)`
    };
  }
}

/**
 * Score masculine-coded words - penalize gender-exclusive language
 * @param {Array} warnings - Array of warning objects from validateJDContent
 * @returns {Object} { penalty, maxPenalty, count, feedback, deduction }
 */
export function scoreMasculineCoded(warnings) {
  const count = warnings.filter(w => w.type === 'masculine-coded').length;

  if (count > 0) {
    const penalty = Math.min(25, count * 5);
    return {
      penalty,
      maxPenalty: 25,
      count,
      feedback: `🚨 ${count} masculine-coded word(s) found`,
      deduction: `-${penalty} pts: ${count} masculine-coded word(s)`
    };
  }

  return {
    penalty: 0,
    maxPenalty: 25,
    count: 0,
    feedback: '✅ No masculine-coded words',
    deduction: null
  };
}

/**
 * Score extrovert-bias phrases - penalize neurodiversity-exclusive language
 * @param {Array} warnings - Array of warning objects from validateJDContent
 * @returns {Object} { penalty, maxPenalty, count, feedback, deduction }
 */
export function scoreExtrovertBias(warnings) {
  const count = warnings.filter(w => w.type === 'extrovert-bias').length;

  if (count > 0) {
    const penalty = Math.min(20, count * 5);
    return {
      penalty,
      maxPenalty: 20,
      count,
      feedback: `🚨 ${count} extrovert-bias phrase(s) found`,
      deduction: `-${penalty} pts: ${count} extrovert-bias phrase(s)`
    };
  }

  return {
    penalty: 0,
    maxPenalty: 20,
    count: 0,
    feedback: '✅ No extrovert-bias phrases',
    deduction: null
  };
}

/**
 * Score red flag phrases - penalize toxic culture signals
 * @param {Array} warnings - Array of warning objects from validateJDContent
 * @returns {Object} { penalty, maxPenalty, count, feedback, deduction }
 */
export function scoreRedFlags(warnings) {
  const count = warnings.filter(w => w.type === 'red-flag').length;

  if (count > 0) {
    const penalty = Math.min(25, count * 5);
    return {
      penalty,
      maxPenalty: 25,
      count,
      feedback: `🚨 ${count} red flag phrase(s) found`,
      deduction: `-${penalty} pts: ${count} red flag phrase(s)`
    };
  }

  return {
    penalty: 0,
    maxPenalty: 25,
    count: 0,
    feedback: '✅ No red flag phrases',
    deduction: null
  };
}

/**
 * Score compensation transparency - require salary range for external postings
 * @param {string} text - The JD text to validate
 * @param {boolean} isInternal - Whether this is an internal posting
 * @returns {Object} { penalty, maxPenalty, hasCompensation, feedback, deduction, skipped }
 */
export function scoreCompensation(text, isInternal) {
  if (isInternal) {
    return {
      penalty: 0,
      maxPenalty: 10,
      hasCompensation: null,
      feedback: 'ℹ️ Internal posting - compensation check skipped',
      deduction: null,
      skipped: true
    };
  }

  // Adversarial fix: Added non-$ currency patterns (USD, EUR, GBP) for international JDs
  const hasCompensation = /\$[\d,]+\s*[-–—]\s*\$[\d,]+/i.test(text) ||
                          /salary.*\$[\d,]+/i.test(text) ||
                          /compensation.*\$[\d,]+/i.test(text) ||
                          /\$[\d,]+k?\s*[-–—]\s*\$[\d,]+k?/i.test(text) ||
                          // Non-$ formats: "150,000 - 200,000 USD" or "€80,000 - €120,000"
                          /[\d,]+\s*[-–—]\s*[\d,]+\s*(USD|EUR|GBP|CAD|AUD)/i.test(text) ||
                          /[€£][\d,]+\s*[-–—]\s*[€£][\d,]+/i.test(text);

  if (hasCompensation) {
    return {
      penalty: 0,
      maxPenalty: 10,
      hasCompensation: true,
      feedback: '✅ Compensation range included',
      deduction: null,
      skipped: false
    };
  }

  return {
    penalty: 10,
    maxPenalty: 10,
    hasCompensation: false,
    feedback: '⚠️ No compensation range found',
    deduction: '-10 pts: No compensation range found',
    skipped: false
  };
}

/**
 * Score encouragement statement - require "60-70%" or similar inclusive language
 * @param {string} text - The JD text to validate
 * @returns {Object} { penalty, maxPenalty, hasEncouragement, feedback, deduction }
 */
export function scoreEncouragement(text) {
  // Adversarial fix: Narrowed "don't meet all" to require "qualifications" or "requirements" context
  // Prevents gaming with unrelated text like "We don't meet all our goals"
  const hasEncouragement = /60[-–]70%|60\s*[-–]\s*70\s*%|60\s+to\s+70\s*%|meet.*most.*(requirements|qualifications)|we\s+encourage.*apply|don't.*meet.*all.*(qualifications|requirements)/i.test(text);

  if (hasEncouragement) {
    return {
      penalty: 0,
      maxPenalty: 5,
      hasEncouragement: true,
      feedback: '✅ Includes encouragement statement',
      deduction: null
    };
  }

  return {
    penalty: 5,
    maxPenalty: 5,
    hasEncouragement: false,
    feedback: '⚠️ Missing encouragement statement (e.g., "If you meet 60-70%...")',
    deduction: '-5 pts: Missing "60-70%" encouragement statement'
  };
}

/**
 * Score AI slop - penalize generic AI-generated language
 * @param {string} text - The JD text to validate
 * @returns {Object} { penalty, maxPenalty, slopPenalty, issues, feedback, deduction }
 */
export function scoreSlopPenalty(text) {
  const slopPenalty = getSlopPenalty(text);
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    const penalty = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues && slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }

    if (penalty > 0) {
      return {
        penalty,
        maxPenalty: 5,
        slopPenalty,
        issues: slopIssues,
        feedback: '⚠️ AI-generated language detected - consider making more authentic',
        deduction: `-${penalty} pts: AI slop detected`
      };
    }
  }

  return {
    penalty: 0,
    maxPenalty: 5,
    slopPenalty,
    issues: slopIssues,
    feedback: null,
    deduction: null
  };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a job description and return a score with feedback
 * @param {string} text - The JD text to validate
 * @param {string} [postingType='external'] - Whether this is an 'internal' or 'external' posting
 * @returns {Object} Validation result with score, grade, and feedback
 */
export function validateDocument(text, postingType = 'external') {
  const feedback = [];
  let score = 100; // Start at 100, deduct for issues
  const deductions = [];

  // Detect internal posting from text if not explicitly specified
  const isInternal = postingType === 'internal' ||
                     /\*\*INTERNAL POSTING\*\*/i.test(text) ||
                     /internal posting/i.test(text);

  // Get JD content validation (inclusive language, red flags)
  const jdValidation = validateJDContent(text);

  // 1. Word count scoring
  const wordCountResult = scoreWordCount(text);
  feedback.push(wordCountResult.feedback);
  if (wordCountResult.penalty > 0) {
    score -= wordCountResult.penalty;
    deductions.push(wordCountResult.deduction);
  }

  // 2. Masculine-coded words scoring
  const masculineResult = scoreMasculineCoded(jdValidation.warnings);
  feedback.push(masculineResult.feedback);
  if (masculineResult.penalty > 0) {
    score -= masculineResult.penalty;
    deductions.push(masculineResult.deduction);
  }

  // 3. Extrovert-bias phrases scoring
  const extrovertResult = scoreExtrovertBias(jdValidation.warnings);
  feedback.push(extrovertResult.feedback);
  if (extrovertResult.penalty > 0) {
    score -= extrovertResult.penalty;
    deductions.push(extrovertResult.deduction);
  }

  // 4. Red flag phrases scoring
  const redFlagResult = scoreRedFlags(jdValidation.warnings);
  feedback.push(redFlagResult.feedback);
  if (redFlagResult.penalty > 0) {
    score -= redFlagResult.penalty;
    deductions.push(redFlagResult.deduction);
  }

  // 5. Compensation transparency scoring
  const compensationResult = scoreCompensation(text, isInternal);
  feedback.push(compensationResult.feedback);
  if (compensationResult.penalty > 0) {
    score -= compensationResult.penalty;
    deductions.push(compensationResult.deduction);
  }

  // 6. Encouragement statement scoring
  const encouragementResult = scoreEncouragement(text);
  feedback.push(encouragementResult.feedback);
  if (encouragementResult.penalty > 0) {
    score -= encouragementResult.penalty;
    deductions.push(encouragementResult.deduction);
  }

  // 7. AI slop scoring
  const slopResult = scoreSlopPenalty(text);
  if (slopResult.feedback) {
    feedback.push(slopResult.feedback);
  }
  if (slopResult.penalty > 0) {
    score -= slopResult.penalty;
    deductions.push(slopResult.deduction);
  }

  // Floor score at 0
  score = Math.max(0, score);

  // Category breakdowns for UI display (used by project-view.js)
  // Each category has a 25-point max, matching the old jd-validator.js API
  const lengthDeduction = wordCountResult.penalty;
  const masculineDeduction = masculineResult.penalty;
  const extrovertDeduction = extrovertResult.penalty;
  const redFlagDeduction = redFlagResult.penalty;
  const slopDeduction = slopResult.penalty;
  const compensationDeduction = compensationResult.penalty;
  const encouragementDeduction = encouragementResult.penalty;

  // Calculate raw category scores
  const rawLength = 25 - Math.min(25, lengthDeduction);
  const rawInclusivity = Math.max(0, 25 - masculineDeduction - extrovertDeduction);
  const rawCulture = Math.max(0, 25 - redFlagDeduction - slopDeduction);
  const rawTransparency = Math.max(0, 25 - compensationDeduction - encouragementDeduction);

  // Build category issues arrays
  const wordCount = wordCountResult.wordCount;
  const lengthIssues = lengthDeduction > 0
    ? (wordCount < 400 ? [`Short (${wordCount} words)`] : [`Long (${wordCount} words)`])
    : [];

  const inclusivityIssues = [
    ...jdValidation.warnings.filter(w => w.type === 'masculine-coded').map(w => `Masculine-coded: "${w.word}"`),
    ...jdValidation.warnings.filter(w => w.type === 'extrovert-bias').map(w => `Extrovert-bias: "${w.phrase}"`)
  ];

  const cultureIssues = [
    ...jdValidation.warnings.filter(w => w.type === 'red-flag').map(w => `Red flag: "${w.phrase}"`),
    ...(slopDeduction > 0 ? [`AI patterns detected (-${slopDeduction})`] : [])
  ];

  const transparencyIssues = [
    ...(compensationDeduction > 0 ? ['No compensation range'] : []),
    ...(encouragementDeduction > 0 ? ['Missing encouragement statement'] : [])
  ];

  return {
    score,
    totalScore: score, // Alias for backward compatibility with project-view.js
    grade: getGrade(score),
    feedback,
    deductions,
    wordCount: wordCountResult.wordCount,
    warnings: jdValidation.warnings,
    warningCount: jdValidation.warnings.length,
    isInternal,
    slopDetection: {
      ...slopResult.slopPenalty,
      deduction: slopResult.penalty,
      issues: slopResult.issues
    },
    // Category breakdowns for inline quality score display
    length: {
      score: rawLength,
      maxScore: 25,
      issues: lengthIssues
    },
    inclusivity: {
      score: rawInclusivity,
      maxScore: 25,
      issues: inclusivityIssues
    },
    culture: {
      score: rawCulture,
      maxScore: 25,
      issues: cultureIssues
    },
    transparency: {
      score: rawTransparency,
      maxScore: 25,
      issues: transparencyIssues
    }
  };
}

/**
 * Get letter grade from numeric score
 * @param {number} score - Numeric score 0-100
 * @returns {string} Letter grade
 */
export function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get Tailwind color class for score
 * @param {number} score - Numeric score 0-100
 * @returns {string} Tailwind color class
 */
export function getScoreColor(score) {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get label based on score for UI display
 */
export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}

/**
 * Validate JD content for inclusive language and red flags
 * @param {string} text - The JD text to validate
 * @param {Object} options - Optional configuration
 * @returns {Object} Validation result with warnings array and valid flag
 */
export function validateJDContent(text) {
  const warnings = [];

  // Extract company-mandated sections
  const { cleanText, mandatedSections } = extractMandatedSections(text);

  // Check for masculine-coded words
  MASCULINE_CODED.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(cleanText)) {
      // Skip if this word appears in mandated sections
      if (!isInMandatedSection(word, mandatedSections)) {
        warnings.push({
          type: 'masculine-coded',
          word,
          suggestion: SUGGESTIONS[word.toLowerCase()] || `Consider replacing "${word}" with more inclusive language`
        });
      }
    }
  });

  // Check for extrovert-bias phrases
  // Adversarial fix: Handle hyphen/space variations (e.g., "high-energy" vs "high energy")
  EXTROVERT_BIAS.forEach(phrase => {
    const flexiblePattern = phrase.replace(/[-\s]+/g, '[-\\s]+');
    const regex = new RegExp(`\\b${flexiblePattern}\\b`, 'gi');
    if (regex.test(cleanText)) {
      // Skip if this phrase appears in mandated sections
      if (!isInMandatedSection(phrase, mandatedSections)) {
        warnings.push({
          type: 'extrovert-bias',
          phrase,
          suggestion: SUGGESTIONS[phrase.toLowerCase()] || `Consider replacing "${phrase}" with more inclusive language`
        });
      }
    }
  });

  // Check for red flag phrases
  // Adversarial fix: Handle hyphen/space variations (e.g., "fast-paced" vs "fast paced")
  RED_FLAGS.forEach(phrase => {
    // Replace both hyphens and spaces with flexible pattern that matches either
    const flexiblePattern = phrase.replace(/[-\s]+/g, '[-\\s]+');
    const regex = new RegExp(`\\b${flexiblePattern}\\b`, 'gi');
    if (regex.test(cleanText)) {
      // Skip if this phrase appears in mandated sections
      if (!isInMandatedSection(phrase, mandatedSections)) {
        warnings.push({
          type: 'red-flag',
          phrase,
          suggestion: SUGGESTIONS[phrase.toLowerCase()] || `Consider replacing "${phrase}" with more positive language`
        });
      }
    }
  });

  return {
    warnings,
    valid: warnings.length === 0
  };
}
