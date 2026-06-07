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
    <img src="https://img.shields.io/badge/Status-Testnet-yellow?style=flat-square" alt="Status" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
  </a>
</p>

<br/>

<p>
  <a href="#-overview">Overview</a> ·
  <a href="#-why-dealvault">Why DealVault</a> ·
  <a href="#-how-it-works">How It Works</a> ·
  <a href="#-use-cases">Use Cases</a> ·
  <a href="#-technology-stack">Tech Stack</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-smart-contract">Smart Contract</a>
</p>

</div>

---

## 📌 Overview

**DealVault** is a decentralized escrow platform built on [Stellar](https://stellar.org) and [Soroban](https://soroban.stellar.org).

Project owners lock funds before work begins — ensuring contributors, freelancers, and contractors have **guaranteed payment** the moment agreed conditions are met.

By moving escrow entirely on-chain, DealVault removes the need to trust intermediaries while providing **transparent, auditable, and instant settlement** across 180+ countries.

> _"Every task should have verified funding. Every contributor should have payment protection."_

---

## ❓ Why DealVault?

Traditional freelance and bounty payments rely on trust alone — and trust fails.

| Problem | DealVault Solution |
|---|---|
| Clients disappear after work is done | Funds locked in escrow **before** work starts |
| Contributors wait weeks for payment | **Instant release** via Soroban smart contract |
| Cross-border transfers are slow & costly | Stellar settles globally in **3–5 seconds** for fractions of a cent |
| Platforms act as custodians with high fees | **Non-custodial** — only you and the contract control funds |
| No transparency in fund status | Every transaction **on-chain and auditable** |

### ✨ Key Benefits

- 🔐 **Escrow-backed payments** — funds locked until conditions are met
- ⚡ **Instant settlement** — Soroban contract releases automatically on approval
- 🌍 **Global accessibility** — works for anyone with a Stellar wallet
- 🔍 **Transparent on-chain transactions** — every action auditable
- 💵 **Multi-asset support** — USDC, XLM, and any Stellar asset
- ⚖️ **Built-in dispute workflows** — fair resolution with admin mediation
- 🏆 **Reputation system** — contributors rated after every deal

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

### Deal Lifecycle

```
CREATED → FUNDED → IN_PROGRESS → SUBMITTED → APPROVED → RELEASED
                                      │
                                      └──→ DISPUTED → (Admin resolves)
```

---

## 🎯 Use Cases

### 🐛 Open Source Bounties
Fund GitHub issues and pay contributors through escrow-backed rewards. Maintainers set a USDC reward per issue — contributors see verified funding before applying.

### 💼 Freelance Contracts
Protect both clients and freelancers with milestone-based payments. No more "pay me first" or "deliver first" standoffs.

### 📋 Service Agreements
Manage contractor and agency payments without relying on intermediaries. Smart contracts enforce the terms automatically.

### 🛒 Marketplace Transactions
Secure transactions between buyers and sellers using programmable escrow. Funds release only when the buyer confirms delivery.

### 🌐 Free Network Reports _(No Money Required)_
Maintainers can submit repos without any USDC — purely to grow network visibility, attract contributors, and build reputation. Upgradeable to funded at any time.

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React · TypeScript · Vite · Tailwind | User interface |
| **Backend** | Node.js · Express | API · deal metadata · notifications |
| **Database** | MongoDB | Users · deals · audit logs |
| **Smart Contracts** | Soroban (Rust) | Escrow logic · fund locking · release |
| **Network** | Stellar | Settlement · transaction layer |
| **Assets** | USDC · XLM · Stellar Assets | Escrow currency (USDC preferred) |
| **Wallet** | Freighter · Lobstr · xBull | User signs transactions |
| **Auth** | GitHub OAuth · Stellar Wallet | Login options |
| **Realtime** | Socket.io | Live notifications |
| **Hosting** | Vercel (FE) · Render (BE) | Deployment |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- MongoDB
- Rust + `stellar-cli` (for contract development)
- Docker (optional)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Server runs on:
```
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
```
http://localhost:5174
```

### Docker

```bash
cd docker
docker compose up --build
```

---

## 📁 Project Structure

```
dealvault-platform-escrow/
│
├── backend/                    # Node.js + Express API
│   ├── controllers/            # Route handlers
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API endpoints
│   └── tests/                  # Unit + integration tests
│
├── frontend/                   # React + TypeScript UI
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── images/             # Static assets
│       └── App.tsx             # Root component
│
├── contracts/                  # Soroban smart contracts
│   └── soroban/
│       ├── src/
│       │   ├── lib.rs          # Core escrow logic
│       │   └── test.rs         # Contract unit tests
│       └── Cargo.toml
│
└── docker/                     # Container configuration
    └── docker-compose.yml
```

---

## 📜 Smart Contract

The Soroban escrow contract is the **core of DealVault**. It holds USDC trustlessly and enforces all payment rules without any human intermediary.

### Core Functions

| Function | Description |
|---|---|
| `init_escrow` | Lock funds into escrow — called when maintainer funds a deal |
| `release` | Release funds to contributor — called on approval |
| `refund` | Return funds to sender — called on dispute ruling for client |
| `dispute` | Escalate escrow for admin arbitration |

### Deploy to Testnet

```bash
# Build the contract
stellar contract build

# Deploy to Stellar Testnet
stellar contract deploy \
  --wasm target/wasm32v1-none/release/escrow.wasm \
  --source-account alice \
  --network testnet \
  --alias dealvault_escrow
```

### Fee Structure

```
Deal amount:        100 USDC
Platform fee (2%):    2 USDC  → DealVault treasury
Contributor gets:    98 USDC  → Auto-released by contract
Stellar gas:        ~0.00001 XLM  → Network only
```

---

## 🧪 Testing

```bash
cd backend
npm test

# With coverage report
npm run test:coverage
```

Contract tests:
```bash
cd contracts/soroban
cargo test
```

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
