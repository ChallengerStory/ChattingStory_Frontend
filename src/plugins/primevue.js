import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

const SyncDayPreset = definePreset(Aura, {
    semantic: {
        pink: {
            50: '#fff1f4',
            100: '#ffe4ea',
            200: '#ffc8d6',
            300: '#ff9db5',
            400: '#fe7a94',
            500: '#FE5D86',
            600: '#e54d77',
            700: '#bf3c60',
            800: '#9c314d',
            900: '#802b42',
            950: '#4c1525'
        },
        apricot: {
            50: '#fff9f2', // Lightest shade
            100: '#fff1e4',
            200: '#ffe4cc',
            300: '#fed1a7',
            400: '#fdc994',
            500: '#FDC387', // Base apricot color
            600: '#e5a975',
            700: '#bf8b5f',
            800: '#9c714d',
            900: '#805d40',
            950: '#4c3725' // Darkest shade
        },
        primary: {
            50: '{gray.50}',
            100: '{gray.100}',
            200: '{gray.200}',
            300: '{gray.300}',
            400: '{gray.400}',
            500: '{gray.500}',
            600: '{gray.600}',
            700: '{gray.700}',
            800: '{gray.800}',
            900: '{gray.900}',
            950: '{gray.950}'
        }
    }
});
export default function installPrimeVue(app) {
    app.use(PrimeVue, {
        theme: {
            preset: SyncDayPreset,
            options: {
                prefix: 'p',
                darkModeSelector: '.app-dark'
            }
        }
    });
    app.use(ToastService);
    app.use(ConfirmationService);
}
