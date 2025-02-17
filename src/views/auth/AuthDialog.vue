<template>
    <Dialog v-model:visible="dialogVisible" modal> </Dialog>
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
</script>

<style scoped></style>
