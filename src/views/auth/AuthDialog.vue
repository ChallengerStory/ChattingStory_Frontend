<template>
    <Dialog v-model:visible="dialogVisible" class="w-4/5" modal>
        <template #container="{ closeCallback }">
            <div class="flex flex-col px-8 py-8 gap-4 rounded-2xl">
                <div class="flex items-center justify-around">
                    <img src="@/assets/img/Logo_Gradient_Text.svg" class="w-3/5" alt="" />
                </div>
                <div class="inline-flex flex-col gap-2">
                    <IftaLabel class="w-full !bg-white/0">
                        <InputText id="username" class="!bg-white/0 w-full"></InputText>
                        <label for="username" class="">Email</label>
                    </IftaLabel>
                </div>
                <div class="inline-flex flex-col gap-2">
                    <IftaLabel class="w-full !bg-white/0">
                        <InputText id="password" class="!bg-white/0 w-full" type="password"></InputText>
                        <label for="password">Password</label>
                    </IftaLabel>
                </div>
                <div class="flex items-center gap-4">
                    <Button class="w-full" label="Sign In" @click="onSignInClicked(closeCallback)"></Button>
                </div>

                <div class="flex gap-4 items-center">
                    <hr class="flex-1" />
                    <span>or continue with</span>
                    <hr class="flex-1" />
                </div>
                <div class="flex flex-row gap-4 items-center justify-center">
                    <Button v-slot="slotProps" asChild
                        ><button v-bind="slotProps.a11yAttrs">
                            <i class="px-2 py-2 pi pi-google gradient-vertical clip-text"></i>
                        </button> </Button
                    ><Button v-slot="slotProps" asChild
                        ><button v-bind="slotProps.a11yAttrs">
                            <i class="px-2 py-2 pi pi-github gradient-vertical clip-text"></i>
                        </button>
                    </Button>
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
