<template>
    <Dialog v-model:visible="dialogVisible" class="w-4/5" :dismissableMask="true" modal>
        <template #container="{ closeCallback }">
            <div class="relative overflow-hidden" style="height: 500px">
                <!-- Login Form -->
                <form autocomplete="off" @submit.prevent="onSignInClicked(closeCallback)" :class="['absolute w-full transition-transform duration-500 ease-in-out', isRegistering ? '-translate-x-full' : 'translate-x-0']">
                    <div class="flex flex-col px-8 py-8 gap-4 rounded-2xl">
                        <div class="flex items-center justify-around">
                            <img src="@/assets/img/Logo_Gradient_Text.svg" class="w-3/5" alt="" />
                        </div>
                        <div class="inline-flex flex-col gap-2">
                            <IftaLabel class="w-full !bg-white/0">
                                <InputText id="username" class="!bg-white/0 w-full" v-model="username" autocomplete="new-password" name="username"> </InputText>
                                <label for="username">Email</label>
                            </IftaLabel>
                        </div>
                        <div class="inline-flex flex-col gap-2">
                            <IftaLabel class="w-full !bg-white/0">
                                <InputText id="password" class="!bg-white/0 w-full" type="password" v-model="password" autocomplete="new-password" name="password"> </InputText>
                                <label for="password">Password</label>
                            </IftaLabel>
                        </div>
                        <div class="flex items-center gap-4">
                            <Button type="submit" class="w-full" severity="secondary" label="Login"></Button>
                        </div>

                        <div class="flex gap-1 items-center">
                            <hr class="flex-1" />
                            <span class="text-gray-400 cursor-pointer" @click="toggleForm">register</span>
                            <span class="text-gray-400">or continue with</span>
                            <hr class="flex-1" />
                        </div>
                        <div class="flex flex-row gap-4 items-center justify-center">
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
                    </div>
                </form>

                <!-- Register Form -->
                <form autocomplete="off" @submit.prevent="onRegisterSubmit(closeCallback)" :class="['absolute w-full transition-transform duration-500 ease-in-out', isRegistering ? 'translate-x-0' : 'translate-x-full']">
                    <div class="flex flex-col px-8 py-8 gap-4 rounded-2xl">
                        <div class="flex items-center justify-around">
                            <img src="@/assets/img/Logo_Gradient_Text.svg" class="w-3/5" alt="" />
                        </div>
                        <div class="inline-flex flex-col gap-2">
                            <IftaLabel class="w-full !bg-white/0">
                                <InputText id="register-email" class="!bg-white/0 w-full" v-model="registerEmail" autocomplete="new-password"> </InputText>
                                <label for="register-email">Email</label>
                            </IftaLabel>
                        </div>
                        <div class="inline-flex flex-col gap-2">
                            <IftaLabel class="w-full !bg-white/0">
                                <InputText id="register-password" class="!bg-white/0 w-full" type="password" v-model="registerPassword" autocomplete="new-password"> </InputText>
                                <label for="register-password">Password</label>
                            </IftaLabel>
                        </div>
                        <div class="inline-flex flex-col gap-2">
                            <IftaLabel class="w-full !bg-white/0">
                                <InputText id="confirm-password" class="!bg-white/0 w-full" type="password" v-model="confirmPassword" autocomplete="new-password"> </InputText>
                                <label for="confirm-password">Confirm Password</label>
                            </IftaLabel>
                        </div>
                        <div class="flex items-center gap-4">
                            <Button type="submit" class="w-full" severity="secondary" label="Register"> </Button>
                        </div>
                        <div class="flex gap-1 items-center">
                            <hr class="flex-1" />
                            <span class="text-gray-400 cursor-pointer" @click="toggleForm"> Back to login </span>
                            <hr class="flex-1" />
                        </div>
                    </div>
                </form>
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

    const response = await authStore.register(registerEmail.value, registerPassword.value);
    if (response) {
        closeCallback();
    } else {
        console.log('failed to register');
    }
};

const toggleForm = () => {
    isRegistering.value = !isRegistering.value;
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
</style>
