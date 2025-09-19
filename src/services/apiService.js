// apiService.js - Opsional untuk integrasi dengan API external

const API_BASE = import.meta.env.VITE_API_URL || '';
const USE_API = import.meta.env.VITE_USE_API === 'true';

// JSONBin.io Integration (Free JSON storage)
const JSONBIN_KEY = import.meta.env.VITE_JSONBIN_KEY;
const JSONBIN_BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;

export const apiConfig = {
    useAPI: USE_API,
    baseURL: API_BASE,
    jsonBin: {
        key: JSONBIN_KEY,
        binId: JSONBIN_BIN_ID,
        baseURL: 'https://api.jsonbin.io/v3'
    }
};

// Generic API call helper
const apiCall = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

// JSONBin.io methods
export const jsonBinAPI = {
    // Read data dari JSONBin
    read: async (binId = JSONBIN_BIN_ID) => {
        if (!JSONBIN_KEY || !binId) return null;

        try {
            const url = `${apiConfig.jsonBin.baseURL}/b/${binId}/latest`;
            const data = await apiCall(url, {
                headers: {
                    'X-Master-Key': JSONBIN_KEY
                }
            });
            return data.record;
        } catch (error) {
            console.warn('Failed to read from JSONBin:', error);
            return null;
        }
    },

    // Write data ke JSONBin  
    write: async (data, binId = JSONBIN_BIN_ID) => {
        if (!JSONBIN_KEY || !binId) return false;

        try {
            const url = `${apiConfig.jsonBin.baseURL}/b/${binId}`;
            await apiCall(url, {
                method: 'PUT',
                headers: {
                    'X-Master-Key': JSONBIN_KEY
                },
                body: JSON.stringify(data)
            });
            return true;
        } catch (error) {
            console.error('Failed to write to JSONBin:', error);
            return false;
        }
    }
};

// Custom API methods (untuk server sendiri)
export const customAPI = {
    // Get data dari server
    getData: async (endpoint) => {
        if (!USE_API || !API_BASE) return null;

        try {
            return await apiCall(`${API_BASE}${endpoint}`);
        } catch (error) {
            console.warn(`Failed to get data from ${endpoint}:`, error);
            return null;
        }
    },

    // Post data ke server
    postData: async (endpoint, data) => {
        if (!USE_API || !API_BASE) return false;

        try {
            await apiCall(`${API_BASE}${endpoint}`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            return true;
        } catch (error) {
            console.error(`Failed to post data to ${endpoint}:`, error);
            return false;
        }
    },

    // Update data di server
    updateData: async (endpoint, data) => {
        if (!USE_API || !API_BASE) return false;

        try {
            await apiCall(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            return true;
        } catch (error) {
            console.error(`Failed to update data at ${endpoint}:`, error);
            return false;
        }
    }
};

// Hybrid sync function - sync data ke external storage
export const syncToExternal = {
    // Sync users data
    syncUsers: async (users) => {
        const promises = [];

        // Sync ke JSONBin jika configured
        if (JSONBIN_KEY && JSONBIN_BIN_ID) {
            promises.push(jsonBinAPI.write({ users }, JSONBIN_BIN_ID));
        }

        // Sync ke custom API jika configured
        if (USE_API) {
            promises.push(customAPI.postData('/users', users));
        }

        // Tunggu semua sync selesai
        const results = await Promise.allSettled(promises);

        // Log hasil sync
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`Sync users failed at provider ${index}:`, result.reason);
            }
        });

        return results.some(result => result.status === 'fulfilled');
    },

    // Sync items data
    syncItems: async (items) => {
        const promises = [];

        // Sync ke JSONBin jika configured  
        if (JSONBIN_KEY && JSONBIN_BIN_ID) {
            promises.push(jsonBinAPI.write({ items }, JSONBIN_BIN_ID));
        }

        // Sync ke custom API jika configured
        if (USE_API) {
            promises.push(customAPI.postData('/items', items));
        }

        const results = await Promise.allSettled(promises);

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`Sync items failed at provider ${index}:`, result.reason);
            }
        });

        return results.some(result => result.status === 'fulfilled');
    }
};

// Load initial data dari external sources
export const loadFromExternal = {
    // Load users dari external
    loadUsers: async () => {
        // Coba JSONBin dulu
        if (JSONBIN_KEY && JSONBIN_BIN_ID) {
            const data = await jsonBinAPI.read(JSONBIN_BIN_ID);
            if (data?.users) return data.users;
        }

        // Coba custom API
        if (USE_API) {
            const data = await customAPI.getData('/users');
            if (data) return data;
        }

        return null;
    },

    // Load items dari external  
    loadItems: async () => {
        // Coba JSONBin dulu
        if (JSONBIN_KEY && JSONBIN_BIN_ID) {
            const data = await jsonBinAPI.read(JSONBIN_BIN_ID);
            if (data?.items) return data.items;
        }

        // Coba custom API
        if (USE_API) {
            const data = await customAPI.getData('/items');
            if (data) return data;
        }

        return null;
    }
};