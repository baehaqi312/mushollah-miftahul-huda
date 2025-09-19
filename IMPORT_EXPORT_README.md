# Fitur Import & Export Excel untuk Data Barang

## Overview
Fitur ini memungkinkan pengguna untuk mengimpor dan mengekspor data barang dari/ke file Excel (.xlsx, .xls) untuk memudahkan pengelolaan inventori mushollah.

## Fitur yang Tersedia

### 1. Export Data ke Excel
- **Fungsi**: Mengekspor semua data barang yang ada ke file Excel
- **Format File**: .xlsx
- **Data yang Diekspor**:
  - Nama Barang
  - Jumlah
  - Status
- **Nama File**: `data-barang-YYYY-MM-DD-HH-mm-ss.xlsx`

### 2. Import Data dari Excel
- **Fungsi**: Mengimpor data barang dari file Excel ke sistem
- **Format File**: .xlsx, .xls, .csv
- **Validasi**:
  - Nama Barang (wajib)
  - Jumlah (wajib, harus angka positif)
  - Status (opsional, default: "Dipinjam")

### 3. Download Template
- **Fungsi**: Mengunduh template Excel kosong dengan format yang benar
- **Berisi**: Contoh data dan format yang sesuai untuk import
- **Nama File**: `template-data-barang.xlsx`

## Format Data Excel untuk Import

### Kolom yang Diperlukan:
| Kolom | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| Nama Barang | Text | Ya | Nama item/barang |
| Jumlah | Text | Ya | Jumlah barang |
| Status | Text | Tidak | Dipinjam, Tersedia, Dikembalikan (default: Dipinjam) |

### Contoh Data Excel:
```
Nama Barang    | Jumlah | Status
Kursi Plastik  | 25     | Tersedia
Meja Lipat     | 10     | Dipinjam
Sound System   | 1      | Tersedia
```

## Cara Penggunaan

### Export Data:
1. Buka halaman **Data Barang**
2. Klik tombol **"Export Excel"** di panel Import & Export
3. File akan otomatis terdownload dengan nama `data-barang-[timestamp].xlsx`

### Download Template:
1. Klik tombol **"Download Template"** 
2. File template akan terdownload dengan nama `template-data-barang.xlsx`
3. Buka file dan isi dengan data sesuai format

### Import Data:
1. Siapkan file Excel dengan format yang sesuai (gunakan template)
2. Klik **"Choose File"** dan pilih file Excel
3. Klik tombol **"Import"** 
4. Sistem akan memvalidasi data:
   - Jika berhasil: Data akan ditambahkan dan muncul notifikasi sukses
   - Jika ada error: Akan muncul daftar error yang perlu diperbaiki

## Validasi Import

### Error yang Mungkin Terjadi:
- **"Nama Barang tidak boleh kosong"**: Pastikan kolom Nama Barang diisi
- **"Jumlah harus berupa angka positif"**: Pastikan Jumlah berupa angka > 0
- **"Format file tidak didukung"**: Gunakan file .xlsx, .xls, atau .csv

### Tips Import yang Berhasil:
1. **Gunakan Template**: Selalu mulai dari template yang disediakan
2. **Periksa Format**: Pastikan data sesuai dengan tipe yang diminta
3. **Jangan Ada Baris Kosong**: Hapus baris kosong di tengah data
4. **Konsisten Status**: Gunakan status yang konsisten (Dipinjam/Tersedia/Dikembalikan)
5. **Backup Data**: Ekspor data lama sebelum import data baru

## Troubleshooting

### File Tidak Bisa Diimport:
- Pastikan file tidak sedang dibuka di Excel
- Cek format file (harus .xlsx, .xls, atau .csv)
- Pastikan file tidak corrupt atau password-protected

### Data Tidak Muncul Setelah Import:
- Refresh halaman browser
- Cek apakah ada pesan error di notifikasi

### Performance:
- Untuk file besar (>1000 baris), import mungkin membutuhkan waktu lebih lama
- Disarankan import data dalam batch 500-1000 baris

## Technical Implementation

### Dependencies:
- **xlsx**: Library untuk membaca/menulis file Excel
- **FileReader API**: Untuk membaca file dari browser
- **Vue 3 Composition API**: Untuk reaktivitas dan state management

### File Locations:
- **Service**: `src/services/barangService.js`
- **Component**: `src/pages/Barang/ImportExportPanel.vue`
- **Main Page**: `src/pages/Barang/Index.vue`