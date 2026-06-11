# CLAUDE.md

Guidance for AI agents working in the DealVault repository. Read this first.

## Project Summary

DealVault is a decentralized escrow platform for open-source bounties. A maintainer
locks USDC into an on-chain escrow, a contributor delivers work (tracked via a GitHub
bot), and on approval the funds auto-release to the contributor (98%) with a 2%
platform fee. The repo is currently an **MVP/demo**: the marketing site, GitHub bounty
bot, and a minimal Soroban escrow contract are real; the end-to-end fund flow in the
frontend is simulated (localStorage), and there is no chain integration in the backend.

## Tech Stack (exact versions where visible)

- **Smart contract (live):** Rust + Soroban SDK (`soroban-sdk`), Stellar testnet. `contracts/escrow/`.
- **Smart contract (orphaned, do not ship):** native Solana program, `contracts/solana/`. Does NOT compile.
- **Backend:** Node.js, Express `^5.2.1`, Mongoose `^9.6.3` (MongoDB), `jsonwebtoken ^9.0.3`,
  `bcryptjs ^3.0.3`, `helmet ^8.2.0`, `express-rate-limit ^8.5.2`, `express-validator ^7.3.2`,
  `@octokit/rest ^22.0.1` + `@octokit/auth-app ^8.2.0`, `multer ^2.1.1`. Tests: Jest `^30`, supertest, mongodb-memory-server.
- **Frontend:** Next.js `14.2.35` (App Router, all client components), React `^18.3.1`, TypeScript `^5.5.3`
  (`strict: false`), Tailwind `^3.4.1`, `@creit.tech/stellar-wallets-kit 2.2.0`, `motion 12.40.0`,
  `lucide-react`. `@supabase/supabase-js` is a dead dependency. No `@stellar/stellar-sdk`.
- **Infra:** Docker (2 services: backend, frontend — no MongoDB container), GitHub Actions CI.

## Directory Map

```
contracts/escrow/        LIVE Soroban escrow contract (Rust, no_std). src/lib.rs = whole contract (~61 lines).
contracts/escrow/target/ Build artifacts — gitignored (removed from index, kept on disk).
contracts/solana/        ORPHANED native Solana program. Does not compile. Unused by anything. Ignore/delete.
backend/
  server.js              Express app: helmet, CORS, rate limiters, webhook raw-body, error handler.
  controllers/           authController, dealController, applicationController, issueController, webhookController.
  models/                User, Deal, Issue, Application (Mongoose schemas).
  routes/                auth, deals, applications, issues, webhooks.
  middleware/            auth.js (protect/restrictTo/optionalAuth), errorHandler.js.
  services/              githubBot.js (Octokit GitHub App), botMessages.js (comment templates).
  validators/index.js    express-validator chains.
  utils/                 AppError.js.
  tests/                 6 Jest suites (auth, deals, applications, webhook, middleware, user.model).
frontend/src/
  app/                   Routes: / (landing+MVP panel), auth/callback, onboarding, dashboard, profile,
                         bounties, bounties/[id], bounties/my, financial, maintainer-apply, docs.
  context/AuthContext.tsx  JWT auth (sessionStorage 'dv_token'), GitHub OAuth callback handling.
  utils/stellarWallet.ts   Wallet ADDRESS PICKER only (Stellar Wallets Kit, hardcoded TESTNET). No signing.
  lib/demoFlow.ts          100% SIMULATED escrow flow in localStorage. No backend/chain.
  components/            Marketing components + NavBar/AppNavBar (duplicated dropdown menus).
docker/                  Dockerfile.backend, Dockerfile.frontend, docker-compose.yml, nginx.conf (ORPHANED).
docs/                    ARCHITECTURE, API, DEPLOYMENT, SMART_CONTRACTS, github-bot-setup. Updated to
                         the Soroban+Next.js stack; uncertain spots carry <!-- TODO: verify --> markers.
.github/workflows/test.yml  CI: backend Jest+coverage, frontend tsc+build, cargo test (contract-test job).
```

## Core Concepts

**Escrow lifecycle (intended):** `fund_escrow` (maintainer locks USDC) → work delivered →
`release_funds` (maintainer approves; 98% contributor / 2% platform) OR `refund_maintainer`
(admin refunds on dispute). See `contracts/escrow/src/lib.rs`.

**On-chain vs off-chain split:**
- On-chain (Soroban): the 3 escrow functions above. This is the ONLY real fund-handling code.
- Off-chain (backend): a parallel **deal state machine that is pure DB enum** — `FUNDED/RELEASED/
  REFUNDED` are self-attested flags with NO chain verification; `escrowAddress`/`transactionHash`
  fields exist on `Deal` but are never written. The bounty bot mirrors GitHub issues + applications.
- Frontend: marketing + a simulated demo flow (localStorage). The wallet kit only picks an address.

**Key actors:** maintainer (funds escrow, approves release), contributor (delivers work, receives
payout), admin (resolves disputes / refunds), platform (takes 2% fee).

## How to Run

- **Backend:** `cd backend && npm install && npm run dev` (nodemon) or `npm start`. Needs `MONGODB_URI`,
  `JWT_SECRET`, GitHub App creds, `GITHUB_WEBHOOK_SECRET` in `.env` (see `backend/.env.example`).
