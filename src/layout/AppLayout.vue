<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';

const { layoutConfig, layoutState } = useLayout();

const containerClass = computed(() => {
    return {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive
    };
});

const toggleMenu = () => {
    layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;

    if (layoutState.staticMenuMobileActive) {
        bindOutsideClickListener();
        document.body.classList.add('blocked-scroll');
    } else {
        unbindOutsideClickListener();
        document.body.classList.remove('blocked-scroll');
    }
};

// Handle outside click to close sidebar
const outsideClickListener = ref(null);

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event) && layoutState.staticMenuMobileActive) {
                layoutState.staticMenuMobileActive = false;
                document.body.classList.remove('blocked-scroll');
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};

const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener.value);
        outsideClickListener.value = null;
    }
};

const isOutsideClicked = (event) => {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const menuButton = document.querySelector('.drawer-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || menuButton.isSameNode(event.target) || menuButton.contains(event.target));
};

onMounted(() => {
    if (layoutState.staticMenuMobileActive) {
        bindOutsideClickListener();
    }
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <!-- Sidebar - 기본적으로 화면 밖에 위치, toggle 시 표시됨 -->
        <div class="layout-sidebar">
            <app-sidebar></app-sidebar>
        </div>

        <!-- Main Container - 전체 화면 차지 -->
        <div class="layout-main-container">
            <app-topbar></app-topbar>

            <div class="layout-main">
                <router-view></router-view>
            </div>

            <app-footer></app-footer>
        </div>

        <!-- drawer 버튼 - 모든 화면 크기에서 좌하단에 표시 -->
        <Button icon="pi pi-bars" class="drawer-button p-link" @click="toggleMenu" severity="contrast"> </Button>

        <!-- 사이드바 활성화시 배경 마스크 -->
        <div class="layout-mask" @click="toggleMenu"></div>
    </div>
    <Toast />
</template>
