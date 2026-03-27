# Admin Role Management Guide (ServiZen Backend)

> All endpoints below inherit the global API prefix (for example `/api/v1`). Replace the prefix to match your deployment.

## Admin Capabilities Overview

Admins have full management access across all modules. They can create, read, update, delete, and monitor all entities. This guide details every admin-accessible endpoint with validation, permissions, and usage notes.

## 1. User Management (`/users`)

### POST `/users/create-admin`
- **Purpose**: Create a new admin user.
- **Auth**: `ADMIN`
- **Body** (Zod validated):
  - `password`: string (6-20 chars)
  - `name`: string (2-100 chars)
  - `email`: valid email
  - `role`: must be `"ADMIN"`
  - `contactNumber`: optional Bangladeshi phone
  - `profilePhoto`: optional URL
  - `address`: optional (5-200 chars)
- **Success**: `201`, message `"Admin registered successfully"`
- **Notes**: Only admins can create other admins. The new admin gets email verification flow.

### GET `/users/admins`
- **Purpose**: List all admin users with pagination.
- **Auth**: `ADMIN`
- **Query**:
  - `page`: number >=1 (default 1)
  - `limit`: number 1-100 (default 10)
- **Success**: `200`, message `"Admins fetched successfully"`
- **Response Data**: Paginated list of admin profiles with user details.

### GET `/users/all`
- **Purpose**: List all users across the system with pagination.
- **Auth**: `ADMIN`
- **Query**:
  - `page`: default 1
  - `limit`: default 10 (max 100)
- **Success**: `200`, message `"Users fetched successfully"`
- **Response Data**: Paginated list of users with `id`, `email`, `name`, `status`, `Role`, `emailVerified`, `isGoogleLogin` (boolean), `createdAt`, `updatedAt`
- **Notes**: `isGoogleLogin` indicates if user logged in via Google (has client record).

### GET `/users/:id`
- **Purpose**: Get detailed information about a specific user.
- **Auth**: `ADMIN`
- **Param**: `id` (UUID)
- **Success**: `200`, message `"User fetched successfully"`
- **Response Data**: Complete user details including:
  - Basic user info: `id`, `email`, `name`, `status`, `Role`, `emailVerified`, `isGoogleLogin`
  - `admin` object (if user is admin): full admin profile details
  - `provider` object (if user is provider): full provider profile with specialties
  - `client` object (if user is client): full client profile
- **Notes**: Returns all related data based on user's role.

### PATCH `/users/:id/status`
- **Purpose**: Update any user's status.
- **Auth**: `ADMIN`
- **Param**: `id` (UUID)
- **Body**: `{ "status": "ACTIVE" | "BLOCKED" | "DELETED" }`
- **Success**: `200`, message `"User status updated successfully"`
- **Notes**: Cannot update deleted users.

### DELETE `/users/:id`
- **Purpose**: Soft-delete any user and their related records (admin/provider/client).
- **Auth**: `ADMIN`
- **Param**: `id` (UUID)
- **Success**: `200`, message `"User deleted successfully"`
- **Notes**: Sets `isDeleted: true` on user and related entities.

## 2. Provider Management (`/providers`)

### POST `/providers`
- **Purpose**: Create a new provider account.
- **Auth**: `ADMIN`
- **Body** (similar to user create-provider):
  - `name`, `email`, `password`
  - `registrationNumber`: required
  - optional: `profilePhoto`, `contactNumber`, `address`, `experience`, `bio`
  - `specialties`: array of specialty UUIDs (min 1)
- **Success**: `201`, message `"Provider created successfully"`
- **Notes**: Creates both user and provider records, links specialties.

### GET `/providers`
- **Purpose**: List all providers (public catalog).
- **Auth**: Public (but admins can use for management)
- **Query**:
  - `page`: default 1
  - `limit`: default 10
- **Success**: `200`, message `"Providers fetched successfully"`
- **Notes**: Includes specialty relations.

### GET `/providers/:id`
- **Purpose**: Get detailed provider profile.
- **Auth**: Public
- **Param**: `id` (UUID)
- **Success**: `200`, message `"Provider fetched successfully"`

### PATCH `/providers/:id`
- **Purpose**: Update any provider's profile.
- **Auth**: `ADMIN`
- **Param**: `id` (UUID)
- **Body**: Optional provider fields (name, email, profilePhoto, contactNumber, address, registrationNumber, experience, bio) + specialties management.
- **Success**: `200`, message `"Provider updated successfully"`
- **Notes**: Specialties update via array of `{ specialtyId, shouldDelete }`.

