<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Товары</div>
      <div class="row q-gutter-sm">
        <q-input v-model.trim="filters.q" dense outlined clearable placeholder="Поиск" style="width: 260px" />
        <q-btn outline icon="refresh" label="Обновить" :loading="loading" @click="reload" />
        <q-btn color="primary" icon="add" label="Создать" @click="openCreate" />
      </div>
    </div>

    <q-table
      flat
      bordered
      row-key="id"
      :rows="rows"
      :columns="columns"
      :loading="loading"
      v-model:pagination="pagination"
      @request="onRequest"
    >
      <template #body-cell-price="p">
        <q-td :props="p" class="text-right">{{ formatPriceRub(p.row.price) }}</q-td>
      </template>
      <template #body-cell-category="p">
        <q-td :props="p">{{ categoryName(p.row.categoryId) }}</q-td>
      </template>
      <template #body-cell-unit="p">
        <q-td :props="p">{{ unitName(p.row.unitId) }}</q-td>
      </template>
      <template #body-cell-inventory="p">
        <q-td :props="p">
          <div v-if="p.row.inventory" class="text-body2">
            {{ p.row.inventory.status }} • {{ p.row.inventory.quantity }}
          </div>
          <div v-else class="text-grey-7">—</div>
        </q-td>
      </template>
      <template #body-cell-actions="p">
        <q-td :props="p" class="text-right">
          <q-btn flat dense icon="edit" @click="openEdit(p.row)" />
          <q-btn flat dense icon="delete" color="negative" @click="confirmDelete(p.row)" />
        </q-td>
      </template>
      <template #no-data>
        <div class="q-pa-md text-grey-7">Нет данных</div>
      </template>
    </q-table>

    <q-dialog v-model="dialogOpen">
      <q-card style="width: 900px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Редактирование' : 'Создание' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model.trim="form.name" outlined label="Название" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.trim="form.slug" outlined label="Slug" />
            </div>
            <div class="col-12">
              <q-input v-model="form.description" outlined type="textarea" autogrow label="Описание" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model.number="form.price" outlined type="number" label="Цена" />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.categoryId"
                outlined
                emit-value
                map-options
                label="Категория"
                :options="categoryOptions"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.unitId"
                outlined
                emit-value
                map-options
                label="Ед. изм."
                :options="unitOptions"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-toggle v-model="form.isActive" label="Активен" />
            </div>

            <div class="col-12 col-md-4">
              <q-input v-model.number="form.inventoryQuantity" outlined type="number" label="Остаток" />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.inventoryStatus"
                outlined
                label="Статус"
                :options="inventoryStatusOptions"
              />
            </div>

            <div class="col-12">
              <q-file
                v-model="form.images"
                multiple
                outlined
                accept="image/*"
                label="Изображения"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" v-close-popup />
          <q-btn color="primary" label="Сохранить" :loading="saving" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Dialog, Notify } from 'quasar';
import type { QTableColumn } from 'quasar';
import { useApi } from 'src/api/useApi';
import { formatPriceRub } from 'src/utils/format';
import type { Category, InventoryStatus, Paginated, Product, ProductListQuery, Unit } from 'src/types/api';

const api = useApi();

const loading = ref(false);
const saving = ref(false);

const rows = ref<Product[]>([]);
const total = ref(0);

const pagination = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
});

const filters = reactive({
  q: '',
});

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Название', field: 'name', align: 'left', sortable: true },
  { name: 'price', label: 'Цена', field: 'price', align: 'right', sortable: true },
  { name: 'category', label: 'Категория', field: 'categoryId', align: 'left' },
  { name: 'unit', label: 'Ед.', field: 'unitId', align: 'left' },
  { name: 'isActive', label: 'Активен', field: 'isActive', align: 'left' },
  { name: 'inventory', label: 'Остаток', field: 'inventory', align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
];

const categories = ref<Category[]>([]);
const units = ref<Unit[]>([]);

