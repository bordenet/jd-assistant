/**
 * Prompt generation for LLM-based Job Description scoring
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} jdContent - The job description content to score
 * @param {string} [postingType='external'] - Whether this is an 'internal' or 'external' posting
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(jdContent, postingType = 'external') {
  const isInternal = postingType === 'internal';

  const internalNote = isInternal
    ? '\n> ⚠️ **INTERNAL POSTING**: Do NOT penalize for missing compensation range - internal candidates have access through company systems.\n'
    : '';

  const compensationRule = isInternal
    ? '- **Compensation**: N/A for internal postings (no deduction)'
    : '- **Compensation (-10 pts)**: Deduct 10 if no salary range (e.g., "$150,000 - $200,000")';

  // ALIGNED WITH jd-validator.js: Length(25) + Inclusivity(25) + Culture(25) + Transparency(25) = 100
  return `You are an expert HR professional and DEI specialist evaluating a Job Description.
${internalNote}
<output_rules>
Output ONLY the scoring in the exact format below. NO preambles, NO explanations beyond category justifications, NO sign-offs. Begin directly with **TOTAL SCORE**.
</output_rules>

## SCORING RUBRIC (100 points total)

Score this Job Description using these EXACT categories that match our JavaScript validator:

### 1. Length (25 points max)
- **Optimal (25 pts)**: 400-700 words
- **Too Short**: Deduct 1 pt per 20 words below 400 (max -15)
- **Too Long**: Deduct 1 pt per 50 words above 700 (max -10)

### 2. Inclusivity (25 points max)
- **Masculine-coded words (-5 pts each, max -25)**: aggressive, ambitious, assertive, competitive, confident, decisive, determined, dominant, driven, fearless, independent, ninja, rockstar, guru, self-reliant, self-sufficient, superior
- **Extrovert-bias phrases (-5 pts each, max -20)**: outgoing, high-energy, energetic, people person, gregarious, strong communicator, excellent verbal, team player

### 3. Culture (25 points max)
- **Red flag phrases (-5 pts each, max -25)**: fast-paced, like a family, wear many hats, always-on, hustle, grind, unlimited pto, work hard play hard, hit the ground running, self-starter, thick skin, no ego, drama-free, whatever it takes, passion required
- **AI slop patterns (-1 to -5 pts)**: Vague platitudes, repetitive phrasing, hollow specificity

### 4. Transparency (25 points max)
${compensationRule}
- **Encouragement (-5 pts)**: Deduct 5 if missing "60-70% of qualifications" encouragement statement

## CALIBRATION
- Be HARSH. Most JDs score 40-60. Only exceptional ones score 80+.
- Count EACH instance of masculine-coded/extrovert-bias/red-flag terms.
- A score of 70+ means ready for diverse candidate attraction.

## JOB DESCRIPTION TO EVALUATE

\`\`\`
${jdContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

**TOTAL SCORE: [X]/100**

### Length: [X]/25
Word count: [N]. [1 sentence justification]

### Inclusivity: [X]/25
[List any masculine-coded or extrovert-bias terms found. 1-2 sentence justification]

### Culture: [X]/25
[List any red flags or slop patterns found. 1-2 sentence justification]

### Transparency: [X]/25
[Note compensation presence and encouragement statement. 1-2 sentence justification]

### Top 3 Issues
1. [Most critical issue]
2. [Second issue]
3. [Third issue]

### Top 3 Strengths
1. [Strongest aspect]
2. [Second strength]
3. [Third strength]`;
}

/**
 * Generate critique prompt for detailed feedback
 * @param {string} jdContent - The job description content to critique
 * @param {Object} currentResult - Current validation results
 * @param {string} [postingType='external'] - Whether this is an 'internal' or 'external' posting
 * @returns {string} Complete prompt for critique
 */
