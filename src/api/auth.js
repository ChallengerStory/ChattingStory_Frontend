// src/api/auth.js
import axios from 'axios';

export const authApi = {
    async login(email, password) {
        const response = await axios.post('/auth/login', { email, password }, { withCredentials: true });
        return {
            accessToken: response.headers.authorization?.replace('Bearer ', ''),
            user: response.data
        };
    },

    async refreshToken() {
        const response = await axios.get('/auth/refresh', {
            withCredentials: true
        });

        return {
            accessToken: response.headers.authorization?.replace('Bearer ', ''),
            user: response.data
        };
    },

    async logout() {
        return await axios.post('/auth/logout', {}, { withCredentials: true });
    },

    async checkEmail(email) {
        return await axios.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
    },

    async sendVerification(email) {
        return await axios.get(`/auth/send-verification?email=${encodeURIComponent(email)}`);
    }
};
