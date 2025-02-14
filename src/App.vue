<template>
    <router-view />
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

<style scoped></style>
