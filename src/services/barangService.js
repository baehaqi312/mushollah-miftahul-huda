import { getItems, saveItems } from './storageService';
import * as XLSX from 'xlsx';

export const fetchItems = () => getItems();

export const addItem = (item) => {
    const items = getItems();
    const newItem = {
        ...item,
        id: Date.now(), // ID unik sederhana
        status: 'Dipinjam' // Default status saat menambah item baru
    };
    items.push(newItem);
    saveItems(items);
};

export const updateItem = (updatedItem) => {
    console.log('barangService - updateItem called with:', updatedItem);
    let items = getItems();
    console.log('barangService - items before update:', items);
    items = items.map(item => (item.id === updatedItem.id ? updatedItem : item));
    console.log('barangService - items after update:', items);
    saveItems(items);
};

export const deleteItem = (itemId) => {
    let items = getItems();
    items = items.filter(item => item.id !== itemId);
    saveItems(items);
};

export const returnItem = (itemId) => {
    let items = getItems();
    items = items.map(item => {
        if (item.id === itemId) {
            return { ...item, status: 'Dikembalikan' };
        }
        return item;
    });
    saveItems(items);
};

// Export data barang ke Excel
export const exportToExcel = () => {
    const items = getItems();

    // Prepare data untuk export dengan header yang lebih user-friendly
    const exportData = items.map(item => ({
        'Nama Barang': item.name,
        'Jumlah': item.jumlah || item.quantity,
        'Status': item.status
    }));

    // Create workbook dan worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();

    // Set column widths
    ws['!cols'] = [
        { wch: 30 }, // Nama Barang
        { wch: 15 }, // Jumlah
        { wch: 15 }  // Status
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Data Barang");

    // Generate filename dengan timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `data-barang-${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);

    return {
        success: true,
        message: `Data berhasil diekspor ke ${filename}`,
        filename
    };
};

// Import data barang dari Excel
export const importFromExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Ambil worksheet pertama
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert ke JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    resolve({
                        success: false,
                        message: 'File Excel kosong atau tidak memiliki data',
                        importedCount: 0
                    });
                    return;
                }

                // Validasi dan format data
                const currentItems = getItems();
                const newItems = [];
                const errors = [];

                jsonData.forEach((row, index) => {
                    const rowNum = index + 2; // +2 karena index dimulai dari 0 dan ada header

                    // Mapping field names (flexible untuk berbagai format)
                    const name = row['Nama Barang'] || row['nama_barang'] || row['name'] || row['Nama'];
                    const jumlah = row['Jumlah'] || row['jumlah'] || row['quantity'] || row['Quantity'];
                    const status = row['Status'] || row['status'] || 'Dipinjam';

                    // Validasi required fields
                    if (!name) {
                        errors.push(`Baris ${rowNum}: Nama Barang tidak boleh kosong`);
                        return;
                    }

                    if (!jumlah || isNaN(jumlah) || jumlah <= 0) {
                        errors.push(`Baris ${rowNum}: Jumlah harus berupa angka positif`);
                        return;
                    }

                    // Create new item
                    const newItem = {
                        id: Date.now() + Math.random(), // Unique ID
                        name: String(name).trim(),
                        jumlah: String(jumlah).trim(),
                        status: String(status).trim()
                    };

                    newItems.push(newItem);
                });

                if (errors.length > 0) {
                    resolve({
                        success: false,
                        message: 'Terdapat error dalam data:',
                        errors,
                        importedCount: 0
                    });
                    return;
                }

                // Simpan data baru
                const allItems = [...currentItems, ...newItems];
                saveItems(allItems);

                resolve({
                    success: true,
                    message: `Berhasil mengimpor ${newItems.length} data barang`,
                    importedCount: newItems.length,
                    items: newItems
                });

            } catch (error) {
                reject({
                    success: false,
                    message: 'Error membaca file Excel: ' + error.message
                });
            }
        };

        reader.onerror = () => {
            reject({
                success: false,
                message: 'Error membaca file'
            });
        };

        reader.readAsArrayBuffer(file);
    });
};

// Generate template Excel untuk import
export const downloadTemplate = () => {
    const templateData = [
        {
            'Nama Barang': 'Contoh Kursi Plastik',
            'Jumlah': '25',
            'Status': 'Dipinjam'
        },
        {
            'Nama Barang': 'Contoh Meja Lipat',
            'Jumlah': '10',
            'Status': 'Tersedia'
        }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();

    // Set column widths
    ws['!cols'] = [
        { wch: 30 }, // Nama Barang
        { wch: 15 }, // Jumlah
        { wch: 15 }  // Status
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Template Data Barang");

    const filename = 'template-data-barang.xlsx';
    XLSX.writeFile(wb, filename);

    return {
        success: true,
        message: `Template berhasil diunduh: ${filename}`,
        filename
    };
};