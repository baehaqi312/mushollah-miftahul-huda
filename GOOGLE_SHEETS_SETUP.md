# Setup Google Sheets sebagai Database

Aplikasi ini telah dikonfigurasi untuk menggunakan Google Sheets sebagai database utama. Berikut adalah panduan setup yang lengkap.

## 🚀 Fitur Google Sheets Integration

- ✅ **CRUD Operations**: Create, Read, Update, Delete data langsung ke Google Sheets
- ✅ **Auto Sync**: Data tersimpan real-time di Google Sheets
- ✅ **Fallback Mode**: Jika Google Sheets tidak tersedia, aplikasi akan menggunakan localStorage
- ✅ **Timestamps**: Setiap data memiliki `created_at` dan `updated_at`
- ✅ **Multiple Sheets**: Mendukung multiple sheets untuk different data types

## 📋 Prerequisites

1. **Google Account** dengan akses ke Google Drive dan Google Sheets
2. **Google Cloud Project** (bisa menggunakan yang gratis)
3. **Google Sheets API** enabled
4. **Credentials** (API Key atau Service Account)

## 🛠️ Setup Steps

### Step 1: Buat Google Sheets

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru dengan nama `Mushollah Miftahul Huda Database`
3. Buat 3 sheets dengan nama:
   - `Users`
   - `Items` 
   - `Sessions` (opsional)

#### Structure untuk Sheet "Users":
| id | name | email | password | role | created_at | updated_at |
|----|------|-------|----------|------|------------|------------|

#### Structure untuk Sheet "Items":
| id | name | jumlah | status | created_at | updated_at |
|----|------|--------|--------|------------|------------|

4. Salin **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```

### Step 2: Setup Google Cloud Project

#### Opsi A: Menggunakan API Key (Read-Only)
Cocok untuk development atau jika hanya perlu read access.

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau pilih existing project
3. Aktifkan **Google Sheets API**:
   - Pergi ke "APIs & Services" > "Library"
   - Cari "Google Sheets API"
   - Klik "Enable"
4. Buat API Key:
   - Pergi ke "APIs & Services" > "Credentials"
   - Klik "Create Credentials" > "API Key"
   - Salin API Key yang dibuat
5. **PENTING**: Buat Google Sheets Anda **public** (Anyone with the link can view)

#### Opsi B: Menggunakan Service Account (Full Access) - RECOMMENDED
Cocok untuk production dengan full CRUD access.

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau pilih existing project
3. Aktifkan **Google Sheets API**
4. Buat Service Account (misal: `mushollah-db-access`):
    - Pergi ke "APIs & Services" > "Credentials"
    - Klik "Create Credentials" > "Service Account"
    - Isi nama service account (disarankan nama yang mudah dikenali, contoh: `mushollah-db-access`)
    - Skip role assignment (tidak diperlukan)
    - Klik "Done"
5. Generate Key untuk Service Account:
    - Klik pada service account yang dibuat
    - Pergi ke tab "Keys"
    - Klik "Add Key" > "Create New Key"
    - Pilih format **JSON**
    - Download file JSON
6. **PENTING**: Share Google Sheets dengan service account email:
    - Buka Google Sheets Anda
    - Klik "Share"
    - Masukkan email service account (format: `nama@project-id.iam.gserviceaccount.com`)
    - Berikan permission "Editor"

### Step 3: Konfigurasi Aplikasi

1. Buka file `src/services/googleSheetsConfig.js`
2. Pilih salah satu metode setup:

#### Untuk API Key (Read-Only):
```javascript
export const GOOGLE_SHEETS_CONFIG = {
    API_KEY: 'your-api-key-here',
    SPREADSHEET_ID: 'your-spreadsheet-id-here',
    // ... rest of config
};

