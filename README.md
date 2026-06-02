# DealVault — Trustless Escrow Platform

> **Secure, blockchain-backed escrow for digital service deals.** Buyers lock funds on-chain; sellers get paid only when work is approved.

[![CI](https://github.com/your-org/dealvault-platform-escrow/actions/workflows/test.yml/badge.svg)](https://github.com/your-org/dealvault-platform-escrow/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

| Feature | Status |
|---|---|
| JWT Authentication (register / login / change password) | ✅ |
| Full Deal Lifecycle (10-state FSM) | ✅ |
| Role-based access control (buyer / seller / admin) | ✅ |
| Input validation & sanitization | ✅ |
| Rate limiting & security headers (Helmet) | ✅ |
| File delivery upload (multer) | ✅ |
| Dispute raising by buyer | ✅ |
| On-chain Solana escrow program (Rust) | ✅ |
| Docker / Docker Compose full-stack | ✅ |
| GitHub Actions CI pipeline | ✅ |
| Integration test suite (Jest + supertest) | ✅ |
| API documentation | ✅ |
| Architecture & deployment guides | ✅ |

---

## 🏗️ Project Structure

```
dealvault-platform-escrow/
├── backend/                    # Node.js + Express REST API
│   ├── controllers/            # Request handlers
│   ├── models/                 # Mongoose schemas (User, Deal)
│   ├── routes/                 # Auth & Deal routers
│   ├── middleware/             # JWT auth, error handler
│   ├── validators/             # express-validator rules
│   ├── utils/                  # AppError class
│   ├── tests/                  # Jest integration tests
│   └── server.js               # App entry point
│
├── frontend/                   # React + TypeScript + Vite UI
│
├── contracts/
│   └── solana/                 # Rust on-chain escrow program
│       └── src/
│           ├── lib.rs          # Program entrypoint
│           ├── state.rs        # EscrowAccount struct
│           ├── error.rs        # EscrowError enum
│           └── instructions/   # init_escrow, release, refund, dispute
│
├── docker/                     # Dockerfiles + docker-compose
├── docs/                       # API, contracts, architecture, deployment docs
└── .github/workflows/          # CI/CD pipelines
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20
- MongoDB (local or Atlas)
- (Optional) Docker + Docker Compose

### Option A — Local Development

```bash
# Backend
cd backend
cp .env.example .env    # Edit with your values
npm install
npm run dev             # → http://localhost:5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev             # → http://localhost:5173
```

### Option B — Docker (Full Stack)

```bash
cp backend/.env.example backend/.env   # Set JWT_SECRET at minimum
cd docker
docker compose up --build
# Frontend → http://localhost
# Backend  → http://localhost:5000
# MongoDB  → localhost:27017
```

---

## 🧪 Running Tests

```bash
cd backend
npm test                  # Run all integration tests
npm run test:coverage     # Run with coverage report (≥75% required)
```

---

## 📚 Documentation

| Document | Description |
|---|---|
| [API.md](docs/API.md) | All REST endpoints, request/response schemas |
| [SMART_CONTRACTS.md](docs/SMART_CONTRACTS.md) | Solana program, instructions, security |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data models, FSM |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Local, Docker, and production deploy guide |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Branching, commits, PR process, style guide |

---

## 🔐 Security

- **Helmet** — Secure HTTP headers
- **express-rate-limit** — Auth: 5 req/15 min · API: 100 req/min
- **express-mongo-sanitize** — NoSQL injection prevention
- **xss-clean** — XSS sanitization
- **bcryptjs** (cost 12) — Password hashing
- **JWT** — Stateless auth with expiry
- **10KB body limit** — Payload size restriction
- **Non-root Docker user** — Container hardening

---

## 🔗 Smart Contract (Solana)

The on-chain escrow program handles trustless fund locking:

```
Instruction 0: InitEscrow  → lock buyer funds in PDA
Instruction 1: Release     → transfer funds to seller
Instruction 2: Refund      → return funds to buyer
Instruction 3: Dispute     → flag for arbitration
```

See [SMART_CONTRACTS.md](docs/SMART_CONTRACTS.md) for full details.

---

## 📄 License

MIT © DealVault Contributors
