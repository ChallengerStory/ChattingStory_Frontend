// stores/google/useGoogleAuthStore.js - 개선된 버전
import { defineStore } from 'pinia';
import { googleApi } from '@/api/auth/google';
import { useAuthStore } from '@/stores/auth';
import { openOAuth2Window, buildOAuth2Url, generateOAuthState } from '@/utils/oauth2';

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
                    // 창이 닫힐 때 localStorage 확인
                    this.checkLocalStorageForAuthData();
                }
            });
        },

        // 창이 닫힐 때 localStorage 확인
        checkLocalStorageForAuthData() {
            setTimeout(() => {
                const authDataStr = localStorage.getItem('google_auth_data');
                if (authDataStr) {
                    try {
                        console.log('팝업 창 닫힘 후 인증 데이터 발견됨');
                        // 상위 스토어 처리에서 이미 처리 중이므로 여기서는 로그만 남김
                    } catch (err) {
                        console.error('팝업 창 닫힘 후 데이터 처리 오류:', err);
                    }
                }
            }, 500);
        },

        // OAuth 콜백 처리
        async handleAuthCallback(code, returnedState) {
            this.isLoading = true;
            this.error = null;
            const authStore = useAuthStore();

            console.log('OAuth 콜백 처리 시작');
            console.log('수신된 코드 (일부):', code.substring(0, 10) + '...');
            console.log('수신된 상태:', returnedState);
            console.log('저장된 상태:', this.state);
            console.log('상태 유효성:', this.isStateValid);

            try {
                // state 검증
                if (!this.isStateValid || returnedState !== this.state) {
                    console.error('State 검증 실패!');
                    throw new Error('Invalid state parameter');
                }

                console.log('State 검증 성공, 백엔드로 코드 전송 중...');

                // 백엔드에 코드 전송하여 액세스 토큰 얻기
                const response = await googleApi.getAccessToken(code, returnedState);

                console.log('백엔드 응답 성공 여부:', response.success ? '성공' : '실패');

                if (response.success) {
                    console.log('응답 데이터:', response.data);
                }

                // 인증 스토어에 응답 처리 위임
                console.log('Auth 스토어에 응답 처리 위임 중...');
                const success = await authStore.handleGoogleAuthResponse(response);
                console.log('인증 스토어 처리 결과:', success ? '성공' : '실패');
                console.log('Auth 스토어 상태 (처리 후):', {
                    user: authStore.user,
                    initialized: authStore.isInitialized,
                    authenticated: authStore.isAuthenticated
                });

                // state 초기화
                this.clearOAuthState();
                return success;
            } catch (error) {
                console.error('인증 오류:', error);
                this.error = error.message || 'Authentication failed';
                authStore.handleAuthError(error);
                throw error;
            } finally {
                this.isLoading = false;
                console.log('OAuth 콜백 처리 완료');
            }
        },

        // OAuth state 초기화
        clearOAuthState() {
            this.state = null;
            this.stateTimestamp = null;
            localStorage.removeItem('google_oauth_state');
            localStorage.removeItem('google_oauth_state_timestamp');
        },

        // 에러 초기화
        clearError() {
            this.error = null;
        }
    }
});
