<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4">
      <!-- Statistics Cards -->
      <div class="mb-6">
          <h3 class="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
              Statistik Barang
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
import { fetchItems } from '@/services/barangService';
import { getCurrentUser } from '@/services/authService';

const userName = ref(getCurrentUser()?.name || 'Pengguna');
const items = ref([]);

const loadItems = () => {
  const fetchedItems = fetchItems();
  items.value = fetchedItems;
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