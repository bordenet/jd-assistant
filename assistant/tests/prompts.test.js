/**
 * Prompts Module Tests
 */

import { jest } from '@jest/globals';
import {
  WORKFLOW_CONFIG,
  generatePhase1Prompt,
  generatePhase2Prompt,
  generatePhase3Prompt,
  getPhaseMetadata,
  preloadPromptTemplates,
  replaceTemplateVars
} from '../../shared/js/prompts.js';

// Mock fetch for loading prompt templates
// Handles both shared/prompts/ (root) and ../shared/prompts/ (assistant/) paths
global.fetch = jest.fn(async (url) => {
  const templates = {
    'phase1.md': 'Phase 1: Job Description for {{JOB_TITLE}} at {{COMPANY_NAME}} ({{ROLE_LEVEL}}) in {{LOCATION}}. Responsibilities: {{RESPONSIBILITIES}}. Required: {{REQUIRED_QUALIFICATIONS}}. Preferred: {{PREFERRED_QUALIFICATIONS}}. Compensation: {{COMPENSATION_RANGE}}. Benefits: {{BENEFITS}}. Tech Stack: {{TECH_STACK}}. Team: {{TEAM_SIZE}}. AI: {{AI_SPECIFICS}}. Career Ladder: {{CAREER_LADDER}}. Preamble: {{COMPANY_PREAMBLE}}. Legal: {{COMPANY_LEGAL_TEXT}}.',
    'phase2.md': 'Phase 2: Review for {{JOB_TITLE}} ({{ROLE_LEVEL}}) at {{COMPANY_NAME}}. Previous output: {{PHASE1_OUTPUT}}',
    'phase3.md': 'Phase 3: Final synthesis for {{JOB_TITLE}} at {{COMPANY_NAME}}. Phase 1: {{PHASE1_OUTPUT}}. Phase 2: {{PHASE2_OUTPUT}}'
  };
  // Extract filename from path (handles both old and new paths)
  const filename = url.split('/').pop();
  return {
    ok: true,
    text: async () => templates[filename] || 'Default template'
  };
});

describe('WORKFLOW_CONFIG', () => {
  test('should have 3 phases', () => {
    expect(WORKFLOW_CONFIG.phaseCount).toBe(3);
    expect(WORKFLOW_CONFIG.phases).toHaveLength(3);
  });

  test('should have correct phase structure', () => {
    WORKFLOW_CONFIG.phases.forEach((phase, index) => {
      expect(phase.number).toBe(index + 1);
      expect(phase.name).toBeDefined();
      expect(phase.aiModel).toBeDefined();
      expect(phase.description).toBeDefined();
      expect(phase.icon).toBeDefined();
      expect(phase.aiUrl).toBeDefined();
    });
  });

  test('should use Claude for Phase 1 and 3, Gemini for Phase 2', () => {
    expect(WORKFLOW_CONFIG.phases[0].aiModel).toBe('Claude');
    expect(WORKFLOW_CONFIG.phases[1].aiModel).toBe('Gemini');
    expect(WORKFLOW_CONFIG.phases[2].aiModel).toBe('Claude');
  });
});

describe('getPhaseMetadata', () => {
  test('should return correct metadata for each phase', () => {
    const phase1 = getPhaseMetadata(1);
    expect(phase1.name).toBe('Initial Draft');
    expect(phase1.icon).toBe('📝');

    const phase2 = getPhaseMetadata(2);
    expect(phase2.name).toBe('Adversarial Review');
    expect(phase2.icon).toBe('🔄');

    const phase3 = getPhaseMetadata(3);
    expect(phase3.name).toBe('Final Synthesis');
    expect(phase3.icon).toBe('✨');
  });

  test('should return undefined for invalid phase', () => {
    expect(getPhaseMetadata(0)).toBeUndefined();
    expect(getPhaseMetadata(4)).toBeUndefined();
    expect(getPhaseMetadata(-1)).toBeUndefined();
  });
});

