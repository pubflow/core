/**
 * API Types
 * 
 * Types for API client and responses
 */

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Options for API requests
 */
export interface RequestOptions {
  /**
   * Custom headers to include in the request
   */
  headers?: Record<string, string>;
  
  /**
   * Whether to include the session ID in the request
   * Default: true
   */
  includeSession?: boolean;
  
  /**
   * Request timeout in milliseconds
   * Overrides the default timeout from configuration
   */
  timeout?: number;
  
  /**
   * Whether to validate the session before making the request
   * Only applies if validateBeforeRequests is enabled in sessionConfig
   * Default: true
   */
  validateSession?: boolean;
  
  /**
   * Custom error handler
   */
  onError?: (error: any) => void;
}

export interface UserContext {
  authenticated: boolean;
  provider?: string;
  user_id?: string;
  user_type?: string;
  user_email?: string;
  name?: string;
  [key: string]: any;
}

/**
 * Generic API response
 */
export interface ApiResponse<T = any> {
  /**
   * Whether the request was successful
   */
  success: boolean;
  
  /**
   * Response data (only present if success is true)
   */
  data?: T;
  
  /**
   * Error message (only present if success is false)
   */
  error?: string;
  
  /**
   * HTTP status code
   */
  status: number;
  
  /**
   * Additional message (can be present in both success and error cases)
   */
  message?: string;

  /**
   * Response metadata from modern Flowless/Pubflow envelopes.
   */
  meta?: Record<string, any>;

  /**
   * Viewer/session context from modern Flowless/Pubflow envelopes.
   */
  userContext?: UserContext;
}

/**
 * Error response from the API
 */
export interface ApiErrorResponse {
  error?: string;
  message?: string;
  status?: number;
  code?: string;
  details?: any;
}
