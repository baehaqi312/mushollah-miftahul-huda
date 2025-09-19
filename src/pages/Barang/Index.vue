<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 space-y-6">
      <!-- Import/Export Panel -->
      <ImportExportPanel @refresh="loadItems" v-if="userRole === 'admin'" />
      
      <!-- Data Table -->
      <DataTable :items="items" @refresh="loadItems" />
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import DataTable from './DataTable.vue';
import ImportExportPanel from './ImportExportPanel.vue';
import { fetchItems } from '@/services/barangService';

const items = ref([]);

const loadItems = () => {
  const fetchedItems = fetchItems();
  items.value = fetchedItems;
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