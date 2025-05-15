# Authentication API

The Authentication API provides methods for user authentication, session management, and user operations.

## Overview

The `AuthService` class handles all authentication-related functionality, including login, logout, session validation, user registration, and password reset.

## API Reference

### `AuthService`

#### Constructor

```typescript
constructor(apiClient: ApiClient, storage: StorageAdapter, config: PubflowInstanceConfig)
```

Creates a new authentication service.

##### Parameters

- `apiClient` (ApiClient): API client for making requests
- `storage` (StorageAdapter): Storage adapter for storing session data
- `config` (PubflowInstanceConfig): Pubflow configuration

##### Example

```typescript
import { AuthService, ApiClient } from '@pubflow/core';
import { LocalStorageAdapter } from '@pubflow/react';

const authService = new AuthService(
  new ApiClient(config, new LocalStorageAdapter()),
  new LocalStorageAdapter(),
  config
);
```

#### Methods

### `login(credentials)`

Logs in a user with the provided credentials.

##### Parameters

- `credentials` (LoginCredentials): User credentials
  - `email` (string, optional): User email
  - `userName` (string, optional): User username (alternative to email)
  - `password` (string): User password

##### Returns

- (Promise<LoginResult>): Login result
  - `success` (boolean): Whether the login was successful
  - `user` (User, optional): User data (only present if success is true)
  - `sessionId` (string, optional): Session ID (only present if success is true)
  - `error` (string, optional): Error message (only present if success is false)

##### Example

```typescript
const result = await authService.login({
  email: 'user@example.com',
  password: 'password'
});

if (result.success) {
  console.log('Logged in as', result.user.name);
} else {
  console.error('Login failed:', result.error);
}
```

### `logout()`

Logs out the current user.

##### Returns

- (Promise<{ success: boolean; error?: string }>): Operation result

##### Example

```typescript
const result = await authService.logout();

if (result.success) {
  console.log('Logged out successfully');
} else {
  console.error('Logout failed:', result.error);
}
```

### `validateSession()`

Validates the current session.

##### Returns

- (Promise<SessionValidationResult>): Session validation result
  - `isValid` (boolean): Whether the session is valid
  - `expiresAt` (string, optional): When the session expires (ISO date string)
  - `user` (User, optional): User data (only present if isValid is true)
  - `error` (string, optional): Error message (only present if isValid is false)

##### Example

```typescript
const { isValid, expiresAt } = await authService.validateSession();

if (isValid) {
  console.log('Session is valid until', new Date(expiresAt));
} else {
  console.log('Session is invalid');
}
```

### `refreshSession()`

Refreshes the current session.

##### Returns

- (Promise<SessionRefreshResult>): Session refresh result
  - `success` (boolean): Whether the refresh was successful
  - `sessionId` (string, optional): New session ID (only present if success is true)
  - `expiresAt` (string, optional): When the session expires (ISO date string)
  - `error` (string, optional): Error message (only present if success is false)

##### Example

```typescript
const result = await authService.refreshSession();

if (result.success) {
  console.log('Session refreshed successfully');
} else {
  console.error('Session refresh failed:', result.error);
}
```

### `getCurrentUser()`

Gets the current user.

##### Returns

- (Promise<User | null>): Current user or null if not authenticated

##### Example

```typescript
const user = await authService.getCurrentUser();

if (user) {
  console.log('Current user:', user.name);
} else {
  console.log('No user is authenticated');
}
```

### `register(data)`

Registers a new user.

##### Parameters

- `data` (RegistrationData): Registration data
  - `email` (string): User email
  - `password` (string): User password
  - `name` (string): User first name
  - `lastName` (string): User last name
  - `userType` (string): User type
  - `userName` (string, optional): User username
  - `picture` (string, optional): User profile picture URL

##### Returns

- (Promise<RegistrationResult>): Registration result
  - `success` (boolean): Whether the registration was successful
  - `id` (string, optional): User ID (only present if success is true)
  - `user` (User, optional): User data (only present if success is true)
  - `error` (string, optional): Error message (only present if success is false)

##### Example

```typescript
const result = await authService.register({
  email: 'newuser@example.com',
  password: 'password',
  name: 'John',
  lastName: 'Doe',
  userType: 'client'
});

if (result.success) {
  console.log('User registered successfully:', result.id);
} else {
  console.error('Registration failed:', result.error);
}
```

### `requestPasswordReset(data)`

Requests a password reset.

##### Parameters

- `data` (PasswordResetRequestData): Password reset request data
  - `email` (string): User email
  - `resetUrl` (string, optional): Custom URL for the reset page

##### Returns

- (Promise<{ success: boolean; message?: string; error?: string }>): Operation result

##### Example

```typescript
const result = await authService.requestPasswordReset({
  email: 'user@example.com',
  resetUrl: 'https://example.com/reset-password'
});

if (result.success) {
  console.log('Password reset requested successfully');
} else {
  console.error('Password reset request failed:', result.error);
}
```

### `resetPassword(data)`

Resets a password with a token.

##### Parameters

- `data` (PasswordResetData): Password reset data
  - `token` (string): Reset token
  - `password` (string): New password

##### Returns

- (Promise<{ success: boolean; message?: string; error?: string }>): Operation result

##### Example

```typescript
const result = await authService.resetPassword({
  token: 'reset_token',
  password: 'new_password'
});

if (result.success) {
  console.log('Password reset successfully');
} else {
  console.error('Password reset failed:', result.error);
}
```

### `validateResetToken(token)`

Validates a password reset token.

##### Parameters

- `token` (string): Reset token

##### Returns

- (Promise<{ valid: boolean; message?: string }>): Validation result

##### Example

```typescript
const result = await authService.validateResetToken('reset_token');

if (result.valid) {
  console.log('Token is valid');
} else {
  console.log('Token is invalid:', result.message);
}
```
