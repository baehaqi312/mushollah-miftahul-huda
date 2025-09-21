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
import { h, ref, watch, reactive, onMounted, onUnmounted } from "vue"
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
import { addItem, updateItem, deleteItem, returnItem, getLoadingState, isLoadingOperation } from '@/services/barangService'
import FormModal from './FormModal.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import ReturnConfirmDialog from '@/components/ui/ReturnConfirmDialog.vue'

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['refresh'])

// Loading state reactive
const loadingState = ref({
    fetch: false,
    add: false,
    update: false,
    delete: false,
    return: false,
    export: false,
    import: false
})

// Update loading state secara berkala
const updateLoadingState = () => {
    loadingState.value = getLoadingState()
}

// Setup interval untuk update loading state
let loadingInterval
onMounted(() => {
    loadingInterval = setInterval(updateLoadingState, 100)
})

onUnmounted(() => {
    if (loadingInterval) {
        clearInterval(loadingInterval)
    }
})

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
                class: "w-full flex justify-center", // text-center for header
                onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            },
            () => [h("span", { class: "w-full text-center" }, "Jumlah"), h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
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
                    disabled: row.getValue("status") !== "Dipinjam" || loadingState.value.return,
                    onClick: () => confirmReturn(item)
                }, () => loadingState.value.return ? "Loading..." : "Return"),
                h(Button, {
                    variant: "outline",
                    size: "sm",
                    disabled: loadingState.value.update,
                    onClick: () => openEditModal(item)
                }, () => loadingState.value.update ? "Loading..." : "Edit"),
                h(Button, {
                    variant: "destructive",
                    size: "sm",
                    disabled: loadingState.value.delete,
                    onClick: () => confirmDelete(item)
                }, () => loadingState.value.delete ? "Loading..." : "Hapus"),
            ].filter(Boolean)) // Remove null values
        },
    },
]

const sorting = ref([{ id: 'created_at', desc: true }]) // Default sort by newest first
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
    console.log('DataTable - Opening create modal');
    isEditMode.value = false;

    // Reset form data dengan nilai default yang jelas
    const defaultData = {
        id: null,
        name: '',
        jumlah: '',
        status: 'Dipinjam',
        created_at: null,
        updated_at: null
    };

    Object.assign(formData, defaultData);
    console.log('DataTable - FormData for create:', { ...formData });

    showFormModal.value = true;
}

// Fungsi untuk membuka modal (mode edit)
const openEditModal = (item) => {
    console.log('DataTable - Opening edit modal for item:', item);
    isEditMode.value = true;

    // Pastikan semua data ter-copy dengan benar
    const itemCopy = {
        id: item.id,
        name: item.name || '',
        jumlah: item.jumlah || '',
        status: item.status || 'Dipinjam',
        created_at: item.created_at,
        updated_at: item.updated_at
    };

    Object.assign(formData, itemCopy);
    console.log('DataTable - FormData after assignment:', { ...formData });

    showFormModal.value = true;
}

// Fungsi yang menangani event @submit dari modal
const handleFormSubmit = async (data) => {
    console.log('DataTable - Data diterima dari FormModal:', data);
    console.log('DataTable - Mode:', isEditMode.value ? 'Edit' : 'Add');

    try {
        let result;
        if (isEditMode.value) {
            result = await updateItem(data);
            console.log('DataTable - Update result:', result);
        } else {
            result = await addItem(data);
            console.log('DataTable - Add result:', result);
        }

        // Refresh data setelah operasi berhasil
        emit('refresh');

        // Log success
        console.log('DataTable - Operation completed successfully');

        return result;
    } catch (error) {
        console.error('DataTable - Error saving item:', error);
        // Re-throw error untuk ditangani di FormModal
        throw error;
    }
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
const handleDeleteConfirm = async () => {
    if (selectedItem.value) {
        try {
            await deleteItem(selectedItem.value.id)
            emit('refresh')
            selectedItem.value = null
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    }
}

// Fungsi yang dipanggil saat konfirmasi return
const handleReturnConfirm = async () => {
    if (selectedItem.value) {
        try {
            await returnItem(selectedItem.value.id)
            emit('refresh')
            selectedItem.value = null
        } catch (error) {
            console.error('Error returning item:', error);
        }
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
                <Button class="ms-2" :disabled="loadingState.add" @click="openCreateModal">
                    {{ loadingState.add ? 'Loading...' : 'Tambah Peminjaman' }}
                </Button>
            </div>
        </div>
        <div class="rounded-md border relative">
            <!-- Loading overlay -->
            <div v-if="loading || loadingState.fetch"
                class="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div class="flex items-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Loading data...</span>
                </div>
            </div>

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
                    <TableRow v-else-if="!loading && !loadingState.fetch">
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
        <FormModal v-model:open="showFormModal" :is-edit-mode="isEditMode" :initial-data="formData"
            @submit="handleFormSubmit" />

        <!-- Delete Confirmation Dialog -->
        <DeleteConfirmDialog v-model:open="showDeleteDialog" :message="deleteMessage" @confirm="handleDeleteConfirm" />

        <!-- Return Confirmation Dialog -->
        <ReturnConfirmDialog v-model:open="showReturnDialog" :message="returnMessage" @confirm="handleReturnConfirm" />
    </div>
</template>
