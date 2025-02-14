export default [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/pages/auth/Login.vue'),
        meta: { requiresAuth: false }
    }
];
