# Plan Management API Documentation

## Overview

The Plan Management API allows you to create, read, update, and delete subscription plans. This is a core feature for managing your subscription tiers and pricing.

## Base URL

```
{{BASE_URL}}/plan
```

## Data Model

### Plan Object

```typescript
{
  "_id": string,
  "name": string,
  "price": number,
  "description": string,
  "billingCycle": "monthly" | "yearly",
  "benefits": string[],
  "__v": number (version)
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `_id` | String | Unique identifier for the plan (MongoDB ObjectId) |
| `name` | String | Name of the plan (e.g., "Basic Plan", "Premium Plan") |
| `price` | Number | Price in decimal format (e.g., 9.99) |
| `description` | String | Brief description of what the plan offers |
| `billingCycle` | String | Billing frequency: "monthly" or "yearly" |
| `benefits` | Array | List of benefits/features included in the plan |
| `__v` | Number | MongoDB version field (automatically managed) |

## Endpoints

### 1. Get All Plans

**Endpoint:** `GET /plan`

**Description:** Retrieve all subscription plans

**Query Parameters:** None

**Request Example:**
```bash
curl -X GET "{{BASE_URL}}/plan" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Plans retrieved successfully",
  "data": [
    {
      "_id": "69770a15a10a458c44c07893",
      "name": "Basic Plan",
      "price": 9.99,
      "description": "Access to core features",
      "billingCycle": "monthly",
      "benefits": [
        "Unlimited chats",
        "Priority support",
        "Custom themes"
      ],
      "__v": 0
    },
    {
      "_id": "69770a15a10a458c44c07894",
      "name": "Premium Plan",
      "price": 39.99,
      "description": "Advanced features for power users",
      "billingCycle": "monthly",
      "benefits": [
        "Unlimited chats",
        "Priority support",
        "Custom themes",
        "API access",
        "Team collaboration",
        "Advanced analytics"
      ],
      "__v": 0
    }
  ]
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### 2. Create Plan

**Endpoint:** `POST /plan`

**Description:** Create a new subscription plan

**Request Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Basic Plan",
  "price": 9.99,
  "description": "Access to core features",
  "billingCycle": "monthly",
  "benefits": [
    "Unlimited chats",
    "Priority support",
    "Custom themes"
  ]
}
```

**Request Example:**
```bash
curl -X POST "{{BASE_URL}}/plan" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Basic Plan",
    "price": 9.99,
    "description": "Access to core features",
    "billingCycle": "monthly",
    "benefits": ["Unlimited chats", "Priority support", "Custom themes"]
  }'
```

**Validation Rules:**
- `name`: Required, string (1-100 characters)
- `price`: Required, number (must be >= 0)
- `description`: Required, string (1-500 characters)
- `billingCycle`: Required, enum ("monthly" or "yearly")
- `benefits`: Required, array of strings (at least 1 benefit)

**Response Success (201):**
```json
{
  "success": true,
  "message": "Plan created successfully",
  "data": {
    "_id": "69770a15a10a458c44c07895",
    "name": "Basic Plan",
    "price": 9.99,
    "description": "Access to core features",
    "billingCycle": "monthly",
    "benefits": [
      "Unlimited chats",
      "Priority support",
      "Custom themes"
    ],
    "__v": 0
  }
}
```

**Error Responses:**

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "name": "Plan name is required",
    "price": "Price must be a positive number"
  }
}
```

**Duplicate Plan (409):**
```json
{
  "success": false,
  "message": "A plan with this name already exists"
}
```

---

### 3. Update Plan

**Endpoint:** `PATCH /plan/{id}`

**Description:** Update an existing plan by ID

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | The MongoDB ObjectId of the plan to update |