- **Backend tests:** `cd backend && npm test` (Jest + mongodb-memory-server, in-memory; `--coverage` for thresholds).
- **Frontend:** `cd frontend && npm install && npm run dev` (Next dev, port 3000). Env: `NEXT_PUBLIC_API_URL`.
- **Frontend build:** `npm run build` (standalone output).
- **Soroban contract:** `cd contracts/escrow && cargo test` / `stellar contract build`. (No tests exist yet.)
- **Docker:** `cd docker && docker compose up --build`. NOTE: env loading is currently broken (no
  `env_file:` key; root `.env` is not auto-read from `docker/`). No MongoDB container is defined.

## Key Contracts

`contracts/escrow/src/lib.rs` — `EscrowContract` (Soroban). Entry points:
- `fund_escrow(env, deal_id, maintainer, contributor, usdc_token, amount)` — maintainer.require_auth();
  transfers USDC in; stores `(contributor, amount, usdc_token)` under `deal_id` in instance storage.
- `release_funds(env, deal_id, maintainer, platform_wallet)` — maintainer.require_auth(); 2% fee, 98% payout.
- `refund_maintainer(env, deal_id, admin, maintainer)` — admin.require_auth(); refunds full amount.

(`contracts/solana/` is orphaned and broken — not a deliverable.)

## Known Constraints / Soroban Quirks

- Wallet kit is hardcoded to **TESTNET** (`stellarWallet.ts:12`). Do not flip to mainnet without instruction.
- Deal data is now in **persistent** storage under typed `DataKey` entries per `deal_id`
  (Deal/State/Admin/Platform). **KNOWN LIMITATION (TTL):** persistent entries' TTL is NOT extended on
  read/write — a long-lived deal could hit storage expiration and become unreadable (funds strandable).
  Fix later: call `env.storage().persistent().extend_ttl(&key, threshold, extend_to)` on access. Tracked, not yet implemented.
- `Symbol` deal_id has length limits (≤32 chars). USDC `amount` is `i128`.
- Backend "escrow" state is NOT backed by chain. Stellar StrKeys are uppercase base32 + checksum.
- **Contract has no test module; CI (`contract-test` job) proves compilation only. Write unit
  tests before testnet deploy.**

## Known Issues / Tech Debt (post-hardening)

- **Repo ownership is username-based, not a real relation.** Maintainer authorization for
  confirm/reject application and `updateFunding` (`applicationController.js`, `issueController.js`)
  matches `req.user.githubUsername` against `Issue.addedBy` — a GitHub *username string* taken from
  the webhook `sender.login`, NOT a `User._id`. This is the best identity available today but is only
  as trustworthy as the labeler. **TODO:** add a proper `Repository → owner (User)` model and key
  authorization off that, then migrate the checks off `addedBy`.
- **Frontend `/auth/role` is a BROKEN flow.** The `PATCH /api/auth/role` endpoint was removed (it
  allowed self-service privilege escalation). `frontend/src/app/onboarding/page.tsx` and
  `dashboard/page.tsx` still call it → they now 404. **TODO:** build an admin-only role-change UI/endpoint;
  until then onboarding role selection does not persist.
- **`xss-clean` is deprecated/unmaintained.** It is wired via the Express 5-safe wrapper in
  `backend/middleware/sanitize.js`. Replace with `xss` or a DOMPurify-based sanitizer post-MVP.
- **Auth JWT is delivered via httpOnly cookie** (OAuth callback sets `jwt`, no longer in the URL).
  Cross-site this requires `SameSite=None; Secure` over HTTPS (set in production). **In local dev**
  (frontend `:3000`, API `:5000`, plain http) the cookie will NOT ride the XHR to `/auth/me` — serve
  frontend + API **same-origin behind a proxy** for dev, or the session won't establish. Relevant to
  Group 3 (frontend must read auth from the cookie + `/auth/me`, not localStorage).

## Do NOT Touch (without explicit instruction)

- `CLAUDE.md` — do not modify after generation without telling the user.
- Stellar network selection (testnet vs mainnet) anywhere.
- Existing tests — only add, never delete.
- `contracts/escrow/target/` — committed artifacts; flag for gitignore, don't hand-edit.

## Token-Saving Tips for Future Agents

- **Read first:** `contracts/escrow/src/lib.rs` (whole escrow, ~61 lines), `backend/controllers/*.js`,
  `backend/models/*.js`, `backend/middleware/auth.js`, `frontend/src/context/AuthContext.tsx`,
  `frontend/src/lib/demoFlow.ts`, `frontend/src/utils/stellarWallet.ts`.
- **Skip:** `contracts/escrow/target/` (build artifacts), `contracts/solana/` (orphaned, broken),
  `node_modules`, `frontend/public/images`, `frontend/src/app/docs/page.tsx` (1.2k-line static HTML blob),
  most marketing components in `frontend/src/components/`.
- **Trust the code over the docs:** `docs/` were rewritten for the Soroban+Next.js stack but the
  source of truth is still the code; verify `<!-- TODO: verify -->` sections before relying on them.
- Backend and frontend each have NO awareness of the chain — don't assume deal status reflects on-chain reality.
