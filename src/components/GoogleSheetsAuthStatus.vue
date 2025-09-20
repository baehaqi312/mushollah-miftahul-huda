<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Google Sheets Authentication Status
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Connection Status -->
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    <div class="w-3 h-3 rounded-full" :class="authStatus.isConnected ? 'bg-green-500' : 'bg-red-500'">
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ authStatus.isConnected ? 'Terhubung' : 'Terputus' }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Connection Status
                    </p>
                </div>
            </div>

            <!-- Authentication Mode -->
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    <div class="w-3 h-3 rounded-full"
                        :class="authStatus.hasWriteAccess ? 'bg-blue-500' : 'bg-orange-500'">
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ authStatus.mode }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Authentication Mode
                    </p>
                </div>
            </div>
        </div>

        <!-- Details -->
        <div class="mt-4 p-3 rounded-md"
            :class="authStatus.hasWriteAccess ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'">
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 mt-0.5" :class="authStatus.hasWriteAccess ? 'text-blue-400' : 'text-orange-400'"
                        fill="currentColor" viewBox="0 0 20 20">
                        <path v-if="authStatus.hasWriteAccess" fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                        <path v-else fill-rule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <h4 class="text-sm font-medium"
                        :class="authStatus.hasWriteAccess ? 'text-blue-800 dark:text-blue-200' : 'text-orange-800 dark:text-orange-200'">
                        {{ authStatus.hasWriteAccess ? 'Full Access Active' : 'Read-Only Mode' }}
                    </h4>
                    <p class="mt-1 text-sm"
                        :class="authStatus.hasWriteAccess ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'">
                        {{ authStatus.message }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="mt-4 flex flex-col sm:flex-row gap-2">
            <button @click="refreshStatus"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
            </button>

            <button v-if="!authStatus.hasWriteAccess" @click="setupServiceAccount"
                class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Setup Full Access
            </button>
        </div>

        <!-- Spreadsheet Info -->
        <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p><strong>Spreadsheet ID:</strong> {{ authStatus.spreadsheetId || 'Not configured' }}</p>
            <p><strong>Last Updated:</strong> {{ new Date().toLocaleString() }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { googleSheetsService } from '@/services/googleSheetsService.js';

const authStatus = ref({
    isConnected: false,
    mode: 'Not Authenticated',
    hasWriteAccess: false,
    message: 'Checking connection...',
    spreadsheetId: null
});

const checkAuthStatus = async () => {
    try {
        // Import ensureGoogleSheetsInitialized function
        const { ensureGoogleSheetsInitialized } = await import('@/services/storageService.js');

        // Try to ensure Google Sheets is initialized first
        await ensureGoogleSheetsInitialized();

        const isConnected = googleSheetsService.isConnected();
        const mode = googleSheetsService.getAuthMode ? googleSheetsService.getAuthMode() : 'Unknown';
        const spreadsheetId = googleSheetsService.getSpreadsheetId();
        const hasWriteAccess = mode.includes('Service Account');

        authStatus.value = {
            isConnected,
            mode,
            hasWriteAccess,
            spreadsheetId,
            message: hasWriteAccess
                ? 'You can perform all CRUD operations (Create, Read, Update, Delete) on Google Sheets.'
                : isConnected
                    ? 'Read-only access. Write operations will use localStorage fallback. Configure Service Account for full access.'
                    : 'Google Sheets not connected. Check your configuration and network connection.'
        };
    } catch (error) {
        authStatus.value = {
            isConnected: false,
            mode: 'Error',
            hasWriteAccess: false,
            message: `Authentication error: ${error.message}`,
            spreadsheetId: null
        };
    }
};

const refreshStatus = async () => {
    authStatus.value.message = 'Refreshing...';
    await checkAuthStatus();
};

const setupServiceAccount = () => {
    alert('To setup full access:\n\n1. Configure Service Account in .env file\n2. Set VITE_GOOGLE_CLIENT_EMAIL and VITE_GOOGLE_PRIVATE_KEY\n3. Share your Google Sheet with the service account email\n4. Refresh this page\n\nSee GOOGLE_SHEETS_SETUP.md for detailed instructions.');
};

onMounted(() => {
    checkAuthStatus();
});
</script>