describe('preloadPromptTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should preload all phase templates', async () => {
    await preloadPromptTemplates();

    // Verify fetch was called 3 times (once per phase)
    expect(global.fetch).toHaveBeenCalledTimes(3);
    // Verify paths end with phase filenames (works with shared/ pattern)
    const calls = global.fetch.mock.calls.map(c => c[0]);
    expect(calls.some(url => url.endsWith('phase1.md'))).toBe(true);
    expect(calls.some(url => url.endsWith('phase2.md'))).toBe(true);
    expect(calls.some(url => url.endsWith('phase3.md'))).toBe(true);
  });
});

describe('generatePhase1Prompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate prompt with all form data', async () => {
    const formData = {
      jobTitle: 'Senior Software Engineer',
      companyName: 'Acme Corp',
      roleLevel: 'Senior',
      location: 'Remote',
      responsibilities: 'Lead backend development\nMentor junior engineers',
      requiredQualifications: '5+ years experience\nPython expertise',
      preferredQualifications: 'AWS experience\nOpen source contributions',
      compensationRange: '$170,000 - $220,000',
      benefits: 'Health insurance\n401k matching',
      techStack: 'Python, React, PostgreSQL',
      teamSize: '8-person team',
      aiSpecifics: 'LLM integration',
      careerLadder: 'Senior -> Staff -> Principal',
      companyPreamble: 'Equal opportunity employer',
      companyLegalText: 'At-will employment'
    };

    const prompt = await generatePhase1Prompt(formData);

    expect(prompt).toContain('Senior Software Engineer');
    expect(prompt).toContain('Acme Corp');
    expect(prompt).toContain('Senior');
    expect(prompt).toContain('Remote');
    expect(prompt).toContain('Lead backend development');
    expect(prompt).toContain('5+ years experience');
    expect(prompt).toContain('$170,000 - $220,000');
    expect(prompt).toContain('Python, React, PostgreSQL');
    expect(prompt).toContain('Senior -> Staff -> Principal');
  });

  test('should handle missing form data with placeholders', async () => {
    const formData = {
      jobTitle: 'Test Job'
    };

    const prompt = await generatePhase1Prompt(formData);

    expect(prompt).toContain('Test Job');
    expect(prompt).toContain('[Not provided]');
  });
});

describe('generatePhase2Prompt', () => {
  test('should include phase 1 output', async () => {
    const formData = {
      jobTitle: 'Senior Engineer',
      companyName: 'Test Company',
      roleLevel: 'Senior'
    };

    const prompt = await generatePhase2Prompt(formData, 'Phase 1 generated content');

    expect(prompt).toContain('Phase 1 generated content');
    expect(prompt).toContain('Senior Engineer');
    expect(prompt).toContain('Senior');
    expect(prompt).toContain('Test Company');
  });
});

describe('generatePhase3Prompt', () => {
  test('should include both phase 1 and phase 2 outputs', async () => {
    const formData = {
      jobTitle: 'Final Test Job',
      companyName: 'Final Test Company'
    };

    const prompt = await generatePhase3Prompt(formData, 'Phase 1 content', 'Phase 2 critique');

    expect(prompt).toContain('Final Test Job');
    expect(prompt).toContain('Phase 1 content');
    expect(prompt).toContain('Phase 2 critique');
  });
});

describe('replaceTemplateVars - Placeholder Safety Check', () => {
  test('should replace known variables', () => {
    const template = 'Hello {{NAME}}, welcome to {{PROJECT}}';
    const vars = { NAME: 'World', PROJECT: 'JD Assistant' };

    const result = replaceTemplateVars(template, vars);

    expect(result).toBe('Hello World, welcome to JD Assistant');
  });

  test('should remove unsubstituted UPPER_CASE placeholders', () => {
    const template = 'Hello {{NAME}}, your {{UNKNOWN_FIELD}} is ready';
    const vars = { NAME: 'World' };

    const result = replaceTemplateVars(template, vars);

    expect(result).toBe('Hello World, your  is ready');
    expect(result).not.toContain('{{UNKNOWN_FIELD}}');
  });

  test('should handle phase output placeholders when not provided', () => {
    const template = '{{PHASE1_OUTPUT}} and {{PHASE2_OUTPUT}}';
    const vars = { PHASE1_OUTPUT: 'Draft content here' };

    const result = replaceTemplateVars(template, vars);

    expect(result).toContain('Draft content here');
    expect(result).not.toContain('{{PHASE2_OUTPUT}}');
  });
});
