import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initStorage } from './services/storageService';
import { initializeDarkMode } from './composables/useDarkMode.js';
import './assets/main.css'; // Sesuaikan dengan file CSS Anda, misal dari Tailwind

// Inisialisasi data dummy di localStorage atau Google Sheets jika belum ada
initStorage().then(() => {
    console.log('Storage initialization completed');
}).catch(error => {
    console.error('Storage initialization failed:', error);
});

// Inisialisasi dark mode sebelum app mount
initializeDarkMode();

const app = createApp(App);

app.use(router);
app.mount('#app');