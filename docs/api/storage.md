# Storage API

The Storage API provides an abstract interface for different storage mechanisms.

## Overview

Pubflow uses an abstract storage interface that can be implemented for different platforms. This allows the framework to work with different storage mechanisms (localStorage, AsyncStorage, SecureStore, etc.) while maintaining a consistent API.

## API Reference

### `StorageAdapter`

Interface for storage adapters.

#### Methods

### `getItem(key)`

Gets a value from storage.

##### Parameters

- `key` (string): The key to retrieve

##### Returns

- (Promise<string | null>): The stored value, or null if not found

##### Example

```typescript
const value = await storage.getItem('user_data');
```

### `setItem(key, value)`

Saves a value to storage.

##### Parameters

- `key` (string): The key to store under
- `value` (string): The value to store

##### Returns

- (Promise<void>)

##### Example

```typescript
await storage.setItem('user_data', JSON.stringify(user));
```

### `removeItem(key)`

Removes a value from storage.

##### Parameters

- `key` (string): The key to remove

##### Returns

- (Promise<void>)

##### Example

```typescript
await storage.removeItem('user_data');
```

### `MemoryStorageAdapter`

Implementation of `StorageAdapter` that stores data in memory. Useful for testing or environments without persistent storage.

#### Constructor

```typescript
constructor()
```

Creates a new memory storage adapter.

#### Methods

Implements all methods from `StorageAdapter`.

#### Additional Methods

### `clear()`

Clears all values from memory storage.

##### Returns

- (Promise<void>)

##### Example

```typescript
await memoryStorage.clear();
```

### `createStorageKey(baseKey, prefix?, instanceId?)`

Utility function to create a storage key with prefix and instance ID.

#### Parameters

- `baseKey` (string): The base key
- `prefix` (string, optional): Optional prefix
- `instanceId` (string, optional): Optional instance ID

#### Returns

- (string): The prefixed storage key

#### Example

```typescript
import { createStorageKey } from '@pubflow/core';

const key = createStorageKey('session_id', 'pubflow', 'main');
// Returns: 'pubflow_main_session_id'
```

## Implementing a Custom Storage Adapter

You can implement your own storage adapter by implementing the `StorageAdapter` interface:

```typescript
import { StorageAdapter } from '@pubflow/core';

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

### Example: LocalStorage Adapter

```typescript
import { StorageAdapter } from '@pubflow/core';

export class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  }
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
    }
  }
  
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  }
}
```

### Example: AsyncStorage Adapter (React Native)

```typescript
import { StorageAdapter } from '@pubflow/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  }
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
    }
  }
  
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  }
}
```

### Example: SecureStorage Adapter (React Native with Expo)

```typescript
import { StorageAdapter } from '@pubflow/core';
import * as SecureStore from 'expo-secure-store';

export class SecureStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting item from SecureStore:', error);
      return null;
    }
  }
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in SecureStore:', error);
    }
  }
  
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from SecureStore:', error);
    }
  }
}
```
