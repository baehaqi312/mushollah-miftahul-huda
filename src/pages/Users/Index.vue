<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4">
      <UsersDataTable :users="users" :loading="isLoadingData || loadingState.fetch" @refresh="loadUsers" />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import UsersDataTable from './DataTable.vue';
import { fetchUsers, getLoadingState, isLoadingOperation } from '@/services/userService';

const users = ref([]);
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

const loadUsers = async () => {
  isLoadingData.value = true;
  try {
    const fetchedUsers = await fetchUsers();
    users.value = fetchedUsers;
  } catch (error) {
    console.error('Error loading users:', error);
    users.value = [];
  } finally {
    isLoadingData.value = false;
  }
};

// Set page title and load data
onMounted(() => {
  document.title = 'Manajemen Pengguna - Mushollah Miftahul Huda';
  loadUsers();
});

const breadcrumbs = ref([
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Manajemen Pengguna',
    href: '#',
  },
]);
</script>