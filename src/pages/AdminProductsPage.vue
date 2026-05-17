<template>
  <q-page class="q-pa-md vds-container">
    <div class="row wrap items-center justify-between q-mb-md" style="gap:8px">
      <div class="text-h6">Товары</div>
      <div class="row q-gutter-sm">
        <q-btn outline icon="refresh" label="Обновить" :loading="loading" @click="reload" />
        <q-btn color="primary" icon="add" label="Создать" @click="openCreate" />
      </div>
    </div>

    <div class="row wrap q-gutter-sm q-mb-md items-center">
      <q-input v-model.trim="filters.q" dense outlined clearable placeholder="Поиск по названию" class="filter-search" />
      <q-select
        v-model="filters.categoryId"
        dense outlined emit-value map-options clearable
        label="Категория"
        class="filter-select"
        :options="[{ label: 'Все категории', value: null }, ...categoryOptions]"
      />
      <q-select
        v-model="filters.brandId"
        dense outlined emit-value map-options clearable
        label="Бренд"
        class="filter-select"
        :options="[{ label: 'Все бренды', value: null }, ...brandOptions.filter(o => o.value !== null)]"
      />
      <q-toggle v-model="filters.isActive" label="Только активные" />
      <q-toggle v-model="filters.isHit" label="Только хиты" />
      <div class="text-caption text-grey-6">Найдено: {{ rows.length }}</div>
    </div>

    <VdsErrorState
      v-if="error"
      title="Ошибка"
      :description="error"
      :on-retry="reload"
    />
    <q-table
      flat
      bordered
      row-key="id"
      :rows="rows"
      :columns="columns"
      :loading="loading"
      v-model:pagination="pagination"
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
            {{ p.row.inventory.statusLabel ?? p.row.inventory.status }} • {{ p.row.inventory.quantity }}
          </div>
          <div v-else class="text-grey-7">—</div>
        </q-td>
      </template>
      <template #body-cell-isActive="p">
        <q-td :props="p" class="text-center">
          <q-toggle
            :model-value="p.row.isActive"
            color="primary"
            :loading="togglingActive === p.row.id"
            @update:model-value="toggleActive(p.row)"
          />
        </q-td>
      </template>

      <template #body-cell-isHit="p">
        <q-td :props="p" class="text-center">
          <q-toggle
            :model-value="p.row.isHit"
            color="orange"
            :loading="togglingHit === p.row.id"
            @update:model-value="toggleHit(p.row)"
          />
        </q-td>
      </template>

      <template #body-cell-actions="p">
        <q-td :props="p" class="text-right">
          <q-btn flat dense icon="edit" @click="openEdit(p.row)" />
          <q-btn flat dense icon="delete" color="negative" @click="confirmDelete(p.row)" />
        </q-td>
      </template>
      <template #no-data>
        <VdsEmptyState icon="inbox" title="Нет данных" description="Попробуй обновить или создать запись" />
      </template>
    </q-table>

    <q-dialog v-model="dialogOpen">
      <q-card style="width: 900px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Редактирование' : 'Создание' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
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
              <q-select
                v-model="form.brandId"
                outlined
                emit-value
                map-options
                clearable
                label="Бренд"
                :options="brandOptions"
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
                emit-value
                map-options
                option-value="value"
                option-label="label"
                label="Статус"
                :options="inventoryStatusOptions"
              />
            </div>

            <div class="col-12" v-if="form.id && form.existingImages.length > 0">
              <div class="text-caption text-grey-7 q-mb-xs">Текущие изображения</div>
              <div class="row q-col-gutter-sm">
                <div v-for="img in form.existingImages" :key="img.id" class="col-auto img-thumb-wrap">
                  <q-img
                    :src="api.toAbsoluteUploadUrl(img.url)"
                    class="img-thumb"
                    :ratio="1"
                  />
                  <q-badge v-if="img.isMain" color="primary" class="img-thumb-main-badge" label="Гл." />
                  <button class="img-thumb-remove" type="button" @click="deleteExistingImage(img.id)">
                    <q-icon name="close" size="12px" />
                  </button>
                </div>
              </div>
            </div>

            <div class="col-12">
              <q-file
                v-model="form.images"
                multiple
                outlined
                accept="image/*"
                label="Добавить изображения"
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
import VdsEmptyState from 'src/components/VdsEmptyState.vue';
import VdsErrorState from 'src/components/VdsErrorState.vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { Dialog, Notify, type QTableColumn } from 'quasar';
import { useApi } from 'src/api/useApi';
import { formatPriceRub } from 'src/utils/format';
import type { Brand, Category, InventoryStatus, InventoryStatusOption, Product, ProductImage, Unit, UpdateProductRequest } from 'src/types/api';

