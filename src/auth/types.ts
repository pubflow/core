/**
 * Authentication Types
 * 
 * Types for authentication service
 */

import { User, SessionConfig } from '../types';

/**
 * Login credentials
 */
export interface LoginCredentials {
  /**
   * User email
   */
  email?: string;

  /**
   * User name
   */
  userName?: string;

  /**
   * User password
   */
  password: string;
}

/**
 * Result of a login attempt
 */
export interface LoginResult {
  /**
   * Whether the login was successful
   */
  success: boolean;

  /**
   * User data (only present if success is true and 2FA is not required)
   */
  user?: User;

  /**
   * Session ID (only present if success is true)
   */
  sessionId?: string;

  /**
   * Error message (only present if success is false)
   */
  error?: string;

  /**
   * Whether 2FA verification is required to complete login.
   * When true, the session is in "pending" status and must be
   * activated via POST /auth/two_factor/verify.
   */
  requires2fa?: boolean;

  /**
   * Available 2FA methods the user has configured (present when requires2fa is true)
   */
  availableMethods?: TwoFactorMethod[];
}

/**
 * Result of a session validation
 */
export interface SessionValidationResult {
  /**
   * Whether the session is valid
   */
  isValid: boolean;

  /**
   * When the session expires (ISO date string)
   */
  expiresAt?: string;

  /**
   * User data (only present if isValid is true)
   */
  user?: User;

  /**
   * Error message (only present if isValid is false)
   */
  error?: string;
}

/**
 * Result of a session refresh
 */
export interface SessionRefreshResult {
  /**
   * Whether the refresh was successful
   */
  success: boolean;

  /**
   * New session ID (only present if success is true)
   */
  sessionId?: string;

  /**
   * When the session expires (ISO date string)
   */
  expiresAt?: string;

  /**
   * Updated user data (only present if success is true)
   */
  user?: User;

  /**
   * Error message (only present if success is false)
   */
  error?: string;
}

/**
 * Registration data
 */
export interface RegistrationData {
  /**
   * User email
   */
  email: string;

  /**
   * User password
   */
  password: string;

  /**
   * User first name
   */
  name: string;

  /**
   * User last name
   */
  lastName: string;

  /**
   * User type
   */
  userType: string;

  /**
   * User username (optional)
   */
  userName?: string;

  /**
   * User profile picture URL (optional)
   */
  picture?: string;

  /**
   * Additional user data
   */
  [key: string]: any;
}

/**
 * Result of a registration operation
 */
export interface RegistrationResult {
  /**
   * Whether the registration was successful
   */
  success: boolean;

  /**
   * User ID (only present if success is true)
   */
  id?: string;

  /**
   * User data (only present if success is true)
   */
  user?: User;

  /**
   * Error message (only present if success is false)
   */
  error?: string;

  /**
   * Additional message
   */
  message?: string;
}

/**
 * Password reset request data
 */
export interface PasswordResetRequestData {
  /**
   * User email
   */
  email: string;

  /**
   * Custom URL for the reset page in your application
   */
  resetUrl?: string;
}

/**
 * Password reset data
 */
export interface PasswordResetData {
  /**
   * Reset token
   */
  token: string;

  /**
   * New password
   */
  password: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  /**
   * Whether the operation was successful
   */
  success: boolean;

  /**
   * User data
   */
  user?: User;

  /**
   * Session ID
   */
  sessionId?: string;

  /**
   * Error message
   */
  error?: string;
}

/**
 * Session response
 */
export interface SessionResponse {
  /**
   * Whether the operation was successful
   */
  success: boolean;

  /**
   * Session ID
   */
  sessionId?: string;

  /**
   * Error message
   */
  error?: string;
}

/**
 * Session validation response
 */
export interface ValidationResponse {
  /**
   * Whether the session is valid
   */
  isValid: boolean;

  /**
   * User data
   */
  user?: User;

  /**
   * Error message
   */
  error?: string;
}

/**
 * Session refresh response
 */
export interface RefreshResponse {
  /**
   * Whether the operation was successful
   */
  success: boolean;

  /**
   * New session ID
   */
  sessionId?: string;

  /**
   * Error message
   */
  error?: string;
}

// ─── Two-Factor Authentication Types ─────────────────────────────────────────

/**
 * A 2FA method configured by the user
 */
export interface TwoFactorMethod {
  id: string;
  method: 'email' | 'sms' | 'totp' | string;
  status: 'pending_setup' | 'active' | string;
  identifier?: string | null;
  last_used_at?: string | null;
  created_at?: string;
}

/**
 * System-level 2FA information (public endpoint)
 */
export interface TwoFactorSystemInfo {
  global_two_factor_enabled: boolean;
  available_methods: string[];
}

/**
 * Result of starting a 2FA verification (sending a code)
 */
export interface TwoFactorStartResult {
  success: boolean;
  method?: string;
  verification_sent?: boolean;
  expires_in?: number;
  message?: string;
  error?: string;
}

/**
 * Result of verifying a 2FA code
 */
export interface TwoFactorVerifyResult {
  success: boolean;
  verified?: boolean;
  session_activated?: boolean;
  expires_at?: string | null;
  attempts_remaining?: number;
  message?: string;
  error?: string;
}

/**
 * Result of setting up a new 2FA method
 */
export interface TwoFactorSetupResult {
  success: boolean;
  method_id?: string;
  method?: string;
  status?: string;
  verification_sent?: boolean;
  expires_in?: number;
  message?: string;
  error?: string;
}

/**
 * Result of toggling 2FA for the user
 */
export interface TwoFactorToggleResult {
  success: boolean;
  two_factor_enabled?: boolean;
  active_methods?: string[];
  message?: string;
  error?: string;
}
