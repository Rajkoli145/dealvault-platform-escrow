# DealVault System Architecture

## Overview

DealVault is a trustless escrow platform that connects buyers and sellers for digital service deals, using on-chain smart contracts to hold and release funds.

## High-Level Architecture

```
┌─────────────────┐      HTTPS       ┌──────────────────────┐
│  React Frontend │ ───────────────► │  Node.js Backend API  │
│  (Vite + TS)    │ ◄─────────────── │  (Express.js)         │
└─────────────────┘                  └──────────────────────┘
                                               │
                          ┌────────────────────┤
                          │                    │
                    ┌─────▼──────┐    ┌────────▼────────┐
                    │  MongoDB   │    │ Solana Program  │
                    │ (Mongoose) │    │ (Rust / BPF)    │
                    └────────────┘    └─────────────────┘
```

## Technology Stack

| Layer         | Technology                          | Purpose                          |
|---------------|-------------------------------------|----------------------------------|
| Frontend      | React 18, TypeScript, Vite          | User interface                   |
| Backend       | Node.js 20, Express 5, Mongoose 9   | REST API, business logic         |
| Database      | MongoDB 7 (Atlas or self-hosted)    | Persistent storage               |
| Blockchain    | Solana (native Rust program)        | On-chain escrow and payments     |
| Auth          | JWT (RS256), bcryptjs               | Authentication & authorization   |
| Containerize  | Docker, Docker Compose              | Local dev and production deploys |
| CI/CD         | GitHub Actions                      | Automated testing and deployment |

---

## Backend Architecture

```
backend/
├── server.js            # App entry, middleware setup
├── config/
│   └── database.js      # MongoDB connection
├── routes/              # Express routers (auth, deals)
├── controllers/         # Request handlers (thin layer)
├── models/              # Mongoose schemas
│   ├── User.js          # Full user schema with KYC, wallet
│   └── Deal.js          # Deal lifecycle schema
├── middleware/
│   ├── auth.js          # JWT protect + restrictTo
│   └── errorHandler.js  # Global error formatting
├── validators/
│   └── index.js         # express-validator rules
├── utils/
│   └── AppError.js      # Operational error class
└── tests/               # Jest test suites
```

### Security Layers (in request order)

```
Request
  → Helmet (HTTP headers)
  → CORS (origin whitelist)
  → Rate Limiter (express-rate-limit)
  → Body Parser (10KB limit)
  → Mongo Sanitize (NoSQL injection prevention)
  → XSS Clean (HTML sanitization)
  → JWT Protect Middleware (on protected routes)
  → Validator Middleware (input validation)
  → Controller
  → Error Handler
```

---

## Deal Lifecycle State Machine

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

---

## Data Models

### User
- Identity: name, email, phone
- Auth: hashed password, JWT tracking, password reset tokens
- Profile: avatar, bio, address, walletAddress
- Finance: bankAccount, reputationScore
- Compliance: KYC (status, document, verifiedAt)
- Activity: lastLoginAt, dealsAsbuyer[], dealsAsSeller[]

### Deal
- Core: title, description, amount, currency
- Participants: buyerId (ref User), sellerId (ref User)
- Blockchain: escrowAddress, transactionHash
- Lifecycle: status (10-state FSM), deadline
- Delivery: deliveryFiles[]

---

## Smart Contract Architecture

```
Instruction data byte[0] → dispatch to handler
  0 → InitEscrow  (lock funds in PDA)
  1 → Release     (pay seller)
  2 → Refund      (return to buyer)
  3 → Dispute     (flag for arbitration)
```

Each instruction validates:
1. Correct signers
2. Account ownership (program_id)
3. Valid state transition
4. Sufficient funds / rent exemption

---

## Deployment Environments

| Environment | Backend         | Frontend       | MongoDB           | Solana         |
|-------------|-----------------|----------------|-------------------|----------------|
| Local Dev   | localhost:5000  | localhost:5173 | localhost:27017   | localnet       |
| Staging     | api.staging.dev | staging.dev    | Atlas (free tier) | devnet         |
| Production  | api.dealvault.io| dealvault.io   | Atlas (M10+)      | mainnet-beta   |
