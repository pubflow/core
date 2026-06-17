import { ApiResponse, RequestOptions } from '../api/types';
import { ModuleClient, ModuleQueryParams } from './utils';

export interface OnboardingState {
  id?: string;
  user_id?: string;
  status?: string;
  step?: string;
  completed?: boolean;
  data?: Record<string, any>;
  [key: string]: any;
}

export class OnboardingClient extends ModuleClient {
  getState(params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<OnboardingState>> {
    return this.get<OnboardingState>('', params, options);
  }

  start(data?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<OnboardingState>> {
    return this.post<OnboardingState>('/start', data || {}, options);
  }

  completeStep(step: string, data?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<OnboardingState>> {
    return this.post<OnboardingState>(`/steps/${step}/complete`, data || {}, options);
  }

  skipStep(step: string, data?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<OnboardingState>> {
    return this.post<OnboardingState>(`/steps/${step}/skip`, data || {}, options);
  }

  finish(data?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<OnboardingState>> {
    return this.post<OnboardingState>('/complete', data || {}, options);
  }
}
