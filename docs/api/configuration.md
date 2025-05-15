# Configuration API

The Configuration API provides functions for managing Pubflow configuration.

## Overview

Pubflow uses a centralized configuration system that supports multiple instances. This allows you to connect to different backends within the same application.

## API Reference

### `initConfig(config, instanceId?)`

Initializes a new configuration instance.

#### Parameters

- `config` (PubflowConfig): Configuration options
- `instanceId` (string, optional): Unique identifier for this configuration instance. Default: 'default'

#### Returns

- (PubflowInstanceConfig): The complete configuration

#### Example

```typescript
import { initConfig } from '@pubflow/core';

const config = initConfig({
  baseUrl: 'https://api.example.com',
  bridgeBasePath: '/bridge',
  authBasePath: '/auth',
  useSecureStorage: true
});
```

### `getConfig(instanceId?)`

Gets an existing configuration instance.

#### Parameters

- `instanceId` (string, optional): Identifier for the configuration instance. Default: 'default'

#### Returns

- (PubflowInstanceConfig): The configuration for the specified instance

#### Throws

- Error: If the configuration instance does not exist

#### Example

```typescript
import { getConfig } from '@pubflow/core';

const config = getConfig();
```

### `getAllConfigs()`

Gets all configuration instances.

#### Returns

- (Map<string, PubflowInstanceConfig>): Map of all configuration instances

#### Example

```typescript
import { getAllConfigs } from '@pubflow/core';

const configs = getAllConfigs();
```

### `hasConfig(instanceId)`

Checks if a configuration instance exists.

#### Parameters

- `instanceId` (string): Identifier for the configuration instance

#### Returns

- (boolean): True if the instance exists

#### Example

```typescript
import { hasConfig } from '@pubflow/core';

if (hasConfig('analytics')) {
  // Configuration exists
}
```

### `removeConfig(instanceId)`

Removes a configuration instance.

#### Parameters

- `instanceId` (string): Identifier for the configuration instance

#### Returns

- (boolean): True if the instance was removed

#### Example

```typescript
import { removeConfig } from '@pubflow/core';

removeConfig('analytics');
```

### `updateConfig(instanceId, config)`

Updates an existing configuration instance.

#### Parameters

- `instanceId` (string): Identifier for the configuration instance
- `config` (Partial<PubflowConfig>): New configuration options

#### Returns

- (PubflowInstanceConfig): The updated configuration

#### Throws

- Error: If the configuration instance does not exist

#### Example

```typescript
import { updateConfig } from '@pubflow/core';

const updatedConfig = updateConfig('main', {
  timeout: 60000
});
```

## Configuration Options

### `PubflowConfig`

Configuration options for Pubflow.

#### Properties

- `baseUrl` (string): Base URL for the API
- `bridgeBasePath` (string, optional): Custom base path for bridge API. Default: '/bridge'
- `authBasePath` (string, optional): Custom base path for auth API. Default: '/auth'
- `timeout` (number, optional): Default timeout for API requests in milliseconds. Default: 30000
- `useSecureStorage` (boolean, optional): Whether to use secure storage for session tokens. Default: true
- `sessionConfig` (SessionConfig, optional): Session configuration
- `storageConfig` (StorageConfig, optional): Storage configuration
- `headers` (Record<string, string>, optional): Custom headers to include in all API requests

### `SessionConfig`

Configuration options for session management.

#### Properties

- `validationInterval` (number, optional): Interval for session validation in milliseconds. Default: 5 * 60 * 1000 (5 minutes)
- `validationEndpoint` (string, optional): Endpoint for session validation. Default: '/validate-session'
- `autoValidate` (boolean, optional): Whether to automatically validate session. Default: true
- `validateOnStartup` (boolean, optional): Whether to validate session on startup. Default: true
- `validateBeforeRequests` (boolean, optional): Whether to validate session before requests. Default: false
- `refreshThreshold` (number, optional): Threshold for session refresh in milliseconds. Default: 5 * 60 * 1000 (5 minutes)
- `onSessionExpired` (function, optional): Callback when session expires
- `onSessionRefreshed` (function, optional): Callback when session is refreshed

### `StorageConfig`

Configuration options for storage.

#### Properties

- `prefix` (string, optional): Prefix for storage keys. Default: 'pubflow'
- `sessionKey` (string, optional): Name for session key. Default: 'session_id'
