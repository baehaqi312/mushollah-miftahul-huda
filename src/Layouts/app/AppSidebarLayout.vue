<script setup>
import AppContent from '@/components/AppContent.vue';
import AppShell from '@/components/AppShell.vue';
import AppSidebar from '@/components/AppSidebar.vue';
import AppSidebarHeader from '@/components/AppSidebarHeader.vue';
import { getCurrentUser, isAuthenticated } from '@/services/authService.js';
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    breadcrumbs: {
        type: Array,
        default: () => []
    }
});

const router = useRouter();
const currentUser = ref(null);

// Load user data
onMounted(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        router.push('/login');
        return;
    }
    
    const user = getCurrentUser();
    if (user) {
        currentUser.value = user;
    }
});

// Watch for user changes (misalnya setelah update profile)
watch(() => getCurrentUser(), (newUser) => {
    if (newUser) {
        currentUser.value = newUser;
    }
}, { deep: true });
</script>

<template>
    <AppShell variant="sidebar">
        <AppSidebar :user="currentUser" />
        <AppContent variant="sidebar" class="overflow-x-hidden">
            <AppSidebarHeader :breadcrumbs="breadcrumbs" />
            <slot />
        </AppContent>
    </AppShell>
</template>
