// src/api/auth/auth.js
import axios from 'axios';

export const authApi = {
    // 토큰 갱신 - 서버가 HTTP-only 쿠키를 확인하고 새 토큰 반환
    async refreshToken() {
        try {
            console.log('토큰 갱신 요청 시작');
            const response = await axios.get(
                '/auth/refresh',
                {},
                { withCredentials: true } // HTTP-only 쿠키 전송을 위해 필요
            );

            console.log('토큰 갱신 응답 성공:', response.data.success);
            return response;
        } catch (error) {
            console.error('토큰 갱신 실패:', error);
            throw error;
        }
    },

    // 로그아웃 - 서버에서 HTTP-only 쿠키 제거
    async logout() {
        try {
            console.log('로그아웃 요청 시작');
            const response = await axios.post(
                '/auth/logout',
                {},
                { withCredentials: true } // HTTP-only 쿠키 전송을 위해 필요
            );

            console.log('로그아웃 응답 성공');
            return response.data;
        } catch (error) {
            console.error('로그아웃 실패:', error);
            throw error;
        }
    }
};
