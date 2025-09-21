<template>
  <Dialog :open="open" @update:open="closeModal">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ isEditMode ? 'Edit Barang' : 'Tambah Barang Baru' }}</DialogTitle>
        <DialogDescription>
          {{ isEditMode ? 'Lakukan perubahan pada detail barang di bawah ini.' : 'Isi detail untuk barang baru yang akan dipinjam.' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit">
        <!-- Hidden fields untuk preserve data yang tidak ditampilkan -->
        <input type="hidden" v-model="form.id" />
        <input type="hidden" v-model="form.status" />

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="">
              Nama
            </Label>
            <Input id="name" v-model="form.name" class="col-span-3" required />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="jumlah" class="">
              Jumlah
            </Label>
            <Input id="jumlah" type="number" v-model="form.jumlah" class="col-span-3" required />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="isSubmitting" @click="closeModal">
            Batal
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <div v-if="isSubmitting" class="flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2"></div>
              <span>{{ isEditMode ? 'Loading...' : 'Loading...' }}</span>
            </div>
            <span v-else>Simpan</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch, reactive, onMounted, onUnmounted, computed } from 'vue';
import { getLoadingState } from '@/services/barangService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// --- PROPS & EMITS ---
const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object,
    default: () => ({ id: null, name: '', jumlah: '', status: 'Dipinjam' }),
  },
});

const emit = defineEmits(['update:open', 'submit']);

// --- STATE ---
const form = reactive({
  id: null,
  name: '',
  jumlah: '',
  status: '', // Tambahkan status untuk menjaga data yang ada
});

// Method untuk reset form dengan benar
const resetForm = () => {
  form.id = null;
  form.name = '';
  form.jumlah = '';
  form.status = 'Dipinjam';
};

// Loading state
const loadingState = ref({
  add: false,
  update: false
});

// Update loading state
const updateLoadingState = () => {
  const currentLoading = getLoadingState();
  loadingState.value.add = currentLoading.add;
  loadingState.value.update = currentLoading.update;
};

// Setup interval untuk update loading state
let loadingInterval;
onMounted(() => {
  loadingInterval = setInterval(updateLoadingState, 100);
});

onUnmounted(() => {
  if (loadingInterval) {
    clearInterval(loadingInterval);
  }
});

// --- WATCHERS ---
// Sinkronkan data dari parent (initialData) ke state lokal (form)
// saat modal dibuka atau data awal berubah.
watch(() => props.initialData, (newData) => {
  if (newData && props.open) {
    console.log('FormModal - Receiving initialData:', newData);
    form.id = newData.id || null;
    form.name = newData.name || '';
    form.jumlah = newData.jumlah || '';
    form.status = newData.status || 'Dipinjam'; // Preserve status, default untuk add
    console.log('FormModal - Form after update:', { ...form });
  }
}, { deep: true, immediate: true });

// Watch modal open/close
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    // Reset form ketika modal ditutup dari luar
    setTimeout(() => {
      resetForm();
    }, 300); // Delay untuk animasi modal
  }
});

// --- METHODS ---
const closeModal = () => {
  emit('update:open', false);
};

const handleSubmit = async () => {
  // Debug: Log data yang akan dikirim
  console.log('FormModal - Data yang akan dikirim:', { ...form });

  try {
    // Validasi data sebelum submit
    if (!form.name?.trim() || !form.jumlah) {
      console.error('FormModal - Data tidak lengkap:', form);
      alert('Nama dan jumlah tidak boleh kosong');
      return;
    }

    // Prepare clean data
    const submitData = {
      id: form.id,
      name: form.name.trim(),
      jumlah: form.jumlah.toString().trim(),
      status: form.status || 'Dipinjam'
    };

    console.log('FormModal - Clean data to submit:', submitData);

    // Mengirim data form ke parent component dan tunggu responsenya
    const result = await emit('submit', submitData);

    console.log('FormModal - Submit result:', result);

    // Tunggu hingga proses loading selesai sebelum menutup modal
    await waitForLoadingComplete();

    console.log('FormModal - Loading completed, closing modal');

    // Reset form setelah berhasil
    resetForm();
    closeModal();
  } catch (error) {
    console.error('FormModal - Error during submit:', error);
    alert('Terjadi kesalahan saat menyimpan data: ' + error.message);
    // Jangan tutup modal jika ada error
  }
};

// Helper function untuk menunggu loading selesai
const waitForLoadingComplete = () => {
  return new Promise((resolve) => {
    const checkLoading = () => {
      const currentLoading = getLoadingState();
      const isAnyLoading = props.isEditMode ? currentLoading.update : currentLoading.add;

      if (!isAnyLoading) {
        resolve();
      } else {
        setTimeout(checkLoading, 100); // Check setiap 100ms
      }
    };
    checkLoading();
  });
};

// Computed untuk loading state
const isSubmitting = computed(() => {
  return props.isEditMode ? loadingState.value.update : loadingState.value.add;
});
</script>