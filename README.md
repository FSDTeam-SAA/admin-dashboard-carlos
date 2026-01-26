# Field Booking Admin Dashboard

A modern, fully-functional admin dashboard for managing sports field bookings with complete API integration, authentication, and real-time data management.

## Overview

This is a production-ready admin dashboard built with Next.js 16, featuring:
- Complete authentication system (login, forgot password, OTP verification)
- Dashboard with statistics and charts
- Field management (view, create, update, delete)
- Field owner management with subscription tracking
- Subscription plan management
- User settings and profile management
- TanStack Query for smart caching and state management
- Axios with token-based authentication
- Professional UI with Tailwind CSS and shadcn/ui

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
echo "NEXT_PUBLIC_BASE_URL=http://localhost:5000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000" > .env.local

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:3000
```

See [QUICK_START.md](./QUICK_START.md) for detailed setup instructions.

## Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 30-second setup guide and common tasks
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API endpoints and integration guide
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Directory structure and architecture
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Full feature breakdown and testing checklist

## Features

### Authentication
- Email/password login
- Forgot password with OTP
- Password reset functionality
- Password change in settings
- NextAuth.js JWT session management
- Protected routes with middleware

### Dashboard Pages
1. **Overview** - Statistics, revenue, user count, field owner count, joining trends chart
2. **Field Owners** - Paginated table of field owners with subscription details
3. **Fields** - Grid view of all fields with details and images
4. **Subscription** - Available plans with features and upgrade options
5. **Settings** - User profile and password change

### API Integration
**19 API endpoints** fully integrated:
- 7 authentication endpoints
- 1 dashboard endpoint
- 5 field management endpoints
- 2 field owner endpoints
- 2 subscription endpoints
- 2 user profile endpoints

### Technical Features
- TanStack Query v5 for data caching and management
- Axios with request/response interceptors
- NextAuth.js for secure authentication
- TypeScript for type safety
- Tailwind CSS v4 for styling
- shadcn/ui for pre-built components
- Sonner for toast notifications
- Recharts for data visualization
- Pagination on all list pages
- Skeleton loaders for loading states
- Error handling with user-friendly messages

## Project Structure

```
app/
├── layout.tsx                              # Root layout with providers
├── login/page.tsx                          # Login page
├── forgot-password/page.tsx                # Password recovery
├── verify-otp/page.tsx                     # OTP verification
├── reset-password/page.tsx                 # Password reset
└── dashboard/
    ├── layout.tsx                          # Dashboard layout
    ├── page.tsx                            # Overview page
    ├── field-owners/page.tsx               # Field owners list
    ├── fields/page.tsx                     # Fields management
    ├── subscription/page.tsx               # Subscription plans
    └── settings/page.tsx                   # User settings

components/
├── providers.tsx                           # NextAuth & TanStack Query providers
└── dashboard/
    ├── sidebar.tsx                         # Navigation sidebar
    ├── header.tsx                          # Header with user info
    └── chart.tsx                           # Dashboard charts

lib/
├── api.ts                                  # Centralized API functions
├── axios-instance.ts                       # Axios configuration
└── utils.ts                                # Utility functions

middleware.ts                               # Route protection
```

## Authentication Flow

```
User Login
    ↓
NextAuth Credentials Provider
    ↓
POST /auth/login (backend validation)
    ↓
Store JWT tokens in session
    ↓
Axios interceptor adds token to all requests
    ↓
Access protected routes
```

## API Usage Example

```typescript
// In component:
'use client';
import { useQuery } from '@tanstack/react-query';
import { fieldApi } from '@/lib/api';

export default function FieldsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['fields', page],
    queryFn: async () => {
      const response = await fieldApi.getAllFields(page);
      return response.data.data;
    },
  });

  if (isLoading) return <Skeleton />;
  if (error) return <div>Error loading fields</div>;

  return <div>{/* render fields */}</div>;
}
```

## Environment Variables

Required variables in `.env.local`:

```
# Backend API URL
NEXT_PUBLIC_BASE_URL=http://localhost:5000

