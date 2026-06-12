# DealVault Smart Contract Documentation

## Overview

DealVault uses a **Soroban escrow contract** (Rust, `no_std`) on the Stellar network to
hold USDC trustlessly between a maintainer (funder) and a contributor. The whole
contract lives in `contracts/escrow/src/lib.rs`.

> An orphaned native **Solana** program exists at `contracts/solana/` — it does not
> compile, is unused, and is **not** a deliverable. This document covers the live
> Soroban contract only.

## Contract Address
```
Testnet: <deploy and update here>
Mainnet: not deployed (out of MVP scope)
```

---

## Entry Points

### `fund_escrow`

```rust
fund_escrow(env, deal_id: Symbol, maintainer: Address, contributor: Address,
            usdc_token: Address, amount: i128, platform_wallet: Address, admin: Address)
```

Called by the **maintainer** (`maintainer.require_auth()`). Transfers `amount` USDC from
the maintainer into the contract and persists the deal.

Checks:
- `amount > 0` (`amount_zero`)
- `contributor != maintainer` (`same_party`)
- `admin != maintainer` (`admin_is_maintainer`) — the maintainer has **no self-refund ability**

Stores per-deal (persistent storage, typed `DataKey` entries):
- `Deal(deal_id)` → `(contributor, amount, usdc_token)`
- `Admin(deal_id)` → refund authority (fixed at fund time)
- `Platform(deal_id)` → fee destination (fixed at fund time — `release_funds` cannot redirect it)
- `State(deal_id)` → `DealState::Active`

Emits `Funded { deal_id, amount, contributor, maintainer }`.

---

### `release_funds`

```rust
release_funds(env, deal_id: Symbol, maintainer: Address)
```

Called by the **maintainer** on approval. Pays **98%** to the contributor and **2%** to
the platform wallet stored at fund time.

Guards:
- Deal must exist (`deal_not_found`)
- `State == Active` (`already_settled`) — blocks double-release and release-after-refund
- State is flipped to `Released` **before** any transfer (settle-once)
- Fee math uses checked `i128` arithmetic (`arithmetic_overflow`)

Emits `Released { deal_id, amount }`.

---

### `refund_maintainer`

```rust
refund_maintainer(env, deal_id: Symbol, admin: Address, maintainer: Address)
```

Dispute path. Only the **admin persisted at fund time** may refund: the supplied `admin`
is compared to the stored one (`not_admin`) and then `stored_admin.require_auth()` is
required. Refunds the full amount to the maintainer.

Guards: deal exists, `State == Active`, state flipped to `Refunded` before the transfer.

Emits `Refunded { deal_id, amount }`.

---

## On-Chain State

```rust
enum DataKey {            // persistent storage, per deal_id
  Deal(Symbol),           // (contributor: Address, amount: i128, usdc_token: Address)
  State(Symbol),          // DealState
  Admin(Symbol),          // refund authority
  Platform(Symbol),       // fee destination
}

enum DealState { Active, Released, Refunded }
```

### State Lifecycle

```
fund_escrow ──► Active ──release_funds──► Released   (terminal)
                  │
                  └──refund_maintainer──► Refunded   (terminal)
```

---

## Security Properties

| Check                       | Implementation                                          |
|-----------------------------|---------------------------------------------------------|
| Funder authorization        | `maintainer.require_auth()` on fund/release             |
| Refund authorization        | Stored admin compared + `require_auth()`                |
| No self-refund              | `admin != maintainer` enforced at fund time             |
| Settle-once                 | `DealState` guard; state flipped **before** transfers   |
| Fee-redirect prevention     | `platform_wallet` persisted at fund time, not caller-supplied on release |
| Self-deal prevention        | `contributor != maintainer`                             |
| Zero/negative amounts       | `amount > 0` asserted                                   |
| Overflow protection         | `checked_mul` / `checked_div` / `checked_sub` on `i128` |
| Auditability                | `Funded` / `Released` / `Refunded` contract events      |

## Known Limitations

- **Persistent-storage TTL is not extended on access.** A long-lived deal could hit
  storage expiration and become unreadable (funds strandable). Planned fix:
  `env.storage().persistent().extend_ttl(&key, threshold, extend_to)` on access.
- **No unit tests yet** — CI (`contract-test` job) proves compilation only. Write tests
  before any testnet deploy you intend to rely on.
- `Symbol` deal IDs are limited to ≤32 characters.
- The backend and frontend are **not wired to this contract** — DB deal status is
  self-attested, not chain-verified.

---

## Local Development

### Prerequisites
- [Rust](https://rustup.rs/) + `cargo`
- [`stellar-cli`](https://developers.stellar.org/docs/tools/cli)

### Build
```bash
cd contracts/escrow
stellar contract build      # or: cargo build
```

### Test
```bash
cargo test                  # currently 0 tests — compilation check only
```

### Deploy to Testnet
```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/escrow.wasm \
  --source-account <your-account> \
  --network testnet \
  --alias dealvault_escrow
```
