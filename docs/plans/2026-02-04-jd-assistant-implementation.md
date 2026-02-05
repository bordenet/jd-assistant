# JD Assistant Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the hello-world baseline into a fully functional Job Description Assistant for software engineering positions.

**Architecture:**
- Form fields capture JD inputs (role, company, requirements, compensation, etc.)
- 3-phase adversarial workflow generates inclusive, AI-optimized JDs
- Validator checks for red flags, masculine-coded language, and anti-patterns

**Tech Stack:** Vanilla JS, Tailwind CSS, Jest for testing

**Research Reference:** `docs/JD-RESEARCH-2025.md` (657 lines of synthesized best practices)

---

## 🔄 Session Resumption Guide

> **If starting a new session, read this section first.**

### Current Status

| Task | Status | Last Updated |
|------|--------|--------------|
| Task 1: Update Form Fields | ✅ COMPLETE | 2026-02-05 |
| Task 2: Update Prompt Templates | ✅ COMPLETE | 2026-02-05 |
| Task 3: Update prompts.js | ✅ COMPLETE | 2026-02-05 |
| Task 4: Update Validator | ✅ COMPLETE | 2026-02-05 |

### Progress Log

```
2026-02-04: Plan created. Ready for execution.
2026-02-05: Task 1 COMPLETE - Form fields updated, 304 tests passing, commit b9e2046
2026-02-05: Task 2 COMPLETE - JD prompts with inclusive language, commit 6edd12d
2026-02-05: Task 3 COMPLETE - Wired form fields to prompts.js, commit 778bc1e
2026-02-05: Task 4 COMPLETE - Validator with inclusive language checks, commit 9a3ea52
2026-02-05: ALL TASKS COMPLETE - 316 tests passing, ready for final verification
```

### Key Context for New Session

1. **Project Location:** `genesis-tools/jd-assistant/`
2. **This is a learning exercise** — document friction in `genesis/CONTINUOUS_IMPROVEMENT.md`
3. **No remote operations** until explicit user approval
4. **Research document:** `docs/JD-RESEARCH-2025.md` (657 lines of JD best practices)
5. **Baseline tests pass:** 286 tests, 58.55% coverage, lint clean

### User Requirements (MUST preserve)

- **Optional career ladder field** for accurate leveling
- **Company preamble field** (EEO statements) — RELAXED validation
- **Company legal text field** (disclaimers) — RELAXED validation
- **Inclusive language priority** — avoid repelling female applicants, introverts
- **Validator must NOT flag** company-mandated sections

### Commands to Verify State

```bash
cd ~/GitHub/Personal/genesis-tools/jd-assistant
git status                    # Check uncommitted changes
npm test                      # Run all tests (should be 286 passing)
npm run lint                  # Should be clean
```

### How to Resume

1. Read this plan document fully
2. Check the "Current Status" table above
3. Find the first ⬜ NOT STARTED or 🔄 IN PROGRESS task
4. Execute that task's steps in order
5. Update the status table and progress log after each task

---

## Overview

The implementation has 4 major tasks:

1. **Task 1: Update Form Fields** — Replace dealership-focused form with JD-specific fields
2. **Task 2: Update Prompt Templates** — Create JD-specific prompts for all 3 phases
3. **Task 3: Update prompts.js** — Wire new form fields to prompt generation
4. **Task 4: Update Validator** — Add inclusive language and red flag checks

Each task follows TDD: write failing test → implement → verify → commit.

---

## Task 1: Update Form Fields (views.js)

**Files:**
- Modify: `assistant/js/views.js:190-375` (getNewProjectFormHTML function)
- Test: `assistant/tests/views.test.js`

### Step 1.1: Write failing test for new form fields

Add test to `assistant/tests/views.test.js`:

```javascript
describe('JD Assistant Form Fields', () => {
  test('form includes job title field', () => {
    renderNewProjectForm();
    const field = document.getElementById('jobTitle');
    expect(field).toBeTruthy();
    expect(field.required).toBe(true);
  });

  test('form includes optional career ladder field', () => {
    renderNewProjectForm();
    const field = document.getElementById('careerLadder');
    expect(field).toBeTruthy();
    expect(field.required).toBe(false);
  });

  test('form includes company preamble field', () => {
    renderNewProjectForm();
    const field = document.getElementById('companyPreamble');
    expect(field).toBeTruthy();
  });

  test('form includes company legal text field', () => {
    renderNewProjectForm();
    const field = document.getElementById('companyLegalText');
    expect(field).toBeTruthy();
  });
});
```

