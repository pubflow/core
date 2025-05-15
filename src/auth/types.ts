/**
 * Authentication Types
 * 
 * Types for authentication service
 */

import { User } from '../types';

/**
 * Login credentials
 */
export interface LoginCredentials {
  /**
   * User email
   */
  email?: string;
  
  /**
   * User username (alternative to email)
   */
  userName?: string;
  
  /**
   * User password
   */
  password: string;
}

/**
 * Result of a login operation
 */
export interface LoginResult {
  /**
   * Whether the login was successful
   */
  success: boolean;
  
  /**
   * User data (only present if success is true)
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
   * Additional message
   */
  message?: string;
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
