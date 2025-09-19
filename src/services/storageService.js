import { loadFromExternal, syncToExternal } from './apiService.js';

const USERS_KEY = 'miftahul_huda_users';
const ITEMS_KEY = 'miftahul_huda_items';
const LOGGED_IN_USER_KEY = 'miftahul_huda_loggedInUser';

// Cache untuk menyimpan data yang sudah di-fetch
let usersCache = null;
let itemsCache = null;

// Fungsi untuk fetch data dari static JSON files
const fetchJsonData = async (path) => {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.warn(`Failed to fetch ${path}:`, error);
        return null;
    }
};

// Inisialisasi data dengan hybrid approach (external API + static files + localStorage)
export const initStorage = async () => {
    try {
        // Coba load dari external API terlebih dahulu (jika configured)
        const [externalUsers, externalItems] = await Promise.all([
            loadFromExternal.loadUsers(),
            loadFromExternal.loadItems()
        ]);

        // Kemudian coba load dari static files
        const [staticUsers, staticItems] = await Promise.all([
            fetchJsonData('/data/users.json'),
            fetchJsonData('/data/items.json')
        ]);

        // Prioritas: external API > static files > localStorage > default
        const usersData = externalUsers || staticUsers;
        const itemsData = externalItems || staticItems;

        // Jika berhasil load dari static files, simpan ke localStorage sebagai backup
        if (usersData) {
            usersCache = usersData;
            localStorage.setItem(USERS_KEY, JSON.stringify(usersData));
        }

        if (itemsData) {
            itemsCache = itemsData;
            localStorage.setItem(ITEMS_KEY, JSON.stringify(itemsData));
        }

        // Jika gagal load dari static files, fallback ke default data
        if (!usersData && !localStorage.getItem(USERS_KEY)) {
            const defaultUsers = [
                { id: 1, name: 'Luthfi Baehaqi', email: 'admin@admin.com', password: 'admin123', role: 'admin' },
                { id: 2, name: 'A Utay', email: 'autay123@gmail.com', password: 'autay123', role: 'admin' },
                { id: 3, name: 'Agung', email: 'agung123@gmail.com', password: 'agung123', role: 'user' },
                { id: 4, name: 'Adam', email: 'adam123@gmail.com', password: 'adam123', role: 'user' }
            ];
            usersCache = defaultUsers;
            localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        }

        if (!itemsData && !localStorage.getItem(ITEMS_KEY)) {
            const defaultItems = [
                { id: 101, name: 'Test 1', jumlah: '50', status: 'Tersedia' },
                { id: 102, name: 'Test 2', jumlah: '20', status: 'Dipinjam' },
            ];
            itemsCache = defaultItems;
            localStorage.setItem(ITEMS_KEY, JSON.stringify(defaultItems));
        }
    } catch (error) {
        console.error('Error initializing storage:', error);
        // Fallback ke localStorage jika semua gagal
        if (!localStorage.getItem(USERS_KEY)) {
            const defaultUsers = [
                { id: 1, name: 'Admin', email: 'admin@admin.com', password: 'password', role: 'admin' },
                { id: 2, name: 'User Biasa', email: 'user@user.com', password: 'password', role: 'user' }
            ];
            localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        }
        if (!localStorage.getItem(ITEMS_KEY)) {
            const defaultItems = [
                { id: 101, name: 'Kursi Plastik', jumlah: '50', status: 'Tersedia' }
            ];
            localStorage.setItem(ITEMS_KEY, JSON.stringify(defaultItems));
        }
    }
};

// --- User Management ---
export const getUsers = () => {
    // Prioritas: cache -> localStorage -> empty array
    if (usersCache) return usersCache;
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
};

export const saveUsers = async (users) => {
    usersCache = users;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Auto-sync ke external storage jika configured (non-blocking)
    try {
        await syncToExternal.syncUsers(users);
    } catch (error) {
        console.warn('Failed to sync users to external storage:', error);
    }
};

// --- Item Management ---
export const getItems = () => {
    // Prioritas: cache -> localStorage -> empty array
    if (itemsCache) return itemsCache;
    return JSON.parse(localStorage.getItem(ITEMS_KEY)) || [];
};

export const saveItems = async (items) => {
    itemsCache = items;
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));

    // Auto-sync ke external storage jika configured (non-blocking)
    try {
        await syncToExternal.syncItems(items);
    } catch (error) {
        console.warn('Failed to sync items to external storage:', error);
    }
};

// --- Auth Management ---
export const getLoggedInUser = () => JSON.parse(localStorage.getItem(LOGGED_IN_USER_KEY));
export const setLoggedInUser = (user) => localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
export const clearLoggedInUser = () => localStorage.removeItem(LOGGED_IN_USER_KEY);