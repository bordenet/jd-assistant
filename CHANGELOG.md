# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Usage section in README.md
- LICENSE file (MIT)
- CLAUDE.md file
- CONTRIBUTING.md file
- js/router.js for client-side routing
- js/error-handler.js for user-friendly error messages
- CHANGELOG.md file

### Changed
- Downgraded Jest from 30 to 29 for consistency with other repos
- Updated eslint.config.js to use globals package
- Fixed script quoting in package.json
- Added missing scripts (format, quality, serve, deploy, prepare)

## [1.0.0] - 2025-01-01

### Added
- Initial release
- Two-phase AI workflow (Input → Output)
- IndexedDB storage for project persistence
- Dark mode toggle
- Export to Markdown
- AI Mock Mode for testing
- Jest unit tests with 50%+ coverage
- GitHub Actions CI/CD pipeline
