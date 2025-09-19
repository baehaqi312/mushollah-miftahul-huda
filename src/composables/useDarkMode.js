// Composable untuk mengelola dark mode
import { ref, onMounted, watch } from 'vue';

// Reactive state untuk dark mode
export const isDarkMode = ref(false);

// Function untuk toggle dark mode
export const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    updateDarkMode();
};

// Function untuk set dark mode
export const setDarkMode = (dark) => {
    isDarkMode.value = dark;
    updateDarkMode();
};

// Function untuk update DOM dan localStorage
const updateDarkMode = () => {
    if (isDarkMode.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
    }
};

// Function untuk initialize dark mode dari localStorage atau system preference
export const initializeDarkMode = () => {
    const savedTheme = localStorage.getItem('darkMode');

    if (savedTheme !== null) {
        // Gunakan preference yang tersimpan
        isDarkMode.value = savedTheme === 'true';
    } else {
        // Gunakan system preference
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    updateDarkMode();
};

// Composable utama
export const useDarkMode = () => {
    onMounted(() => {
        initializeDarkMode();

        // Listen untuk perubahan system theme
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            // Hanya update jika user belum set manual preference
            if (localStorage.getItem('darkMode') === null) {
                setDarkMode(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);

        // Cleanup listener saat component unmount
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    });

    return {
        isDarkMode,
        toggleDarkMode,
        setDarkMode
    };
};