export const USE_FALLBACK_STORAGE = false; // Set ke false untuk menggunakan Google Sheets
```

#### Untuk Service Account (Full Access):
```javascript
export const GOOGLE_SHEETS_CONFIG = {
    SERVICE_ACCOUNT: {
        type: "service_account",
        project_id: "your-project-id",
        private_key_id: "your-private-key-id", 
        private_key: "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
        client_email: "your-service-account@your-project.iam.gserviceaccount.com",
        client_id: "your-client-id",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/..."
    },
    SPREADSHEET_ID: 'your-spreadsheet-id-here',
    // ... rest of config
};

export const USE_FALLBACK_STORAGE = false;
```

### Step 4: Install Dependencies

Jalankan command berikut untuk menginstall dependencies:

```bash
npm install googleapis
```

### Step 5: Test Koneksi

1. Jalankan aplikasi:
```bash
npm run dev
```

2. Buka browser console dan cek apakah ada pesan:
```
Google Sheets initialized successfully
Storage initialization completed
```

3. Coba login dan tambah/edit data untuk memastikan data tersimpan di Google Sheets

## 🔧 Configuration Options

### Spreadsheet Structure
Anda dapat mengubah nama sheets di `googleSheetsConfig.js`:
```javascript
SHEETS: {
    USERS: 'Users',           // Nama sheet untuk users
    ITEMS: 'Items',           // Nama sheet untuk items  
    AUTH_SESSIONS: 'Sessions' // Nama sheet untuk sessions
}
```

### Columns Structure
Anda dapat mengubah struktur kolom:
```javascript
COLUMNS: {
    USERS: ['id', 'name', 'email', 'password', 'role', 'created_at', 'updated_at'],
    ITEMS: ['id', 'name', 'jumlah', 'status', 'created_at', 'updated_at']
}
```

## 🚨 Troubleshooting

### Error: "Google Sheets not configured"
- Pastikan `SPREADSHEET_ID` sudah diisi dengan benar
- Pastikan `API_KEY` atau `SERVICE_ACCOUNT` sudah dikonfigurasi

### Error: "The caller does not have permission"
- Untuk API Key: Pastikan Google Sheets sudah public
- Untuk Service Account: Pastikan service account sudah di-share ke spreadsheet

### Error: "Range not found"
- Pastikan nama sheet sesuai dengan konfigurasi di `GOOGLE_SHEETS_CONFIG.SHEETS`
- Pastikan sheet tidak kosong (minimal ada header row)

### Fallback ke localStorage
Jika Google Sheets tidak tersedia, aplikasi akan otomatis menggunakan localStorage dengan pesan warning di console.

## 🔒 Security Notes

### Untuk Production:
1. **Jangan commit credentials ke Git**. Gunakan environment variables:
```javascript
// Di production, gunakan environment variables
const GOOGLE_SHEETS_CONFIG = {
    SERVICE_ACCOUNT: {
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // ... other credentials from env
    },
    SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID
};
```

2. **Gunakan Service Account** untuk production (lebih secure daripada API Key)
3. **Limit IP access** pada Google Cloud Console jika memungkinkan
4. **Regular rotate credentials**

### Untuk Development:
- API Key + public sheets bisa digunakan untuk development
- Jangan gunakan data sensitif di development sheets

## 📊 Monitoring & Logs

Aplikasi akan log aktivitas di browser console:
- `✅ Google Sheets initialized successfully` - Koneksi berhasil
- `❌ Failed to initialize Google Sheets` - Koneksi gagal
- `📝 Successfully updated X rows` - Data berhasil disimpan
- `⚠️ Using localStorage as fallback` - Menggunakan fallback mode

## 💡 Tips & Best Practices

1. **Backup Regular**: Export data dari Google Sheets secara berkala
2. **Monitor Quota**: Google Sheets API memiliki quota limits
3. **Optimize Requests**: Batch operations untuk performa lebih baik
4. **Error Handling**: Aplikasi sudah memiliki fallback ke localStorage
5. **Data Validation**: Validasi data sebelum menyimpan ke sheets

## 🆘 Support

Jika mengalami kendala, cek:
1. Browser console untuk error messages
2. Google Cloud Console untuk API quota dan errors
3. Google Sheets permissions
4. Network connectivity

---
**Happy coding! 🎉**