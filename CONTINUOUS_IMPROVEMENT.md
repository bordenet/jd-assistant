# JD Assistant — Continuous Improvement Log

> **Purpose**: Track friction points, failures, and lessons learned during development.
> **Goal**: Feed improvements back into genesis toolset.

---

## Critical Process Failures

### 2026-02-05: Diff Tool Must Be Run Aggressively Throughout Development

**Severity**: CRITICAL
**Status**: DOCUMENTED (process failure)

**The Problem**:
LLMs are inherently stochastic. By their very nature, they will introduce inconsistencies when making changes across files. This is not a bug—it's a fundamental property of how language models work. Without a systematic check, divergence between genesis-derived projects is **inevitable**.

**The Solution**:
The genesis project includes a diffing tool at `genesis/project-diff/diff-projects.js`. This tool compares EVERY file across all genesis-derived projects and reports:
- **MUST_MATCH files**: Must be byte-for-byte identical (core engine files)
- **INTENTIONAL_DIFF files**: Expected to differ (prompts, types, domain-specific code)
- **PROJECT_SPECIFIC files**: Only exist in some projects (acceptable)

**The Mandate**:
Run the diff tool **AGGRESSIVELY** throughout development:
1. After EVERY significant change
2. Before EVERY commit
3. Any time you modify files that exist across multiple projects
4. When you're uncertain if a change should propagate

```bash
cd genesis-tools/genesis/project-diff && node diff-projects.js
```

**Why This Matters**:
The diff tool is a mission-critical crutch that compensates for LLM stochasticity. Without it:
- MUST_MATCH files drift apart silently
- Bug fixes in one project don't propagate
- The entire genesis ecosystem loses consistency
- Future maintenance becomes exponentially harder

**jd-assistant was missing from PROJECTS list**:
During initial development, jd-assistant was not added to the PROJECTS array in `diff-projects.js`, meaning the diff tool wasn't even checking it. This was discovered only after the user demanded aggressive diff tool usage.

**Lesson Learned**:
When creating a new genesis-derived project, IMMEDIATELY add it to the PROJECTS array in `diff-projects.js`. Then run the diff tool continuously throughout development.

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

### 2026-02-05: Import Function Checked for Wrong Field Name

**Severity**: HIGH
**Status**: FIXED

**What Happened**:
The `importProjects()` function in `projects.js` was checking for `content.dealershipName` to identify a single project import, but JD projects use `jobTitle` and `companyName` instead.

```javascript
// WRONG (from strategic-proposal template)
} else if (content.id && content.dealershipName) {

// CORRECT (for JD projects)
} else if (content.id && (content.jobTitle || content.companyName)) {
```

**Root Cause**:
When genesis copied the template, the import validation logic was not updated for the new domain's field names.

**Fix Applied**:
Updated both `assistant/js/projects.js` and `js/projects.js` to check for JD-specific fields.

**Genesis Improvement**:
Genesis CHECKLIST.md should include: "Import/export validation logic updated for domain-specific field names"

---

### 2026-02-05: Inconsistent Button Sizes Across Application

**Severity**: MEDIUM
**Status**: FIXED

**What Happened**:
Button sizes were inconsistent across the jd-assistant application:
- `px-4 py-2` — New Project, Export All, Import (standard)
- `px-3 py-1 text-sm` — Export, Delete (smaller, no transition)
- `px-6 py-2` — Validate, Clear in validator (larger)
- `p-2` — Icon buttons (correct for icons)

This creates visual inconsistency and makes the UI feel unpolished.

**Root Cause**:
Genesis hello-world template has the same inconsistencies. Different buttons were styled at different times without a unified standard.

**Fix Applied**:
Standardized all action buttons to `px-4 py-2 rounded-lg transition-colors`:
- `assistant/index.html` — Export and Delete buttons
- `validator/index.html` — Validate and Clear buttons

**Button Size Standard**:
| Button Type | Classes |
|-------------|---------|
| Primary action | `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors` |
| Secondary action | `px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors` |
| Destructive action | `px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors` |
| Icon-only | `p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors` |
| Link-style | No padding, `text-blue-600 dark:text-blue-400 hover:underline` |

