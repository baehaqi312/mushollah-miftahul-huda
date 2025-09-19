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
import { addUser, updateUser, deleteUser } from '@/services/userService'
import FormModal from './FormModal.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'

const props = defineProps({
    users: {
        type: Array,
        default: () => [],
    },
})

const emit = defineEmits(['refresh'])

const data = ref(props.users)

watch(
    () => props.users,
    (newVal) => {
        data.value = newVal
    }
)

const columns = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => h("div", { class: "capitalize" }, row.getValue("name")),
    },
    {
        accessorKey: "email",
        header: ({ column }) => h(
            Button,
            {
                variant: "ghost",
                onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            },
            () => ["Email", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })]
        ),
        cell: ({ row }) => h("div", { class: "lowercase" }, row.getValue("email")),
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => h("div", { class: "capitalize" }, row.getValue("role")),
    },
    {
        id: "actions",
        enableHiding: false,
        header: "Actions",
        cell: ({ row }) => {
            const user = row.original
            return h("div", { class: "flex gap-2 justify-center" }, [
                h(Button, {
                    size: "sm",
                    variant: "outline",
                    onClick: () => openEditModal(user)
                }, () => "Edit"),
                h(Button, {
                    size: "sm",
                    variant: "destructive",
                    onClick: () => confirmDelete(user)
                }, () => "Hapus")
            ])
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

const emailFilter = ref(table.getColumn('email')?.getFilterValue() || "")
watch(emailFilter, (val) => {
    table.getColumn('email')?.setFilterValue(val)
})

// State untuk modal CRUD
const showFormModal = ref(false)
const isEditMode = ref(false)
const formData = reactive({
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'user',
})

// State untuk confirmation dialogs
const showDeleteDialog = ref(false)
const selectedItem = ref(null)
const deleteMessage = ref('')

// Fungsi untuk membuka modal (mode tambah)
const openCreateModal = () => {
  isEditMode.value = false
  // Reset form data
  Object.assign(formData, { id: null, name: '', email: '', password: '', role: 'user' })
  showFormModal.value = true
}

// Fungsi untuk membuka modal (mode edit)
const openEditModal = (user) => {
  isEditMode.value = true
  // Isi form data dengan data user yang dipilih
  Object.assign(formData, user)
  showFormModal.value = true
}

// Fungsi yang menangani event @submit dari modal
const handleFormSubmit = (data) => {
  console.log('UserDataTable - Data diterima dari FormModal:', data);
  console.log('UserDataTable - Mode:', isEditMode.value ? 'Edit' : 'Add');
  
  if (isEditMode.value) {
    updateUser(data)
  } else {
    addUser(data)
  }
  // Beri tahu parent (Index.vue) untuk memuat ulang data
  emit('refresh')
}

// Fungsi untuk menampilkan dialog konfirmasi delete
const confirmDelete = (user) => {
  selectedItem.value = user
  deleteMessage.value = `Apakah Anda yakin ingin menghapus pengguna "${user.name}" (${user.email})?`
  showDeleteDialog.value = true
}

// Fungsi yang dipanggil saat konfirmasi delete
const handleDeleteConfirm = () => {
  if (selectedItem.value) {
    deleteUser(selectedItem.value.id)
    emit('refresh')
    selectedItem.value = null
  }
}
</script>

<template>
    <div class="w-full">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
            <Input class="max-w-sm" placeholder="Filter emails..." v-model="emailFilter" />
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
                <Button class="ms-2" @click="openCreateModal">Tambah Pengguna</Button>
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
                            <TableRow :data-state="row.getIsSelected() && 'selected'">
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
                {{ table.getFilteredSelectedRowModel().rows.length }} of
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
    </div>
</template>
