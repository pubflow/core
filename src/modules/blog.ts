import { ApiResponse, RequestOptions } from '../api/types';
import { ModuleClient, ModuleQueryParams } from './utils';

export interface BlogPost {
  id: string;
  slug?: string;
  title?: string;
  body?: any;
  excerpt?: string;
  status?: 'draft' | 'published' | string;
  visibility?: 'public' | 'auth' | 'private' | 'password' | string;
  lang?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug?: string;
  lang?: string;
  [key: string]: any;
}

export interface BlogTag {
  id: string;
  name: string;
  slug?: string;
  [key: string]: any;
}

export interface BlogComment {
  id: string;
  post_id?: string;
  comment_body?: string;
  status?: string;
  [key: string]: any;
}

export class BlogClient extends ModuleClient {
  listPosts(params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<BlogPost[]>> {
    return this.get<BlogPost[]>('', params, options);
  }

  createPost(data: Partial<BlogPost>, options?: RequestOptions): Promise<ApiResponse<BlogPost>> {
    return this.post<BlogPost>('', data, options);
  }

  getPostById(id: string, options?: RequestOptions): Promise<ApiResponse<BlogPost>> {
    return this.get<BlogPost>(`/id/${id}`, undefined, options);
  }

  getPost(slug: string, params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<BlogPost>> {
    return this.get<BlogPost>(`/${slug}`, params, options);
  }

  updatePost(id: string, data: Partial<BlogPost>, options?: RequestOptions): Promise<ApiResponse<BlogPost>> {
    return this.put<BlogPost>(`/${id}`, data, options);
  }

  publishPost(id: string, options?: RequestOptions): Promise<ApiResponse<BlogPost>> {
    return this.post<BlogPost>(`/${id}/publish`, {}, options);
  }

  unpublishPost(id: string, options?: RequestOptions): Promise<ApiResponse<BlogPost>> {
    return this.post<BlogPost>(`/${id}/unpublish`, {}, options);
  }

  schedulePost(id: string, scheduledAt: string, options?: RequestOptions): Promise<ApiResponse<BlogPost>> {
    return this.post<BlogPost>(`/${id}/schedule`, { scheduled_at: scheduledAt }, options);
  }

  listCategories(params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<BlogCategory[]>> {
    return this.get<BlogCategory[]>('/categories', params, options);
  }

  createCategory(data: Partial<BlogCategory>, options?: RequestOptions): Promise<ApiResponse<BlogCategory>> {
    return this.post<BlogCategory>('/categories', data, options);
  }

  listTags(params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<BlogTag[]>> {
    return this.get<BlogTag[]>('/tags', params, options);
  }

  createTag(data: Partial<BlogTag>, options?: RequestOptions): Promise<ApiResponse<BlogTag>> {
    return this.post<BlogTag>('/tags', data, options);
  }

  listComments(postId: string, params?: ModuleQueryParams, options?: RequestOptions): Promise<ApiResponse<BlogComment[]>> {
    return this.get<BlogComment[]>(`/${postId}/comments`, params, options);
  }

  createComment(postId: string, data: Partial<BlogComment>, options?: RequestOptions): Promise<ApiResponse<BlogComment>> {
    return this.post<BlogComment>(`/${postId}/comments`, data, options);
  }

  getReactions(postId: string, options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.get<any>(`/${postId}/reactions`, undefined, options);
  }

  react(postId: string, reactionType: string, options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.post<any>(`/${postId}/reactions`, { reaction_type: reactionType }, options);
  }

  bookmark(postId: string, options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.post<any>(`/${postId}/bookmark`, {}, options);
  }

  removeBookmark(postId: string, options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.delete<any>(`/${postId}/bookmark`, options);
  }

  trackView(postId: string, options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.post<any>(`/${postId}/view`, {}, options);
  }

  getStats(postId: string, options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.get<any>(`/${postId}/stats`, undefined, options);
  }

  listTranslations(postId: string, options?: RequestOptions): Promise<ApiResponse<BlogPost[]>> {
    return this.get<BlogPost[]>(`/id/${postId}/translations`, undefined, options);
  }
}
