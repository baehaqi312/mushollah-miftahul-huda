<template>
  <div class="flex flex-col gap-4 p-4 border rounded-lg bg-card">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Import & Export Data</h3>
      <div class="flex gap-2">
        <Button 
          @click="handleExport"
          variant="outline"
          size="sm"
          :disabled="isProcessing"
        >
          <Download class="w-4 h-4 mr-2" />
          Export Excel
        </Button>
        
        <Button 
          @click="handleDownloadTemplate"
          variant="outline"
          size="sm"
        >
          <FileDown class="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>
    </div>
    
    <!-- Import Section -->
    <div class="grid gap-4">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <Label for="file-input" class="text-sm font-medium">
            Import dari Excel
          </Label>
          <div class="mt-1">
            <input
              id="file-input"
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls,.csv"
              @change="handleFileSelect"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
        </div>
        
        <Button 
          @click="handleImport"
          :disabled="!selectedFile || isProcessing"
          size="sm"
          class="mt-6"
        >
          <Upload class="w-4 h-4 mr-2" />
          <span v-if="isProcessing">Processing...</span>
          <span v-else>Import</span>
        </Button>
      </div>
      
      <!-- Progress indicator -->
      <div v-if="isProcessing" class="flex items-center gap-2 text-sm text-muted-foreground">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        Memproses file...
      </div>
    </div>
    
    <!-- Status Messages -->
    <div v-if="statusMessage" class="space-y-2">
      <div 
        :class="[
          'p-3 rounded-md text-sm',
          statusMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          statusMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        ]"
      >
        <div class="flex items-start gap-2">
          <CheckCircle v-if="statusMessage.type === 'success'" class="w-4 h-4 mt-0.5 flex-shrink-0" />
          <XCircle v-else-if="statusMessage.type === 'error'" class="w-4 h-4 mt-0.5 flex-shrink-0" />
          <Info v-else class="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div class="flex-1">
            <p class="font-medium">{{ statusMessage.message }}</p>
            <ul v-if="statusMessage.errors && statusMessage.errors.length > 0" class="mt-2 text-xs space-y-1">
              <li v-for="error in statusMessage.errors.slice(0, 10)" :key="error" class="flex items-start gap-1">
                <span class="text-red-500">•</span>
                {{ error }}
              </li>
              <li v-if="statusMessage.errors.length > 10" class="text-xs text-muted-foreground">
                ... dan {{ statusMessage.errors.length - 10 }} error lainnya
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Import Results -->
    <div v-if="importResults && importResults.success && importResults.items" class="space-y-2">
      <h4 class="text-sm font-medium text-green-800">Data yang berhasil diimpor:</h4>
      <div class="max-h-32 overflow-y-auto bg-green-50 p-2 rounded text-xs">
        <div v-for="item in importResults.items.slice(0, 5)" :key="item.id" class="text-green-700">
          • {{ item.name }} - Jumlah: {{ item.jumlah }} - Status: {{ item.status }}
        </div>
        <div v-if="importResults.items.length > 5" class="text-green-600 mt-1">
          ... dan {{ importResults.items.length - 5 }} item lainnya
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  Upload, 
  FileDown, 
  CheckCircle, 
  XCircle, 
  Info 
} from 'lucide-vue-next';
import { 
  exportToExcel, 
  importFromExcel, 
  downloadTemplate 
} from '@/services/barangService';

const emit = defineEmits(['refresh']);

const fileInput = ref(null);
const selectedFile = ref(null);
const isProcessing = ref(false);
const statusMessage = ref(null);
const importResults = ref(null);

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  selectedFile.value = file;
  statusMessage.value = null;
  importResults.value = null;
  
  if (file) {
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                       'application/vnd.ms-excel', 
                       'text/csv'];
    
    if (!validTypes.includes(file.type)) {
      statusMessage.value = {
        type: 'error',
        message: 'Format file tidak didukung. Silakan pilih file Excel (.xlsx, .xls) atau CSV.'
      };
      selectedFile.value = null;
      event.target.value = '';
    }
  }
};

const handleExport = () => {
  try {
    const result = exportToExcel();
    statusMessage.value = {
      type: 'success',
      message: result.message
    };
  } catch (error) {
    statusMessage.value = {
      type: 'error',
      message: 'Gagal mengekspor data: ' + error.message
    };
  }
};

const handleDownloadTemplate = () => {
  try {
    const result = downloadTemplate();
    statusMessage.value = {
      type: 'success',
      message: result.message
    };
  } catch (error) {
    statusMessage.value = {
      type: 'error',
      message: 'Gagal mengunduh template: ' + error.message
    };
  }
};

const handleImport = async () => {
  if (!selectedFile.value) return;
  
  isProcessing.value = true;
  statusMessage.value = null;
  importResults.value = null;
  
  try {
    const result = await importFromExcel(selectedFile.value);
    
    if (result.success) {
      statusMessage.value = {
        type: 'success',
        message: result.message
      };
      importResults.value = result;
      
      // Reset file input
      selectedFile.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
      
      // Refresh data di parent component
      emit('refresh');
      
      // Clear message after 5 seconds
      setTimeout(() => {
        statusMessage.value = null;
        importResults.value = null;
      }, 5000);
    } else {
      statusMessage.value = {
        type: 'error',
        message: result.message,
        errors: result.errors
      };
    }
  } catch (error) {
    statusMessage.value = {
      type: 'error',
      message: error.message || 'Terjadi kesalahan saat mengimpor data'
    };
  } finally {
    isProcessing.value = false;
  }
};
</script>