<template>
    <Dialog v-model:visible="dialogVisible" class="w-4/5 max-w-lg px-2 py-2" :dismissableMask="true" modal>
        <template #container="{ closeCallback }">
            <div class="relative overflow-hidden" style="height: 54vh">
                <Button v-slot="slotProps" asChild>
                    <button v-bind="slotProps.a11yAttrs">
                        <i class="px-2 py-2 pi pi-google gradient-vertical clip-text"></i>
                    </button>
                </Button>
                <Button v-slot="slotProps" asChild>
                    <button v-bind="slotProps.a11yAttrs">
                        <i class="px-2 py-2 pi pi-github gradient-vertical clip-text"></i>
                    </button>
                </Button>
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed, ref } from 'vue';

const emit = defineEmits(['update:visible']);
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    }
});

const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const authStore = useAuthStore();

// Login form data
const username = ref('');
const password = ref('');

// Register form data
const registerEmail = ref('');
const registerPassword = ref('');
const confirmPassword = ref('');
const name = ref('');
const phone = ref('');
const address = ref('');

// Toggle state
const isRegistering = ref(false);

const onSignInClicked = async (closeCallback) => {
    const response = await authStore.login(username.value, password.value);
    if (response) {
        closeCallback();
    } else {
        console.log('failed to log in');
    }
};

const onRegisterSubmit = async (closeCallback) => {
    if (registerPassword.value !== confirmPassword.value) {
        console.log('Passwords do not match');
        return;
    }

    const response = await authStore.register({
        email: registerEmail.value,
        password: registerPassword.value,
        name: name.value,
        phone: phone.value,
        address: address.value
    });

    if (response) {
        closeCallback();
    } else {
        console.log('failed to register');
    }
};

const toggleForm = () => {
    isRegistering.value = !isRegistering.value;
};

const sendVerificationCode = async () => {
    try {
        const response = await authStore.checkEmail(registerEmail.value);
        console.log(response.data);
    } catch (error) {
        console.log(error);
    }
};
</script>

<style scoped>
/* 브라우저 자동완성 스타일 제거 */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    transition: background-color 5000s ease-in-out 0s;
}

/* 스크롤바 스타일링 */
.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
