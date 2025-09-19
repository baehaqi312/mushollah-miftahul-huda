# Panduan Data Statis untuk Vercel

## Penjelasan Sistem

Aplikasi ini sekarang menggunakan **hybrid data storage** yang dapat bekerja dengan baik di Vercel tanpa database:

1. **Static JSON Files** (`/public/data/`)
2. **localStorage** (sebagai cache/fallback)
3. **Memory cache** (untuk performa)

## Cara Kerja

### 1. Load Data (Priority)
```
1. Coba load dari static JSON files (/data/*.json)
2. Jika gagal, gunakan localStorage
3. Jika kosong, gunakan data default
```

### 2. Save Data
```
1. Simpan ke memory cache
2. Simpan ke localStorage
3. (Opsional) Kirim ke API untuk persistence
```

## Struktur File Data

### `/public/data/users.json`
```json
[
  {
    "id": 1,
    "name": "Admin",
    "email": "admin@admin.com", 
    "password": "password",
    "role": "admin"
  }
]
```

### `/public/data/items.json`
```json
[
  {
    "id": 101,
    "name": "Kursi Plastik",
    "jumlah": "50", 
    "status": "Tersedia"
  }
]
```

## Kelebihan Solusi Ini

✅ **Konsisten di Vercel** - Data sama untuk semua user  
✅ **Cepat** - Static files di-cache oleh CDN  
✅ **Fallback** - Tetap bisa jalan offline  
✅ **Mudah Update** - Edit file JSON langsung  

## Kekurangan & Solusi

❌ **Data tidak persisten** saat user edit
➡️ **Solusi:** Tambahkan API endpoint untuk save permanent

❌ **Semua user lihat data sama**  
➡️ **Solusi:** Tambahkan user-specific data storage

## Cara Update Data Production

### 1. Edit File JSON
```bash
# Edit file di local
nano public/data/items.json

# Deploy ke Vercel
git add .
git commit -m "Update data items"
git push
```

### 2. Gunakan API External (Recommended)
```javascript
// Contoh integrasi dengan API
const API_BASE = process.env.VUE_APP_API_URL || 'https://api.yoursite.com';

export const saveItemsToAPI = async (items) => {
  try {
    await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items)
    });
  } catch (error) {
    console.error('Failed to save to API:', error);
  }
};
```

## Alternatif Lanjutan

### 1. JSONBin.io (Free API)
```javascript
const API_KEY = 'your-jsonbin-key';
const BIN_ID = 'your-bin-id';

const saveToJSONBin = async (data) => {
  await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': API_KEY
    },
    body: JSON.stringify(data)
  });
};
```

### 2. Firebase Realtime Database
```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = { /* your config */ };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const saveToFirebase = (path, data) => {
  set(ref(db, path), data);
};
```

### 3. Supabase (PostgreSQL as a Service)
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'your-supabase-url';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const saveToSupabase = async (table, data) => {
  const { error } = await supabase.from(table).insert(data);
  if (error) console.error(error);
};
```

## Testing

Untuk test local:
```bash
npm run dev
```

Untuk test di Vercel:
```bash
npm run build
npm run preview
```

## Environment Variables (.env)

```env
# Untuk produksi dengan API
VUE_APP_API_URL=https://your-api.com
VUE_APP_USE_STATIC_DATA=true

# Untuk JSONBin
VUE_APP_JSONBIN_KEY=your-key
VUE_APP_JSONBIN_BIN_ID=your-bin-id
```