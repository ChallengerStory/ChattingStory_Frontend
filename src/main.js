import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { setupAxiosInterceptors } from '../src/plugins/axios.js';
import App from './App.vue';
import installPrimeVue from './plugins/primevue';
import router from './router';
import { useAuthStore } from './stores/auth';
const pinia = createPinia();

/* styles */
import '@/assets/chattingstory/main.css';
import '@/assets/styles.scss';
import '@/assets/tailwind.css';

const app = createApp(App);

app.use(router);
app.use(pinia);
const authStore = useAuthStore();
await authStore.initializeAuth(); // 초기 인증 상태 설정

setupAxiosInterceptors();

installPrimeVue(app);

app.mount('#app');
