<!-- src/components/GoogleAuthCallback.vue -->
<template>
    <div class="oauth-callback">
        <div v-if="isLoading" class="loading">
            <div class="spinner"></div>
            <p>Google 계정으로 로그인 중...</p>
        </div>
        <div v-else-if="error" class="error">
            <p>{{ error }}</p>
            <button @click="goToLogin" class="btn">로그인 페이지로 돌아가기</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useGoogleAuthStore } from '@/stores/googleAuthStore';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const googleAuthStore = useGoogleAuthStore();
const authStore = useAuthStore();

const isLoading = ref(true);
const error = ref('');

// 로그인 페이지로 이동
const goToLogin = () => {
    router.push('/login');
};

onMounted(async () => {
    try {
        // URL에서 코드와 상태 파라미터 추출
        const code = route.query.code;
        const state = route.query.state;

        if (!code || !state) {
            throw new Error('인증 파라미터가 누락되었습니다.');
        }

        // 콜백 처리 전 콘솔에 로그
        console.log('콜백 처리 시작:', { code: code.substring(0, 10) + '...', state });

        // 콜백 처리
        const success = await googleAuthStore.handleAuthCallback(code, state);

        console.log('콜백 처리 결과:', success);
        console.log('Auth Store 상태:', {
            initialized: authStore.isInitialized,
            user: authStore.user,
            token: authStore.accessToken ? '존재함' : '없음'
        });

        if (success) {
            // 토큰 정보 디버깅
            console.log('Access Token 존재 여부:', !!authStore.accessToken);

            // 인증 데이터를 localStorage에 저장
            const authData = {
                type: 'GOOGLE_AUTH_SUCCESS',
                timestamp: Date.now(),
                userId: authStore.user.userId,
                userIdentifier: authStore.user.userIdentifier,
                profileUrl: authStore.user.profileUrl,
                accessToken: authStore.accessToken,
                isAuthenticated: authStore.isAuthenticated,
                isInitialized: authStore.isInitialized
            };

            localStorage.setItem('google_auth_data', JSON.stringify(authData));
            console.log('인증 데이터 localStorage에 저장됨:', authData);

            // 추가 디버깅용 정보
            localStorage.setItem('callback_token_status', authStore.accessToken ? 'token_exists' : 'no_token');

            // 창 닫기 전 지연
            setTimeout(() => {
                window.close();
            }, 1000);
        }
    } catch (err) {
        error.value = `인증 오류: ${err.message}`;
        console.error('Google OAuth 콜백 오류:', err);

        // 오류 정보 저장
        localStorage.setItem(
            'google_auth_error',
            JSON.stringify({
                timestamp: Date.now(),
                error: err.message
            })
        );

        setTimeout(() => {
            window.close();
        }, 3000); // 오류 메시지 확인할 시간 제공
    } finally {
        isLoading.value = false;
    }
});
</script>

<style scoped>
.oauth-callback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
    padding: 0 20px;
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #4285f4; /* Google 블루 */
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.error {
    color: #d32f2f;
    max-width: 400px;
}

.btn {
    background-color: #4285f4;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 20px;
    font-weight: 500;
}

.btn:hover {
    background-color: #3367d6;
}
</style>
