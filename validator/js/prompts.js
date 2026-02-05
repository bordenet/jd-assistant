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
    ? `\n> ⚠️ **INTERNAL POSTING**: This is an INTERNAL job posting. Do NOT penalize for missing compensation range or benefits details - internal candidates already have access to this information through company systems.\n`
    : '';

  const compensationSection = isInternal
    ? `- **Compensation (0 pts)**: N/A for internal postings`
    : `- **Compensation (10 pts)**: Salary range clearly stated`;

  const benefitsSection = isInternal
    ? `- **Benefits Detail (0 pts)**: N/A for internal postings`
    : `- **Benefits Detail (8 pts)**: Specific benefits, not just "competitive"`;

  const transparencyTotal = isInternal ? '15' : '25';
  const candidateExpTotal = isInternal ? '12' : '20';
  const totalPossible = isInternal ? '82' : '100';

  const calibrationGuidance = isInternal
    ? `## CALIBRATION GUIDANCE
- Be HARSH. Most JDs score 40-60. Only exceptional ones score 80+.
- A score of 70+ means ready for diverse candidate attraction.
- Deduct 5 points for EACH masculine-coded word found.
- Deduct 5 points for EACH red flag phrase found.
- **DO NOT deduct for missing salary range (internal posting).**
- **DO NOT deduct for missing benefits detail (internal posting).**
- Reward explicit encouragement for underrepresented candidates.`
    : `## CALIBRATION GUIDANCE
- Be HARSH. Most JDs score 40-60. Only exceptional ones score 80+.
- A score of 70+ means ready for diverse candidate attraction.
- Deduct 5 points for EACH masculine-coded word found.
- Deduct 5 points for EACH red flag phrase found.
- Deduct 10 points if no salary range is provided.
- Reward explicit encouragement for underrepresented candidates.
- Reward specific, quantified benefits over vague promises.`;

  return `You are an expert HR professional and DEI specialist evaluating a Job Description.
${internalNote}
Score this Job Description using the following rubric (0-${totalPossible} points total):

## SCORING RUBRIC

### 1. Inclusive Language (30 points)
- **Gender-Neutral (10 pts)**: No masculine-coded words (aggressive, ninja, rockstar, etc.)
- **Neurodiversity-Friendly (10 pts)**: No extrovert-bias phrases (outgoing, high-energy, etc.)
- **Culture Signals (10 pts)**: No red flags (fast-paced, like a family, hustle, etc.)

### 2. Structure & Clarity (25 points)
- **Clear Sections (10 pts)**: Responsibilities, Requirements, Benefits clearly defined
- **Concise Length (10 pts)**: 400-700 words (not too short, not too long)
- **Readable Format (5 pts)**: Bullet points, clear hierarchy, scannable

### 3. Transparency (${transparencyTotal} points)
${compensationSection}
- **Requirements Honesty (10 pts)**: Distinguishes must-have vs nice-to-have
- **Encouragement (5 pts)**: Includes "60-70%" encouragement statement

### 4. Candidate Experience (${candidateExpTotal} points)
${benefitsSection}
- **Growth Path (6 pts)**: Career development opportunities mentioned
- **Application Process (6 pts)**: Clear next steps and timeline

${calibrationGuidance}

## JOB DESCRIPTION TO EVALUATE

\`\`\`
${jdContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**TOTAL SCORE: [X]/${totalPossible}**

### Inclusive Language: [X]/30
[2-3 sentence justification]

### Structure & Clarity: [X]/25
[2-3 sentence justification]

### Transparency: [X]/${transparencyTotal}
[2-3 sentence justification]

### Candidate Experience: [X]/${candidateExpTotal}
[2-3 sentence justification]

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
    .map(w => `- ${w.type}: "${w.word || w.phrase}" - ${w.suggestion}`)
    .join('\n');

  const internalNote = isInternal
    ? `\n> ⚠️ **INTERNAL POSTING**: This is an INTERNAL job posting. Do NOT critique missing compensation range or benefits details - internal candidates already have access to this information through company systems.\n`
    : '';

  const transparencySection = isInternal
    ? `   - Transparency: Requirements honesty (compensation/benefits N/A for internal)`
    : `   - Transparency: Compensation, requirements honesty`;

  const candidateExpSection = isInternal
    ? `   - Candidate Experience: Growth opportunities, application process (benefits N/A for internal)`
    : `   - Candidate Experience: Benefits, growth, process`;

  return `You are a senior HR professional and DEI specialist providing detailed feedback on a Job Description.
${internalNote}
## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.score}/100
Grade: ${currentResult.grade}
Word Count: ${currentResult.wordCount}

Key issues detected:
${warningsList || '- None detected by automated scan'}

## JOB DESCRIPTION TO CRITIQUE

\`\`\`
${jdContent}
\`\`\`

## YOUR TASK

Provide:
1. **Executive Summary** (2-3 sentences on overall JD quality)
2. **Detailed Critique** by dimension:
   - Inclusive Language: What works, what needs improvement
   - Structure & Clarity: Organization and readability
${transparencySection}
${candidateExpSection}
3. **Revised Job Description** - A complete rewrite addressing all issues

Be specific. Show exact rewrites. Make it ready to attract diverse, qualified candidates.`;
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
    ? `\n> ⚠️ **INTERNAL POSTING**: This is an INTERNAL job posting. Do NOT include salary range or benefits details - internal candidates already have access to this information through company systems.\n`
    : '';

  const compensationReq = isInternal
    ? `6. **SKIP**: Salary range (internal posting - not needed)`
    : `6. Includes a clear salary range`;

  const benefitsReq = isInternal
    ? `9. **SKIP**: Specific benefits listing (internal posting - not needed)`
    : `9. Lists specific, quantified benefits`;

  return `You are a senior HR professional rewriting a Job Description to achieve a score of 85+.
${internalNote}
## CURRENT SCORE: ${currentResult.score}/100

## ORIGINAL JOB DESCRIPTION

\`\`\`
${jdContent}
\`\`\`

## REWRITE REQUIREMENTS

Create a complete, polished Job Description that:
1. Is 400-700 words (concise but comprehensive)
2. Has all required sections (Responsibilities, Requirements${isInternal ? '' : ', Benefits'})
3. Uses ZERO masculine-coded words (no aggressive, ninja, rockstar, etc.)
4. Uses ZERO extrovert-bias phrases (no outgoing, high-energy, etc.)
5. Uses ZERO red flag phrases (no fast-paced, like a family, hustle, etc.)
${compensationReq}
7. Distinguishes must-have vs nice-to-have requirements
8. Includes "60-70%" encouragement statement
${benefitsReq}
10. Mentions career growth opportunities
11. Provides clear application process and timeline

Output ONLY the rewritten Job Description in markdown format. No commentary.`;
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

