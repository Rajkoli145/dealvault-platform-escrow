# DealVault REST API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production:  <!-- TODO: verify — no production deployment is defined in the repo -->
```

## Authentication

The API issues a JWT (**HS256**, expires after 7 days — configurable via `JWT_EXPIRES_IN`).

- `POST /auth/register` and `POST /auth/login` return the token in the JSON body **and**
  set it as an `httpOnly` cookie named `jwt`.
- The GitHub OAuth callback sets the `httpOnly` cookie only (never the URL).
- Protected endpoints accept either the cookie or a Bearer header:

```
Authorization: Bearer <token>
```

> **Local dev note:** cross-origin (`:3000` → `:5000`, plain http) the cookie is not sent —
> serve frontend + API same-origin behind a proxy, or use the Bearer header.

## Rate Limits (disabled in `NODE_ENV=test`)

| Scope | Limit |
|---|---|
| All `/api/` routes | 100 req / minute |
| `POST /auth/login` | 10 req / 15 minutes |
| `POST /auth/register` | 5 req / 15 minutes |
| `/auth/wallet` | 5 req / hour |
| `GET /auth/github/callback` | 20 req / hour |

---

## Endpoints

### Health Check

#### `GET /health`
Returns server health status.

**Response `200`**
```json
{
  "success": true,
  "status": "OK",
  "environment": "production",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

### Auth

#### `POST /auth/register`
Register a new user account.

**Request Body**
| Field    | Type   | Required | Description                       |
|----------|--------|----------|-----------------------------------|
| name     | string | ✅       | Full name (2–100 characters)      |
| email    | string | ✅       | Valid email address               |
| password | string | ✅       | Min 8 chars, upper+lower+number   |
| role     | string | ❌       | `buyer` or `seller` (default: buyer) |

**Response `201`**
```json
{
  "success": true,
  "token": "<jwt>",
  "data": { "user": { "_id": "...", "name": "...", "email": "...", "role": "buyer", "...": "..." } }
}
```

**Errors:** `400 VALIDATION_ERROR`, `409` email already registered

---

#### `POST /auth/login`
Login with email and password.

**Request Body:** `email`, `password` (both required)

**Response `200`:** same shape as register.

**Errors:** `400 VALIDATION_ERROR`, `401 Invalid credentials`, `403 Account suspended`

---

#### `GET /auth/github`
Redirects to GitHub OAuth (sets a CSRF `state` nonce in an httpOnly cookie).

#### `GET /auth/github/callback`
GitHub OAuth callback. Verifies the `state` nonce, signs in (or creates) the user,
sets the `jwt` httpOnly cookie, and redirects back to the frontend.

---

#### `GET /auth/me` 🔒
Get the currently authenticated user.

#### `PATCH /auth/change-password` 🔒
Change current user's password. Body: `currentPassword`, `newPassword`.

#### `POST /auth/wallet` 🔒
Link a Stellar wallet address (validated StrKey). Body: `walletAddress`.

#### `PATCH /auth/profile` 🔒
Update profile fields.

#### `POST /auth/logout`
Clears the JWT cookie.

> `PATCH /auth/role` was **removed** — self-service role changes were a privilege-escalation
> vector. Role changes require an admin-only flow (not yet built).

---

### Deals

All deal routes require authentication.

#### `POST /deals` 🔒
Create a new escrow deal (buyer only).

**Request Body**
| Field       | Type   | Required | Description                              |
|-------------|--------|----------|------------------------------------------|
| title       | string | ✅       | 5–100 characters                         |
| description | string | ✅       | Min 20 characters                        |
| amount      | number | ✅       | Positive number                          |
| currency    | string | ❌       | `INR`, `USD`, `SOL`, `USDC` (default INR)|
| sellerId    | string | ✅       | Valid MongoDB ObjectId of seller         |
| deadline    | string | ✅       | ISO 8601 future date                     |

---

#### `GET /deals` 🔒
List deals for the authenticated user (paginated).

**Query Parameters**
| Param  | Type   | Description                              |
|--------|--------|------------------------------------------|
| status | string | Filter by status (optional)              |
| page   | number | Page number (default: 1)                 |
| limit  | number | Items per page (default: 10, max: 100)   |

---

#### `GET /deals/:id` 🔒
Get a single deal by ID. Only participants and admins can access.

---

#### `PATCH /deals/:id/status` 🔒
Update deal status. Role-based transitions enforced:

| From        | To            | Who       |
|-------------|---------------|-----------|
| CREATED     | ACCEPTED      | Seller    |
| CREATED     | CANCELLED     | Buyer/Admin|
| ACCEPTED    | FUNDED        | Buyer     |
| FUNDED      | IN_PROGRESS   | Seller    |
| IN_PROGRESS | SUBMITTED     | Seller    |
| SUBMITTED   | APPROVED      | Buyer     |
| SUBMITTED   | DISPUTED      | Buyer     |
| APPROVED    | RELEASED      | Buyer/Admin|
| DISPUTED    | RELEASED      | Admin     |
| DISPUTED    | REFUNDED      | Admin     |

> Status values are **database flags** — there is no on-chain verification today.

---

#### `POST /deals/:id/deliver` 🔒
Seller uploads delivery files (max 5 files, 10 MB each). Form data: `files` (multipart).

#### `POST /deals/:id/dispute` 🔒
Buyer raises a dispute on an active deal.

---

### GitHub Bounty Bot

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/webhooks/github` | POST | Webhook HMAC signature | GitHub webhook receiver (dedup on `X-GitHub-Delivery`) |
| `/issues` | GET | Public | List platform-tracked issues |
| `/issues/:owner/:repo/:number` | GET | Public | Get issue + applications |
| `/issues/:id/funding` | PATCH | Maintainer | Update issue funding |
| `/applications` | POST | 🔒 | Submit application |
| `/applications` | GET | 🔒 | List applications |
| `/applications/:id` | GET | 🔒 | Get application details |
| `/applications/:id/confirm` | PATCH | Maintainer | Confirm application |
| `/applications/:id/reject` | PATCH | Maintainer | Reject application |

---

## Error Format
All errors return a consistent structure:

```json
{
  "success": false,
  "status": "fail",
  "message": "Human-readable error message"
}
```

Validation errors include a detailed `errors` array:
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "errors": [
    { "field": "amount", "message": "Amount must be greater than 0" }
  ]
}
```
