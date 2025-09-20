<template>
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <Icon name="Info" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-900 dark:text-blue-200">
                    🚀 Sistem Storage Diperbarui!
                </h3>
                <div class="mt-2 text-sm text-blue-800 dark:text-blue-300">
                    <p class="mb-2">
                        Aplikasi ini sekarang menggunakan <strong>Google Sheets</strong> sebagai database utama:
                    </p>
                    <ul class="list-disc pl-5 space-y-1">
                        <li>✅ Semua data disimpan langsung ke Google Sheets</li>
                        <li>✅ Tidak lagi menggunakan localStorage</li>
                        <li>✅ Data dapat diakses real-time dari mana saja</li>
                        <li>✅ Sinkronisasi otomatis</li>
                    </ul>
                    <p class="mt-2 text-xs">
                        <strong>Catatan:</strong> Session login tetap menggunakan localStorage untuk keamanan.
                    </p>
                </div>
            </div>
            <button @click="dismiss" class="ml-auto flex-shrink-0">
                <Icon name="X"
                    class="w-4 h-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" />
            </button>
        </div>
    </div>
</template>

<script setup>
import Icon from './Icon.vue';

const emit = defineEmits(['dismiss']);

const dismiss = () => {
    emit('dismiss');
};
</script>