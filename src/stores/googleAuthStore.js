// stores/google/useGoogleAuthStore.js
import { defineStore } from 'pinia';
import { googleApi } from '@/api/auth/google';
import { openOAuth2Window, buildOAuth2Url, generateOAuthState } from '@/utils/oauth2';

export const useGoogleAuthStore = defineStore('googleAuth', {
    state: () => ({
        // 인증 관련 상태
        accessToken: localStorage.getItem('google_token') || null,
        userInfo: JSON.parse(localStorage.getItem('google_user_info')) || null,
        isLoading: false,
        error: null,

        // OAuth 상태
        state: localStorage.getItem('google_oauth_state'),
        stateTimestamp: localStorage.getItem('google_oauth_state_timestamp'),
        authWindow: null,

        // 초기화 상태
        isInitialized: false
    }),

    getters: {
        isAuthenticated: (state) => !!state.accessToken,
        username: (state) => state.userInfo?.name,
        email: (state) => state.userInfo?.email,
        profilePicture: (state) => state.userInfo?.picture,
        hasError: (state) => !!state.error,

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

            try {
                // state 검증
                if (!this.isStateValid || returnedState !== this.state) {
                    throw new Error('Invalid state parameter');
                }

                // 백엔드에 코드 전송하여 액세스 토큰 얻기
                const tokenData = await googleApi.getAccessToken(code, returnedState);

                if (tokenData.success) {
                    this.setAccessToken(tokenData.data.access_token);
                    await this.fetchUserInfo();

                    // state 초기화
                    this.clearOAuthState();
                    return true;
                } else {
                    throw new Error('Failed to get access token');
                }
            } catch (error) {
                console.error('Auth error:', error);
                this.error = error.message || 'Authentication failed';
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

        // 액세스 토큰 설정
        setAccessToken(token) {
            this.accessToken = token;
            if (token) {
                localStorage.setItem('google_token', token);
            } else {
                localStorage.removeItem('google_token');
            }
        },

        // Google 사용자 정보 가져오기
        async fetchUserInfo() {
            if (!this.accessToken) {
                throw new Error('No access token available');
            }

            this.isLoading = true;

            try {
                const userData = await googleApi.getUserInfo(this.accessToken);
                this.userInfo = userData;
                localStorage.setItem('google_user_info', JSON.stringify(userData));
                return userData;
            } catch (error) {
                console.error('Error fetching user info:', error);
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // Google 연동 해제
        async revokeAccess() {
            if (!this.accessToken) return;

            try {
                await googleApi.revokeAccess();
                this.logout();
                return true;
            } catch (error) {
                console.error('Error revoking access:', error);
                throw error;
            }
        },

        // 로그아웃
        logout() {
            this.accessToken = null;
            this.userInfo = null;
            this.error = null;
            this.clearOAuthState();
            localStorage.removeItem('google_token');
            localStorage.removeItem('google_user_info');
        },

        // 에러 초기화
        clearError() {
            this.error = null;
        },

        // 초기화 상태 설정
        setInitialized() {
            this.isInitialized = true;
        },

        // 사용자 데이터 검증
        verifyUserData() {
            const hasStoreData = !!this.userInfo && !!this.accessToken;
            const hasLocalStorage = !!localStorage.getItem('google_user_info') && !!localStorage.getItem('google_token');

            // 로컬 스토리지에서 복구 시도
            if (!this.userInfo && localStorage.getItem('google_user_info')) {
                try {
                    this.userInfo = JSON.parse(localStorage.getItem('google_user_info'));
                } catch (e) {
                    console.error('Error parsing stored user info:', e);
                }
            }

            if (!this.accessToken && localStorage.getItem('google_token')) {
                this.accessToken = localStorage.getItem('google_token');
            }

            return {
                hasStoreData,
                hasLocalStorage
            };
        }
    }
});
