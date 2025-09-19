import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initStorage } from './services/storageService';
import { initializeDarkMode } from './composables/useDarkMode.js';
import './assets/main.css'; // Sesuaikan dengan file CSS Anda, misal dari Tailwind

// Fungsi async untuk inisialisasi app
async function initApp() {
    // Inisialisasi data dari static files atau localStorage jika belum ada
    await initStorage();

    // Inisialisasi dark mode sebelum app mount
    initializeDarkMode();

    const app = createApp(App);

    app.use(router);
    app.mount('#app');
}

// Jalankan inisialisasi
initApp().catch(error => {
    console.error('Failed to initialize app:', error);
    // Fallback: mount app tanpa data preload jika terjadi error
    const app = createApp(App);
    app.use(router);
    app.mount('#app');
});