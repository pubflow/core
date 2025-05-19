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
   * Get the API client
   *
   * @returns API client
   */
  getApiClient(): ApiClient {
    return this.apiClient;
  }

  /**
   * Get the entity configuration
   *
   * @returns Entity configuration
   */
  getEntityConfig(): EntityConfig {
    return {
      endpoint: this.baseEndpoint.split('/').pop() || '',
      customEndpoints: this.customEndpoints
    };
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

    // Handle different response formats automatically without relying on useRows
    // Try each format in order of specificity

    // Format 0: { data: { data: { data: { rows: [...] } }, meta: {...} } }
    // This handles the case where there's an extra level of nesting
    if (response.data?.data?.data?.rows && Array.isArray(response.data.data.data.rows)) {
      console.log('Handling deeply nested response format: data.data.data.rows');
      return {
        data: response.data.data.data.rows,
        meta: response.data.meta || this.createDefaultMeta(params)
      };
    }

    // Format 1: { data: { data: { rows: [...] }, meta: {...} } }
    if (response.data?.data?.rows && Array.isArray(response.data.data.rows)) {
      return {
        data: response.data.data.rows,
        meta: response.data.meta || this.createDefaultMeta(params)
      };
    }
    // Format 2: { data: { rows: [...], meta: {...} } }
    else if (response.data?.rows && Array.isArray(response.data.rows)) {
      return {
        data: response.data.rows,
        meta: (response as any).meta || this.createDefaultMeta(params)
      };
    }
    // Format 3: { data: { data: [...], meta: {...} } }
    else if (response.data?.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        meta: response.data.meta || this.createDefaultMeta(params)
      };
    }
    // Format 4: { data: [...] }
    else if (Array.isArray(response.data)) {
      return {
        data: response.data,
        meta: (response as any).meta || this.createDefaultMeta(params)
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

    // Format: { data: { data: { data: {...} } } }
    if (response.data?.data?.data) {
      console.log('Handling deeply nested response format: data.data.data');
      return response.data.data.data;
    }

    // Format: { data: { rows: [{ ... }], rowsAffected: n } }
    if (response.data?.rows && Array.isArray(response.data.rows) && response.data.rows.length > 0) {
      console.log('Handling rows format: data.rows[0]');
      return response.data.rows[0];
    }

    // Format: { data: { data: { rows: [{ ... }], rowsAffected: n } } }
    if (response.data?.data?.rows && Array.isArray(response.data.data.rows) && response.data.data.rows.length > 0) {
      console.log('Handling nested rows format: data.data.rows[0]');
      return response.data.data.rows[0];
    }

    // Format: { data: { data: {...} } }
    if (response.data?.data) {
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

    // Format: { data: { data: { data: {...} } } }
    if (response.data?.data?.data) {
      console.log('Handling deeply nested response format: data.data.data');
      return response.data.data.data;
    }

    // Format: { data: { rows: [{ ... }], rowsAffected: n } }
    if (response.data?.rows && Array.isArray(response.data.rows) && response.data.rows.length > 0) {
      console.log('Handling rows format: data.rows[0]');
      return response.data.rows[0];
    }

    // Format: { data: { data: { rows: [{ ... }], rowsAffected: n } } }
    if (response.data?.data?.rows && Array.isArray(response.data.data.rows) && response.data.data.rows.length > 0) {
      console.log('Handling nested rows format: data.data.rows[0]');
      return response.data.data.rows[0];
    }

    // Format: { data: { data: {...} } }
    if (response.data?.data) {
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

    // Format: { data: { data: { data: {...} } } }
    if (response.data?.data?.data) {
      console.log('Handling deeply nested response format: data.data.data');
      return response.data.data.data;
    }

    // Format: { data: { rows: [{ ... }], rowsAffected: n } }
    if (response.data?.rows && Array.isArray(response.data.rows) && response.data.rows.length > 0) {
      console.log('Handling rows format: data.rows[0]');
      return response.data.rows[0];
    }

    // Format: { data: { data: { rows: [{ ... }], rowsAffected: n } } }
    if (response.data?.data?.rows && Array.isArray(response.data.data.rows) && response.data.data.rows.length > 0) {
      console.log('Handling nested rows format: data.data.rows[0]');
      return response.data.data.rows[0];
    }

    // Format: { data: { data: {...} } }
    if (response.data?.data) {
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

    // Intentar primero con el método searchRaw
    try {
      console.log('Trying searchRaw method first...');
      const result = await this.searchRaw(endpoint);
      return result;
    } catch (error) {
      console.error('searchRaw method failed, falling back to searchOriginal:', error);
      // Si falla, usar el método original como fallback
      return this.searchOriginal(endpoint, params);
    }
  }

  /**
   * Search for entities using raw fetch (similar to fetchRawData)
   *
   * @param endpoint API endpoint
   * @returns Paginated list of entities
   */
  private async searchRaw(endpoint: string): Promise<PaginatedResponse<T>> {
    console.log('Using searchRaw method with endpoint:', endpoint);

    try {
      // Usar la URL base hardcodeada como en el depurador que funciona
      const baseUrl = 'https://api.pml.edu.do';

      // Extraer la parte del endpoint después de la URL base
      const endpointPath = endpoint.replace(/^.*\/bridge\//, '');

      // Construir la URL completa
      const fullUrl = `${baseUrl}/bridge/${endpointPath}`;
      console.log('Full URL:', fullUrl);

      // Obtener el token de sesión
      const sessionId = await this.apiClient.getSessionId();
      console.log('Session ID:', sessionId);

      // Realizar solicitud HTTP directa con headers mínimos como en el depurador
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Session-ID': sessionId || ''
        }
      });

      if (!response.ok) {
        console.error('HTTP error! status:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parsear la respuesta
      const rawData = await response.json();
      console.log('Raw response data:', JSON.stringify(rawData, null, 2));

      // Extraer los datos directamente de la respuesta sin procesar
      // Esto es similar a lo que hace el depurador que funciona
      if (rawData.data?.data?.rows && Array.isArray(rawData.data.data.rows)) {
        console.log('Raw data format: data.data.rows, length:', rawData.data.data.rows.length);

        // Devolver los datos en el formato esperado por useBridgeQuery
        return {
          data: rawData.data.data.rows,
          meta: {
            currentPage: rawData.data.meta?.page || 1,
            perPage: rawData.data.meta?.limit || 10,
            totalItems: rawData.data.meta?.total || 0,
            totalPages: Math.ceil((rawData.data.meta?.total || 0) / (rawData.data.meta?.limit || 10))
          }
        };
      }

      // Si no se encuentra el formato esperado, devolver un array vacío
      console.error('No se encontró el formato esperado en la respuesta');
      return {
        data: [],
        meta: {
          currentPage: 1,
          perPage: 10,
          totalItems: 0,
          totalPages: 1
        }
      };
    } catch (error) {
      console.error('Error in searchRaw:', error);
      throw error;
    }
  }

  /**
   * Original search method (fallback)
   *
   * @param endpoint API endpoint
   * @param params Search parameters
   * @returns Paginated list of entities
   */
  private async searchOriginal(endpoint: string, params: SearchParams): Promise<PaginatedResponse<T>> {
    console.log('Using searchOriginal method (fallback)');

    const response = await this.apiClient.get<any>(endpoint);

    if (!response.success) {
      throw new Error(response.error || 'Search failed');
    }

    // Handle different response formats automatically without relying on useRows
    // Try each format in order of specificity

    // Log the response for debugging
    console.log('BridgeApiService.searchOriginal - response:', JSON.stringify(response, null, 2));

    // Format: { data: { data: { rows: [...] }, meta: {...}, success: true } }
    // This is the format we're seeing in the logs
    if (response.data?.data?.rows && Array.isArray(response.data.data.rows)) {
      console.log('Handling format: data.data.rows with meta at data.meta');

      // Extraer los datos y el meta correctamente
      const rows = response.data.data.rows;
      const meta = response.data.meta || this.createDefaultMeta(params);

      console.log('Extracted rows:', rows.length, 'items');
      console.log('Extracted meta:', meta);

      return {
        data: rows,
        meta: meta
      };
    }

    // Format 0: { data: { data: { data: { rows: [...] } }, meta: {...} } }
    // This handles the case where there's an extra level of nesting
    if (response.data?.data?.data?.rows && Array.isArray(response.data.data.data.rows)) {
      console.log('Handling deeply nested response format: data.data.data.rows');
      return {
        data: response.data.data.data.rows,
        meta: response.data.meta || this.createDefaultMeta(params)
      };
    }

    // Format 2: { data: { rows: [...], meta: {...} } }
    else if (response.data?.rows && Array.isArray(response.data.rows)) {
      console.log('Handling format: data.rows');
      return {
        data: response.data.rows,
        meta: (response as any).meta || this.createDefaultMeta(params)
      };
    }

    // Format 3: { data: { data: [...], meta: {...} } }
    else if (response.data?.data && Array.isArray(response.data.data)) {
      console.log('Handling format: data.data (array)');
      return {
        data: response.data.data,
        meta: response.data.meta || this.createDefaultMeta(params)
      };
    }

    // Format 4: { data: [...] }
    else if (Array.isArray(response.data)) {
      console.log('Handling format: data (array)');
      return {
        data: response.data,
        meta: (response as any).meta || this.createDefaultMeta(params)
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
      currentPage: params?.page || 1,
      totalPages: 1,
      totalItems: 0,
      perPage: params?.perPage || 10
    };
  }
}