### Step 1.2: Run test to verify it fails

```bash
cd genesis-tools/jd-assistant && npm test -- --testPathPattern=views.test.js
```

Expected: FAIL with "Cannot find element with id 'jobTitle'"

### Step 1.3: Implement new form HTML

Replace `getNewProjectFormHTML()` in `views.js` with JD-specific form sections:

**Section 1: Role Basics (Required)**
- Job Title (text, required)
- Company Name (text, required)
- Role Level (select: Junior, Mid, Senior, Staff, Principal)
- Location/Remote Policy (text)

**Section 2: Responsibilities & Requirements**
- Key Responsibilities (textarea, 5-8 bullets)
- Required Qualifications (textarea, 3-6 items)
- Preferred Qualifications (textarea, 4-8 items)

**Section 3: Compensation & Benefits**
- Compensation Range (text, e.g., "$170,000 - $220,000")
- Benefits Highlights (textarea)

**Section 4: Optional Context**
- Tech Stack Details (textarea)
- Team Size/Structure (text)
- Applied AI Specifics (textarea, for AI roles)
- Company Career Ladder (textarea, optional)

**Section 5: Company-Mandated Content (Relaxed Validation)**
- Company Preamble (textarea, EEO statements)
- Company Legal Text (textarea, disclaimers)

### Step 1.4: Run test to verify it passes

```bash
cd genesis-tools/jd-assistant && npm test -- --testPathPattern=views.test.js
```

Expected: PASS

### Step 1.5: Commit

```bash
git add assistant/js/views.js assistant/tests/views.test.js
git commit -m "feat(form): add JD-specific form fields with career ladder and legal sections"
```

---

## Task 2: Update Prompt Templates (prompts/*.md)

**Files:**
- Modify: `prompts/phase1.md`
- Modify: `prompts/phase2.md`
- Modify: `prompts/phase3.md`
- Test: `assistant/tests/prompts.test.js`

### Step 2.1: Write failing test for JD-specific prompts

Add test to `assistant/tests/prompts.test.js`:

```javascript
describe('JD Prompt Templates', () => {
  test('phase1 prompt includes inclusive language rules', async () => {
    const prompt = await generatePhase1Prompt(mockFormData);
    expect(prompt).toContain('masculine-coded');
    expect(prompt).toContain('neurodiversity');
  });

  test('phase1 prompt includes job title variable', async () => {
    const prompt = await generatePhase1Prompt({ jobTitle: 'Senior Engineer' });
    expect(prompt).toContain('Senior Engineer');
  });

  test('phase2 prompt critiques for red flags', async () => {
    const prompt = await generatePhase2Prompt(mockFormData, 'draft');
    expect(prompt).toContain('fast-paced');
    expect(prompt).toContain('rockstar');
  });
});
```

### Step 2.2: Run test to verify it fails

```bash
cd genesis-tools/jd-assistant && npm test -- --testPathPattern=prompts.test.js
```

Expected: FAIL

### Step 2.3: Implement phase1.md (Initial JD Draft)

See detailed prompt content in Step 2.3 implementation section below.

### Step 2.4: Implement phase2.md (Adversarial Review)

See detailed prompt content in Step 2.4 implementation section below.

### Step 2.5: Implement phase3.md (Final Synthesis)

See detailed prompt content in Step 2.5 implementation section below.

### Step 2.6: Run test to verify it passes

```bash
cd genesis-tools/jd-assistant && npm test -- --testPathPattern=prompts.test.js
```

Expected: PASS

### Step 2.7: Commit

```bash
git add prompts/*.md assistant/tests/prompts.test.js
git commit -m "feat(prompts): add JD-specific prompt templates with inclusive language rules"
```

---

## Task 3: Update prompts.js (Variable Wiring)

**Files:**
- Modify: `assistant/js/prompts.js`
- Test: `assistant/tests/prompts.test.js`

### Step 3.1: Update generatePhase1Prompt to use JD fields

Replace dealership variables with JD variables:

