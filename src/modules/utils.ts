import { ApiClient } from '../api/client';
import { HttpMethod, RequestOptions, ApiResponse } from '../api/types';

export type ModuleQueryParams = Record<string, string | number | boolean | null | undefined>;

export function joinPath(prefix: string, path = ''): string {
  const cleanPrefix = `/${prefix}`.replace(/\/+/g, '/').replace(/\/$/, '');
  const cleanPath = path ? `/${path}`.replace(/\/+/g, '/') : '';
  return `${cleanPrefix}${cleanPath}`;
}

export function withQuery(path: string, params?: ModuleQueryParams): string {
  if (!params) return path;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export class ModuleClient {
  constructor(
    protected readonly apiClient: ApiClient,
    protected readonly prefix: string
  ) {}

  request<T = any>(
    path: string,
    method: HttpMethod = 'GET',
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.apiClient.request<T>(joinPath(this.prefix, path), method, body, options);
  }

  get<T = any>(path: string, params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(withQuery(path, params), 'GET', undefined, options);
  }

  post<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, 'POST', body, options);
  }

  put<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, 'PUT', body, options);
  }

  patch<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, 'PATCH', body, options);
  }

  delete<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, 'DELETE', undefined, options);
  }
}
