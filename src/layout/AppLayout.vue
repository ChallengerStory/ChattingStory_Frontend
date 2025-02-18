<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';
import AppFooter from './AppFooter.vue';
import AppTopbar from './AppTopbar.vue';

const { layoutConfig, layoutState } = useLayout();

// outsideClickListener와 관련 watch 제거

const containerClass = computed(() => {
    return {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive
    };
});

// bindOutsideClickListener, unbindOutsideClickListener, isOutsideClicked 함수 제거
</script>
<template>
    <div class="layout-wrapper" :class="containerClass">
        <app-topbar></app-topbar>
        <!-- <app-sidebar></app-sidebar> -->
        <div class="layout-main-container">
            <div class="layout-main">
                <router-view></router-view>
            </div>
            <app-footer></app-footer>
        </div>
        <div class="layout-mask animate-fadein"></div>
    </div>
    <Toast />
</template>
