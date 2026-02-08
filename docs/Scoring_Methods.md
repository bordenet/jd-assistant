# JD Assistant Scoring Methods

This document describes the scoring methodology used by the Job Description Validator.

## Overview

Unlike other genesis tools, the JD Validator uses a **deduction-based scoring system**. Documents start at 100 points, with penalties applied for inclusive language violations, red flags, and structural issues.

## Scoring Model: Deduction-Based

| Category | Maximum Penalty | Purpose |
|----------|-----------------|---------|
| **Word Count** | -15 pts | Length optimization (400-700 ideal) |
| **Masculine-Coded Words** | -25 pts | Gender-inclusive language |
| **Extrovert-Bias Phrases** | -20 pts | Neurodiversity inclusion |
| **Red Flag Phrases** | -25 pts | Culture/work-life balance signals |
| **Compensation Range** | -10 pts | Pay transparency (external only) |
| **Encouragement Statement** | -5 pts | Applicant confidence boost |
| **AI Slop** | -5 pts | Authenticity check |

## Category Details

### 1. Word Count (-15 pts max)

**Optimal Range:** 400-700 words

| Word Count | Penalty | Feedback |
|------------|---------|----------|
| 400-700 | 0 | ✅ Good length |
| < 400 | -1 per 20 words below | ⚠️ Too short |
| > 700 | -1 per 50 words above | ⚠️ Too long |

### 2. Masculine-Coded Words (-25 pts max)

**Penalty:** -5 pts per word (max -25)

**Flagged Words:**
- aggressive, ambitious, assertive, competitive, confident
- decisive, determined, dominant, driven, fearless
- independent, ninja, rockstar, guru, self-reliant
- leader, go-getter, hard-charging, strong, tough
- warrior, superhero, superstar, boss

**Research Basis:** Gaucher et al. (2011) JPSP, Textio research

### 3. Extrovert-Bias Phrases (-20 pts max)

**Penalty:** -5 pts per phrase (max -20)

**Flagged Phrases:**
- outgoing, high-energy, energetic, people person
- gregarious, strong communicator, excellent verbal, team player

**Research Basis:** Deloitte neurodiversity research

**Adversarial Fix:** Handles hyphen/space variations (e.g., "high-energy" vs "high energy")

### 4. Red Flag Phrases (-25 pts max)

**Penalty:** -5 pts per phrase (max -25)

**Flagged Phrases:**
- fast-paced, like a family, wear many hats, always-on
- hustle, grind, unlimited pto, work hard play hard
- hit the ground running, self-starter, thick skin
- no ego, drama-free, whatever it takes, passion required

**Research Basis:** Glassdoor, Blind, LinkedIn data

### 5. Compensation Range (-10 pts)

**Required for external postings only.** Internal postings skip this check.

**Detection Patterns:**
```javascript
// US Dollar formats
/\$[\d,]+\s*[-–—]\s*\$[\d,]+/
/salary.*\$[\d,]+/
// International formats (adversarial fix)
/[\d,]+\s*[-–—]\s*[\d,]+\s*(USD|EUR|GBP|CAD|AUD)/
/[€£][\d,]+\s*[-–—]\s*[€£][\d,]+/
```

### 6. Encouragement Statement (-5 pts)

**Required Pattern:** Statement encouraging applicants who meet 60-70% of qualifications.

**Detection:**
```javascript
/60[-–]70%|meet.*most.*(requirements|qualifications)|we\s+encourage.*apply|don't.*meet.*all.*(qualifications|requirements)/i
```

**Adversarial Fix:** Requires "qualifications" or "requirements" context to prevent gaming.

### 7. AI Slop Detection (-5 pts max)

**Penalty:** min(5, floor(slopPenalty * 0.6))

**Purpose:** Flag AI-generated language patterns that signal inauthenticity.

## Special Features

### Company Mandated Sections

JDs can mark non-editable company-required text:

```markdown
[COMPANY_PREAMBLE]
Standard company boilerplate here...
[/COMPANY_PREAMBLE]

[COMPANY_LEGAL_TEXT]
EEO statement, legal disclaimers...
[/COMPANY_LEGAL_TEXT]
```

Flagged words within these sections are **not penalized**.

### Internal vs External Postings

Internal postings are detected via:
- Explicit `postingType: 'internal'` parameter
- `**INTERNAL POSTING**` in text
- "internal posting" phrase

Internal postings skip compensation range check.

## Adversarial Robustness

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| "60-70%" without qualification context | Pattern requires "qualifications" or "requirements" |
| "high energy" (no hyphen) | Flexible pattern matches hyphen/space variations |
| Currency without $ symbol | International currency patterns added |
| Flagged words in legal boilerplate | COMPANY_LEGAL_TEXT exclusion zones |

## Score Interpretation

| Score Range | Grade | Interpretation |
|-------------|-------|----------------|
| 90-100 | A | Excellent - inclusive, transparent, authentic |
| 80-89 | B | Good - minor language adjustments needed |
| 70-79 | C | Fair - review flagged phrases |
| 60-69 | D | Poor - significant inclusivity gaps |
| 0-59 | F | Failing - major rewrite needed |

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/slop-detection.js` - AI slop detection
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)

