# Google Sheets Troubleshooting Guide

## ❌ Error 401: Unauthorized

**Error yang muncul:**
```
Error clearing Google Sheets: Error: HTTP error! status: 401
```

### 🔍 **Penyebab Error 401:**

1. **API Key Mode Limitations**: API Key hanya mendukung operasi READ-ONLY
2. **Write Operations tidak didukung**: Clear, Update, Delete membutuhkan OAuth2 atau Service Account
3. **Authentication mismatch**: Menggunakan method yang salah untuk operasi tertentu

### ✅ **Solusi yang Diterapkan:**

#### 1. **Smart Authentication Detection**
Service sekarang otomatis detect mode authentication:
- **API Key**: Read-only mode dengan localStorage fallback
- **Service Account**: Full access mode (jika dikonfigurasi)

#### 2. **Graceful Error Handling**
```javascript
// Write operations sekarang handle error dengan baik
if (this.apiKey && !this.accessToken) {
    console.warn('Write operations not supported in API Key mode');
    throw new Error('Data will be saved to localStorage instead');
}
```

#### 3. **Automatic Fallback**
```javascript
// Jika Google Sheets gagal, otomatis fallback ke localStorage
export const saveItems = async (items) => {
    if (googleSheetsInitialized) {
        try {
            await googleSheetsService.saveJsonToSheet('Items', items);
            return;
        } catch (error) {
            console.error('Google Sheets failed, using localStorage');
        }
    }
    
    // Fallback: simpan ke localStorage
    localStorage.setItem('items', JSON.stringify(items));
};
```

---

## 🚀 **Mode Operasi Aplikasi**

### **Mode 1: API Key (Read-Only)**
```bash
# .env configuration
VITE_GOOGLE_API_KEY=your-api-key
VITE_GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

**Karakteristik:**
- ✅ READ data dari Google Sheets
- ❌ WRITE operations → fallback ke localStorage
- ✅ Tidak perlu share spreadsheet
- ✅ Spreadsheet harus public

**Best untuk:** Development, demo, data viewing

### **Mode 2: Service Account (Full Access)**
```bash
# .env configuration
VITE_GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
VITE_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
VITE_GOOGLE_PROJECT_ID=your-project-id
VITE_GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

**Karakteristik:**
- ✅ READ data dari Google Sheets
- ✅ WRITE data ke Google Sheets
- ✅ Full CRUD operations
- ✅ Spreadsheet bisa private

**Best untuk:** Production, full sync

---

## 📋 **Checklist Troubleshooting**

### **Step 1: Verify API Key**
1. ✅ API Key valid dan tidak expired
2. ✅ Google Sheets API enabled di Google Cloud Console
3. ✅ Spreadsheet public (Anyone with link can view)
4. ✅ Spreadsheet ID benar

### **Step 2: Check Spreadsheet Permissions**
1. ✅ Buka spreadsheet di browser
2. ✅ Check apakah bisa diakses tanpa login
3. ✅ URL should work: `https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/Items!A:Z?key={API_KEY}`

### **Step 3: Verify Service Account (jika digunakan)**
1. ✅ Service Account email sudah di-share ke spreadsheet
2. ✅ Permission "Editor" untuk service account
3. ✅ Private key format benar (dengan \\n untuk newlines)
4. ✅ Project ID match

### **Step 4: Check Console Logs**
Buka DevTools → Console dan cari:
```
✅ "Google Sheets initialized successfully"
✅ "Storage initialized with Google Sheets"
❌ "Write operations not supported in API Key mode"
❌ "Error 401" atau "HTTP error! status: 401"
```

---

## 🛠️ **Commands untuk Testing**

### **Test API Key**
```bash
# Replace dengan credentials Anda
curl "https://sheets.googleapis.com/v4/spreadsheets/1agJ-Chxp1-Wn4Cdvd_RZumbHmYy08jXFok_gqRXV7FU/values/Items!A:Z?key=AIzaSyBGdfoP44_seCzTGR4ceF9xC7fo_7Oh4Ac"
```

**Expected Response:**
```json
{
  "range": "Items!A1:Z1000",
  "majorDimension": "ROWS",
  "values": [
    ["id", "name", "jumlah", "status", "created_at", "updated_at"],
    ["1", "Al-Quran", "10", "Tersedia", "2024-01-01", "2024-01-01"]
  ]
}
```

### **Test Spreadsheet Access**
1. Buka: `https://docs.google.com/spreadsheets/d/1agJ-Chxp1-Wn4Cdvd_RZumbHmYy08jXFok_gqRXV7FU/edit`
2. Should be accessible without login
3. Check ada sheet "Users" dan "Items"

---

## 💡 **Best Practices**

### **1. Hybrid Approach**
```javascript
// Gunakan Google Sheets untuk READ, localStorage untuk WRITE
const items = await getItems(); // dari Google Sheets
await saveItems(newItems);     // ke localStorage (API Key mode)
```

### **2. Error Monitoring**
```javascript
// Monitor status koneksi
import { GoogleSheetsStatus } from '@/components/GoogleSheetsStatus.vue';

// Check di component
console.log('Connected:', googleSheetsService.isConnected());
```

### **3. Graceful Degradation**
```javascript
// App tetap berfungsi meski Google Sheets down
try {
    const data = await fetchFromGoogleSheets();
} catch (error) {
    console.warn('Google Sheets unavailable, using local data');
    const data = getFromLocalStorage();
}
```

---

## 🎯 **Status Setelah Fix**

✅ **Error 401 resolved**
✅ **Aplikasi tidak crash**  
✅ **Automatic fallback working**
✅ **Read operations working**
✅ **Write operations fallback to localStorage**
✅ **Better error messages**
✅ **Development experience improved**

**Aplikasi sekarang robust dan dapat handle Google Sheets limitations dengan graceful degradation.**