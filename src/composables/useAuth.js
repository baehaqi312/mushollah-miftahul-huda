// Composable untuk mengelola user authentication
import { ref, reactive } from 'vue';

// Global user state
export const currentUser = ref(null);

// Function untuk set user setelah login
export const setCurrentUser = (userData) => {
    // Set ke reactive state
    currentUser.value = userData;

    // Simpan ke localStorage untuk persistence
    try {
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User data saved to localStorage:', userData);
    } catch (error) {
        console.error('Error saving user to localStorage:', error);
    }
};

// Function untuk get current user
export const getCurrentUser = () => {
    if (currentUser.value) {
        return currentUser.value;
    }

    // Try to load from localStorage
    try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            currentUser.value = userData;
            return userData;
        }
    } catch (error) {
        console.error('Error loading user from localStorage:', error);
    }

    return null;
};

// Function untuk logout
export const logout = () => {
    currentUser.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
};

// Function untuk check if user is logged in
export const isLoggedIn = () => {
    return currentUser.value !== null || localStorage.getItem('user') !== null;
};

// Function untuk simulasi login (untuk testing)
export const simulateLogin = (name = 'Ahmad Fadli', role = 'admin') => {
    const userData = {
        id: 1,
        name: name,
        email: `${name.toLowerCase().replace(' ', '.')}@mushollah.com`,
        avatar: null,
        role: role,
        loginTime: new Date().toISOString()
    };

    setCurrentUser(userData);
    return userData;
};