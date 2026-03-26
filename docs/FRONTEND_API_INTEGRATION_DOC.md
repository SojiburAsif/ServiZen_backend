# ServiZen Backend API Documentation (Frontend Ready)

This document is prepared for frontend integration and Copilot-assisted implementation.

## 1) Base Setup

- Base API URL: `/api/v1`
- Auth provider endpoint (Better Auth): `/api/auth/*`
- Stripe webhook endpoint (server-to-server, not for frontend calls): `/webhook`
- Credentials: cookie-based auth is used, so send requests with credentials enabled.
- Main cookies used by backend:
- `accessToken`
- `refreshToken`
- `better-auth.session_token`

## 2) Global Response Contracts

### Success response shape

```json
{
  "success": true,
  "message": "...",
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  },
  "data": {}
}
```

Notes:
- `meta` appears in paginated endpoints.
- `data` type varies per endpoint.

### Error response shape

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Zod Validation Error",
  "errorSources": [
    {
      "path": "body => email",
      "message": "Invalid email address"
    }
  ],
  "error": {},
  "stack": "..."
}
```

Notes:
- `error` and `stack` are included only in development mode.
- `errorSources` is the key field for frontend field-level errors.

## 3) Roles and Auth Rules

### Roles
- `USER`
- `PROVIDER`
- `ADMIN`

### Session/auth behavior
- Protected routes use cookie auth + role check.
- Missing or invalid token returns `401`.
- Role mismatch returns `403`.
- Inactive/deleted users are blocked (`401`).
- Server can send session refresh hints via headers:
- `X-Session-Refresh: true`
- `X-Session-Expires-At: <iso-date>`
- `X-Time-Remaining: <ms>`

## 4) Enum Values (Important for UI filters/status badges)

### BookingStatus
- `PENDING`
- `ACCEPTED`
- `WORKING`
- `COMPLETED`
- `CANCELLED`

### PaymentStatus
- `UNPAID`
- `PAID`
- `REFUNDED`

### NotificationType
- `PAYMENT_COMPLETED`
- `PAYMENT_REMINDER`
- `BOOKING_COMPLETED`
- `REFUND_REQUEST`
- `BOOKING_CANCELLED_BY_USER`
- `BOOKING_CREATED_FOR_PROVIDER`
- `BOOKING_PAYMENT_PAID_FOR_PROVIDER`

## 5) Endpoint Catalog

All paths below are relative to `/api/v1` unless specified.

## 5.1 Auth (`/auth`)

### POST `/auth/register`
- Access: Public
- Validation body:
- `name` string (2-100)
- `email` valid email
- `password` string (min 6)
- `profilePhoto` optional URL
- `contactNumber` optional Bangladeshi phone format
- `address` optional (5-200)
- Success: `201`, message `User registered successfully`

### POST `/auth/login`
- Access: Public
- Validation body:
- `email` valid email
- `password` string (min 8)
- Success: `200`, message `User logged in successfully`

### GET `/auth/me`
- Access: `USER | ADMIN | PROVIDER`
- Success: `200`, message `Logged in user retrieved successfully`

### POST `/auth/refresh-token`
- Access: Public (cookie-based refresh)
- Reads `refreshToken` cookie
- Success: `200`, message `New tokens generated successfully`

### POST `/auth/change-password`
- Access: `USER | ADMIN | PROVIDER`
- Intended body fields (from validation schema):
- `currentPassword`
- `newPassword`
- `confirmNewPassword`
- Success: `200`, message `Password changed successfully`

### POST `/auth/logout`
- Access: `USER | ADMIN | PROVIDER`
- Clears auth cookies.
- Success: `200`, message `User logged out successfully`

### POST `/auth/verify-email`
- Access: Public
- Body expected by service:
- `email`
- `otp`
- Success: `200`, message `Email verified successfully`

### POST `/auth/forget-password`
- Access: Public
- Body expected by service:
- `email`
- Success: `200`, message `Password reset OTP sent to email successfully`

### POST `/auth/reset-password`
- Access: Public
- Body expected by service:
- `email`
- `otp`
- `newPassword`
- Success: `200`, message `Password reset successfully`

### GET `/auth/login/google`
- Access: Public
- Purpose: Starts Google login redirect flow.

### GET `/auth/google/success`
- Access: Public (callback)
- Purpose: Finalizes oauth and redirects to frontend.

## 5.2 Users (`/users`)

### POST `/users/create-provider`
- Access: Public (currently no role guard in route)
- Body:
- `name`, `email`, `password`
- optional `profilePhoto`, `contactNumber`, `address`
- `registrationNumber`
- optional `experience`, `bio`
- `specialties` array of UUID (required, min 1)
- Success: `200`, message `Provider created successfully`

### GET `/users/admins`
- Access: `ADMIN`
- Query:
- `page` number >= 1 (default 1)
- `limit` number 1-100 (default 10)
- Success: `200`, message `Admins fetched successfully`

### POST `/users/create-admin`
- Access: `ADMIN`
- Body:
- `password` (6-20)
- `name` (2-100)
- `email`
- optional `contactNumber`, `profilePhoto`, `address`
- `role` must be `ADMIN`
- Success: `201`, message `Admin registered successfully`

## 5.3 Providers (`/providers`)

### POST `/providers`
- Access: `ADMIN`
- Create provider payload similar to user create-provider flow.
- Success: `201`, message `Provider created successfully`

### GET `/providers`
- Access: Public
- Query:
- `page` default 1
- `limit` default 10
- Success: `200`, message `Providers fetched successfully`

### GET `/providers/me`
- Access: `PROVIDER`
- Success: `200`, message `Provider profile fetched successfully`

### PATCH `/providers/me`
- Access: `PROVIDER`
- Body supports optional profile fields (`name`, `profilePhoto`, `contactNumber`, `address`, `registrationNumber`, `experience`, `bio`)
- Success: `200`, message `Provider profile updated successfully`

### GET `/providers/:id`
- Access: Public
- Param `id` UUID
- Success: `200`, message `Provider fetched successfully`

### PATCH `/providers/:id`
- Access: `ADMIN`
- Param `id` UUID
- Body: provider update fields
- Success: `200`, message `Provider updated successfully`

### DELETE `/providers/:id`
- Access: `ADMIN`
- Param `id` UUID
- Success: `200`, message `Provider deleted successfully`

## 5.4 Services (`/services`)

### POST `/services/create-service`
- Access: `PROVIDER`
- Body:
- `name`
- `description`
- `price`
- optional `duration`
- optional `specialtyId` UUID
- optional `imageUrl` (valid URL)
- Success: `201`, message `Service created successfully`

### GET `/services/all-services`
- Access: Public
- Query:
- `page`, `limit`
- optional `providerId`, `specialtyId`
- optional `minPrice`, `maxPrice` (`minPrice <= maxPrice`)
- optional `searchTerm` (matches service `name`/`description` case-insensitively)
- optional `category` (matches specialty title text)
- optional `priceSort` (`asc` | `desc`) to order by price; defaults to newest first
- Success: `200`, message `Services fetched successfully`

### GET `/services/:id`
- Access: Public
- Param `id` UUID
- Success: `200`, message `Service fetched successfully`

### PATCH `/services/:id`
- Access: `ADMIN | PROVIDER`
- Param `id` UUID
- Body optional fields:
- `name`, `description`, `price`, `duration`, `specialtyId`, `providerId`, `isActive`
- `imageUrl`
- Success: `200`, message `Service updated successfully`

### DELETE `/services/:id`
- Access: `ADMIN | PROVIDER`
- Param `id` UUID
- Success: `200`, message `Service deleted successfully`

## 5.5 Specialties (`/specialties`)

### POST `/specialties`
- Access: `ADMIN`
- Body:
- `title`
- optional `description`
- optional `icon` URL
- Success: `201`, message `Specialty created successfully`

### GET `/specialties`
- Access: Public
- Success: `200`, message `Specialties fetched successfully`

### GET `/specialties/me`
- Access: `PROVIDER`
- Success: `200`, message `Provider specialties fetched successfully`

### POST `/specialties/me`
- Access: `PROVIDER`
- Body:
- `specialties`: UUID[] (min 1)
- Success: `200`, message `Provider specialties added successfully`

### DELETE `/specialties/me/:specialtyId`
- Access: `PROVIDER`
- Param `specialtyId` UUID
- Success: `200`, message `Provider specialty removed successfully`

### DELETE `/specialties/:id`
- Access: `ADMIN`
- Success: `200`, message `Specialty deleted successfully`

## 5.6 Bookings (`/bookings`)

### POST `/bookings/book-now`
- Access: `USER`
- Body:
- `bookingDate` ISO datetime
- `bookingTime` HH:mm
- `serviceId` UUID
- `address` (5-500)
- optional `city`, `latitude`, `longitude`
- Success: `201`, message `Booking created. Complete payment from the provided link`

### POST `/bookings/book-later`
- Access: `USER`
- Body same as `book-now`
- Success: `201`, message `Booking created. You can pay later within the payment window`

### POST `/bookings/:id/initiate-payment`
- Access: `USER`
- Param `id` UUID
- Success: `200`, message `Booking payment link generated successfully`

### POST `/bookings/:id/confirm-payment`
- Access: `USER`
- Param `id` UUID
- Query:
- `sessionId` required
- Success: `200`, message `Booking payment verified successfully`

### GET `/bookings/all`
- Access: `ADMIN`
- Query:
- `page`, `limit`
- optional `status`, `paymentStatus`
- optional `clientId`, `providerId`, `serviceId`
- Success: `200`, message `Bookings fetched successfully`

### GET `/bookings/my`
- Access: `USER`
- Query same as bookings list schema
- Success: `200`, message `My bookings fetched successfully`

### GET `/bookings/provider`
- Access: `PROVIDER`
- Query same as bookings list schema
- Success: `200`, message `Provider bookings fetched successfully`

### GET `/bookings/:id`
- Access: `ADMIN | USER | PROVIDER`
- Param `id` UUID
- Success: `200`, message `Booking fetched successfully`

### PATCH `/bookings/:id`
- Access: `ADMIN | USER | PROVIDER`
- Param `id` UUID
- Body optional:
- booking fields (`bookingDate`, `bookingTime`, `serviceId`, `address`, `city`, `latitude`, `longitude`)
- status fields (`status`, `paymentStatus`)
- Success: `200`, message `Booking updated successfully`

### DELETE `/bookings/:id`
- Access: `ADMIN | USER | PROVIDER`
- Param `id` UUID
- Success: `200`, message `Booking cancelled successfully`

## 5.7 Reviews (`/reviews`)

### POST `/reviews`
- Access: `USER`
- Body:
- `bookingId` UUID
- `rating` integer 1-5
- optional `comment` (max 2000)
- Success: `201`, message `Review created successfully`

### GET `/reviews`
- Access: Public
- Query: `page`, `limit`
- Success: `200`, message `Reviews retrieved successfully`

### GET `/reviews/provider/:providerId`
- Access: Public
- Param `providerId` UUID
- Query: `page`, `limit`
- Success: `200`, message `Provider reviews retrieved successfully`

### GET `/reviews/my`
- Access: `PROVIDER`
- Query: `page`, `limit`
- Success: `200`, message `My reviews retrieved successfully`

### DELETE `/reviews/:id`
- Access: `ADMIN`
- Param `id` UUID
- Success: `200`, message `Review deleted successfully`

## 5.8 Payments (`/payments`)

### GET `/payments/all`
- Access: `ADMIN`
- Query:
- `page`, `limit`
- optional `status`
- optional `clientId`, `providerId`, `serviceId`
- Success: `200`, message `Payments fetched successfully`

### GET `/payments/my`
- Access: `USER`
- Query:
- `page`, `limit`
- optional `providerId`, `serviceId`
- Success: `200`, message `My payments fetched successfully`

## 5.9 Notifications (`/notifications`)

### GET `/notifications/my`
- Access: `USER | ADMIN`
- Query: `page`, `limit`
- Success: `200`, message `Notifications fetched successfully`

### GET `/notifications/provider/my`
- Access: `PROVIDER`
- Query: `page`, `limit`
- Success: `200`, message `Provider notifications fetched successfully`

### PATCH `/notifications/:id/read`
- Access: `USER | ADMIN | PROVIDER`
- Param `id` UUID
- Success: `200`, message `Notification marked as read`

## 5.10 Stats (`/stats`)

### GET `/stats`
- Access: `ADMIN | PROVIDER | USER`
- Success: `200`, message `Dashboard stats fetched successfully`

## 6) Error Handling Mapping for Frontend

### Validation errors (Zod)
- HTTP: `400`
- Message: `Zod Validation Error`
- Use `errorSources[]` for showing field errors.

### Authentication/Authorization
- Missing/invalid token: `401`
- Permission denied: `403`
- Suggested frontend action:
- On `401`: try refresh flow; if failed redirect to login.
- On `403`: show access denied UI.

### Prisma/database errors
- Duplicate unique (`P2002`): `409`
- Not found (`P2025`, etc.): `404`
- Invalid query/data (`P2xxx`): `400`
- Rate limit (`P5011`): `429`
- Timeout: `504`
- Connection/DB unavailable: `503`

### Not found route
- HTTP: `404`
- Shape:
```json
{
  "success": false,
  "message": "Route /your/path Not Found"
}
```

## 7) Frontend Implementation Notes

- Always use `withCredentials: true` (Axios) or `credentials: "include"` (Fetch).
- Build a shared API error parser based on:
- `statusCode`
- `message`
- `errorSources`
- Use enum-based UI chips/select options for booking/payment statuses.
- For pagination endpoints, always read `meta` first.
- For booking payment flow:
- `book-now` returns payment link/session info to continue checkout.
- `confirm-payment` requires `sessionId` query from payment success callback.

## 8) Copilot Prompt (Use This Directly)

Copy and use this prompt in frontend repo Copilot Chat:

```text
Build API integration layer for ServiZen backend.

