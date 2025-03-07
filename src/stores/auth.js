// src/stores/auth.js
import { defineStore } from 'pinia';
import { authApi } from '../api/auth/auth';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: null,
        isInitialized: false,
        isLoading: false,
        error: null,
        user: {
            userId: localStorage.getItem('user_id') || null,
            userIdentifier: localStorage.getItem('user_identifier') || null,
            profileUrl: localStorage.getItem('profile_url') || null
        }
    }),

    getters: {
        isAuthenticated: (state) => !!state.accessToken,
        hasUserProfile: (state) => !!state.user.userIdentifier && !!state.user.profileUrl,
        userId: (state) => state.user.userId,
        userIdentifier: (state) => state.user.userIdentifier,
        profileUrl: (state) => state.user.profileUrl
    },

    actions: {
        setAccessToken(token) {
            console.log('Setting access token:', token ? `${token.substring(0, 15)}...` : 'null');
            this.accessToken = token;

            if (token) {
                // API 요청 헤더에 토큰 설정
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // 필요시 localStorage에 저장 (선택사항, 보안 주의)
                // localStorage.setItem('access_token', token);
            } else {
                delete axios.defaults.headers.common['Authorization'];
                // localStorage.removeItem('access_token');
            }
        },

        setUserProfile(userId, userIdentifier, profileUrl) {
            console.log('Setting user profile:', { userId, userIdentifier, profileUrl });

            this.user = {
                userId,
                userIdentifier,
                profileUrl
            };

            // 사용자 정보 localStorage에 저장
            if (userId) {
                localStorage.setItem('user_id', userId);
            } else {
                localStorage.removeItem('user_id');
            }

            if (userIdentifier) {
                localStorage.setItem('user_identifier', userIdentifier);
            } else {
                localStorage.removeItem('user_identifier');
            }

            if (profileUrl) {
                localStorage.setItem('profile_url', profileUrl);
            } else {
                localStorage.removeItem('profile_url');
            }
        },

        async initializeAuth() {
            if (this.isInitialized && this.accessToken) return true;

            this.isLoading = true;

            try {
                // 리프레시 토큰은 HTTP-only 쿠키로 자동 전송됨
                const response = await authApi.refreshToken();
                console.log('Refresh token response:', response);

                if (response.success) {
                    const { user_id, user_identifier, access_token, profile_url } = response.data;

                    this.setAccessToken(access_token);
                    this.setUserProfile(user_id, user_identifier, profile_url);
                    this.isInitialized = true;
                    return true;
                }
                return false;
            } catch (error) {
                this.handleAuthError(error);
                return false;
            } finally {
                this.isLoading = false;
            }
        },

        async handleGoogleAuthResponse(response) {
            console.log('Auth store processing Google response');

            if (!response || !response.success) {
                console.error('Invalid or unsuccessful response:', response);
                throw new Error(response?.error || 'Authentication failed');
            }

            console.log('Response is valid, extracting data');
            console.log('Response data keys:', Object.keys(response.data));

            const { user_id, user_identifier, access_token, profile_url } = response.data;

            if (!access_token) {
                console.error('Missing access token in response');
                throw new Error('Missing access token in response');
            }

            // 액세스 토큰 설정 (API 요청 헤더에 사용)
            console.log('Setting access token (partial):', access_token.substring(0, 15) + '...');
            this.setAccessToken(access_token);

            // LocalStorage에 토큰 상태 저장 (디버깅용)
            localStorage.setItem('access_token_set', 'true');

            // 사용자 정보 설정
            console.log('Setting user profile:', { user_id, user_identifier, profile_url });
            this.setUserProfile(user_id, user_identifier, profile_url);

            // 인증 초기화 상태 설정
            console.log('Setting authentication initialized');
            this.isInitialized = true;

            // 인증 성공시 로컬스토리지에 정보를 저장하여 메인 창으로 전달
            localStorage.setItem(
                'google_auth_data',
                JSON.stringify({
                    type: 'GOOGLE_AUTH_SUCCESS',
                    timestamp: Date.now(),
                    userId: user_id,
                    userIdentifier: user_identifier,
                    profileUrl: profile_url,
                    accessToken: access_token
                })
            );

            console.log('Google Auth response successfully processed');
            return true;
        },

        async logout() {
            this.isLoading = true;

            try {
                // 서버 측에서 HTTP-only 쿠키 제거
                await authApi.logout();
            } catch (error) {
                console.error('Logout failed:', error);
            } finally {
                this.handleAuthError();
                this.isLoading = false;
            }
        },

        handleAuthError(error) {
            if (error) {
                console.error('Auth error:', error);
                this.error = error.message || 'Authentication failed';
            }

            this.accessToken = null;
            this.setUserProfile(null, null, null);
            this.isInitialized = false;
            delete axios.defaults.headers.common['Authorization'];

            // 디버깅용 로컬스토리지 상태 업데이트
            localStorage.setItem('auth_error', error ? error.message : 'Logged out');
        },

        clearError() {
            this.error = null;
        }
    }
});
