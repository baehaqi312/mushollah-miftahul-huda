<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Status Google Sheets Integration
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Connection Status -->
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    <div class="w-3 h-3 rounded-full"
                        :class="storageStatus.isConnected ? 'bg-green-500' : 'bg-red-500'">
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ storageStatus.isConnected ? 'Terhubung' : 'Terputus' }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Google Sheets
                    </p>
                </div>
            </div>

            <!-- Storage Mode -->
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    <Icon name="Cloud" class="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                        Google Sheets Only
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Full Integration
                    </p>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-2">
                <button v-if="!storageStatus.isConnected" @click="retryConnection" :disabled="isRetrying"
                    class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                    <Icon name="RotateCcw" class="w-3 h-3 mr-1" />
                    {{ isRetrying ? 'Connecting...' : 'Retry' }}
                </button>

                <button @click="refreshStatus"
                    class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                    <Icon name="RefreshCw" class="w-3 h-3 mr-1" />
                    Refresh
                </button>
            </div>
        </div>

        <!-- Additional Info -->
        <div v-if="!storageStatus.isConnected" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <div class="flex">
                <Icon name="AlertTriangle" class="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
                <div>
                    <p class="text-sm text-red-800 dark:text-red-200">
                        <strong>Tidak Terhubung:</strong> Google Sheets tidak dapat diakses.
                    </p>
                    <p class="text-xs text-red-600 dark:text-red-300 mt-1">
                        Pastikan API key dan Spreadsheet ID sudah dikonfigurasi dengan benar.
                        <a href="/GOOGLE_SHEETS_SETUP.md" target="_blank" class="underline">
                            Lihat panduan setup Google Sheets
                        </a>
                    </p>
                </div>
            </div>
        </div>

        <div v-else class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
            <div class="flex">
                <Icon name="CheckCircle" class="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                <div>
                    <p class="text-sm text-green-800 dark:text-green-200">
                        <strong>Google Sheets Active:</strong> Data tersimpan langsung ke Google Sheets.
                    </p>
                    <p class="text-xs text-green-600 dark:text-green-300 mt-1">
                        Tidak lagi menggunakan localStorage. Semua data read/write langsung dari/ke Google Sheets.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getStorageStatus, retryGoogleSheets } from '@/services/storageService';
import Icon from './Icon.vue';

const storageStatus = ref({
    useLocalStorage: false,
    googleSheetsInitialized: false,
    isConnected: false
});

const isRetrying = ref(false);

const refreshStatus = async () => {
    try {
        // Try to ensure Google Sheets is initialized first
        const { ensureGoogleSheetsInitialized } = await import('@/services/storageService.js');
        await ensureGoogleSheetsInitialized();

        storageStatus.value = getStorageStatus();
    } catch (error) {
        console.error('Error refreshing storage status:', error);
        storageStatus.value = getStorageStatus();
    }
};

const retryConnection = async () => {
    isRetrying.value = true;
    try {
        const success = await retryGoogleSheets();
        if (success) {
            refreshStatus();
        }
    } catch (error) {
        console.error('Failed to retry Google Sheets connection:', error);
    } finally {
        isRetrying.value = false;
    }
};

onMounted(async () => {
    await refreshStatus();

    // Refresh status setiap 30 detik
    const interval = setInterval(refreshStatus, 30000);

    // Cleanup interval on unmount
    return () => {
        clearInterval(interval);
    };
});
</script>