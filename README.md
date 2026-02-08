# JD Assistant

Write inclusive job descriptions for software engineering positions. Three phases: draft, review, refine.

[![Star this repo](https://img.shields.io/github/stars/bordenet/jd-assistant?style=social)](https://github.com/bordenet/jd-assistant)

**Try it**: [Assistant](https://bordenet.github.io/jd-assistant/) · [Validator](https://bordenet.github.io/jd-assistant/validator/)

> **Why this matters**: Research shows masculine-coded language in job descriptions reduces female applicants by up to 50%. This tool helps you write JDs that attract diverse candidates by flagging problematic language and suggesting inclusive alternatives.

[![CI](https://github.com/bordenet/jd-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/jd-assistant/actions)
[![codecov](https://codecov.io/gh/bordenet/jd-assistant/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/jd-assistant)

---

## Quick Start

1. Open the [demo](https://bordenet.github.io/jd-assistant/)
2. Enter job title, responsibilities, requirements, compensation
3. Copy prompt → paste into Claude → paste response back
4. Repeat for review (Gemini) and synthesis (Claude)
5. Export as Markdown

## What It Does

- **Draft → Review → Synthesize**: Claude writes, Gemini critiques for inclusivity, Claude refines
- **Inclusive language checks**: Flags masculine-coded words, extrovert-bias, red flag phrases
- **Browser storage**: Data stays in IndexedDB, nothing leaves your machine
- **No login**: Just open and use

## How the Phases Work

**Phase 1** — You provide job details. Claude drafts an inclusive JD following research-backed guidelines.

**Phase 2** — Gemini reviews for: masculine-coded words (aggressive, ninja, rockstar), extrovert-bias (outgoing, high-energy), red flags (fast-paced, like a family), and requirements reasonableness.

**Phase 3** — Claude synthesizes the final JD incorporating valid critique, with a zero-tolerance sweep for problematic language.

---

## Scoring Methodology

The validator scores job descriptions on a 100-point scale using a **penalty-based system**. Unlike other Genesis validators that reward positive elements, JD Assistant starts at 100 and deducts for problems. This reflects the research finding that inclusive JDs are defined by what they *don't* contain.

### Scoring Taxonomy

| Category | Weight | Rationale |
|----------|--------|-----------|
| **Length** | 25 pts | Enforces optimal 400-700 word range for applicant completion rates |
| **Inclusivity** | 25 pts | Penalizes masculine-coded words and extrovert-bias phrases |
| **Culture** | 25 pts | Flags red-flag phrases signaling toxic work environments |
| **Transparency** | 25 pts | Validates compensation disclosure and encouragement statements |

### Why These Weights?

**Length (25 pts)** is based on research showing application rates drop sharply for JDs outside the 400-700 word sweet spot. The validator applies graduated penalties:
- **Too short** (<400 words): -1 pt per 20 words below 400 (max -15)
- **Too long** (>700 words): -1 pt per 50 words above 700 (max -10)

**Inclusivity (25 pts)** addresses the primary cause of applicant pool homogeneity. Research by Gaucher et al. (2011) found masculine-coded language reduces female applicants by up to 50%. The validator penalizes:
- **Masculine-coded words** (-5 pts each, max -25): aggressive, ambitious, assertive, competitive, confident, decisive, determined, dominant, driven, fearless, independent, ninja, rockstar, guru, self-reliant, self-sufficient, superior
- **Extrovert-bias phrases** (-5 pts each, max -20): outgoing, high-energy, energetic, people person, gregarious, strong communicator, excellent verbal, team player

**Culture (25 pts)** flags phrases that signal dysfunction to experienced candidates. These are "tells" that correlate with burnout, unclear boundaries, and toxic management:
- **Red flag phrases** (-5 pts each, max -25): fast-paced, like a family, wear many hats, always-on, hustle, grind, unlimited pto, work hard play hard, hit the ground running, self-starter, thick skin, no ego, drama-free, whatever it takes, passion required

**Transparency (25 pts)** enforces disclosure practices that attract diverse applicants:
- **Missing encouragement** (-5 pts): Absence of "60-70% of qualifications" encouragement statement
- **Missing compensation** (-10 pts): No salary range disclosed (for external postings)

### Adversarial Robustness

The penalty-based system resists gaming because there's no positive scoring to inflate:

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| Adding inclusive buzzwords | No positive points for inclusive language—only penalties avoided |
| Hiding red flags in boilerplate | EEO/legal sections are validated separately with relaxed rules |
| Padding to hit word count | Upper word limit penalizes padding equally |
| Using synonyms for flagged terms | Pattern matching includes common variants and compound forms |

### Calibration Notes

The **penalty cap** per category prevents catastrophic scoring. A JD with 10 masculine-coded words still loses only 25 pts in Inclusivity, not 50. This calibration reflects that a single category failure shouldn't doom an otherwise acceptable JD.

The **EEO/legal relaxation** addresses organizational requirements. Companies often have mandated equal opportunity language that includes phrases like "we are committed to..." which would otherwise trigger AI slop detection. The validator identifies these sections and applies reduced scrutiny.

---

## Validator

The [Validator](https://bordenet.github.io/jd-assistant/validator/) checks any JD for:
- 17 masculine-coded words with neutral alternatives
- 8 extrovert-bias phrases
- 15 red flag phrases signaling toxic culture
- Relaxed validation for company-mandated EEO/legal sections

---

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/bordenet/jd-assistant.git
cd jd-assistant
npm install
```

### Testing

```bash
npm test        # Run all tests
npm run lint    # Run linting
npm run lint:fix # Fix lint issues
```

### Local Development

```bash
npm run serve   # Start local server at http://localhost:8000
```

---

## Project Structure

```
jd-assistant/
├── js/                    # JavaScript modules
│   ├── app.js            # Main application entry
│   ├── workflow.js       # Phase orchestration
│   ├── storage.js        # IndexedDB operations
│   └── ...
├── tests/                 # Jest test files
├── prompts/              # AI prompt templates
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
├── validator/            # JD validation tool
│   └── js/validator.js   # Inclusive language checks
└── index.html            # Main HTML file
```

## Part of Genesis Tools

Built with [Genesis](https://github.com/bordenet/genesis). Related tools:

- [Acceptance Criteria Assistant](https://github.com/bordenet/acceptance-criteria-assistant)
- [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record)
- [Business Justification Assistant](https://github.com/bordenet/business-justification-assistant)
- [JD Assistant](https://github.com/bordenet/jd-assistant)
- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
