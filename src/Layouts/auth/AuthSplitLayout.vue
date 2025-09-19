<script setup>
import AppLogoIcon from '../../components/AppLogoIcon.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Default app name dan quote
const name = "Mushollah Miftahul Huda";
const quote = {
    message: "Selamat datang di sistem informasi Mushollah Miftahul Huda",
    author: "Admin"
};

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

const goHome = () => {
    router.push('/');
};
</script>

<template>
    <div
        class="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0"
    >
        <div
            class="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r"
        >
            <div class="absolute inset-0 bg-zinc-900" />
            <button
                @click="goHome"
                class="relative z-20 flex items-center text-lg font-medium cursor-pointer"
            >
                <AppLogoIcon class="mr-2 size-8 fill-current text-white" />
                {{ name }}
            </button>
            <div v-if="quote" class="relative z-20 mt-auto">
                <blockquote class="space-y-2">
                    <p class="text-lg">&ldquo;{{ quote.message }}&rdquo;</p>
                    <footer class="text-sm text-neutral-300">
                        {{ quote.author }}
                    </footer>
                </blockquote>
            </div>
        </div>
        <div class="lg:p-8">
            <div
                class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
            >
                <div class="flex flex-col space-y-2 text-center">
                    <h1 class="text-xl font-medium tracking-tight" v-if="title">
                        {{ title }}
                    </h1>
                    <p class="text-sm text-muted-foreground" v-if="description">
                        {{ description }}
                    </p>
                </div>
                <slot />
            </div>
        </div>
    </div>
</template>
