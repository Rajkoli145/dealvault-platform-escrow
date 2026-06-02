# DealVault REST API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production:  https://api.dealvault.io/api
```

## Authentication
All protected endpoints require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are issued on login/register and expire after 7 days (configurable via `JWT_EXPIRES_IN`).

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

**Rate Limit:** 5 requests / 15 minutes

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
  "data": {
    "user": {
      "_id": "...",
      "name": "Aman Koli",
      "email": "aman@example.com",
      "role": "buyer",
      "accountStatus": "active",
      "reputationScore": 100,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

**Errors**
| Code | Error                  | Reason                    |
|------|------------------------|---------------------------|
| 400  | `VALIDATION_ERROR`     | Invalid input fields      |
| 409  | -                      | Email already registered  |

---

#### `POST /auth/login`
Login with email and password.

**Rate Limit:** 5 requests / 15 minutes

**Request Body**
| Field    | Type   | Required |
|----------|--------|----------|
| email    | string | ✅       |
| password | string | ✅       |

**Response `200`**
```json
{
  "success": true,
  "token": "<jwt>",
  "data": { "user": { ... } }
}
```

**Errors:** `400 VALIDATION_ERROR`, `401 Invalid credentials`, `403 Account suspended`

---

#### `GET /auth/me` 🔒
Get the currently authenticated user.

**Response `200`**
```json
{
  "success": true,
  "data": { "user": { ... } }
}
```

---

#### `PATCH /auth/change-password` 🔒
Change current user's password.

**Request Body**
| Field           | Type   | Required |
|-----------------|--------|----------|
| currentPassword | string | ✅       |
| newPassword     | string | ✅       |

---

#### `POST /auth/logout` 🔒
Invalidates the JWT cookie.

**Response `200`**
```json
{ "success": true, "message": "Logged out successfully." }
```

---

### Deals

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

**Response `201`**
```json
{
  "success": true,
  "data": {
    "deal": {
      "_id": "...",
      "title": "Logo Design",
      "status": "CREATED",
      "amount": "10000",
      "currency": "INR",
      "deadline": "2026-02-01T00:00:00.000Z",
      "buyerId": "...",
      "sellerId": "..."
    }
  }
}
```

---

#### `GET /deals` 🔒
List deals for the authenticated user (paginated).

**Query Parameters**
| Param  | Type   | Description                              |
|--------|--------|------------------------------------------|
| status | string | Filter by status (optional)              |
| page   | number | Page number (default: 1)                 |
| limit  | number | Items per page (default: 10, max: 100)   |

**Response `200`**
```json
{
  "success": true,
  "data": {
    "deals": [...],
    "pagination": { "page": 1, "limit": 10, "total": 42, "pages": 5 }
  }
}
```

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

**Request Body**
```json
{ "status": "ACCEPTED" }
```

---

#### `POST /deals/:id/deliver` 🔒
Seller uploads delivery files (max 5 files, 10 MB each).

**Form Data:** `files` (multipart/form-data)

---

#### `POST /deals/:id/dispute` 🔒
Buyer raises a dispute on an active deal.

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
