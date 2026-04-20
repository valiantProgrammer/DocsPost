# Google Sign-Up / Sign-In Flow

## Overview

When a user signs up or signs in with Google, the following sequence occurs:

## Step-by-Step Flow

### 1. **User Initiates Google Auth** 
User clicks "Sign in with Google" button
```javascript
// Frontend: Auth/page.js
handleGoogleAuth() → /api/auth/google/start?next={returnPath}
```

### 2. **Google Start Endpoint** (`/api/auth/google/start`)
- Receives the next path (where to redirect after login)
- Constructs Google OAuth URL with state parameter
- Redirects user to Google's login page
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=...&
  redirect_uri=.../api/auth/google/callback&
  state=/path/to/return&
  scope=openid email profile
```

### 3. **User Authorizes with Google**
User logs in with Google account and grants permissions

### 4. **Google Callback** (`/api/auth/google/callback`)
Google redirects back with authorization code and state parameter

**What happens:**
1. ✅ Exchanges code for tokens from Google
2. ✅ Fetches user profile (email, name, picture) from Google
3. ✅ **Checks if user exists** in database by email
   - **If new user:** Creates account with generated username
   - **If existing user:** Updates their Google info
4. ✅ **Generates unique username** 
   - From Google name: `john_doe` → `johndoe` (alphanumeric only)
   - If too short (<3 chars): adds random numbers
   - If already taken: appends counter (e.g., `john1`, `john2`)
   - If already exists: keeps their existing username
5. ✅ Generates JWT tokens (accessToken, refreshToken)
6. ✅ Updates user's lastLoginAt timestamp
7. ✅ **Sets secure HTTP-only cookies:**
   - `accessToken` - JWT token
   - `refreshToken` - Refresh token
   - `docspost-auth` - "signed-in" flag
   - `docspost-username` - User's username (7 days)
   - `docspost-email` - User's email (7 days)
8. ✅ Redirects to `/auth/post-login?next={returnPath}`

### 5. **Post-Login Handler** (`/auth/post-login`)
Loading page that handles client-side setup

**What happens:**
1. ✅ Reads cookies set by callback
2. ✅ Validates authentication status
3. ✅ Mirrors cookies to localStorage:
   - `docspost-auth` → localStorage
   - `docspost-username` → localStorage
   - `docspost-email` → localStorage
4. ✅ Logs successful login to console
5. ✅ Redirects to original destination (or home)

### 6. **User Redirected to Destination**
User lands on their intended page (home, profile, etc.)

## Database Changes

### New User Created
```javascript
{
  _id: ObjectId,
  email: "user@gmail.com",
  username: "johndoe123",
  name: "John Doe",
  picture: "https://lh3.googleusercontent.com/...",
  googleId: "1234567890",
  provider: "google",
  verified: true,
  refreshToken: "jwt...",
  createdAt: 2024-04-20T10:30:00Z,
  updatedAt: 2024-04-20T10:30:00Z,
  lastLoginAt: 2024-04-20T10:30:00Z
}
```

### Existing User Updated
```javascript
// Updates with Google info, removes password fields
{
  $set: {
    username: "johndoe123",
    name: "John Doe",
    picture: "https://...",
    googleId: "1234567890",
    provider: "google",
    verified: true,
    refreshToken: "jwt...",
    updatedAt: 2024-04-20T10:30:00Z,
    lastLoginAt: 2024-04-20T10:30:00Z
  },
  $unset: {
    password: "",
    otp: "",
    otpExpiresAt: "",
    otpAttempts: ""
  }
}
```

## Key Features

✅ **Unique Usernames**
- Generated from Google name (alphanumeric only)
- Auto-incremented if duplicate (`john1`, `john2`, etc.)
- Preserves existing usernames for returning users

✅ **Automatic Account Creation**
- No need for password with Google OAuth
- Email verified automatically
- Profile picture imported from Google

✅ **Smart Existing User Handling**
- If user already exists, just updates Google info
- Preserves their existing username and data
- Removes old password auth fields

✅ **Session Management**
- JWT tokens in cookies
- 7-day refresh token expiry
- LastLoginAt timestamp updated

✅ **localStorage Setup**
- Post-login page mirrors cookies to localStorage
- Ensures frontend can access auth state
- Username and email available for profile operations

✅ **Return Path Preservation**
- State parameter captures original destination
- User redirected to intended page after login
- Works with query parameters

## Environment Variables Required

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## Error Handling

Errors redirect back to Auth page with error codes:
- `google_missing_code` - Authorization code missing
- `google_not_configured` - Missing credentials
- `google_email_missing` - Google didn't return email
- `google_auth_failed` - General authentication failure

## Testing Google Auth Flow

1. **Development**: Use test Google account
2. **Check Console**: Post-login page logs username and email
3. **Verify localStorage**: Open DevTools → Application → localStorage
4. **Check Database**: New user document created with Google provider

## Post-Login Access

After successful Google login:
- User can access `/profile` → redirects to `/{username}`
- User can view their public profile at `/{username}`
- Analytics accessible on profile
- Can write and publish articles

---

**All usernames are guaranteed to be unique** through case-insensitive MongoDB index on users collection.
