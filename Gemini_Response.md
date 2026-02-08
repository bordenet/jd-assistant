# JD Assistant - Gemini Adversarial Review Response

# JD Assistant - Adversarial Alignment Review

You are a security researcher performing adversarial analysis on an AI-assisted job description generation tool. Your task is to find **misalignments** between the user-facing prompts and the JavaScript validator that scores the output.

## CONTEXT

JD Assistant helps users write inclusive job descriptions. It uses:
1. **phase1.md** - User-facing prompt that Claude uses to draft the JD
2. **prompts.js** - LLM scoring prompt used by the validator
3. **validator.js** - JavaScript scorer that assigns the actual 0-100 score

A "misalignment" is when a pattern is:
- **Requested in phase1.md** but NOT scored in validator.js
- **Scored in validator.js** but NOT explained in prompts.js
- **Detected differently** between LLM prompt and JS regex

---

## PHASE1.MD - USER INSTRUCTIONS (what users see)

```markdown
# Phase 1: Initial Job Description Draft

You are an expert technical recruiter creating an inclusive, AI-optimized job description.

## Role Information
- Job Title, Company, Level, Location, Posting Type

## ⚠️ CRITICAL: Inclusive Language Rules

### Rule 1: Avoid Masculine-Coded Words
BANNED: aggressive, ambitious, assertive, competitive, confident, decisive, determined, dominant, driven, fearless, independent, ninja, rockstar, guru, self-reliant, self-sufficient, superior

### Rule 2: Avoid Extrovert-Bias Phrases  
BANNED: outgoing, high-energy, energetic, people person, gregarious, strong communicator, excellent verbal, team player

### Rule 3: Avoid Red Flag Phrases
BANNED: fast-paced, like a family, wear many hats, always-on, hustle, grind, unlimited pto, work hard play hard, hit the ground running, self-starter, thick skin, no ego, drama-free, whatever it takes, passion required

### Rule 4: Specificity & Clarity
- Concrete responsibilities, measurable requirements
- Clear compensation: "$170,000 - $220,000 base salary"
- Includes "If you meet 60-70% of qualifications, we encourage you to apply"

## Job Description Structure (400-700 words)
- # Job Title
- ## About the Role
- ## Key Responsibilities  
- ## Required Qualifications
- ## Preferred Qualifications
- ## What We Offer
- ## To Apply
```

---

## PROMPTS.JS - LLM SCORING RUBRIC

```javascript
## SCORING RUBRIC (100 points total)

### 1. Length (25 points max)
- Optimal (25 pts): 400-700 words
- Too Short: Deduct 1 pt per 20 words below 400 (max -15)
- Too Long: Deduct 1 pt per 50 words above 700 (max -10)

### 2. Inclusivity (25 points max)
- Masculine-coded words (-5 pts each, max -25): aggressive, ambitious, assertive, competitive, confident, decisive, determined, dominant, driven, fearless, independent, ninja, rockstar, guru, self-reliant, self-sufficient, superior
- Extrovert-bias phrases (-5 pts each, max -20): outgoing, high-energy, energetic, people person, gregarious, strong communicator, excellent verbal, team player

### 3. Culture (25 points max)
- Red flag phrases (-5 pts each, max -25): fast-paced, like a family, wear many hats, always-on, hustle, grind, unlimited pto, work hard play hard, hit the ground running, self-starter, thick skin, no ego, drama-free, whatever it takes, passion required
- AI slop patterns (-1 to -5 pts): Vague platitudes, repetitive phrasing, hollow specificity

### 4. Transparency (25 points max)
- Compensation (-10 pts): Deduct 10 if no salary range
- Encouragement (-5 pts): Deduct 5 if missing "60-70% of qualifications" encouragement statement
```

---

## VALIDATOR.JS - JAVASCRIPT SCORER

