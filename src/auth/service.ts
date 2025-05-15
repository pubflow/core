/**
 * Authentication Service
 *
 * Handles user authentication, session management, and user operations
 */

import { ApiClient } from '../api/client';
import { StorageAdapter, createStorageKey } from '../storage/adapter';
import { PubflowInstanceConfig } from '../types';
import { User } from '../types';
import {
  LoginCredentials,
  LoginResult,
  SessionValidationResult,
  SessionRefreshResult,
  RegistrationData,
  RegistrationResult,
  PasswordResetRequestData,
  PasswordResetData
} from './types';

/**
 * Authentication Service
 */
export class AuthService {
  private apiClient: ApiClient;
  private storage: StorageAdapter;
  private config: PubflowInstanceConfig;

  // Storage keys
  private sessionKey: string;
  private userKey: string;

  /**
   * Create a new authentication service
   *
   * @param apiClient API client
   * @param storage Storage adapter
   * @param config Pubflow configuration
   */
  constructor(apiClient: ApiClient, storage: StorageAdapter, config: PubflowInstanceConfig) {
    this.apiClient = apiClient;
    this.storage = storage;
    this.config = config;

    // Initialize storage keys with proper prefixes
    this.sessionKey = createStorageKey(
      config.storageConfig?.sessionKey || 'session_id',
      config.storageConfig?.prefix,
      config.id
    );

    this.userKey = createStorageKey(
      'user_data',
      config.storageConfig?.prefix,
      config.id
    );
  }

  /**
   * Login with credentials
   *
   * @param credentials Login credentials
   * @returns Login result
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      const endpoint = `${this.config.authBasePath || '/auth'}/login`;
      const response = await this.apiClient.post<LoginResult>(endpoint, credentials, {
        includeSession: false // Don't include session for login request
      });

      if (response.success && response.data) {
        const { sessionId, user } = response.data;

        // Store session ID and user data
        if (sessionId) {
          await this.storage.setItem(this.sessionKey, sessionId);
        }

        if (user) {
          await this.storage.setItem(this.userKey, JSON.stringify(user));
        }

        return {
          success: true,
          user,
          sessionId
        };
      }

      return {
        success: false,
        error: response.error || 'Login failed'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  /**
   * Logout current user
   *
   * @returns Operation result
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const endpoint = `${this.config.authBasePath || '/auth'}/logout`;
      const response = await this.apiClient.post(endpoint);

      // Clear session data regardless of response
      await this.storage.removeItem(this.sessionKey);
      await this.storage.removeItem(this.userKey);

      return {
        success: true
      };
    } catch (error: any) {
      // Still clear session data on error
      await this.storage.removeItem(this.sessionKey);
      await this.storage.removeItem(this.userKey);

      return {
        success: false,
        error: error.message || 'Logout failed'
      };
    }
  }

  /**
   * Validate current session
   *
   * @returns Session validation result
   */
  async validateSession(): Promise<SessionValidationResult> {
    try {
      const sessionId = await this.storage.getItem(this.sessionKey);

      if (!sessionId) {
        return {
          isValid: false,
          error: 'No session found'
        };
      }

      const endpoint = `${this.config.authBasePath || '/auth'}${this.config.sessionConfig?.validationEndpoint || '/validate-session'}`;
      const response = await this.apiClient.get<SessionValidationResult>(endpoint);

      if (response.success && response.data) {
        // Update user data if provided
        if (response.data.user) {
          await this.storage.setItem(this.userKey, JSON.stringify(response.data.user));
        }

        return {
          isValid: true,
          expiresAt: response.data.expiresAt,
          user: response.data.user
        };
      }

      // Session is invalid, clear data
      await this.storage.removeItem(this.sessionKey);
      await this.storage.removeItem(this.userKey);

      return {
        isValid: false,
        error: response.error || 'Session validation failed'
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message || 'Session validation failed'
      };
    }
  }

  /**
   * Refresh current session
   *
   * @returns Session refresh result
   */
  async refreshSession(): Promise<SessionRefreshResult> {
    try {
      const endpoint = `${this.config.authBasePath || '/auth'}/refresh`;
      const response = await this.apiClient.post<SessionRefreshResult>(endpoint);

      if (response.success && response.data && response.data.sessionId) {
        // Update session ID
        await this.storage.setItem(this.sessionKey, response.data.sessionId);

        return {
          success: true,
          sessionId: response.data.sessionId,
          expiresAt: response.data.expiresAt
        };
      }

      return {
        success: false,
        error: response.error || 'Session refresh failed'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Session refresh failed'
      };
    }
  }

  /**
   * Get current user
   *
   * @returns Current user or null if not authenticated
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // First try to get from storage
      const userData = await this.storage.getItem(this.userKey);

      if (userData) {
        return JSON.parse(userData);
      }

      // If not in storage, try to get from API
      const endpoint = `${this.config.authBasePath || '/auth'}/me`;
      const response = await this.apiClient.get<User>(endpoint);

      if (response.success && response.data) {
        // Store user data
        await this.storage.setItem(this.userKey, JSON.stringify(response.data));
        return response.data;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Register a new user
   *
   * @param data Registration data
   * @returns Registration result
   */
  async register(data: RegistrationData): Promise<RegistrationResult> {
    try {
      const endpoint = `${this.config.authBasePath || '/auth'}/register`;
      const response = await this.apiClient.post<RegistrationResult>(endpoint, data);

      if (response.success && response.data) {
        return {
          success: true,
          id: response.data.id,
          user: response.data.user
        };
      }

      return {
        success: false,
        error: response.error || 'Registration failed'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  }

  /**
   * Request password reset
   *
   * @param data Password reset request data
   * @returns Operation result
   */
  async requestPasswordReset(data: PasswordResetRequestData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const endpoint = `${this.config.authBasePath || '/auth'}/password-reset/request`;
      const response = await this.apiClient.post(endpoint, data, {
        includeSession: false // Don't include session for password reset request
      });

      return {
        success: response.success,
        message: response.data?.message || response.message,
        error: response.error
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Password reset request failed'
      };
    }
  }

  /**
   * Reset password with token
   *
   * @param data Password reset data
   * @returns Operation result
   */
  async resetPassword(data: PasswordResetData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const endpoint = `${this.config.authBasePath || '/auth'}/password-reset/reset`;
      const response = await this.apiClient.post(endpoint, data, {
        includeSession: false // Don't include session for password reset
      });

      return {
        success: response.success,
        message: response.data?.message || response.message,
        error: response.error
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Password reset failed'
      };
    }
  }

  /**
   * Validate password reset token
   *
   * @param token Reset token
   * @returns Validation result
   */
  async validateResetToken(token: string): Promise<{ valid: boolean; message?: string }> {
    try {
      const endpoint = `${this.config.authBasePath || '/auth'}/password-reset/validate/${token}`;
      const response = await this.apiClient.get(endpoint, {
        includeSession: false // Don't include session for token validation
      });

      if (response.success && response.data) {
        return {
          valid: response.data.valid,
          message: response.data.message
        };
      }

      return {
        valid: false,
        message: response.error || 'Invalid or expired token'
      };
    } catch (error: any) {
      return {
        valid: false,
        message: error.message || 'Token validation failed'
      };
    }
  }
}
