<script setup>
import AppSidebarLayout from '@/layouts/app/AppSidebarLayout.vue';

defineProps({
    breadcrumbs: {
        type: Array,
        default: () => []
    }
});
</script>

<template>
    <AppSidebarLayout :breadcrumbs="breadcrumbs">
        <slot />
    </AppSidebarLayout>
</template>