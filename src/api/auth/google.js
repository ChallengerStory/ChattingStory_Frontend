// src/api/google.js
import axios from 'axios';

export const googleApi = {
    /**
     * Google에서 액세스 토큰 요청
     * @param {string} code - 인증 코드
     * @param {string} state - OAuth 상태 값
     * @returns {Promise<Object>} 액세스 토큰 응답
     */
    async getAccessToken(code, state) {
        const response = await axios.post('/oauth2/google', {
            code,
            state
        });
        const data = response.data;
        console.log(data);
        return data;
    },

    /**
     * Google 연동 해제
     * @returns {Promise<Object>} 응답 데이터
     */
    async revokeAccess() {
        return await axios.delete('user/oauth2/google/revoke');
    }
};
