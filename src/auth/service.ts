/**
 * Authentication Service
 *
 * Handles user authentication, session management, and user operations
 */

import { ApiClient } from '../api/client';
import { StorageAdapter } from '../storage/adapter';
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

const DEBUG_AUTH = true && process.env.NODE_ENV === 'development';

/**
 * Authentication Service
 */
export class AuthService {
  private apiClient: ApiClient;
  private storage: StorageAdapter;
  private config: PubflowInstanceConfig;
  private validationInProgress: boolean = false;
  private lastValidationTime: number = 0;
  private validationInterval: number;

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
    this.validationInterval = config.sessionConfig?.validationInterval || 60 * 60 * 1000; // Default 1 hour

    // Initialize storage keys
    this.sessionKey = config.storageConfig?.sessionKey || 'session_id';
    this.userKey = 'user_data';
  }

  /**
   * Login with credentials
   *
   * @param credentials Login credentials
   * @returns Login result
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    if (DEBUG_AUTH) {
      console.log('AuthService.login: Starting login process');
    }

    try {
      const endpoint = `${this.config.authBasePath || '/auth'}${this.config.sessionConfig?.loginEndpoint || '/login'}`;
      const response = await this.apiClient.post<LoginResult>(endpoint, credentials);

      if (response.success && response.data) {
        if (DEBUG_AUTH) {
          console.log('AuthService.login: Login successful, storing session data');
        }

        const data = response.data as any;

        // Normalize snake_case → camelCase for 2FA fields returned by the backend.
        // Backend: { success:false, requires_2fa:true, session_id, available_methods, user }
        if (data.requires_2fa) {
          const partialSessionId = data.session_id ?? data.sessionId;

          // Store the partial session so ApiClient can attach it on
          // subsequent /auth/two_factor/:method/start and /verify calls.
          if (partialSessionId) {
            await this.storage.setItem(this.sessionKey, partialSessionId);
          }

          // The 2FA login response already includes safe user data.
          // Store it now so getCurrentUser() returns the real user after OTP verify —
          // no extra API call to /me or /validation needed.
          if (data.user) {
            await this.storeUserData(data.user);
          }

          return {
            success: true,
            requires2fa: true,
            sessionId: partialSessionId,
            availableMethods: data.available_methods ?? data.availableMethods ?? [],
          };
        }

        // Normal (non-2FA) login — store session ID and user data
        if (data.session_id ?? data.sessionId) {
          await this.storage.setItem(this.sessionKey, data.session_id ?? data.sessionId);
        }
        if (data.user) {
          await this.storeUserData(data.user);
        }
        return response.data;
      }

      if (DEBUG_AUTH) {
        console.log('AuthService.login: Login failed:', response.error);
      }

      return {
        success: false,
        error: response.error || 'Login failed'
      };
    } catch (error: any) {
      if (DEBUG_AUTH) {
        console.error('AuthService.login: Error during login:', error);
      }
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }


  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    if (DEBUG_AUTH) {
      console.log('AuthService.logout: Starting logout process');
    }

    try {
      const endpoint = `${this.config.authBasePath || '/auth'}${this.config.sessionConfig?.logoutEndpoint || '/logout'}`;
      await this.apiClient.post(endpoint);
    } catch (error) {
      if (DEBUG_AUTH) {
        console.error('AuthService.logout: Error during logout:', error);
      }
    } finally {
      // Always clear session data, even if API call fails
      await this.clearSessionData();
    }
  }

  /**
   * Validate current session
   *
   * @returns Session validation result
   */
  async validateSession(): Promise<SessionValidationResult> {
    // Prevent concurrent validations
    if (this.validationInProgress) {
      if (DEBUG_AUTH) {
        console.log('AuthService.validateSession: Validation already in progress');
      }
      return {
        isValid: false,
        error: 'Session validation already in progress'
      };
    }

    // Check if we need to validate based on interval
    const now = Date.now();
    if (now - this.lastValidationTime < this.validationInterval) {
      if (DEBUG_AUTH) {
        console.log('AuthService.validateSession: Skipping validation, too soon');
      }
      const currentUser = await this.getCurrentUser();
      return {
        isValid: true,
        user: currentUser || undefined
      };
    }

    this.validationInProgress = true;
    this.lastValidationTime = now;

    if (DEBUG_AUTH) {
      console.log('AuthService.validateSession: Starting session validation');
    }

    try {
      const sessionId = await this.storage.getItem(this.sessionKey);

      if (!sessionId) {
        if (DEBUG_AUTH) {
          console.log('AuthService.validateSession: No session found');
        }
        return {
          isValid: false,
          error: 'No session found'
        };
      }

      const endpoint = `${this.config.authBasePath || '/auth'}${this.config.sessionConfig?.validationEndpoint || '/validate-session'}`;
      const response = await this.apiClient.get<SessionValidationResult>(endpoint);

      if (response.success && response.data) {
        if (DEBUG_AUTH) {
          console.log('AuthService.validateSession: Session is valid');
        }

        // Update user data if provided and different from current
        if (response.data.user) {
          const currentUser = await this.getCurrentUser();
          if (!currentUser || JSON.stringify(currentUser) !== JSON.stringify(response.data.user)) {
            await this.storeUserData(response.data.user);
          }
        }

        return {
          isValid: true,
          expiresAt: response.data.expiresAt,
          user: response.data.user
        };
      }

      // Only clear session if server explicitly indicates it's invalid
      if (response.error === 'Invalid session' || response.error === 'Session expired') {
        if (DEBUG_AUTH) {
          console.log('AuthService.validateSession: Session is invalid, clearing data');
        }
        await this.clearSessionData();
      }

      return {
        isValid: false,
        error: response.error || 'Session validation failed'
      };
    } catch (error: any) {
      if (DEBUG_AUTH) {
        console.error('AuthService.validateSession: Error during validation:', error);
      }
      // Don't clear session on network or other errors
      return {
        isValid: false,
        error: error.message || 'Session validation failed'
      };
    } finally {
      this.validationInProgress = false;
    }
  }

  /**
   * Clear session data from storage
   * This method centralizes the session cleanup logic
   */
  private async clearSessionData(): Promise<void> {
    if (DEBUG_AUTH) {
      console.log('AuthService.clearSessionData: Clearing session data');
    }

    try {
      await this.storage.removeItem(this.sessionKey);
      await this.storage.removeItem(this.userKey);
    } catch (error) {
      if (DEBUG_AUTH) {
        console.error('AuthService.clearSessionData: Error clearing session data:', error);
      }
      throw error;
    }
  }

  /**
   * Get current user
   *
   * @returns Current user or null
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await this.storage.getItem(this.userKey);
      if (!userData) return null;

      // Parse and return user data preserving ALL original fields
      const parsedUser = JSON.parse(userData);
      return parsedUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Store user data preserving all additional fields exactly as received
   *
   * @param user User data to store
   */
  private async storeUserData(user: User): Promise<void> {
    try {
      // Store the complete user object without any field mapping or transformation
      await this.storage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  /**
   * Get user data with all additional fields preserved
   *
   * @returns Complete user data or null
   */
  async getUserData(): Promise<User | null> {
    try {
      const userData = await this.storage.getItem(this.userKey);
      if (!userData) return null;

      // Return the complete user object with all additional fields
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Refresh session
   *
   * @returns Session refresh result
   */
  async refreshSession(): Promise<SessionRefreshResult> {
    try {
      const endpoint = `${this.config.authBasePath || '/auth'}${this.config.sessionConfig?.refreshEndpoint || '/refresh-session'}`;
      const response = await this.apiClient.post<SessionRefreshResult>(endpoint);

      if (response.success && response.data) {
        // Update session ID if provided
        if (response.data.sessionId) {
          await this.storage.setItem(this.sessionKey, response.data.sessionId);
        }
        // Update user data if provided
        if (response.data.user) {
          await this.storeUserData(response.data.user);
        }
        return response.data;
      }

      return {
        success: false,
        error: response.error || 'Session refresh failed'
      };
    } catch (error: any) {
      console.error('Session refresh error:', error);
      return {
        success: false,
        error: error.message || 'Session refresh failed'
      };
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
