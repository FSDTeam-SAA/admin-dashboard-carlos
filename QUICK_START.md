# Quick Start Guide

## 30 Seconds Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env.local`
```
NEXT_PUBLIC_BASE_URL=http://localhost:5000
NEXTAUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open Browser
```
http://localhost:3000
```

---

## Login Credentials

Use credentials from your backend:
```
Email: admin@example.com
Password: 123456
```

---

## Pages Available

### Public Routes
- `/login` - Login page
- `/forgot-password` - Password recovery
- `/verify-otp` - OTP verification
- `/reset-password` - New password setup

### Protected Routes (Dashboard)
- `/dashboard` - Overview with stats
- `/dashboard/field-owners` - Field owner list
- `/dashboard/fields` - Field management
- `/dashboard/subscription` - Plans management
- `/dashboard/settings` - User settings

---

## Key Features at a Glance

| Feature | Location | Status |
|---------|----------|--------|
| Login with Email/Password | `/login` | ✓ Ready |
| Forgot Password Flow | `/forgot-password` → OTP → `/reset-password` | ✓ Ready |
| Dashboard Overview | `/dashboard` | ✓ Ready |
| Statistics & Charts | `/dashboard` | ✓ Ready |
| Field Owners List | `/dashboard/field-owners` | ✓ Ready |
| Fields Management | `/dashboard/fields` | ✓ Ready |
| Subscription Plans | `/dashboard/subscription` | ✓ Ready |
| User Settings | `/dashboard/settings` | ✓ Ready |
| Session Management | Automatic via NextAuth | ✓ Ready |
| Pagination | All list pages | ✓ Ready |
| Error Handling | Global with Sonner | ✓ Ready |
| Loading States | Skeleton components | ✓ Ready |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐    ┌────────────┐  │
│  │   Pages      │      │ Components   │    │   Layout   │  │
│  │  (5 pages)   │      │  (Sidebar,   │    │  (Auth,    │  │
│  │              │      │   Header)    │    │  Dashboard)│  │
│  └──────────────┘      └──────────────┘    └────────────┘  │
│        │                        │                    │       │
│        └────────────────────────┴────────────────────┘       │
│                                │                              │
│                    ┌───────────▼────────────┐               │
│                    │   Providers Layer      │               │
│                    │ (SessionProvider,      │               │
│                    │  QueryClientProvider)  │               │
│                    └───────────┬────────────┘               │
│                                │                              │
│       ┌─────────────────────────┼──────────────────────┐     │
│       │                         │                      │     │
│  ┌────▼────────┐    ┌──────────▼─────┐    ┌──────────▼─┐   │
│  │ API Layer   │    │ Axios Instance │    │ Middleware │   │
│  │ (lib/api)   │    │ + Interceptors │    │ (Protected │   │
│  │             │    │ (with token)   │    │   routes)  │   │
│  └────┬────────┘    └────────────────┘    └────────────┘   │
│       │                                                      │
│       └──────────────────────┬───────────────────────────┘   │
│                              │                                │
└──────────────────────────────┼─────────────────────────────┘
                               │
                  ┌────────────▼──────────────┐
                  │   BACKEND API             │
                  │  (Node.js / Express)      │
                  │                           │
                  │  Routes:                  │
                  │  • /auth/login            │
                  │  • /admin/dashboard       │
                  │  • /field                 │
                  │  • /admin/field-owners    │
                  │  • /plans                 │
                  │  • /user/profile          │
                  └───────────────────────────┘
```

---

## Data Flow Example

### Fetching Field Owners

```
1. User navigates to /dashboard/field-owners
   ↓
2. useQuery hook executes with queryKey: ['field-owners', page]
   ↓
3. Check TanStack Query cache (5 min stale time)
   ↓
4. If cache miss → Call fieldOwnerApi.getAll(page)
   ↓
5. Axios interceptor adds Authorization header
   ↓
6. Request: GET /admin/field-owners?page=1&limit=10
   ↓
7. Backend returns paginated field owners
   ↓
8. TanStack Query caches response
   ↓
9. Component renders with data + pagination controls
   ↓
10. User changes page
   ↓
11. Query refetches due to new page in queryKey
   ↓
12. New data displayed
```

---

## API Integration Checklist

Before using the dashboard, ensure your backend API:

- [ ] Running at `NEXT_PUBLIC_BASE_URL`
- [ ] Has all 19 endpoints documented in `API_DOCUMENTATION.md`
- [ ] Returns correct response format (success, message, data)
- [ ] Validates authorization tokens
- [ ] Handles pagination (page, limit)
- [ ] Returns proper error messages

---

## Common Tasks

### Task: Add a New Dashboard Page

1. Create folder: `/app/dashboard/new-feature/`
2. Create file: `/app/dashboard/new-feature/page.tsx`
3. Import API function from `/lib/api.ts`
4. Use `useQuery` hook for data fetching
5. Add menu item in `/components/dashboard/sidebar.tsx`

```tsx
// Example:
'use client';
import { useQuery } from '@tanstack/react-query';
import { fieldApi } from '@/lib/api';

export default function NewFeaturePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['new-feature'],
    queryFn: async () => {
      const response = await fieldApi.getAllFields();
      return response.data.data;
    },
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">New Feature</h1>
      {isLoading ? <Skeleton /> : <div>{/* render data */}</div>}
    </div>
  );
}
```

### Task: Call a New API Endpoint

1. Add function to `/lib/api.ts`:
```tsx
export const newApi = {
  getResource: () =>
    axiosInstance.get('/endpoint', { params: { /* params */ } }),
};
```

2. Use in component:
```tsx
const { data } = useQuery({
  queryKey: ['resource'],
  queryFn: async () => {
    const response = await newApi.getResource();
    return response.data.data;
  },
});
```

### Task: Add Form with Validation

```tsx
const [data, setData] = useState('');
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!data) {
    toast.error('Field required');
    return;
  }
  
  try {
    setIsLoading(true);
    const response = await api.submitData(data);
    toast.success('Success!');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Error');
  } finally {
    setIsLoading(false);
  }
};
```

---

## Debugging Tips

### Check API Calls
```tsx
// Add in browser console:
// Look for Network tab in DevTools
// Check Headers: Authorization header present?
// Check Response: Correct format?
```

### Debug Component State
```tsx
// Add console.log:
console.log('[v0] Data loaded:', data);
console.log('[v0] Loading state:', isLoading);
console.log('[v0] Error:', error);
```

### Check Session/Token
```tsx
// In browser console:
// Open Application tab → Cookies → Check NEXT_AUTH_CALLBACK_URL
// Or check: sessionStorage/localStorage for tokens
```

### TanStack Query DevTools
Install for development:
```bash
npm install @tanstack/react-query-devtools
```

Add to providers.tsx:
```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// In component tree:
<QueryClientProvider>
  {children}
  <ReactQueryDevtools />
</QueryClientProvider>
```

---

## Deployment Checklist

- [ ] Set `NEXTAUTH_SECRET` to secure value
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production API
- [ ] Verify `NEXTAUTH_URL` matches deployment URL
- [ ] Test all authentication flows
- [ ] Test all dashboard pages
- [ ] Verify error handling
- [ ] Check mobile responsiveness
- [ ] Test pagination
- [ ] Monitor API performance

---

## Environment Setup

### Development
```
NEXT_PUBLIC_BASE_URL=http://localhost:5000
NEXTAUTH_SECRET=dev-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Production
```
NEXT_PUBLIC_BASE_URL=https://api.production.com
NEXTAUTH_SECRET=secure-random-32-char-secret
NEXTAUTH_URL=https://dashboard.production.com
```

Generate secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Support Resources

- **API Docs:** See `API_DOCUMENTATION.md`
- **Project Structure:** See `PROJECT_STRUCTURE.md`
- **Full Summary:** See `IMPLEMENTATION_SUMMARY.md`
- **Component Library:** shadcn/ui (ui.shadcn.com)
- **NextAuth Docs:** nextauth.js.org
- **TanStack Query:** tanstack.com/query

---

## Performance Tips

1. **Reduce API Calls**
   - Use TanStack Query caching (5 min by default)
   - Avoid unnecessary refetches

2. **Optimize Images**
   - Use Next.js Image component
   - Lazy load offscreen images

3. **Pagination**
   - Limit items per page (default: 10)
   - Pre-fetch next page in background

4. **Skeleton Loaders**
   - Show skeletons instead of spinners
   - Reduces perceived load time

---

## Next Steps

1. ✓ Install dependencies
2. ✓ Configure environment
3. ✓ Start dev server
4. ✓ Test login flow
5. ✓ Explore dashboard pages
6. ✓ Review API_DOCUMENTATION.md
7. ✓ Deploy to production

**Happy coding!**
