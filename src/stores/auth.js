// src/stores/auth.js
import { defineStore } from 'pinia';
import { authApi } from '../api/auth';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: null,
        isInitialized: false,
        user: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.accessToken
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

        async login(email, password) {
            try {
                const { accessToken, user } = await authApi.login(email, password);

                if (!accessToken) {
                    throw new Error('No access token received');
                }

                this.setAccessToken(accessToken);
                this.user = user;
                this.isInitialized = true;

                return true;
            } catch (error) {
                this.handleAuthError(error);
                return false;
            }
        },

        async initializeAuth() {
            if (this.isInitialized && this.user) return true;

            try {
                const { accessToken, user } = await authApi.refreshToken();

                if (accessToken) {
                    this.setAccessToken(accessToken);
                    this.user = user;
                    this.isInitialized = true;
                    return true;
                }
                return false;
            } catch (error) {
                this.handleAuthError(error);
                return false;
            }
        },

        async logout() {
            try {
                await authApi.logout();
            } catch (error) {
                console.error('Logout failed:', error);
            } finally {
                this.handleAuthError();
            }
        },

        async checkEmail(email) {
            try {
                return await authApi.checkEmail(email);
            } catch (error) {
                this.handleAuthError(error);
                throw error;
            }
        },

        async sendVerification(email) {
            try {
                return await authApi.sendVerification(email);
            } catch (error) {
                console.error('Send verification failed:', error);
                throw error;
            }
        },

        handleAuthError(error) {
            if (error) {
                console.error('Auth error:', error);
            }
            this.accessToken = null;
            this.user = null;
            this.isInitialized = false;
            delete axios.defaults.headers.common['Authorization'];
        }
    }
});
