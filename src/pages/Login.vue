<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import InputError from '@/components/InputError.vue';
import TextLink from '@/components/TextLink.vue';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthBase from '@/layouts/AuthLayout.vue';
import { login } from '@/services/authService';
import { LoaderCircle } from 'lucide-vue-next';

const router = useRouter();

defineProps({
    status: {
        type: String,
        required: false
    },
    canResetPassword: {
        type: Boolean,
        default: false
    }
});

// Form state
const form = reactive({
    email: '',
    password: '',
    remember: false
});

const errors = ref({});
const processing = ref(false);

// Login function
const handleLogin = async () => {
    processing.value = true;
    errors.value = {};
    
    try {
        const response = await login(form.email, form.password, form.remember);
        if (response.success) {
            router.push('/dashboard');
        } else {
            errors.value = response.errors || { general: 'Login failed' };
        }
    } catch (error) {
        errors.value = { general: 'An error occurred during login' };
    } finally {
        processing.value = false;
        form.password = ''; // Reset password on any response
    }
};

// Set page title
onMounted(() => {
    document.title = 'Login - Mushollah Miftahul Huda';
});
</script>

<template>
    <AuthBase
        title="Mushollah Miftahul Huda"
    >
        <div
            v-if="status"
            class="mb-4 text-center text-sm font-medium text-green-600"
        >
            {{ status }}
        </div>

        <div
            v-if="errors.general"
            class="mb-4 text-center text-sm font-medium text-red-600"
        >
            {{ errors.general }}
        </div>

        <form
            @submit.prevent="handleLogin"
            class="flex flex-col gap-6"
        >
            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Label for="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        v-model="form.email"
                        required
                        autofocus
                        :tabindex="1"
                        autocomplete="email"
                        placeholder="email@example.com"
                    />
                    <InputError :message="errors.email" />
                </div>

                <div class="grid gap-2">
                    <div class="flex items-center justify-between">
                        <Label for="password">Password</Label>
                        <TextLink
                            v-if="canResetPassword"
                            href="#"
                            class="text-sm"
                            :tabindex="5"
                        >
                            Forgot password?
                        </TextLink>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        v-model="form.password"
                        required
                        :tabindex="2"
                        autocomplete="current-password"
                        placeholder="Password"
                    />
                    <InputError :message="errors.password" />
                </div>

                <div class="flex items-center justify-between">
                    <Label for="remember" class="flex items-center space-x-3">
                        <Checkbox id="remember" name="remember" v-model="form.remember" :tabindex="3" />
                        <span>Remember me</span>
                    </Label>
                </div>

                <Button
                    type="submit"
                    class="mt-4 w-full"
                    :tabindex="4"
                    :disabled="processing"
                    data-test="login-button"
                >
                    <LoaderCircle
                        v-if="processing"
                        class="h-4 w-4 animate-spin"
                    />
                    Log in
                </Button>
            </div>
        </form>
    </AuthBase>
</template>
