<template>
    <Dialog v-model:visible="dialogVisible" modal>
        <template #container="{ closeCallback }">
            <div class="flex flex-col px-8 py-8 gap-4 rounded-2xl">
                <div class="flex items-center justify-around">
                    <img src="@/assets/img/Logo_Gradient_Text.svg" class="h-20" alt="" />
                </div>
                <div class="inline-flex flex-col gap-2">
                    <IftaLabel class="w-full !text-secondary-500 !bg-transparent">
                        <InputText id="username" class="w-full"></InputText>
                        <label for="username" class="!text-gray-500">Email</label>
                    </IftaLabel>
                </div>
                <div class="inline-flex flex-col gap-2">
                    <IftaLabel class="w-full !text-secondary-500">
                        <InputText id="password" class="w-full" type="password"></InputText>
                        <label for="password" class="!text-gray-500">Password</label>
                    </IftaLabel>
                </div>
                <div class="flex items-center gap-4">
                    <Button class="w-full" label="Sign In" @click="onSignInClicked(closeCallback)"></Button>
                </div>

                <div class="flex gap-4 items-center">
                    <hr class="flex-1" />
                    <span>or Continue with</span>
                    <hr class="flex-1" />
                </div>
                <div class="flex flex-row gap-4 items-center justify-center">
                    <Button icon="pi pi-google" rounded text></Button>
                    <Button icon="pi pi-github" rounded text></Button>
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { computed } from 'vue';
const emit = defineEmits(['update:visible']);
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    }
});
// computed 속성으로 dialogVisible 구현
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const onSignInClicked = (closeCallback) => {
    closeCallback();
};
</script>

<style scoped></style>
