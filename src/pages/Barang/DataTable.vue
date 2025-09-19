<script setup>
import {
    FlexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useVueTable,
} from "@tanstack/vue-table"
import { ArrowUpDown, ChevronDown } from "lucide-vue-next"
import { h, ref, watch, reactive } from "vue"
import { valueUpdater } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// Import services dan components
import { addItem, updateItem, deleteItem, returnItem } from '@/services/barangService'
import FormModal from './FormModal.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import ReturnConfirmDialog from '@/components/ui/ReturnConfirmDialog.vue'

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
    },
})

const emit = defineEmits(['refresh'])

const data = ref(props.items);

watch(
    () => props.items,
    (newVal) => {
        data.value = newVal
    }
)

const columns = [
    {
        accessorKey: "name",
        header: ({ column }) => h(
            Button,
            {
                variant: "ghost",
                onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            },
            () => ["Nama Peminjam", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
        ),
        cell: ({ row }) => h("div", { class: "capitalize" }, row.getValue("name")),
    },
    {
        accessorKey: "jumlah",
        header: ({ column }) => h(
            Button,
            {
                variant: "ghost",
                onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            },
            () => ["Jumlah", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
        ),
        cell: ({ row }) => h("div", { class: "text-center" }, row.getValue("jumlah")),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status")
            const className = status === "Dipinjam" ? "text-red-600 font-semibold" : "text-green-600 font-semibold"
            return h("div", { class: className }, status)
        },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => h("div", { class: "text-center" }, "Actions"),
      cell: ({ row }) => {
        const item = row.original
        return h("div", { class: "flex gap-2 justify-center" }, [
          h(Button, {
            variant: "secondary",
            size: "sm",
            disabled: row.getValue("status") !== "Dipinjam",
            onClick: () => confirmReturn(item)
          }, () => "Return"),
          h(Button, {
            variant: "outline",
            size: "sm",
            onClick: () => openEditModal(item)
          }, () => "Edit"),
          h(Button, {
            variant: "destructive",
            size: "sm",
            onClick: () => confirmDelete(item)
          }, () => "Hapus"),
        ].filter(Boolean)) // Remove null values
      },
    },
]

const sorting = ref([])
const columnFilters = ref([])
const columnVisibility = ref({})
const rowSelection = ref({})
const expanded = ref({})

const table = useVueTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
    onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
    onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
    state: {
        get sorting() { return sorting.value },
        get columnFilters() { return columnFilters.value },
        get columnVisibility() { return columnVisibility.value },
        get rowSelection() { return rowSelection.value },
        get expanded() { return expanded.value },
    },
})

const namaFilter = ref(table.getColumn('name')?.getFilterValue() || "")
watch(namaFilter, (val) => {
    table.getColumn('name')?.setFilterValue(val)
})

// State untuk modal CRUD
const showFormModal = ref(false)
const isEditMode = ref(false)
const formData = reactive({
  id: null,
  name: '',
  jumlah: '',
  status: 'Dipinjam',
})

// State untuk confirmation dialogs
const showDeleteDialog = ref(false)
const showReturnDialog = ref(false)
const selectedItem = ref(null)
const deleteMessage = ref('')
const returnMessage = ref('')

// Fungsi untuk membuka modal (mode tambah)
const openCreateModal = () => {
  isEditMode.value = false
  // Reset form data
  Object.assign(formData, { id: null, name: '', jumlah: '', status: 'Dipinjam' })
  showFormModal.value = true
}

// Fungsi untuk membuka modal (mode edit)
const openEditModal = (item) => {
  isEditMode.value = true
  // Isi form data dengan data item yang dipilih
  Object.assign(formData, item)
  showFormModal.value = true
}

// Fungsi yang menangani event @submit dari modal
const handleFormSubmit = (data) => {
  console.log('DataTable - Data diterima dari FormModal:', data);
  console.log('DataTable - Mode:', isEditMode.value ? 'Edit' : 'Add');
  
  if (isEditMode.value) {
    updateItem(data)
  } else {
    addItem(data)
  }
  // Beri tahu parent (Index.vue) untuk memuat ulang data
  emit('refresh')
}

// Fungsi untuk menampilkan dialog konfirmasi delete
const confirmDelete = (item) => {
  selectedItem.value = item
  deleteMessage.value = `Apakah Anda yakin ingin menghapus peminjaman dari "${item.name}"?`
  showDeleteDialog.value = true
}

// Fungsi untuk menampilkan dialog konfirmasi return
const confirmReturn = (item) => {
  selectedItem.value = item
  returnMessage.value = `Konfirmasi pengembalian dari "${item.name}"?`
  showReturnDialog.value = true
}

// Fungsi yang dipanggil saat konfirmasi delete
const handleDeleteConfirm = () => {
  if (selectedItem.value) {
    deleteItem(selectedItem.value.id)
    emit('refresh')
    selectedItem.value = null
  }
}

// Fungsi yang dipanggil saat konfirmasi return
const handleReturnConfirm = () => {
  if (selectedItem.value) {
    returnItem(selectedItem.value.id)
    emit('refresh')
    selectedItem.value = null
  }
}
</script>

<template>
    <div class="w-full">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
            <Input class="max-w-sm" placeholder="Filter nama peminjam..." v-model="namaFilter" />
            <div class="ml-auto flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button variant="outline" class="ml-auto">
                            Columns
                            <ChevronDown class="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem
                            v-for="column in table.getAllColumns().filter(col => col.getCanHide())" :key="column.id"
                            class="capitalize" :model-value="column.getIsVisible()"
                            @update:model-value="value => column.toggleVisibility(!!value)">
                            {{ column.id }}
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button class="ms-2" @click="openCreateModal">Tambah Peminjaman</Button>
            </div>
        </div>
        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <TableHead v-for="header in headerGroup.headers" :key="header.id">
                            <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                                :props="header.getContext()" />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="table.getRowModel().rows?.length">
                        <template v-for="row in table.getRowModel().rows" :key="row.id">
                            <TableRow :data-state="row.getIsSelected() ? 'selected' : undefined">
                                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                                </TableCell>
                            </TableRow>
                            <TableRow v-if="row.getIsExpanded()">
                                <TableCell :colspan="row.getAllCells().length">
                                    {{ JSON.stringify(row.original) }}
                                </TableCell>
                            </TableRow>
                        </template>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="columns.length" class="h-24 text-center">
                            No results.
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
        <div class="flex items-center justify-end space-x-2 py-4">
            <div class="flex-1 text-sm text-muted-foreground">
                {{ table.getPaginationRowModel().rows.length }} of
                {{ table.getFilteredRowModel().rows.length }} row(s) selected.
            </div>
            <div class="space-x-2">
                <Button variant="outline" size="sm" :disabled="!table.getCanPreviousPage()"
                    @click="table.previousPage()">
                    Previous
                </Button>
                <Button variant="outline" size="sm" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
                    Next
                </Button>
            </div>
        </div>

        <!-- Form Modal for Add/Edit -->
        <FormModal 
            v-model:open="showFormModal" 
            :is-edit-mode="isEditMode" 
            :initial-data="formData" 
            @submit="handleFormSubmit"
        />

        <!-- Delete Confirmation Dialog -->
        <DeleteConfirmDialog
            v-model:open="showDeleteDialog"
            :message="deleteMessage"
            @confirm="handleDeleteConfirm"
        />

        <!-- Return Confirmation Dialog -->
        <ReturnConfirmDialog
            v-model:open="showReturnDialog"
            :message="returnMessage"
            @confirm="handleReturnConfirm"
        />
    </div>
</template>
