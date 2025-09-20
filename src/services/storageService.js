import googleSheetsService from './googleSheetsService.js';
import { GOOGLE_SHEETS_CONFIG, validateGoogleSheetsConfig } from './googleSheetsConfig.js';

const LOGGED_IN_USER_KEY = 'miftahul_huda_loggedInUser';

let googleSheetsInitialized = false;

// Initialize localStorage with dummy data
const initLocalStorage = () => {
    // Initialize users if empty
    if (!localStorage.getItem('users')) {
        const dummyUsers = [
            {
                id: 1,
                name: 'Admin',
                email: 'admin@mushollah.com',
                password: 'admin123',
                role: 'admin',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 2,
                name: 'User',
                email: 'user@mushollah.com',
                password: 'user123',
                role: 'user',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(dummyUsers));
    }

    // Initialize items if empty
    if (!localStorage.getItem('items')) {
        const dummyItems = [
            {
                id: 1,
                name: 'Al-Quran',
                jumlah: 10,
                status: 'Tersedia',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Sajadah',
                jumlah: 25,
                status: 'Tersedia',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Mukena',
                jumlah: 15,
                status: 'Dipinjam',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
        localStorage.setItem('items', JSON.stringify(dummyItems));
    }

    console.log('LocalStorage initialized with dummy data');
};

const initGoogleSheets = async () => {
    // Skip if already initialized and connected
    if (googleSheetsInitialized && googleSheetsService.isConnected()) {
        console.log('Google Sheets already initialized and connected');
        return true;
    }

    try {
        const validation = validateGoogleSheetsConfig();
        if (!validation.isValid) {
            console.warn('Google Sheets configuration validation failed:', validation.message);
            throw new Error('Google Sheets configuration missing');
        }

        const config = GOOGLE_SHEETS_CONFIG;

        // Try Service Account first (full access)
        if (config.SERVICE_ACCOUNT && config.SERVICE_ACCOUNT.private_key) {
            console.log('Initializing with Service Account...');
            await googleSheetsService.initWithServiceAccount(config.SERVICE_ACCOUNT, config.SPREADSHEET_ID);
            googleSheetsInitialized = true;
            console.log('Google Sheets initialized with Service Account (full access)');
            return true;
        }

        // Fallback to API Key (read-only)
        if (config.API_KEY && config.API_KEY !== 'YOUR_GOOGLE_API_KEY_HERE') {
            console.log('Initializing with API Key (read-only)...');
            await googleSheetsService.initWithApiKey(config.API_KEY, config.SPREADSHEET_ID);
            googleSheetsInitialized = true;
            console.log('Google Sheets initialized with API Key (read-only mode)');
            console.warn('Write operations will use localStorage fallback');
            return true;
        }

        throw new Error('No valid authentication method found');
    } catch (error) {
        console.error('Failed to initialize Google Sheets:', error);
        console.log('Falling back to localStorage for all operations');
        throw error;
    }
};

export const initStorage = async () => {
    try {
        await initGoogleSheets();
        console.log('Storage initialized with Google Sheets');
    } catch (error) {
        console.error('Google Sheets initialization failed, using localStorage fallback');
        googleSheetsInitialized = false;

        // Initialize localStorage with dummy data if empty
        initLocalStorage();
    }
};

export const getUsers = async () => {
    // Try to initialize Google Sheets if not already done
    if (!googleSheetsInitialized) {
        try {
            await initGoogleSheets();
        } catch (error) {
            console.log('Google Sheets initialization failed, using localStorage fallback');
        }
    }

    if (googleSheetsInitialized) {
        try {
            const data = await googleSheetsService.getSheetAsJson(GOOGLE_SHEETS_CONFIG.SHEETS.USERS);
            return data.map(user => ({
                ...user,
                id: parseInt(user.id) || user.id,
                is_active: user.is_active === 'true' || user.is_active === true
            }));
        } catch (error) {
            console.error('Error getting users from Google Sheets, falling back to localStorage:', error);
            // Mark as not initialized if connection failed
            googleSheetsInitialized = false;
        }
    }

    // Fallback to localStorage
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
};

export const saveUsers = async (users) => {
    // Try to initialize Google Sheets if not already done
    if (!googleSheetsInitialized) {
        try {
            await initGoogleSheets();
        } catch (error) {
            console.log('Google Sheets initialization failed, using localStorage fallback');
        }
    }

    if (googleSheetsInitialized) {
        try {
            const formattedUsers = users.map(user => ({
                ...user,
                is_active: user.is_active ? 'true' : 'false',
                updated_at: new Date().toISOString()
            }));
            await googleSheetsService.saveJsonToSheet(GOOGLE_SHEETS_CONFIG.SHEETS.USERS, formattedUsers);
            return;
        } catch (error) {
            console.error('Error saving users to Google Sheets, falling back to localStorage:', error);
            // Mark as not initialized if connection failed
            googleSheetsInitialized = false;
        }
    }

    // Fallback to localStorage
    const formattedUsers = users.map(user => ({
        ...user,
        updated_at: new Date().toISOString()
    }));
    localStorage.setItem('users', JSON.stringify(formattedUsers));
};

export const getItems = async () => {
    // Try to initialize Google Sheets if not already done
    if (!googleSheetsInitialized) {
        try {
            await initGoogleSheets();
        } catch (error) {
            console.log('Google Sheets initialization failed, using localStorage fallback');
        }
    }

    if (googleSheetsInitialized) {
        try {
            const data = await googleSheetsService.getSheetAsJson(GOOGLE_SHEETS_CONFIG.SHEETS.ITEMS);
            return data.map(item => ({
                ...item,
                id: parseInt(item.id) || item.id,
                jumlah: parseInt(item.jumlah) || item.jumlah
            }));
        } catch (error) {
            console.error('Error getting items from Google Sheets, falling back to localStorage:', error);
            // Mark as not initialized if connection failed
            googleSheetsInitialized = false;
        }
    }

    // Fallback to localStorage
    const items = localStorage.getItem('items');
    return items ? JSON.parse(items) : [];
};

export const saveItems = async (items) => {
    // Try to initialize Google Sheets if not already done
    if (!googleSheetsInitialized) {
        try {
            await initGoogleSheets();
        } catch (error) {
            console.log('Google Sheets initialization failed, using localStorage fallback');
        }
    }

    if (googleSheetsInitialized) {
        try {
            const formattedItems = items.map(item => ({
                ...item,
                updated_at: new Date().toISOString()
            }));
            await googleSheetsService.saveJsonToSheet(GOOGLE_SHEETS_CONFIG.SHEETS.ITEMS, formattedItems);
            return;
        } catch (error) {
            console.error('Error saving items to Google Sheets, falling back to localStorage:', error);
            // Mark as not initialized if connection failed
            googleSheetsInitialized = false;
        }
    }

    // Fallback to localStorage
    const formattedItems = items.map(item => ({
        ...item,
        updated_at: new Date().toISOString()
    }));
    localStorage.setItem('items', JSON.stringify(formattedItems));
};

export const getLoggedInUser = () => {
    const userData = localStorage.getItem(LOGGED_IN_USER_KEY);
    return userData ? JSON.parse(userData) : null;
};

export const setLoggedInUser = (user) => {
    localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
};

export const clearLoggedInUser = () => {
    localStorage.removeItem(LOGGED_IN_USER_KEY);
};

export const getStorageStatus = () => ({
    useLocalStorage: false,
    googleSheetsInitialized,
    isConnected: googleSheetsService.isConnected(),
    mode: 'google-sheets-only'
});

export const retryGoogleSheets = async () => {
    try {
        // Reset initialization flag to force re-init
        googleSheetsInitialized = false;
        const success = await initGoogleSheets();
        console.log('Google Sheets connection retry:', success ? 'Success' : 'Failed');
        return success;
    } catch (error) {
        console.error('Failed to retry Google Sheets connection:', error);
        return false;
    }
};

// Helper function to ensure Google Sheets is initialized
export const ensureGoogleSheetsInitialized = async () => {
    if (!googleSheetsInitialized) {
        try {
            await initGoogleSheets();
        } catch (error) {
            console.error('Failed to initialize Google Sheets:', error);
        }
    }
    return googleSheetsInitialized;
};