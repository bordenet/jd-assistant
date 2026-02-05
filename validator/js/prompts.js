/**
 * Prompt generation for LLM-based Job Description scoring
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} jdContent - The job description content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(jdContent) {
  return `You are an expert HR professional and DEI specialist evaluating a Job Description.

Score this Job Description using the following rubric (0-100 points total):

## SCORING RUBRIC

### 1. Inclusive Language (30 points)
- **Gender-Neutral (10 pts)**: No masculine-coded words (aggressive, ninja, rockstar, etc.)
- **Neurodiversity-Friendly (10 pts)**: No extrovert-bias phrases (outgoing, high-energy, etc.)
- **Culture Signals (10 pts)**: No red flags (fast-paced, like a family, hustle, etc.)

### 2. Structure & Clarity (25 points)
- **Clear Sections (10 pts)**: Responsibilities, Requirements, Benefits clearly defined
- **Concise Length (10 pts)**: 400-700 words (not too short, not too long)
- **Readable Format (5 pts)**: Bullet points, clear hierarchy, scannable

### 3. Transparency (25 points)
- **Compensation (10 pts)**: Salary range clearly stated
- **Requirements Honesty (10 pts)**: Distinguishes must-have vs nice-to-have
- **Encouragement (5 pts)**: Includes "60-70%" encouragement statement

### 4. Candidate Experience (20 points)
- **Benefits Detail (8 pts)**: Specific benefits, not just "competitive"
- **Growth Path (6 pts)**: Career development opportunities mentioned
- **Application Process (6 pts)**: Clear next steps and timeline

## CALIBRATION GUIDANCE
- Be HARSH. Most JDs score 40-60. Only exceptional ones score 80+.
- A score of 70+ means ready for diverse candidate attraction.
- Deduct 5 points for EACH masculine-coded word found.
- Deduct 5 points for EACH red flag phrase found.
- Deduct 10 points if no salary range is provided.
- Reward explicit encouragement for underrepresented candidates.
- Reward specific, quantified benefits over vague promises.

## JOB DESCRIPTION TO EVALUATE

\`\`\`
${jdContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**TOTAL SCORE: [X]/100**

### Inclusive Language: [X]/30
[2-3 sentence justification]

### Structure & Clarity: [X]/25
[2-3 sentence justification]

### Transparency: [X]/25
[2-3 sentence justification]

### Candidate Experience: [X]/20
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
 * @returns {string} Complete prompt for critique
 */
export function generateCritiquePrompt(jdContent, currentResult) {
  const warningsList = (currentResult.warnings || [])
    .slice(0, 5)
    .map(w => `- ${w.type}: "${w.word || w.phrase}" - ${w.suggestion}`)
    .join('\n');

  return `You are a senior HR professional and DEI specialist providing detailed feedback on a Job Description.

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
   - Transparency: Compensation, requirements honesty
   - Candidate Experience: Benefits, growth, process
3. **Revised Job Description** - A complete rewrite addressing all issues

Be specific. Show exact rewrites. Make it ready to attract diverse, qualified candidates.`;
}

/**
 * Generate rewrite prompt
 * @param {string} jdContent - The job description content to rewrite
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(jdContent, currentResult) {
  return `You are a senior HR professional rewriting a Job Description to achieve a score of 85+.

## CURRENT SCORE: ${currentResult.score}/100

## ORIGINAL JOB DESCRIPTION

\`\`\`
${jdContent}
\`\`\`

## REWRITE REQUIREMENTS

Create a complete, polished Job Description that:
1. Is 400-700 words (concise but comprehensive)
2. Has all required sections (Responsibilities, Requirements, Benefits)
3. Uses ZERO masculine-coded words (no aggressive, ninja, rockstar, etc.)
4. Uses ZERO extrovert-bias phrases (no outgoing, high-energy, etc.)
5. Uses ZERO red flag phrases (no fast-paced, like a family, hustle, etc.)
6. Includes a clear salary range
7. Distinguishes must-have vs nice-to-have requirements
8. Includes "60-70%" encouragement statement
9. Lists specific, quantified benefits
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

