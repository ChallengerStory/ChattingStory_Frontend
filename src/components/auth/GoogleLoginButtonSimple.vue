<!-- src/components/GoogleLoginButton.vue -->
<template>
    <Button icon="pi pi-google" text rounded @click="openGoogleAuth" :disabled="isLoading" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { generateOAuthState, buildOAuth2Url, openOAuth2Window } from '@/utils/oauth2';

const authStore = useAuthStore();
const isLoading = ref(false);

// 인증 콜백 리스너 설정
const setupAuthListener = () => {
    window.addEventListener('storage', handleStorageChange);
};

// localStorage 변경 감지 핸들러
const handleStorageChange = async (event) => {
    // google_auth_code와 google_auth_state가 설정된 경우에만 처리
    if (event.key === 'google_auth_code') {
        const code = localStorage.getItem('google_auth_code');
        const state = localStorage.getItem('google_auth_state');

        if (code && state) {
            try {
                isLoading.value = true;

                // 로컬스토리지에서 인증 데이터 가져오기
                console.log('인증 데이터 감지:', { code: code.substring(0, 10) + '...', state });

                // 인증 처리
                await authStore.handleGoogleCallback(code, state);

                // 처리 후 로컬스토리지 데이터 삭제
                localStorage.removeItem('google_auth_code');
                localStorage.removeItem('google_auth_state');
            } catch (error) {
                console.error('OAuth 인증 처리 오류:', error);
            } finally {
                isLoading.value = false;
            }
        }
    }
};

// Google 인증 창 열기
const openGoogleAuth = () => {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
        // 인증 상태 생성
        const state = generateOAuthState();

        // 환경 변수에서 OAuth 설정 가져오기
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
        const scope = 'profile email';

        // OAuth URL 생성
        const authUrl = buildOAuth2Url({
            authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            clientId,
            redirectUri,
            scope,
            state,
            additionalParams: {
                response_type: 'code',
                prompt: 'consent'
            }
        });

        // 새 창 열기
        openOAuth2Window(authUrl, 'Google_Auth', {
            width: 500,
            height: 600,
            onClose: () => {
                isLoading.value = false;
            }
        });
    } catch (error) {
        console.error('Google 인증 오류:', error);
        isLoading.value = false;
    }
};

onMounted(() => {
    setupAuthListener();
});
</script>
