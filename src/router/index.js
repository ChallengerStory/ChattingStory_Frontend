import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
// import authRoutes from './auth.js';
import callbackRoutes from './callback.js';
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'main',
                    // component: () => import('@/views/main/MainPage.vue')
                    component: () => import('@/views/chat/Chatting.vue')
                }
            ]
        },
        ...callbackRoutes
    ]
});

export default router;
