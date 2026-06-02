# DealVault Deployment Guide

## Prerequisites

### Tools Required
- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.20
- [Node.js](https://nodejs.org/) ≥ 20 (for local dev)
- [Rust](https://rustup.rs/) + `cargo` (for smart contract builds)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) ≥ 1.18

---

## 1. Local Development (Without Docker)

### Backend
```bash
cd backend
cp .env.example .env    # Fill in your values
npm install
npm run dev             # Starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env    # Fill in VITE_API_URL etc.
npm install
npm run dev             # Starts on http://localhost:5173
```

### Required `.env` variables (backend)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dealvault
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=http://localhost:5173
```

---

## 2. Docker (Full Stack)

```bash
# From project root
cp .env.example .env         # Fill in JWT_SECRET at minimum
cd docker
docker compose up --build    # Builds and starts all 3 services
```

Services:
- Frontend → http://localhost
- Backend  → http://localhost:5000
- MongoDB  → localhost:27017

### Stop
```bash
docker compose down           # Stop containers
docker compose down -v        # Stop + remove volumes (⚠️ deletes DB)
```

---

## 3. Production Deployment (VPS / Cloud)

### Environment Variables (production `.env`)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dealvault
JWT_SECRET=<long-random-secret-min-64-chars>
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=https://dealvault.io
MONGO_ROOT_USER=admin
MONGO_ROOT_PASS=<secure-password>
```

### Deploy Steps
```bash
git clone https://github.com/your-org/dealvault-platform-escrow
cd dealvault-platform-escrow
cp .env.example .env
# Edit .env with production values

cd docker
docker compose -f docker-compose.yml up -d --build
```

---

## 4. Smart Contract Deployment (Solana)

### Build
```bash
cd contracts/solana
cargo build-sbf
```

Built program at: `target/deploy/dealvault_escrow.so`

### Deploy to Devnet
```bash
solana config set --url devnet
solana airdrop 2                  # Get test SOL
solana program deploy target/deploy/dealvault_escrow.so
```

### Deploy to Mainnet
```bash
solana config set --url mainnet-beta
# Ensure wallet has enough SOL for deployment (~2–3 SOL)
solana program deploy target/deploy/dealvault_escrow.so
```

Update the program address in your frontend `.env`:
```env
VITE_ESCROW_PROGRAM_ID=<deployed_program_id>
```

---

## 5. CI/CD (GitHub Actions)

The pipeline (`.github/workflows/test.yml`) automatically:
1. Runs backend tests with a MongoDB service container
2. Type-checks and builds the frontend
3. Runs `npm audit` for security vulnerabilities

### Required GitHub Secrets
| Secret           | Description                      |
|------------------|----------------------------------|
| `JWT_SECRET`     | JWT signing secret for tests     |
| `CODECOV_TOKEN`  | (Optional) Code coverage upload  |

---

## 6. Monitoring & Observability

### Logs
```bash
docker compose logs -f backend    # Stream backend logs
docker compose logs -f frontend   # Stream nginx logs
```

### Health Checks
- Backend: `GET /api/health`
- Frontend: `GET /health` (nginx)
- MongoDB: `docker compose ps` shows health status

### Recommended Production Add-ons
- **Error tracking:** [Sentry](https://sentry.io) — add `@sentry/node` to backend
- **APM:** [Datadog](https://www.datadoghq.com) or [New Relic](https://newrelic.com)
- **Uptime monitoring:** [BetterUptime](https://betterstack.com/better-uptime)
