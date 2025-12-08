/**
 * Bridge Payment Client
 * 
 * Client for interacting with Bridge Payments API
 */

import { ApiClient } from '../api/client';
import { HttpMethod } from '../api/types';
import { StorageAdapter, MemoryStorageAdapter } from '../storage/adapter';
import {
  BridgePaymentConfig,
  PaymentRequestOptions,
  CreatePaymentIntentRequest,
  PaymentIntent,
  Payment,
  PaymentMethod,
  UpdatePaymentMethodRequest,
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  Subscription,
  CreateSubscriptionRequest,
  CancelSubscriptionRequest,
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationMember,
  AddOrganizationMemberRequest,
  UpdateOrganizationMemberRoleRequest,
  ConvertGuestToUserRequest,
  ConvertGuestToUserResponse,
  PaginationParams,
  ListResponse
} from './types';

/**
 * Bridge Payment Client
 * 
 * Provides a simple interface for interacting with Bridge Payments API
 */
export class BridgePaymentClient {
  private apiClient: ApiClient;
  private guestToken?: string;
  private organizationId?: string;
  private baseUrl: string;

  /**
   * Create a new Bridge Payment Client
   * 
   * @param config Client configuration
   */
  constructor(config: BridgePaymentConfig) {
    this.baseUrl = config.baseUrl;
    this.guestToken = config.guestToken;
    this.organizationId = config.organizationId;

    // Create API client with Pubflow configuration
    this.apiClient = new ApiClient(
      {
        id: config.instanceId || 'bridge-payments',
        baseUrl: config.baseUrl,
        headers: config.headers || {},
        storageConfig: {
          prefix: 'pubflow',
          sessionKey: 'session_id'
        }
      },
      config.storage || new MemoryStorageAdapter()
    );
  }

  /**
   * Make a request to the Bridge Payments API
   * 
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param body Request body
   * @param options Request options
   * @returns Response data
   */
  private async request<T>(
    endpoint: string,
    method: HttpMethod,
    body?: any,
    options?: PaymentRequestOptions
  ): Promise<T> {
    const requestOptions: PaymentRequestOptions = {
      headers: {},
      includeSession: true,
      ...options,
    };

    // 1. Guest Token (if available) - Uses X-Guest-Token header
    if (this.guestToken || options?.guestToken) {
      const token = options?.guestToken || this.guestToken;
      if (token) {
        requestOptions.headers!['X-Guest-Token'] = token;
        requestOptions.includeSession = false; // Don't include session for guests
      }
    }

    // 2. Organization ID (if available) - Included in body
    // ⚠️ NOTE: Only works in Subscriptions and Customers currently
    // Addresses, Payments and Payment Methods have organization_id hardcoded to null in backend
    if (body && (this.organizationId || options?.organizationId)) {
      const orgId = options?.organizationId || this.organizationId;

      // Only include organization_id in endpoints that support it
      if (endpoint.includes('/subscriptions') || endpoint.includes('/customers')) {
        body.organization_id = orgId;
      }
      // For other endpoints, backend ignores it (hardcoded null)
      // When implemented in backend, it will work automatically
    }

    // 3. ApiClient automatically handles X-Session-ID for authenticated users
    const response = await this.apiClient.request<T>(
      `/bridge-payment${endpoint}`,
      method,
      body,
      requestOptions
    );

    if (!response.success) {
      throw new Error(response.error || 'Request failed');
    }

    return response.data!;
  }

  // ============================================================================
  // PAYMENT INTENTS
  // ============================================================================

  /**
   * Create a payment intent
   * 
   * @param data Payment intent data
   * @param options Request options
   * @returns Payment intent
   */
  async createPaymentIntent(
    data: CreatePaymentIntentRequest,
    options?: PaymentRequestOptions
  ): Promise<PaymentIntent> {
    return this.request<PaymentIntent>('/payments/intents', 'POST', data, options);
  }

  /**
   * Get a payment intent by ID
   *
   * @param id Payment intent ID
   * @param options Request options
   * @returns Payment intent
   */
  async getPaymentIntent(id: string, options?: PaymentRequestOptions): Promise<PaymentIntent> {
    return this.request<PaymentIntent>(`/payments/intents/${id}`, 'GET', undefined, options);
  }

