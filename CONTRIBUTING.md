# Contributing to SatExpert Tactical SatCom Intelligence (TSI)

Thank you for your interest in contributing to SatExpert TSI! We welcome contributions from engineers, cryptographers, radio operators, and tactical software developers.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and professional environment. Treat all contributors and users with respect, provide constructive feedback, and uphold high engineering standards.

---

## Development Setup

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or higher
- **Git**

### Installation

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/satexpert-tsi.git
   cd satexpert-tsi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Add your Google Gemini API key to .env.local if testing AI technician features
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Testing

Before submitting any code changes, ensure all verification steps pass locally:

1. **TypeScript Typecheck**:
   ```bash
   npm run lint
   ```
   *(Must exit with 0 errors)*

2. **Automated Unit Tests**:
   ```bash
   npm test
   ```
   *(All tests in `src/__tests__` must pass)*

3. **Production Build**:
   ```bash
   npm run build
   ```

---

## Branching & Commit Conventions

- Use feature branches branched from `main`:
  - `feat/feature-name`
  - `fix/bug-description`
  - `docs/update-guide`
  - `refactor/subsystem-name`
  - `test/coverage-expansion`

- Follow **Conventional Commits**:
  - `feat(orbital): add Ka-band slant range calculation`
  - `fix(telemetry): correct SNR threshold detection in spectrum visualizer`
  - `docs(readme): expand security verification matrix`
  - `test(crypto): add Dilithium3 signature validation cases`

---

## Pull Request Process

1. Verify that `npm run lint`, `npm test`, and `npm run build` all pass.
2. Provide a descriptive PR title and summary explaining:
   - What changed
   - Why the change was made
   - How to verify the change
3. Request review from maintainers.
4. Ensure all CI checks pass before requesting merge.

---

## Security Inquiries

Do **NOT** report security vulnerabilities via public GitHub issues. Please refer to our [SECURITY.md](SECURITY.md) for confidential disclosure instructions.
