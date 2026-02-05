# ✨ JD Assistant

Create effective job descriptions for software engineering positions.

---

## Quick Start

```bash
npm install
npm test        # Unit tests for both assistant and validator
open index.html # Assistant UI
open validator/index.html # Validator UI
```

---

## What This Is

A 3-phase AI workflow application for creating high-quality job descriptions for software engineering roles. Uses the adversarial workflow pattern (Claude → Gemini → Claude) to produce better results.

Every project has a **paired architecture**:

- **assistant/** - 3-phase AI workflow for creating job descriptions
- **validator/** - Job description quality checker

Part of the [genesis-tools](https://github.com/bordenet/genesis) ecosystem.

---

## Directory Structure

```
jd-assistant/
├── index.html              # Root (mirrors assistant/index.html)
├── js/                     # Root JS (mirrors assistant/js/)
├── css/                    # Root CSS (mirrors assistant/css/)
├── assistant/              # Document creation tool
│   ├── index.html          # Main assistant UI
│   ├── js/                 # Source files
│   │   ├── app.js          # Entry point
│   │   ├── workflow.js     # Phase logic
│   │   ├── storage.js      # IndexedDB
│   │   ├── router.js       # Client-side routing
│   │   ├── error-handler.js    # Error display (MUST_MATCH)
│   │   ├── same-llm-adversarial.js  # LLM adversarial (MUST_MATCH)
│   │   └── ai-mock.js      # Mock responses
│   ├── css/styles.css      # Styles
│   └── tests/              # Jest unit tests
├── validator/              # Document validation tool
│   ├── index.html          # Validator UI
│   ├── js/                 # Validator source
│   │   ├── app.js          # Entry point
│   │   └── validator.js    # Validation logic
│   ├── css/styles.css      # Styles
│   ├── tests/              # Jest unit tests
│   └── testdata/           # Test fixtures
├── e2e/                    # Playwright E2E tests
├── scripts/lib/            # Shell utilities
├── package.json
├── jest.config.js
├── playwright.config.js
└── eslint.config.js
```

**Note**: Root `index.html`, `js/`, and `css/` mirror `assistant/` for backward compatibility.

---

## MUST_MATCH Files

These files must be identical across all 7 projects:

| File | Purpose |
|------|---------|
| `js/error-handler.js` | Error display |
| `js/same-llm-adversarial.js` | Same-LLM adversarial mode |
| `scripts/lib/compact.sh` | Shell output utilities |
| `scripts/lib/symlinks.sh` | Symlink handling |
| `AGENT.md` | AI agent instructions |
| `CODEX.md` | OpenAI Codex instructions |
| `COPILOT.md` | GitHub Copilot instructions |
| `GEMINI.md` | Google Gemini instructions |
| `ADOPT-PROMPT.md` | AI adoption prompt |

Run `project-diff --ci` to verify consistency.

---

## Testing

```bash
npm test              # All 170 tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only
npm run test:coverage # With coverage
```

---

## Related Projects

All derived from this template:

- [one-pager](https://github.com/bordenet/one-pager)
- [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant)
- [architecture-decision-record](https://github.com/bordenet/architecture-decision-record)
- [strategic-proposal](https://github.com/bordenet/strategic-proposal)
- [power-statement-assistant](https://github.com/bordenet/power-statement-assistant)
- [pr-faq-assistant](https://github.com/bordenet/pr-faq-assistant)
