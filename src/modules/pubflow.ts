import { ApiClient } from '../api/client';
import { createConfig } from '../config';
import { PubflowInstanceConfig } from '../types';
import { MemoryStorageAdapter, StorageAdapter } from '../storage/adapter';
import { BridgePaymentClient } from '../payments/client';
import { BlogClient } from './blog';
import { OnboardingClient } from './onboarding';
import { UltraFormsClient } from './forms';

export interface PubflowClientConfig extends Partial<PubflowInstanceConfig> {
  id?: string;
  baseUrl?: string;
  storage?: StorageAdapter;
  organizationId?: string;
  projectId?: string;
}

export interface PubflowClient {
  config: PubflowInstanceConfig;
  api: ApiClient;
  payments: BridgePaymentClient;
  pay: BridgePaymentClient;
  forms: UltraFormsClient;
  blog: BlogClient;
  onboarding: OnboardingClient;
}

function clientFor(baseConfig: PubflowInstanceConfig, baseUrl: string, storage: StorageAdapter): ApiClient {
  return new ApiClient(
    {
      ...baseConfig,
      baseUrl,
    },
    storage
  );
}

export function createPubflow(config: PubflowClientConfig): PubflowClient {
  const storage = config.storage || new MemoryStorageAdapter();
  const fullConfig = createConfig({
    id: config.id || 'default',
    baseUrl: config.baseUrl || config.apiUrl || config.flowlessUrl || 'http://localhost:3000',
    ...config,
  });

  const api = clientFor(fullConfig, fullConfig.apiUrl || fullConfig.baseUrl, storage);
  const flowlessApi = clientFor(fullConfig, fullConfig.flowlessUrl || fullConfig.apiUrl || fullConfig.baseUrl, storage);
  const formsApi = clientFor(fullConfig, fullConfig.formsUrl || fullConfig.apiUrl || fullConfig.baseUrl, storage);

  const payments = new BridgePaymentClient({
    baseUrl: fullConfig.paymentsUrl || fullConfig.apiUrl || fullConfig.baseUrl,
    prefix: fullConfig.modulePrefixes?.payments,
    organizationId: config.organizationId,
    projectId: config.projectId,
    instanceId: `${fullConfig.id}-payments`,
    headers: fullConfig.headers,
    storage,
  });

  return {
    config: fullConfig,
    api,
    payments,
    pay: payments,
    forms: new UltraFormsClient(formsApi, fullConfig.modulePrefixes?.forms || '/api/v1'),
    blog: new BlogClient(flowlessApi, fullConfig.modulePrefixes?.blog || '/api/v1/posts'),
    onboarding: new OnboardingClient(flowlessApi, fullConfig.modulePrefixes?.onboarding || '/api/v1/onboarding'),
  };
}
