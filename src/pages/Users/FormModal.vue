<template>
  <Dialog :open="open" @update:open="closeModal">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru' }}</DialogTitle>
        <DialogDescription>
          {{ isEditMode ? 'Lakukan perubahan pada detail pengguna di bawah ini.' : 'Isi detail untuk pengguna baru.' }}
        </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit">
        <!-- Hidden fields untuk preserve data yang tidak ditampilkan -->
        <input type="hidden" v-model="form.id" />
        
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="">
              Nama
            </Label>
            <Input id="name" v-model="form.name" class="col-span-3" required />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="email" class="">
              Email
            </Label>
            <Input id="email" type="email" v-model="form.email" class="col-span-3" required />
          </div>
          <div class="grid grid-cols-4 items-center gap-4" v-if="!isEditMode">
            <Label for="password" class="">
              Password
            </Label>
            <Input id="password" type="password" v-model="form.password" class="col-span-3" required />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="role" class="">
              Role
            </Label>
            <Select v-model="form.role" class="col-span-3" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    default: () => ({ id: null, name: '', email: '', password: '', role: 'user' }),
  },
});

const emit = defineEmits(['update:open', 'submit']);

// --- STATE ---
const form = reactive({
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'user',
});

// --- WATCHERS ---
// Sinkronkan data dari parent (initialData) ke state lokal (form)
// saat modal dibuka atau data awal berubah.
watch(() => props.initialData, (newData) => {
  if (newData) {
    form.id = newData.id || null;
    form.name = newData.name || '';
    form.email = newData.email || '';
    form.password = newData.password || '';
    form.role = newData.role || 'user';
  }
}, { deep: true, immediate: true });

// --- METHODS ---
const closeModal = () => {
  emit('update:open', false);
};

const handleSubmit = () => {
  // Debug: Log data yang akan dikirim
  console.log('UserFormModal - Data yang akan dikirim:', { ...form });
  
  // Untuk edit mode, tidak kirim password jika kosong
  const submitData = { ...form };
  if (props.isEditMode && !submitData.password) {
    delete submitData.password;
  }
  
  // Mengirim data form ke parent component
  emit('submit', submitData);
  closeModal();
};
</script>