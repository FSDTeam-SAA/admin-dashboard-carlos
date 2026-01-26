# Project Structure

## Directory Layout

```
/
├── app/
│   ├── layout.tsx                          # Root layout with providers
│   ├── globals.css                         # Global styles
│   ├── page.tsx                            # Home page (redirect to dashboard)
│   ├── login/
│   │   └── page.tsx                        # Login page
│   ├── forgot-password/
│   │   └── page.tsx                        # Forgot password page
│   ├── verify-otp/
│   │   ├── page.tsx                        # OTP verification page
│   │   └── loading.tsx                     # Loading boundary
│   ├── reset-password/
│   │   ├── page.tsx                        # Reset password page
│   │   └── loading.tsx                     # Loading boundary
│   ├── dashboard/
│   │   ├── layout.tsx                      # Dashboard layout (sidebar + header)
│   │   ├── page.tsx                        # Overview/stats page
│   │   ├── field-owners/
│   │   │   └── page.tsx                    # Field owners list with pagination
│   │   ├── fields/
│   │   │   └── page.tsx                    # Fields management (grid view)
│   │   ├── subscription/
│   │   │   └── page.tsx                    # Subscription plans page
│   │   └── settings/
│   │       └── page.tsx                    # User settings page
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts                # NextAuth API route
│
├── components/
│   ├── providers.tsx                       # TanStack Query & SessionProvider
│   ├── ui/                                 # shadcn/ui components (auto-imported)
│   └── dashboard/
│       ├── sidebar.tsx                     # Navigation sidebar
│       ├── header.tsx                      # Top header with user info
│       └── chart.tsx                       # Dashboard area chart
│
├── lib/
│   ├── utils.ts                            # Utility functions (cn, etc.)
│   ├── axios-instance.ts                   # Axios config with interceptors
│   └── api.ts                              # Centralized API call functions
│
├── hooks/
│   ├── use-mobile.tsx                      # Mobile breakpoint hook
│   └── use-toast.ts                        # Toast hook
│
├── middleware.ts                           # NextAuth authentication middleware
├── package.json                            # Dependencies
├── tsconfig.json                           # TypeScript config
├── next.config.mjs                         # Next.js config
├── API_DOCUMENTATION.md                    # API endpoints documentation
└── PROJECT_STRUCTURE.md                    # This file
```

## Key Files Explained

### Authentication & Session Management

#### `/middleware.ts`
- Protects dashboard routes from unauthorized access
- Redirects unauthenticated users to login
- Uses NextAuth's `withAuth` middleware

#### `/app/api/auth/[...nextauth]/route.ts`
- NextAuth configuration with Credentials provider
- Handles login validation and token storage
- Manages JWT session strategy with 30-day expiry
- Callbacks for JWT and session management

### API Integration Layer

#### `/lib/axios-instance.ts`
- Creates axios instance with base URL from env variables
- **Request Interceptor:** Automatically attaches Authorization header with access token
- **Response Interceptor:** Handles 401 errors by redirecting to login

#### `/lib/api.ts`
- Centralized API function definitions organized by resource
- Type definitions for all request/response payloads
- Clean separation of auth, dashboard, field, owner, subscription, and user APIs
- Error handling and response extraction

### Provider Setup

#### `/components/providers.tsx`
- Wraps app with `SessionProvider` (NextAuth)
- Wraps app with `QueryClientProvider` (TanStack Query)
- Configures cache times and retry logic

### Dashboard Pages

#### `/app/dashboard/page.tsx` (Overview)
- Displays summary statistics (total revenue, users, field owners)
- Shows user joining trend chart
- Uses TanStack Query for data fetching
- Implements skeleton loading states

#### `/app/dashboard/field-owners/page.tsx`
- Paginated table of field owners
- Displays: name, email, joined date, subscription spending, plan name, status
- Pagination controls with page numbers
- Skeleton loaders during data fetch

#### `/app/dashboard/fields/page.tsx`
- Grid layout of fields with images
- Shows field details: name, type, price, amenities, owner info
- Active/inactive status badges
- Pagination with intelligent page number display

#### `/app/dashboard/subscription/page.tsx`
- Displays subscription plans (Basic, Premium)
- Shows plan features, pricing, and edit/upgrade buttons
- API integration for plan updates

#### `/app/dashboard/settings/page.tsx`
- User profile display with avatar
- Password change form with validation
- Input validation for matching passwords and minimum length

### Layout Components

#### `/app/dashboard/layout.tsx`
- Two-column layout: sidebar + main content
- Wraps all dashboard pages
- Includes header in main section

