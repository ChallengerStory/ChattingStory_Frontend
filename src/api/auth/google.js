// src/api/auth/google.js
import axios from 'axios';

export const googleApi = {
    // Google OAuth 코드로 액세스 토큰 요청
    // 백엔드는 리프레시 토큰을 HTTP-only 쿠키로 설정하고 액세스 토큰을 응답으로 반환
    async getAccessToken(code, state) {
        try {
            const response = await axios.post('/oauth2/google', { code, state });
            return response.data;
        } catch (error) {
            console.error('Failed to get access token:', error);
            throw error;
        }
    },

    // 구글 연동 해제
    async revokeAccess() {
        try {
            const response = await axios.post('/oauth2/google/revoke');
            return response.data;
        } catch (error) {
            console.error('Failed to revoke access:', error);
            throw error;
        }
    }
};