```javascript
export async function generatePhase1Prompt(formData) {
  const template = await loadPromptTemplate(1);
  return replaceTemplateVars(template, {
    JOB_TITLE: formData.jobTitle || '',
    COMPANY_NAME: formData.companyName || '',
    ROLE_LEVEL: formData.roleLevel || '',
    LOCATION: formData.location || '',
    RESPONSIBILITIES: formData.responsibilities || '',
    REQUIRED_QUALIFICATIONS: formData.requiredQualifications || '',
    PREFERRED_QUALIFICATIONS: formData.preferredQualifications || '',
    COMPENSATION_RANGE: formData.compensationRange || '',
    BENEFITS: formData.benefits || '',
    TECH_STACK: formData.techStack || '',
    TEAM_SIZE: formData.teamSize || '',
    AI_SPECIFICS: formData.aiSpecifics || '',
    CAREER_LADDER: formData.careerLadder || '',
    COMPANY_PREAMBLE: formData.companyPreamble || '',
    COMPANY_LEGAL_TEXT: formData.companyLegalText || ''
  });
}
```

### Step 3.2: Update WORKFLOW_CONFIG descriptions

```javascript
export const WORKFLOW_CONFIG = {
  phaseCount: 3,
  phases: [
    {
      number: 1,
      name: 'Initial Draft',
      icon: '📝',
      aiModel: 'Claude',
      aiUrl: 'https://claude.ai/new',
      description: 'Generate initial job description with inclusive language'
    },
    // ... update other phases
  ]
};
```

### Step 3.3: Run tests

```bash
cd genesis-tools/jd-assistant && npm test
```

### Step 3.4: Commit

```bash
git add assistant/js/prompts.js
git commit -m "feat(prompts): wire JD form fields to prompt generation"
```

---

## Task 4: Update Validator (validator.js)

**Files:**
- Modify: `validator/js/validator.js`
- Test: `validator/tests/validator.test.js`

### Step 4.1: Write failing test for inclusive language checks

```javascript
describe('JD Validator - Inclusive Language', () => {
  test('flags masculine-coded words', () => {
    const jd = 'Looking for an aggressive rockstar ninja';
    const result = validateJD(jd);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ type: 'masculine-coded' })
    );
  });

  test('flags extrovert-only signals', () => {
    const jd = 'Must be outgoing and high-energy';
    const result = validateJD(jd);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ type: 'extrovert-bias' })
    );
  });

  test('flags red flag phrases', () => {
    const jd = 'Fast-paced environment, we are like a family';
    const result = validateJD(jd);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ type: 'red-flag' })
    );
  });

  test('does NOT flag company-mandated sections', () => {
    const jd = `
      [COMPANY_PREAMBLE]
      We are an equal opportunity employer...
      [/COMPANY_PREAMBLE]
    `;
    const result = validateJD(jd, { relaxedSections: ['COMPANY_PREAMBLE'] });
    expect(result.warnings).toHaveLength(0);
  });
});
```

### Step 4.2: Implement validation rules

Add word lists and validation logic based on `docs/JD-RESEARCH-2025.md`.

### Step 4.3: Run tests

```bash
cd genesis-tools/jd-assistant && npm test -- --testPathPattern=validator.test.js
```

### Step 4.4: Commit

```bash
git add validator/js/validator.js validator/tests/validator.test.js
git commit -m "feat(validator): add inclusive language and red flag checks"
```

---

## Final Verification

After all tasks complete:

```bash
cd genesis-tools/jd-assistant
npm run lint
npm test
npm run test:coverage
```

Expected:
- Lint: 0 errors
- Tests: All pass
- Coverage: ≥58% (baseline)

---

## Detailed Implementation Content

### Phase 1 Prompt Content (prompts/phase1.md)

