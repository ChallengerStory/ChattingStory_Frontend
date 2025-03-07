// src/api/auth/auth.js
import axios from 'axios';

export const authApi = {
    // 토큰 갱신 - 서버가 HTTP-only 쿠키를 확인하고 새 토큰 반환
    async refreshToken() {
        try {
            const response = await axios.get('/auth/refresh');
            return response.data;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    },

    // 로그아웃 - 서버에서 HTTP-only 쿠키 제거
    async logout() {
        try {
            const response = await axios.post('/auth/logout');
            return response.data;
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }
};
