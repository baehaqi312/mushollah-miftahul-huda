import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated, isAdmin } from '@/services/authService';
import Dashboard from '@/pages/Dashboard.vue';
import Login from '@/pages/Login.vue';
import UsersIndex from '@/pages/Users/Index.vue';
import BarangIndex from '@/pages/Barang/Index.vue';

const routes = [
    { path: '/', redirect: '/dashboard' },
    {
        path: '/login',
        component: Login,
        name: 'login',
        meta: { guest: true }
    },
    {
        path: '/dashboard',
        component: Dashboard,
        name: 'dashboard',
        meta: { requiresAuth: true }
    },
    {
        path: '/users',
        component: UsersIndex,
        name: 'users.index',
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/barang',
        component: BarangIndex,
        name: 'barang.index',
        meta: { requiresAuth: true }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        next({ name: 'login' });
    } else if (to.meta.requiresAdmin && !isAdmin()) {
        next({ name: 'dashboard' }); // Redirect jika bukan admin
    } else if (to.meta.guest && isAuthenticated()) {
        next({ name: 'dashboard' });
    } else {
        next();
    }
});

export default router;