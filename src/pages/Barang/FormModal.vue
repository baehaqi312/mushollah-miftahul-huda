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
          <Button type="button" variant="outline" @click="closeModal">
            Batal
          </Button>
          <Button type="submit">
            Simpan
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
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

// --- WATCHERS ---
// Sinkronkan data dari parent (initialData) ke state lokal (form)
// saat modal dibuka atau data awal berubah.
watch(() => props.initialData, (newData) => {
  if (newData) {
    form.id = newData.id || null;
    form.name = newData.name || '';
    form.jumlah = newData.jumlah || '';
    form.status = newData.status || 'Dipinjam'; // Preserve status, default untuk add
  }
}, { deep: true, immediate: true });

// --- METHODS ---
const closeModal = () => {
  emit('update:open', false);
};

const handleSubmit = () => {
  // Debug: Log data yang akan dikirim
  console.log('FormModal - Data yang akan dikirim:', { ...form });
  
  // Mengirim data form ke parent component
  emit('submit', { ...form });
  closeModal();
};
</script>