const api = useApi();

const loading = ref(false);
const error = ref<string | null>(null);
const saving = ref(false);

const allRows = ref<Product[]>([]);

const filters = reactive({
  q: '',
  categoryId: null as number | null,
  brandId: null as number | null,
  isActive: false,
  isHit: false,
});

const rows = computed(() => {
  const q = filters.q.trim().toLowerCase();
  return allRows.value.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (filters.categoryId !== null && p.categoryId !== filters.categoryId) return false;
    if (filters.brandId !== null && p.brandId !== filters.brandId) return false;
    if (filters.isActive && !p.isActive) return false;
    if (filters.isHit && !p.isHit) return false;
    return true;
  });
});

const pagination = ref({
  page: 1,
  rowsPerPage: 20,
});

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Название', field: 'name', align: 'left', sortable: true },
  { name: 'price', label: 'Цена', field: 'price', align: 'right', sortable: true },
  { name: 'category', label: 'Категория', field: 'categoryId', align: 'left' },
  { name: 'unit', label: 'Ед.', field: 'unitId', align: 'left' },
  { name: 'isActive', label: 'Активен', field: 'isActive', align: 'left' },
  { name: 'isHit', label: 'Хит', field: 'isHit', align: 'center' },
  { name: 'inventory', label: 'Остаток', field: 'inventory', align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
];

const categories = ref<Category[]>([]);
const units = ref<Unit[]>([]);
const brands = ref<Brand[]>([]);

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

const brandOptions = computed(() => [
  { label: 'Без бренда', value: null },
  ...brands.value
    .map((b) => ({ label: b.name, value: b.id }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ru')),
]);

function categoryName(id: number) {
  return categories.value.find((c) => c.id === id)?.name ?? String(id);
}

function unitName(id: number) {
  const u = units.value.find((x) => x.id === id);
  return u ? u.shortName : String(id);
}

const inventoryStatusOptions = ref<InventoryStatusOption[]>([]);

type CreateMultipartPayload = {
  name: string;
  slug: string;
  price: number;
  categoryId: number;
  unitId: number;
  brandId?: number;
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
  brandId: number | null;
  isActive: boolean;
  inventoryQuantity: number | null;
  inventoryStatus: InventoryStatus;
  images: File[];
  existingImages: ProductImage[];
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
  brandId: null as number | null,
  isActive: true,
  inventoryQuantity: null as number | null,
  inventoryStatus: 'IN_STOCK',
  images: [] as File[],
  existingImages: [] as ProductImage[],
});

async function loadRefs() {
  [categories.value, units.value, brands.value, inventoryStatusOptions.value] = await Promise.all([
    api.adminCategoriesList(),
    api.adminUnitsList(),
    api.adminBrandsList(),
    api.inventoryStatuses(),
  ]);
}

async function reload() {
  error.value = null;
  loading.value = true;
  try {
    allRows.value = await api.adminProductsList();
    pagination.value.page = 1;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки';
    throw e;
  } finally {
    loading.value = false;
  }
}


function openCreate() {
  form.id = null;
  form.name = '';
  form.slug = '';
  form.description = '';
  form.price = 0;
  form.categoryId = categoryOptions.value[0]?.value ?? null;
  form.unitId = unitOptions.value[0]?.value ?? null;
  form.brandId = null;
  form.isActive = true;
  form.inventoryQuantity = null;
  form.inventoryStatus = 'IN_STOCK';
  form.images = [];
  form.existingImages = [];
  dialogOpen.value = true;
}

function openEdit(p: Product) {
  form.id = p.id;
  form.name = p.name;
  form.slug = p.slug;
  form.description = p.description ?? '';
  form.price = parseFloat(p.price);
  form.categoryId = p.categoryId;
  form.unitId = p.unitId;
  form.brandId = p.brandId ?? null;
  form.isActive = p.isActive;
  form.inventoryQuantity = p.inventory?.quantity ?? null;
  form.inventoryStatus = p.inventory?.status ?? 'IN_STOCK';
  form.images = [];
  form.existingImages = [...(p.images ?? [])];
  dialogOpen.value = true;
}

async function deleteExistingImage(imageId: number) {
  if (!form.id) return;
  try {
    await api.adminDeleteProductImage(form.id, imageId);
    form.existingImages = form.existingImages.filter((i) => i.id !== imageId);
    Notify.create({ type: 'positive', message: 'Изображение удалено' });
  } catch (e) {
    Notify.create({ type: 'negative', message: e instanceof Error ? e.message : 'Ошибка удаления' });
  }
}

async function save() {
  if (!form.name.trim() || !form.slug.trim() || !form.categoryId || !form.unitId) {
    Notify.create({ type: 'warning', message: 'Заполни обязательные поля' });
    return;
  }

  saving.value = true;
  try {
    if (form.id) {
      const updatePayload: UpdateProductRequest = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: form.price,
        categoryId: form.categoryId ?? undefined,
        unitId: form.unitId ?? undefined,
        isActive: form.isActive,
      };
      if (form.brandId !== null && form.brandId !== undefined) updatePayload.brandId = form.brandId;
      await api.adminUpdateProduct(form.id, updatePayload);

      const origInventory = allRows.value.find((p) => p.id === form.id)?.inventory;
      const invChanged =
        form.inventoryQuantity !== (origInventory?.quantity ?? null) ||
        form.inventoryStatus !== (origInventory?.status ?? 'IN_STOCK');
      if (invChanged) {
        await api.adminUpdateInventory(form.id, {
          quantity: form.inventoryQuantity ?? 0,
          status: form.inventoryStatus,
        });
      }

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
      if (form.inventoryQuantity !== null && form.inventoryQuantity !== undefined) payload.inventoryQuantity = form.inventoryQuantity;
      if (form.brandId !== null && form.brandId !== undefined) payload.brandId = form.brandId;

      await api.adminCreateProductMultipart(payload);
    }

    dialogOpen.value = false;
    await reload();
    Notify.create({ type: 'positive', message: 'Сохранено' });
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки';
    throw e;
  } finally {
    saving.value = false;
  }
}

