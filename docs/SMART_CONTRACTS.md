# DealVault Smart Contract Documentation

## Overview

DealVault uses a **Solana on-chain escrow program** to hold funds trustlessly between buyers and sellers. The program is written in Rust using the native Solana program model with Borsh serialization.

## Program Address
```
Devnet:  <deploy and update here>
Mainnet: <deploy and update here>
```

---

## Architecture

```
lib.rs (entrypoint + dispatch)
├── instructions/
│   ├── init_escrow.rs   → instruction 0: lock funds
│   ├── release.rs       → instruction 1: pay seller
│   ├── refund.rs        → instruction 2: refund buyer
│   └── dispute.rs       → instruction 3: raise dispute
├── state.rs             → EscrowAccount struct (on-chain state)
└── error.rs             → EscrowError enum
```

---

## On-Chain State: `EscrowAccount`

Stored in a PDA (Program Derived Address) account:

| Field                        | Type         | Description                              |
|------------------------------|--------------|------------------------------------------|
| `is_initialized`             | bool         | Whether account is in use                |
| `buyer_pubkey`               | Pubkey       | Deal buyer                               |
| `seller_pubkey`              | Pubkey       | Deal seller                              |
| `temp_token_account_pubkey`  | Pubkey       | SPL token account holding funds          |
| `buyer_token_account_pubkey` | Pubkey       | Buyer's token account (for refunds)      |
| `seller_token_account_pubkey`| Pubkey       | Seller's token account (for release)     |
| `expected_amount`            | u64          | Amount locked in escrow                  |
| `status`                     | EscrowStatus | Current deal status                      |
| `deadline`                   | i64          | Unix timestamp of deadline               |
| `dispute_resolver`           | Option<Pubkey>| Admin/arbitrator for dispute resolution |
| `deal_id`                    | [u8; 32]     | Off-chain deal ID (for indexing)         |

**Account size:** 245 bytes

---

## Escrow Status Lifecycle

```
Created → Funded → InProgress → Submitted → Approved → Released
                                    ↓
                                 Disputed → Released (admin)
                                          → Refunded (admin)
```

---

## Instructions

### 0. InitEscrow
Initializes and funds the escrow account.

**Accounts:**
| # | Account                  | Writable | Signer | Description              |
|---|--------------------------|----------|--------|--------------------------|
| 0 | buyer                    | ❌       | ✅     | Deal initiator           |
| 1 | seller                   | ❌       | ❌     | Deal counterparty        |
| 2 | temp_token_account       | ✅       | ❌     | SPL token holding account|
| 3 | buyer_token_account      | ❌       | ❌     | Buyer's refund account   |
| 4 | seller_token_account     | ❌       | ❌     | Seller's payout account  |
| 5 | escrow_account           | ✅       | ❌     | PDA to store state       |
| 6 | rent sysvar              | ❌       | ❌     | Rent sysvar              |
| 7 | token_program            | ❌       | ❌     | SPL Token program        |

**Instruction Data (48 bytes):**
```
[0..8]   expected_amount  u64 little-endian
[8..16]  deadline         i64 little-endian (unix timestamp)
[16..48] deal_id          [u8; 32]
```

---

### 1. Release
Transfers escrowed funds to the seller. Called by the buyer after approving work.

**Required status:** `Submitted` or `Approved`  
**Signer:** Buyer

---

### 2. Refund
Returns escrowed funds to the buyer. Called by dispute resolver or buyer after deadline.

**Required status:** `Funded`, `InProgress`, or `Disputed`  
**Signer:** Dispute resolver OR buyer (only after deadline)

---

### 3. RaiseDispute
Marks escrow as disputed and records the dispute resolver's pubkey.

**Required status:** `InProgress` or `Submitted`  
**Signer:** Buyer

---

## Security

| Check                          | Implementation                              |
|--------------------------------|---------------------------------------------|
| Signer validation              | `account.is_signer` checked on every IX     |
| Self-deal prevention           | Buyer ≠ Seller enforced in InitEscrow       |
| Rent exemption                 | Verified against `Rent` sysvar              |
| Program ownership              | `escrow_account.owner == program_id`        |
| SPL Token program validation   | Verified against `spl_token::id()`          |
| State machine enforcement      | Invalid transitions return `InvalidState`   |
| Deadline enforcement           | Clock sysvar checked for time-based logic   |
| Overflow protection            | Rust's `checked_add` used for arithmetic    |

---

## Local Development

### Prerequisites
- [Rust](https://rustup.rs/) + `cargo`
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) `>=1.18`

### Build
```bash
cd contracts/solana
cargo build-sbf
```

### Test
```bash
cargo test
```

### Deploy to Devnet
```bash
solana config set --url devnet
solana program deploy target/deploy/dealvault_escrow.so
```
