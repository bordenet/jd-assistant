# ADVERSARIAL REVIEW: jd-assistant

## CONTEXT

You are an expert prompt engineer performing an **ADVERSARIAL review** of LLM prompts for a Job Description assistant tool. This tool generates inclusive, AI-optimized job descriptions that attract diverse candidates.

This tool uses a **3-phase LLM chain** plus **dual scoring systems**:
1. **Phase 1 (Claude)** - Generates initial JD draft with inclusive language
2. **Phase 2 (Gemini)** - Reviews for bias and red flags
3. **Phase 3 (Claude)** - Synthesizes final JD
4. **LLM Scoring (prompts.js)** - Sends JD to LLM for evaluation
5. **JavaScript Scoring (validator.js)** - Deterministic regex/pattern matching

---

## ⚠️ CRITICAL ALIGNMENT CHAIN

These 5 components **MUST be perfectly aligned**:

| Component | Purpose | Risk if Misaligned |
|-----------|---------|-------------------|
| phase1.md | Generates JD | LLM uses banned words validator doesn't catch |
| phase2.md | Reviews for bias | Different banned word lists |
| phase3.md | Final synthesis | Quality gate doesn't match validator |
| prompts.js | LLM scoring rubric | Scores dimensions validator doesn't check |
| validator.js | JavaScript scoring | Misses patterns prompts.js penalizes |

---

## CURRENT TAXONOMY (4 dimensions, 100 pts total)

| Dimension | prompts.js | validator.js | Weight Description |
|-----------|------------|--------------|-------------------|
| Length | 25 pts | 25 pts | Optimal 400-700 words |
| Inclusivity | 25 pts | 25 pts | No masculine-coded, no extrovert-bias |
| Culture | 25 pts | 25 pts | No red flag phrases, no AI slop |
| Transparency | 25 pts | 25 pts | Compensation range, encouragement statement |

---

## COMPONENT 1: phase1.md (Claude - Initial Draft)

See: `shared/prompts/phase1.md` (137 lines)

**Key Elements:**

### Rule 1: Banned Masculine-Coded Words
aggressive, ambitious, assertive, competitive, confident, decisive, determined, dominant, driven, fearless, independent, ninja, rockstar, guru, self-reliant, self-sufficient, superior, leader, go-getter, hard-charging, strong, tough, warrior, superhero, superstar, boss

### Rule 2: Banned Extrovert-Bias Phrases
outgoing, high-energy, energetic, people person, gregarious, strong communicator, excellent verbal, team player, social butterfly, thrives in ambiguity, flexible (without specifics), adaptable (without specifics)

### Rule 3: Banned Red Flag Phrases
fast-paced, like a family, wear many hats, always-on, hustle, grind, unlimited pto, work hard play hard, hit the ground running, self-starter, thick skin, no ego, drama-free, whatever it takes, passion required, young dynamic team, work family, family first, 10x engineer, bro culture, party hard

---

## COMPONENT 4: prompts.js (LLM Scoring Rubric)

See: `validator/js/prompts.js` (222 lines)

**Scoring Rubric:**

### 1. Length (25 points max)
- Optimal (25 pts): 400-700 words
- Too Short: -1 pt per 20 words below 400 (max -15)
- Too Long: -1 pt per 50 words above 700 (max -10)

### 2. Inclusivity (25 points max)
- Masculine-coded words: -5 pts each (max -25)
- Extrovert-bias phrases: -5 pts each (max -20)

### 3. Culture (25 points max)
- Red flag phrases: -5 pts each (max -25)
- AI slop patterns: -1 to -5 pts

### 4. Transparency (25 points max)
- Compensation: -10 pts if missing (except internal postings)
- Encouragement: -5 pts if missing "60-70% of qualifications" statement

---

# YOUR ADVERSARIAL REVIEW TASK

## SPECIFIC QUESTIONS TO ANSWER

### 1. BANNED WORD ALIGNMENT
Do the banned word lists in phase1.md match validator.js EXACTLY?

| Category | phase1.md Count | validator.js Count | Match? |
|----------|-----------------|-------------------|--------|
| Masculine-coded | 27 words | ? | ? |
| Extrovert-bias | 12 phrases | ? | ? |
| Red flag | 21 phrases | ? | ? |

### 2. WORD COUNT DETECTION
Does validator.js correctly implement the length scoring?
- 400-700 words = 25 pts
- Below 400: -1 per 20 words
- Above 700: -1 per 50 words

### 3. INTERNAL POSTING HANDLING
Phase1.md has an internal posting note. Does validator.js:
- ✅ Accept `postingType` parameter?
- ✅ Skip compensation penalty for internal postings?

### 4. ENCOURAGEMENT STATEMENT
prompts.js deducts 5 pts if missing. Does validator.js detect:
- "60-70% of qualifications" language?
- Alternative encouragement patterns?

Look for: `60.*70`, `percent`, `qualif`, `encouraged`

### 5. AI SLOP DETECTION
Does validator.js import and apply slop penalties for:
- Vague platitudes?
- Repetitive phrasing?
- Hollow specificity?

```bash
grep -n "getSlopPenalty\|calculateSlopScore\|slop" validator.js
```

---

## DELIVERABLES

### 1. CRITICAL FAILURES
For each issue: Issue, Severity, Evidence, Fix

### 2. BANNED WORD VERIFICATION TABLE
| Word/Phrase | In phase1.md | In validator.js | Gap? |

### 3. GAMING VULNERABILITIES
- Writing exactly 401 words to hit minimum
- Using synonyms of banned words
- Mentioning "compensation discussed during interview"

### 4. RECOMMENDED FIXES (P0/P1/P2)

---

**VERIFY CLAIMS. Evidence before assertions.**

