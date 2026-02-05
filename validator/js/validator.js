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
