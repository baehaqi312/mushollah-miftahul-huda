<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <!-- Total Barang -->
    <div class="p-6 bg-white rounded-lg shadow-xs dark:bg-gray-800 border-l-4 border-blue-500">
      <div class="flex items-center">
        <div class="flex-1">
          <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Barang
          </h4>
          <p class="mt-2 text-3xl font-bold text-gray-700 dark:text-gray-200">
            {{ totalBarang.toLocaleString() }}
          </p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Jumlah keseluruhan barang
          </p>
        </div>
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Dipinjam -->
    <div class="p-6 bg-white rounded-lg shadow-xs dark:bg-gray-800 border-l-4 border-red-500">
      <div class="flex items-center">
        <div class="flex-1">
          <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Dipinjam
          </h4>
          <p class="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
            {{ totalDipinjam.toLocaleString() }}
          </p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Barang yang sedang dipinjam
          </p>
        </div>
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Dikembalikan -->
    <div class="p-6 bg-white rounded-lg shadow-xs dark:bg-gray-800 border-l-4 border-green-500">
      <div class="flex items-center">
        <div class="flex-1">
          <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Dikembalikan
          </h4>
          <p class="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            {{ totalDikembalikan.toLocaleString() }}
          </p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Barang yang sudah dikembalikan
          </p>
        </div>
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

// Calculate totals
const totalBarang = computed(() => {
  return props.items.reduce((sum, item) => sum + (parseInt(item.jumlah) || 0), 0)
})

const totalDipinjam = computed(() => {
  return props.items
    .filter(item => item.status === 'Dipinjam')
    .reduce((sum, item) => sum + (parseInt(item.jumlah) || 0), 0)
})

const totalDikembalikan = computed(() => {
  return props.items
    .filter(item => item.status === 'Dikembalikan')
    .reduce((sum, item) => sum + (parseInt(item.jumlah) || 0), 0)
})
</script>