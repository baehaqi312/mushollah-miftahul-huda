<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
    href: {
        type: String,
        required: true
    },
    tabindex: {
        type: Number,
        required: false
    },
    method: {
        type: String,
        default: 'GET'
    },
    as: {
        type: String,
        default: 'router-link'
    }
});

const handleClick = (event) => {
    if (props.href.startsWith('http') || props.href.startsWith('#')) {
        // External link atau anchor, biarkan default behavior
        return;
    }
    
    // Internal route
    event.preventDefault();
    router.push(props.href);
};
</script>

<template>
    <a
        :href="href"
        :tabindex="tabindex"
        @click="handleClick"
        class="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
    >
        <slot />
    </a>
</template>
