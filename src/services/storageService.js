const USERS_KEY = 'miftahul_huda_users';
const ITEMS_KEY = 'miftahul_huda_items';
const LOGGED_IN_USER_KEY = 'miftahul_huda_loggedInUser';

// Inisialisasi data awal (seperti seeder di Laravel)
export const initStorage = () => {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([
            { id: 1, name: 'Admin', email: 'luthfi@gmail.com', password: '123456', role: 'admin' },
            { id: 2, name: 'User Biasa', email: 'agung123@gmail.com', password: '123456', role: 'user' },
            { id: 3, name: 'John Doe', email: 'autay123@gmail.com', password: '123456', role: 'admin' },
            { id: 4, name: 'Jane Smith', email: 'adam123@gmail.com', password: '123456', role: 'user' }
        ]));
    }
    if (!localStorage.getItem(ITEMS_KEY)) {
        localStorage.setItem(ITEMS_KEY, JSON.stringify([
            {
                id: 101,
                name: 'Kursi Plastik',
                jumlah: '50',
                status: 'Tersedia'
            },
            {
                id: 102,
                name: 'Meja Lipat',
                jumlah: '20',
                status: 'Dipinjam'
            },
        ]));
    }
};

// --- User Management ---
export const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY)) || [];
export const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

// --- Item Management ---
export const getItems = () => JSON.parse(localStorage.getItem(ITEMS_KEY)) || [];
export const saveItems = (items) => localStorage.setItem(ITEMS_KEY, JSON.stringify(items));

// --- Auth Management ---
export const getLoggedInUser = () => JSON.parse(localStorage.getItem(LOGGED_IN_USER_KEY));
export const setLoggedInUser = (user) => localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
export const clearLoggedInUser = () => localStorage.removeItem(LOGGED_IN_USER_KEY);