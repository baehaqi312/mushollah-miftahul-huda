<script setup>
// import AuthSimpleLayout from './auth/AuthSimpleLayout.vue';
import AuthCardLayout from './auth/AuthCardLayout.vue';

defineProps({
    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    }
});
</script>

<template>
    <AuthCardLayout :title="title" :description="description">
        <slot />
    </AuthCardLayout>
</template>
