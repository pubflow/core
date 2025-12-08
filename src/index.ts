/**
 * Pubflow Core
 * 
 * Main entry point for the Pubflow Core package
 */

// Export API
export * from './api/client';
export * from './api/types';

// Export Auth
export * from './auth/service';

// Export Bridge
export * from './bridge/service';
export * from './bridge/types';

// Export Config
export * from './config';

// Export Schema
export * from './schema/validator';

// Export Storage
export * from './storage/adapter';

// Export core types
export type {
  User,
  SessionConfig,
  StorageConfig,
  PubflowInstanceConfig,
  PaginationMeta
} from './types';

// Export PubflowConfig as alias for backward compatibility
export type { PubflowInstanceConfig as PubflowConfig } from './types';

// Export auth types
export type {
  LoginCredentials,
  LoginResult,
  SessionValidationResult,
  SessionRefreshResult,
  RegistrationData,
  RegistrationResult,
  PasswordResetRequestData,
  PasswordResetData,
  AuthResponse,
  SessionResponse,
  ValidationResponse,
  RefreshResponse
} from './auth/types';

// Export API client
export { ApiClient } from './api/client';

// Export auth service
export { AuthService } from './auth/service';

// Export storage adapter
export { StorageAdapter } from './storage/adapter';

// Export Bridge Payments
export * from './payments';
export { BridgePaymentClient } from './payments/client';
