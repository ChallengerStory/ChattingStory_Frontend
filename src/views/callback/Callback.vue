<template>
    <div class="google-callback">
        <ProgressSpinner v-if="loading" />
        <div v-else-if="error" class="error">{{ error }}</div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useGoogleAuthStore } from '@/stores/google/useGoogleAuthStore';

const loading = ref(true);
const error = ref(null);
const googleAuthStore = useGoogleAuthStore();

onMounted(async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        console.log(`urlParams: ${urlParams}`);

        if (code && state) {
            await handleOAuthCallback(code, state);
        } else {
            throw new Error('Invalid callback parameters');
        }
    } catch (err) {
        error.value = err.message;
        notifyOpener('error', err.message);
    } finally {
        loading.value = false;
        setTimeout(() => window.close(), 1000);
    }
});

const handleOAuthCallback = async (code, state) => {
    try {
        // state 유효성 검증
        if (!googleAuthStore.isStateValid) {
            throw new Error('State validation failed: expired');
        }

        if (state !== googleAuthStore.state) {
            throw new Error('State mismatch: possible CSRF attack');
        }

        // 리다이렉트 URL 가져오기
        const redirectUrl = localStorage.getItem('google_auth_redirect');

        // OAuth 처리
        await googleAuthStore.handleAuthCallback(code, state);

        // 성공 알림
        notifyOpener('auth-success', {
            redirect: redirectUrl
        });
    } catch (error) {
        console.error('OAuth callback error:', error);
        throw new Error(`Failed to process OAuth callback: ${error.message}`);
    }
};

const notifyOpener = (type, data = null) => {
    if (window.opener) {
        const message = {
            type: `google-${type}`,
            data: data
        };
        window.opener.postMessage(message, window.location.origin);
        window.close();
    }
};
</script>

<style scoped>
.google-callback {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    flex-direction: column;
}

.error {
    color: red;
    text-align: center;
    padding: 1rem;
    max-width: 500px;
    background-color: #fff4f4;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 1rem;
}
</style>
