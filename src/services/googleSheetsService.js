// Google Sheets API Service
// Konfigurasi untuk menggunakan Google Sheets sebagai database
// Browser-compatible version using fetch API

class GoogleSheetsService {
    constructor() {
        this.accessToken = null;
        this.spreadsheetId = null;
        this.apiKey = null;
        this.initialized = false;
        this.serviceAccount = null;
        this.loading = {
            fetch: false,
            save: false,
            append: false,
            clear: false,
            init: false
        };
    }

    // Inisialisasi dengan API Key (untuk akses public sheets)
    async initWithApiKey(apiKey, spreadsheetId) {
        this.loading.init = true;
        try {
            this.apiKey = apiKey;
            this.spreadsheetId = spreadsheetId;
            this.initialized = true;
            console.log('Google Sheets Service initialized with API Key');
        } finally {
            this.loading.init = false;
        }
    }

    // Inisialisasi dengan Service Account (untuk akses penuh)
    async initWithServiceAccount(credentials, spreadsheetId) {
        this.loading.init = true;
        try {
            console.log('Initializing Google Sheets Service with Service Account...');

            // Generate JWT for service account authentication
            const accessToken = await this.generateServiceAccountToken(credentials);

            this.serviceAccount = credentials;
            this.spreadsheetId = spreadsheetId;
            this.accessToken = accessToken;
            this.initialized = true;

            console.log('Google Sheets Service initialized with Service Account (full access)');
            return true;
        } catch (error) {
            console.error('Failed to initialize Google Sheets Service:', error);
            console.warn('Falling back to read-only mode with localStorage for write operations');

            // Fallback: initialize without access token
            this.serviceAccount = credentials;
            this.spreadsheetId = spreadsheetId;
            this.initialized = true;
            return true;
        } finally {
            this.loading.init = false;
        }
    }

