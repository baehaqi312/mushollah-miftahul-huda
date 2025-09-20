# Google Sheets Full Access Setup Guide

## 🎯 Tujuan
Mendapatkan **full CRUD access** ke Google Sheets untuk operasi Create, Read, Update, Delete secara real-time.

## 📋 Prerequisites yang Sudah Terpasang
✅ Library `jose` untuk JWT token generation  
✅ Service Account authentication implementation  
✅ Automatic fallback ke localStorage  
✅ Error handling dan retry mechanism  

## 🔑 Langkah Setup Service Account

### Step 1: Buat Service Account di Google Cloud Console

1. **Buka Google Cloud Console**: https://console.cloud.google.com
2. **Pilih/Buat Project**: Pilih project existing atau buat baru
3. **Aktifkan Google Sheets API**:
   - Pergi ke "APIs & Services" > "Library"
   - Cari "Google Sheets API"
   - Klik "Enable"

4. **Buat Service Account**:
   - Pergi ke "APIs & Services" > "Credentials"
   - Klik "Create Credentials" > "Service Account"
   - Nama: `mushollah-db-access` (atau nama lain)
   - Deskripsi: `Service account for Mushollah app database access`
   - Klik "Create and Continue"
   - Skip role assignment (klik "Continue")
   - Klik "Done"

5. **Generate Key JSON**:
   - Klik pada service account yang baru dibuat
   - Pergi ke tab "Keys"
   - Klik "Add Key" > "Create New Key"
   - Pilih format **JSON**
   - Download file JSON tersebut

### Step 2: Extract Credentials dari JSON

Buka file JSON yang didownload, akan terlihat seperti ini:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "mushollah-db-access@your-project-id.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "universe_domain": "googleapis.com"
}
```

### Step 3: Update Environment Variables

Edit file `.env` di root project:

```env
# Google Sheets Configuration

# METODE 1: API Key (Read-Only) - EXISTING
VITE_GOOGLE_API_KEY=AIzaSyBGdfoP44_seCzTGR4ceF9xC7fo_7Oh4Ac

# METODE 2: Service Account (Full Access) - ADD THESE
VITE_GOOGLE_CLIENT_EMAIL=mushollah-db-access@your-project-id.iam.gserviceaccount.com
VITE_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
VITE_GOOGLE_PROJECT_ID=your-project-id

# Spreadsheet Configuration
VITE_GOOGLE_SPREADSHEET_ID=1agJ-Chxp1-Wn4Cdvd_RZumbHmYy08jXFok_gqRXV7FU

# Full Access Mode
VITE_USE_FALLBACK_STORAGE=false
```

⚠️ **PENTING**: 
- Ganti `your-project-id` dengan project ID sebenarnya
- Ganti `YOUR_ACTUAL_PRIVATE_KEY_HERE` dengan private key dari JSON
- Private key harus dalam format string dengan `\n` untuk newlines

### Step 4: Share Google Sheets dengan Service Account

1. **Buka Google Sheets** Anda
2. **Klik "Share"** (tombol biru di kanan atas)
3. **Masukkan email service account**:
   ```
   mushollah-db-access@your-project-id.iam.gserviceaccount.com
   ```
4. **Set permission ke "Editor"**
5. **Klik "Share"**

### Step 5: Restart Aplikasi

```bash
npm run dev
```

## 🔍 Verifikasi Full Access

Setelah restart aplikasi, cek di Dashboard:

### ✅ Status yang Diharapkan:
- **Connection Status**: 🟢 Terhubung
- **Authentication Mode**: 🟦 Service Account (Full Access)
- **Message**: "You can perform all CRUD operations..."

### ❌ Jika Masih Read-Only:
- **Connection Status**: 🟠 Terhubung  
- **Authentication Mode**: 🟠 API Key (Read-Only)
- **Message**: "Read-only access. Write operations will use localStorage..."

## 🛠️ Troubleshooting

### Problem 1: "Token generation failed"
```
❌ Service Account token generation failed: Error message
```

**Solusi**:
- Pastikan `private_key` di .env sudah benar format
- Pastikan tidak ada karakter tambahan
- Cek bahwa private key dibungkus dengan tanda kutip ganda

### Problem 2: "HTTP error! status: 403"
```
❌ Forbidden: The caller does not have permission
```

**Solusi**:
- Pastikan Google Sheets sudah di-share dengan service account email
- Pastikan permission level adalah "Editor", bukan "Viewer"
- Pastikan Google Sheets API sudah enabled di Google Cloud Console

### Problem 3: "Invalid JWT"
```
❌ Token exchange failed: invalid_grant
```

**Solusi**:
- Cek system clock sudah sinkron
- Pastikan credentials di .env sudah benar
- Regenerate service account key baru

## ✨ Fitur Full Access

Setelah berhasil setup, Anda akan memiliki:

🎯 **Real-time sync** - Data langsung tersimpan ke Google Sheets  
🎯 **CRUD operations** - Create, Read, Update, Delete  
🎯 **Multi-user support** - Beberapa user bisa akses bersamaan  
🎯 **Data persistence** - Data tidak hilang meski restart aplikasi  
🎯 **Backup automatic** - Data tersimpan di cloud Google  

## 📊 Testing Full Access

1. **Buka aplikasi di browser**
2. **Login dan pergi ke Dashboard**
3. **Cek status authentication** (harus "Service Account Full Access")
4. **Test operasi**:
   - Tambah barang baru → cek di Google Sheets
   - Edit barang → cek perubahan di Google Sheets  
   - Hapus barang → cek di Google Sheets
   - Refresh browser → data tetap sama

Jika semua test berhasil, berarti **full access sudah aktif**! 🎉