export function generateCritiquePrompt(jdContent, currentResult, postingType = 'external') {
  const isInternal = postingType === 'internal';
  const warningsList = (currentResult.warnings || [])
    .slice(0, 5)
    .map(w => `- ${w.type}: "${w.word || w.phrase}"`)
    .join('\n');

  const internalNote = isInternal
    ? '\n> ⚠️ **INTERNAL POSTING**: Do NOT critique missing compensation - internal candidates have access through company systems.\n'
    : '';

  const transparencySection = isInternal
    ? '   - Transparency (25 pts): Encouragement statement (compensation N/A for internal)'
    : '   - Transparency (25 pts): Compensation range, encouragement statement';

  // ALIGNED WITH jd-validator.js categories
  return `You are a senior HR professional and DEI specialist helping improve a Job Description.
${internalNote}
<output_rules>
Output your critique in the exact format below. NO preambles ("Here's my..."), NO sign-offs. Begin directly with **Score Summary:**.
</output_rules>

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.score}/100
Grade: ${currentResult.grade}
Word Count: ${currentResult.wordCount || 'Unknown'}

Key issues detected:
${warningsList || '- None detected by automated scan'}

## JOB DESCRIPTION TO CRITIQUE

\`\`\`
${jdContent}
\`\`\`

## YOUR TASK

Help the author improve this Job Description by asking clarifying questions.

## REQUIRED OUTPUT FORMAT

**Score Summary:** ${currentResult.score}/100

**Top 3 Issues:**
1. [Most critical gap - be specific]
2. [Second most critical gap]
3. [Third most critical gap]

**Questions to Improve Your Job Description:**
1. **[Question about missing/weak area]**
   _Why this matters:_ [How answering this improves the score]

2. **[Question about another gap]**
   _Why this matters:_ [Score impact]

3. **[Question about inclusivity/culture/transparency]**
   _Why this matters:_ [Score impact]

(Provide 3-5 questions total, focused on the weakest dimensions)

**Scoring Categories Reference:**
- Length (25 pts): Word count assessment (target: 400-700 words)
- Inclusivity (25 pts): Masculine-coded words, extrovert-bias phrases
- Culture (25 pts): Red flag phrases, AI slop patterns
${transparencySection}

**Quick Wins (fix these now):**
- [Specific fix that doesn't require user input]
- [Another immediate improvement]

<output_rules>
- Start directly with "**Score Summary:**" (no preamble)
- Do NOT include a revised Job Description
- Only provide questions and quick wins
- Focus on making JD attractive to diverse candidates
</output_rules>`;
}

/**
 * Generate rewrite prompt
 * @param {string} jdContent - The job description content to rewrite
 * @param {Object} currentResult - Current validation results
 * @param {string} [postingType='external'] - Whether this is an 'internal' or 'external' posting
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(jdContent, currentResult, postingType = 'external') {
  const isInternal = postingType === 'internal';

  const internalNote = isInternal
    ? '\n> ⚠️ **INTERNAL POSTING**: Do NOT include salary range - internal candidates have access through company systems.\n'
    : '';

  const compensationReq = isInternal
    ? '- **Compensation**: SKIP (internal posting)'
    : '- **Compensation**: Include clear salary range (e.g., "$150,000 - $200,000")';

  // ALIGNED WITH jd-validator.js scoring categories
  return `You are a senior HR professional rewriting a Job Description to achieve a score of 85+/100.
${internalNote}
<output_rules>
Output ONLY the rewritten Job Description in markdown format. NO preambles ("Here's the revised..."), NO code fences (\`\`\`), NO sign-offs. Begin directly with # [Job Title].
</output_rules>

## CURRENT SCORE: ${currentResult.score}/100

## ORIGINAL JOB DESCRIPTION

\`\`\`
${jdContent}
\`\`\`

## SCORING TARGET (must achieve 85+/100)

Your rewrite must optimize for these JS validator categories:

### Length (25 pts target)
- 400-700 words exactly

### Inclusivity (25 pts target)
- ZERO masculine-coded words: aggressive, ambitious, assertive, competitive, confident, decisive, determined, dominant, driven, fearless, independent, ninja, rockstar, guru, self-reliant, self-sufficient, superior
- ZERO extrovert-bias phrases: outgoing, high-energy, energetic, people person, gregarious, strong communicator, excellent verbal, team player

### Culture (25 pts target)
- ZERO red flag phrases: fast-paced, like a family, wear many hats, always-on, hustle, grind, unlimited pto, work hard play hard, hit the ground running, self-starter, thick skin, no ego, drama-free, whatever it takes, passion required
- NO AI slop patterns (vague platitudes, repetitive phrasing)

### Transparency (25 pts target)
${compensationReq}
- **Encouragement**: MUST include "If you meet 60-70% of these qualifications, we encourage you to apply"

## STRUCTURE REQUIREMENTS
- Clear sections: About the Role, Key Responsibilities, Required Qualifications, Preferred Qualifications, What We Offer, To Apply
- Distinguishes must-have vs nice-to-have requirements
- Mentions career growth opportunities

Output ONLY the final job description. Begin with # [Job Title].`;
}

/**
 * Clean AI response to extract markdown content
 * @param {string} response - Raw AI response
 * @returns {string} Cleaned markdown content
 */
export function cleanAIResponse(response) {
  let cleaned = response.replace(/^(Here's|Here is|I've|I have|Below is)[^:]*:\s*/i, '');
  const codeBlockMatch = cleaned.match(/```(?:markdown)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }
  return cleaned.trim();
}

