/**
 * Bridge API Service
 *
 * Provides methods for interacting with Bridge API endpoints
 */

import { ApiClient } from '../api/client';
import { HttpMethod } from '../api/types';
import {
  EntityConfig,
  EntityData,
  PaginatedResponse,
  ArrayResponse,
  QueryParams,
  SearchParams,
  FilterDefinition
} from './types';
import { PaginationMeta } from '../types';

/**
 * Bridge API Service
 */
export class BridgeApiService<T extends EntityData> {
  private apiClient: ApiClient;
  private baseEndpoint: string;
  private customEndpoints: Record<string, string>;

  /**
   * Create a new Bridge API service
   *
   * @param apiClient API client
   * @param config Entity configuration
   */
  constructor(apiClient: ApiClient, config: EntityConfig) {
    this.apiClient = apiClient;

    // Construct the base endpoint URL
    const basePath = config.basePath || '/bridge';
    this.baseEndpoint = `${basePath}/${config.endpoint}`;
    this.customEndpoints = config.customEndpoints || {};
  }

  /**
   * Get a list of entities
   *
   * @param params Query parameters
   * @returns Paginated list of entities
   */
  async getList(params?: QueryParams): Promise<PaginatedResponse<T>> {
    const queryString = this.buildQueryString(params);
    const endpoint = `${this.baseEndpoint}${queryString}`;

    const response = await this.apiClient.get<any>(endpoint);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get entity list');
    }

    // Handle different response formats
    if (params?.useRows && response.data?.rows) {
      // Format: { data: { rows: [...], meta: {...} } }
      return {
        data: response.data.rows,
        meta: response.data.meta || this.createDefaultMeta(params)
      };
    } else if (Array.isArray(response.data)) {
      // Format: { data: [...] }
      return {
        data: response.data,
        meta: this.createDefaultMeta(params)
      };
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      // Format: { data: { data: [...], meta: {...} } }
      return {
        data: response.data.data,
        meta: response.data.meta || this.createDefaultMeta(params)
      };
    }

