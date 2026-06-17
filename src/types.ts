/**
 * Core types for Pubflow
 */

/**
 * User type - Extended to include all Flowless backend fields
 *
 * @version 0.3.0 - Added snake_case support for multi-flowless compatibility
 *
 * This interface supports BOTH camelCase and snake_case formats for backward compatibility.
 * The backend (multi-flowless) sends snake_case by default, but this interface accepts both.
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
   * User last name (camelCase format - legacy)
   */
  lastName?: string;

  /**
   * User last name (snake_case format - preferred)
   */
  last_name?: string;

  /**
   * User type (camelCase format - legacy)
   */
  userType: string;

  /**
   * User type (snake_case format - preferred)
   */
  user_type?: string;

  /**
   * User profile picture URL
   */
  picture?: string;

  /**
   * Username (camelCase format - legacy)
   */
  userName?: string;

  /**
   * Username (snake_case format - preferred)
   */
  user_name?: string;

  /**
   * Email verification status (camelCase format - legacy)
   */
  isVerified?: boolean;

  /**
   * Email verification status (snake_case format - preferred)
   */
  is_verified?: boolean;

  /**
   * Phone number for SMS authentication
   */
  phone?: string;

  /**
   * Two-factor authentication enabled (camelCase format - legacy)
   */
  twoFactor?: boolean;

  /**
   * Two-factor authentication enabled (snake_case format - preferred)
   */
  two_factor?: boolean;

  /**
   * User language preference (e.g., 'es', 'en', 'fr')
   */
  lang?: string;

  /**
   * Additional user metadata as JSON string
   */
  metadata?: string;

  /**
   * Account creation timestamp (camelCase format - legacy)
   */
  createdAt?: string;

  /**
   * Account creation timestamp (snake_case format - preferred)
   */
  created_at?: string;

  /**
   * Last update timestamp (camelCase format - legacy)
   */
  updatedAt?: string;

  /**
   * Last update timestamp (snake_case format - preferred)
   */
  updated_at?: string;

  /**
   * Additional user data for extensibility
   *
   * This index signature allows for additional fields to be stored
   * exactly as received from the backend without any transformation.
   * All additional fields are preserved during serialization/deserialization.
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
   * Whether to validate session on startup (React Native)
   */
  validateOnStartup?: boolean;

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
   * Base URL for the main Flowless API. Defaults to baseUrl.
   */
  apiUrl?: string;

  /**
   * Base URL for Bridge Payments. Defaults to apiUrl/baseUrl.
   */
  paymentsUrl?: string;

  /**
   * Base URL for Ultra Forms. Defaults to apiUrl/baseUrl.
   */
  formsUrl?: string;

  /**
   * Base URL for Blog/Onboarding if those modules are hosted separately.
   * Defaults to apiUrl/baseUrl.
   */
  flowlessUrl?: string;

  /**
   * Route prefixes for mounted modules. These are paths on each module host,
   * not full URLs.
   */
  modulePrefixes?: ModulePrefixes;

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
 * Route prefixes for Pubflow-friendly module clients.
 */
export interface ModulePrefixes {
  /**
   * Bridge Payments mount path.
   * @default '/bridge-payment'
   */
  payments?: string;

  /**
   * Ultra Forms API mount path.
   * @default '/api/v1'
   */
  forms?: string;

  /**
   * Flowless blog posts mount path.
   * @default '/api/v1/posts'
   */
  blog?: string;

  /**
   * Flowless onboarding mount path.
   * @default '/api/v1/onboarding'
   */
  onboarding?: string;
}

/**
 * Pagination metadata
 *
 * @version 0.3.1 - Made all fields optional for maximum flexibility
 *
 * Supports multiple naming conventions:
 * - Standard: currentPage, totalPages, totalItems, perPage
 * - Alternative: page, limit, total, hasMore (React Native compatibility)
 *
 * At least one set of fields should be provided.
 */
export interface PaginationMeta {
  /**
   * Current page number (standard format)
   */
  currentPage?: number;

  /**
   * Current page number (alternative format - React Native)
   */
  page?: number;

  /**
   * Total number of pages
   */
  totalPages?: number;

  /**
   * Total number of items (standard format)
   */
  totalItems?: number;

  /**
   * Total number of items (alternative format - React Native)
   */
  total?: number;

  /**
   * Number of items per page (standard format)
   */
  perPage?: number;

  /**
   * Number of items per page (alternative format - React Native)
   */
  limit?: number;

  /**
   * Whether there are more pages available (React Native)
   */
  hasMore?: boolean;
}
