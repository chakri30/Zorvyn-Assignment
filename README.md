# Finance Dashboard Backend

A backend API for a finance dashboard system with role-based access control, built with Node.js, Express, PostgreSQL, and Prisma.

**Live API:** https://zorvyn-assignment-production.up.railway.app  
**GitHub:** https://github.com/chakri30/Zorvyn-Assignment

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT (jsonwebtoken)
- **Password hashing:** bcrypt
- **Rate limiting:** express-rate-limit
- **Testing:** Jest + Supertest

---

## Project Structure

```
├── server.js                  # App entry point
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── database.js        # Prisma client
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── recordcontroller.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── roles.js           # Role-based access
│   │   └── rateLimiter.js     # Rate limiting
│   └── routes/
│       ├── authRoutes.js
│       ├── userRoutes.js
│       ├── recordRoutes.js
│       └── dashboardRoutes.js
└── tests/
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL database

### Steps

**1. Clone the repo**
```bash
git clone https://github.com/chakri30/Zorvyn-Assignment.git
cd Zorvyn-Assignment
```

**2. Install dependencies**
```bash
npm install
```

**3. Create `.env` file**
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/finance_db"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
PORT=8080
```

**4. Run database migrations**
```bash
npx prisma migrate dev
```

**5. Start the server**
```bash
npm run dev
```

Server runs at `http://localhost:8080`

---

## Roles & Permissions

| Action | VIEWER | ANALYST | ADMIN |
|---|---|---|---|
| View dashboard summary | ✅ | ✅ | ✅ |
| View monthly trends | ✅ | ✅ | ✅ |
| View financial records | ✅ | ✅ | ✅ |
| Create financial records | ❌ | ❌ | ✅ |
| Update financial records | ❌ | ❌ | ✅ |
| Delete financial records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## API Reference

### Base URL
```
https://zorvyn-assignment-production.up.railway.app
```

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth

#### Register
```
POST /api/auth/register
```
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "ADMIN"
}
```
> `role` is optional. Defaults to `VIEWER`. Accepted values: `VIEWER`, `ANALYST`, `ADMIN`

**Response `201`**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2026-04-03T00:00:00.000Z"
  }
}
```

---

#### Login
```
POST /api/auth/login
```
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response `200`**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "ADMIN"
  }
}
```

---

### Financial Records

#### Create record `ADMIN only`
```
POST /api/records
```
```json
{
  "amount": 5000,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01",
  "notes": "Monthly salary"
}
```
> `type` must be `INCOME` or `EXPENSE`

---

#### Get all records
```
GET /api/records
```

**Query parameters (all optional):**

| Param | Example | Description |
|---|---|---|
| `type` | `INCOME` | Filter by type |
| `category` | `Salary` | Filter by category |
| `startDate` | `2026-01-01` | Records from this date |
| `endDate` | `2026-04-30` | Records up to this date |
| `search` | `rent` | Search in notes or category |
| `page` | `1` | Page number (default: 1) |
| `limit` | `10` | Records per page (default: 10) |

**Response `200`**
```json
{
  "records": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 25,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### Get single record
```
GET /api/records/:id
```

#### Update record `ADMIN only`
```
PUT /api/records/:id
```
```json
{
  "amount": 6000,
  "category": "Freelance"
}
```

#### Delete record `ADMIN only`
```
DELETE /api/records/:id
```
> Soft delete — record is marked as deleted, not permanently removed.

---

### Dashboard

#### Summary
```
GET /api/dashboard/summary
```

**Response `200`**
```json
{
  "summary": {
    "totalIncome": 15000,
    "totalExpenses": 8000,
    "netBalance": 7000,
    "totalRecords": 20
  },
  "categoryTotals": {
    "Salary": { "INCOME": 10000, "EXPENSE": 0 },
    "Rent": { "INCOME": 0, "EXPENSE": 3000 }
  },
  "recentActivity": [...]
}
```

---

#### Monthly Trends
```
GET /api/dashboard/trends?months=6
```

**Query parameters:**

| Param | Default | Description |
|---|---|---|
| `months` | `6` | Number of past months to include |

**Response `200`**
```json
{
  "trends": [
    {
      "month": "2026-01",
      "income": 5000,
      "expenses": 2000,
      "balance": 3000
    }
  ],
  "period": "6 months"
}
```

---

### User Management `ADMIN only`

#### Get all users
```
GET /api/users
```

#### Get single user
```
GET /api/users/:id
```

#### Update user role or status
```
PUT /api/users/:id
```
```json
{
  "role": "ANALYST",
  "isActive": false
}
```

#### Delete user
```
DELETE /api/users/:id
```

---

## Data Models

### User
| Field | Type | Description |
|---|---|---|
| `id` | Int | Auto-increment primary key |
| `email` | String | Unique |
| `password` | String | Bcrypt hashed |
| `name` | String | Display name |
| `role` | Enum | `VIEWER`, `ANALYST`, `ADMIN` |
| `isActive` | Boolean | Account status |
| `createdAt` | DateTime | Auto-set |

### Record
| Field | Type | Description |
|---|---|---|
| `id` | Int | Auto-increment primary key |
| `amount` | Decimal | 10,2 precision |
| `type` | Enum | `INCOME` or `EXPENSE` |
| `category` | String | e.g. Salary, Rent |
| `date` | DateTime | Transaction date |
| `notes` | String? | Optional description |
| `userId` | Int | Foreign key to User |
| `isDeleted` | Boolean | Soft delete flag |
| `deletedAt` | DateTime? | When deleted |

---

## Error Responses

| Status | Meaning |
|---|---|
| `400` | Bad request / missing required fields |
| `401` | Missing or invalid JWT token |
| `403` | Insufficient role permissions |
| `404` | Resource not found |
| `409` | Conflict (e.g. email already exists) |
| `429` | Too many requests (rate limited) |
| `500` | Internal server error |

---

## Rate Limiting

| Route | Limit |
|---|---|
| All routes | 100 requests / 15 minutes |
| `/api/auth/*` | 5 requests / 15 minutes |

---

## Assumptions & Design Decisions

- **Default role is VIEWER** — any registered user without an explicit role gets the lowest access level.
- **Soft delete on records** — financial data is never permanently deleted; `isDeleted` flag is set instead, preserving audit history.
- **Records are user-scoped** — each user sees only their own records. Admins manage users but records still belong to the creator.
- **Self-protection rules** — admins cannot delete themselves or demote their own role, preventing accidental lockout.
- **JWT expiry is 24 hours** — token must be refreshed by logging in again after expiry.
- **Analyst role** is defined and reserved for future differentiation (e.g. access to advanced analytics endpoints). Currently has the same read access as VIEWER.