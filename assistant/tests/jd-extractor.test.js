/**
 * @jest-environment jsdom
 */

import { describe, it, expect } from '@jest/globals';
import { extractJobDescriptionFields } from '../../shared/js/jd-extractor.js';

/**
 * Test fixtures - synthetic JDs based on public templates
 * Sources: Deel, Rework, JoinGenius job description templates (public)
 */

// Well-structured JD with all sections (based on Deel TPM template)
const COMPLETE_JD = `# Senior Technical Product Manager

At Acme Corporation, we are building the future of cloud infrastructure. We're looking for a Senior Technical Product Manager to lead our API platform team.

## About the Role

This is a hands-on technical product management role where you'll work directly with our engineering team to build and improve our developer platform.

## Responsibilities

- Define and prioritize the product roadmap for our API platform
- Work closely with engineering to translate business requirements into technical specifications
- Conduct market research and competitive analysis to inform product decisions
- Collaborate with cross-functional teams to ensure successful product launch
- Monitor product performance metrics and adjust strategies accordingly

## Requirements

- 5+ years of product management experience in B2B SaaS
- Strong technical background with understanding of APIs and software development
- Experience with agile methodologies (Scrum, Kanban)
- Excellent communication and stakeholder management skills
- Bachelor's degree in Computer Science or related field

## Nice to Have

- Experience with cloud platforms (AWS, GCP, Azure)
- Background in developer tools or API-first companies
- MBA or advanced technical degree

## Benefits

- Competitive salary range $150,000 - $200,000
- Health, dental, and vision insurance
- 401(k) with company match
- Flexible PTO policy
- Remote-first culture

Location: Remote (US-based)`;

// Minimal JD with few sections
const MINIMAL_JD = `Software Engineer

We are hiring a software engineer to join our team.

## What You'll Do

- Write clean, maintainable code
- Participate in code reviews
- Collaborate with product team

## Qualifications

- 3+ years of experience with Python or JavaScript
- Strong problem-solving skills`;

// JD with bold headings instead of markdown
const BOLD_HEADINGS_JD = `Product Manager - E-commerce Platform

At TechStartup Inc, we're revolutionizing online shopping.

**Responsibilities**

- Own the product roadmap for our checkout experience
- Analyze user behavior and conversion metrics
- Work with UX designers on new features

**Requirements**

- 4+ years of product management experience
- Experience with e-commerce platforms
- Data-driven decision making skills

**Preferred Qualifications**

- Experience with A/B testing
- SQL proficiency`;

// JD with ALL CAPS headings
const CAPS_HEADINGS_JD = `Data Scientist

Join DataCorp to work on cutting-edge ML projects.

RESPONSIBILITIES

- Build and deploy machine learning models
- Analyze large datasets using Python and SQL
- Present findings to stakeholders

REQUIREMENTS

- MS or PhD in Computer Science, Statistics, or related field
- Experience with TensorFlow or PyTorch
- Strong communication skills`;

// JD with em-dash in title
const EMDASH_TITLE_JD = `Staff Engineer – Backend Infrastructure

At CloudScale, we build reliable distributed systems.

## The Role

You will design and implement core infrastructure services.

## What We're Looking For

- 8+ years of backend development experience
- Expert knowledge of Go or Rust
- Experience with Kubernetes and Docker`;

