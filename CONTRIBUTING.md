# Contributing to DealVault

Thank you for your interest in contributing! 🚀 This guide will get you up and running.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branch Strategy](#branch-strategy)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Code Style](#code-style)

---

## Code of Conduct

Be respectful and professional. Harassment of any kind will not be tolerated.

---

## Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/<your-username>/dealvault-platform-escrow
cd dealvault-platform-escrow
```

### 2. Set up the backend
```bash
cd backend
cp .env.example .env    # Fill in values
npm install
npm run dev
```

### 3. Set up the frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 4. Verify setup
```bash
curl http://localhost:5000/api/health
# → {"success":true,"status":"OK"}
```

---

## Branch Strategy

| Branch     | Purpose                          |
|------------|----------------------------------|
| `main`     | Production-ready code only       |
| `develop`  | Integration branch               |
| `feature/` | New features (branch from develop)|
| `fix/`     | Bug fixes                        |
| `docs/`    | Documentation only changes       |

```bash
# Always branch from develop
git checkout develop
git checkout -b feature/your-feature-name
```

---

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]
```

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation only
- `test` — adding/updating tests
- `refactor` — code change without adding feature or fixing bug
- `chore` — tooling, build changes

**Examples:**
```bash
git commit -m "feat(deals): add dispute resolution endpoint"
git commit -m "fix(auth): handle expired token edge case"
git commit -m "test(deals): add status transition integration tests"
```

---

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Ensure coverage thresholds are met: `npm run test:coverage`
3. Update documentation if your change affects the API or architecture
4. Fill out the PR template completely
5. Request a review from at least one maintainer
6. Squash commits before merging

---

## Testing Requirements

All PRs **must** include tests. Minimum requirements:

| Change Type      | Required Tests                                |
|------------------|-----------------------------------------------|
| New endpoint     | Integration tests (happy + error paths)       |
| New model field  | Model validation test                         |
| Bug fix          | Regression test that would have caught the bug|
| Smart contract   | Unit test for the instruction                 |

Run tests locally:
```bash
cd backend
npm test                  # Run all tests
npm run test:coverage     # Run with coverage report
```

**Coverage thresholds** (enforced in CI):
- Lines: 75%
- Functions: 75%
- Branches: 70%

---

## Code Style

### JavaScript (Backend)
- Use `async/await`, never raw `.then()` chains
- All async route handlers wrapped in `try/catch` → `next(err)`
- Use `AppError` for operational errors, never `throw new Error()` directly
- All endpoints must use validation middleware from `validators/index.js`

### Rust (Smart Contracts)
- All instructions must validate signers before any state reads
- Every state mutation must verify the escrow is in the correct status
- Use `msg!()` for logging key decision points
- All errors must go through `EscrowError`

### General
- No `console.log` in production code (use structured logging)
- No secrets in code — use `.env`
- Delete dead code; don't comment it out
