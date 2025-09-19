<script setup>
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { BookOpen, Users, LayoutGrid } from 'lucide-vue-next';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppLogo from './AppLogo.vue';

// Props untuk menerima user data
const props = defineProps({
    user: {
        type: Object,
        default: () => ({
            name: 'User',
            email: 'user@example.com',
            avatar: null,
            role: 'user'
        })
    }
});

// Fallback user data dari localStorage atau session
const getCurrentUser = () => {
    try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            // Pastikan user object memiliki properties yang diperlukan
            return {
                name: parsedUser.name || 'User',
                email: parsedUser.email || 'user@example.com',
                avatar: parsedUser.avatar || null,
                role: parsedUser.role || 'user',
                ...parsedUser
            };
        }
    } catch (error) {
        console.error('Error parsing user from localStorage:', error);
    }
    
    // Fallback ke props user atau default user
    const fallbackUser = props.user || {
        name: 'User',
        email: 'user@example.com',
        avatar: null,
        role: 'user'
    };
    
    return fallbackUser;
};

const user = ref(getCurrentUser());

// Watch untuk update user ketika props berubah
onMounted(() => {
    // Re-load user data setelah component mount
    const updatedUser = getCurrentUser();
    if (updatedUser) {
        user.value = updatedUser;
    }
});

// Watch props.user untuk update reactive state
watch(() => props.user, (newUser) => {
    if (newUser && newUser.name) {
        user.value = {
            name: newUser.name || 'User',
            email: newUser.email || 'user@example.com',
            avatar: newUser.avatar || null,
            role: newUser.role || 'user',
            ...newUser
        };
    }
}, { deep: true, immediate: true });

const router = useRouter();

// Define navigation items
const mainNavItems = computed(() => {
    // Base navigation items yang selalu ada
    const baseItems = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Barang',
            href: '/barang',
            icon: BookOpen,
        }
    ];

    // Tambahkan Users menu hanya jika user ada dan role bukan 'user'
    if (user.value && user.value.role && user.value.role !== 'user') {
        baseItems.splice(1, 0, {
            title: 'Pengguna',
            href: '/users',
            icon: Users,
        });
    }

    return baseItems;
});

// Function untuk navigasi ke dashboard
const navigateToDashboard = () => {
    router.push('/');
};
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" @click="navigateToDashboard" class="cursor-pointer">
                        <AppLogo />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

        <SidebarFooter>
            <NavUser :user="user" />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
