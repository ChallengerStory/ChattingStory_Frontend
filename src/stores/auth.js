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
            this.accessToken = token;
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } else {
                delete axios.defaults.headers.common['Authorization'];
            }
        },

        setUserProfile(userId, userIdentifier, profileUrl) {
            this.user = {
                userId,
                userIdentifier,
                profileUrl
            };

            // Store in localStorage for persistence
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
                // The refresh token is sent automatically as an HTTP-only cookie
                const response = await authApi.refreshToken();

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

            // Validate required fields
            if (!access_token) {
                console.error('Missing access token in response');
                throw new Error('Missing access token in response');
            }

            if (!user_identifier) {
                console.error('Missing user identifier in response');
                throw new Error('Missing user identifier in response');
            }

            // Set access token for API calls
            console.log('Setting access token (partial):', access_token ? access_token.substring(0, 10) + '...' : 'NULL');
            this.setAccessToken(access_token);

            // Store user identifier and profile
            console.log('Setting user profile:', { user_id, user_identifier, profile_url });
            this.setUserProfile(user_id, user_identifier, profile_url);

            // Note: refresh_token is handled by the backend as an HTTP-only cookie
            console.log('Setting authentication initialized');
            this.isInitialized = true;

            console.log('Google Auth response successfully processed');
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
            this.setUserProfile(null, null, null);
            this.isInitialized = false;
            delete axios.defaults.headers.common['Authorization'];
        },

        clearError() {
            this.error = null;
        }
    }
});
