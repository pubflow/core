/**
 * Pubflow Configuration Module
 *
 * Provides configuration management for Pubflow framework
 */

import { SessionConfig, StorageConfig, PubflowInstanceConfig } from '../types';

export interface PubflowConfig {
  /** Base URL for the API */
  baseUrl: string;

  /** Custom base path for bridge API (default: '/bridge') */
  bridgeBasePath?: string;

  /** Custom base path for auth API (default: '/auth') */
  authBasePath?: string;

  /** Default timeout for API requests in milliseconds */
  timeout?: number;

  /** Whether to use secure storage for session tokens (if available) */
  useSecureStorage?: boolean;

  /** Session configuration */
  sessionConfig?: SessionConfig;

  /** Storage configuration */
  storageConfig?: StorageConfig;

  /** Custom headers to include in all API requests */
  headers?: Record<string, string>;
}

// Default configuration values
export const DEFAULT_CONFIG: Omit<PubflowConfig, 'baseUrl'> = {
  bridgeBasePath: '/bridge',
  authBasePath: '/auth',
  timeout: 30000, // 30 seconds
  useSecureStorage: true,
  sessionConfig: {
    validationInterval: 5 * 60 * 1000, // 5 minutes
    validationEndpoint: '/validate-session',
    autoValidate: true,
    validateOnStartup: true,
    validateBeforeRequests: false,
    refreshThreshold: 5 * 60 * 1000, // 5 minutes
  },
  storageConfig: {
    prefix: 'pubflow',
    sessionKey: 'session_id'
  },
  headers: {}
};

// Store for multiple configurations
const configInstances: Map<string, PubflowInstanceConfig> = new Map();

// Default instance ID
const DEFAULT_INSTANCE_ID = 'default';

/**
 * Initialize Pubflow configuration
 *
 * @param config Configuration options
 * @param instanceId Optional instance ID (default: 'default')
 * @returns The complete configuration
 */
export function initConfig(config: PubflowConfig, instanceId: string = DEFAULT_INSTANCE_ID): PubflowInstanceConfig {
  // Merge with default config
  const fullConfig: PubflowInstanceConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    id: instanceId,
    // Merge nested objects
    sessionConfig: {
      ...DEFAULT_CONFIG.sessionConfig,
      ...config.sessionConfig
    },
    storageConfig: {
      ...DEFAULT_CONFIG.storageConfig,
      ...config.storageConfig
    },
    headers: {
      ...DEFAULT_CONFIG.headers,
      ...config.headers
    }
  };

  // Store the configuration
  configInstances.set(instanceId, fullConfig);

  return fullConfig;
}

/**
 * Get Pubflow configuration
 *
 * @param instanceId Optional instance ID (default: 'default')
 * @returns The configuration for the specified instance
 * @throws Error if configuration is not initialized
 */
export function getConfig(instanceId: string = DEFAULT_INSTANCE_ID): PubflowInstanceConfig {
  const config = configInstances.get(instanceId);

  if (!config) {
    throw new Error(`Pubflow configuration for instance '${instanceId}' is not initialized. Call initConfig() first.`);
  }

  return config;
}

/**
 * Get all configuration instances
 *
 * @returns Map of all configuration instances
 */
export function getAllConfigs(): Map<string, PubflowInstanceConfig> {
  return new Map(configInstances);
}

/**
 * Check if a configuration instance exists
 *
 * @param instanceId Instance ID to check
 * @returns True if the instance exists
 */
export function hasConfig(instanceId: string): boolean {
  return configInstances.has(instanceId);
}

/**
 * Remove a configuration instance
 *
 * @param instanceId Instance ID to remove
 * @returns True if the instance was removed
 */
export function removeConfig(instanceId: string): boolean {
  return configInstances.delete(instanceId);
}

/**
 * Update an existing configuration instance
 *
 * @param instanceId Instance ID to update
 * @param config New configuration options (partial)
 * @returns The updated configuration
 * @throws Error if configuration is not initialized
 */
export function updateConfig(instanceId: string, config: Partial<PubflowConfig>): PubflowInstanceConfig {
  const existingConfig = getConfig(instanceId);

  // Merge with existing config
  const updatedConfig: PubflowInstanceConfig = {
    ...existingConfig,
    ...config,
    id: instanceId,
    // Merge nested objects
    sessionConfig: {
      ...existingConfig.sessionConfig,
      ...config.sessionConfig
    },
    storageConfig: {
      ...existingConfig.storageConfig,
      ...config.storageConfig
    },
    headers: {
      ...existingConfig.headers,
      ...config.headers
    }
  };

  // Store the updated configuration
  configInstances.set(instanceId, updatedConfig);

  return updatedConfig;
}
