# Core Concepts

This document explains the core concepts of the Pubflow Framework.

## Architecture

Pubflow follows a modular architecture with a core package and platform-specific adapters:

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                       │
│  (Your React/NextJS/React Native application using Pubflow) │
└───────────────────────────────────────────────────┬─────────┘
                                                    │
┌───────────────────────────────────────────────────▼─────────┐
│                      Adapter Layer                          │
├─────────────────┬─────────────────────┬─────────────────────┤
│  @pubflow/react │  @pubflow/nextjs    │ @pubflow/react-native│
└────────┬────────┴──────────┬──────────┴──────────┬───────────┘
         │                   │                     │
┌────────▼───────────────────▼─────────────────────▼───────────┐
│                        Core Layer                            │
│                      @pubflow/core                           │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

Pubflow uses a centralized configuration system that supports multiple instances. This allows you to connect to different backends within the same application.

```typescript
import { initConfig, getConfig } from '@pubflow/core';

// Initialize configuration
const config = initConfig({
  baseUrl: 'https://api.example.com',
  bridgeBasePath: '/bridge',
  authBasePath: '/auth',
  useSecureStorage: true,
  sessionConfig: {
    validationInterval: 5 * 60 * 1000, // 5 minutes
    autoValidate: true
  }
});

// Get configuration
const config = getConfig();
```

## Authentication

The authentication system in Pubflow handles user authentication, session management, and user operations. It supports:

- Login/logout
- Session validation
- Session renewal
- User registration
- Password reset

```typescript
import { AuthService } from '@pubflow/core';

// Create auth service
const authService = new AuthService(apiClient, storage, config);

// Login
const result = await authService.login({
  email: 'user@example.com',
  password: 'password'
});

// Validate session
const { isValid } = await authService.validateSession();

// Logout
await authService.logout();
```

## Bridge API

The Bridge API provides a standardized way to interact with backend APIs that follow the Bridge pattern. It supports:

- CRUD operations (create, read, update, delete)
- Pagination
- Sorting
- Filtering
- Advanced search

```typescript
import { BridgeApiService } from '@pubflow/core';

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
```

## Schema Validation

Pubflow uses Zod for schema validation, allowing you to define schemas for your entities and validate data before sending it to the server.

```typescript
import { z } from 'zod';
import { validateWithSchema, createSchema } from '@pubflow/core';

// Define schema
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18)
});

// Validate data
const result = validateWithSchema(userSchema, {
  name: 'John',
  email: 'invalid-email',
  age: 16
});

if (!result.success) {
  console.error(result.errors);
}
```

## Storage

Pubflow uses an abstract storage interface that can be implemented for different platforms. This allows the framework to work with different storage mechanisms (localStorage, AsyncStorage, SecureStore, etc.) while maintaining a consistent API.

```typescript
import { StorageAdapter } from '@pubflow/core';

// Implement storage adapter
class MyStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    // Implementation
  }
  
  async setItem(key: string, value: string): Promise<void> {
    // Implementation
  }
  
  async removeItem(key: string): Promise<void> {
    // Implementation
  }
}
```

## Multi-initialization

Pubflow supports connecting to multiple backends within the same application. This is useful for applications that need to interact with different services.

```typescript
import { initConfig, getConfig } from '@pubflow/core';

// Initialize multiple configurations
const mainConfig = initConfig({
  baseUrl: 'https://api.main.com'
}, 'main');

const analyticsConfig = initConfig({
  baseUrl: 'https://api.analytics.com'
}, 'analytics');

// Get configurations
const mainConfig = getConfig('main');
const analyticsConfig = getConfig('analytics');
```

## Platform Adapters

Pubflow provides adapters for different platforms:

- **@pubflow/react**: For React applications
- **@pubflow/nextjs**: For Next.js applications
- **@pubflow/react-native**: For React Native applications

These adapters provide platform-specific implementations of the core functionality, as well as additional components and hooks for each platform.
