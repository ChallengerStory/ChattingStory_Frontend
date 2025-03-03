<template>
    <div class="flex flex-col">
        <div class="flex-1 flex flex-col"></div>

        <!-- Input -->
        <div class="w-full">
            <InputGroup>
                <InputText type="text" v-model="message"></InputText>
                <Button label="Send" severity="contrast"></Button>
            </InputGroup>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
const message = ref('');
</script>

<style scoped></style>
