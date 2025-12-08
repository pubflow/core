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
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  alias?: string;
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

// ============================================================================
// ADDRESSES
// ============================================================================

/**
 * Address type
 */
export type AddressType = 'billing' | 'shipping';

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