const categoryOptions = computed(() =>
  categories.value
    .map((c) => ({ label: c.name, value: c.id }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ru')),
);

const unitOptions = computed(() =>
  units.value
    .map((u) => ({ label: `${u.name} (${u.shortName})`, value: u.id }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ru')),
);

function categoryName(id: number) {
  return categories.value.find((c) => c.id === id)?.name ?? String(id);
}

function unitName(id: number) {
  const u = units.value.find((x) => x.id === id);
  return u ? u.shortName : String(id);
}

const inventoryStatusOptions: InventoryStatus[] = ['IN_STOCK', 'OUT_OF_STOCK', 'ON_ORDER'];

type CreateMultipartPayload = {
  name: string;
  slug: string;
  price: number;
  categoryId: number;
  unitId: number;
  isActive?: boolean;
  description?: string;
  inventoryQuantity?: number;
  inventoryStatus?: InventoryStatus;
  images?: File[];
};

type ProductForm = {
  id: number | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: number | null;
  unitId: number | null;
  isActive: boolean;
  inventoryQuantity: number | null;
  inventoryStatus: InventoryStatus;
  images: File[];
};

const dialogOpen = ref(false);
const form = reactive<ProductForm>({
  id: null as number | null,
  name: '',
  slug: '',
  description: '',
  price: 0,
  categoryId: null as number | null,
  unitId: null as number | null,
  isActive: true,
  inventoryQuantity: null as number | null,
  inventoryStatus: 'IN_STOCK',
  images: [] as File[],
});

async function loadRefs() {
  [categories.value, units.value] = await Promise.all([api.adminCategoriesList(), api.adminUnitsList()]);
}

async function reload() {
  loading.value = true;
  try {
    const page = pagination.value.page;
    const pageSize = pagination.value.rowsPerPage;

    const query: ProductListQuery = {
      page,
      pageSize,
      sort: 'newest',
    };

    if (filters.q) query.q = filters.q;

    const data: Paginated<Product> = await api.adminProductsList(query);

    rows.value = data.items;
    total.value = data.total;
    pagination.value.rowsNumber = data.total;
  } finally {
    loading.value = false;
  }
}

function onRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page;
  pagination.value.rowsPerPage = props.pagination.rowsPerPage;
  void reload();
}

function openCreate() {
  form.id = null;
  form.name = '';
  form.slug = '';
  form.description = '';
  form.price = 0;
  form.categoryId = categoryOptions.value[0]?.value ?? null;
  form.unitId = unitOptions.value[0]?.value ?? null;
  form.isActive = true;
  form.inventoryQuantity = null;
  form.inventoryStatus = 'IN_STOCK';
  form.images = [];
  dialogOpen.value = true;
}

function openEdit(p: Product) {
  form.id = p.id;
  form.name = p.name;
  form.slug = p.slug;
  form.description = p.description ?? '';
  form.price = p.price;
  form.categoryId = p.categoryId;
  form.unitId = p.unitId;
  form.isActive = p.isActive;
  form.inventoryQuantity = p.inventory?.quantity ?? null;
  form.inventoryStatus = p.inventory?.status ?? 'IN_STOCK';
  form.images = [];
  dialogOpen.value = true;
}

async function save() {
  if (!form.name.trim() || !form.slug.trim() || !form.categoryId || !form.unitId) {
    Notify.create({ type: 'warning', message: 'Заполни обязательные поля' });
    return;
  }

  saving.value = true;
  try {
    if (form.id) {
      await api.adminUpdateProduct(form.id, {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: form.price,
        categoryId: form.categoryId,
        unitId: form.unitId,
        isActive: form.isActive,
      });

      await api.adminUpdateInventory(form.id, {
        quantity: form.inventoryQuantity ?? 0,
        status: form.inventoryStatus,
      });

      for (const f of form.images) {
        await api.adminUploadProductImage(form.id, f);
      }
    } else {
            const payload: CreateMultipartPayload = {
        name: form.name,
        slug: form.slug,
        price: form.price,
        categoryId: form.categoryId,
        unitId: form.unitId,
        isActive: form.isActive,
        inventoryStatus: form.inventoryStatus,
        images: form.images,
      };

      if (form.description && form.description.trim().length > 0) payload.description = form.description;
      if (form.inventoryQuantity != null) payload.inventoryQuantity = form.inventoryQuantity;

      await api.adminCreateProductMultipart(payload);
    }

    dialogOpen.value = false;
    await reload();
    Notify.create({ type: 'positive', message: 'Сохранено' });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(p: Product) {
  Dialog.create({
    title: 'Удалить?',
    message: `Удалить «${p.name}»?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      await api.adminDeleteProduct(p.id);
      await reload();
      Notify.create({ type: 'positive', message: 'Удалено' });
    })();
  });
}

watch(
  () => filters.q,
  (_v, _o, onCleanup) => {
    pagination.value.page = 1;
    const t = window.setTimeout(() => void reload(), 350);
    onCleanup(() => window.clearTimeout(t));
  },
);

onMounted(async () => {
  await loadRefs();
  await reload();
});
</script>









