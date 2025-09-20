import { getItems, saveItems } from './storageService';
import * as XLSX from 'xlsx';

// Loading state untuk barang service
const loading = {
    fetch: false,
    add: false,
    update: false,
    delete: false,
    return: false,
    export: false,
    import: false
};

// Export loading state
export const getLoadingState = () => ({ ...loading });
export const isLoading = () => Object.values(loading).some(state => state);
export const isLoadingOperation = (operation) => loading[operation] || false;

export const fetchItems = async () => {
    loading.fetch = true;
    try {
        return await getItems();
    } catch (error) {
        console.error('Error fetching items:', error);
        return [];
    } finally {
        loading.fetch = false;
    }
};

export const addItem = async (item) => {
    loading.add = true;
    try {
        const items = await getItems();
        const newItem = {
            ...item,
            id: Date.now(), // ID unik sederhana
            status: 'Dipinjam', // Default status saat menambah item baru
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        items.push(newItem);
        await saveItems(items);
        return newItem;
    } catch (error) {
        console.error('Error adding item:', error);
        throw error;
    } finally {
        loading.add = false;
    }
};

export const updateItem = async (updatedItem) => {
    loading.update = true;
    try {
        console.log('barangService - updateItem called with:', updatedItem);
        let items = await getItems();
        console.log('barangService - items before update:', items);

        const updatedItemWithTimestamp = {
            ...updatedItem,
            updated_at: new Date().toISOString()
        };

        items = items.map(item => (item.id === updatedItem.id ? updatedItemWithTimestamp : item));
        console.log('barangService - items after update:', items);
        await saveItems(items);
        return updatedItemWithTimestamp;
    } catch (error) {
        console.error('Error updating item:', error);
        throw error;
    } finally {
        loading.update = false;
    }
};

export const deleteItem = async (itemId) => {
    loading.delete = true;
    try {
        let items = await getItems();
        items = items.filter(item => item.id !== itemId);
        await saveItems(items);
        return true;
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    } finally {
        loading.delete = false;
    }
};

export const returnItem = async (itemId) => {
    loading.return = true;
    try {
        let items = await getItems();
        items = items.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    status: 'Dikembalikan',
                    updated_at: new Date().toISOString()
                };
            }
            return item;
        });
        await saveItems(items);
        return true;
    } catch (error) {
        console.error('Error returning item:', error);
        throw error;
    } finally {
        loading.return = false;
    }
};

// Export data barang ke Excel
export const exportToExcel = async () => {
    loading.export = true;
    try {
        const items = await getItems();

        // Prepare data untuk export dengan header yang lebih user-friendly
        const exportData = items.map(item => ({
            'Nama Barang': item.name,
            'Jumlah': item.jumlah || item.quantity,
            'Status': item.status,
            'Dibuat': item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '',
            'Diupdate': item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID') : ''
        }));

        // Create workbook dan worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();

        // Set column widths
        ws['!cols'] = [
            { wch: 30 }, // Nama Barang
            { wch: 15 }, // Jumlah
            { wch: 15 }, // Status
            { wch: 15 }, // Dibuat
            { wch: 15 }  // Diupdate
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
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        return {
            success: false,
            message: 'Error saat mengekspor data: ' + error.message
        };
    } finally {
        loading.export = false;
    }
};

// Import data barang dari Excel
export const importFromExcel = (file) => {
    return new Promise((resolve, reject) => {
        loading.import = true;
        const reader = new FileReader();

        reader.onload = async (e) => {
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
                const currentItems = await getItems();
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
                        status: String(status).trim(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
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
                await saveItems(allItems);

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
            } finally {
                loading.import = false;
            }
        };

        reader.onerror = () => {
            loading.import = false;
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