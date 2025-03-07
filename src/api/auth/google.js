// src/api/auth/google.js
import axios from 'axios';
export const googleApi = {
    // Google OAuth 코드로 액세스 토큰 요청
    // 백엔드는 리프레시 토큰을 HTTP-only 쿠키로 설정하고 액세스 토큰을 응답으로 반환
    async getAccessToken(code, state) {
        try {
            console.log('Google OAuth 토큰 요청 시작');
            // withCredentials 설정으로 쿠키를 받을 수 있음
            const response = await axios.post('/oauth2/google', { code, state }, { withCredentials: true });

            console.log('Google OAuth 응답 성공:', response.data.success);

            // 토큰 응답 확인
            if (response.data.success && response.data.data?.access_token) {
                console.log('액세스 토큰 수신 확인');
            } else {
                console.warn('액세스 토큰 누락 또는 응답 형식 오류');
            }

            return response;
        } catch (error) {
            console.error('Google OAuth 토큰 요청 실패:', error);
            throw error;
        }
    },

    // 구글 연동 해제
    async revokeAccess() {
        try {
            console.log('Google 연동 해제 요청 시작');
            const response = await axios.post('/oauth2/google/revoke', {}, { withCredentials: true });

            console.log('Google 연동 해제 성공');
            return response.data;
        } catch (error) {
            console.error('Google 연동 해제 실패:', error);
            throw error;
        }
    }
};
