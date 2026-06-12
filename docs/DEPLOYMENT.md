# DealVault Deployment Guide

## Prerequisites

### Tools Required
- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.20
- [Node.js](https://nodejs.org/) ≥ 20 (for local dev)
- [Rust](https://rustup.rs/) + `cargo` (for smart contract builds)
- [`stellar-cli`](https://developers.stellar.org/docs/tools/cli) (for contract build/deploy)

---

## 1. Local Development (Without Docker)

### Backend
```bash
cd backend
cp ../.env.example .env  # Fill in your values
npm install
npm run dev              # Starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev              # Starts on http://localhost:3000
```

Frontend env: `NEXT_PUBLIC_API_URL` (defaults assume `http://localhost:5000/api`).

> **Auth in local dev:** the JWT rides an httpOnly cookie. Cross-origin over plain http
> (frontend `:3000`, API `:5000`) the cookie is not sent — serve both behind one proxy
> (same origin) for the session to establish.

### Required `.env` variables (backend — see `.env.example` for the full list)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dealvault
JWT_SECRET=<long-random-secret-min-64-chars>
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=http://localhost:3000

# GitHub OAuth (login)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
CLIENT_URL=http://localhost:3000

# GitHub App (bounty bot) — see docs/github-bot-setup.md
GITHUB_APP_ID=...
GITHUB_APP_PRIVATE_KEY=...        # base64-encoded PEM (or raw PEM)
GITHUB_WEBHOOK_SECRET=...         # REQUIRED — server refuses to start without it
GITHUB_APP_INSTALLATION_ID=...
PLATFORM_BASE_URL=http://localhost:3000
```

---

## 2. Docker (Backend + Frontend)

Compose defines **2 services**: `backend` and `frontend`. There is **no MongoDB
container** — point `MONGODB_URI` at Atlas or a separately-run instance.

```bash
cd docker
docker compose up --build
```

Services:
- Frontend → http://localhost:3000 (Next.js standalone server)
- Backend  → http://localhost:5000

> **Known issue:** `docker-compose.yml` has no `env_file:` key and the repo-root `.env`
> is not auto-read when running from `docker/`. Export the required variables in your
> shell (or add `env_file: ../.env` to both services) before `docker compose up`.

`.dockerignore` files at the repo root, `backend/`, and `frontend/` keep `.env`,
`node_modules/`, build artifacts, and `.git/` out of the image contexts.

### Stop
```bash
docker compose down
```

---

## 3. Production Deployment

<!-- TODO: verify — no production infrastructure is defined in this repo. The steps
     below are generic VPS guidance, not a documented deployed setup. -->

### Environment Variables (production `.env`)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dealvault
JWT_SECRET=<long-random-secret-min-64-chars>
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=https://<your-frontend-domain>
# + GitHub OAuth and GitHub App variables as above
```

> In production the auth cookie is set with `SameSite=None; Secure` — HTTPS is required
> for cross-site frontend/backend deployments.

### Deploy Steps
```bash
git clone https://github.com/DealVaultHQ/dealvault-platform-escrow
cd dealvault-platform-escrow
# provide production env values (see Known issue above re: env_file)

cd docker
docker compose -f docker-compose.yml up -d --build
```

---

## 4. Smart Contract Deployment (Soroban / Stellar)

### Build
```bash
cd contracts/escrow
stellar contract build
```

Built WASM at: `target/wasm32v1-none/release/escrow.wasm`

### Deploy to Testnet
```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/escrow.wasm \
  --source-account <your-account> \
  --network testnet \
  --alias dealvault_escrow
```

> The contract currently has **no unit tests** (CI proves compilation only) and the
> backend/frontend are **not wired to the chain**. Write contract tests before any
> testnet deploy you intend to rely on. Mainnet deployment is out of scope for the MVP.

---

## 5. CI/CD (GitHub Actions)

The pipeline (`.github/workflows/test.yml`) runs on every push to `main`/`develop` and
every pull request:

1. **backend-test** — Jest suites + coverage (MongoDB service container)
2. **frontend-test** — TypeScript type-check + Next.js build
3. **contract-test** — `cargo test` on `contracts/escrow/`
4. **security** — `npm audit` (backend + frontend, critical level)

### Required GitHub Secrets
| Secret           | Description                      |
|------------------|----------------------------------|
| `CODECOV_TOKEN`  | (Optional) Code coverage upload  |

---

## 6. Monitoring & Observability

### Logs
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### Health Checks
- Backend: `GET /api/health` (also used by the compose healthcheck)

### Recommended Production Add-ons
- **Error tracking:** [Sentry](https://sentry.io) — add `@sentry/node` to backend
- **APM:** [Datadog](https://www.datadoghq.com) or [New Relic](https://newrelic.com)
- **Uptime monitoring:** [BetterUptime](https://betterstack.com/better-uptime)