```javascript
// Word lists
const MASCULINE_CODED = [
  'aggressive', 'ambitious', 'assertive', 'competitive', 'confident',
  'decisive', 'determined', 'dominant', 'driven', 'fearless',
  'independent', 'ninja', 'rockstar', 'guru', 'self-reliant',
  'self-sufficient', 'superior'
];

const EXTROVERT_BIAS = [
  'outgoing', 'high-energy', 'energetic', 'people person', 'gregarious',
  'strong communicator', 'excellent verbal', 'team player'
];

const RED_FLAGS = [
  'fast-paced', 'like a family', 'wear many hats', 'always-on',
  'hustle', 'grind', 'unlimited pto', 'work hard play hard',
  'hit the ground running', 'self-starter', 'thick skin',
  'no ego', 'drama-free', 'whatever it takes', 'passion required'
];

// Length scoring (lines 33-46)
const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
if (wordCount >= 400 && wordCount <= 700) {
  // Full points
} else if (wordCount < 400) {
  const penalty = Math.min(15, Math.floor((400 - wordCount) / 20));
} else {
  const penalty = Math.min(10, Math.floor((wordCount - 700) / 50));
}

// Masculine-coded (-5 each, max -25)
const masculineCount = jdValidation.warnings.filter(w => w.type === 'masculine-coded').length;
const penalty = Math.min(25, masculineCount * 5);

// Extrovert-bias (-5 each, max -20)  
const extrovertCount = jdValidation.warnings.filter(w => w.type === 'extrovert-bias').length;
const penalty = Math.min(20, extrovertCount * 5);

// Red flags (-5 each, max -25)
const redFlagCount = jdValidation.warnings.filter(w => w.type === 'red-flag').length;
const penalty = Math.min(25, redFlagCount * 5);

// Compensation check (lines 82-96)
const hasCompensation = /\$[\d,]+\s*[-–—]\s*\$[\d,]+/i.test(text) ||
                        /salary.*\$[\d,]+/i.test(text) ||
                        /compensation.*\$[\d,]+/i.test(text) ||
                        /\$[\d,]+k?\s*[-–—]\s*\$[\d,]+k?/i.test(text);
// -10 pts if missing (external only)

// Encouragement check (line 100)
const hasEncouragement = /60[-–]70%|60\s*[-–]\s*70\s*%|60\s+to\s+70\s*%|meet.*most.*requirements|we\s+encourage.*apply|don't.*meet.*all/i.test(text);
// -5 pts if missing

// AI slop penalty (lines 111-125)
const slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
```

---

## YOUR TASK

Find misalignments between these three components. For each finding:

1. **STATE THE MISALIGNMENT** - What's inconsistent?
2. **PROVIDE EVIDENCE** - Quote specific lines from each source
3. **SHOW EXPLOIT** - How could a user game the system?
4. **RATE SEVERITY** - Critical/High/Medium/Low

---

## ALIGNMENT QUESTIONS TO ANSWER

1. **Word Count Boundary**: Does the JS exactly match the "400-700 words" target? Are edge cases (399, 401, 699, 701) handled consistently?

2. **Masculine-Coded Word List**: Are all 17 words in MASCULINE_CODED identical to phase1.md and prompts.js? Any missing or extra?

3. **Extrovert-Bias List**: Are all 8 phrases in EXTROVERT_BIAS identical across all three sources?

4. **Red Flag List**: Are all 15 phrases in RED_FLAGS identical? Do regex patterns handle hyphenation and spacing correctly?

5. **Compensation Detection**: Does the regex catch all reasonable salary formats? What about:
   - "$150K - $200K" (K notation)
   - "150,000 to 200,000" (no dollar sign)
   - "Competitive salary" (vague)

6. **Encouragement Detection**: The regex has multiple patterns. Does it match all reasonable variations like "meet 60-70 percent" or "if you meet most of the qualifications"?

7. **Internal Posting Detection**: Phase1.md mentions "INTERNAL POSTING NOTE" - is this detection reliable in validator.js?

8. **De-Duplication Rule**: Phase1.md has a "De-Duplication Rule" but is there any JS scoring for redundant content?

9. **Section Structure**: Phase1.md specifies required sections (About the Role, Key Responsibilities, etc.) but does JS score for section presence?

---

## DELIVERABLES

For each misalignment found:

```
### Finding [A/B/C...]: [Short Title]

**Misalignment Type**: [Pattern not scored | Pattern not explained | Regex mismatch | Logic gap]

**Evidence**:
- phase1.md line [X]: "[quote]"
- prompts.js line [X]: "[quote]"  
- validator.js line [X]: "[quote]"

**Exploit Example**: 
[Show specific input that would pass JS but fail the intent of phase1.md]

**Severity**: [Critical/High/Medium/Low]

**Recommendation**: [How to fix]
```

Be thorough. Look for edge cases. Consider adversarial inputs.

<!-- PASTE GEMINI RESPONSE BELOW THIS LINE -->

As a security researcher performing an adversarial analysis of the **JD Assistant**, I have identified several critical de-syncs between the user-facing instructions and the underlying validation logic. These gaps allow for "document theater"—where a user or the AI can produce a JD that looks compliant but fails the strategic intent of inclusivity and transparency.

---

### Finding A: The "K" Notation Compensation Gap

**Misalignment Type**: Regex mismatch / Pattern not explained

**Evidence**:

* **phase1.md**: Instructs users to use full numbers: `"$170,000 - $220,000 base salary"`
* **prompts.js**: Mentions generic "salary range" but no specific regex guidance.
* **validator.js**: `/\$[\d,]+k?\s*[-–—]\s*\$[\d,]+k?/i`

**Exploit Example**:
The JS validator explicitly allows "K" notation (`$150k - $200k`), but the `phase1.md` instructions imply that full numerical strings are the standard. More importantly, if a user writes **"Salary: 150,000 - 200,000 USD"** (omitting the `$` sign), the validator will trigger a **-10 point penalty** because the regex strictly requires a literal `$` or the specific words "salary" or "compensation" followed immediately by a `$`.

