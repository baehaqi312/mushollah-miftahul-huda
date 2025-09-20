<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 space-y-6">
      <!-- Import/Export Panel -->
      <ImportExportPanel @refresh="loadItems" v-if="userRole === 'admin'" />

      <!-- Data Table -->
      <DataTable :items="items" :loading="isLoadingData || loadingState.fetch" @refresh="loadItems" />
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import DataTable from './DataTable.vue';
import ImportExportPanel from './ImportExportPanel.vue';
import { fetchItems, getLoadingState, isLoadingOperation } from '@/services/barangService';

const items = ref([]);
const isLoadingData = ref(false);

// Loading state dari service
const loadingState = ref({
  fetch: false
});

// Update loading state
const updateLoadingState = () => {
  const currentLoading = getLoadingState();
  loadingState.value.fetch = currentLoading.fetch;
};

// Setup interval untuk update loading state
let loadingInterval;
onMounted(() => {
  loadingInterval = setInterval(updateLoadingState, 100);
});

onUnmounted(() => {
  if (loadingInterval) {
    clearInterval(loadingInterval);
  }
});

const loadItems = async () => {
  isLoadingData.value = true;
  try {
    const fetchedItems = await fetchItems();
    items.value = fetchedItems;
  } catch (error) {
    console.error('Error loading items:', error);
    items.value = [];
  } finally {
    isLoadingData.value = false;
  }
};

import { getCurrentUser } from '@/services/authService';
const userRole = ref(getCurrentUser()?.role || 'Pengguna');

// Set page title and load data
onMounted(() => {
  document.title = 'Data Barang - Mushollah Miftahul Huda';
  loadItems();
});

const breadcrumbs = ref([
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Barang',
    href: '#',
  },
]);
</script>