// src/stores/googleAuthStore.js
import { defineStore } from 'pinia';
import { googleApi } from '@/api/auth/google';
import { openOAuth2Window, buildOAuth2Url, generateOAuthState } from '@/utils/oauth2';
import { useAuthStore } from './auth';

export const useGoogleAuthStore = defineStore('googleAuth', {
    state: () => ({
        // OAuth 상태
        state: localStorage.getItem('google_oauth_state'),
        stateTimestamp: localStorage.getItem('google_oauth_state_timestamp'),
        authWindow: null,

        // 로딩 상태
        isLoading: false,
        error: null
    }),

    getters: {
        // OAuth state 유효성 검사
        isStateValid: (state) => {
            if (!state.state || !state.stateTimestamp) return false;
            const now = Date.now();
            const stateTime = parseInt(state.stateTimestamp);
            // state는 10분간 유효
            return now - stateTime < 10 * 60 * 1000;
        }
    },

    actions: {
        // OAuth state 생성
        generateState() {
            const state = generateOAuthState();
            const timestamp = Date.now().toString();

            this.state = state;
            this.stateTimestamp = timestamp;

            localStorage.setItem('google_oauth_state', state);
            localStorage.setItem('google_oauth_state_timestamp', timestamp);

            return state;
        },

        // Google OAuth 로그인 초기화
        loginWithGoogle() {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
            const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
            const scope = 'profile';
            const state = this.generateState();

            // 현재 경로 저장 (콜백 후 리디렉션용)
            const currentPath = window.location.pathname + window.location.search;
            localStorage.setItem('google_auth_redirect', currentPath);

            // Google OAuth URL 생성
            const authUrl = buildOAuth2Url({
                authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                clientId,
                redirectUri,
                scope,
                state,
                additionalParams: {
                    response_type: 'code',
                    access_type: 'offline',
                    prompt: 'consent'
                }
            });

            // OAuth2 창 열기
            this.authWindow = openOAuth2Window(authUrl, 'Google_Auth', {
                width: 500,
                height: 600,
                onClose: () => {
                    this.authWindow = null;
                }
            });
        },

        // OAuth 콜백 처리
        async handleAuthCallback(code, returnedState) {
            this.isLoading = true;
            this.error = null;
            const authStore = useAuthStore();

            try {
                // state 검증
                if (!this.isStateValid || returnedState !== this.state) {
                    throw new Error('Invalid state parameter');
                }

                // 백엔드에 코드 전송하여 액세스 토큰 얻기
                const response = await googleApi.getAccessToken(code, returnedState);

                // 인증 스토어에 응답 처리 위임
                const success = await authStore.handleGoogleAuthResponse(response);

                // state 초기화
                this.clearOAuthState();
                return success;
            } catch (error) {
                console.error('Auth error:', error);
                this.error = error.message || 'Authentication failed';
                authStore.handleAuthError(error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // OAuth state 초기화
        clearOAuthState() {
            this.state = null;
            this.stateTimestamp = null;
            localStorage.removeItem('google_oauth_state');
            localStorage.removeItem('google_oauth_state_timestamp');
        },

        // Google 연동 해제
        async revokeAccess() {
            const authStore = useAuthStore();

            if (!authStore.isAuthenticated) return;

            try {
                await googleApi.revokeAccess();
                authStore.logout();
                return true;
            } catch (error) {
                console.error('Error revoking access:', error);
                throw error;
            }
        },

        // 에러 초기화
        clearError() {
            this.error = null;
        }
    }
});
