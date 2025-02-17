<template>
    <Dialog v-model:visible="dialogVisible" class="w-4/5" :dismissableMask="true" modal>
        <template #container="{ closeCallback }">
            <form autocomplete="off" @submit.prevent="onSignInClicked(closeCallback)">
                <div class="flex flex-col px-8 py-8 gap-4 rounded-2xl">
                    <div class="flex items-center justify-around">
                        <img src="@/assets/img/Logo_Gradient_Text.svg" class="w-3/5" alt="" />
                    </div>
                    <div class="inline-flex flex-col gap-2">
                        <IftaLabel class="w-full !bg-white/0">
                            <InputText id="username" class="!bg-white/0 w-full" v-model="username" autocomplete="new-password" name="username"> </InputText>
                            <label for="username" class="">Email</label>
                        </IftaLabel>
                    </div>
                    <div class="inline-flex flex-col gap-2">
                        <IftaLabel class="w-full !bg-white/0">
                            <InputText id="password" class="!bg-white/0 w-full" type="password" v-model="password" autocomplete="new-password" name="password"> </InputText>
                            <label for="password">Password</label>
                        </IftaLabel>
                    </div>
                    <div class="flex items-center gap-4">
                        <Button type="submit" class="w-full" severity="secondary" label="Login"> </Button>
                    </div>

                    <div class="flex gap-4 items-center">
                        <hr class="flex-1" />
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

const username = ref('');
const password = ref('');
const onSignInClicked = async (closeCallback) => {
    const response = await authStore.login(username.value, password.value);

    if (response) {
        closeCallback();
    } else {
        console.log('failed to log in');
    }
};
</script>

<style scoped>
/* 추가적인 브라우저 자동완성 스타일 제거 */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    transition: background-color 5000s ease-in-out 0s;
}
</style>
