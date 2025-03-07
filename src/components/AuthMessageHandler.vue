<!-- src/components/AuthMessageHandler.vue -->
<template>
    <!-- 이 컴포넌트는 UI가 없는 로직 전용 컴포넌트입니다 -->
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const lastCheckedTimestamp = ref(Date.now());
const pollInterval = ref(null);

// localStorage를 통한 인증 데이터 확인
const checkForAuthData = () => {
    try {
        const authDataString = localStorage.getItem('auth_popup_data');
        if (!authDataString) return;

        const authData = JSON.parse(authDataString);

        // 이미 처리한 데이터인지 확인 (타임스탬프 비교)
        if (!authData.timestamp || authData.timestamp <= lastCheckedTimestamp.value) {
            return;
        }

        // 타임스탬프 업데이트
        lastCheckedTimestamp.value = authData.timestamp;

        console.log('Auth data found in localStorage:', authData);

        // 인증 성공 데이터 처리
        if (authData.type === 'GOOGLE_AUTH_SUCCESS') {
            const { userId, userIdentifier, profileUrl } = authData;

            // 유저 정보가 있는지 확인
            if (userIdentifier) {
                console.log('Updating auth store with:', { userId, userIdentifier, profileUrl });

                // authStore 업데이트
                authStore.setUserProfile(userId, userIdentifier, profileUrl);

                // 인증 상태 설정
                authStore.isInitialized = true;

                // 사용한 데이터 삭제 (보안을 위해)
                localStorage.removeItem('auth_popup_data');

                console.log('Auth store updated successfully');

                // 성공적으로 처리되면 이벤트 발생 (필요한 경우)
                const event = new CustomEvent('auth:login-success', {
                    detail: { userId, userIdentifier }
                });
                window.dispatchEvent(event);
            }
        }

        // 인증 오류 데이터 처리
        if (authData.type === 'GOOGLE_AUTH_ERROR') {
            console.error('Authentication error:', authData.error);

            // 오류 처리
            authStore.error = authData.error;

            // 사용한 데이터 삭제
            localStorage.removeItem('auth_popup_data');

            // 오류 이벤트 발생 (필요한 경우)
            const event = new CustomEvent('auth:login-error', {
                detail: { error: authData.error }
            });
            window.dispatchEvent(event);
        }
    } catch (e) {
        console.error('Error processing auth data from localStorage:', e);
    }
};

onMounted(() => {
    // 즉시 한 번 확인
    checkForAuthData();

    // 주기적으로 localStorage 확인 (300ms 간격)
    pollInterval.value = setInterval(checkForAuthData, 300);
    console.log('Auth data polling started');
});

onUnmounted(() => {
    // 컴포넌트 언마운트 시 polling 중지
    if (pollInterval.value) {
        clearInterval(pollInterval.value);
        console.log('Auth data polling stopped');
    }
});
</script>
