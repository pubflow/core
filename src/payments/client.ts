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
  UpdateBillingAddressRequest,
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  Subscription,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
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
  ListResponse,
  // Billing Schedules
  BillingSchedule,
  CreateBillingScheduleRequest,
  UpdateBillingScheduleRequest,
  BillingExecution,
  // Account Balance
  AccountBalance,
  CreateAccountBalanceRequest,
  UpdateAccountBalanceRequest,
  CreditBalanceRequest,
  DebitBalanceRequest,
  AccountTransaction,
  // Cost Tracking
  ProductCost,
  CreateProductCostRequest,
  UpdateProductCostRequest,
  OrderCost,
  CreateOrderCostRequest,
  TotalCostResponse,
  Product,
  Receipt,
  Invoice,
  Order
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
  private projectId?: string;
  private baseUrl: string;
  private prefix: string;

  /**
   * Create a new Bridge Payment Client
   * 
   * @param config Client configuration
   */
  constructor(config: BridgePaymentConfig) {
    this.baseUrl = config.baseUrl;
    this.guestToken = config.guestToken;
    this.organizationId = config.organizationId;
    this.projectId = config.projectId;
    this.prefix = config.prefix || '/bridge-payment';

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
    if (body && typeof body === 'object') {
      const orgId = options?.organizationId || this.organizationId;
      const projectId = options?.projectId || this.projectId;
      if (orgId && body.organization_id === undefined) {
        body.organization_id = orgId;
      }
      if (projectId && body.project_id === undefined) {
        body.project_id = projectId;
      }
    }

    // 3. ApiClient automatically handles X-Session-ID for authenticated users
    const response = await this.apiClient.request<T>(
      `${this.prefix}${endpoint}`,
      method,
      body,
      requestOptions
    );

    if (!response.success) {
      throw new Error(response.error || 'Request failed');
    }

    return response.data!;
  }

  private withScopeParams(params?: PaginationParams, options?: PaymentRequestOptions): PaginationParams {
    return {
      ...params,
      organization_id: params?.organization_id || options?.organizationId || this.organizationId,
      project_id: params?.project_id || options?.projectId || this.projectId,
    };
  }

  private buildQuery(params?: PaginationParams): string {
    const queryParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.set(key, String(value));
      }
    });
    const query = queryParams.toString();
    return query ? `?${query}` : '';
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

  async updatePaymentMethodBillingAddress(
    id: string,
    data: UpdateBillingAddressRequest,
    options?: PaymentRequestOptions
  ): Promise<PaymentMethod & { provider_synced?: boolean }> {
    return this.request<PaymentMethod & { provider_synced?: boolean }>(
      `/payment-methods/${id}/billing-address`,
      'PATCH',
      data,
      options
    );
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

  async updateSubscription(
    id: string,
    data: UpdateSubscriptionRequest,
    options?: PaymentRequestOptions
  ): Promise<Subscription & { provider_synced?: boolean }> {
    return this.request<Subscription & { provider_synced?: boolean }>(
      `/subscriptions/${id}`,
      'PATCH',
      data,
      options
    );
  }

  async updateSubscriptionBillingAddress(
    id: string,
    data: UpdateBillingAddressRequest,
    options?: PaymentRequestOptions
  ): Promise<Subscription & { provider_synced?: boolean }> {
    return this.request<Subscription & { provider_synced?: boolean }>(
      `/subscriptions/${id}/billing-address`,
      'PATCH',
      data,
      options
    );
  }

  async listProducts(params?: PaginationParams, options?: PaymentRequestOptions): Promise<Product[]> {
    return this.request<Product[]>(
      `/products${this.buildQuery(this.withScopeParams(params, options))}`,
      'GET',
      undefined,
      options
    );
  }

  async getProduct(id: string, options?: PaymentRequestOptions): Promise<Product> {
    return this.request<Product>(`/products/${id}`, 'GET', undefined, options);
  }

  async listReceipts(params?: PaginationParams, options?: PaymentRequestOptions): Promise<Receipt[]> {
    return this.request<Receipt[]>(
      `/receipts${this.buildQuery(this.withScopeParams(params, options))}`,
      'GET',
      undefined,
      options
    );
  }

  async getReceipt(id: string, options?: PaymentRequestOptions): Promise<Receipt> {
    return this.request<Receipt>(`/receipts/${id}`, 'GET', undefined, options);
  }

  async listInvoices(params?: PaginationParams, options?: PaymentRequestOptions): Promise<Invoice[]> {
    return this.request<Invoice[]>(
      `/invoices${this.buildQuery(this.withScopeParams(params, options))}`,
      'GET',
      undefined,
      options
    );
  }

  async getInvoice(id: string, options?: PaymentRequestOptions): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${id}`, 'GET', undefined, options);
  }

  async listOrders(params?: PaginationParams, options?: PaymentRequestOptions): Promise<Order[]> {
    return this.request<Order[]>(
      `/orders${this.buildQuery(this.withScopeParams(params, options))}`,
      'GET',
      undefined,
      options
    );
  }

  async getOrder(id: string, options?: PaymentRequestOptions): Promise<Order> {
    return this.request<Order>(`/orders/${id}`, 'GET', undefined, options);
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

  // ============================================================================
  // BILLING SCHEDULES
  // ============================================================================

  /**
   * List my billing schedules
   *
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of billing schedules
   */
  async listMySchedules(
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<BillingSchedule[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/billing-schedules/me${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<BillingSchedule[]>(endpoint, 'GET', undefined, options);
  }

  /**
   * Get a billing schedule by ID
   *
   * @param id Schedule ID
   * @param options Request options
   * @returns Billing schedule
   */
  async getSchedule(id: string, options?: PaymentRequestOptions): Promise<BillingSchedule> {
    return this.request<BillingSchedule>(`/billing-schedules/${id}`, 'GET', undefined, options);
  }

  /**
   * Create a billing schedule
   *
   * @param data Schedule data
   * @param options Request options
   * @returns Created billing schedule
   */
  async createSchedule(
    data: CreateBillingScheduleRequest,
    options?: PaymentRequestOptions
  ): Promise<BillingSchedule> {
    return this.request<BillingSchedule>('/billing-schedules', 'POST', data, options);
  }

  /**
   * Update a billing schedule
   *
   * @param id Schedule ID
   * @param data Update data
   * @param options Request options
   * @returns Updated billing schedule
   */
  async updateSchedule(
    id: string,
    data: UpdateBillingScheduleRequest,
    options?: PaymentRequestOptions
  ): Promise<BillingSchedule> {
    return this.request<BillingSchedule>(`/billing-schedules/${id}`, 'PUT', data, options);
  }

  /**
   * Pause a billing schedule
   *
   * @param id Schedule ID
   * @param options Request options
   * @returns Updated billing schedule
   */
  async pauseSchedule(id: string, options?: PaymentRequestOptions): Promise<BillingSchedule> {
    return this.request<BillingSchedule>(`/billing-schedules/${id}/pause`, 'POST', undefined, options);
  }

  /**
   * Resume a billing schedule
   *
   * @param id Schedule ID
   * @param options Request options
   * @returns Updated billing schedule
   */
  async resumeSchedule(id: string, options?: PaymentRequestOptions): Promise<BillingSchedule> {
    return this.request<BillingSchedule>(`/billing-schedules/${id}/resume`, 'POST', undefined, options);
  }

  /**
   * Delete a billing schedule
   *
   * @param id Schedule ID
   * @param options Request options
   */
  async deleteSchedule(id: string, options?: PaymentRequestOptions): Promise<void> {
    await this.request<void>(`/billing-schedules/${id}`, 'DELETE', undefined, options);
  }

  /**
   * Get execution history for a billing schedule
   *
   * @param id Schedule ID
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of billing executions
   */
  async getScheduleExecutions(
    id: string,
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<BillingExecution[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/billing-schedules/${id}/executions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<BillingExecution[]>(endpoint, 'GET', undefined, options);
  }

  // ============================================================================
  // ACCOUNT BALANCE
  // ============================================================================

  /**
   * List my account balances
   *
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of account balances
   */
  async listMyBalances(
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<AccountBalance[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/account-balance/me/balances${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<AccountBalance[]>(endpoint, 'GET', undefined, options);
  }

  /**
   * Get an account balance by ID
   *
   * @param id Balance ID
   * @param options Request options
   * @returns Account balance
   */
  async getBalance(id: string, options?: PaymentRequestOptions): Promise<AccountBalance> {
    return this.request<AccountBalance>(`/account-balance/${id}`, 'GET', undefined, options);
  }

  /**
   * Create an account balance
   *
   * @param data Balance data
   * @param options Request options
   * @returns Created account balance
   */
  async createBalance(
    data: CreateAccountBalanceRequest,
    options?: PaymentRequestOptions
  ): Promise<AccountBalance> {
    return this.request<AccountBalance>('/account-balance', 'POST', data, options);
  }

  /**
   * Credit an account balance
   *
   * @param id Balance ID
   * @param data Credit data
   * @param options Request options
   * @returns Updated balance and transaction
   */
  async creditBalance(
    id: string,
    data: CreditBalanceRequest,
    options?: PaymentRequestOptions
  ): Promise<{ balance: AccountBalance; transaction: AccountTransaction }> {
    return this.request<{ balance: AccountBalance; transaction: AccountTransaction }>(
      `/account-balance/${id}/credit`,
      'POST',
      data,
      options
    );
  }

  /**
   * Debit an account balance
   *
   * @param id Balance ID
   * @param data Debit data
   * @param options Request options
   * @returns Updated balance and transaction
   */
  async debitBalance(
    id: string,
    data: DebitBalanceRequest,
    options?: PaymentRequestOptions
  ): Promise<{ balance: AccountBalance; transaction: AccountTransaction }> {
    return this.request<{ balance: AccountBalance; transaction: AccountTransaction }>(
      `/account-balance/${id}/debit`,
      'POST',
      data,
      options
    );
  }

  /**
   * Update an account balance
   *
   * @param id Balance ID
   * @param data Update data
   * @param options Request options
   * @returns Updated account balance
   */
  async updateBalance(
    id: string,
    data: UpdateAccountBalanceRequest,
    options?: PaymentRequestOptions
  ): Promise<AccountBalance> {
    return this.request<AccountBalance>(`/account-balance/${id}`, 'PUT', data, options);
  }

  /**
   * Delete an account balance
   *
   * @param id Balance ID
   * @param options Request options
   */
  async deleteBalance(id: string, options?: PaymentRequestOptions): Promise<void> {
    await this.request<void>(`/account-balance/${id}`, 'DELETE', undefined, options);
  }

  /**
   * List my account transactions
   *
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of account transactions
   */
  async listMyTransactions(
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<AccountTransaction[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/account-balance/me/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<AccountTransaction[]>(endpoint, 'GET', undefined, options);
  }

  /**
   * Get transactions for a specific balance
   *
   * @param id Balance ID
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of account transactions
   */
  async getBalanceTransactions(
    id: string,
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<AccountTransaction[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/account-balance/${id}/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<AccountTransaction[]>(endpoint, 'GET', undefined, options);
  }

  // ============================================================================
  // COST TRACKING
  // ============================================================================

  /**
   * Get all costs for a product
   *
   * @param productId Product ID
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of product costs
   */
  async getProductCosts(
    productId: string,
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<ProductCost[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/cost-tracking/products/${productId}/costs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<ProductCost[]>(endpoint, 'GET', undefined, options);
  }

  /**
   * Get active cost for a product
   *
   * @param productId Product ID
   * @param date Date to check (ISO 8601)
   * @param options Request options
   * @returns Active product cost
   */
  async getActiveProductCost(
    productId: string,
    date?: string,
    options?: PaymentRequestOptions
  ): Promise<ProductCost> {
    const queryParams = new URLSearchParams();
    if (date) queryParams.set('date', date);

    const endpoint = `/cost-tracking/products/${productId}/costs/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<ProductCost>(endpoint, 'GET', undefined, options);
  }

  /**
   * Get total cost for a product
   *
   * @param productId Product ID
   * @param date Date to check (ISO 8601)
   * @param options Request options
   * @returns Total cost response
   */
  async getTotalProductCost(
    productId: string,
    date?: string,
    options?: PaymentRequestOptions
  ): Promise<TotalCostResponse> {
    const queryParams = new URLSearchParams();
    if (date) queryParams.set('date', date);

    const endpoint = `/cost-tracking/products/${productId}/costs/total${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<TotalCostResponse>(endpoint, 'GET', undefined, options);
  }

  /**
   * Create a product cost
   *
   * @param data Product cost data
   * @param options Request options
   * @returns Created product cost
   */
  async createProductCost(
    data: CreateProductCostRequest,
    options?: PaymentRequestOptions
  ): Promise<ProductCost> {
    return this.request<ProductCost>('/cost-tracking/products/costs', 'POST', data, options);
  }

  /**
   * Update a product cost
   *
   * @param id Cost ID
   * @param data Update data
   * @param options Request options
   * @returns Updated product cost
   */
  async updateProductCost(
    id: string,
    data: UpdateProductCostRequest,
    options?: PaymentRequestOptions
  ): Promise<ProductCost> {
    return this.request<ProductCost>(`/cost-tracking/products/costs/${id}`, 'PUT', data, options);
  }

  /**
   * Delete a product cost
   *
   * @param id Cost ID
   * @param options Request options
   */
  async deleteProductCost(id: string, options?: PaymentRequestOptions): Promise<void> {
    await this.request<void>(`/cost-tracking/products/costs/${id}`, 'DELETE', undefined, options);
  }

  /**
   * Get all costs for an order
   *
   * @param orderId Order ID
   * @param params Pagination parameters
   * @param options Request options
   * @returns List of order costs
   */
  async getOrderCosts(
    orderId: string,
    params?: PaginationParams,
    options?: PaymentRequestOptions
  ): Promise<OrderCost[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = `/cost-tracking/orders/${orderId}/costs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<OrderCost[]>(endpoint, 'GET', undefined, options);
  }

  /**
   * Get total cost for an order
   *
   * @param orderId Order ID
   * @param options Request options
   * @returns Total cost response
   */
  async getTotalOrderCost(
    orderId: string,
    options?: PaymentRequestOptions
  ): Promise<TotalCostResponse> {
    return this.request<TotalCostResponse>(
      `/cost-tracking/orders/${orderId}/costs/total`,
      'GET',
      undefined,
      options
    );
  }

  /**
   * Create an order cost
   *
   * @param data Order cost data
   * @param options Request options
   * @returns Created order cost
   */
  async createOrderCost(
    data: CreateOrderCostRequest,
    options?: PaymentRequestOptions
  ): Promise<OrderCost> {
    return this.request<OrderCost>('/cost-tracking/orders/costs', 'POST', data, options);
  }

  // ============================================================================
  // DOCUMENTED ROUTE COVERAGE HELPERS
  // ============================================================================

  async updatePaymentIntent(id: string, data: Record<string, any>, options?: PaymentRequestOptions): Promise<PaymentIntent> {
    return this.request<PaymentIntent>(`/payments/intents/${id}`, 'PATCH', data, options);
  }

  async confirmPaymentIntent(id: string, data?: Record<string, any>, options?: PaymentRequestOptions): Promise<PaymentIntent> {
    return this.request<PaymentIntent>(`/payments/intents/${id}/confirm`, 'POST', data || {}, options);
  }

  async syncPaymentIntent(id: string, data?: Record<string, any>, options?: PaymentRequestOptions): Promise<PaymentIntent> {
    return this.request<PaymentIntent>(`/payments/intents/${id}/sync`, 'POST', data || {}, options);
  }

  async cancelPayment(id: string, data?: Record<string, any>, options?: PaymentRequestOptions): Promise<Payment> {
    return this.request<Payment>(`/payments/${id}/cancel`, 'POST', data || {}, options);
  }

  async capturePayment(id: string, data?: Record<string, any>, options?: PaymentRequestOptions): Promise<Payment> {
    return this.request<Payment>(`/payments/${id}/capture`, 'POST', data || {}, options);
  }

  async createPaymentMethod(data: Record<string, any>, options?: PaymentRequestOptions): Promise<PaymentMethod> {
    return this.request<PaymentMethod>('/payment-methods', 'POST', data, options);
  }

  async createPaymentMethodDirect(data: Record<string, any>, options?: PaymentRequestOptions): Promise<PaymentMethod> {
    return this.request<PaymentMethod>('/payment-methods/direct', 'POST', data, options);
  }

  async listPaymentMethodsByCustomer(customerId: string, params?: PaginationParams, options?: PaymentRequestOptions): Promise<PaymentMethod[]> {
    return this.request<PaymentMethod[]>(
      `/payment-methods/customer/${customerId}${this.buildQuery(params)}`,
      'GET',
      undefined,
      options
    );
  }

  async createInvoice(data: Record<string, any>, options?: PaymentRequestOptions): Promise<Invoice> {
    return this.request<Invoice>('/invoices', 'POST', data, options);
  }

  async createOrder(data: Record<string, any>, options?: PaymentRequestOptions): Promise<Order> {
    return this.request<Order>('/orders', 'POST', data, options);
  }

  async listUserBalances(userId: string, params?: PaginationParams, options?: PaymentRequestOptions): Promise<AccountBalance[]> {
    return this.request<AccountBalance[]>(
      `/account-balance/users/${userId}/balances${this.buildQuery(params)}`,
      'GET',
      undefined,
      options
    );
  }

  async getMyBalanceTotal(params?: PaginationParams, options?: PaymentRequestOptions): Promise<any> {
    return this.request<any>(`/account-balance/me/total${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async getUserBalanceTotal(userId: string, params?: PaginationParams, options?: PaymentRequestOptions): Promise<any> {
    return this.request<any>(`/account-balance/users/${userId}/total${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async getBalanceStatistics(id: string, params?: PaginationParams, options?: PaymentRequestOptions): Promise<any> {
    return this.request<any>(`/account-balance/${id}/statistics${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async listExpiringBalances(params?: PaginationParams, options?: PaymentRequestOptions): Promise<AccountBalance[]> {
    return this.request<AccountBalance[]>(`/account-balance/expiring${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async listActiveSchedules(params?: PaginationParams, options?: PaymentRequestOptions): Promise<BillingSchedule[]> {
    return this.request<BillingSchedule[]>(`/billing-schedules/active${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async listDueSchedules(params?: PaginationParams, options?: PaymentRequestOptions): Promise<BillingSchedule[]> {
    return this.request<BillingSchedule[]>(`/billing-schedules/due${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async listUserSchedules(userId: string, params?: PaginationParams, options?: PaymentRequestOptions): Promise<BillingSchedule[]> {
    return this.request<BillingSchedule[]>(
      `/billing-schedules/users/${userId}${this.buildQuery(params)}`,
      'GET',
      undefined,
      options
    );
  }

  async cancelSchedule(id: string, data?: Record<string, any>, options?: PaymentRequestOptions): Promise<BillingSchedule> {
    return this.request<BillingSchedule>(`/billing-schedules/${id}/cancel`, 'POST', data || {}, options);
  }

  async getScheduleStatistics(id: string, params?: PaginationParams, options?: PaymentRequestOptions): Promise<any> {
    return this.request<any>(`/billing-schedules/${id}/statistics${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async listFailedScheduleExecutions(params?: PaginationParams, options?: PaymentRequestOptions): Promise<BillingExecution[]> {
    return this.request<BillingExecution[]>(
      `/billing-schedules/executions/failed${this.buildQuery(params)}`,
      'GET',
      undefined,
      options
    );
  }

  async closeProductCost(id: string, data?: Record<string, any>, options?: PaymentRequestOptions): Promise<ProductCost> {
    return this.request<ProductCost>(`/cost-tracking/products/costs/${id}/close`, 'POST', data || {}, options);
  }

  async getOrderCost(orderId: string, params?: PaginationParams, options?: PaymentRequestOptions): Promise<any> {
    return this.request<any>(`/cost-tracking/orders/${orderId}/cost${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async getSubscriptionCost(subscriptionId: string, params?: PaginationParams, options?: PaymentRequestOptions): Promise<any> {
    return this.request<any>(`/cost-tracking/subscriptions/${subscriptionId}/cost${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async getProfitability(params?: PaginationParams, options?: PaymentRequestOptions): Promise<any> {
    return this.request<any>(`/cost-tracking/analytics/profitability${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async getLowMargins(params?: PaginationParams, options?: PaymentRequestOptions): Promise<any> {
    return this.request<any>(`/cost-tracking/analytics/low-margins${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async getLosses(params?: PaginationParams, options?: PaymentRequestOptions): Promise<any> {
    return this.request<any>(`/cost-tracking/analytics/losses${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async getTopProfitable(params?: PaginationParams, options?: PaymentRequestOptions): Promise<any> {
    return this.request<any>(`/cost-tracking/analytics/top-profitable${this.buildQuery(params)}`, 'GET', undefined, options);
  }

  async previewGuest(email: string, options?: PaymentRequestOptions): Promise<any> {
    return this.request<any>(`/guest-conversion/preview-guest/${encodeURIComponent(email)}`, 'GET', undefined, options);
  }

  async getMyGuestData(options?: PaymentRequestOptions): Promise<any> {
    return this.request<any>('/guest-conversion/my-guest-data', 'GET', undefined, options);
  }

  admin = {
    overview: (options?: PaymentRequestOptions) => this.request<any>('/admin/overview', 'GET', undefined, options),
    stats: (params?: PaginationParams, options?: PaymentRequestOptions) =>
      this.request<any>(`/admin/stats${this.buildQuery(params)}`, 'GET', undefined, options),
    payments: (params?: PaginationParams, options?: PaymentRequestOptions) =>
      this.request<any>(`/admin/payments${this.buildQuery(params)}`, 'GET', undefined, options),
    cache: (options?: PaymentRequestOptions) => this.request<any>('/admin/cache', 'GET', undefined, options),
    clearCache: (data?: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>('/admin/cache', 'DELETE', data, options),
    health: (options?: PaymentRequestOptions) => this.request<any>('/admin/health', 'GET', undefined, options),
    testNotification: (data?: Record<string, any>, options?: PaymentRequestOptions) =>
      this.request<any>('/admin/test-notification', 'POST', data || {}, options),
    notificationConfig: (options?: PaymentRequestOptions) => this.request<any>('/admin/notification-config', 'GET', undefined, options),
    updateNotificationConfig: (data: Record<string, any>, options?: PaymentRequestOptions) =>
      this.request<any>('/admin/notification-config', 'PUT', data, options),
    products: (params?: PaginationParams, options?: PaymentRequestOptions) =>
      this.request<any>(`/admin/products${this.buildQuery(params)}`, 'GET', undefined, options),
    syncProducts: (data?: Record<string, any>, options?: PaymentRequestOptions) =>
      this.request<any>('/admin/products/sync', 'POST', data || {}, options),
    subscriptions: (params?: PaginationParams, options?: PaymentRequestOptions) =>
      this.request<any>(`/admin/subscriptions${this.buildQuery(params)}`, 'GET', undefined, options),
    memberships: (params?: PaginationParams, options?: PaymentRequestOptions) =>
      this.request<any>(`/admin/memberships${this.buildQuery(params)}`, 'GET', undefined, options),
    applePayDomains: (params?: PaginationParams, options?: PaymentRequestOptions) =>
      this.request<any>(`/admin/apple-pay-domains${this.buildQuery(params)}`, 'GET', undefined, options),
    addApplePayDomain: (data: Record<string, any>, options?: PaymentRequestOptions) =>
      this.request<any>('/admin/apple-pay-domains', 'POST', data, options),
    deleteApplePayDomain: (domain: string, options?: PaymentRequestOptions) =>
      this.request<any>(`/admin/apple-pay-domains/${encodeURIComponent(domain)}`, 'DELETE', undefined, options),
  };

  webhooks = {
    list: (params?: PaginationParams, options?: PaymentRequestOptions) => this.request<any>(`/webhooks${this.buildQuery(params)}`, 'GET', undefined, options),
    create: (data: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>('/webhooks', 'POST', data, options),
    get: (id: string, options?: PaymentRequestOptions) => this.request<any>(`/webhooks/${id}`, 'GET', undefined, options),
    update: (id: string, data: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>(`/webhooks/${id}`, 'PUT', data, options),
    delete: (id: string, options?: PaymentRequestOptions) => this.request<any>(`/webhooks/${id}`, 'DELETE', undefined, options),
    test: (id: string, data?: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>(`/webhooks/${id}/test`, 'POST', data || {}, options),
    deliveries: (id: string, params?: PaginationParams, options?: PaymentRequestOptions) =>
      this.request<any>(`/webhooks/${id}/deliveries${this.buildQuery(params)}`, 'GET', undefined, options),
  };

  externalWebhooks = {
    receive: (provider: string, data: Record<string, any>, options?: PaymentRequestOptions) =>
      this.request<any>(`/external-webhooks/${provider}`, 'POST', data, options),
    stripe: (data: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>('/external-webhooks/stripe', 'POST', data, options),
    paypal: (data: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>('/external-webhooks/paypal', 'POST', data, options),
    polar: (data: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>('/external-webhooks/polar', 'POST', data, options),
    azul: (data: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>('/external-webhooks/azul', 'POST', data, options),
  };

  memberships = {
    tiers: (params?: PaginationParams, options?: PaymentRequestOptions) => this.request<any>(`/memberships/tiers${this.buildQuery(params)}`, 'GET', undefined, options),
    mine: (params?: PaginationParams, options?: PaymentRequestOptions) => this.request<any>(`/memberships/me${this.buildQuery(params)}`, 'GET', undefined, options),
    list: (params?: PaginationParams, options?: PaymentRequestOptions) => this.request<any>(`/memberships${this.buildQuery(params)}`, 'GET', undefined, options),
    get: (id: string, options?: PaymentRequestOptions) => this.request<any>(`/memberships/${id}`, 'GET', undefined, options),
    cancel: (id: string, data?: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>(`/memberships/${id}/cancel`, 'POST', data || {}, options),
    user: (userId: string, params?: PaginationParams, options?: PaymentRequestOptions) =>
      this.request<any>(`/memberships/users/${userId}${this.buildQuery(params)}`, 'GET', undefined, options),
    access: (data: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>('/memberships/access', 'POST', data, options),
    projects: (params?: PaginationParams, options?: PaymentRequestOptions) =>
      this.request<any>(`/memberships/projects${this.buildQuery(params)}`, 'GET', undefined, options),
  };

  projects = {
    list: (params?: PaginationParams, options?: PaymentRequestOptions) => this.request<any>(`/projects${this.buildQuery(params)}`, 'GET', undefined, options),
    create: (data: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>('/projects', 'POST', data, options),
    get: (id: string, options?: PaymentRequestOptions) => this.request<any>(`/projects/${id}`, 'GET', undefined, options),
    update: (id: string, data: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>(`/projects/${id}`, 'PUT', data, options),
    delete: (id: string, options?: PaymentRequestOptions) => this.request<any>(`/projects/${id}`, 'DELETE', undefined, options),
    invites: (projectId: string, params?: PaginationParams, options?: PaymentRequestOptions) =>
      this.request<any>(`/projects/${projectId}/invites${this.buildQuery(params)}`, 'GET', undefined, options),
    invite: (projectId: string, data: Record<string, any>, options?: PaymentRequestOptions) =>
      this.request<any>(`/projects/${projectId}/invites`, 'POST', data, options),
    acceptInvite: (token: string, data?: Record<string, any>, options?: PaymentRequestOptions) =>
      this.request<any>(`/projects/invites/${token}/accept`, 'POST', data || {}, options),
  };

  moduleHub = {
    plugins: (params?: PaginationParams, options?: PaymentRequestOptions) => this.request<any>(`/module-hub/plugins${this.buildQuery(params)}`, 'GET', undefined, options),
    plugin: (id: string, options?: PaymentRequestOptions) => this.request<any>(`/module-hub/plugins/${id}`, 'GET', undefined, options),
    install: (id: string, data?: Record<string, any>, options?: PaymentRequestOptions) =>
      this.request<any>(`/module-hub/plugins/${id}/install`, 'POST', data || {}, options),
    uninstall: (id: string, data?: Record<string, any>, options?: PaymentRequestOptions) =>
      this.request<any>(`/module-hub/plugins/${id}/uninstall`, 'POST', data || {}, options),
  };

  renewals = {
    list: (params?: PaginationParams, options?: PaymentRequestOptions) => this.request<any>(`/renewals${this.buildQuery(params)}`, 'GET', undefined, options),
    get: (id: string, options?: PaymentRequestOptions) => this.request<any>(`/renewals/${id}`, 'GET', undefined, options),
    run: (id: string, data?: Record<string, any>, options?: PaymentRequestOptions) => this.request<any>(`/renewals/${id}/run`, 'POST', data || {}, options),
  };

  hosted = {
    meUrl: () => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/pages/me`,
    payUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/pages/pay${this.buildQuery(params)}`,
    loginUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/pages/login${this.buildQuery(params)}`,
    portalUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/pages/portal${this.buildQuery(params)}`,
    subscriptionsUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/pages/subscriptions${this.buildQuery(params)}`,
    paymentMethodsUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/pages/payment-methods${this.buildQuery(params)}`,
    addressesUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/pages/addresses${this.buildQuery(params)}`,
    invoicesUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/pages/invoices${this.buildQuery(params)}`,
    embedPayUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/embed/pay${this.buildQuery(params)}`,
    embedLoginUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/embed/login${this.buildQuery(params)}`,
    embedPortalUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/embed/portal${this.buildQuery(params)}`,
    embedSubscriptionsUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/embed/subscriptions${this.buildQuery(params)}`,
    embedPaymentMethodsUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/embed/payment-methods${this.buildQuery(params)}`,
    embedButtonUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/embed/button${this.buildQuery(params)}`,
    embedPaymentsUrl: (params?: PaginationParams) => `${this.baseUrl.replace(/\/+$/, '')}${this.prefix}/embed/payments${this.buildQuery(params)}`,
  };

  callbacks = {
    azulApproved: (params?: PaginationParams, options?: PaymentRequestOptions) => this.request<any>(`/callbacks/azul/approved${this.buildQuery(params)}`, 'GET', undefined, options),
    azulDeclined: (params?: PaginationParams, options?: PaymentRequestOptions) => this.request<any>(`/callbacks/azul/declined${this.buildQuery(params)}`, 'GET', undefined, options),
    azulCancelled: (params?: PaginationParams, options?: PaymentRequestOptions) => this.request<any>(`/callbacks/azul/cancelled${this.buildQuery(params)}`, 'GET', undefined, options),
    polarReturn: (params?: PaginationParams, options?: PaymentRequestOptions) => this.request<any>(`/callbacks/polar/return${this.buildQuery(params)}`, 'GET', undefined, options),
    health: (options?: PaymentRequestOptions) => this.request<any>('/callbacks/health', 'GET', undefined, options),
  };

  health = {
    basic: (options?: PaymentRequestOptions) => this.request<any>('/health', 'GET', undefined, options),
    detailed: (options?: PaymentRequestOptions) => this.request<any>('/health/detailed', 'GET', undefined, options),
    database: (options?: PaymentRequestOptions) => this.request<any>('/health/database', 'GET', undefined, options),
    providers: (options?: PaymentRequestOptions) => this.request<any>('/health/providers', 'GET', undefined, options),
    flowless: (options?: PaymentRequestOptions) => this.request<any>('/health/flowless', 'GET', undefined, options),
    ready: (options?: PaymentRequestOptions) => this.request<any>('/health/ready', 'GET', undefined, options),
    live: (options?: PaymentRequestOptions) => this.request<any>('/health/live', 'GET', undefined, options),
    metrics: (options?: PaymentRequestOptions) => this.request<any>('/health/metrics', 'GET', undefined, options),
  };
}
