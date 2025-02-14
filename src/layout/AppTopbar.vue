<script setup>
import Logo from '@/components/logo/Logo.vue';
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/auth';
import { inject } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const user = inject('user');
</script>

<template>
    <div class="layout-topbar underline-gray">
        <div class="layout-topbar-logo-container">
            <!-- <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button> -->
            <div class="w-10 h-10 flex items-center justify-center">
                <Logo class="w-auto h-auto object-contain" />
            </div>
            <span class="layout-topbar-logo">SYNCDAY</span>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <!-- <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div> -->
            </div>
            <div class="flex items-center">
                <template v-if="user">
                    {{ user.user_login }}
                </template>
                <template v-else class="flex items-center">
                    <RouterLink to="/login">
                        <span>Login</span>
                    </RouterLink>
                </template>
            </div>
            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                v-if="user"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
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
</template>
