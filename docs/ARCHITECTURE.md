# DealVault System Architecture

## Overview

DealVault is an escrow platform for open-source bounties. A maintainer locks USDC into an
on-chain Soroban escrow, a contributor delivers work (tracked via a GitHub bot), and on
approval the contract releases funds (98% contributor / 2% platform fee).

**MVP status:** the backend, GitHub bot, and Soroban contract are real; the frontend fund
flow is simulated (localStorage), and the backend deal state is **not** verified on-chain.

## High-Level Architecture

```
┌──────────────────┐      HTTPS       ┌──────────────────────┐
│ Next.js Frontend │ ───────────────► │  Node.js Backend API  │
│ (App Router, TS) │ ◄─────────────── │  (Express 5)          │
└──────────────────┘                  └──────────────────────┘
         │                                     │         ▲
         │ (address pick only,       ┌─────────┤         │ webhooks
         │  no signing yet)          │         │         │
   ┌─────▼────────┐          ┌───────▼────┐   │   ┌─────┴────────┐
   │ Stellar      │          │  MongoDB   │   │   │ GitHub App   │
   │ Wallets Kit  │          │ (Mongoose) │   │   │ (Octokit)    │
   └──────────────┘          └────────────┘   │   └──────────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │ Soroban Escrow     │   ← NOT yet wired to the
                                    │ (Rust, testnet)    │     backend or frontend
                                    └────────────────────┘
```

## Technology Stack

| Layer         | Technology                              | Purpose                          |
|---------------|-----------------------------------------|----------------------------------|
| Frontend      | Next.js 14 (App Router), React 18, TS   | User interface                   |
| Backend       | Node.js 20, Express 5, Mongoose 9       | REST API, business logic         |
| Database      | MongoDB 7 (Atlas or self-hosted)        | Persistent storage               |
| Blockchain    | Stellar + Soroban (Rust, `no_std`)      | On-chain escrow                  |
| Auth          | JWT (**HS256**, httpOnly cookie), bcryptjs, GitHub OAuth | Authentication  |
| GitHub Bot    | GitHub App (Octokit) + signed webhooks  | Bounty/issue tracking            |
| Containerize  | Docker Compose (backend + frontend)     | Deploys                          |
| CI/CD         | GitHub Actions                          | Tests, type-check, contract build, audit |

---

## Backend Architecture

```
backend/
├── server.js            # App entry, middleware setup
├── config/
│   └── database.js      # MongoDB connection
├── routes/              # auth, deals, applications, issues, webhooks
├── controllers/         # Request handlers (thin layer)
├── models/              # User, Deal, Issue, Application
├── middleware/
│   ├── auth.js          # JWT protect / restrictTo / optionalAuth
│   ├── sanitize.js      # Mongo-operator + XSS sanitization (Express 5-safe)
│   └── errorHandler.js  # Global error formatting
├── services/
│   ├── githubBot.js     # Octokit GitHub App client + webhook signature verify
│   └── botMessages.js   # Bot comment templates
├── validators/
│   └── index.js         # express-validator rules
├── utils/
│   └── AppError.js      # Operational error class
└── tests/               # 6 Jest suites (auth, deals, applications, webhook, middleware, user.model)
```

### Security Layers (in request order)

```
Request
  → Helmet (HTTP headers)
  → CORS (origin whitelist, credentials)
  → HSTS header
  → Rate limiters (global 100/min; login 10/15min; register 5/15min;
                   wallet 5/hr; GitHub OAuth callback 20/hr)
  → Raw body capture for /api/webhooks/github (signature verification)
  → Body parsers (10 KB limit)
  → Sanitization (express-mongo-sanitize + xss-clean via middleware/sanitize.js)
  → JWT protect middleware (on protected routes)
  → express-validator chains
  → Controller
  → Error handler
```

The GitHub webhook endpoint additionally verifies the `X-Hub-Signature-256` HMAC and
deduplicates `X-GitHub-Delivery` IDs (10-minute in-memory TTL cache).

---

## Deal Lifecycle State Machine (backend, off-chain)

```
CREATED ──(seller accepts)──► ACCEPTED ──(buyer funds)──► FUNDED
   │                              │                          │
   │(cancelled)                   │(cancelled)           (seller starts)
   ▼                              ▼                          ▼
CANCELLED                    CANCELLED               IN_PROGRESS
                                                         │
                                               (seller submits)
                                                         ▼
                                                    SUBMITTED
                                                  ╱           ╲
                                        (approved)             (disputed)
                                           ▼                       ▼
                                        APPROVED               DISPUTED
                                           │                  ╱       ╲
                                       (released)        (admin)     (admin)
                                           ▼               ▼           ▼
                                        RELEASED        RELEASED    REFUNDED
```

> **Important:** `FUNDED` / `RELEASED` / `REFUNDED` here are **database flags only** —
> the backend performs no chain verification. `escrowAddress` / `transactionHash`
> fields exist on `Deal` but are never written today.

---

## Data Models

### User
- Identity: name, email, GitHub identity (id, username, avatar)
- Auth: hashed password (bcryptjs), role (`buyer`/`seller`/`admin`)
- Profile: avatar, bio, walletAddress (Stellar StrKey, validated)
- Finance: reputationScore
- Compliance: KYC (status, document, verifiedAt)

### Deal
- Core: title, description, amount, currency
- Participants: buyerId (ref User), sellerId (ref User)
- Blockchain: escrowAddress, transactionHash (currently never written)
- Lifecycle: status (10-state FSM), deadline
- Delivery: deliveryFiles[]

### Issue (GitHub bounty)
- GitHub identity: repo full name, issue number/URL, labels
- Platform: funding, fundingCurrency, status, `addedBy` (GitHub username of labeler)

### Application
- Contributor application against an Issue: applicant, proposal, status

---

## Smart Contract Architecture (Soroban)

`contracts/escrow/src/lib.rs` — single-file contract, three entry points:

```
fund_escrow(deal_id, maintainer, contributor, usdc_token, amount, platform_wallet, admin)
release_funds(deal_id, maintainer)
refund_maintainer(deal_id, admin, maintainer)
```

Per-deal persistent storage under typed `DataKey` entries (Deal / State / Admin /
Platform). Settle-once `DealState` guard prevents double release/refund. See
`docs/SMART_CONTRACTS.md` for full details.

---

## Deployment Environments

<!-- TODO: verify — no staging/production infrastructure is defined in the repo;
     the rows below are intent, not deployed reality. -->

| Environment | Backend         | Frontend       | MongoDB           | Stellar  |
|-------------|-----------------|----------------|-------------------|----------|
| Local Dev   | localhost:5000  | localhost:3000 | localhost:27017 / Atlas | testnet |
| Production  | TBD             | TBD            | Atlas             | testnet (mainnet later) |