const togglingActive = ref<number | null>(null);

async function toggleActive(p: Product) {
  if (togglingActive.value === p.id) return;
  togglingActive.value = p.id;
  const newVal = !p.isActive;
  const row = allRows.value.find((r) => r.id === p.id);
  if (row) row.isActive = newVal;
  try {
    await api.adminUpdateProduct(p.id, { isActive: newVal });
  } catch (e) {
    if (row) row.isActive = !newVal;
    Notify.create({ type: 'negative', message: e instanceof Error ? e.message : 'Ошибка' });
  } finally {
    togglingActive.value = null;
  }
}

const togglingHit = ref<number | null>(null);

async function toggleHit(p: Product) {
  if (togglingHit.value === p.id) return;
  togglingHit.value = p.id;
  const newVal = !p.isHit;
  const row = allRows.value.find((r) => r.id === p.id);
  if (row) row.isHit = newVal;
  try {
    await api.adminSetProductHit(p.id, newVal);
  } catch (e) {
    if (row) row.isHit = !newVal;
    Notify.create({ type: 'negative', message: e instanceof Error ? e.message : 'Ошибка' });
  } finally {
    togglingHit.value = null;
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
      try {
        await api.adminDeleteProduct(p.id);
        await reload();
        Notify.create({ type: 'positive', message: 'Удалено' });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Ошибка удаления';
        Notify.create({ type: 'negative', message: msg });
      }
    })();
  });
}

watch(
  () => [filters.q, filters.categoryId, filters.brandId, filters.isActive, filters.isHit],
  () => { pagination.value.page = 1; },
);

onMounted(async () => {
  await loadRefs();
  await reload();
});
</script>

<style scoped>
.filter-search { width: 240px; }
.filter-select { width: 180px; }
@media (max-width: 599px) {
  .filter-search, .filter-select { width: 100%; }
}

.img-thumb-wrap {
  position: relative;
  width: 80px;
  height: 80px;
}

.img-thumb {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
}

.img-thumb-remove {
  position: absolute;
  top: 8px;
  right: -9px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: #e53935;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
  transition: background 0.15s;
}

.img-thumb-remove:hover {
  background: #b71c1c;
}

.img-thumb-main-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
}
</style>














