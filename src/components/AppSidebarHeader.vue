<script setup>
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDarkMode } from '@/composables/useDarkMode.js';
import { Sun, Moon } from 'lucide-vue-next';

const props = defineProps({
    breadcrumbs: {
        type: Array,
        default: () => []
    }
});

// Dark mode composable
const { isDarkMode, toggleDarkMode } = useDarkMode();
</script>

<template>
    <header
        class="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/70 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4"
    >
        <div class="flex items-center gap-2 flex-1">
            <SidebarTrigger class="-ml-1" />
            <template v-if="breadcrumbs && breadcrumbs.length > 0">
                <Breadcrumbs :breadcrumbs="breadcrumbs" />
            </template>
        </div>

        <!-- Dark Mode Toggle Button -->
        <div class="ml-auto">
            <TooltipProvider :delay-duration="0">
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            variant="ghost"
                            size="icon"
                            @click="toggleDarkMode"
                            class="group h-9 w-9 cursor-pointer"
                        >
                            <Sun
                                v-if="isDarkMode"
                                class="size-4 opacity-80 group-hover:opacity-100 transition-all"
                            />
                            <Moon
                                v-else
                                class="size-4 opacity-80 group-hover:opacity-100 transition-all"
                            />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{{ isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    </header>
</template>
