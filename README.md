<div align="center">
<img width="2103" height="748" alt="Dlogo" src="https://github.com/user-attachments/assets/305aed40-06d5-4166-8346-6d0a815240aa" />

<h1>DealVault</h1>

<p><strong>Escrow Infrastructure for Open Source Bounties, Freelance Contracts, and Global Payments on Stellar.</strong></p>

<p>Lock funds before work begins. Release payments automatically through Soroban smart contracts.</p>

<br/>

<p>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="MIT License" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Network-Stellar-7B2FBE?style=flat-square&logo=stellar&logoColor=white" alt="Stellar" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Smart%20Contracts-Soroban-FF6B35?style=flat-square" alt="Soroban" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Asset-USDC-2775CA?style=flat-square" alt="USDC" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Status-MVP%20%2F%20Testnet-yellow?style=flat-square" alt="Status" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
  </a>
</p>

<br/>

<p>
  <a href="#-overview">Overview</a> ·
  <a href="#-project-status">Project Status</a> ·
  <a href="#-how-it-works">How It Works</a> ·
  <a href="#-technology-stack">Tech Stack</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-smart-contract">Smart Contract</a>
</p>

</div>

---

## 📌 Overview

**DealVault** is a decentralized escrow platform built on [Stellar](https://stellar.org) and [Soroban](https://soroban.stellar.org).

Project owners lock funds before work begins — ensuring contributors, freelancers, and contractors have **guaranteed payment** the moment agreed conditions are met.

> _"Every task should have verified funding. Every contributor should have payment protection."_

---

## 🚧 Project Status

DealVault is an **MVP**. Be aware of what is real and what is simulated today:

| Component | Status |
|---|---|
| Soroban escrow contract (`contracts/escrow/`) | ✅ Real — hardened, compiles, targets Stellar **testnet** |
| Backend API (auth, deals, GitHub bounty bot) | ✅ Real — Express 5 + MongoDB, 100 passing tests |
| GitHub bot (issue tracking via `dealvault` label) | ✅ Real — GitHub App webhook integration |
| Marketing site + dashboard UI | ✅ Real — Next.js 14 |
| End-to-end fund flow in the frontend | ⚠️ **Simulated** (localStorage demo, see `frontend/src/lib/demoFlow.ts`) |
| Backend ↔ chain integration | ❌ Not built — deal status in the DB is **not** verified on-chain |
| Wallet signing | ❌ Not built — the wallet kit only picks an address (testnet) |

---

## 🔄 How It Works

```
 Maintainer / Client                          Contributor / Freelancer
        │                                               │
        │  1. Creates deal with terms                   │
        │  2. Deposits USDC into Soroban escrow         │
        │     ┌─────────────────────────────┐           │
        │     │   🔐 Escrow Smart Contract  │           │
        │     │   Funds locked on-chain     │           │
        │     └─────────────────────────────┘           │
        │                                               │
        │  3. Sees verified funding ────────────────────│
        │                                               │  4. Applies & gets selected
        │                                               │  5. Completes the work
        │                                               │  6. Submits deliverables
        │  7. Reviews & approves ◄──────────────────────│
        │     ┌─────────────────────────────┐           │
        │     │   Contract auto-releases    │           │
        │     │   98 USDC → Contributor     │───────────│
        │     │    2 USDC → DealVault fee   │           │
        │     └─────────────────────────────┘           │
```

### Deal Lifecycle (backend state machine)

```
CREATED → ACCEPTED → FUNDED → IN_PROGRESS → SUBMITTED → APPROVED → RELEASED
                                                 │
                                                 └──→ DISPUTED → RELEASED / REFUNDED (admin)
```

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) · React 18 · TypeScript · Tailwind | User interface |
| **Backend** | Node.js 20 · Express 5 · Mongoose 9 | API · deal metadata · bounty bot |
| **Database** | MongoDB | Users · deals · issues · applications |
| **Smart Contract** | Soroban (Rust, `no_std`) | Escrow logic · fund locking · release |
| **Network** | Stellar (testnet) | Settlement layer |
| **Asset** | USDC (`i128` amounts) | Escrow currency |
| **Wallet** | Stellar Wallets Kit (address selection only) | Wallet connection |
| **Auth** | GitHub OAuth + email/password · JWT (HS256, httpOnly cookie) | Login |
| **GitHub Bot** | Octokit GitHub App + webhooks | Issue/bounty tracking |
| **Infra** | Docker Compose (backend + frontend) · GitHub Actions CI | Deploys & tests |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- MongoDB (local or Atlas)
- Rust + [`stellar-cli`](https://developers.stellar.org/docs/tools/cli) (for contract development)
- Docker (optional)

### Backend

```bash
cd backend
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET, GitHub App creds
npm install
npm run dev               # http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL` to point at the backend (defaults assume `http://localhost:5000/api`).

> **Local dev note:** the auth JWT rides an httpOnly cookie. With the frontend on `:3000`
> and the API on `:5000` over plain http, the cookie will not be sent cross-origin —
> serve both behind one proxy (same origin) for login to work in dev.

### Docker

```bash
cd docker
docker compose up --build   # 2 services: backend + frontend (no MongoDB container)
```

> **Note:** compose does not define a MongoDB service — point `MONGODB_URI` at Atlas or
> a separately-run instance. Env loading from the repo-root `.env` is currently broken
> when running from `docker/` (no `env_file:` key); export the variables in your shell
> or add `env_file` entries.

---

## 📁 Project Structure

```
dealvault-platform-escrow/
│
├── backend/                    # Node.js + Express 5 API
│   ├── controllers/            # auth, deals, applications, issues, webhooks
│   ├── models/                 # User, Deal, Issue, Application (Mongoose)
│   ├── routes/                 # API endpoints
│   ├── middleware/             # auth (JWT), sanitize, error handler
│   ├── services/               # GitHub App bot (Octokit)
│   └── tests/                  # Jest + supertest + mongodb-memory-server
│
├── frontend/                   # Next.js 14 (App Router) + TypeScript
│   └── src/
│       ├── app/                # Routes: landing, bounties, dashboard, profile, …
│       ├── context/            # AuthContext (JWT via cookie + /auth/me)
│       └── components/         # UI components
│
├── contracts/
│   └── escrow/                 # Soroban escrow contract (Rust)
│       ├── src/lib.rs          # fund_escrow / release_funds / refund_maintainer
│       └── Cargo.toml
│
├── docs/                       # Architecture, API, deployment, contract docs
└── docker/                     # Dockerfiles + docker-compose.yml
```

---

## 📜 Smart Contract

The Soroban escrow contract (`contracts/escrow/src/lib.rs`) holds USDC and enforces payment rules.

### Entry Points

| Function | Caller | Description |
|---|---|---|
| `fund_escrow(deal_id, maintainer, contributor, usdc_token, amount, platform_wallet, admin)` | Maintainer | Locks USDC; persists deal, fee destination, and refund admin |
| `release_funds(deal_id, maintainer)` | Maintainer | Releases 98% to contributor, 2% to the platform wallet stored at fund time |
| `refund_maintainer(deal_id, admin, maintainer)` | Stored admin only | Refunds the full amount on dispute |

Hardening in place: settle-once state guards (no double release/refund), checked `i128`
arithmetic, persisted fee destination and refund authority, typed per-deal storage keys,
and `Funded`/`Released`/`Refunded` events.

### Build & Deploy to Testnet

```bash
cd contracts/escrow
stellar contract build

stellar contract deploy \
  --wasm target/wasm32v1-none/release/escrow.wasm \
  --source-account alice \
  --network testnet \
  --alias dealvault_escrow
```

### Fee Structure

```
Deal amount:        100 USDC
Platform fee (2%):    2 USDC  → DealVault platform wallet
Contributor gets:    98 USDC  → Auto-released by contract
Stellar gas:        ~0.00001 XLM  → Network only
```

---

## 🧪 Testing

```bash
# Backend (Jest + in-memory MongoDB)
cd backend
npm test
npm run test:coverage

# Contract (compiles; no unit tests yet — write them before testnet deploy)
cd contracts/escrow
cargo test
```

CI (`.github/workflows/test.yml`) runs backend tests + coverage, frontend type-check +
build, `cargo test` on the contract, and `npm audit` on every push and pull request.

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'add: your feature'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👥 Team

Built with ❤️ by a team of three — solving real trust problems in open source and freelance collaboration.

---

## 📄 License

MIT © DealVault Contributors

<div align="center">

<br/>

**Built on Stellar · Powered by Soroban · Secured by USDC**

<br/>

<a href="#">⭐ Star this repo if DealVault helped you</a>

</div>
