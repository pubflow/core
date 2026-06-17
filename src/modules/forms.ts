import { ApiResponse, RequestOptions } from '../api/types';
import { ModuleClient, ModuleQueryParams } from './utils';

export type UltraFormsPayload = Record<string, any>;

export interface UltraForm {
  id: string;
  form_code?: string;
  title?: string;
  status?: string;
  fields?: any[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface FormSubmission {
  id: string;
  form_id?: string;
  data?: Record<string, any>;
  status?: string;
  [key: string]: any;
}

export interface FormDraft {
  id: string;
  form_id?: string;
  data?: Record<string, any>;
  expires_at?: string;
  [key: string]: any;
}

export interface Ticket {
  id: string;
  status?: string;
  subject?: string;
  submission_id?: string;
  [key: string]: any;
}

export interface Lead {
  id: string;
  email?: string;
  score?: number;
  status?: string;
  [key: string]: any;
}

export class UltraFormsClient extends ModuleClient {
  health(options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.get('/health', undefined, options);
  }

  getBranding(options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.get('/branding', undefined, options);
  }

  listForms(params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<UltraForm[]>> {
    return this.get<UltraForm[]>('/forms', params, options);
  }

  createForm(data: Partial<UltraForm>, options?: RequestOptions): Promise<ApiResponse<UltraForm>> {
    return this.post<UltraForm>('/forms', data, options);
  }

  getForm(id: string, options?: RequestOptions): Promise<ApiResponse<UltraForm>> {
    return this.get<UltraForm>(`/forms/${id}`, undefined, options);
  }

  getFormByCode(formCode: string, options?: RequestOptions): Promise<ApiResponse<UltraForm>> {
    return this.get<UltraForm>(`/forms/by-code/${formCode}`, undefined, options);
  }

  getFormLanguages(formCode: string, options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.get(`/forms/by-code/${formCode}/languages`, undefined, options);
  }

  updateForm(id: string, data: Partial<UltraForm>, options?: RequestOptions): Promise<ApiResponse<UltraForm>> {
    return this.put<UltraForm>(`/forms/${id}`, data, options);
  }

  deleteForm(id: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.delete<void>(`/forms/${id}`, options);
  }

  publishForm(id: string, options?: RequestOptions): Promise<ApiResponse<UltraForm>> {
    return this.post<UltraForm>(`/forms/${id}/publish`, {}, options);
  }

  unpublishForm(id: string, options?: RequestOptions): Promise<ApiResponse<UltraForm>> {
    return this.post<UltraForm>(`/forms/${id}/unpublish`, {}, options);
  }

  duplicateForm(id: string, data?: UltraFormsPayload, options?: RequestOptions): Promise<ApiResponse<UltraForm>> {
    return this.post<UltraForm>(`/forms/${id}/duplicate`, data || {}, options);
  }

  submitForm(id: string, data: UltraFormsPayload, options?: RequestOptions): Promise<ApiResponse<FormSubmission>> {
    return this.post<FormSubmission>(`/forms/${id}/submit`, data, options);
  }

  submitByCode(formCode: string, data: UltraFormsPayload, options?: RequestOptions): Promise<ApiResponse<FormSubmission>> {
    return this.post<FormSubmission>(`/forms/by-code/${formCode}/submit`, data, options);
  }

  submitTicket(id: string, data: UltraFormsPayload, options?: RequestOptions): Promise<ApiResponse<Ticket>> {
    return this.post<Ticket>(`/forms/${id}/submit-ticket`, data, options);
  }

  listSubmissions(formId: string, params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<FormSubmission[]>> {
    return this.get<FormSubmission[]>(`/forms/${formId}/submissions`, params, options);
  }

  getSubmissionCounts(formId: string, params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.get(`/forms/${formId}/submissions/counts`, params, options);
  }

  getReviewStatus(formId: string, params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.get(`/forms/${formId}/review-status`, params, options);
  }

  getStatusHistory(formId: string, params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.get(`/forms/${formId}/status-history`, params, options);
  }

  getSubmission(id: string, options?: RequestOptions): Promise<ApiResponse<FormSubmission>> {
    return this.get<FormSubmission>(`/submissions/${id}`, undefined, options);
  }

  deleteSubmission(id: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.delete<void>(`/submissions/${id}`, options);
  }

  forms = {
    list: this.listForms.bind(this),
    create: this.createForm.bind(this),
    get: this.getForm.bind(this),
    byCode: this.getFormByCode.bind(this),
    languages: this.getFormLanguages.bind(this),
    update: this.updateForm.bind(this),
    delete: this.deleteForm.bind(this),
    publish: this.publishForm.bind(this),
    unpublish: this.unpublishForm.bind(this),
    duplicate: this.duplicateForm.bind(this),
    submit: this.submitForm.bind(this),
    submitByCode: this.submitByCode.bind(this),
    submitTicket: this.submitTicket.bind(this),
    submissions: this.listSubmissions.bind(this),
    submissionCounts: this.getSubmissionCounts.bind(this),
    reviewStatus: this.getReviewStatus.bind(this),
    statusHistory: this.getStatusHistory.bind(this),
  };

  submissions = {
    get: this.getSubmission.bind(this),
    delete: this.deleteSubmission.bind(this),
  };

  analytics = {
    getForm: (formId: string, params?: ModuleQueryParams, options?: RequestOptions) =>
      this.get(`/analytics/forms/${formId}`, params, options),
    metrics: (formId: string, params?: ModuleQueryParams, options?: RequestOptions) =>
      this.get(`/analytics/forms/${formId}/metrics`, params, options),
    compute: (formId: string, data?: UltraFormsPayload, options?: RequestOptions) =>
      this.post(`/analytics/forms/${formId}/compute`, data || {}, options),
  };

  drafts = {
    list: (params?: ModuleQueryParams, options?: RequestOptions) => this.get<FormDraft[]>('/drafts', params, options),
    save: (data: Partial<FormDraft>, options?: RequestOptions) => this.post<FormDraft>('/drafts', data, options),
    stats: (params?: ModuleQueryParams, options?: RequestOptions) => this.get('/drafts/stats', params, options),
    get: (id: string, options?: RequestOptions) => this.get<FormDraft>(`/drafts/${id}`, undefined, options),
    update: (id: string, data: Partial<FormDraft>, options?: RequestOptions) => this.put<FormDraft>(`/drafts/${id}`, data, options),
    delete: (id: string, options?: RequestOptions) => this.delete<void>(`/drafts/${id}`, options),
    convert: (id: string, data?: UltraFormsPayload, options?: RequestOptions) =>
      this.post<FormSubmission>(`/drafts/${id}/convert`, data || {}, options),
  };

  webhooks = {
    list: (params?: ModuleQueryParams, options?: RequestOptions) => this.get('/webhooks', params, options),
    create: (data: UltraFormsPayload, options?: RequestOptions) => this.post('/webhooks', data, options),
    get: (id: string, options?: RequestOptions) => this.get(`/webhooks/${id}`, undefined, options),
    delete: (id: string, options?: RequestOptions) => this.delete(`/webhooks/${id}`, options),
    test: (id: string, data?: UltraFormsPayload, options?: RequestOptions) => this.post(`/webhooks/${id}/test`, data || {}, options),
    logs: (id: string, params?: ModuleQueryParams, options?: RequestOptions) => this.get(`/webhooks/${id}/logs`, params, options),
  };

  workflows = {
    list: (params?: ModuleQueryParams, options?: RequestOptions) => this.get('/workflows', params, options),
    create: (data: UltraFormsPayload, options?: RequestOptions) => this.post('/workflows', data, options),
    get: (id: string, options?: RequestOptions) => this.get(`/workflows/${id}`, undefined, options),
    trigger: (id: string, data?: UltraFormsPayload, options?: RequestOptions) => this.post(`/workflows/${id}/trigger`, data || {}, options),
    history: (id: string, params?: ModuleQueryParams, options?: RequestOptions) => this.get(`/workflows/${id}/history`, params, options),
    execution: (id: string, options?: RequestOptions) => this.get(`/workflow-executions/${id}`, undefined, options),
  };

  assignments = {
    create: (data: UltraFormsPayload, options?: RequestOptions) => this.post('/assignments', data, options),
    autoAssign: (data: UltraFormsPayload, options?: RequestOptions) => this.post('/assignments/auto', data, options),
    complete: (id: string, data?: UltraFormsPayload, options?: RequestOptions) => this.post(`/assignments/${id}/complete`, data || {}, options),
  };

  teams = {
    create: (data: UltraFormsPayload, options?: RequestOptions) => this.post('/teams', data, options),
    get: (id: string, options?: RequestOptions) => this.get(`/teams/${id}`, undefined, options),
  };

  agents = {
    create: (data: UltraFormsPayload, options?: RequestOptions) => this.post('/agents', data, options),
    available: (params?: ModuleQueryParams, options?: RequestOptions) => this.get('/agents/available', params, options),
    workload: (agentId: string, params?: ModuleQueryParams, options?: RequestOptions) => this.get(`/agents/${agentId}/workload`, params, options),
  };

  tickets = {
    list: (params?: ModuleQueryParams, options?: RequestOptions) => this.get<Ticket[]>('/tickets', params, options),
    create: (data: Partial<Ticket>, options?: RequestOptions) => this.post<Ticket>('/tickets', data, options),
    get: (id: string, options?: RequestOptions) => this.get<Ticket>(`/tickets/${id}`, undefined, options),
    update: (id: string, data: Partial<Ticket>, options?: RequestOptions) => this.put<Ticket>(`/tickets/${id}`, data, options),
    delete: (id: string, options?: RequestOptions) => this.delete<void>(`/tickets/${id}`, options),
    status: (id: string, data: UltraFormsPayload, options?: RequestOptions) => this.patch<Ticket>(`/tickets/${id}/status`, data, options),
    comments: (id: string, params?: ModuleQueryParams, options?: RequestOptions) => this.get(`/tickets/${id}/comments`, params, options),
    addComment: (id: string, data: UltraFormsPayload, options?: RequestOptions) => this.post(`/tickets/${id}/comments`, data, options),
    submission: (submissionId: string, options?: RequestOptions) => this.get(`/tickets/submission/${submissionId}`, undefined, options),
  };

  leads = {
    list: (params?: ModuleQueryParams, options?: RequestOptions) => this.get<Lead[]>('/leads', params, options),
    create: (data: Partial<Lead>, options?: RequestOptions) => this.post<Lead>('/leads', data, options),
    hot: (params?: ModuleQueryParams, options?: RequestOptions) => this.get<Lead[]>('/leads/hot', params, options),
    get: (id: string, options?: RequestOptions) => this.get<Lead>(`/leads/${id}`, undefined, options),
    update: (id: string, data: Partial<Lead>, options?: RequestOptions) => this.put<Lead>(`/leads/${id}`, data, options),
    delete: (id: string, options?: RequestOptions) => this.delete<void>(`/leads/${id}`, options),
    qualify: (id: string, data?: UltraFormsPayload, options?: RequestOptions) => this.post<Lead>(`/leads/${id}/qualify`, data || {}, options),
    disqualify: (id: string, data?: UltraFormsPayload, options?: RequestOptions) => this.post<Lead>(`/leads/${id}/disqualify`, data || {}, options),
    assign: (id: string, data: UltraFormsPayload, options?: RequestOptions) => this.post<Lead>(`/leads/${id}/assign`, data, options),
    recalculate: (id: string, data?: UltraFormsPayload, options?: RequestOptions) => this.post<Lead>(`/leads/${id}/recalculate`, data || {}, options),
  };

  forums = {
    boards: (params?: ModuleQueryParams, options?: RequestOptions) => this.get('/forums/boards', params, options),
    threads: (boardId: string, params?: ModuleQueryParams, options?: RequestOptions) => this.get(`/forums/boards/${boardId}/threads`, params, options),
    createThread: (boardId: string, data: UltraFormsPayload, options?: RequestOptions) =>
      this.post(`/forums/boards/${boardId}/threads`, data, options),
    getThread: (threadId: string, options?: RequestOptions) => this.get(`/forums/threads/${threadId}`, undefined, options),
    posts: (threadId: string, params?: ModuleQueryParams, options?: RequestOptions) => this.get(`/forums/threads/${threadId}/posts`, params, options),
    createPost: (threadId: string, data: UltraFormsPayload, options?: RequestOptions) => this.post(`/forums/threads/${threadId}/posts`, data, options),
    votePost: (postId: string, data: UltraFormsPayload, options?: RequestOptions) => this.post(`/forums/posts/${postId}/vote`, data, options),
    moderateThread: (threadId: string, data: UltraFormsPayload, options?: RequestOptions) =>
      this.post(`/forums/threads/${threadId}/moderate`, data, options),
    moderatePost: (postId: string, data: UltraFormsPayload, options?: RequestOptions) =>
      this.post(`/forums/posts/${postId}/moderate`, data, options),
  };

  lists = {
    subscribe: (slug: string, data: UltraFormsPayload, options?: RequestOptions) => this.post(`/lists/${slug}/subscribe`, data, options),
    confirm: (slug: string, token: string, options?: RequestOptions) => this.get(`/lists/${slug}/confirm/${token}`, undefined, options),
    unsubscribe: (slug: string, tokenOrData: string | UltraFormsPayload, options?: RequestOptions) =>
      typeof tokenOrData === 'string'
        ? this.get(`/lists/${slug}/unsubscribe/${tokenOrData}`, undefined, options)
        : this.post(`/lists/${slug}/unsubscribe`, tokenOrData, options),
    create: (data: UltraFormsPayload, options?: RequestOptions) => this.post('/admin/lists', data, options),
    list: (params?: ModuleQueryParams, options?: RequestOptions) => this.get('/admin/lists', params, options),
    events: (params?: ModuleQueryParams, options?: RequestOptions) => this.get('/admin/lists/events', params, options),
    get: (id: string, options?: RequestOptions) => this.get(`/admin/lists/${id}`, undefined, options),
    update: (id: string, data: UltraFormsPayload, options?: RequestOptions) => this.put(`/admin/lists/${id}`, data, options),
    delete: (id: string, options?: RequestOptions) => this.delete(`/admin/lists/${id}`, options),
    adminSubscribe: (id: string, data: UltraFormsPayload, options?: RequestOptions) => this.post(`/admin/lists/${id}/subscribe`, data, options),
    subscribers: (id: string, params?: ModuleQueryParams, options?: RequestOptions) => this.get(`/admin/lists/${id}/subscribers`, params, options),
    updateSubscription: (id: string, subscriptionId: string, data: UltraFormsPayload, options?: RequestOptions) =>
      this.put(`/admin/lists/${id}/subscriptions/${subscriptionId}`, data, options),
    adminUnsubscribe: (id: string, data: UltraFormsPayload, options?: RequestOptions) => this.post(`/admin/lists/${id}/unsubscribe`, data, options),
    adminConfirm: (id: string, data: UltraFormsPayload, options?: RequestOptions) => this.post(`/admin/lists/${id}/confirm`, data, options),
  };

  modules = {
    status: (options?: RequestOptions) => this.get('/module-install/status', undefined, options),
    dryRun: (data?: UltraFormsPayload, options?: RequestOptions) => this.post('/module-install/dry-run', data || {}, options),
    run: (data?: UltraFormsPayload, options?: RequestOptions) => this.post('/module-install/run', data || {}, options),
    list: (params?: ModuleQueryParams, options?: RequestOptions) => this.get('/modules', params, options),
    moduleStatus: (moduleName: string, options?: RequestOptions) => this.get(`/modules/${moduleName}/status`, undefined, options),
    moduleDryRun: (moduleName: string, data?: UltraFormsPayload, options?: RequestOptions) =>
      this.post(`/modules/${moduleName}/dry-run`, data || {}, options),
    moduleRun: (moduleName: string, data?: UltraFormsPayload, options?: RequestOptions) =>
      this.post(`/modules/${moduleName}/run`, data || {}, options),
    registry: (params?: ModuleQueryParams, options?: RequestOptions) => this.get('/module-registry', params, options),
    updateDryRun: (data?: UltraFormsPayload, options?: RequestOptions) => this.post('/module-registry/update/dry-run', data || {}, options),
    update: (data?: UltraFormsPayload, options?: RequestOptions) => this.post('/module-registry/update', data || {}, options),
  };

  embeds = {
    url: (formId: string) => `${this.apiClient.getBaseUrl().replace(/\/+$/, '')}/${this.prefix.replace(/^\/+/, '').replace(/\/+$/, '')}/embed/${formId}`,
    code: (formId: string, options?: RequestOptions) => this.get(`/embed/${formId}/code`, undefined, options),
    previewUrl: (formId: string) => `${this.apiClient.getBaseUrl().replace(/\/+$/, '')}/${this.prefix.replace(/^\/+/, '').replace(/\/+$/, '')}/embed/${formId}/preview`,
  };

  views = {
    formUrl: (formCode: string) => `${this.apiClient.getBaseUrl().replace(/\/+$/, '')}/${this.prefix.replace(/^\/+/, '').replace(/\/+$/, '')}/forms/view/${formCode}`,
    successUrl: (formCode: string) => `${this.apiClient.getBaseUrl().replace(/\/+$/, '')}/${this.prefix.replace(/^\/+/, '').replace(/\/+$/, '')}/forms/view/${formCode}/success`,
    closedUrl: (formCode: string) => `${this.apiClient.getBaseUrl().replace(/\/+$/, '')}/${this.prefix.replace(/^\/+/, '').replace(/\/+$/, '')}/forms/view/${formCode}/closed`,
  };

  saveDraft(data: Partial<FormDraft>, options?: RequestOptions): Promise<ApiResponse<FormDraft>> {
    return this.drafts.save(data, options);
  }

  getDraft(id: string, options?: RequestOptions): Promise<ApiResponse<FormDraft>> {
    return this.drafts.get(id, options);
  }

  updateDraft(id: string, data: Partial<FormDraft>, options?: RequestOptions): Promise<ApiResponse<FormDraft>> {
    return this.drafts.update(id, data, options);
  }

  convertDraft(id: string, options?: RequestOptions): Promise<ApiResponse<FormSubmission>> {
    return this.drafts.convert(id, {}, options);
  }

  listTickets(params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<Ticket[]>> {
    return this.tickets.list(params, options);
  }

  createTicket(data: Partial<Ticket>, options?: RequestOptions): Promise<ApiResponse<Ticket>> {
    return this.tickets.create(data, options);
  }

  listLeads(params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<Lead[]>> {
    return this.leads.list(params, options);
  }

  getEmbedUrl(formId: string): string {
    return this.embeds.url(formId);
  }
}
