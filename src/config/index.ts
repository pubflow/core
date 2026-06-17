/**
 * Pubflow Configuration Module
 *
 * Provides configuration management for Pubflow framework
 */

import { PubflowInstanceConfig, SessionConfig } from '../types';

const defaultSessionConfig: SessionConfig = {
  basePath: '/auth',
  loginEndpoint: '/login',
  logoutEndpoint: '/logout',
  validationEndpoint: '/validation', // ✅ Corregido para coincidir con el backend
  refreshEndpoint: '/refresh',
  storageKey: 'session',
  autoValidate: true,
  validationInterval: 5 * 60 * 1000 // 5 minutes
};

const defaultConfig: PubflowInstanceConfig = {
  id: 'default',
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000',
  paymentsUrl: 'http://localhost:3000',
  formsUrl: 'http://localhost:3000',
  flowlessUrl: 'http://localhost:3000',
  modulePrefixes: {
    payments: '/bridge-payment',
    forms: '/api/v1',
    blog: '/api/v1/posts',
    onboarding: '/api/v1/onboarding'
  },
  authBasePath: '/auth',
  sessionConfig: defaultSessionConfig,
  storageConfig: {
    prefix: 'pubflow',
    sessionKey: 'session',
    userKey: 'user'
  },
  useSecureStorage: false,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
};

export const createConfig = (config: Partial<PubflowInstanceConfig> = {}): PubflowInstanceConfig => {
  const existingConfig = { ...defaultConfig };
  const apiUrl = config.apiUrl || config.flowlessUrl || config.baseUrl || existingConfig.apiUrl || existingConfig.baseUrl;
  
  return {
    ...existingConfig,
    ...config,
    apiUrl,
    baseUrl: config.baseUrl || apiUrl,
    paymentsUrl: config.paymentsUrl || apiUrl,
    formsUrl: config.formsUrl || apiUrl,
    flowlessUrl: config.flowlessUrl || apiUrl,
    modulePrefixes: {
      ...existingConfig.modulePrefixes,
      ...config.modulePrefixes
    },
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
export function initConfig(config: PubflowInstanceConfig, instanceId: string = DEFAULT_INSTANCE_ID): PubflowInstanceConfig {
  const apiUrl = config.apiUrl || config.flowlessUrl || config.baseUrl || defaultConfig.apiUrl || defaultConfig.baseUrl;

  // Merge with default config
  const fullConfig: PubflowInstanceConfig = {
    ...defaultConfig,
    ...config,
    id: instanceId,
    apiUrl,
    baseUrl: config.baseUrl || apiUrl,
    paymentsUrl: config.paymentsUrl || apiUrl,
    formsUrl: config.formsUrl || apiUrl,
    flowlessUrl: config.flowlessUrl || apiUrl,
    modulePrefixes: {
      ...defaultConfig.modulePrefixes,
      ...config.modulePrefixes
    },
    // Merge nested objects
    sessionConfig: {
      ...defaultConfig.sessionConfig,
      ...config.sessionConfig
    },
    storageConfig: {
      ...defaultConfig.storageConfig,
      ...config.storageConfig
    },
    headers: {
      ...defaultConfig.headers,
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
export function updateConfig(instanceId: string, config: Partial<PubflowInstanceConfig>): PubflowInstanceConfig {
  const existingConfig = getConfig(instanceId);
  const apiUrl = config.apiUrl || config.flowlessUrl || config.baseUrl || existingConfig.apiUrl || existingConfig.baseUrl;

  // Merge with existing config
  const updatedConfig: PubflowInstanceConfig = {
    ...existingConfig,
    ...config,
    id: instanceId,
    apiUrl,
    baseUrl: config.baseUrl || existingConfig.baseUrl || apiUrl,
    paymentsUrl: config.paymentsUrl || existingConfig.paymentsUrl || apiUrl,
    formsUrl: config.formsUrl || existingConfig.formsUrl || apiUrl,
    flowlessUrl: config.flowlessUrl || existingConfig.flowlessUrl || apiUrl,
    modulePrefixes: {
      ...existingConfig.modulePrefixes,
      ...config.modulePrefixes
    },
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
