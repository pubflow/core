/**
 * Core types for Pubflow
 */

/**
 * User type - Extended to include all Flowless backend fields
 */
export interface User {
  /**
   * User ID
   */
  id: string;

  /**
   * User email
   */
  email: string;

  /**
   * User first name
   */
  name: string;

  /**
   * User last name
   */
  lastName?: string;

  /**
   * User type
   */
  userType: string;

  /**
   * User profile picture URL
   */
  picture?: string;

  /**
   * Username (unique identifier)
   */
  userName?: string;

  /**
   * Email verification status
   */
  isVerified?: boolean;

  /**
   * Phone number for SMS authentication
   */
  phone?: string;

  /**
   * Two-factor authentication enabled
   */
  twoFactor?: boolean;

  /**
   * User language preference (e.g., 'es', 'en', 'fr')
   */
  lang?: string;

  /**
   * Additional user metadata as JSON string
   */
  metadata?: string;

  /**
   * Account creation timestamp
   */
  createdAt?: string;

  /**
   * Last update timestamp
   */
  updatedAt?: string;

  /**
   * Additional user data for extensibility
   */
  [key: string]: any;
}

/**
 * Session configuration
 */
export interface SessionConfig {
  /**
   * Base path for session endpoints
   */
  basePath?: string;

  /**
   * Login endpoint
   */
  loginEndpoint?: string;

  /**
   * Logout endpoint
   */
  logoutEndpoint?: string;

  /**
   * Session validation endpoint
   */
  validationEndpoint?: string;

  /**
   * Session refresh endpoint
   */
  refreshEndpoint?: string;

  /**
   * Session storage key
   */
  storageKey?: string;

  /**
   * Whether to validate session automatically
   */
  autoValidate?: boolean;

  /**
   * Session validation interval in milliseconds
   */
  validationInterval?: number;

  /**
   * Callback when session expires
   */
  onSessionExpired?: () => void;

  /**
   * Callback when session is refreshed
   */
  onSessionRefreshed?: () => void;
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  /**
   * Prefix for storage keys
   */
  prefix?: string;

  /**
   * Session storage key
   */
  sessionKey?: string;

  /**
   * User data storage key
   */
  userKey?: string;
}

/**
 * Pubflow instance configuration
 */
export interface PubflowInstanceConfig {
  /**
   * Instance ID
   */
  id: string;

  /**
   * Base URL for API requests
   */
  baseUrl: string;

  /**
   * Base path for authentication endpoints
   */
  authBasePath?: string;

  /**
   * Session configuration
   */
  sessionConfig?: SessionConfig;

  /**
   * Storage configuration
   */
  storageConfig?: StorageConfig;

  /**
   * Whether to use secure storage
   */
  useSecureStorage?: boolean;

  /**
   * Default headers for API requests
   */
  headers?: Record<string, string>;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /**
   * Current page number
   */
  currentPage: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Total number of items
   */
  totalItems: number;

  /**
   * Number of items per page
   */
  perPage: number;
} 