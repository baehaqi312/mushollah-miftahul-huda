# Sistem Manajemen Mushollah Miftahul Huda

Aplikasi web untuk mengelola data barang dan pengguna Mushollah Miftahul Huda dengan **data storage yang konsisten di Vercel tanpa database**.

## 🚀 Fitur Utama

- ✅ **Hybrid Data Storage** - Bekerja optimal di Vercel
- ✅ **Manajemen Barang** - CRUD barang dengan status pinjam/kembali  
- ✅ **Manajemen Users** - Role-based access control
- ✅ **Export/Import Excel** - Backup dan restore data
- ✅ **Responsive Design** - Tailwind CSS + Reka UI
- ✅ **Dark Mode** - Theme switching support

## 🗄️ Data Storage System

### Tanpa Database - Hybrid Approach:
1. **Static JSON Files** (`/public/data/`) - Data awal yang consistent
2. **localStorage** - Browser cache dan fallback  
3. **External API** - Optional untuk data persistence
4. **Memory Cache** - Performance optimization

### Kelebihan:
- ✅ Data konsisten antar user di Vercel
- ✅ Cepat (static files di-cache CDN)
- ✅ Tidak butuh setup database
- ✅ Mudah deploy dan maintain

## 📖 Dokumentasi

- **[DATA_STORAGE_GUIDE.md](./DATA_STORAGE_GUIDE.md)** - Penjelasan sistem data
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Panduan deploy ke Vercel  
- **[.env.example](./.env.example)** - Konfigurasi environment variables

## 🛠️ Setup Development

```sh
# Clone repository
git clone <repo-url>
cd mushollah-miftahul-huda

# Install dependencies
npm install

# Copy environment config (optional)
cp .env.example .env

# Start development server
npm run dev
```

## 🚀 Deployment ke Vercel

### Quick Deploy:
```sh
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Via GitHub Integration:
1. Push code ke GitHub
2. Connect repository di [vercel.com](https://vercel.com)
3. Deploy otomatis setiap push

## 📁 Struktur Data

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

## 🔧 Konfigurasi Lanjutan

### External API Integration (Optional):
```env
# .env
VITE_USE_API=true
VITE_API_URL=https://your-api.com

# JSONBin.io (Free JSON storage)  
VITE_JSONBIN_KEY=your_key
VITE_JSONBIN_BIN_ID=your_bin_id
```

## 🏗️ Tech Stack

- **Frontend**: Vue 3 + Vite
- **UI Framework**: Tailwind CSS + Reka UI
- **Icons**: Lucide Vue
- **Tables**: TanStack Vue Table  
- **Excel**: SheetJS (xlsx)
- **Storage**: Hybrid (Static + localStorage + API)
- **Deployment**: Vercel

## 📋 Scripts

```sh
# Development
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```
