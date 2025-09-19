<template>
  <aside class="z-20 hidden w-64 overflow-y-auto bg-white dark:bg-gray-800 md:block flex-shrink-0">
    <div class="py-4 text-gray-500 dark:text-gray-400">
      <a class="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200" href="#">
        Miftahul Huda
      </a>
      <ul class="mt-6">
        <li class="relative px-6 py-3">
          <router-link to="/dashboard" class="nav-link" active-class="active">
            <HomeIcon class="w-5 h-5" />
            <span class="ml-4">Dashboard</span>
          </router-link>
        </li>
        <li class="relative px-6 py-3">
          <router-link to="/barang" class="nav-link" active-class="active">
            <PackageIcon class="w-5 h-5" />
            <span class="ml-4">Barang</span>
          </router-link>
        </li>
        <li v-if="isAdmin" class="relative px-6 py-3">
          <router-link to="/users" class="nav-link" active-class="active">
            <UsersIcon class="w-5 h-5" />
            <span class="ml-4">Users</span>
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { HomeIcon, PackageIcon, UsersIcon } from 'lucide-vue-next';
import { isAdmin as checkIsAdmin } from '@/services/authService';
import { ref } from 'vue';

const isAdmin = ref(checkIsAdmin());
</script>
