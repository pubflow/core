/**
 * Bridge API Types
 * 
 * Types for Bridge API service
 */

import { PaginationMeta } from '../types';

/**
 * Base entity data interface
 */
export interface EntityData {
  id: string;
  [key: string]: any;
}

/**
 * Entity configuration
 */
export interface EntityConfig {
  /**
   * Entity endpoint name
   */
  endpoint: string;
  
  /**
   * Custom base path (overrides the global bridgeBasePath)
   */
  basePath?: string;
  
  /**
   * Custom endpoints for this entity
   */
  customEndpoints?: Record<string, string>;
}

/**
 * Query parameters for list and get operations
 */
export interface QueryParams {
  /**
   * Page number (1-based)
   */
  page?: number;
  
  /**
   * Number of items per page
   */
  limit?: number;
  
  /**
   * Field to sort by
   */
  orderBy?: string;
  
  /**
   * Sort direction
   */
  orderDir?: 'asc' | 'desc';
  
  /**
   * Whether to use rows property in response
   */
  useRows?: boolean;
  
  /**
   * Additional query parameters
   */
  [key: string]: any;
}

/**
 * Filter operator for search queries
 */
export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
  IN = 'in',
  NOT_IN = 'nin',
  IS_NULL = 'null',
  IS_NOT_NULL = 'nnull'
}

/**
 * Filter definition for search queries
 */
export interface FilterDefinition {
  /**
   * Field to filter on
   */
  field: string;
  
  /**
   * Filter operator
   */
  operator: FilterOperator | string;
  
  /**
   * Filter value
   */
  value: any;
}

/**
 * Search parameters
 */
export interface SearchParams extends QueryParams {
  /**
   * Search term for full-text search
   */
  q?: string;
  
  /**
   * Filters to apply
   */
  filters?: FilterDefinition[];
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  /**
   * Response data
   */
  data: T[];
  
  /**
   * Pagination metadata
   */
  meta: PaginationMeta;
}

/**
 * Array response (non-paginated)
 */
export interface ArrayResponse<T> {
  /**
   * Response data
   */
  data: T[];
}