**Severity**: High

**Recommendation**: Update `validator.js` to support currency-agnostic numerical ranges and ensure `phase1.md` informs the user that the `$` symbol is a mandatory trigger for the scorer.

---

### Finding B: Missing Section Structure Validation

**Misalignment Type**: Pattern not scored

**Evidence**:

* **phase1.md**: Explicitly lists 7 required sections: `## About the Role`, `## Key Responsibilities`, etc.
* **prompts.js**: No mention of section-based scoring.
* **validator.js**: **Zero logic** exists to check for heading presence or section order.

**Exploit Example**:
A user can generate a 500-word block of unformatted text with no "Responsibilities" or "Qualifications" headers. Claude (Phase 1) will try to follow the structure, but if it fails or hallucinates a different format, the **Validator will award 100% of the structure points** (within the length category) because it only counts words, not sections.

**Severity**: Medium

**Recommendation**: Add a `REQUIRED_HEADERS` array to `validator.js` and deduct 2 points for every missing mandatory section.

---

### Finding C: The "60-70%" Semantic Loophole

**Misalignment Type**: Regex mismatch / Logic gap

**Evidence**:

* **phase1.md**: Requires the specific phrase: `"If you meet 60-70% of qualifications, we encourage you to apply"`
* **validator.js**: `/60[-–]70%|...|meet.*most.*requirements|...|don't.*meet.*all/i`

**Exploit Example**:
The regex is overly permissive. A user can write: **"We usually don't meet all our goals, but we still apply ourselves."** The phrase `don't.*meet.*all` will trigger a "Pass" for the encouragement check, even though the sentence has nothing to do with encouraging under-represented candidates to apply.

**Severity**: High

**Recommendation**: Narrow the regex to require the presence of both a percentage/quantity AND an encouragement verb (apply, join, consider) in the same sentence.

---

### Finding D: Word List De-Sync (Masculine-Coded)

**Misalignment Type**: Logic gap / List Mismatch

**Evidence**:

* **phase1.md**: Lists 17 words.
* **validator.js**: `const MASCULINE_CODED` contains exactly those 17 words.
* **The Gap**: The validator uses a simple array check, likely checking for exact matches. Technical JDs often use "Independent" in a non-coded way (e.g., "Independent Software Vendor").

**Exploit Example**:
Because the JS uses `jdValidation.warnings.filter`, if the underlying detection engine is case-sensitive or doesn't handle pluralization (e.g., "ninjas" or "rockstars"), a user can bypass the **-5 point penalty** simply by pluralizing the banned words.

**Severity**: Medium

**Recommendation**: Ensure `validator.js` uses word-boundary regex (`\bninja\b`) and handles plural suffixes to prevent simple bypasses.

---

### Finding E: Red Flag Hyphenation Failure

**Misalignment Type**: Regex mismatch

**Evidence**:

* **phase1.md**: `fast-paced`, `work hard play hard`.
* **validator.js**: `RED_FLAGS` contains string literals.

**Exploit Example**:
If a user writes **"fast paced"** (no hyphen) or **"work-hard-play-hard"** (all hyphens), the string literal match in `validator.js` will fail to detect the phrase. The user avoids the **-5 point penalty** while keeping the "toxic" culture descriptor.

**Severity**: High

**Recommendation**: Use regex for all phrases in the `RED_FLAGS` array to account for optional hyphens and variable whitespace: `fast[- ]paced`.

---

### Finding F: De-Duplication and "AI Slop"

**Misalignment Type**: Pattern not explained / Logic gap

**Evidence**:

* **phase1.md**: Mentions a "De-Duplication Rule."
* **validator.js**: `const slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));`

**Exploit Example**:
The "AI Slop" penalty is invisible to the user. `phase1.md` doesn't explain what "slop" is, but `validator.js` applies a penalty based on a `slopPenalty` object not defined in the provided snippets. If the AI generates "passionate" multiple times (a common LLM trait), the user will be penalized without ever having been told that "passion" or "repetitive phrasing" is a scored metric.

**Severity**: Medium

**Recommendation**: Explicitly list "AI Slop" criteria (e.g., max occurrences of specific adjectives) in `phase1.md` so the user knows what to edit out.

---

### Final Alignment Summary

| Component | Word Count | Inclusivity | Transparency | Aligned? |
| --- | --- | --- | --- | --- |
| **phase1.md** | 400-700 | 40+ banned terms | Salary + 60% rule | **Partial** |
| **prompts.js** | Matches | Matches | Matches | **Yes** |
| **validator.js** | Matches | **No (Regex gaps)** | **No (Salary `$` requirement)** | **No** |

**Would you like me to generate the corrected Regex patterns for the `RED_FLAGS` and `Compensation` checks to close these exploits?**

