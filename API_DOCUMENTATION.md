# Field Booking Admin Dashboard - API Integration Guide

## Overview
This admin dashboard application integrates with a field booking backend using:
- **NextAuth.js** for authentication
- **Axios** for HTTP requests with interceptors
- **TanStack Query (React Query)** for data fetching, caching, and state management
- **Sonner** for toast notifications

## Architecture

### 1. Authentication Flow

#### Login (`/login`)
```
POST /auth/login
Body: { email: string, password: string }
Response: {
  accessToken: string,
  refreshToken: string,
  role: string,
  _id: string,
  user: { _id, name, email, avatar, role, status, createdAt, updatedAt }
}
```
- Credentials are validated against the backend
- Tokens are stored in NextAuth session
- Access token is automatically included in all API requests via axios interceptor

#### Forgot Password (`/forgot-password`)
```
POST /auth/forget
Body: { email: string }
Response: Sends OTP to registered email
```

#### Verify OTP (`/verify-otp`)
```
POST /auth/verify-otp
Body: { email: string, otp: string }
Response: { success: boolean, message: string }
```

#### Reset Password (`/reset-password`)
```
POST /auth/reset-password
Body: { email: string, otp: string, password: string }
Response: Password reset confirmation
```

#### Change Password (Settings)
```
POST /auth/change-password
Headers: Authorization: Bearer {accessToken}
Body: { oldPassword: string, newPassword: string }
Response: { success: boolean, message: string }
```

### 2. Dashboard APIs

#### Overview
```
GET /admin/dashboard/overview
Headers: Authorization: Bearer {accessToken}
Response: {
  totalRevenue: number,
  totalUsers: number,
  totalFieldOwners: number,
  joiningOverview: [
    { date: string, count: number }
  ]
}
```
**Location:** `/app/dashboard/page.tsx`
**Usage:** Displays summary stats and user joining chart

### 3. Field Management APIs

#### Get All Fields
```
GET /field?page=1&limit=10
Headers: Authorization: Bearer {accessToken}
Response: {
  fields: [
    {
      _id, fieldName, description, fieldType,
      location: { coordinates: { latitude, longitude }, address, mapUrl },
      servicesAmenities: { showers, lights, parking, changingRooms, cafe, equipmentRental },
      rating: { average, count },
      basePricePerHour,
      pricePerHour: [{ date, startTime, endTime, pricePerHour }],
      images: [{ url, originalName, uploadDate }],
      owner: { _id, name, email },
      isActive, promotion, createdAt, updatedAt
    }
  ],
  total: number,
  pages: number
}
```
**Location:** `/app/dashboard/fields/page.tsx`
**Usage:** Displays all fields in a paginated grid with filtering

#### Get Field by ID
```
GET /field/{id}
Headers: Authorization: Bearer {accessToken}
Response: Single field object (same structure as above)
```

#### Create Field
```
POST /field
Headers: Authorization: Bearer {accessToken}
Body: { fieldName, description, fieldType, location, servicesAmenities, basePricePerHour, images, ... }
Response: Created field object
```

#### Update Field
```
PUT /field/{id}
Headers: Authorization: Bearer {accessToken}
Body: Partial field object
Response: Updated field object
```

#### Delete Field
```
DELETE /field/{id}
Headers: Authorization: Bearer {accessToken}
Response: { success: boolean, message: string }
```

### 4. Field Owner APIs

#### Get All Field Owners
```
GET /admin/field-owners?page=1&limit=10
Headers: Authorization: Bearer {accessToken}
Response: {
  fieldOwners: [
    {
      _id, name, email, joinedDate, spentOnSubscription,
      planName, status: "Free" | "Paid", avatar
    }
  ],
  total: number,
  pages: number
}
```
**Location:** `/app/dashboard/field-owners/page.tsx`
**Usage:** Displays all field owners with subscription information and pagination

#### Get Field Owner by ID
```
GET /admin/field-owners/{id}
Headers: Authorization: Bearer {accessToken}
Response: Single field owner object
```

### 5. Subscription/Plans APIs

#### Get All Plans
```
GET /plans
Headers: Authorization: Bearer {accessToken}
Response: [
  {
    _id, name, price, description,
    features: [string],
    isActive
  }
]
```
**Location:** `/app/dashboard/subscription/page.tsx`
**Usage:** Displays available subscription plans with features