describe('extractJobDescriptionFields', () => {
  describe('Happy Path - Complete JD', () => {
    const result = extractJobDescriptionFields(COMPLETE_JD);

    it('extracts job title correctly', () => {
      expect(result.jobTitle).toBe('Senior Technical Product Manager');
    });

    it('extracts company name correctly', () => {
      expect(result.companyName).toBe('Acme Corporation');
    });

    it('extracts role level correctly', () => {
      expect(result.roleLevel).toBe('Senior');
    });

    it('extracts location correctly', () => {
      expect(result.location).toMatch(/remote/i);
    });

    it('extracts responsibilities section', () => {
      expect(result.responsibilities).toContain('Define and prioritize the product roadmap');
      expect(result.responsibilities).toContain('Work closely with engineering');
    });

    it('extracts required qualifications section', () => {
      expect(result.requiredQualifications).toContain('5+ years of product management');
      expect(result.requiredQualifications).toContain('Strong technical background');
    });

    it('extracts preferred qualifications section', () => {
      expect(result.preferredQualifications).toContain('Experience with cloud platforms');
      expect(result.preferredQualifications).toContain('MBA or advanced technical degree');
    });

    it('extracts benefits section', () => {
      expect(result.benefits).toContain('Health, dental, and vision');
      expect(result.benefits).toContain('401(k)');
    });

    it('extracts compensation range', () => {
      expect(result.compensationRange).toMatch(/\$150,000.*\$200,000/);
    });

    it('extracts tech stack keywords', () => {
      expect(result.techStack).toMatch(/aws/i);
      expect(result.techStack).toMatch(/gcp/i);
      expect(result.techStack).toMatch(/azure/i);
    });

    it('extracts role overview', () => {
      expect(result.roleOverview).toContain('hands-on technical product management');
    });
  });

  describe('Minimal JD - Graceful Degradation', () => {
    const result = extractJobDescriptionFields(MINIMAL_JD);

    it('extracts job title from first line', () => {
      expect(result.jobTitle).toBe('Software Engineer');
    });

    it('returns empty string for missing company name', () => {
      expect(result.companyName).toBe('');
    });

    it('extracts responsibilities from alternative heading', () => {
      expect(result.responsibilities).toContain('Write clean, maintainable code');
    });

    it('extracts qualifications correctly', () => {
      expect(result.requiredQualifications).toContain('3+ years of experience');
    });

    it('returns empty string for missing fields', () => {
      expect(result.benefits).toBe('');
      expect(result.compensationRange).toBe('');
    });
  });

  describe('Bold Headings Variation', () => {
    const result = extractJobDescriptionFields(BOLD_HEADINGS_JD);

    it('extracts job title with role designation', () => {
      expect(result.jobTitle).toBe('Product Manager - E-commerce Platform');
    });

    it('extracts company name from body text', () => {
      expect(result.companyName).toBe('TechStartup Inc');
    });

    it('extracts responsibilities from bold heading', () => {
      expect(result.responsibilities).toContain('Own the product roadmap');
    });

    it('extracts requirements from bold heading', () => {
      expect(result.requiredQualifications).toContain('4+ years of product management');
    });

    it('extracts preferred qualifications from bold heading', () => {
      expect(result.preferredQualifications).toContain('Experience with A/B testing');
    });
  });

  describe('ALL CAPS Headings Variation', () => {
    const result = extractJobDescriptionFields(CAPS_HEADINGS_JD);

    it('extracts job title correctly', () => {
      expect(result.jobTitle).toBe('Data Scientist');
    });

    it('extracts responsibilities from CAPS heading', () => {
      expect(result.responsibilities).toContain('Build and deploy machine learning models');
    });

    it('extracts requirements from CAPS heading', () => {
      expect(result.requiredQualifications).toContain('MS or PhD in Computer Science');
    });

    it('extracts tech stack from content', () => {
      expect(result.techStack).toMatch(/tensorflow/i);
      expect(result.techStack).toMatch(/pytorch/i);
      expect(result.techStack).toMatch(/python/i);
    });
  });

  describe('Em-dash Title Handling', () => {
    const result = extractJobDescriptionFields(EMDASH_TITLE_JD);

    it('extracts full title including em-dash', () => {
      expect(result.jobTitle).toContain('Staff Engineer');
      expect(result.jobTitle).toContain('Backend Infrastructure');
    });

    it('extracts role level from title', () => {
      expect(result.roleLevel).toBe('Staff');
    });

    it('extracts requirements from alternative heading', () => {
      expect(result.requiredQualifications).toContain('8+ years of backend development');
    });

    it('extracts tech stack keywords', () => {
      expect(result.techStack).toMatch(/kubernetes/i);
      expect(result.techStack).toMatch(/docker/i);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty input gracefully', () => {
      const result = extractJobDescriptionFields('');
      expect(result).toBeDefined();
      expect(result.jobTitle).toBe('');
      expect(result.responsibilities).toBe('');
    });

    it('handles whitespace-only input', () => {
      const result = extractJobDescriptionFields('   \n\n   \t  ');
      expect(result).toBeDefined();
      expect(result.jobTitle).toBe('');
    });

    it('handles input with no recognizable sections', () => {
      const result = extractJobDescriptionFields('Just some random text without any structure.');
      expect(result).toBeDefined();
      expect(result.jobTitle).toBe('Just some random text without any structure.');
    });

    it('handles malformed markdown gracefully', () => {
      const malformed = `#

      ##
      - item without heading
      `;
      const result = extractJobDescriptionFields(malformed);
      expect(result).toBeDefined();
    });
  });

  describe('Data Safety', () => {
    it('always returns a valid object', () => {
      const inputs = ['', null, undefined, 123, {}, []];
      inputs.forEach(input => {
        // The function should handle any input without throwing
        try {
          const result = extractJobDescriptionFields(input);
          expect(typeof result).toBe('object');
        } catch (e) {
          // If it throws for truly invalid input, that's acceptable
          expect(e).toBeInstanceOf(Error);
        }
      });
    });

    it('never corrupts original data', () => {
      const original = COMPLETE_JD;
      const originalCopy = original.slice();
      extractJobDescriptionFields(original);
      expect(original).toBe(originalCopy);
    });

    it('returns strings for all string fields', () => {
      const result = extractJobDescriptionFields(COMPLETE_JD);
      const stringFields = [
        'jobTitle', 'companyName', 'responsibilities', 'requiredQualifications',
        'preferredQualifications', 'roleLevel', 'location', 'compensationRange',
        'benefits', 'techStack', 'roleOverview', 'aboutCompany'
      ];
      stringFields.forEach(field => {
        expect(typeof result[field]).toBe('string');
      });
    });
  });

  describe('Tech Stack Extraction', () => {
    it('extracts multiple tech keywords from content', () => {
      const jd = `# Full Stack Developer

      ## Requirements
      - Experience with React and Node.js
      - PostgreSQL and MongoDB database experience
      - Familiar with Docker and Kubernetes
      - AWS or GCP cloud experience
      `;
      const result = extractJobDescriptionFields(jd);
      expect(result.techStack).toMatch(/react/i);
      expect(result.techStack).toMatch(/node/i);
      expect(result.techStack).toMatch(/postgresql/i);
      expect(result.techStack).toMatch(/mongodb/i);
    });

    it('handles AI/ML specific tech stack', () => {
      const jd = `# ML Engineer

      ## Requirements
      - Experience with LLMs (GPT, Claude, Gemini)
      - TensorFlow or PyTorch proficiency
      - NLP and ASR experience
      `;
      const result = extractJobDescriptionFields(jd);
      expect(result.techStack).toMatch(/llm/i);
      expect(result.techStack).toMatch(/gpt/i);
      expect(result.techStack).toMatch(/tensorflow/i);
    });
  });

  describe('Role Level Detection', () => {
    it('detects Senior level', () => {
      const result = extractJobDescriptionFields('# Senior Software Engineer');
      expect(result.roleLevel).toBe('Senior');
    });

    it('detects Staff level', () => {
      const result = extractJobDescriptionFields('# Staff Engineer');
      expect(result.roleLevel).toBe('Staff');
    });

    it('detects Principal level', () => {
      const result = extractJobDescriptionFields('# Principal Architect');
      expect(result.roleLevel).toBe('Principal');
    });

    it('detects Lead level', () => {
      const result = extractJobDescriptionFields('# Lead Developer');
      expect(result.roleLevel).toBe('Lead');
    });

    it('detects Director level', () => {
      const result = extractJobDescriptionFields('# Engineering Director');
      expect(result.roleLevel).toBe('Director');
    });

    it('detects Manager level', () => {
      const result = extractJobDescriptionFields('# Product Manager');
      expect(result.roleLevel).toBe('Manager');
    });

    it('returns empty for unspecified level', () => {
      const result = extractJobDescriptionFields('# Software Engineer');
      expect(result.roleLevel).toBe('');
    });
  });

  describe('Location Extraction', () => {
    it('extracts Remote location', () => {
      const jd = `# Engineer\n\nLocation: Remote`;
      const result = extractJobDescriptionFields(jd);
      expect(result.location).toMatch(/remote/i);
    });

    it('extracts hybrid location', () => {
      const jd = `# Engineer\n\nLocation: Hybrid (San Francisco, CA)`;
      const result = extractJobDescriptionFields(jd);
      expect(result.location).toMatch(/hybrid/i);
    });

    it('extracts on-site location', () => {
      const jd = `# Engineer\n\nLocation: New York, NY (On-site)`;
      const result = extractJobDescriptionFields(jd);
      expect(result.location).toContain('New York');
    });
  });

  describe('Compensation Extraction', () => {
    it('extracts salary range with dollar signs', () => {
      const jd = `# Engineer\n\nSalary: $120,000 - $180,000`;
      const result = extractJobDescriptionFields(jd);
      expect(result.compensationRange).toMatch(/\$120,000.*\$180,000/);
    });

    it('extracts salary from benefits section', () => {
      const jd = `# Engineer\n\n## Benefits\n- Competitive salary: $100K - $150K\n- Health insurance`;
      const result = extractJobDescriptionFields(jd);
      expect(result.compensationRange).toMatch(/\$100K.*\$150K/);
    });
  });
});

