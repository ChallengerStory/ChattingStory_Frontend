<!-- src/components/AuthHandler.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const interval = ref(null);
const lastTimestamp = ref(0);

// localStorage에서 인증 데이터 확인
const checkAuthData = () => {
    try {
        // 인증 성공 데이터 확인
        const authDataStr = localStorage.getItem('google_auth_data');
        if (authDataStr) {
            const authData = JSON.parse(authDataStr);

            if (authData.timestamp > lastTimestamp.value) {
                console.log('인증 데이터 발견:', authData);
                lastTimestamp.value = authData.timestamp;

                // AuthStore 업데이트
                if (authData.userIdentifier) {
                    // 1. 액세스 토큰 설정
                    if (authData.accessToken) {
                        console.log('메인 창에서 액세스 토큰 설정:', authData.accessToken.substring(0, 15) + '...');
                        authStore.setAccessToken(authData.accessToken);
                        localStorage.setItem('token_sync_status', 'success');
                    } else {
                        console.warn('액세스 토큰이 전달되지 않음');
                        localStorage.setItem('token_sync_status', 'missing_token');
                    }

                    // 2. 사용자 정보 설정
                    authStore.setUserProfile(authData.userId, authData.userIdentifier, authData.profileUrl);

                    // 3. 인증 상태 업데이트
                    authStore.isInitialized = true;

                    console.log('메인 창에서 Auth Store 업데이트됨:', {
                        user: authStore.user,
                        isInitialized: authStore.isInitialized,
                        isAuthenticated: authStore.isAuthenticated
                    });

                    // 데이터 처리 후 삭제
                    localStorage.removeItem('google_auth_data');

                    // 설정 확인을 위한 추가 저장
                    localStorage.setItem('auth_updated_in_main', 'true');

                    // 필요시 리다이렉트
                    const redirectPath = localStorage.getItem('google_auth_redirect');
                    if (redirectPath) {
                        console.log('리다이렉트 경로로 이동:', redirectPath);
                        router.push(redirectPath);
                        localStorage.removeItem('google_auth_redirect');
                    }
                }
            }
        }

        // 오류 데이터 확인
        const errorDataStr = localStorage.getItem('google_auth_error');
        if (errorDataStr) {
            const errorData = JSON.parse(errorDataStr);
            console.error('인증 오류 발견:', errorData);

            authStore.error = errorData.error;
            localStorage.removeItem('google_auth_error');
        }
    } catch (e) {
        console.error('인증 데이터 처리 오류:', e);
        localStorage.setItem('auth_error_processing', e.message);
    }
};

onMounted(() => {
    // 이미 저장된 데이터가 있는지 바로 확인
    checkAuthData();

    // 주기적으로 확인
    interval.value = setInterval(checkAuthData, 500);
    console.log('인증 데이터 감시자 시작됨');

    // 디버깅용: 토큰 동기화 시작 표시
    localStorage.setItem('auth_listener_started', 'true');
});

onUnmounted(() => {
    if (interval.value) {
        clearInterval(interval.value);
        console.log('인증 데이터 감시자 중지됨');
    }
});
</script>

<template>
    <!-- 인증 데이터 감시용 숨겨진 컴포넌트 -->
</template>
