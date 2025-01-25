import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
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
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                this.decodeAndSetUserFromToken(token);
            } else {
                delete axios.defaults.headers.common['Authorization'];
                this.user = null;
            }
        },

        decodeAndSetUserFromToken(token) {
            if (!token) {
                this.user = null;
                return;
            }
            try {
                const decoded = jwtDecode(token);
                // 토큰 만료 체크
                if (decoded.exp * 1000 < Date.now()) {
                    this.handleAuthError();
                    return;
                }

                this.user = {
                    email: decoded.sub,
                    userName: decoded.userName,
                    profilePhoto: decoded.profilePhoto,
                    userId: decoded.userId,
                    userRole: decoded.auth
                };
                this.isInitialized = true;
                return true;
            } catch (error) {
                console.error('Token decode failed:', error);
                this.handleAuthError();
            }
        },

        async login(email, password) {
            try {
                console.log('login을 시작합니다.');
                const response = await axios.post(
                    '/user/login',
                    {
                        email,
                        password
                    },
                    {
                        withCredentials: true
                    }
                );

                const accessToken = response.headers['authorization']?.replace('Bearer ', '');
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

                const newAccessToken = response.headers['authorization']?.replace('Bearer ', '');
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
                await axios.post(
                    '/user/logout',
                    {},
                    {
                        withCredentials: true
                    }
                );
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
