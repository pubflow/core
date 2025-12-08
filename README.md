# @pubflow/core

Core functionality for the Pubflow framework.

## 📚 Documentation

- **Flowless (Authentication Backend)**: [https://flowless.dev/](https://flowless.dev/)
- **Flowfull Client Libraries**: [https://clients.flowfull.dev/](https://clients.flowfull.dev/)
- **Bridge Payments**: [https://bridgepayments.dev/](https://bridgepayments.dev/)

## Overview

`@pubflow/core` provides the foundation for the Pubflow framework, including:

- Configuration management with support for multiple instances
- API client for making authenticated HTTP requests
- Authentication service for user management and session handling
- Bridge API service for standardized CRUD operations
- **Bridge Payment Client** for payment processing (NEW in v0.4.0)
- Schema validation using Zod
- Storage adapter interface for different storage mechanisms
- Utility functions for common tasks

## Installation

```bash
npm install @pubflow/core
```

## Usage

### Configuration

```typescript
import { initConfig, getConfig } from '@pubflow/core';

// Initialize configuration
const config = initConfig({
  baseUrl: 'https://api.example.com',
  bridgeBasePath: '/bridge',
  authBasePath: '/auth',
  useSecureStorage: true
});

// Get configuration
const config = getConfig();
```

### API Client

```typescript
import { ApiClient } from '@pubflow/core';
import { LocalStorageAdapter } from '@pubflow/react'; // Or your own storage adapter

// Create API client
const apiClient = new ApiClient(config, new LocalStorageAdapter());

// Make requests
const response = await apiClient.get('/users');
const user = await apiClient.post('/users', { name: 'John', email: 'john@example.com' });
```

### Authentication

```typescript
import { AuthService } from '@pubflow/core';

// Create auth service
const authService = new AuthService(apiClient, storage, config);

// Login
const result = await authService.login({
  email: 'user@example.com',
  password: 'password'
});

// Get current user (basic method)
const user = await authService.getCurrentUser();

// Get complete user data with all additional fields preserved
const completeUserData = await authService.getUserData();

// Validate session
const { isValid } = await authService.validateSession();

// Logout
await authService.logout();
```

### Bridge API

```typescript
import { BridgeApiService } from '@pubflow/core';

// Define entity type
interface User {
  id: string;
  name: string;
  email: string;
}

// Create Bridge API service
const userService = new BridgeApiService<User>(apiClient, {
  endpoint: 'users'
});

// Get list of users
const { data: users } = await userService.getList({ page: 1, limit: 10 });

// Get user by ID
const user = await userService.getById('123');

// Create user
const newUser = await userService.create({ name: 'Jane', email: 'jane@example.com' });

// Update user
const updatedUser = await userService.update('123', { name: 'Jane Doe' });

// Delete user
await userService.delete('123');

// Search users
const { data: filteredUsers } = await userService.search({
  q: 'jane',
  filters: [
    { field: 'status', operator: 'equals', value: 'active' }
  ],
  page: 1,
  limit: 10
});
```

### Schema Validation

```typescript
import { z } from 'zod';
import { validateWithSchema, createSchema } from '@pubflow/core';

// Define schema
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18)
});

// Create entity schemas
const schemas = createSchema({
  entity: userSchema,
  create: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().min(18)
  }),
  update: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    age: z.number().min(18).optional()
  })
});

// Validate data
const result = validateWithSchema(schemas.create, {
  name: 'John',
  email: 'invalid-email',
  age: 16
});

if (!result.success) {
  console.error(result.errors);
}
```

### Bridge Payments (NEW in v0.4.0)

```typescript
import { BridgePaymentClient } from '@pubflow/core';

// Create payment client
const paymentClient = new BridgePaymentClient({
  baseUrl: 'https://payments.example.com',
  storage: new LocalStorageAdapter() // Optional, defaults to MemoryStorage
});

// Create payment intent
const intent = await paymentClient.createPaymentIntent({
  total_cents: 2000, // $20.00
  currency: 'USD',
  description: 'Premium Subscription',
  provider_id: 'stripe'
});

// List payment methods
const methods = await paymentClient.listPaymentMethods();

// Create subscription
const subscription = await paymentClient.createSubscription({
  plan_id: 'plan_premium_monthly',
  payment_method_id: 'pm_123'
});

// Manage organizations (multi-tenant)
const org = await paymentClient.createOrganization({
  name: 'Acme Corp',
  email: 'billing@acme.com'
});
```

For complete payment integration examples, see the [Bridge Payments documentation](https://bridgepayments.dev/).