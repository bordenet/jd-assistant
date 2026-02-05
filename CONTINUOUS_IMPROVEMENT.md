# JD Assistant — Continuous Improvement Log

> **Purpose**: Track friction points, failures, and lessons learned during development.
> **Goal**: Feed improvements back into genesis toolset.

---

## Critical Failures

### 2026-02-05: Wrong Validator Scoring Dimensions

**Severity**: CRITICAL
**Status**: FIXED (commit 69b8007)

**What Happened**:
The `validator/js/validator.js` file contains TWO validation functions:
1. `validateDocument()` — Generic document validation (headings, paragraphs, code blocks)
2. `validateJDContent()` — JD-specific validation (masculine-coded words, extrovert-bias, red flags)

The generic `validateDocument()` function was copied from the One-Pager template and checks for:
- Document length (word count)
- Headings/structure
- Paragraphs
- Lists
- **Code blocks** ← WRONG FOR JD!

These are **One-Pager criteria**, not Job Description criteria!

**Root Cause**:
When implementing jd-assistant, the validator was copied from strategic-proposal/one-pager without updating the scoring dimensions to match JD-specific research.

**Evidence**:
The JD research document (`docs/JD-RESEARCH-2025.md`) clearly defines what should be validated:
1. Inclusive Language (masculine-coded words)
2. Neurodiversity-Friendly (extrovert-only signals)
3. Requirements Balance (>6 required items)
4. Self-Selection Language ("60-70%" phrasing)
5. Red Flags (toxic culture phrases)
6. AI Slop Detection (generic buzzwords)
7. Compensation Presence
8. Length Check (>700 words)

But `validateDocument()` checks for code blocks and paragraph structure instead.

**Fix Required**:
1. Replace `validateDocument()` with JD-specific scoring based on research
2. Use `validateJDContent()` as the primary validation
3. Add scoring for: word count (400-700), compensation presence, requirements count, encouragement statement
4. Phase 4 completion should show initial score from validator

---

### 2026-02-05: Phase 4 Missing Initial Score

**Severity**: HIGH
**Status**: FIXED (this commit)

**What Happened**:
When a job description is complete (Phase 3 done), the completion banner shows "Your Job Description is Complete!" but does NOT show an initial validation score.

**Expected Behavior**:
Phase 4 should:
1. Run the JD validator on the final output
2. Display the score (e.g., "Initial Score: 85/100")
3. Show any warnings (masculine-coded words, red flags, etc.)
4. Link to full validation for detailed feedback

**Root Cause**:
The completion view was copied from strategic-proposal without integrating the validator scoring.

**Fix Required**:
1. Import `validateJDContent()` into project-view.js
2. Run validation on Phase 3 output when rendering completion banner
3. Display score and warning count in the banner
4. Show expandable list of warnings with suggestions

---

### 2026-02-05: UI Copy Still Says "Proposal"

**Severity**: MEDIUM
**Status**: FIXED (commit 0155f45)

**What Happened**:
Multiple user-facing strings still said "proposal" instead of "job description":
- "Your Proposal is Complete!"
- "Back to Proposals"
- "Delete Proposal?"
- Export/import messages

**Root Cause**:
Template was copied from strategic-proposal without updating all user-facing strings.

**Fix Applied**:
Updated all user-facing strings in project-view.js and app.js.

---

### 2026-02-05: Per-AI-Service Warning Not Implemented

**Severity**: MEDIUM
**Status**: FIXED (commit 1e5d0a4)

**What Happened**:
The external AI warning dialog only showed in Phase 1 (Claude), not Phase 2 (Gemini).

**Root Cause**:
Warning acknowledgment was stored globally in localStorage, not per-AI-service.

**Fix Applied**:
Changed to per-service keys: `external-ai-warning-acknowledged-claude`, `external-ai-warning-acknowledged-gemini`.

---

## Lessons for Genesis

### Template Variable Replacement is Insufficient

Simply replacing `{{PROJECT_NAME}}` and `{{DESCRIPTION}}` is not enough. Each genesis child project needs:

1. **Domain-specific validator dimensions** — Not generic document structure
2. **Domain-specific UI copy** — Not "proposal" for everything
3. **Domain-specific completion behavior** — Show relevant scores/metrics

### Checklist Additions Needed

The genesis CHECKLIST.md should include:

- [ ] Validator scoring dimensions match domain (not generic document structure)
- [ ] All user-facing strings updated for domain
- [ ] Completion view shows domain-specific metrics
- [ ] Phase prompts reference correct domain terminology

---

## Next Actions

1. [x] Fix `validateDocument()` to use JD-specific scoring ✅ (commit 69b8007)
2. [x] Add initial score display to Phase 4 completion banner ✅
3. [x] Add warning count and expandable list to completion banner ✅
4. [ ] Update genesis CHECKLIST.md with domain-specific validation checks

