// src/stores/auth.js
import { defineStore } from 'pinia';
import { authApi } from '../api/auth/auth';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: null,
        isInitialized: false,
        userIdentifier: localStorage.getItem('user_identifier') || null,
        profileUrl: localStorage.getItem('profile_url') || null,
        isLoading: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.accessToken,
        hasUserProfile: (state) => !!state.userIdentifier && !!state.profileUrl
    },

    actions: {
        setAccessToken(token) {
            this.accessToken = token;
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } else {
                delete axios.defaults.headers.common['Authorization'];
            }
        },

        setUserProfile(userIdentifier, profileUrl) {
            this.userIdentifier = userIdentifier;
            this.profileUrl = profileUrl;

            // Store in localStorage for persistence
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
                // The refresh token is sent automatically as an HTTP-only cookie
                const response = await authApi.refreshToken();

                if (response.success) {
                    const { access_token, user_identifier, profile_url } = response.data;

                    this.setAccessToken(access_token);
                    this.setUserProfile(user_identifier, profile_url);
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
            if (!response || !response.success) {
                throw new Error(response?.error || 'Authentication failed');
            }
            console.log(response);
            const { access_token, user_identifier, profile_url } = response.data;

            // Set access token for API calls
            this.setAccessToken(access_token);

            // Store user identifier and profile
            this.setUserProfile(user_identifier, profile_url);

            // Note: refresh_token is handled by the backend as an HTTP-only cookie
            this.isInitialized = true;

            return true;
        },

        async logout() {
            this.isLoading = true;

            try {
                // This should clear the HTTP-only cookie on the server
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
            this.setUserProfile(null, null);
            this.isInitialized = false;
            delete axios.defaults.headers.common['Authorization'];
        },

        clearError() {
            this.error = null;
        }
    }
});
