<div align="center">
<img width="2103" height="748" alt="Dlogo" src="https://github.com/user-attachments/assets/305aed40-06d5-4166-8346-6d0a815240aa" />
  <h1>DealVault</h1>

  <p>
    <strong>Escrow Infrastructure for Open Source Bounties, Freelance Contracts, and Global Payments on Stellar.</strong>
  </p>

  <p>
    Lock funds before work begins. Release payments automatically through Soroban smart contracts.
  </p>

  <p>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="MIT License" />
    </a>
  </p>
</div>

---

## Overview

DealVault is a decentralized escrow platform built on Stellar and Soroban.

Project owners can lock funds before work begins, ensuring contributors, freelancers, and contractors have guaranteed payment once agreed conditions are met.

By moving escrow on-chain, DealVault removes the need to trust intermediaries while providing transparent and auditable settlement.

---

## Why DealVault?

Traditional freelance and bounty payments rely on trust.

* Clients may disappear after work is completed.
* Contributors often wait days or weeks to receive payment.
* Cross-border transfers are slow and expensive.
* Centralized platforms act as custodians and charge significant fees.

DealVault solves this by locking funds in a Soroban smart contract before work starts.

Once work is approved, payment is released automatically according to the escrow agreement.

### Key Benefits

* Escrow-backed payments
* Instant settlement
* Global accessibility
* Transparent on-chain transactions
* Support for Stellar assets including USDC and XLM
* Built-in dispute workflows

---

## Use Cases

### Open Source Bounties

Fund GitHub issues and pay contributors through escrow-backed rewards.

### Freelance Contracts

Protect both clients and freelancers with milestone-based payments.

### Service Agreements

Manage contractor and agency payments without relying on intermediaries.

### Marketplace Transactions

Secure transactions between buyers and sellers using programmable escrow.

---

## Technology Stack

| Layer           | Technology                |
| --------------- | ------------------------- |
| Frontend        | React, TypeScript, Vite   |
| Backend         | Node.js, Express          |
| Database        | MongoDB                   |
| Smart Contracts | Soroban (Rust)            |
| Network         | Stellar                   |
| Assets          | USDC, XLM, Stellar Assets |

---

## Getting Started

### Prerequisites

* Node.js ≥ 20
* MongoDB
* Docker (optional)

### Backend

```bash
cd backend

cp .env.example .env

npm install
npm run dev
```

Server runs on:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5174
```

### Docker

```bash
cd docker

docker compose up --build
```

---

## Project Structure

```text
dealvault-platform-escrow/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── tests/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── images/
│       └── App.tsx
│
├── contracts/
│   └── soroban/
│
└── docker/
```

---

## Smart Contract

Core escrow operations:

* `init_escrow` — Lock funds into escrow
* `release` — Release funds to the recipient
* `refund` — Return funds to the sender
* `dispute` — Escalate an escrow for arbitration

Deploy:

```bash
stellar contract deploy --wasm escrow.wasm
```

---

## Testing

```bash
cd backend

npm test
npm run test:coverage
```

---

## License

MIT © DealVault Contributors
