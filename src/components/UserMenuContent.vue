<script setup>
import UserInfo from '@/components/UserInfo.vue';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { getCurrentUser, logout } from '@/services/authService';

const props = defineProps({
    user: {
        type: Object,
        required: true
    }
});

const router = useRouter();

const handleLogout = () => {
    logout();
    router.push({ name: 'login' });
};
</script>

<template>
    <DropdownMenuLabel class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserInfo :user="user" :show-email="true" />
        </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem @click="handleLogout" class="cursor-pointer" data-test="logout-button">
        <LogOut class="mr-2 h-4 w-4" />
        Log out
    </DropdownMenuItem>
</template>
