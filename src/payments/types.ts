/**
 * Bridge Payments Types
 * 
 * TypeScript interfaces for Bridge Payments API
 */

import { RequestOptions } from '../api/types';

/**
 * Configuration for Bridge Payment Client
 */
export interface BridgePaymentConfig {
  /**
   * Base URL of the Bridge Payments instance
   * Example: 'https://your-instance.pubflow.com'
   */
  baseUrl: string;

  /**
   * API mount prefix.
   * @default '/bridge-payment'
   */
  prefix?: string;

  /**
   * Guest token (optional)
   * If provided, all requests will use X-Guest-Token header
   */
  guestToken?: string;

  /**
   * Organization ID (optional)
   * 
   * ✅ SUPPORTED IN:
   * - Subscriptions (complete)
   * - Customers (complete)
   * 
   * ⚠️ NOT SUPPORTED IN (backend hardcoded null):
   * - Addresses
   * - Payments (partial - only customers)
   * - Payment Methods
   * 
   * The client is prepared for when the backend is updated.
   */
  organizationId?: string;

  /**
   * Project ID for project-scoped billing.
   */
  projectId?: string;

  /**
   * Pubflow instance ID (optional)
   * Default: 'bridge-payments'
   */
  instanceId?: string;

  /**
   * Custom headers (optional)
   */
  headers?: Record<string, string>;

  /**
   * Storage adapter (optional, uses Pubflow default)
   */
  storage?: any;
}

/**
 * Request options for payment operations
 */
export interface PaymentRequestOptions extends RequestOptions {
  /**
   * Guest token for this specific request
   * Overrides the client's guestToken
   */
  guestToken?: string;

  /**
   * Organization ID for this specific request
   * Overrides the client's organizationId
   */
  organizationId?: string;

  /**
   * Project ID for this specific request.
   */
  projectId?: string;
}

// ============================================================================
// PAYMENT INTENTS
// ============================================================================

/**
 * Request to create a payment intent
 */
export interface CreatePaymentIntentRequest {
  // Pricing (flexible)
  total_cents?: number;
  subtotal_cents?: number;
  tax_cents?: number;
  discount_cents?: number;
  shipping_cents?: number;

  // Required
  currency: string;
  provider_id: string;

  // Optional
  description?: string;
  concept?: string;
  reference_code?: string;
  category?: string;

  // Guest data (for unauthenticated users)
  guest_data?: {
    email: string;
    name: string;
    phone?: string;
  };

