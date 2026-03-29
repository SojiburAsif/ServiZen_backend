# Google OAuth Frontend Integration Guide

This document explains how to integrate Google OAuth login in your frontend application with the ServiZen backend.

## Overview

The Google OAuth flow works as follows:
1. User clicks Google login button
2. Frontend calls the backend's Google login endpoint
3. Backend redirects to Google OAuth
4. After authentication, user is redirected back to frontend
5. Frontend checks authentication status and shows appropriate content

## Backend Changes After EJS Removal

The backend was updated to work without EJS templates for free server deployment compatibility. Here are the key changes:

### 1. Removed EJS Dependencies
- Removed EJS view engine setup from `app.ts`
- Eliminated template directory dependencies
- Updated health check to return JSON instead of rendered templates

### 2. Email System Updates
- Replaced EJS template rendering with inline HTML generation
- Created `generateOTPEmailHTML()` function for OTP emails
- Updated `sendEmail()` to use template functions instead of file-based templates

### 3. Google OAuth Configuration
- Updated Better Auth `baseURL` to include mount path: `${BETTER_AUTH_URL}/api/auth`
- Added `redirectURL` to Google provider pointing to success handler
- Modified auth controller to accept dynamic `callbackURL` from frontend

### 4. Authentication Flow
- Google login endpoint now uses `callbackURL` query parameter
- Success handler validates session and redirects to frontend
- All authentication cookies are properly set for cross-origin requests

## Frontend Code Changes

### 1. OAuth Lock Management

Add this utility code to prevent multiple simultaneous OAuth attempts:

```typescript
const GOOGLE_OAUTH_LOCK_KEY = "google_oauth_inflight_at";
const GOOGLE_OAUTH_LOCK_TTL_MS = 2 * 60 * 1000; // 2 minutes

export const clearGoogleOAuthLock = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(GOOGLE_OAUTH_LOCK_KEY);
};

const canStartGoogleOAuth = () => {
  if (typeof window === "undefined") return false;

  const raw = window.sessionStorage.getItem(GOOGLE_OAUTH_LOCK_KEY);
  if (!raw) return true;

  const startedAt = Number(raw);
  if (!Number.isFinite(startedAt)) {
    window.sessionStorage.removeItem(GOOGLE_OAUTH_LOCK_KEY);
    return true;
  }

  if (Date.now() - startedAt > GOOGLE_OAUTH_LOCK_TTL_MS) {
    window.sessionStorage.removeItem(GOOGLE_OAUTH_LOCK_KEY);
    return true;
  }

  return false;
};
```

### 2. Google OAuth Starter Function

```typescript
type StartGoogleOAuthOptions = {
  apiBaseUrl: string;
  callbackPath: string;
  appOrigin?: string;
};

export const startGoogleOAuth = ({
  apiBaseUrl,
  callbackPath,
  appOrigin,
}: StartGoogleOAuthOptions): { started: boolean; reason?: string } => {
  if (typeof window === "undefined") {
    return { started: false, reason: "not_in_browser" };
  }

  if (!canStartGoogleOAuth()) {
    return { started: false, reason: "already_inflight" };
  }

  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, "");
  const stableOrigin = (appOrigin || window.location.origin).replace(/\/+$/, "");
  const normalizedPath = callbackPath.startsWith("/") ? callbackPath : `/${callbackPath}`;
  const callbackURL = new URL(normalizedPath, stableOrigin).toString();

  window.sessionStorage.setItem(GOOGLE_OAUTH_LOCK_KEY, String(Date.now()));
  window.location.assign(
    `${normalizedBaseUrl}/api/v1/auth/login/google?callbackURL=${encodeURIComponent(callbackURL)}`
  );

  return { started: true };
};
```

### 3. Usage in Component

```typescript
// Example React component
const LoginButton = () => {
  const handleGoogleLogin = () => {
    const result = startGoogleOAuth({
      apiBaseUrl: "http://localhost:5000", // Your backend URL
      callbackPath: "/dashboard", // Where to redirect after login
      appOrigin: window.location.origin // Usually not needed, uses current origin
    });

    if (!result.started) {
      console.error("Failed to start OAuth:", result.reason);
      // Show error message to user
    }
  };

  return (
    <button onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
  );
};
```

## Handling OAuth Redirect

After successful OAuth, the user will be redirected to your callback URL (e.g., `/dashboard`).

### 4. Check Authentication Status

When the dashboard page loads, check if the user is authenticated:

```typescript
// Example: Check auth status on page load
const checkAuthStatus = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/v1/auth/me", {
      credentials: "include", // Important: Include cookies
    });

    if (response.ok) {
      const userData = await response.json();
      // User is authenticated
      setUser(userData.data);
      // Clear any OAuth lock
      clearGoogleOAuthLock();
    } else {
      // User not authenticated, redirect to login
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    window.location.href = "/login";
  }
};

// Call this in your dashboard component's useEffect
useEffect(() => {
  checkAuthStatus();
}, []);
```

## API Endpoints

### Authentication Endpoints

- **GET** `/api/v1/auth/login/google?callbackURL=<url>` - Start Google OAuth flow
- **GET** `/api/v1/auth/me` - Get current user info (requires authentication)
- **POST** `/api/v1/auth/logout` - Logout user

### Important Notes

1. **CORS**: Ensure your backend allows requests from your frontend origin
2. **Cookies**: All auth requests must include `credentials: "include"`
3. **HTTPS**: For production, ensure your backend uses HTTPS for secure cookies
4. **Error Handling**: Always handle OAuth failures gracefully
5. **Lock Management**: The OAuth lock prevents multiple simultaneous login attempts

## Environment Variables

Make sure your frontend knows the backend URL:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
```

## Deployment Considerations

### Free Server Compatibility
The backend has been optimized for free hosting platforms by removing EJS dependencies:
- No file system access required for templates
- Inline HTML generation for emails
- JSON-only responses for health checks
- Compatible with platforms like Railway, Render, Vercel (backend), etc.

### Environment Variables for Production
```bash
# Backend
BETTER_AUTH_URL=https://your-backend-url.com
FRONTEND_URL=https://your-frontend-url.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend
REACT_APP_API_URL=https://your-backend-url.com
```

### CORS Configuration
Ensure your backend CORS allows your production frontend domain:
```javascript
cors: {
  origin: ["https://your-frontend-domain.com", "https://your-backend-domain.com"],
  credentials: true
}
```

## Troubleshooting

### Common Issues

1. **404 Error**: Check that the backend is running and the route is correct
2. **CORS Error**: Ensure backend CORS is configured for your frontend origin
3. **Not Redirecting**: Check that the callbackURL is properly encoded
4. **Session Not Found**: Ensure cookies are being sent with requests

### Debug Steps

1. Check browser network tab for failed requests
2. Check browser console for JavaScript errors
3. Check backend logs for authentication errors
4. Verify environment variables are set correctly

## Security Considerations

- Always validate the callback URL on the backend
- Use HTTPS in production
- Implement proper error handling
- Clear sensitive data from sessionStorage after use
- Validate user permissions on protected routes</content>
<parameter name="filePath">l:\Project-3\Assignment-5\ServiZen_backend\docs\google-oauth-frontend-integration.md