/**
 * API Client
 *
 * Handles HTTP requests to the API with authentication
 */

import { PubflowInstanceConfig } from '../types';
import { StorageAdapter, createStorageKey } from '../storage/adapter';
import { ApiResponse, HttpMethod, RequestOptions } from './types';

/**
 * API Client for making HTTP requests
 */
export class ApiClient {
  private config: PubflowInstanceConfig;
  private storage: StorageAdapter;

  /**
   * Create a new API client
   *
   * @param config Pubflow configuration
   * @param storage Storage adapter
   */
  constructor(config: PubflowInstanceConfig, storage: StorageAdapter) {
    this.config = config;
    this.storage = storage;
  }

  /**
   * Make an HTTP request
   *
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param body Request body (for POST, PUT, PATCH)
   * @param options Additional request options
   * @returns API response
   */
  async request<T = any>(
    endpoint: string,
    method: HttpMethod = 'GET',
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { headers = {}, includeSession = true, timeout } = options;

      // Prepare headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...headers,
      };

      // Include session ID if available and requested
      if (includeSession) {
        const sessionKey = createStorageKey(
          this.config.storageConfig?.sessionKey || 'session_id',
          this.config.storageConfig?.prefix,
          this.config.id
        );

        const sessionId = await this.storage.getItem(sessionKey);
        if (sessionId) {
          requestHeaders['X-Session-ID'] = sessionId;
        }
      }

      // Prepare URL
      const url = this.resolveUrl(endpoint);

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        credentials: 'include',
      };

      // Add body for non-GET requests
      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      // Add timeout
      const controller = new AbortController();
      requestOptions.signal = controller.signal;

      const timeoutMs = timeout || this.config.timeout || 30000;
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      // Make the request
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Parse response
      const data = await this.parseResponse(response);

      // Format successful response
      if (response.ok) {
        return {
          success: true,
          data,
          status: response.status,
        };
      }

      // Format error response
      return {
        success: false,
        error: data.error || data.message || 'Unknown error occurred',
        status: response.status,
        message: data.message,
      };
    } catch (error: any) {
      // Handle network errors
      if (options.onError) {
        options.onError(error);
      }

      return {
        success: false,
        error: error.message || 'Network error occurred',
        status: 0,
      };
    }
  }

  /**
   * Make a GET request
   *
   * @param endpoint API endpoint
   * @param options Request options
   * @returns API response
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  }

  /**
   * Make a POST request
   *
   * @param endpoint API endpoint
   * @param body Request body
   * @param options Request options
   * @returns API response
   */
  async post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', body, options);
  }

  /**
   * Make a PUT request
   *
   * @param endpoint API endpoint
   * @param body Request body
   * @param options Request options
   * @returns API response
   */
  async put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', body, options);
  }

  /**
   * Make a PATCH request
   *
   * @param endpoint API endpoint
   * @param body Request body
   * @param options Request options
   * @returns API response
   */
  async patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', body, options);
  }

  /**
   * Make a DELETE request
   *
   * @param endpoint API endpoint
   * @param options Request options
   * @returns API response
   */
  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  }

  /**
   * Resolve a URL
   *
   * @param endpoint Endpoint or full URL
   * @returns Full URL
   */
  private resolveUrl(endpoint: string): string {
    // Handle absolute URLs
    if (endpoint.startsWith('http')) {
      return endpoint;
    }

    // Handle relative URLs
    const baseUrl = this.config.baseUrl;
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${normalizedEndpoint}`;
  }

  /**
   * Parse response based on content type
   *
   * @param response Fetch response
   * @returns Parsed response data
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  }
}
