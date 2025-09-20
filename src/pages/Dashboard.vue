<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4">
      <!-- Google Sheets Authentication Status -->
      <GoogleSheetsAuthStatus v-if="userRole === 'admin'" />

      <!-- Google Sheets Status -->
      <GoogleSheetsStatus v-if="userRole === 'admin'" />

      <!-- Loading State -->
      <div v-if="isLoading" class="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p class="text-gray-600 dark:text-gray-400">Memuat data...</p>
      </div>

      <!-- Statistics Cards -->
      <div v-else class="mb-6">
        <h3 class="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
          Statistik Barang ({{ items.length }} items)
        </h3>
        <DashboardStats :items="items" />
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import DashboardStats from '@/components/DashboardStats.vue';
import GoogleSheetsStatus from '@/components/GoogleSheetsStatus.vue';
import GoogleSheetsAuthStatus from '@/components/GoogleSheetsAuthStatus.vue';
import { fetchItems } from '@/services/barangService';
import { getCurrentUser } from '@/services/authService';

const userName = ref(getCurrentUser()?.name || 'Pengguna');
const items = ref([]);
const isLoading = ref(true);
const userRole = ref(getCurrentUser()?.role || 'Pengguna');

const loadItems = async () => {
  try {
    isLoading.value = true;
    const fetchedItems = await fetchItems();
    items.value = fetchedItems;
    console.log('Dashboard loaded items:', fetchedItems.length, 'items');
  } catch (error) {
    console.error('Error loading items:', error);
    items.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Set page title and load data
onMounted(() => {
  document.title = 'Dashboard - Mushollah Miftahul Huda';
  loadItems();
});

const breadcrumbs = ref([
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
]);
</script>