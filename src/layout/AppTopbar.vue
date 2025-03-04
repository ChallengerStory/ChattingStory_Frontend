<script setup>
import Logo from '@/components/logo/Logo.vue';
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/auth';
import AuthDialog from '@/views/auth/AuthDialog.vue';
import { inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const user = inject('user');

const showAuthDialog = ref(false);
// 다이얼로그 열기
const openAuthDialog = () => {
    showAuthDialog.value = true;
};
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <div class="layout-topbar-logo">
                <img src="@/assets/img/doing_face.png" alt="" />
                <span class="maple-bold">Chatting Story</span>
            </div>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
            </div>
            <div class="flex items-center">
                <template v-if="user">
                    {{ user.user_login }}
                </template>
                <template v-else class="flex items-center">
                    <Button icon="pi pi-google" text></Button>
                    <!-- <Button label="Login" icon="pi pi-sign-in" @click="openAuthDialog" variant="text" severity="contrast"></Button> -->
                </template>
            </div>
            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                v-if="user"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block" v-if="user">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-user"></i>
                        <span>My Page</span>
                    </button>
                    <button type="button" class="layout-topbar-action" @click="authStore.logout()">
                        <i class="pi pi-sign-out"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <AuthDialog v-model:visible="showAuthDialog"></AuthDialog>
</template>
<style scoped>
.p-button-contrast:focus-visible {
    outline-color: transparent;
}
</style>
