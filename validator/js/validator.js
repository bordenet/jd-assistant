/**
 * JD Validator - Validation Logic
 *
 * Simple document validation demonstrating the validator pattern.
 */

/**
 * Validate a document and return a score with feedback
 * @param {string} text - The document text to validate
 * @returns {Object} Validation result with score, grade, and feedback
 */
export function validateDocument(text) {
  const feedback = [];
  let score = 0;

  // Check document length
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 100) {
    score += 25;
    feedback.push(`Good length: ${wordCount} words`);
  } else if (wordCount >= 50) {
    score += 15;
    feedback.push(`Moderate length: ${wordCount} words (aim for 100+)`);
  } else {
    score += 5;
    feedback.push(`Short document: ${wordCount} words (aim for 100+)`);
  }

  // Check for structure (headings)
  const hasHeadings = /^#+\s/m.test(text) || /<h[1-6]/i.test(text);
  if (hasHeadings) {
    score += 25;
    feedback.push('Document has headings/structure');
  } else {
    feedback.push('Consider adding headings for better structure');
  }

  // Check for paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  if (paragraphs.length >= 3) {
    score += 25;
    feedback.push(`Good paragraph structure: ${paragraphs.length} paragraphs`);
  } else if (paragraphs.length >= 2) {
    score += 15;
    feedback.push(`Basic paragraph structure: ${paragraphs.length} paragraphs`);
  } else {
    score += 5;
    feedback.push('Consider breaking content into multiple paragraphs');
  }

  // Check for lists
  const hasLists = /^[-*]\s/m.test(text) || /^\d+\.\s/m.test(text);
  if (hasLists) {
    score += 15;
    feedback.push('Document includes lists');
  }

  // Check for code blocks
  const hasCode = /```/.test(text) || /`[^`]+`/.test(text);
  if (hasCode) {
    score += 10;
    feedback.push('Document includes code examples');
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return {
    score,
    grade: getGrade(score),
    feedback,
    wordCount,
    paragraphCount: paragraphs.length
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
 * Masculine-coded words that discourage women from applying
 * Based on Gaucher et al. (2011) JPSP and Textio research
 */
const MASCULINE_CODED = [
  'aggressive', 'ambitious', 'assertive', 'competitive', 'confident',
  'decisive', 'determined', 'dominant', 'driven', 'fearless',
  'independent', 'ninja', 'rockstar', 'guru', 'self-reliant',
  'self-sufficient', 'superior'
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

/**
 * Extract company-mandated sections from text
 * @param {string} text - The text to process
 * @returns {Object} Object with cleanText and mandatedSections
 */
function extractMandatedSections(text) {
  const mandatedSections = [];
  let cleanText = text;

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
  cleanText = text.replace(preambleRegex, '').replace(legalRegex, '');

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
  EXTROVERT_BIAS.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'gi');
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
  RED_FLAGS.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'gi');
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
