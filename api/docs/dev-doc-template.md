# Assignment 3 – Developer Documentation

## 1. Overview

This API provides authenticated access to mail messages with role-based authorization.

It includes:

- JWT login via `/auth/login`
- RBAC rules on `/mail/:id` (admin can view all, user can view own only)
- Request logging with per-request UUIDs
- In-memory rate limiting for `/mail` endpoints
- Centralized, consistent JSON error responses

---

## 2. Authentication

### 2.1 Auth Method

- Scheme: Bearer token (JWT)
- How to obtain a token:
  - Endpoint: `POST /auth/login`
  - Request body format:
    ```json
    {
      "username": "user1",
      "password": "user123"
    }
    ```
  - Example success response:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
    ```

### 2.2 Using the Token

- Required header for authenticated requests:
  - `Authorization: Bearer <token>`

Token expiry behavior:

- Tokens are signed with `JWT_SECRET`.
- Tokens expire after 1 hour.

---

## 3. Roles & Access Rules

- `admin`
  - Can view any mail message.
- `user`
  - Can only view their own mail messages.

| Endpoint | Method | admin | user |
|---|---|---|---|
| `/mail/:id` | GET | Yes, all mail | Yes, own mail only |
| `/auth/login` | POST | Yes | Yes |
| `/status` | GET | Yes | Yes |

---

## 4. Endpoints

### 4.1 `POST /auth/login`

**Description:**  
Authenticate with username/password and receive a JWT.

**Request Body:**

```json
{
  "username": "user1",
  "password": "user123"
}
```

**Success Response (200):**

```json
{
  "token": "..."
}
```

**Notes:**

- `400 BadRequest` if username/password is missing.
- `401 Unauthorized` if credentials are invalid.

---

### 4.2 `GET /mail/:id`

**Description:**
Retrieve a single mail message by ID.

**Authentication:**

* Requires `Authorization: Bearer <token>` header.

**Access Rules:**

* `admin`: may view any mail ID.
* `user`: may view only mail where `mail.userId` matches their own `userId`.

**Example Request:**

```bash
curl http://localhost:3000/mail/2 \
  -H "Authorization: Bearer <token>"
```

**Example Success Response (200):**

```json
{
  "id": 2,
  "userId": 2,
  "subject": "Hello User1",
  "body": "Your report is ready."
}
```

**Example Forbidden Response (when user tries to access someone else’s mail):**

```json
{
  "error": "Forbidden",
  "message": "User does not have permission to access this resource.",
  "statusCode": 403,
  "requestId": "b6ae5a06-9024-4d29-a845-70df0d70cc7d",
  "timestamp": "2026-04-23T14:22:00.000Z"
}
```

---

### 4.3 `GET /status`

**Description:**
Simple health check to confirm the API is running.

**Authentication:**

* None required.

**Example Response (200):**

```json
{
  "status": "ok"
}
```

---

## 5. Rate Limiting

Rate limiting is applied to `/mail` routes.

- Keyed by client IP (`req.ip`)
- Window size from `RATE_LIMIT_WINDOW_SECONDS`
- Max requests from `RATE_LIMIT_MAX`
- When exceeded:
  - Request fails with `429 TooManyRequests`
  - `Retry-After` response header is set (seconds)

Example response body:

```json
{
  "error": "TooManyRequests",
  "message": "Rate limit exceeded. Please try again later.",
  "statusCode": 429,
  "requestId": "8172d4c7-20d1-45c0-bf56-86ff12f7a91c",
  "timestamp": "2026-04-23T14:30:00.000Z"
}
```

---

## 6. Error Response Format

Briefly describe the standard error JSON returned by your centralized error handler.

Example:

```json
{
  "error": "Forbidden",
  "message": "User does not have permission to access this resource.",
  "statusCode": 403,
  "requestId": "req-abc123",
  "timestamp": "2025-11-30T14:35:00Z"
}
```

Common categories used by this API:

- `BadRequest`
- `Unauthorized`
- `Forbidden`
- `NotFound`
- `TooManyRequests`
- `InternalServerError`

---

## 7. Example Flows

Provide at least one complete “happy path” and one “error path”:

### 7.1 Happy Path: Login + Access Own Mail

1. `POST /auth/login` as `user1` → receive token.
2. `GET /mail/2` with that token → receive mail details.

Include the exact curl commands and example responses.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"user123"}'
```

Example response:

```json
{
  "token": "<jwt-token>"
}
```

```bash
curl http://localhost:3000/mail/2 \
  -H "Authorization: Bearer <jwt-token>"
```

Example response:

```json
{
  "id": 2,
  "userId": 2,
  "subject": "Hello User1",
  "body": "Your report is ready."
}
```

### 7.2 Error Path: User Accessing Someone Else’s Mail

1. Login as `user1`.
2. `GET /mail/1` (which belongs to another user).
3. Show the `403` response.

```bash
curl http://localhost:3000/mail/1 \
  -H "Authorization: Bearer <jwt-token-for-user1>"
```

Example response:

```json
{
  "error": "Forbidden",
  "message": "User does not have permission to access this resource.",
  "statusCode": 403,
  "requestId": "36d5a3b5-85b8-4531-ab86-f9f1d451b5dd",
  "timestamp": "2026-04-23T14:35:00.000Z"
}
```

Rate-limit example with the same token after too many `/mail` requests in one window:

```json
{
  "error": "TooManyRequests",
  "message": "Rate limit exceeded. Please try again later.",
  "statusCode": 429,
  "requestId": "95f8d3bf-cf5c-4e72-903d-c0342ee7fddf",
  "timestamp": "2026-04-23T14:36:00.000Z"
}
```