### DELETE `/providers/:id`
- **Purpose**: Soft-delete provider and associated user.
- **Auth**: `ADMIN`
- **Param**: `id` (UUID)
- **Success**: `200`, message `"Provider deleted successfully"`
- **Notes**: Sets `isDeleted: true` on provider and user, clears sessions.

## 3. Booking Management (`/bookings`)

### GET `/bookings/all`
- **Purpose**: View all bookings across the system.
- **Auth**: `ADMIN`
- **Query**:
  - `page`, `limit`
  - optional: `status` (BookingStatus), `paymentStatus` (PaymentStatus), `clientId`, `providerId`, `serviceId`
- **Success**: `200`, message `"Bookings fetched successfully"`
- **Notes**: Full system oversight.

### GET `/bookings/:id`
- **Purpose**: Get any booking details.
- **Auth**: `ADMIN | USER | PROVIDER`
- **Param**: `id` (UUID)
- **Success**: `200`, message `"Booking fetched successfully"`

### PATCH `/bookings/:id`
- **Purpose**: Update any booking (status, payment, details).
- **Auth**: `ADMIN | USER | PROVIDER`
- **Param**: `id` (UUID)
- **Body**: Optional booking fields + status/payment updates.
- **Success**: `200`, message `"Booking updated successfully"`
- **Notes**: Admins can change paymentStatus (others cannot).

### DELETE `/bookings/:id`
- **Purpose**: Cancel any booking.
- **Auth**: `ADMIN | USER | PROVIDER`
- **Param**: `id` (UUID)
- **Success**: `200`, message `"Booking cancelled successfully"`

## 4. Review Management (`/reviews`)

### GET `/reviews`
- **Purpose**: View all reviews.
- **Auth**: Public (admins for moderation)
- **Query**: `page`, `limit`

### DELETE `/reviews/:id`
- **Purpose**: Delete inappropriate review.
- **Auth**: `ADMIN`
- **Param**: `id` (UUID)
- **Success**: `200`, message `"Review deleted successfully"`

## 5. Payment Management (`/payments`)

### GET `/payments/all`
- **Purpose**: View all payment transactions.
- **Auth**: `ADMIN`
- **Query**:
  - `page`, `limit`
  - optional: `status` (PaymentStatus), `clientId`, `providerId`, `serviceId`
- **Success**: `200`, message `"Payments fetched successfully"`
- **Notes**: Includes booking and user details.

## 6. Notification Management (`/notifications`)

### GET `/notifications/my`
- **Purpose**: Admin's own notifications.
- **Auth**: `USER | ADMIN`
- **Query**: `page`, `limit`
- **Success**: `200`, message `"Notifications fetched successfully"`

### PATCH `/notifications/:id/read`
- **Purpose**: Mark notification as read.
- **Auth**: `USER | ADMIN | PROVIDER`
- **Param**: `id` (UUID)
- **Success**: `200`, message `"Notification marked as read"`

## 7. Stats & Analytics (`/stats`)

### GET `/stats`
- **Purpose**: Dashboard statistics.
- **Auth**: `ADMIN | PROVIDER | USER`
- **Success**: `200`, message `"Dashboard stats fetched successfully"`
- **Notes**: Role-filtered data (admins see global stats).

## Admin Workflow Suggestions

1. **User Management**:
   - Use `GET /users/admins` to monitor admin team.
   - Create new admins via `POST /users/create-admin` when needed.

2. **Provider Oversight**:
   - List all providers with `GET /providers`.
   - Edit profiles via `PATCH /providers/:id`.
   - Delete inactive providers with `DELETE /providers/:id`.

3. **Content Moderation**:
   - Delete inappropriate reviews via `DELETE /reviews/:id`.

4. **Booking & Payment Control**:
   - View all bookings with `GET /bookings/all` and filters.
   - Intervene in disputes by updating bookings or payments.
   - Monitor transactions via `GET /payments/all`.

5. **System Health**:
   - Check global stats with `GET /stats`.
   - Handle notifications and mark as read.

## Permission Notes
- Admins bypass ownership checks (can modify any entity).
- Soft-deletes are used for users/providers to maintain data integrity.
- Payment status changes by admins can trigger earnings adjustments.

## Error Handling
- Same global error patterns as other roles.
- `403` if non-admin tries admin endpoints.
- Validation errors for malformed payloads.

This documentation covers all admin management capabilities. Use it to build admin dashboard features in the frontend.