**Genesis Improvement**:
Genesis should define a button style guide in the template or CSS to prevent this inconsistency in future projects.

---

### 2026-02-05: Tests Written for One-Pager Validator, Not JD Validator

**Severity**: HIGH
**Status**: FIXED

**What Happened**:
After updating `validator.js` with JD-specific validation (masculine-coded words, red flags, etc.), the tests failed because they were still testing the old One-Pager-style validator expectations.

The tests expected:
- Code block detection
- Generic paragraph structure scoring
- One-Pager document criteria

But the new validator checks for:
- Masculine-coded word detection
- Extrovert-bias phrases
- Red flag phrases
- Compensation presence
- Requirements count (4-6 optimal)
- Word count (400-700 optimal)

**Root Cause**:
When genesis copies templates, it copies the tests too. But when the validator is customized for a new domain, the tests must also be rewritten to match the new validation logic.

**Fix Applied**:
Rewrote `validator.test.js` to test JD-specific validation:
- Test masculine-coded word detection
- Test red flag phrase detection
- Test extrovert-bias detection
- Test scoring dimensions match JD research

**Genesis Improvement**:
Genesis CHECKLIST.md should include: "Tests updated to match domain-specific validator logic (not One-Pager tests)"

---

### 2026-02-05: Module Docstrings and UI Copy Not Updated

**Severity**: LOW
**Status**: FIXED (this commit)

**What Happened**:
Two files still had copy from the strategic-proposal template:
1. `assistant/js/prompts.js` lines 1-6: Said "Strategic Proposal Prompts Module" instead of "JD Assistant Prompts Module"
2. `validator/index.html` lines 51-52: Had generic "Document Validator" copy instead of JD-specific

**Root Cause**:
Genesis template variable replacement only handles `{{VAR}}` style placeholders. Free-form text in module docstrings and UI copy was not updated.

