<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4">
        <UsersDataTable :users="users" @refresh="loadUsers" />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import UsersDataTable from './DataTable.vue';
import { fetchUsers } from '@/services/userService';

const users = ref([]);

const loadUsers = () => {
  const fetchedUsers = fetchUsers();
  users.value = fetchedUsers;
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