    // Default fallback
    return {
      data: [],
      meta: this.createDefaultMeta(params)
    };
  }

  /**
   * Get an entity by ID
   *
   * @param id Entity ID
   * @param params Query parameters
   * @returns Entity
   */
  async getById(id: string, params?: QueryParams): Promise<T> {
    const queryString = this.buildQueryString(params);
    const endpoint = `${this.baseEndpoint}/${id}${queryString}`;

    const response = await this.apiClient.get<any>(endpoint);

    if (!response.success) {
      throw new Error(response.error || `Failed to get entity with ID ${id}`);
    }

    // Handle different response formats
    if (response.data?.data) {
      // Format: { data: { data: {...} } }
      return response.data.data;
    }

    // Format: { data: {...} }
    return response.data;
  }

  /**
   * Create a new entity
   *
   * @param data Entity data
   * @returns Created entity
   */
  async create(data: Partial<T>): Promise<T> {
    const response = await this.apiClient.post<any>(this.baseEndpoint, data);

    if (!response.success) {
      throw new Error(response.error || 'Failed to create entity');
    }

    // Handle different response formats
    if (response.data?.data) {
      // Format: { data: { data: {...} } }
      return response.data.data;
    }

    // Format: { data: {...} }
    return response.data;
  }

  /**
   * Update an existing entity
   *
   * @param id Entity ID
   * @param data Entity data
   * @returns Updated entity
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const endpoint = `${this.baseEndpoint}/${id}`;
    const response = await this.apiClient.put<any>(endpoint, data);

    if (!response.success) {
      throw new Error(response.error || `Failed to update entity with ID ${id}`);
    }

    // Handle different response formats
    if (response.data?.data) {
      // Format: { data: { data: {...} } }
      return response.data.data;
    }

    // Format: { data: {...} }
    return response.data;
  }

  /**
   * Delete an entity
   *
   * @param id Entity ID
   */
  async delete(id: string): Promise<void> {
    const endpoint = `${this.baseEndpoint}/${id}`;
    const response = await this.apiClient.delete(endpoint);

    if (!response.success) {
      throw new Error(response.error || `Failed to delete entity with ID ${id}`);
    }
  }

  /**
   * Search for entities
   *
   * @param params Search parameters
   * @returns Paginated list of entities
   */
  async search(params: SearchParams): Promise<PaginatedResponse<T>> {
    // Build query string from search parameters
    const queryParams: Record<string, any> = {
      ...params
    };

    // Handle search term
    if (params.q) {
      queryParams.q = params.q;
    }

    // Handle filters
    if (params.filters && params.filters.length > 0) {
      // Convert filters to query parameters
      params.filters.forEach((filter, index) => {
        const { field, operator, value } = filter;

        if (operator === 'in' || operator === 'nin') {
          // Handle array values
          if (Array.isArray(value)) {
            queryParams[`${field}:${operator}`] = value.join(',');
          } else {
            queryParams[`${field}:${operator}`] = String(value);
          }
        } else if (operator === 'null' || operator === 'nnull') {
          // Handle null/not null operators
          queryParams[`${field}:${operator}`] = value === true || value === 'true' ? 'true' : 'false';
        } else {
          // Handle other operators
          queryParams[`${field}:${operator}`] = String(value);
        }
      });

      // Remove filters from query params to avoid duplication
      delete queryParams.filters;
    }

    const queryString = this.buildQueryString(queryParams);
    const endpoint = `${this.baseEndpoint}/search${queryString}`;

    const response = await this.apiClient.get<any>(endpoint);

    if (!response.success) {
      throw new Error(response.error || 'Search failed');
    }

    // Handle different response formats
    if (params.useRows && response.data?.rows) {
      // Format: { data: { rows: [...], meta: {...} } }
      return {
        data: response.data.rows,
        meta: response.data.meta || this.createDefaultMeta(params)
      };
    } else if (Array.isArray(response.data)) {
      // Format: { data: [...] }
      return {
        data: response.data,
        meta: this.createDefaultMeta(params)
      };
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      // Format: { data: { data: [...], meta: {...} } }
      return {
        data: response.data.data,
        meta: response.data.meta || this.createDefaultMeta(params)
      };
    }

    // Default fallback
    return {
      data: [],
      meta: this.createDefaultMeta(params)
    };
  }

  /**
   * Call a custom endpoint
   *
   * @param endpointKey Key of the custom endpoint
   * @param data Request data
   * @param method HTTP method
   * @returns Response data
   */
  async callCustomEndpoint<R = any>(
    endpointKey: string,
    data?: any,
    method: HttpMethod = 'POST'
  ): Promise<R> {
    const customEndpoint = this.customEndpoints[endpointKey];

    if (!customEndpoint) {
      throw new Error(`Custom endpoint '${endpointKey}' not defined`);
    }

    let response;

    switch (method) {
      case 'GET':
        response = await this.apiClient.get<R>(customEndpoint);
        break;
      case 'POST':
        response = await this.apiClient.post<R>(customEndpoint, data);
        break;
      case 'PUT':
        response = await this.apiClient.put<R>(customEndpoint, data);
        break;
      case 'PATCH':
        response = await this.apiClient.patch<R>(customEndpoint, data);
        break;
      case 'DELETE':
        response = await this.apiClient.delete<R>(customEndpoint);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    if (!response.success) {
      throw new Error(response.error || `Failed to call custom endpoint '${endpointKey}'`);
    }

    if (response.data === undefined) {
      throw new Error(`No data returned from custom endpoint '${endpointKey}'`);
    }

    return response.data;
  }

  /**
   * Build a query string from parameters
   *
   * @param params Query parameters
   * @returns Query string
   */
  private buildQueryString(params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const queryParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle array values
          value.forEach(item => {
            queryParams.append(`${key}[]`, String(item));
          });
        } else {
          queryParams.append(key, String(value));
        }
      }
    }

    return `?${queryParams.toString()}`;
  }

  /**
   * Create default pagination metadata
   *
   * @param params Query parameters
   * @returns Pagination metadata
   */
  private createDefaultMeta(params?: QueryParams): PaginationMeta {
    return {
      page: params?.page || 1,
      limit: params?.limit || 10,
      total: 0,
      hasMore: false
    };
  }
}
