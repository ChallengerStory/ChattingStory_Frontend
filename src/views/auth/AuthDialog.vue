<template>
    <Dialog v-model:visible="dialogVisible" class="w-4/5 max-w-lg px-2 py-2" :dismissableMask="true" modal>
        <template #container="{ closeCallback }">
            <div class="relative overflow-hidden" style="height: 54vh">
                <div class="w-full h-full flex flex-row justify-around items-center">
                    <div class="">
                        <Button icon="pi pi-google" size="large"></Button>
                    </div>

                    <!-- <div class="flex-1">
                        <Button v-slot="slotProps" asChild>
                            <button v-bind="slotProps.a11yAttrs">
                                <i class="px-2 py-2 pi pi-github gradient-vertical clip-text"></i>
                            </button>
                        </Button>
                    </div> -->
                </div>
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
