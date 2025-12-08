/**
 * Bridge Payments Module
 * 
 * Exports for Bridge Payments client and types
 */

// Export client
export { BridgePaymentClient } from './client';

// Export all types
export type {
  BridgePaymentConfig,
  PaymentRequestOptions,
  CreatePaymentIntentRequest,
  PaymentIntent,
  Payment,
  PaymentMethodType,
  PaymentMethod,
  UpdatePaymentMethodRequest,
  AddressType,
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  SubscriptionStatus,
  Subscription,
  CreateSubscriptionRequest,
  CancelSubscriptionRequest,
  OrganizationRole,
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