    // Generate access token from service account using JWT
    async generateServiceAccountToken(credentials) {
        try {
            console.log('Generating Service Account access token...');

            // Import jose library for JWT operations
            const { SignJWT, importPKCS8 } = await import('jose');

            const now = Math.floor(Date.now() / 1000);
            const exp = now + 3600; // 1 hour expiration

            // Create JWT payload
            const payload = {
                iss: credentials.client_email,
                scope: 'https://www.googleapis.com/auth/spreadsheets',
                aud: 'https://oauth2.googleapis.com/token',
                exp: exp,
                iat: now
            };

            // Import private key
            const privateKey = await importPKCS8(credentials.private_key, 'RS256');

            // Create and sign JWT
            const jwt = await new SignJWT(payload)
                .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
                .setIssuedAt(now)
                .setExpirationTime(exp)
                .sign(privateKey);

            // Exchange JWT for access token
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: jwt
                })
            });

            if (!tokenResponse.ok) {
                const error = await tokenResponse.json();
                throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
            }

            const tokenData = await tokenResponse.json();

            console.log('✅ Service Account access token generated successfully');
            return tokenData.access_token;

        } catch (error) {
            console.error('❌ Service Account token generation failed:', error);
            console.warn('Falling back to localStorage mode');
            return null;
        }
    }

    // Fetch data dari Google Sheets menggunakan API Key atau Access Token
    async fetchSheetData(range) {
        if (!this.initialized) {
            throw new Error('Google Sheets Service not initialized');
        }

        this.loading.fetch = true;
        try {
            let url;
            let options = {};

            if (this.accessToken) {
                // Menggunakan Service Account access token (full access)
                url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;
                options = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                };
            } else if (this.apiKey) {
                // Menggunakan API Key untuk read-only access
                url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;
                options = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            } else {
                throw new Error('No authentication method configured');
            }

            const response = await fetch(url, options);
            const data = await response.json();

            if (data.error) {
                throw new Error(`Google Sheets API Error: ${data.error.message}`);
            }

            return data.values || [];
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            throw error;
        } finally {
            this.loading.fetch = false;
        }
    }

    // Mendapatkan data dari sheet dan mengkonversi ke format JSON
    async getSheetAsJson(sheetName) {
        this.loading.fetch = true;
        try {
            const range = `${sheetName}!A:Z`; // Mengambil semua kolom sampai Z
            const rows = await this.fetchSheetData(range);

            if (rows.length === 0) {
                return [];
            }

            // Baris pertama adalah header
            const headers = rows[0];
            const data = [];

            // Konversi setiap baris menjadi object
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const obj = {};

                headers.forEach((header, index) => {
                    obj[header] = row[index] || '';
                });

                // Skip baris kosong
                if (Object.values(obj).some(value => value !== '')) {
                    data.push(obj);
                }
            }

            return data;
        } catch (error) {
            console.error('Error converting sheet to JSON:', error);
            return [];
        } finally {
            this.loading.fetch = false;
        }
    }

    // Menyimpan data JSON ke sheet menggunakan REST API
    async saveJsonToSheet(sheetName, data) {
        if (!this.initialized) {
            throw new Error('Google Sheets service not initialized');
        }

        this.loading.save = true;
        try {
            // Ensure we have valid authentication for write operations
            await this.ensureValidToken();

            if (!this.accessToken) {
                console.warn('Save operation requires Service Account authentication');
                console.warn('Current mode: API Key (read-only). Data will be saved to localStorage instead.');
                throw new Error('Write operations not supported in API Key mode. Data will be saved to localStorage instead.');
            }

            // Tentukan headers dari data
            const headers = data.length > 0 ? Object.keys(data[0]) : [];

            // Konversi data menjadi array 2D
            const values = [headers];
            data.forEach(item => {
                const row = headers.map(header => item[header] || '');
                values.push(row);
            });

            // Clear sheet dulu, lalu tulis data baru
            await this.clearSheet(sheetName);

            // Tulis data menggunakan update
            const range = `${sheetName}!A1:${this.getColumnLetter(headers.length)}${values.length}`;
            let url, requestHeaders;

            if (this.accessToken) {
                url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
                requestHeaders = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                };
            } else {
                throw new Error('No valid authentication for write operations');
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: requestHeaders,
                body: JSON.stringify({
                    values: values
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Save sheet error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}. ${errorData.error?.message || ''}`);
            }

            const result = await response.json();
            console.log(`Successfully saved ${data.length} records to ${sheetName}`);
            return result;
        } catch (error) {
            console.error('Error saving to Google Sheets:', error);
            throw error;
        } finally {
            this.loading.save = false;
        }
    }

    // Menambah data baru ke sheet
    async appendToSheet(sheetName, data) {
        if (!this.initialized) {
            throw new Error('Google Sheets service not initialized');
        }

        this.loading.append = true;
        try {
            // Ensure we have valid authentication for write operations  
            await this.ensureValidToken();

            if (!this.accessToken) {
                console.warn('Append operation requires Service Account authentication');
                console.warn('Current mode: API Key (read-only). Data will be saved to localStorage instead.');
                throw new Error('Write operations not supported in API Key mode. Data will be saved to localStorage instead.');
            }

            // Konversi single item ke array jika perlu
            const itemsToAdd = Array.isArray(data) ? data : [data];

            // Ambil data existing untuk mendapatkan headers
            const existingData = await this.getSheetAsJson(sheetName);
            let headers = existingData.length > 0 ? Object.keys(existingData[0]) : Object.keys(itemsToAdd[0]);

            // Konversi data menjadi array 2D
            const values = itemsToAdd.map(item => {
                return headers.map(header => item[header] || '');
            });

            const range = `${sheetName}!A:A`;
            let url, requestHeaders;

            if (this.accessToken) {
                url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
                requestHeaders = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                };
            } else {
                throw new Error('No valid authentication for write operations');
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify({
                    values: values
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Append sheet error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}. ${errorData.error?.message || ''}`);
            }

            const result = await response.json();
            console.log(`Successfully appended ${itemsToAdd.length} records to ${sheetName}`);
            return result;
        } catch (error) {
            console.error('Error appending to Google Sheets:', error);
            throw error;
        } finally {
            this.loading.append = false;
        }
    }

    // Membersihkan sheet
    async clearSheet(sheetName) {
        if (!this.initialized) {
            throw new Error('Google Sheets service not initialized');
        }

        this.loading.clear = true;
        try {
            // Ensure we have valid authentication for write operations
            await this.ensureValidToken();

            if (!this.accessToken) {
                console.warn(`Clear operation requires Service Account authentication. Skipping clear for ${sheetName}.`);
                console.log(`Skipped clearing ${sheetName} - using read-only mode`);
                return { message: 'Clear skipped - read-only mode' };
            }            // Jika menggunakan access token atau service account
            const range = `${sheetName}!A:Z`;
            let url, headers;

            if (this.accessToken) {
                url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(range)}:clear`;
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                };
            } else {
                throw new Error('No valid authentication method for write operations. Please configure Service Account or OAuth2.');
            }

            const response = await fetch(url, {
                method: 'POST',
                headers
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Clear sheet error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}. ${errorData.error?.message || ''}`);
            }

            const result = await response.json();
            console.log(`Successfully cleared ${sheetName}`);
            return result;
        } catch (error) {
            console.error('Error clearing Google Sheets:', error);

            // Fallback: return success to prevent blocking other operations
            console.warn('Clear operation failed, continuing with other operations...');
            return { message: 'Clear failed but continuing', error: error.message };
        } finally {
            this.loading.clear = false;
        }
    }

    // Helper function untuk konversi kolom number ke letter
    getColumnLetter(columnNumber) {
        let temp;
        let letter = '';
        while (columnNumber > 0) {
            temp = (columnNumber - 1) % 26;
            letter = String.fromCharCode(temp + 65) + letter;
            columnNumber = (columnNumber - temp - 1) / 26;
        }
        return letter;
    }

    // Mendapatkan status koneksi
    isConnected() {
        return this.initialized;
    }

    // Mendapatkan informasi spreadsheet
    getSpreadsheetId() {
        return this.spreadsheetId;
    }

    // Check and refresh access token if needed
    async ensureValidToken() {
        if (!this.accessToken && this.serviceAccount) {
            console.log('Access token not available, generating new token...');
            this.accessToken = await this.generateServiceAccountToken(this.serviceAccount);
        }
        return this.accessToken;
    }

    // Get authentication mode
    getAuthMode() {
        if (this.accessToken) {
            return 'Service Account (Full Access)';
        } else if (this.apiKey) {
            return 'API Key (Read-Only)';
        } else {
            return 'Not Authenticated';
        }
    }

    // Get loading state
    getLoadingState() {
        return { ...this.loading };
    }

    // Check if any operation is loading
    isLoading() {
        return Object.values(this.loading).some(state => state);
    }

    // Get specific loading state
    isLoadingOperation(operation) {
        return this.loading[operation] || false;
    }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;