import axios from 'axios';
import { defineStore } from 'pinia';

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
        },

        async login(email, password) {
            try {
                const response = await axios.post('/users/login', { email, password }, { withCredentials: true });

                const accessToken = response.headers.authorization?.replace('Bearer ', '');
                if (!accessToken) {
                    throw new Error('No access token received');
                }

                this.setAccessToken(accessToken);
                return true;
            } catch (error) {
                console.error('Login failed:', error);
                this.handleAuthError();
                return false;
            }
        },

        async initializeAuth() {
            if (this.isInitialized && this.user) return true;

            try {
                const response = await axios.get('/user/refresh', {
                    withCredentials: true
                });

                const newAccessToken = response.headers.authorization?.replace('Bearer ', '');
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
                await axios.post('/users/logout', {}, { withCredentials: true });
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
        }
    }
});
