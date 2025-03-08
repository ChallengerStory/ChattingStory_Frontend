// src/stores/authStore.js
import { defineStore } from 'pinia';
import { googleApi } from '../api/auth/google';
import { authApi } from '../api/auth/auth'; // Import the authApi
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: null,
        isInitialized: false,
        isLoading: false,
        error: null,
        user: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.accessToken
        // hasUserProfile: (state) => !!state.user && !!state.user.profile_url
    },

    actions: {
        setAccessToken(accessToken) {
            this.accessToken = accessToken;
        },
        async initializeAuth() {
            if (this.isInitialized && this.user) return true;

            try {
                // Use authApi instead of direct axios call
                const response = await authApi.refreshToken();

                this.user = response.data;
                this.isInitialized = true;
                const newAccessToken = response.headers?.['authorization']?.replace('Bearer ', '');
                if (newAccessToken) {
                    this.setAccessToken(newAccessToken);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Auth initialization failed:', error);
                this.handleAuthError();
                return false;
            }
        },
        async logout() {
            try {
                // Use authApi instead of direct axios call
                await authApi.logout();
            } catch (error) {
                console.error('Logout failed:', error);
            } finally {
                this.handleAuthError();
            }
        },

        handleAuthError() {
            this.accessToken = null;
            this.user = null;
            this.isInitialized = false;
            delete axios.defaults.headers.common['Authorization'];
        },

        async handleGoogleCallback(code, state) {
            this.isLoading = true;
            this.error = null;

            try {
                console.log('Google 콜백 처리 시작', { code: code.substring(0, 10) + '...', state });

                // 백엔드 API 호출하여 액세스 토큰 받기
                const response = await googleApi.getAccessToken(code, state);
                console.log(response);

                this.user = response.data;
                const access_token = response.headers['authorization']?.replace('Bearer ', '');

                if (!access_token) {
                    throw new Error('응답에 액세스 토큰이 없습니다.');
                }

                // 액세스 토큰 설정
                this.setAccessToken(access_token);

                // 사용자 정보 초기화
                await this.initializeAuth();

                return true;
            } catch (error) {
                console.error('Google 인증 콜백 처리 오류:', error);
                this.handleAuthError(error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        }
    }
});
