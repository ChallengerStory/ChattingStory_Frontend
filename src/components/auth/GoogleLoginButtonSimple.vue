<!-- src/components/GoogleLoginButtonSimple.vue -->
<template>
    <Button icon="pi pi-google" text rounded @click="openGoogleAuth" :disabled="isLoading" />
</template>

<script setup>
import { ref } from 'vue';
import { openOAuth2Window, buildOAuth2Url, generateOAuthState } from '@/utils/oauth2';

const props = defineProps({
    redirectPath: {
        type: String,
        default: window.location.pathname
    }
});

const isLoading = ref(false);
let authWindow = null;

// Google OAuth 상태 생성
const generateState = () => {
    const state = generateOAuthState();
    const timestamp = Date.now().toString();

    localStorage.setItem('google_oauth_state', state);
    localStorage.setItem('google_oauth_state_timestamp', timestamp);

    return state;
};

// Google 인증 창 열기
const openGoogleAuth = () => {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
        // 인증 상태 생성
        const state = generateState();

        // 리디렉션 경로 저장
        localStorage.setItem('google_auth_redirect', props.redirectPath);

        // 환경 변수에서 OAuth 설정 가져오기
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
        const scope = 'profile';

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

        // 인증 창 리스너 설정
        window.addEventListener('message', handleAuthMessage, false);

        // 새 창 열기
        authWindow = openOAuth2Window(authUrl, 'Google_Auth', {
            width: 500,
            height: 600,
            onClose: () => {
                authWindow = null;
                isLoading.value = false;
            }
        });
    } catch (error) {
        console.error('Google 인증 오류:', error);
        isLoading.value = false;
    }
};

// 인증 창으로부터 메시지 처리
const handleAuthMessage = (event) => {
    // 보안을 위해 출처 확인
    if (event.origin !== window.location.origin) return;

    // 성공 메시지 확인
    if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        // 성공 시 페이지 새로고침 또는 다른 처리
        window.removeEventListener('message', handleAuthMessage);
        window.location.reload();
    }
};
</script>
