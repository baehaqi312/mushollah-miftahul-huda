<template>
  <Dialog :open="open" @update:open="closeDialog">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogDescription>
          {{ message }}
        </DialogDescription>
      </DialogHeader>
      
      <DialogFooter>
        <Button type="button" variant="outline" @click="closeDialog">
          Batal
        </Button>
        <Button type="button" variant="destructive" @click="confirmAction">
          Hapus
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// --- PROPS & EMITS ---
const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    default: 'Apakah Anda yakin ingin menghapus data ini?',
  },
});

const emit = defineEmits(['update:open', 'confirm']);

// --- METHODS ---
const closeDialog = () => {
  emit('update:open', false);
};

const confirmAction = () => {
  emit('confirm');
  closeDialog();
};
</script>