**Request Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Basic Plan",
  "price": 12.99,
  "description": "Enhanced core features",
  "billingCycle": "monthly",
  "benefits": [
    "Unlimited chats",
    "Priority support",
    "Custom themes",
    "Early access to new features"
  ]
}
```

**Request Example:**
```bash
curl -X PATCH "{{BASE_URL}}/plan/69770a15a10a458c44c07895" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 12.99,
    "description": "Enhanced core features",
    "benefits": ["Unlimited chats", "Priority support", "Custom themes", "Early access"]
  }'
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Plan updated successfully",
  "data": {
    "_id": "69770a15a10a458c44c07895",
    "name": "Updated Basic Plan",
    "price": 12.99,
    "description": "Enhanced core features",
    "billingCycle": "monthly",
    "benefits": [
      "Unlimited chats",
      "Priority support",
      "Custom themes",
      "Early access to new features"
    ],
    "__v": 1
  }
}
```

**Error Responses:**

**Plan Not Found (404):**
```json
{
  "success": false,
  "message": "Plan not found"
}
```

**Invalid ID Format (400):**
```json
{
  "success": false,
  "message": "Invalid plan ID format"
}
```

---

### 4. Delete Plan

**Endpoint:** `DELETE /plan/{id}`

**Description:** Delete a plan by ID

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | The MongoDB ObjectId of the plan to delete |

**Request Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Request Example:**
```bash
curl -X DELETE "{{BASE_URL}}/plan/69770a15a10a458c44c07895" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Plan deleted successfully"
}
```

**Error Responses:**

**Plan Not Found (404):**
```json
{
  "success": false,
  "message": "Plan not found"
}
```

**Plan in Use (409):**
```json
{
  "success": false,
  "message": "Cannot delete plan that is currently in use by active subscriptions"
}
```

---

## Integration Examples

### Using the Frontend API Client

#### Get All Plans
```typescript
import { planApi } from '@/lib/api';

const { data } = await planApi.getAllPlans();
console.log(data.data); // Array of plans
```

#### Create a Plan
```typescript
const newPlan = {
  name: 'Pro Plan',
  price: 29.99,
  description: 'Perfect for growing teams',
  billingCycle: 'monthly',
  benefits: [
    'Unlimited everything',
    'Premium support',
    'Advanced analytics',
  ],
};

const { data } = await planApi.createPlan(newPlan);
console.log(data.data); // Created plan with _id
```

#### Update a Plan
```typescript
const updates = {
  price: 34.99,
  benefits: ['Unlimited everything', 'Premium support', 'Advanced analytics', 'API access'],
};

const { data } = await planApi.updatePlan('69770a15a10a458c44c07895', updates);
console.log(data.data); // Updated plan
```

#### Delete a Plan
```typescript
await planApi.deletePlan('69770a15a10a458c44c07895');
console.log('Plan deleted successfully');
```

### Using TanStack Query (React Query)

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { planApi } from '@/lib/api';

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await planApi.getAllPlans();
      return response.data.data;
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => planApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}
```

---

## Authentication

All endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer {JWT_TOKEN}
```

Tokens are obtained from the login endpoint and typically expire in 30 days.

## Rate Limiting

- **Rate Limit:** 100 requests per minute per authenticated user
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Error Handling

### Common Error Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 404 | Not Found |
| 409 | Conflict (duplicate or constraint violation) |
| 500 | Internal Server Error |

### Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": {
    "fieldName": "Field-specific error message"
  }
}
```

## Best Practices

1. **Always validate input** before sending to the API
2. **Use pagination** when fetching large lists
3. **Cache responses** using TanStack Query for better performance
4. **Handle errors gracefully** with user-friendly messages
5. **Use optimistic updates** for better UX
6. **Invalidate cache** after mutations (create, update, delete)

## Testing

### Test Plan Creation
```bash
curl -X POST "http://localhost:3000/api/plan" \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Plan",
    "price": 19.99,
    "description": "A test plan",
    "billingCycle": "monthly",
    "benefits": ["Test benefit 1", "Test benefit 2"]
  }'
```

---

## Related Endpoints

- **Subscription Management:** `PUT /subscription/update`
- **User Management:** `GET /user/profile`, `PUT /user/profile`
- **Authentication:** `POST /auth/login`, `POST /auth/forget`

## Support

For issues or questions, please contact the API support team or check the main API documentation.