  /**
   * List payments
   *
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of payments
   */
  async listPayments(
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<Payment[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<Payment[]>(endpoint, 'GET', undefined, options);
  }

  /**
   * Get a payment by ID
   *
   * @param id Payment ID
   * @param options Request options
   * @returns Payment
   */
  async getPayment(id: string, options?: PaymentRequestOptions): Promise<Payment> {
    return this.request<Payment>(`/payments/${id}`, 'GET', undefined, options);
  }

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  /**
   * List payment methods
   *
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of payment methods
   */
  async listPaymentMethods(
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<PaymentMethod[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/payment-methods${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<PaymentMethod[]>(endpoint, 'GET', undefined, options);
  }

  /**
   * Get a payment method by ID
   *
   * @param id Payment method ID
   * @param options Request options
   * @returns Payment method
   */
  async getPaymentMethod(id: string, options?: PaymentRequestOptions): Promise<PaymentMethod> {
    return this.request<PaymentMethod>(`/payment-methods/${id}`, 'GET', undefined, options);
  }

  /**
   * Update a payment method
   *
   * @param id Payment method ID
   * @param data Update data
   * @param options Request options
   * @returns Updated payment method
   */
  async updatePaymentMethod(
    id: string,
    data: UpdatePaymentMethodRequest,
    options?: PaymentRequestOptions
  ): Promise<PaymentMethod> {
    return this.request<PaymentMethod>(`/payment-methods/${id}`, 'PUT', data, options);
  }

  /**
   * Delete a payment method
   *
   * @param id Payment method ID
   * @param options Request options
   */
  async deletePaymentMethod(id: string, options?: PaymentRequestOptions): Promise<void> {
    await this.request<void>(`/payment-methods/${id}`, 'DELETE', undefined, options);
  }

  // ============================================================================
  // ADDRESSES
  // ============================================================================

  /**
   * Create an address
   *
   * @param data Address data
   * @param options Request options
   * @returns Created address
   */
  async createAddress(
    data: CreateAddressRequest,
    options?: PaymentRequestOptions
  ): Promise<Address> {
    return this.request<Address>('/addresses', 'POST', data, options);
  }

  /**
   * List addresses
   *
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of addresses
   */
  async listAddresses(
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<Address[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/addresses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<Address[]>(endpoint, 'GET', undefined, options);
  }

  /**
   * Get an address by ID
   *
   * @param id Address ID
   * @param options Request options
   * @returns Address
   */
  async getAddress(id: string, options?: PaymentRequestOptions): Promise<Address> {
    return this.request<Address>(`/addresses/${id}`, 'GET', undefined, options);
  }

  /**
   * Update an address
   *
   * @param id Address ID
   * @param data Update data
   * @param options Request options
   * @returns Updated address
   */
  async updateAddress(
    id: string,
    data: UpdateAddressRequest,
    options?: PaymentRequestOptions
  ): Promise<Address> {
    return this.request<Address>(`/addresses/${id}`, 'PUT', data, options);
  }

  /**
   * Delete an address
   *
   * @param id Address ID
   * @param options Request options
   */
  async deleteAddress(id: string, options?: PaymentRequestOptions): Promise<void> {
    await this.request<void>(`/addresses/${id}`, 'DELETE', undefined, options);
  }

  // ============================================================================
  // CUSTOMERS
  // ============================================================================

  /**
   * Create a customer
   *
   * @param data Customer data
   * @param options Request options
   * @returns Created customer
   */
  async createCustomer(
    data: CreateCustomerRequest,
    options?: PaymentRequestOptions
  ): Promise<Customer> {
    return this.request<Customer>('/customers', 'POST', data, options);
  }

  /**
   * List customers
   *
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of customers
   */
  async listCustomers(
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<Customer[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<Customer[]>(endpoint, 'GET', undefined, options);
  }

  /**
   * Get a customer by ID
   *
   * @param id Customer ID
   * @param options Request options
   * @returns Customer
   */
  async getCustomer(id: string, options?: PaymentRequestOptions): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`, 'GET', undefined, options);
  }

  /**
   * Update a customer
   *
   * @param id Customer ID
   * @param data Update data
   * @param options Request options
   * @returns Updated customer
   */
  async updateCustomer(
    id: string,
    data: UpdateCustomerRequest,
    options?: PaymentRequestOptions
  ): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`, 'PUT', data, options);
  }

  /**
   * Delete a customer
   *
   * @param id Customer ID
   * @param options Request options
   */
  async deleteCustomer(id: string, options?: PaymentRequestOptions): Promise<void> {
    await this.request<void>(`/customers/${id}`, 'DELETE', undefined, options);
  }

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================

  /**
   * Create a subscription
   *
   * @param data Subscription data
   * @param options Request options
   * @returns Created subscription
   */
  async createSubscription(
    data: CreateSubscriptionRequest,
    options?: PaymentRequestOptions
  ): Promise<Subscription> {
    return this.request<Subscription>('/subscriptions', 'POST', data, options);
  }

  /**
   * List subscriptions
   *
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of subscriptions
   */
  async listSubscriptions(
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<Subscription[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/subscriptions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<Subscription[]>(endpoint, 'GET', undefined, options);
  }

  /**
   * Get a subscription by ID
   *
   * @param id Subscription ID
   * @param options Request options
   * @returns Subscription
   */
  async getSubscription(id: string, options?: PaymentRequestOptions): Promise<Subscription> {
    return this.request<Subscription>(`/subscriptions/${id}`, 'GET', undefined, options);
  }

  /**
   * Cancel a subscription
   *
   * @param id Subscription ID
   * @param data Cancel data
   * @param options Request options
   * @returns Canceled subscription
   */
  async cancelSubscription(
    id: string,
    data?: CancelSubscriptionRequest,
    options?: PaymentRequestOptions
  ): Promise<Subscription> {
    return this.request<Subscription>(`/subscriptions/${id}/cancel`, 'POST', data, options);
  }

  // ============================================================================
  // ORGANIZATIONS
  // ============================================================================

  /**
   * Create an organization
   *
   * @param data Organization data
   * @param options Request options
   * @returns Created organization
   */
  async createOrganization(
    data: CreateOrganizationRequest,
    options?: PaymentRequestOptions
  ): Promise<Organization> {
    return this.request<Organization>('/organizations', 'POST', data, options);
  }

  /**
   * List organizations
   *
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of organizations
   */
  async listOrganizations(
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<Organization[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/organizations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<Organization[]>(endpoint, 'GET', undefined, options);
  }

  /**
   * Get an organization by ID
   *
   * @param id Organization ID
   * @param options Request options
   * @returns Organization
   */
  async getOrganization(id: string, options?: PaymentRequestOptions): Promise<Organization> {
    return this.request<Organization>(`/organizations/${id}`, 'GET', undefined, options);
  }

  /**
   * Update an organization
   *
   * @param id Organization ID
   * @param data Update data
   * @param options Request options
   * @returns Updated organization
   */
  async updateOrganization(
    id: string,
    data: UpdateOrganizationRequest,
    options?: PaymentRequestOptions
  ): Promise<Organization> {
    return this.request<Organization>(`/organizations/${id}`, 'PUT', data, options);
  }

  /**
   * Delete an organization
   *
   * @param id Organization ID
   * @param options Request options
   */
  async deleteOrganization(id: string, options?: PaymentRequestOptions): Promise<void> {
    await this.request<void>(`/organizations/${id}`, 'DELETE', undefined, options);
  }

  /**
   * List organization members
   *
   * @param organizationId Organization ID
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of organization members
   */
  async listOrganizationMembers(
    organizationId: string,
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<OrganizationMember[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/organizations/${organizationId}/members${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<OrganizationMember[]>(endpoint, 'GET', undefined, options);
  }

  /**
   * Add an organization member
   *
   * @param organizationId Organization ID
   * @param data Member data
   * @param options Request options
   * @returns Added member
   */
  async addOrganizationMember(
    organizationId: string,
    data: AddOrganizationMemberRequest,
    options?: PaymentRequestOptions
  ): Promise<OrganizationMember> {
    return this.request<OrganizationMember>(
      `/organizations/${organizationId}/members`,
      'POST',
      data,
      options
    );
  }

  /**
   * Update an organization member role
   *
   * @param organizationId Organization ID
   * @param memberId Member ID
   * @param data Update data
   * @param options Request options
   * @returns Updated member
   */
  async updateOrganizationMemberRole(
    organizationId: string,
    memberId: string,
    data: UpdateOrganizationMemberRoleRequest,
    options?: PaymentRequestOptions
  ): Promise<OrganizationMember> {
    return this.request<OrganizationMember>(
      `/organizations/${organizationId}/members/${memberId}`,
      'PUT',
      data,
      options
    );
  }

  /**
   * Remove an organization member
   *
   * @param organizationId Organization ID
   * @param memberId Member ID
   * @param options Request options
   */
  async removeOrganizationMember(
    organizationId: string,
    memberId: string,
    options?: PaymentRequestOptions
  ): Promise<void> {
    await this.request<void>(
      `/organizations/${organizationId}/members/${memberId}`,
      'DELETE',
      undefined,
      options
    );
  }

  /**
   * Leave an organization
   *
   * @param organizationId Organization ID
   * @param options Request options
   */
  async leaveOrganization(
    organizationId: string,
    options?: PaymentRequestOptions
  ): Promise<void> {
    await this.request<void>(`/organizations/${organizationId}/leave`, 'POST', undefined, options);
  }

  // ============================================================================
  // GUEST CONVERSION
  // ============================================================================

  /**
   * Convert guest to user
   *
   * @param data Conversion data
   * @param options Request options
   * @returns Conversion result
   */
  async convertGuestToUser(
    data: ConvertGuestToUserRequest,
    options?: PaymentRequestOptions
  ): Promise<ConvertGuestToUserResponse> {
    return this.request<ConvertGuestToUserResponse>('/guest/convert', 'POST', data, options);
  }
}

