# Mushollah Miftahul Huda - Management System

Sistem manajemen mushollah dengan integrasi **Google Sheets sebagai database utama**. Aplikasi ini menyimpan semua data (users, barang, dll) langsung ke Google Sheets secara real-time.

## 🚀 Fitur Utama

### ✅ Google Sheets Integration
- **Real-time Database**: Semua data tersimpan langsung di Google Sheets
- **Auto Sync**: Perubahan data otomatis tersinkronisasi
- **Fallback System**: Jika Google Sheets tidak tersedia, otomatis menggunakan localStorage
- **Multiple Access**: Support API Key (read-only) dan Service Account (full access)

### ✅ Management Features
- **User Management**: Tambah, edit, hapus pengguna dengan role system
- **Inventory Management**: Kelola barang mushollah dengan status pinjam/kembali
- **Authentication**: Login system dengan session management
- **Import/Export**: Excel import/export functionality
- **Dark Mode**: Theme switching dengan persistensi

### ✅ Technical Features
- **Vue 3**: Modern frontend framework
- **Tailwind CSS**: Utility-first CSS framework  
- **Responsive Design**: Mobile-friendly interface
- **TypeScript Support**: Type safety (opsional)
- **Vite**: Fast build tool

## 📋 Prerequisites

- **Node.js** >= 20.19.0 atau >= 22.12.0
- **Google Account** dengan akses Google Sheets
- **Google Cloud Project** (opsional, untuk full access)

## 🛠️ Quick Start

### 1. Installation
```bash
# Clone repository
git clone <repository-url>
cd mushollah-miftahul-huda

# Install dependencies
npm install
```

### 2. Setup Google Sheets (PENTING!)

**Opsi A: Quick Start (Read-Only)**
1. Buat Google Sheets baru
2. Buat sheets dengan nama: `Users`, `Items`, `Sessions`
3. Buat Google Sheets **public** (Anyone with link can view)
4. Salin Spreadsheet ID dari URL
5. Edit `src/services/googleSheetsConfig.js`:
```javascript
export const GOOGLE_SHEETS_CONFIG = {
    API_KEY: 'your-google-api-key',
    SPREADSHEET_ID: 'your-spreadsheet-id',
    // ...
};
export const USE_FALLBACK_STORAGE = false;
```

**Opsi B: Full Access (Recommended)**
Lihat panduan lengkap di [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)

### 3. Run Application
```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 4. Default Login
```
Email: luthfi@gmail.com
Password: 123456
```

## 📁 Project Structure

```
src/
├── components/           # Vue components
│   ├── GoogleSheetsStatus.vue  # Status koneksi Google Sheets
│   └── ui/              # Reusable UI components
├── services/            # Business logic & API
│   ├── googleSheetsService.js     # Core Google Sheets API
│   ├── googleSheetsConfig.js      # Configuration  
│   ├── storageService.js          # Data storage abstraction
│   ├── authService.js             # Authentication
│   ├── barangService.js           # Inventory management
│   └── userService.js             # User management
├── pages/               # Page components
├── layouts/             # Layout components
└── router/              # Vue Router configuration
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Google Sheets API Key (Read-Only)
VITE_GOOGLE_API_KEY=your-api-key

# Service Account (Full Access)  
VITE_GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
VITE_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
VITE_GOOGLE_PROJECT_ID=your-project-id

# Spreadsheet ID
VITE_GOOGLE_SPREADSHEET_ID=your-spreadsheet-id

# Fallback mode
VITE_USE_FALLBACK_STORAGE=false
```

### Google Sheets Structure

**Sheet: Users**
| id | name | email | password | role | created_at | updated_at |
|----|------|-------|----------|------|------------|------------|

**Sheet: Items**  
| id | name | jumlah | status | created_at | updated_at |
|----|------|--------|--------|------------|------------|

## 🚨 Troubleshooting

### Aplikasi menggunakan localStorage (fallback mode)
- Cek console browser untuk error messages
- Pastikan Google Sheets sudah dikonfigurasi dengan benar
- Lihat [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) untuk panduan lengkap

### Error "Permission denied"
- **API Key**: Pastikan Google Sheets sudah public
- **Service Account**: Pastikan service account di-share ke spreadsheet

### Data tidak tersimpan
- Cek network connection
- Cek Google Sheets permissions
- Cek Google Cloud Console untuk quota limits

## 📊 Monitoring

Status koneksi Google Sheets dapat dilihat di:
1. **Dashboard** - Component `GoogleSheetsStatus` 
2. **Browser Console** - Log aktivitas real-time
3. **Google Sheets** - Lihat data langsung di spreadsheet

## 🔒 Security

### Production Checklist:
- [ ] Gunakan Service Account (bukan API Key)
- [ ] Simpan credentials di environment variables
- [ ] Jangan commit credentials ke Git
- [ ] Gunakan HTTPS untuk production
- [ ] Rotate credentials secara berkala
- [ ] Monitor Google Cloud quota usage

## 📖 Documentation

- [Google Sheets Setup Guide](./GOOGLE_SHEETS_SETUP.md) - Panduan lengkap setup
- [Import/Export Guide](./IMPORT_EXPORT_README.md) - Panduan import/export Excel

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch  
5. Create Pull Request

## 📄 License

MIT License - lihat [LICENSE](LICENSE) file.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```