# NextAuth Configuration
NEXTAUTH_SECRET=your-secure-random-secret-min-32-chars
NEXTAUTH_URL=http://localhost:3000
```

Generate secure secret:
```bash
openssl rand -base64 32
```

## Key Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.0.10 | React framework |
| React | 19.2.0 | UI library |
| TypeScript | ^5 | Type safety |
| NextAuth.js | 5.0-beta | Authentication |
| TanStack Query | 5.28.0 | State management |
| Axios | 1.6.0 | HTTP client |
| Tailwind CSS | 4.1.9 | Styling |
| shadcn/ui | latest | UI components |
| Sonner | 1.7.4 | Notifications |
| Recharts | 2.15.4 | Charts |

## Features in Detail

### Authentication System
- **Login Page** - Email/password authentication with remember me option
- **Forgot Password** - OTP sent to registered email
- **OTP Verification** - 6-digit code input with auto-focus
- **Password Reset** - Set new password with confirmation
- **Change Password** - Change password from settings page
- **Session Management** - 30-day JWT expiry with refresh token support
- **Protected Routes** - Middleware ensures authentication

### Dashboard Analytics
- **Total Revenue** - Sum of all subscription revenue
- **Total Users** - Count of registered users
- **Total Field Owners** - Count of active field owners
- **User Joining Trend** - Area chart showing user growth over time

### Data Management
- **Pagination** - Implement on all list pages with configurable items per page
- **Sorting** - Table columns support sorting
- **Filtering** - Optional filters by status, type, etc.
- **Search** - Search functionality for lists
- **Caching** - Automatic 5-minute cache with background refetching

### Error Handling
- **Global Error Boundary** - Catches and displays errors
- **Toast Notifications** - User-friendly error messages
- **401 Handling** - Automatic logout and redirect to login
- **Network Errors** - Retry logic with exponential backoff
- **Validation Errors** - Field-specific error messages

## Performance Optimizations

- TanStack Query automatic caching (5 minutes)
- Skeleton loaders prevent layout shift
- Code splitting via Next.js routing
- Image optimization via Next.js Image component
- Pagination reduces payload size
- Background refetching on window focus

## Security Features

- JWT-based authentication
- Secure token storage in NextAuth session
- CSRF protection via NextAuth
- Password hashing (backend)
- Protected routes via middleware
- Automatic token injection via Axios interceptor
- 401 error handling with auto-logout
- Session expiry (30 days)

## Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Forgot password → OTP → Reset password flow
- [ ] Dashboard loads with statistics
- [ ] Pagination works on all pages
- [ ] Field owner list displays correctly
- [ ] Fields grid view displays correctly
- [ ] Subscription plans load
- [ ] Change password from settings
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Toast notifications appear
- [ ] Mobile responsiveness

### API Testing
- [ ] All 19 endpoints callable
- [ ] Correct response format
- [ ] Error messages display properly
- [ ] Pagination parameters work
- [ ] Token injection works
- [ ] 401 responses handled

## Deployment

### Production Checklist
- [ ] Set secure `NEXTAUTH_SECRET`
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production API
- [ ] Verify `NEXTAUTH_URL` matches domain
- [ ] Test authentication flows
- [ ] Test all dashboard pages
- [ ] Monitor API performance
- [ ] Set up error tracking
- [ ] Configure CORS on backend

### Build and Run
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

**Issue:** Login redirects back to login page
- Check backend is running
- Verify `NEXT_PUBLIC_BASE_URL` is correct
- Check response format from `/auth/login`

**Issue:** "Cannot find module" errors
- Run `npm install` again
- Clear `node_modules` and reinstall
- Restart dev server

**Issue:** API returns 401 errors
- Check token is being sent (Network tab)
- Verify backend validates JWT correctly
- Check token expiry

**Issue:** Data not showing
- Check browser console for errors
- Verify backend has data
- Check pagination parameters

## Contributing

1. Create feature branch
2. Make changes following existing patterns
3. Test thoroughly
4. Submit pull request

## License

MIT

## Support

For issues and questions:
1. Check documentation files
2. Review API_DOCUMENTATION.md
3. Check browser console for errors
4. Verify backend API is running

## Roadmap

Future enhancements:
- Real-time updates with WebSocket
- Advanced filtering and search
- Bulk operations (delete, update)
- CSV/PDF export
- Image upload for fields
- Analytics dashboard enhancements
- Dark mode support
- Internationalization (i18n)

---

**Built with ❤️ using Next.js, React, and modern web technologies**

For detailed information, see:
- [QUICK_START.md](./QUICK_START.md) - Quick setup guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Architecture details
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Complete feature list
