/**
 * Two-Factor Authentication Service
 *
 * Thin client over the multi-flowless /auth/two_factor/* endpoints.
 * All network calls delegate to ApiClient so session cookies are
 * forwarded automatically.
 */

import { ApiClient } from '../api/client';
import { PubflowInstanceConfig } from '../types';
import type {
    TwoFactorMethod,
    TwoFactorSystemInfo,
    TwoFactorStartResult,
    TwoFactorVerifyResult,
    TwoFactorSetupResult,
    TwoFactorToggleResult,
} from './types';

export class TwoFactorService {
    private apiClient: ApiClient;
    private basePath: string;

    constructor(apiClient: ApiClient, config: PubflowInstanceConfig) {
        this.apiClient = apiClient;
        this.basePath = `${config.authBasePath || '/auth'}/two_factor`;
    }

    // ─── Public (no auth) ──────────────────────────────────────────────────────

    /**
     * GET /auth/two_factor/system
     * Returns system-level 2FA availability (no auth needed).
     */
    async getSystem(): Promise<TwoFactorSystemInfo> {
        const res = await this.apiClient.get<TwoFactorSystemInfo>(
            `${this.basePath}/system`,
            { includeSession: false },
        );
        if (res.success && res.data) return res.data;
        return { global_two_factor_enabled: false, available_methods: [] };
    }

    // ─── User methods ──────────────────────────────────────────────────────────

    /**
     * GET /auth/two_factor/methods
     * Returns the authenticated user's configured 2FA methods.
     */
    async getMethods(): Promise<TwoFactorMethod[]> {
        const res = await this.apiClient.get<{ methods: TwoFactorMethod[] }>(
            `${this.basePath}/methods`,
        );
        if (res.success && res.data) return res.data.methods ?? [];
        return [];
    }

    // ─── Setup ────────────────────────────────────────────────────────────────

    /**
     * POST /auth/two_factor/:method/setup
     * Begin setup for a 2FA method (email or sms).
     */
    async setup(
        method: string,
        identifier: string,
    ): Promise<TwoFactorSetupResult> {
        const res = await this.apiClient.post<TwoFactorSetupResult>(
            `${this.basePath}/${method}/setup`,
            { identifier },
        );
        if (res.success && res.data) return res.data;
        return { success: false, error: res.error || 'Setup failed' };
    }

    // ─── Start / Re-send ───────────────────────────────────────────────────────

    /**
     * POST /auth/two_factor/:method/start
     * (Re-)send a verification code for an existing method.
     * Accepts BOTH active and pending sessions (used during login flow).
     */
    async start(
        methodId: string,
        method: string,
        action: string = 'login',
    ): Promise<TwoFactorStartResult> {
        const res = await this.apiClient.post<TwoFactorStartResult>(
            `${this.basePath}/${method}/start`,
            { method_id: methodId, action },
        );
        if (res.success && res.data) return res.data;
        return { success: false, error: (res as any).error || 'Failed to send code' };
    }

    // ─── Verify ───────────────────────────────────────────────────────────────

    /**
     * POST /auth/two_factor/verify
     * Verify a 2FA code. For action='login' the pending session becomes active.
     */
    async verify(
        methodId: string,
        code: string,
        action: string = 'login',
    ): Promise<TwoFactorVerifyResult> {
        const res = await this.apiClient.post<TwoFactorVerifyResult>(
            `${this.basePath}/verify`,
            { method_id: methodId, code, action },
        );
        if (res.success && res.data) return res.data;
        // The server may return 400 with body even on wrong code — surface it
        return {
            success: false,
            verified: false,
            error: (res as any).error || 'Verification failed',
        };
    }

    // ─── Toggle ───────────────────────────────────────────────────────────────

    /**
     * POST /auth/two_factor/toggle
     * Enable or disable 2FA for the current user.
     */
    async toggle(
        enabled: boolean,
        verificationCode?: string,
        verificationMethodId?: string,
    ): Promise<TwoFactorToggleResult> {
        const res = await this.apiClient.post<TwoFactorToggleResult>(
            `${this.basePath}/toggle`,
            {
                two_factor_enabled: enabled,
                ...(verificationCode && { verification_code: verificationCode }),
                ...(verificationMethodId && { verification_method_id: verificationMethodId }),
            },
        );
        if (res.success && res.data) return res.data;
        return { success: false, error: (res as any).error || 'Toggle failed' };
    }

    // ─── Remove ───────────────────────────────────────────────────────────────

    /**
     * DELETE /auth/two_factor/:id
     * Remove a 2FA method. Requires verification via another active method.
     */
    async removeMethod(
        methodId: string,
        verificationCode: string,
        verificationMethodId: string,
    ): Promise<{ success: boolean; message?: string; error?: string }> {
        const res = await this.apiClient.request<{ success: boolean; message?: string }>(
            `${this.basePath}/${methodId}`,
            'DELETE',
            {
                verification_code: verificationCode,
                verification_method_id: verificationMethodId,
            },
        );
        if (res.success && res.data) return res.data;
        return { success: false, error: (res as any).error || 'Remove failed' };
    }
}