```markdown
# Phase 1: Initial Job Description Draft (Claude)

You are an expert technical recruiter and hiring manager creating a job description for a software engineering position.

## Role Information

**Job Title:** {{JOB_TITLE}}
**Company:** {{COMPANY_NAME}}
**Level:** {{ROLE_LEVEL}}
**Location/Remote:** {{LOCATION}}

## Key Responsibilities
{{RESPONSIBILITIES}}

## Required Qualifications
{{REQUIRED_QUALIFICATIONS}}

## Preferred Qualifications
{{PREFERRED_QUALIFICATIONS}}

## Compensation & Benefits
**Range:** {{COMPENSATION_RANGE}}
**Benefits:** {{BENEFITS}}

## Additional Context
**Tech Stack:** {{TECH_STACK}}
**Team:** {{TEAM_SIZE}}
**AI Role Specifics:** {{AI_SPECIFICS}}
**Career Ladder Reference:** {{CAREER_LADDER}}

## Company-Mandated Content
**Preamble (include at start):** {{COMPANY_PREAMBLE}}
**Legal Text (include at end):** {{COMPANY_LEGAL_TEXT}}

---

## ⚠️ CRITICAL: Inclusive Language Rules

### Masculine-Coded Words to AVOID
| ❌ Avoid | ✅ Use Instead |
|----------|----------------|
| Aggressive | Proactive, ambitious |
| Competitive | Motivated, goal-oriented |
| Dominant | Leading, influential |
| Ninja/Rockstar/Guru | Expert, specialist |
| Crushing it | Achieving, delivering |

### Neurodiversity-Inclusive Language
| ❌ Avoid | ✅ Use Instead |
|----------|----------------|
| Strong communicator | Share ideas via writing, visuals, or discussion |
| Team player | Contribute through your strengths |
| Outgoing, high-energy | Flexible work styles welcome |
| Fast-paced | Dynamic projects with clear priorities |

### Red Flag Phrases to AVOID
- "Like a family" → "Supportive, collaborative team"
- "Wear many hats" → "Versatile role with growth opportunities"
- "Always-on/hustle" → "Flexible hours; async work supported"
- "Unlimited PTO" → "20+ PTO days + recharge days"

---

## Output Structure (400-700 words)

1. **Job Title** (standard, searchable)
2. **About the Role** (2-4 sentences, specific impact)
3. **Key Responsibilities** (5-8 bullets, action verbs)
4. **Required Qualifications** (3-6 items, drop years of experience)
5. **Preferred Skills** (4-8 items, "nice to have")
6. **What We Offer** (compensation, benefits, growth)
7. **To Apply** (clear CTA)

Include: "If you meet 60-70% of these qualifications, we encourage you to apply."

Generate the job description now.
```

### Phase 2 Prompt Content (prompts/phase2.md)

```markdown
# Phase 2: Adversarial Review (Gemini)

You are a DEI consultant and candidate experience expert reviewing a job description for inclusivity and effectiveness.

## The Job Description to Review

{{PHASE1_OUTPUT}}

---

## Your Critical Review Checklist

### 1. Inclusive Language Audit
Scan for and FLAG any:
- Masculine-coded words: aggressive, competitive, dominant, ninja, rockstar
- Extrovert-bias: outgoing, high-energy, strong communicator
- Ableist language: fast-paced without context

### 2. Red Flag Detection
FLAG if present:
- "Like a family" (boundary issues)
- "Wear many hats" (understaffed signal)
- "Fast-paced environment" without work-life context
- Unrealistic requirement combos (10+ years in 5-year-old tech)
- Vague responsibilities ("various tasks")

### 3. Requirements Reasonableness
- Are there too many "required" items? (should be 3-6)
- Are years of experience specified? (prefer ranges or drop)
- Is there a "60-70% encouragement" statement?

### 4. Compensation Transparency
- Is salary range included?
- Is the range reasonable (30-50% spread)?
- Are key benefits highlighted?

### 5. Structure & Clarity
- Is it 400-700 words?
- Is the structure ATS-friendly?
- Are responsibilities specific and measurable?

---

## Output Format

Provide your critique in this format:

### 🚨 Critical Issues (Must Fix)
[List issues that would repel candidates or violate best practices]

### ⚠️ Warnings (Should Address)
[List suboptimal patterns]

### ✅ Strengths
[What's working well]

### 📝 Suggested Revision
[Provide a complete revised JD incorporating all fixes]
```

### Phase 3 Prompt Content (prompts/phase3.md)