  // Payment method
  payment_method_id?: string;
  save_payment_method?: boolean;
  organization_id?: string;
  project_id?: string;
  billing_address_id?: string | null;

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Payment Intent response
 */
export interface PaymentIntent {
  id: string;
  client_secret: string;
  status: string;
  total_cents: number;
  currency: string;
  provider_id: string;
  user_id?: string;
  guest_email?: string;
  guest_token?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Payment response
 */
export interface Payment {
  id: string;
  user_id?: string;
  guest_email?: string;
  provider_id: string;
  provider_payment_id: string;
  total_cents: number;
  currency: string;
  status: string;
  description?: string;
  metadata?: Record<string, any>;
  organization_id?: string;
  project_id?: string;
  payment_method?: PaymentMethod;
  subscription?: Subscription;
  product?: Product;
  order?: Order;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * Payment method type
 */
export type PaymentMethodType = 'card' | 'bank_account' | 'paypal' | 'apple_pay' | 'google_pay';

/**
 * Payment Method response
 */
export interface PaymentMethod {
  id: string;
  user_id?: string;
  guest_email?: string;
  organization_id?: string;
  provider_id: string;
  provider_payment_method_id: string;
  type: PaymentMethodType;
  payment_type?: PaymentMethodType;
  last4?: string;
  last_four?: string;
  brand?: string;
  card_brand?: string;
  exp_month?: number;
  exp_year?: number;
  alias?: string;
  billing_address_id?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Request to update a payment method
 */
export interface UpdatePaymentMethodRequest {
  alias?: string;
  is_default?: boolean;
}

export interface UpdateBillingAddressRequest {
  billing_address_id: string | null;
}

// ============================================================================
// ADDRESSES
// ============================================================================

/**
 * Address type
 */
export type AddressType = 'billing' | 'shipping' | 'both';

/**
 * Address response
 */
export interface Address {
  id: string;
  user_id?: string;
  guest_email?: string;
  organization_id?: string;
  address_type: AddressType;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
  is_partial?: boolean;
  is_business?: boolean;
  business_name?: string | null;
  tax_id?: string | null;
  tax_id_type?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Request to create an address
 */
export interface CreateAddressRequest {
  address_type: AddressType;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
  is_partial?: boolean;
  is_business?: boolean;
  business_name?: string | null;
  tax_id?: string | null;
  tax_id_type?: string | null;
  is_default?: boolean;
}

/**
 * Request to update an address
 */
export interface UpdateAddressRequest {
  address_type?: AddressType;
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  is_default?: boolean;
  is_partial?: boolean;
  is_business?: boolean;
  business_name?: string | null;
  tax_id?: string | null;
  tax_id_type?: string | null;
}

// ============================================================================
// CUSTOMERS
// ============================================================================

/**
 * Customer response
 */
export interface Customer {
  id: string;
  user_id?: string;
  guest_email?: string;
  organization_id?: string;
  provider_id: string;
  provider_customer_id: string;
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Request to create a customer
 */
export interface CreateCustomerRequest {
  email: string;
  name: string;
  phone?: string;
  provider_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Request to update a customer
 */
export interface UpdateCustomerRequest {
  email?: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

/**
 * Subscription status
 */
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'trialing';

/**
 * Subscription response
 */
export interface Subscription {
  id: string;
  user_id?: string;
  organization_id?: string;
  customer_id: string;
  product_id?: string;
  provider_id: string;
  provider_subscription_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Request to create a subscription
 */
export interface CreateSubscriptionRequest {
  customer_id: string;
  product_id?: string;
  payment_method_id: string;
  provider_id?: string;
  trial_days?: number;
  organization_id?: string;
  project_id?: string;
  billing_address_id?: string | null;
  metadata?: Record<string, any>;
}

export interface UpdateSubscriptionRequest {
  payment_method_id?: string;
  billing_address_id?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Request to cancel a subscription
 */
export interface CancelSubscriptionRequest {
  cancel_at_period_end?: boolean;
  reason?: string;
}

// ============================================================================
// ORGANIZATIONS
// ============================================================================

/**
 * Organization role
 */
export type OrganizationRole = 'owner' | 'admin' | 'billing' | 'member';

/**
 * Organization response
 */
export interface Organization {
  id: string;
  name: string;
  business_email?: string;
  business_phone?: string;
  tax_id?: string;
  address?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Request to create an organization
 */
export interface CreateOrganizationRequest {
  name: string;
  business_email?: string;
  business_phone?: string;
  tax_id?: string;
  address?: string;
  metadata?: Record<string, any>;
}

/**
 * Request to update an organization
 */
export interface UpdateOrganizationRequest {
  name?: string;
  business_email?: string;
  business_phone?: string;
  tax_id?: string;
  address?: string;
  metadata?: Record<string, any>;
}

/**
 * Organization member response
 */
export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  created_at: string;
  updated_at: string;
}

/**
 * Request to add an organization member
 */
export interface AddOrganizationMemberRequest {
  email: string;
  role: OrganizationRole;
}

/**
 * Request to update an organization member role
 */
export interface UpdateOrganizationMemberRoleRequest {
  role: OrganizationRole;
}

// ============================================================================
// GUEST CONVERSION
// ============================================================================

/**
 * Request to convert guest to user
 */
export interface ConvertGuestToUserRequest {
  guest_email: string;
}

/**
 * Response from guest conversion
 */
export interface ConvertGuestToUserResponse {
  success: boolean;
  message: string;
  payments_count: number;
  payment_methods_count: number;
  addresses_count: number;
}

// ============================================================================
// PAGINATION & QUERY
// ============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  organization_id?: string;
  project_id?: string;
  include?: string;
  include_pm?: boolean;
  completeness?: 'full' | 'partial' | 'any';
  [key: string]: any;
}

/**
 * List response with pagination
 */
export interface ListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ============================================================================
// BILLING SCHEDULES
// ============================================================================

/**
 * Schedule type
 */
export type ScheduleType = 'subscription' | 'installment' | 'recurring_invoice' | 'custom';

/**
 * Interval type
 */
export type IntervalType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

/**
 * Billing schedule status
 */
export type BillingScheduleStatus = 'active' | 'paused' | 'completed' | 'failed' | 'canceled';

/**
 * Billing schedule response
 */
export interface BillingSchedule {
  id: string;
  user_id?: string;
  organization_id?: string;
  schedule_type: ScheduleType;
  amount_cents: number;
  currency: string;
  interval_type: IntervalType;
  interval_count: number;
  next_billing_date: string;
  end_date?: string;
  max_occurrences?: number;
  current_occurrence: number;
  payment_method_id?: string;
  account_balance_id?: string;
  auto_charge: boolean;
  send_invoice: boolean;
  retry_on_failure: boolean;
  max_retries: number;
  status: BillingScheduleStatus;
  last_billing_date?: string;
  last_billing_status?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Request to create a billing schedule
 */
export interface CreateBillingScheduleRequest {
  user_id?: string;
  organization_id?: string;
  schedule_type: ScheduleType;
  amount_cents: number;
  currency?: string;
  interval_type: IntervalType;
  interval_count?: number;
  next_billing_date: string;
  end_date?: string;
  max_occurrences?: number;
  payment_method_id?: string;
  account_balance_id?: string;
  auto_charge?: boolean;
  send_invoice?: boolean;
  retry_on_failure?: boolean;
  max_retries?: number;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Request to update a billing schedule
 */
export interface UpdateBillingScheduleRequest {
  amount_cents?: number;
  next_billing_date?: string;
  end_date?: string;
  max_occurrences?: number;
  payment_method_id?: string;
  account_balance_id?: string;
  auto_charge?: boolean;
  send_invoice?: boolean;
  retry_on_failure?: boolean;
  max_retries?: number;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Billing execution response
 */
export interface BillingExecution {
  id: string;
  billing_schedule_id: string;
  execution_date: string;
  amount_cents: number;
  currency: string;
  status: string;
  payment_id?: string;
  receipt_id?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
}

// ============================================================================
// ACCOUNT BALANCE
// ============================================================================

/**
 * Balance type
 */
export type BalanceType = 'general' | 'credits' | 'promotional' | 'refund';

/**
 * Balance status
 */
export type BalanceStatus = 'active' | 'suspended' | 'expired' | 'closed';

/**
 * Transaction type
 */
export type TransactionType = 'credit' | 'debit' | 'transfer' | 'expiration' | 'adjustment';

/**
 * Account balance response
 */
export interface AccountBalance {
  id: string;
  user_id?: string;
  organization_id?: string;
  customer_id?: string;
  balance_cents: number;
  currency: string;
  balance_type: BalanceType;
  reference_code?: string;
  status: BalanceStatus;
  expires_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Request to create an account balance
 */
export interface CreateAccountBalanceRequest {
  user_id?: string;
  organization_id?: string;
  customer_id?: string;
  balance_type?: BalanceType;
  balance_cents?: number;
  currency?: string;
  reference_code?: string;
  expires_at?: string;
  status?: BalanceStatus;
  metadata?: Record<string, any>;
}

/**
 * Request to update an account balance
 */
export interface UpdateAccountBalanceRequest {
  status?: BalanceStatus;
  expires_at?: string;
  metadata?: Record<string, any>;
}

/**
 * Request to credit a balance
 */
export interface CreditBalanceRequest {
  amount_cents: number;
  description?: string;
  reference_code?: string;
}

/**
 * Request to debit a balance
 */
export interface DebitBalanceRequest {
  amount_cents: number;
  description?: string;
  allow_negative?: boolean;
}

/**
 * Account transaction response
 */
export interface AccountTransaction {
  id: string;
  account_balance_id: string;
  transaction_type: TransactionType;
  amount_cents: number;
  balance_before_cents: number;
  balance_after_cents: number;
  currency: string;
  description?: string;
  reference_code?: string;
  status: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ============================================================================
// COST TRACKING
// ============================================================================

/**
 * Cost type
 */
export type CostType = 'fixed' | 'per_unit' | 'per_hour' | 'percentage';

/**
 * Product cost response
 */
export interface ProductCost {
  id: string;
  product_id: string;
  cost_type: CostType;
  cost_cents: number;
  currency: string;
  effective_from: string;
  effective_until?: string;
  category?: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Request to create a product cost
 */
export interface CreateProductCostRequest {
  product_id: string;
  cost_type: CostType;
  cost_cents: number;
  currency?: string;
  effective_from?: string;
  effective_until?: string;
  category?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Request to update a product cost
 */
export interface UpdateProductCostRequest {
  cost_cents?: number;
  effective_until?: string;
  category?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Order cost response
 */
export interface OrderCost {
  id: string;
  order_id: string;
  cost_type: CostType;
  cost_cents: number;
  currency: string;
  category?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

/**
 * Request to create an order cost
 */
export interface CreateOrderCostRequest {
  order_id: string;
  cost_type: CostType;
  cost_cents: number;
  currency?: string;
  category?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Total cost response
 */
export interface TotalCostResponse {
  product_id?: string;
  order_id?: string;
  total_cost_cents: number;
  total_cost_dollars: number;
  calculated_at?: string;
}

export interface Product {
  id: string;
  name?: string;
  description?: string;
  product_type?: string;
  category_id?: string;
  is_recurring?: boolean;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface Order {
  id: string;
  user_id?: string;
  organization_id?: string;
  project_id?: string;
  status?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface Receipt {
  id: string;
  payment_id?: string;
  user_id?: string;
  organization_id?: string;
  project_id?: string;
  [key: string]: any;
}

export interface Invoice {
  id: string;
  user_id?: string;
  organization_id?: string;
  project_id?: string;
  status?: string;
  [key: string]: any;
}
