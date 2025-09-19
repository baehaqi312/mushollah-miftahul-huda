<script setup>
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';

const props = defineProps({
    items: {
        type: Array,
        required: true
    }
});

const route = useRoute();
const router = useRouter();

// Function to check if URL is active
const urlIsActive = (href, currentPath) => {
    if (href === '/' && currentPath === '/') return true;
    if (href !== '/' && currentPath.startsWith(href)) return true;
    return false;
};

const handleNavigation = (href) => {
    router.push(href);
};
</script>

<template>
    <SidebarGroup class="px-2 py-0">
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
                <SidebarMenuButton
                    :is-active="urlIsActive(item.href, route.path)"
                    :tooltip="item.title"
                    @click="handleNavigation(item.href)"
                    class="cursor-pointer"
                >
                    <component :is="item.icon" />
                    <span>{{ item.title }}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarGroup>
</template>