```markdown
# Phase 3: Final Synthesis (Claude)

You are synthesizing a job description from an initial draft and adversarial review.

## Initial Draft (Phase 1)
{{PHASE1_OUTPUT}}

## Adversarial Review (Phase 2)
{{PHASE2_OUTPUT}}

---

## Your Task

Create the FINAL job description that:

1. **Incorporates all valid critique** from the adversarial review
2. **Preserves strong elements** from the initial draft
3. **Maintains inclusive language** throughout
4. **Follows the optimal structure** (400-700 words)

## Final Checklist Before Output

- [ ] Zero masculine-coded words (ninja, rockstar, aggressive, etc.)
- [ ] Zero extrovert-only signals (outgoing, high-energy as requirements)
- [ ] Zero red flag phrases (like a family, wear many hats, fast-paced without context)
- [ ] 3-6 required qualifications (not inflated)
- [ ] Includes "60-70% encouragement" statement
- [ ] Salary range is included and reasonable
- [ ] 400-700 words total
- [ ] Clear, specific responsibilities
- [ ] Company preamble/legal preserved exactly

Generate the final, polished job description now.
```

### Validator Word Lists (validator/js/validator.js)

```javascript
// Masculine-coded words (research: Textio, Applied)
const MASCULINE_CODED = [
  'aggressive', 'ambitious', 'analytical', 'assertive', 'athletic',
  'autonomous', 'boast', 'champion', 'competitive', 'confident',
  'courageous', 'decisive', 'determined', 'dominant', 'driven',
  'fearless', 'fight', 'force', 'greedy', 'headstrong', 'hierarchical',
  'hostile', 'impulsive', 'independent', 'individual', 'intellectual',
  'lead', 'logic', 'ninja', 'objective', 'opinion', 'outspoken',
  'persist', 'principle', 'reckless', 'rockstar', 'self-confident',
  'self-reliant', 'self-sufficient', 'stubborn', 'superior', 'unreasonable'
];

// Extrovert-bias words
const EXTROVERT_BIAS = [
  'outgoing', 'high-energy', 'energetic', 'people person', 'gregarious',
  'strong communicator', 'excellent verbal', 'team player', 'social butterfly'
];

// Red flag phrases
const RED_FLAGS = [
  'fast-paced', 'like a family', 'wear many hats', 'always-on',
  'hustle', 'grind', 'unlimited pto', 'work hard play hard',
  'hit the ground running', 'self-starter', 'thick skin',
  'no ego', 'drama-free', 'whatever it takes'
];

export function validateJD(text, options = {}) {
  const warnings = [];
  const { relaxedSections = [] } = options;

  // Extract non-relaxed content
  let contentToCheck = text;
  for (const section of relaxedSections) {
    const regex = new RegExp(`\\[${section}\\][\\s\\S]*?\\[\\/${section}\\]`, 'gi');
    contentToCheck = contentToCheck.replace(regex, '');
  }

  const lowerContent = contentToCheck.toLowerCase();

  // Check masculine-coded
  for (const word of MASCULINE_CODED) {
    if (lowerContent.includes(word)) {
      warnings.push({
        type: 'masculine-coded',
        word,
        suggestion: getMasculineSuggestion(word)
      });
    }
  }

  // Check extrovert-bias
  for (const phrase of EXTROVERT_BIAS) {
    if (lowerContent.includes(phrase)) {
      warnings.push({
        type: 'extrovert-bias',
        phrase,
        suggestion: getExtrovertSuggestion(phrase)
      });
    }
  }

  // Check red flags
  for (const phrase of RED_FLAGS) {
    if (lowerContent.includes(phrase)) {
      warnings.push({
        type: 'red-flag',
        phrase,
        suggestion: getRedFlagSuggestion(phrase)
      });
    }
  }

  return { warnings, valid: warnings.length === 0 };
}
```

---

---

## 📋 Execution Log

> Update this section as tasks are completed.

### Completed Tasks

_(None yet)_

### Blockers & Decisions

| Date | Issue | Decision/Resolution |
|------|-------|---------------------|
| _(none yet)_ | | |

### Files Modified

_(Track all files changed during execution)_

```
# Will be populated as work progresses
```

### Test Results History

| Date | Tests | Passing | Coverage | Notes |
|------|-------|---------|----------|-------|
| 2026-02-04 | 286 | 286 | 58.55% | Baseline before implementation |

---

## Execution Ready

Plan complete and saved to `docs/plans/2026-02-04-jd-assistant-implementation.md`.

**Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
