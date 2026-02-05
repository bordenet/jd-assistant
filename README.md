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

- [One-Pager](https://github.com/bordenet/one-pager)
- [JD Assistant](https://github.com/bordenet/jd-assistant)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
