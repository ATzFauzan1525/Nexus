# System Logic: UC-001 User Login

Document Version: v1.0

Use Case ID: UC-001

Use Case Name: User Login

Status: Draft

Last Updated: 2026-06-28

Author: System Analyst AI

---

## 1. Overview

This document defines the system logic for user authentication, including sequence diagrams and API contracts.

---

## 2. Related Pages

| Page | Route | Description |
|---|---|---|
| Login Page | `/login` | Username & password input form |
| Dashboard | `/dashboard` | Destination page after successful login |

---

## 3. Related Entities

| Entity | Table | Description |
|---|---|---|
| Pengguna | `pengguna` | User account data (username, password, role, department) |

---

## 4. Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Frontend
    participant API
    participant Database

    User->>Browser: Navigate to /login
    Browser->>Frontend: Load login page
    Frontend-->>User: Display login form

    User->>Frontend: Enter username & password
    User->>Frontend: Click "Masuk"

    Frontend->>Frontend: Validate input (not empty)

    alt Input valid
        Frontend->>API: POST /api/auth/login
        API->>Database: Query user by username

        alt User found
            API->>API: Verify password (bcrypt)
            alt Password match
                API->>API: Generate JWT token
                API-->>Frontend: 200 OK + JWT token
                Frontend->>Frontend: Store token (localStorage)
                Frontend->>Frontend: Join WebSocket rooms
                Frontend->>Browser: Redirect to /dashboard
                Frontend-->>User: Display Dashboard
            else Password mismatch
                API-->>Frontend: 401 Unauthorized
                Frontend-->>User: Show error "Invalid username or password"
            end
        else User not found
            API-->>Frontend: 401 Unauthorized
            Frontend-->>User: Show error "Invalid username or password"
        end
    else Input empty
        Frontend-->>User: Show validation error
    end
```

---

## 5. API Contract

### 5.1 POST /api/auth/login

Authenticate user and create session.

**Request Headers:**

| Header | Value |
|---|---|
| Content-Type | application/json |

**Request Body:**

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Request Example:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "nama_lengkap": "Admin TU",
      "role": "ADMIN_TU",
      "bidang": null
    }
  },
  "message": "Login successful"
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "data": null,
  "message": "Invalid username or password",
  "errors": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Username is required"
    },
    {
      "field": "password",
      "message": "Password is required"
    }
  ]
}
```

---

### 5.2 POST /api/auth/logout

Logout user and remove token from client.

**Request Headers:**

| Header | Value |
|---|---|
| Authorization | Bearer <jwt_token> |

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

**Client Actions on Logout:**
1. Remove JWT token from localStorage
2. Disconnect WebSocket
3. Redirect to `/login`

---

### 5.3 GET /api/auth/profile

Get authenticated user information.

**Request Headers:**

| Header | Value |
|---|---|
| Authorization | Bearer <jwt_token> |

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "admin",
    "nama_lengkap": "Admin TU",
    "role": "ADMIN_TU",
    "bidang": null,
    "is_active": true,
    "created_at": "2026-06-28T00:00:00Z"
  },
  "message": "Success"
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "data": null,
  "message": "Invalid token",
  "errors": []
}
```

---

## 6. Data Flow

| Step | Input | Process | Output |
|---|---|---|---|
| 1 | Username, Password | Frontend validation | Validated input |
| 2 | Validated credentials | API authentication | JWT token |
| 3 | JWT token | localStorage storage | Token stored |
| 4 | Token | WebSocket connection | Rooms joined |

---

## 7. Validation Rules

| Column | Rule | Error Message |
|---|---|---|
| username | Required, cannot be empty | "Username is required" |
| password | Required, cannot be empty | "Password is required" |
| username | Must exist in database | "Invalid username or password" |
| password | Must match bcrypt hash | "Invalid username or password" |

---

## 8. Security Rules

| Rule | Description |
|---|---|
| Password Hashing | Password is hashed using bcrypt with salt rounds >= 10 |
| JWT Token | Token is generated with secret key from env JWT_SECRET |
| Token Storage | Token is stored in localStorage (BR-14: only JWT allowed in localStorage) |
| Token Expiry | Token expires according to JWT configuration |

---

## 9. Business Rule References

| Code | Rule |
|---|---|
| BR-01 | Every user must login using username and password |
| BR-14 | localStorage may only be used for storing session tokens |

---

## 11. Traceability

| User Flow | Requirement | API Endpoint |
|---|---|---|
| userflow_uc_001.md | F-01, BR-01 | POST /api/auth/login |