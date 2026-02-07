/**
 * AI Mock Module
 * Provides mock AI responses for development and testing
 * @module ai-mock
 */

/** @type {boolean} */
let mockModeEnabled = false;

/**
 * Check if running on localhost
 * @returns {boolean}
 */
export function isLocalhost() {
  return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.startsWith('192.168.');
}

/**
 * Initialize mock mode toggle (localhost only)
 * @returns {void}
 */
export function initMockMode() {
  if (!isLocalhost()) return;

  const toggle = document.getElementById('aiMockToggle');
  const checkbox = /** @type {HTMLInputElement | null} */ (document.getElementById('mockModeCheckbox'));

  if (toggle && checkbox) {
    toggle.classList.remove('hidden');

    // Restore previous state
    mockModeEnabled = localStorage.getItem('ai-mock-mode') === 'true';
    checkbox.checked = mockModeEnabled;

    checkbox.addEventListener('change', (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);
      mockModeEnabled = target.checked;
      localStorage.setItem('ai-mock-mode', mockModeEnabled.toString());
      console.log(`[AI Mock] Mode ${mockModeEnabled ? 'enabled' : 'disabled'}`);
    });
  }
}

/**
 * Check if mock mode is enabled
 * @returns {boolean}
 */
export function isMockEnabled() {
  return isLocalhost() && mockModeEnabled;
}

/**
 * Generate mock response for a phase
 * @param {import('./types.js').PhaseNumber} phase - Phase number
 * @param {import('./types.js').Project} project - Project data
 * @returns {string} Mock response
 */
export function getMockResponse(phase, project) {
  const jobTitle = project.jobTitle || 'Test Job';

  const mockResponses = {
    1: `# Job Description: ${jobTitle}

## Role Overview
Based on the provided information, here is the job description...

### Key Responsibilities
1. **Primary Focus**: Lead technical initiatives
2. **Collaboration**: Work with cross-functional teams
3. **Growth**: Mentor and develop team members

### Required Qualifications
- 5+ years of relevant experience
- Strong technical foundation
- Excellent communication skills

### Next Steps
- Review and refine the description
- Validate with hiring team
- Prepare for posting

*This is a mock AI response for development purposes.*`,

    2: `# Job Description Review: ${jobTitle}

## Feedback and Refinements

### Executive Summary
Building on the Phase 1 description, here are suggested refinements...

### Suggested Improvements
1. **Clarity**: Enhanced role expectations
2. **Specificity**: More detailed requirements
3. **Competitiveness**: Market-aligned compensation

### Expected Outcomes
- Improved candidate quality
- Faster hiring process
- Better role clarity

*This is a mock AI response for development purposes.*`,

    3: `# Final Job Description: ${jobTitle}

## Executive Summary
This job description provides a comprehensive overview of the ${jobTitle} role...

## Role Overview
Clear expectations and responsibilities for the position...

## Key Qualifications
Essential skills and experience required for success...

## Compensation & Benefits
Competitive package aligned with market standards...

## Next Steps
- Post the job description
- Begin recruiting process
- Schedule interviews with qualified candidates

## Conclusion
This job description is ready for posting and will attract qualified candidates...

*This is a mock AI response for development purposes.*`
  };

  return mockResponses[phase] || 'Mock response not available for this phase.';
}
