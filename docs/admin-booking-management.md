# Admin Booking Management Documentation (ServiZen Backend)

> All endpoints below inherit the global API prefix (for example `/api/v1`). Replace the prefix to match your deployment.

## Admin Booking Endpoints Overview

This document covers admin-specific booking management endpoints for comprehensive system oversight and intervention capabilities.

## Admin Booking Management Endpoints

### GET `/bookings/all`
- **Purpose**: Get ALL bookings across the system with advanced filtering
- **Auth**: `ADMIN` role required
- **Query Params**:
  - `page`: number (default: 1, min: 1)
  - `limit`: number (default: 10, min: 1, max: 100)
  - `status`: BookingStatus enum (optional) - Filter by booking status
  - `paymentStatus`: PaymentStatus enum (optional) - Filter by payment status
  - `clientId`: UUID (optional) - Filter by specific client
  - `providerId`: UUID (optional) - Filter by specific provider
  - `serviceId`: UUID (optional) - Filter by specific service
- **Success Response**: `200`
  ```json
  {
    "success": true,
    "message": "Bookings fetched successfully",
    "data": {
      "meta": {
        "page": 1,
        "limit": 10,
        "total": 150
      },
      "data": [
        {
          "id": "booking-uuid",
          "bookingDate": "2026-03-28T10:00:00.000Z",
          "bookingTime": "10:00",
          "status": "CONFIRMED",
          "paymentStatus": "PAID",
          "totalAmount": 1500.00,
          "address": "Dhaka, Bangladesh",
          "city": "Dhaka",
          "latitude": 23.8103,
          "longitude": 90.4125,
          "client": {
            "id": "client-uuid",
            "name": "John Doe",
            "email": "john@example.com"
          },
          "provider": {
            "id": "provider-uuid",
            "name": "Service Provider",
            "email": "provider@example.com"
          },
          "service": {
            "id": "service-uuid",
            "title": "Plumbing Service",
            "price": 1500.00
          },
          "createdAt": "2026-03-28T09:00:00.000Z",
          "updatedAt": "2026-03-28T09:30:00.000Z"
        }
      ]
    }
  }
  ```

### GET `/bookings/:id`
- **Purpose**: Get detailed information about any booking
- **Auth**: `ADMIN` role required (can also be accessed by USER/PROVIDER with ownership restrictions)
- **URL Params**: `id` (UUID) - Booking ID
- **Success Response**: `200` - Returns complete booking details with all related data

### PATCH `/bookings/:id`
- **Purpose**: Update any booking (status, payment, details)
- **Auth**: `ADMIN` role required (can also be updated by USER/PROVIDER with restrictions)
- **URL Params**: `id` (UUID) - Booking ID
- **Request Body**: At least one field required
  ```json
  {
    "bookingDate": "2026-03-29T14:00:00.000Z",
    "bookingTime": "14:00",
    "serviceId": "new-service-uuid",
    "address": "Updated address",
    "city": "Updated city",
    "latitude": 23.8103,
    "longitude": 90.4125,
    "status": "CONFIRMED",
    "paymentStatus": "PAID"
  }
  ```
- **Admin Capabilities**: Can update paymentStatus (users/providers cannot)
- **Success Response**: `200` - Returns updated booking

### DELETE `/bookings/:id`
- **Purpose**: Cancel any booking
- **Auth**: `ADMIN` role required (can also be cancelled by USER/PROVIDER with ownership)
- **URL Params**: `id` (UUID) - Booking ID
- **Process**: Sets booking status to CANCELLED
- **Success Response**: `200` - Message: "Booking cancelled successfully"

## Booking Status Enums

### BookingStatus
- `PENDING` - Initial booking state
- `CONFIRMED` - Booking confirmed by provider
- `IN_PROGRESS` - Service is being performed
- `COMPLETED` - Service completed successfully
- `CANCELLED` - Booking cancelled
- `NO_SHOW` - Client didn't show up

### PaymentStatus
- `PENDING` - Payment not initiated
- `INITIATED` - Payment link generated
- `PAID` - Payment completed
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

## Data Models

### Booking Model
```typescript
{
  id: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  bookingDate: Date;
  bookingTime: string; // HH:mm format
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
  client: User;        // Client details
  provider: Provider;  // Provider details
  service: Service;    // Service details
}
```

## Business Logic Notes

### Admin Oversight
- **Full System Access**: Admins can view/modify ALL bookings regardless of ownership
- **Payment Control**: Only admins can change paymentStatus for dispute resolution
- **Status Management**: Admins can intervene in booking workflows
- **Audit Trail**: All changes are tracked with updatedAt timestamps

### Filtering Capabilities
- **Multi-dimensional Filtering**: Combine status, payment, client, provider, and service filters
- **Pagination**: Efficient handling of large datasets
- **Sorting**: Results ordered by creation date (newest first)

### Update Restrictions
- **Validation**: At least one field must be provided for updates
- **Payment Security**: Only admins can modify payment status
- **Data Integrity**: All updates validated against business rules

## Error Handling

### Common Error Responses
- `400 Bad Request`: Invalid parameters, missing required fields
- `401 Unauthorized`: Missing/invalid authentication
- `403 Forbidden`: Insufficient permissions (non-admin trying admin endpoints)
- `404 Not Found`: Booking not found
- `409 Conflict`: Invalid status transitions

### Validation Rules
- **Page/Limit**: Must be positive integers, limit max 100
- **UUIDs**: Client, provider, service IDs must be valid UUIDs
- **DateTime**: ISO 8601 format required
- **Time**: HH:mm format required
- **Coordinates**: Latitude (-90 to 90), Longitude (-180 to 180)

## Frontend Integration Guide

### Admin Booking Management
```javascript
// Get all bookings with filters
const response = await fetch('/api/v1/bookings/all?page=1&limit=20&status=CONFIRMED&paymentStatus=PAID');

// Get specific booking details
const booking = await fetch(`/api/v1/bookings/${bookingId}`);

// Update booking status (admin only)
await fetch(`/api/v1/bookings/${bookingId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'COMPLETED',
    paymentStatus: 'PAID'
  })
});

// Cancel booking
await fetch(`/api/v1/bookings/${bookingId}`, {
  method: 'DELETE'
});
```

### Advanced Filtering Examples
```javascript
// Get bookings by provider
fetch('/api/v1/bookings/all?providerId=provider-uuid&page=1&limit=10');

// Get pending payments
fetch('/api/v1/bookings/all?paymentStatus=PENDING&status=CONFIRMED');

// Get bookings for specific service
fetch('/api/v1/bookings/all?serviceId=service-uuid&status=COMPLETED');
```

### Admin Dashboard Integration
```javascript
// Dashboard stats - count bookings by status
const stats = await fetch('/api/v1/stats'); // Includes booking counts

// Recent bookings for admin review
const recentBookings = await fetch('/api/v1/bookings/all?page=1&limit=50&status=PENDING');

// Dispute resolution - update payment status
await fetch(`/api/v1/bookings/${bookingId}`, {
  method: 'PATCH',
  body: JSON.stringify({ paymentStatus: 'REFUNDED' })
});
```

This documentation provides complete admin booking management capabilities for the ServiZen platform.</content>
<parameter name="filePath">l:\Project-3\Assignment-5\ServiZen_backend\docs\admin-booking-management.md