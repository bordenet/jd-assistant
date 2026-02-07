# Phase 1: Initial Job Description Draft (Claude Sonnet 4.5)

You are an expert technical recruiter and hiring manager creating an inclusive, AI-optimized job description for a software engineering position.

<output_rules>
Output ONLY the final job description in markdown format.
- NO preambles ("Here's the job description...", "I've created...")
- NO sign-offs ("Let me know if...", "Feel free to...")
- NO markdown code fences (```) around the output
- Begin directly with # [Job Title]
Violations make the output unusable. This is copy-paste ready output.
</output_rules>

## Role Information

**Job Title:** {{JOB_TITLE}}
**Company:** {{COMPANY_NAME}}
**Level:** {{ROLE_LEVEL}}
**Location/Remote:** {{LOCATION}}
**Posting Type:** {{POSTING_TYPE}}

## Key Responsibilities
{{RESPONSIBILITIES}}

## Required Qualifications
{{REQUIRED_QUALIFICATIONS}}

## Preferred Qualifications
{{PREFERRED_QUALIFICATIONS}}

## Compensation & Benefits
**Range:** {{COMPENSATION_RANGE}}
**Benefits:** {{BENEFITS}}

> ⚠️ **INTERNAL POSTING NOTE:** If the Posting Type above is "internal", do NOT include compensation range or benefits details in the job description. Internal candidates already have access to this information through company systems. Skip the "What We Offer" section entirely or limit it to non-compensation items like career growth opportunities.

## Additional Context
**Tech Stack:** {{TECH_STACK}}
**Team Size/Structure:** {{TEAM_SIZE}}
**AI Role Specifics:** {{AI_SPECIFICS}}
**Career Ladder Reference:** {{CAREER_LADDER}}

## Company Information
**Preamble/EEO Statement:** {{COMPANY_PREAMBLE}}
**Legal Text:** {{COMPANY_LEGAL_TEXT}}

## Your Task

Generate a comprehensive, inclusive job description (400-700 words) that attracts qualified candidates and reflects modern best practices.

---

## ⚠️ CRITICAL: Inclusive Language Rules

### Rule 1: Avoid Masculine-Coded Words

These words unconsciously signal "male-dominated" and reduce applications from women and non-binary candidates.

**BANNED WORDS (from Textio/GenderDecoder research):**
aggressive, ambitious, assertive, competitive, confident, decisive, determined, dominant, driven, fearless, independent, ninja, rockstar, guru, self-reliant, self-sufficient, superior, leader, go-getter, hard-charging, strong, tough, warrior, superhero, superstar, boss

**Use instead:** collaborative, supportive, adaptable (with specifics), team-focused, experienced, skilled, capable, proactive, goal-oriented

### Rule 2: Avoid Extrovert-Bias Phrases

**BANNED PHRASES (exclude introverts/neurodivergent):**
outgoing, high-energy, energetic, people person, gregarious, strong communicator, excellent verbal, team player, social butterfly, thrives in ambiguity, flexible (without specifics), adaptable (without specifics)

**Use instead:** "structured workflow with clear priorities", "detailed documentation", "clear processes", "flexibility in work location/schedule" (specific)

### Rule 3: Avoid Red Flag Phrases

**BANNED PHRASES (signal toxic culture):**
fast-paced, like a family, wear many hats, always-on, hustle, grind, unlimited pto, work hard play hard, hit the ground running, self-starter, thick skin, no ego, drama-free, whatever it takes, passion required, young dynamic team, work family, family first, 10x engineer, bro culture, party hard

**Use instead:** "supportive team culture", "40-hour weeks", "structured environment", "collaborative team"

### Rule 4: Specificity & Clarity

✅ **ALWAYS provide:**

- **Concrete responsibilities**: "Own the authentication service and ship 2 features per quarter"
- **Measurable requirements**: "3+ years with Python" not "strong Python skills"
- **Clear compensation**: "$170,000 - $220,000 base salary"
- **Specific tech stack**: "Python, React, PostgreSQL" not "modern tech stack"
- **Defined team structure**: "8-person backend team reporting to VP Engineering"

---

## Job Description Structure (400-700 words)

Create a well-structured job description with these sections:

```markdown
# {{JOB_TITLE}}

## About the Role
2-4 sentences describing the role's impact and context. Be specific about what success looks like.

## Key Responsibilities
5-8 bullet points with action verbs. Use concrete outcomes, not vague duties.
- Own [specific system/feature] and ship [X features/quarter]
- Mentor [X junior engineers] on [specific skill]
- Collaborate with [specific teams] to [concrete outcome]

## Required Qualifications
3-6 items. Focus on skills, not years. Drop "years of experience" unless critical.
- [X years] experience with [specific technology]
- Proficiency in [language/framework]
- Experience with [specific domain/pattern]

## Preferred Qualifications
4-8 items. These are "nice to have", not required.
- Open source contributions
- Experience with [adjacent technology]
- Familiarity with [domain]

## What We Offer
- **Compensation:** {{COMPENSATION_RANGE}} base salary
- **Benefits:** {{BENEFITS}}
- **Growth:** {{CAREER_LADDER}}
- **Team:** {{TEAM_SIZE}}

## Other
If there is additional context that doesn't fit cleanly into the sections above (e.g., role purpose, team mission, unique aspects of the position, working environment details), find a logical place to include an "Other" section. This section should capture any important information that would help candidates understand the role but doesn't belong in the standard sections.

## To Apply
Clear call-to-action. Include:
- How to apply (link, email)
- Timeline (when you'll hear back)
- **Important:** "If you meet 60-70% of these qualifications, we encourage you to apply."

## [Optional] About {{COMPANY_NAME}}
Brief company context if relevant.
```

### ⚠️ CRITICAL: De-Duplication Rule

**Redundant job descriptions look unprofessional to candidates.** Before finalizing:

1. **Review all sections for duplicate content** - The same information should NOT appear in multiple sections
2. **Consolidate overlapping content** - If "About the Role" mentions responsibilities, don't repeat them in "Key Responsibilities"
3. **Each section has a unique purpose** - Don't pad sections by restating content from other sections
4. **Tech stack appears ONCE** - Either in responsibilities OR qualifications, not both
5. **Benefits appear ONCE** - In "What We Offer" only, not scattered throughout

---

## Self-Check Before Output

Before providing your response, verify:

- [ ] Zero masculine-coded words (aggressive, ninja, rockstar, etc.)
- [ ] Zero neurodiversity-excluding language (fast-paced, self-starter, etc.)
- [ ] Zero red flag phrases (like a family, passion required, etc.)
- [ ] All responsibilities are concrete and measurable
- [ ] All required qualifications are specific (not "strong X skills")
- [ ] Compensation range is included and reasonable (30-50% spread) **← SKIP FOR INTERNAL POSTINGS**
- [ ] 400-700 words total
- [ ] Includes "If you meet 60-70% of qualifications, we encourage you to apply"
- [ ] Company preamble and legal text preserved exactly as provided
- [ ] **NO DUPLICATE CONTENT** - Each section has unique content; no redundancy between sections

---

Generate the job description now. Begin directly with # [Job Title]. No preambles, no commentary.
