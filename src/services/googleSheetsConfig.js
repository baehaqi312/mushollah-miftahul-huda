// Konfigurasi Google Sheets
// Ganti dengan informasi spreadsheet Anda

// Helper function untuk mendapatkan environment variables
const getEnvVar = (key) => {
    return import.meta.env[key];
};

export const GOOGLE_SHEETS_CONFIG = {
    // METODE 1: Menggunakan API Key (Read-Only)
    // Untuk menggunakan metode ini, uncomment baris di bawah dan masukkan API Key Anda
    API_KEY: getEnvVar('VITE_GOOGLE_API_KEY') || 'AIzaSyBGdfoP44_seCzTGR4ceF9xC7fo_7Oh4Ac',

    // METODE 2: Menggunakan Service Account (Full Access)
    // Untuk menggunakan metode ini, uncomment dan isi credentials di bawah
    SERVICE_ACCOUNT: getEnvVar('VITE_GOOGLE_CLIENT_EMAIL') ? {
        type: "service_account",
        project_id: getEnvVar('VITE_GOOGLE_PROJECT_ID'),
        private_key: getEnvVar('VITE_GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        client_email: getEnvVar('VITE_GOOGLE_CLIENT_EMAIL'),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
    } : null,

    // ID Spreadsheet Google Sheets Anda
    // Dapatkan dari URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
    SPREADSHEET_ID: getEnvVar('VITE_GOOGLE_SPREADSHEET_ID') || '1agJ-Chxp1-Wn4Cdvd_RZumbHmYy08jXFok_gqRXV7FU',

    // Nama sheet untuk setiap jenis data
    SHEETS: {
        USERS: 'Users',           // Sheet untuk data pengguna
        ITEMS: 'Items',           // Sheet untuk data barang
        AUTH_SESSIONS: 'Sessions' // Sheet untuk session login (opsional)
    },

    // Struktur kolom untuk setiap sheet
    COLUMNS: {
        USERS: [
            'id',
            'name',
            'email',
            'password',
            'role',
            'created_at',
            'updated_at'
        ],
        ITEMS: [
            'id',
            'name',
            'jumlah',
            'status',
            'created_at',
            'updated_at'
        ],
        AUTH_SESSIONS: [
            'user_id',
            'session_token',
            'expires_at',
            'created_at'
        ]
    }
};

// Konfigurasi fallback untuk development (menggunakan localStorage)
export const USE_FALLBACK_STORAGE = getEnvVar('VITE_USE_FALLBACK_STORAGE') === 'true' ? true : true; // Set ke false jika Google Sheets sudah dikonfigurasi

// Helper function untuk validasi konfigurasi
export const validateGoogleSheetsConfig = () => {
    const config = GOOGLE_SHEETS_CONFIG;

    if (!config.SPREADSHEET_ID || config.SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
        return {
            isValid: false,
            message: 'Spreadsheet ID belum dikonfigurasi. Silakan isi VITE_GOOGLE_SPREADSHEET_ID di .env atau googleSheetsConfig.js'
        };
    }

    const hasApiKey = config.API_KEY && config.API_KEY !== 'YOUR_GOOGLE_API_KEY_HERE';
    const hasServiceAccount = config.SERVICE_ACCOUNT && config.SERVICE_ACCOUNT.private_key;

    if (!hasApiKey && !hasServiceAccount) {
        return {
            isValid: false,
            message: 'Tidak ada metode otentikasi yang dikonfigurasi. Silakan atur VITE_GOOGLE_API_KEY atau SERVICE_ACCOUNT credentials di .env'
        };
    }

    return {
        isValid: true,
        message: 'Konfigurasi Google Sheets valid',
        hasWriteAccess: hasServiceAccount
    };
};

export default GOOGLE_SHEETS_CONFIG;