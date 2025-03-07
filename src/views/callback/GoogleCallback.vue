<!-- src/components/GoogleAuthCallback.vue -->
<template>
    <div class="oauth-callback">
        <div v-if="isLoading" class="loading">
            <div class="spinner"></div>
            <p>인증 정보 처리 중...</p>
        </div>
        <div v-else-if="error" class="error">
            <p>{{ error }}</p>
        </div>
        <div v-else class="success">
            <p>인증이 완료되었습니다. 이 창은 자동으로 닫힙니다.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isLoading = ref(true);
const error = ref('');

onMounted(async () => {
    try {
        // URL에서 코드와 상태 파라미터 추출
        const code = route.query.code;
        const state = route.query.state;

        if (!code || !state) {
            throw new Error('인증 파라미터가 누락되었습니다.');
        }

        // 콜백 처리 전 콘솔에 로그
        console.log('콜백 수신:', { code: code.substring(0, 10) + '...', state });

        // 로컬 스토리지에 인증 정보 저장 (메인 창에서 처리하기 위함)
        localStorage.setItem('google_auth_code', code);
        localStorage.setItem('google_auth_state', state);

        // 메인 창에서 처리할 시간을 주기 위해 잠시 대기
        setTimeout(() => {
            isLoading.value = false;

            // 창 닫기 전 로컬스토리지에 플래그 설정 및 opener에게 알림
            setTimeout(() => {
                localStorage.setItem('google_auth_completed', 'true');
                // 창을 연 부모 창의 함수 호출 (COOP 우회)
                if (window.opener && window.opener.handlePopupClosed) {
                    try {
                        window.opener.handlePopupClosed();
                    } catch (e) {
                        console.error('부모 창 접근 오류:', e);
                    }
                }
                window.close();
            }, 1000);
        }, 1500);
    } catch (err) {
        error.value = `인증 오류: ${err.message}`;
        console.error('Google OAuth 콜백 오류:', err);

        // 오류 발생 시 더 오래 대기 후 창 닫기
        setTimeout(() => {
            window.close();
        }, 3000);
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

.loading,
.success,
.error {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 400px;
}

.success {
    color: #4caf50;
}

.error {
    color: #d32f2f;
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
</style>