**Impact**:
- User confusion (prompts.js docstring references wrong domain)
- Generic validator UI (doesn't communicate JD-specific validation)

**Fix Applied**:
- Updated prompts.js docstring to "JD Assistant Prompts Module"
- Updated validator/index.html to "Job Description Validator" with JD-specific description

**Genesis Improvement**:
Genesis should have a checklist item: "Verify ALL module docstrings and UI copy reference the correct domain"

---

## Critical Successes

### 2026-02-05: Perplexity Domain Research Workflow ⭐

**Impact**: HIGH — This was the #1 predictor of project quality
**Status**: Now mandated in Genesis (Phase 1.5)

**What Worked Exceptionally Well**:
Before implementing any code, we conducted 7 progressive Perplexity Q&A sessions covering:
1. Modern JD structure & AI-optimization
2. Inclusive language — gender (masculine-coded words)
3. Inclusive language — neurodiversity & introverts
4. Requirements & leveling best practices
5. Compensation & benefits transparency
6. Red flags & anti-patterns to detect
7. Applied AI/LLM-era role specifics

**Research Output**: `docs/JD-RESEARCH-2025.md` (657 lines)

**How Research Informed Implementation**:
| Research Finding | Implementation |
|-----------------|----------------|
| Masculine-coded word list (Gaucher et al. 2011) | `validator.js` word detection |
| Extrovert-bias phrases | `validateJDContent()` checks |
| 400-700 word optimal length | Length scoring dimension |
| Red flag phrases ("fast-paced", "wear many hats") | Red flag detection |
| Self-selection encouragement (70% rule) | Prompt guidance |
| 4-6 required items max | Requirements count validation |

**Why This Was Critical**:
Without this research, we would have:
- ❌ Used generic one-pager criteria (code blocks, paragraphs)
- ❌ Missed masculine-coded language detection
- ❌ Missed neurodiversity-inclusive guidance
- ❌ Created generic LLM prompts without domain expertise

With research, we got:
- ✅ JD-specific scoring dimensions backed by peer-reviewed research
- ✅ Comprehensive inclusive language detection
- ✅ Expert-level LLM prompt guidance
- ✅ Domain-accurate red flag detection

**Genesis Improvement Applied**:
This workflow is now mandated in Genesis as "Phase 1.5: Domain Research":
- `01-AI-INSTRUCTIONS.md` — Full process documentation
- `CHECKLIST.md` — 8 mandatory research checklist items
- `START-HERE.md` — Step 2.5 with template and examples

All future genesis projects will conduct domain research and save results to `docs/{DOCUMENT_TYPE}-RESEARCH-{YEAR}.md`.

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
- [ ] Module docstrings updated (prompts.js, app.js, etc.)
- [ ] Validator UI copy is domain-specific (not "Document Validator")
- [ ] **Tests updated to match domain-specific validator logic** (not One-Pager tests)

---

## Next Actions

1. [x] Fix `validateDocument()` to use JD-specific scoring ✅ (commit 69b8007)
2. [x] Add initial score display to Phase 4 completion banner ✅
3. [x] Add warning count and expandable list to completion banner ✅
4. [x] Update genesis CHECKLIST.md with domain-specific validation checks ✅
5. [x] Document Perplexity research workflow in genesis (Phase 1.5) ✅

---

## Genesis Confidence Assessment

### Current Confidence Score: 42/100

**Assessment Date**: 2026-02-05
**Methodology**: Rigorous analysis of genesis instruction files, failure patterns from jd-assistant development, and LLM context window limitations.

### Critical Gaps Preventing 95% Confidence

#### Gap 1: Instruction Files Exceed Safe Length (🔴 CRITICAL)

LLMs have context window limitations and attention degradation over long documents. Files over 300 lines risk losing critical instructions.

| File | Lines | Risk |
|------|-------|------|
| `START-HERE.md` | 1,150 | 🔴 3.8x over limit |
| `00-GENESIS-PLAN.md` | 1,018 | 🔴 3.4x over limit |
| `01-AI-INSTRUCTIONS.md` | 936 | 🔴 3.1x over limit |
| `TROUBLESHOOTING.md` | 776 | 🔴 2.6x over limit |
| `05-QUALITY-STANDARDS.md` | 489 | 🟡 1.6x over limit |

**Required Fix**: Refactor into modular step files (`steps/01-requirements.md`, `steps/02-research.md`, etc.) with each file ≤300 lines. Each step file must have:
- Clear entry conditions
- Explicit exit criteria
- Mandatory verification commands

#### Gap 2: No Mandatory Diff Tool Checkpoints (🔴 CRITICAL)

The diff tool is mentioned but not enforced at phase boundaries. An LLM can complete an entire project without ever running it.

**Required Fix**: Add explicit checkpoints in CHECKLIST.md:
```markdown
### CHECKPOINT: After Phase 2 (Template Copying)
- [ ] Run `node genesis/project-diff/diff-projects.js`
- [ ] Output shows: "✓ ALL MUST-MATCH FILES ARE IDENTICAL"
- [ ] ❌ DO NOT PROCEED if divergent files exist

### CHECKPOINT: Before Every Commit
- [ ] Run `node genesis/project-diff/diff-projects.js`
- [ ] ❌ COMMIT BLOCKED if divergent files exist
```

#### Gap 3: No "Add to PROJECTS Array" Step (🔴 CRITICAL)

When creating a new project, there is NO instruction to add it to `diff-projects.js`. This means the diff tool won't check the new project at all.

**Required Fix**: Add to Phase 2 of CHECKLIST.md:
```markdown
- [ ] Added project to `genesis/project-diff/diff-projects.js` PROJECTS array
- [ ] Verified: `node diff-projects.js` includes new project in output
```

#### Gap 4: No Function-Like Exit Criteria (🔴 CRITICAL)

Steps don't have strict "MUST PASS BEFORE PROCEEDING" gates. Instructions are prose, not code.

**Required Fix**: Rewrite each step as a function with:
```markdown
## Step 2: Copy Templates

### Entry Conditions
- [ ] Step 1 complete (requirements gathered)
- [ ] Project directory exists
- [ ] Git initialized

### Actions
1. Copy files from hello-world...

### Exit Criteria (ALL MUST PASS)
```bash
# Run these commands - ALL must succeed
[ -f "package.json" ] && echo "✅" || echo "❌ BLOCKED"
[ -f "CLAUDE.md" ] && echo "✅" || echo "❌ BLOCKED"
node genesis/project-diff/diff-projects.js --ci
# Exit code 0 = PASS, Exit code 1 = BLOCKED
```

### Verification
- [ ] All exit criteria commands return ✅
- [ ] Diff tool shows no divergence
- [ ] ❌ DO NOT PROCEED TO STEP 3 until all pass
```

#### Gap 5: Template Field Validation Missing (🟡 HIGH)

The `dealershipName` vs `jobTitle` bug shows templates contain domain-specific field names that aren't validated.

**Required Fix**: Add to CHECKLIST.md:
```markdown
- [ ] Search for template-specific field names: `grep -r "dealershipName\|proposalTitle\|onePagerTitle" .`
- [ ] Replace ALL with domain-specific field names
- [ ] Verify import/export validation uses correct field names
```

#### Gap 6: Test Template Mismatch (🟡 HIGH)

Tests copied from templates test wrong domain criteria (One-Pager tests for JD validator).

**Required Fix**: Add to CHECKLIST.md:
```markdown
- [ ] Review ALL test files for domain-specific assertions
- [ ] Validator tests check domain-specific dimensions (not generic)
- [ ] Run tests and verify they test YOUR domain, not template domain
```

#### Gap 7: No UI Style Guide (🟡 MEDIUM)

Button sizes, colors, and spacing are inconsistent. No standard defined.

**Required Fix**: Create `genesis/templates/docs/UI-STYLE-GUIDE.md`:
```markdown
## Button Standards
| Type | Classes |
|------|---------|
| Primary | `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors` |
| Secondary | `px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg ...` |
| Destructive | `px-4 py-2 bg-red-600 text-white rounded-lg ...` |
| Icon-only | `p-2 rounded-lg ...` |
```

#### Gap 8: No Automated Validation Script (🟡 MEDIUM)

No single script runs ALL mandatory checks in sequence.

**Required Fix**: Create `genesis/scripts/validate-new-project.sh`:
```bash
#!/bin/bash
# Runs ALL mandatory checks for a new genesis project
# Exit 1 on ANY failure

echo "=== Genesis Project Validation ==="

# Check 1: Diff tool
node genesis/project-diff/diff-projects.js --ci || exit 1

# Check 2: No unreplaced variables
grep -r "{{" . --exclude-dir=node_modules && exit 1

# Check 3: Tests pass
npm test || exit 1

# Check 4: Lint passes
npm run lint || exit 1

echo "✅ ALL CHECKS PASSED"
```

### Roadmap to 95% Confidence

| Priority | Gap | Effort | Impact |
|----------|-----|--------|--------|
| P0 | Refactor files to ≤300 lines | HIGH | +20 points |
| P0 | Add mandatory diff checkpoints | LOW | +15 points |
| P0 | Add "register in PROJECTS" step | LOW | +8 points |
| P1 | Function-like exit criteria | MEDIUM | +10 points |
| P1 | Template field validation | LOW | +5 points |
| P1 | Test template mismatch check | LOW | +5 points |
| P2 | UI style guide | LOW | +3 points |
| P2 | Automated validation script | MEDIUM | +5 points |

**Projected Score After Fixes**: 42 + 71 = **113/100** (capped at 95-98 due to inherent LLM stochasticity)

### The Fundamental Truth

LLMs are stochastic. Even with perfect instructions, there is always a non-zero probability of deviation. The goal is not 100% confidence—it's building enough guardrails that deviations are caught immediately and corrected before they compound.

**The Three Pillars of LLM-Proof Genesis**:
1. **Short, focused instruction files** (≤300 lines each)
2. **Mandatory checkpoints with blocking exit criteria**
3. **Aggressive diff tool usage as a compensating control**

Without all three, confidence cannot exceed 60%.

