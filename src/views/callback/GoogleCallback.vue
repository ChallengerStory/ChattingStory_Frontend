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

        // 콜백 처리
        const success = await googleAuthStore.handleAuthCallback(code, state);

        if (success) {
            // 저장된 리디렉션 경로로 이동 (또는 기본 경로)
            const redirectPath = localStorage.getItem('google_auth_redirect') || '/';
            localStorage.removeItem('google_auth_redirect');

            // 창을 닫거나 리디렉션
            if (window.opener) {
                try {
                    console.log('Authentication successful, preparing to send data to parent window');

                    // COOP 정책으로 인해 postMessage가 차단될 수 있으므로 localStorage를 통한 통신 방식 사용
                    const authData = {
                        type: 'GOOGLE_AUTH_SUCCESS',
                        timestamp: Date.now(),
                        userId: authStore.user.userId,
                        userIdentifier: authStore.user.userIdentifier,
                        profileUrl: authStore.user.profileUrl
                    };

                    // localStorage에 인증 데이터 저장 (메인 창에서 polling으로 확인)
                    localStorage.setItem('auth_popup_data', JSON.stringify(authData));
                    console.log('Auth data stored in localStorage for parent window');

                    // 창 닫기 전 약간의 지연
                    setTimeout(() => {
                        window.close();
                    }, 300);
                } catch (e) {
                    console.error('인증 데이터 저장 오류:', e);
                    window.close();
                }
            } else {
                // 일반 리디렉션인 경우
                console.log('No parent window found, redirecting to:', redirectPath);
                router.push(redirectPath);
            }
        }
    } catch (err) {
        error.value = `인증 오류: ${err.message}`;
        console.error('Google OAuth 콜백 오류:', err);

        // 오류가 발생해도 부모 창에 알림
        if (window.opener) {
            try {
                console.log('Authentication failed, storing error in localStorage for parent window');

                // localStorage를 통한 오류 전달
                localStorage.setItem(
                    'auth_popup_data',
                    JSON.stringify({
                        type: 'GOOGLE_AUTH_ERROR',
                        timestamp: Date.now(),
                        error: err.message
                    })
                );

                // 지연 후 창 닫기
                setTimeout(() => {
                    window.close();
                }, 300);
            } catch (e) {
                console.error('오류 메시지 저장 실패:', e);
                window.close();
            }
        }
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