#### `/components/dashboard/sidebar.tsx`
- Navigation menu with active state highlighting
- Menu items: Overview, Field Owners, Fields, Subscription, Settings
- Logout button

#### `/components/dashboard/header.tsx`
- Welcome message
- Notification bell icon
- User profile dropdown with name and email
- Avatar with fallback

#### `/components/dashboard/chart.tsx`
- Area chart showing user joining trends
- Uses Recharts with gradient styling
- Responsive container

## Authentication Flow

```
LOGIN PAGE (/login)
    ↓ [POST /auth/login]
NextAuth Credentials Provider
    ↓ [Backend validates]
Store tokens in JWT session
    ↓
Middleware checks auth
    ↓
Access DASHBOARD (/dashboard)
    ↓
Axios interceptor adds token to all requests
    ↓
Access Protected APIs
```

## Data Flow with TanStack Query

```
Component renders
    ↓
useQuery hook initialized with queryKey
    ↓
Check cache (5 min stale time)
    ↓
If not cached/stale → Call API function
    ↓
API function calls axios (token added via interceptor)
    ↓
Response received → Update cache
    ↓
Component re-renders with data
```

## Error Handling Flow

```
API Error Occurs
    ↓
Axios response interceptor catches
    ↓
If 401 → Redirect to /login
    ↓
Otherwise → Throw error to component
    ↓
Component catches with try/catch
    ↓
Display toast.error() notification
```

## Component Hierarchy

```
RootLayout
├── Providers (SessionProvider + QueryClientProvider)
│   └── Page/Route
│       ├── LoginPage (public)
│       ├── ForgotPasswordPage (public)
│       ├── VerifyOtpPage (public)
│       ├── ResetPasswordPage (public)
│       └── DashboardLayout (protected)
│           ├── Sidebar
│           ├── Header
│           └── Page Content
│               ├── DashboardPage
│               ├── FieldOwnersPage
│               ├── FieldsPage
│               ├── SubscriptionPage
│               └── SettingsPage
└── Toaster (Sonner)
```

## Configuration Files

### `/package.json`
Key dependencies:
- `next-auth@5.0.0-beta.25` - Authentication
- `axios@1.6.0` - HTTP client
- `@tanstack/react-query@5.28.0` - State management
- `sonner@1.7.4` - Toast notifications
- `recharts@2.15.4` - Charts
- `lucide-react@0.454.0` - Icons
- shadcn/ui components and Radix UI dependencies

### `/.env.local` (Required)
```
NEXT_PUBLIC_BASE_URL=http://localhost:5000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Code Patterns

### TanStack Query Pattern
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['key', params],
  queryFn: async () => {
    const response = await api.getResource();
    return response.data.data;
  },
});
```

### Form Submission Pattern
```tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  try {
    await api.action(data);
    toast.success('Success!');
    router.push('/next-page');
  } catch (error: any) {
    toast.error(error.response?.data?.message);
  }
};
```

### Loading States Pattern
```tsx
{isLoading
  ? <Skeleton className="h-8 w-32" />
  : <div>{data}</div>
}
```

## Styling System

- **Framework:** Tailwind CSS v4
- **UI Components:** shadcn/ui (pre-built Radix UI components)
- **Color Scheme:** Teal primary (#14b8a6), slate grays for neutrals
- **Icons:** Lucide React
- **Responsive:** Mobile-first with md: and lg: breakpoints

## Security Features

- NextAuth JWT tokens with automatic expiry (30 days)
- Axios interceptor prevents token exposure in code
- Protected routes via middleware
- Secure password hashing on backend
- CSRF protection via NextAuth
- Session-based auth with refresh token support

## Development Guidelines

### Adding New API Endpoint
1. Add function to `/lib/api.ts` with proper types
2. Use in component with `useQuery` hook
3. Handle loading and error states with skeleton/toast
4. Add pagination if needed

### Adding New Dashboard Page
1. Create page in `/app/dashboard/[feature]/page.tsx`
2. Use dashboard layout automatically
3. Integrate with API functions
4. Add sidebar menu item

### Error Handling Best Practices
1. Always wrap API calls in try/catch
2. Extract message from `error.response?.data?.message`
3. Show user-friendly toast error notification
4. Log to console for debugging: `console.error('[v0] Error:', error)`

## Performance Optimizations

- TanStack Query caches data for 5 minutes
- Background refetching on window focus
- Skeleton loaders prevent layout shift
- Lazy loading of dashboard pages
- Code splitting via Next.js routing
