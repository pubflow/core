# Multi-initialization Guide

This guide explains how to use Pubflow's multi-initialization feature to connect to multiple backends within the same application.

## Overview

Pubflow supports connecting to multiple backends simultaneously, which is useful for applications that need to interact with different services. Each backend connection is managed by a separate configuration instance with its own storage space.

## Basic Usage

### Initializing Multiple Configurations

```typescript
import { initConfig, getConfig } from '@pubflow/core';

// Initialize main backend
const mainConfig = initConfig({
  baseUrl: 'https://api.main.com',
  bridgeBasePath: '/bridge',
  authBasePath: '/auth'
}, 'main');

// Initialize analytics backend
const analyticsConfig = initConfig({
  baseUrl: 'https://api.analytics.com',
  bridgeBasePath: '/data-api',
  authBasePath: '/auth'
}, 'analytics');

// Get configurations later
const mainConfig = getConfig('main');
const analyticsConfig = getConfig('analytics');
```

### Creating API Clients

```typescript
import { ApiClient } from '@pubflow/core';
import { LocalStorageAdapter } from '@pubflow/react';

// Create storage adapters
const mainStorage = new LocalStorageAdapter();
const analyticsStorage = new LocalStorageAdapter();

// Create API clients
const mainApiClient = new ApiClient(mainConfig, mainStorage);
const analyticsApiClient = new ApiClient(analyticsConfig, analyticsStorage);
```

### Creating Services

```typescript
import { AuthService, BridgeApiService } from '@pubflow/core';

// Create auth services
const mainAuthService = new AuthService(mainApiClient, mainStorage, mainConfig);
const analyticsAuthService = new AuthService(analyticsApiClient, analyticsStorage, analyticsConfig);

// Create Bridge API services
const userService = new BridgeApiService<User>(mainApiClient, {
  endpoint: 'users'
});

const analyticsService = new BridgeApiService<AnalyticsData>(analyticsApiClient, {
  endpoint: 'events'
});
```

## Using with React

When using Pubflow with React, you can use the `PubflowProvider` component to manage multiple instances:

```tsx
import { PubflowProvider } from '@pubflow/react';

function App() {
  return (
    <PubflowProvider
      instances={[
        {
          id: 'main',
          baseUrl: 'https://api.main.com',
          bridgeBasePath: '/bridge',
          authBasePath: '/auth'
        },
        {
          id: 'analytics',
          baseUrl: 'https://api.analytics.com',
          bridgeBasePath: '/data-api',
          authBasePath: '/auth'
        }
      ]}
      defaultInstance="main"
    >
      {/* Your application */}
    </PubflowProvider>
  );
}
```

### Using Hooks with Multiple Instances

```tsx
import { useAuth, useBridgeApi } from '@pubflow/react';

function UserProfile() {
  // Use main instance for user data
  const { user, isAuthenticated } = useAuth('main');
  
  // Use analytics instance for analytics data
  const analyticsService = useBridgeApi<AnalyticsData>({
    endpoint: 'events'
  }, 'analytics');
  
  // ...
}
```

## Storage Isolation

Each instance has its own isolated storage space, preventing conflicts between instances:

```typescript
// Storage keys are prefixed with the instance ID
// For example:
// - main instance: 'pubflow_main_session_id'
// - analytics instance: 'pubflow_analytics_session_id'
```

You can customize the storage prefix for each instance:

```typescript
const mainConfig = initConfig({
  baseUrl: 'https://api.main.com',
  storageConfig: {
    prefix: 'my_app_main'
  }
}, 'main');

// Storage key: 'my_app_main_session_id'
```

## Session Management

Each instance has its own session management, allowing users to be logged in to multiple backends simultaneously:

```tsx
function LoginPage() {
  const { login: mainLogin } = useAuth('main');
  const { login: analyticsLogin } = useAuth('analytics');
  
  const handleMainLogin = async (credentials) => {
    await mainLogin(credentials);
  };
  
  const handleAnalyticsLogin = async (credentials) => {
    await analyticsLogin(credentials);
  };
  
  // ...
}
```

## Advanced Configuration

### Different Session Validation Settings

You can configure different session validation settings for each instance:

```typescript
const mainConfig = initConfig({
  baseUrl: 'https://api.main.com',
  sessionConfig: {
    validationInterval: 5 * 60 * 1000, // 5 minutes
    autoValidate: true
  }
}, 'main');

const analyticsConfig = initConfig({
  baseUrl: 'https://api.analytics.com',
  sessionConfig: {
    validationInterval: 30 * 60 * 1000, // 30 minutes
    autoValidate: false
  }
}, 'analytics');
```

### Different Storage Mechanisms

You can use different storage mechanisms for each instance:

```typescript
import { ApiClient, AuthService } from '@pubflow/core';
import { LocalStorageAdapter } from '@pubflow/react';
import { SecureStorageAdapter } from '@pubflow/react-native';

// Use localStorage for main instance
const mainStorage = new LocalStorageAdapter();
const mainApiClient = new ApiClient(mainConfig, mainStorage);
const mainAuthService = new AuthService(mainApiClient, mainStorage, mainConfig);

// Use secure storage for analytics instance
const analyticsStorage = new SecureStorageAdapter();
const analyticsApiClient = new ApiClient(analyticsConfig, analyticsStorage);
const analyticsAuthService = new AuthService(analyticsApiClient, analyticsStorage, analyticsConfig);
```

## Best Practices

1. **Use meaningful instance IDs**: Choose descriptive names for your instances to make your code more readable.

2. **Set a default instance**: When using the `PubflowProvider`, always set a default instance to simplify usage when you don't need to specify an instance.

3. **Isolate storage**: Use different storage prefixes for each instance to prevent conflicts.

4. **Handle authentication separately**: Each instance has its own authentication state, so handle login/logout separately for each instance.

5. **Consider security implications**: If one instance requires higher security (e.g., secure storage), configure it accordingly.

## Example: Multi-tenant Application

```tsx
import { PubflowProvider, useAuth, useBridgeApi } from '@pubflow/react';

function App() {
  return (
    <PubflowProvider
      instances={[
        {
          id: 'tenant1',
          baseUrl: 'https://tenant1.api.example.com',
          storageConfig: {
            prefix: 'tenant1'
          }
        },
        {
          id: 'tenant2',
          baseUrl: 'https://tenant2.api.example.com',
          storageConfig: {
            prefix: 'tenant2'
          }
        }
      ]}
      defaultInstance="tenant1"
    >
      <TenantSelector />
      <Dashboard />
    </PubflowProvider>
  );
}

function TenantSelector() {
  const [selectedTenant, setSelectedTenant] = useState('tenant1');
  
  return (
    <select
      value={selectedTenant}
      onChange={(e) => setSelectedTenant(e.target.value)}
    >
      <option value="tenant1">Tenant 1</option>
      <option value="tenant2">Tenant 2</option>
    </select>
  );
}

function Dashboard({ selectedTenant }) {
  const { user, isAuthenticated } = useAuth(selectedTenant);
  const userService = useBridgeApi<User>({
    endpoint: 'users'
  }, selectedTenant);
  
  // ...
}
```