Base URL: /api/v1
Auth: cookie-based, always send credentials.

Implement:
1) Typed API client modules for auth, users, providers, services, specialties, bookings, reviews, payments, notifications, stats.
2) Global response types:
   - Success: { success, message, meta?, data? }
   - Error: { success:false, statusCode, message, errorSources[] }
3) Global error handler utility that maps:
   - 400 with errorSources => field errors
   - 401 => try refresh-token, else logout + redirect login
   - 403 => access denied message
   - 404 => not found page/toast
   - 409 => duplicate/conflict message
4) Booking/payment flow support:
   - book-now
   - book-later
   - initiate-payment
   - confirm-payment(sessionId)
5) Role-aware route guards for USER, PROVIDER, ADMIN in frontend.
6) Paginated list hooks/components that read meta: total, page, limit, totalPages.
7) Notification module with mark-as-read support.

Generate clean TypeScript code with reusable fetcher/axios instance and feature-wise service files.
```

## 9) Known Route/Validation Gaps (Important)

- `POST /auth/change-password` has auth guard but route does not currently apply its Zod schema middleware.
- `POST /users/create-provider` is currently not role-protected.
- Some auth endpoints (`verify-email`, `forget-password`, `reset-password`) are not using explicit Zod middleware now.

These are backend-side observations; frontend should still send strict payloads as documented.
