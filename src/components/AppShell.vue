<script>
import { SidebarProvider } from '@/components/ui/sidebar';
import { ref, onMounted } from 'vue';

export default {
    components: {
        SidebarProvider
    },
    props: {
        variant: {
            type: String,
            default: 'header'
        },
        sidebarOpen: {
            type: Boolean,
            default: true // Ubah default ke true
        }
    },
    setup(props) {
        const isOpen = ref(props.sidebarOpen);

        onMounted(() => {
            const savedState = localStorage.getItem('sidebarOpen');
            if (savedState !== null) {
                isOpen.value = JSON.parse(savedState);
            } else {
                isOpen.value = true; // Pastikan terbuka jika belum ada di localStorage
            }
        });

        return {
            isOpen
        };
    }
};
</script>

<template>
    <div v-if="variant === 'header'" class="flex min-h-screen w-full flex-col">
        <slot />
    </div>
    <SidebarProvider v-else :default-open="isOpen">
        <slot />
    </SidebarProvider>
</template>