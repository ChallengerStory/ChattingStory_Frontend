<template>
    <div class="app-root">
        <ScrollPanel class="w-full h-full">
            <router-view />
        </ScrollPanel>
    </div>
</template>

<script setup>
import { computed, provide } from 'vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

// computed를 사용하여 authStore.user의 변경사항을 추적
const user = computed(() => authStore.user);

// provide를 사용하여 하위 컴포넌트에 user 정보 제공
provide('user', user);
</script>

<style scoped>
.app-root {
    display: flex;
    flex-direction: column;
    height: 100vh; /* 명시적 높이 설정 */
    width: 100vw;
    overflow: hidden; /* 중요: 이중 스크롤 방지 */
}
</style>
