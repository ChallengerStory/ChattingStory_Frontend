<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/authStore';
import { inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GoogleLoginButtonSimple from '@/components/auth/GoogleLoginButtonSimple.vue';

const { toggleDarkMode, isDarkTheme } = useLayout();

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const user = inject('user');
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
                <template v-if="authStore.isInitialized">
                    {{ user.user_login }}
                </template>
                <template v-else class="flex items-center">
                    <GoogleLoginButtonSimple :redirectPath="route.path" />
                </template>
            </div>
            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                v-if="authStore.isInitialized"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block" v-if="user">
                <div class="layout-topbar-menu-content">
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