#### Update User Subscription
```
PUT /subscription/update
Headers: Authorization: Bearer {accessToken}
Body: { planId: string }
Response: { success: boolean, message: string, data: updatedSubscription }
```

### 6. User Profile APIs

#### Get User Profile
```
GET /user/profile
Headers: Authorization: Bearer {accessToken}
Response: {
  _id, name, email, avatar: { url },
  role, status, createdAt, updatedAt
}
```
**Location:** `/app/dashboard/settings/page.tsx`
**Usage:** Displays user profile information

#### Update User Profile
```
PUT /user/profile
Headers: Authorization: Bearer {accessToken}
Body: Partial user object
Response: Updated user object
```

### 7. Token Refresh

#### Refresh Access Token
```
POST /auth/reset-refresh-token
Headers: Authorization: Bearer {refreshToken}
Response: { newAccessToken: string, newRefreshToken: string }
```

## Implementation Details

### Axios Interceptor Configuration
**File:** `/lib/axios-instance.ts`

- **Request Interceptor:** Automatically attaches `Authorization: Bearer {accessToken}` header
- **Response Interceptor:** Handles 401 errors by redirecting to `/login`
- **Base URL:** Configured via `NEXT_PUBLIC_BASE_URL` environment variable

### API Functions Organization
**File:** `/lib/api.ts`

All API calls are organized by resource:
- `authApi.login()`, `authApi.forgotPassword()`, etc.
- `dashboardApi.getOverview()`
- `fieldApi.getAllFields()`, `fieldApi.getFieldById()`, etc.
- `fieldOwnerApi.getAll()`, `fieldOwnerApi.getById()`
- `subscriptionApi.getPlans()`, `subscriptionApi.updateSubscription()`
- `userApi.getProfile()`, `userApi.updateProfile()`

### TanStack Query Setup
**File:** `/components/providers.tsx`

- **Cache Time:** 10 minutes (gcTime)
- **Stale Time:** 5 minutes
- **Retry:** 1 attempt on failure
- Provides automatic caching and background refetching

### NextAuth Configuration
**File:** `/app/api/auth/[...nextauth]/route.ts`

- **Provider:** Credentials provider with custom authorization
- **Session Strategy:** JWT
- **Token Expiry:** 30 days
- **Callback URLs:**
  - Sign In: `/login`
  - Redirect on error: `/login`

## Authentication Flow Diagram

```
1. User enters credentials on /login
   ↓
2. NextAuth credentials provider calls /auth/login API
   ↓
3. Backend validates and returns tokens + user data
   ↓
4. NextAuth stores tokens in JWT session
   ↓
5. Axios interceptor automatically includes token in all requests
   ↓
6. User is redirected to /dashboard
   ↓
7. Middleware ensures user is authenticated for protected routes
```

## Protected Routes

All dashboard routes are protected by middleware (`/middleware.ts`):
- `/dashboard/*` - All dashboard pages
- Unauthenticated users are redirected to `/login`
- Authenticated users accessing `/login` are redirected to `/dashboard`

## Error Handling

### Global Error Toast
- API errors are caught and displayed via Sonner toast notifications
- 401 errors trigger automatic logout and redirect to `/login`
- Field-specific error messages from backend are displayed to users

### Form Validation
- Email validation on login/password reset forms
- Password confirmation validation on password change/reset
- OTP completion validation before submission

## Data Fetching Best Practices

### Using TanStack Query
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['resource-name', params],
  queryFn: async () => {
    const response = await api.getResource();
    return response.data.data; // Extract data from response
  },
});
```

### Loading States
- Skeleton components display during data loading
- Disabled form inputs during submission
- Pagination buttons disabled at boundaries

## Environment Variables

Required:
```
NEXT_PUBLIC_BASE_URL=http://localhost:5000 (or your API URL)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Pagination Implementation

- **Page parameter:** 1-indexed
- **Limit:** Configurable (default: 10 items per page)
- **Response includes:** `total` count and `pages` count
- **UI:** Previous/Next buttons with page numbers

## Future Enhancements

1. **Real-time Updates:** Integrate WebSocket for live field availability
2. **Advanced Filtering:** Add filters for field type, location, amenities
3. **Export Data:** Add CSV/PDF export for field owners and revenue reports
4. **Analytics Dashboard:** Enhanced charts and metrics
5. **Image Upload:** Direct image upload for fields
6. **Bulk Operations:** Bulk delete/update for fields
