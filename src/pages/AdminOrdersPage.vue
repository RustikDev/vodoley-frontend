<template>
  <q-page class="q-pa-lg orders-page">

    <!-- Header -->
    <div class="orders-header q-mb-lg">
      <div>
        <div class="orders-title">Заказы</div>
        <div class="orders-sub">Управление заказами покупателей</div>
      </div>
      <VdsBtn variant="secondary" icon="refresh" label="Обновить" :loading="loading" @click="reload" />
    </div>

    <!-- Filters -->
    <div class="filters-card q-mb-md">
      <!-- Search -->
      <q-input
        v-model="search"
        dense outlined clearable
        placeholder="Поиск по телефону, имени, фамилии"
        class="filters-search"
        debounce="400"
        @update:model-value="onFilterChange"
      >
        <template #prepend><q-icon name="search" color="grey-5" /></template>
      </q-input>

      <div class="filters-divider" />

      <!-- Delivery type -->
      <div class="filters-group">
        <span class="filters-group__label">Тип</span>
        <div class="filters-seg">
          <button
            v-for="opt in deliveryOptions"
            :key="String(opt.value)"
            class="filters-seg__btn"
            :class="{ 'filters-seg__btn--active': deliveryFilter === opt.value }"
            @click="deliveryFilter = opt.value; onFilterChange()"
          >{{ opt.label }}</button>
        </div>
      </div>

      <div class="filters-divider" />

      <!-- Sort -->
      <div class="filters-group">
        <span class="filters-group__label">Сортировка</span>
        <div class="filters-sort">
          <q-select
            v-model="sortBy"
            :options="sortByOptions"
            dense borderless
            emit-value map-options
            class="filters-sort__select"
            @update:model-value="onFilterChange"
          />
          <button
            class="filters-sort__dir"
            :title="sortOrder === 'desc' ? 'По убыванию' : 'По возрастанию'"
            @click="sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'; onFilterChange()"
          >
            <q-icon :name="sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'" size="16px" />
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="orders-table-wrap">
      <q-table
        flat bordered
        row-key="id"
        :rows="rows"
        :columns="columns"
        :loading="loading"
        v-model:pagination="pagination"
        :rows-per-page-options="[10, 20, 50]"
        @request="onRequest"
      >
        <!-- Имя -->
        <template #body-cell-name="p">
          <q-td :props="p">
            <span class="text-weight-medium">{{ p.row.lastName }} {{ p.row.firstName }}</span>
          </q-td>
        </template>

        <!-- Телефон -->
        <template #body-cell-phone="p">
          <q-td :props="p">
            <a :href="`tel:${p.row.phone}`" class="phone-link">{{ formatPhone(p.row.phone) }}</a>
          </q-td>
        </template>

        <!-- Доставка -->
        <template #body-cell-delivery="p">
          <q-td :props="p">
            <span class="delivery-chip" :class="p.row.delivery ? 'delivery-chip--yes' : 'delivery-chip--no'">
              <q-icon :name="p.row.delivery ? 'local_shipping' : 'storefront'" size="13px" />
              {{ p.row.delivery ? 'Доставка' : 'Самовывоз' }}
            </span>
          </q-td>
        </template>

        <!-- Адрес -->
        <template #body-cell-address="p">
          <q-td :props="p">
            <span v-if="p.row.address" class="address-cell">{{ p.row.address }}</span>
            <span v-else class="text-grey-4">—</span>
          </q-td>
        </template>

        <!-- Сумма -->
        <template #body-cell-totalAmount="p">
          <q-td :props="p" class="text-right">
            <span class="amount-val">{{ formatAmount(p.row.totalAmount) }}</span>
          </q-td>
        </template>

        <!-- Дата -->
        <template #body-cell-createdAt="p">
          <q-td :props="p">
            <span class="date-val">{{ formatDate(p.row.createdAt) }}</span>
          </q-td>
        </template>

        <!-- Действия -->
        <template #body-cell-actions="p">
          <q-td :props="p" class="actions-cell">
            <VdsBtn variant="ghost" color="primary" icon="visibility" size="sm" @click="openDetail(p.row)">
              <q-tooltip>Просмотр</q-tooltip>
            </VdsBtn>
            <VdsBtn variant="danger-ghost" icon="delete" size="sm" @click="confirmDelete(p.row)">
              <q-tooltip>Удалить</q-tooltip>
            </VdsBtn>
          </q-td>
        </template>

        <template #no-data>
          <div class="q-pa-lg text-grey-5 text-center full-width">
            Заказов не найдено
          </div>
        </template>
      </q-table>
    </div>

    <!-- Detail dialog -->
    <q-dialog v-model="detailOpen" maximized>
      <q-card class="detail-card">
        <q-card-section class="detail-header row items-center">
          <div>
            <div class="detail-title">Заказ #{{ detailOrder?.id }}</div>
            <div class="detail-sub">{{ formatDate(detailOrder?.createdAt ?? '') }}</div>
          </div>
          <q-space />
          <VdsBtn variant="ghost" icon="close" @click="detailOpen = false" />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="detailLoading" class="q-pa-xl text-center">
          <q-spinner size="40px" color="primary" />
        </q-card-section>

        <q-card-section v-else-if="detailOrder" class="detail-body">
          <div class="row q-col-gutter-md q-mb-lg">
            <!-- Customer info -->
            <div class="col-12 col-md-6">
              <div class="info-block">
                <div class="info-block__title">
                  <q-icon name="person" size="16px" />
                  Покупатель
                </div>
                <div class="info-row">
                  <span class="info-label">Имя</span>
                  <span class="info-val">{{ detailOrder.firstName }} {{ detailOrder.lastName }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Телефон</span>
                  <a :href="`tel:${detailOrder.phone}`" class="info-val phone-link">{{ formatPhone(detailOrder.phone) }}</a>
                </div>
              </div>
            </div>

            <!-- Delivery info -->
            <div class="col-12 col-md-6">
              <div class="info-block">
                <div class="info-block__title">
                  <q-icon name="local_shipping" size="16px" />
                  Доставка
                </div>
                <div class="info-row">
                  <span class="info-label">Тип</span>
                  <span class="delivery-chip" :class="detailOrder.delivery ? 'delivery-chip--yes' : 'delivery-chip--no'">
                    <q-icon :name="detailOrder.delivery ? 'local_shipping' : 'storefront'" size="13px" />
                    {{ detailOrder.delivery ? 'Доставка' : 'Самовывоз' }}
                  </span>
                </div>
                <div v-if="detailOrder.delivery && detailOrder.address" class="info-row">
                  <span class="info-label">Адрес</span>
                  <span class="info-val">{{ detailOrder.address }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Items table -->
          <div class="info-block">
            <div class="info-block__title">
              <q-icon name="shopping_cart" size="16px" />
              Позиции заказа
            </div>
            <q-table
              flat
              :rows="detailOrder.items ?? []"
              :columns="itemColumns"
              row-key="productId"
              hide-pagination
              :rows-per-page-options="[0]"
            >
              <template #body-cell-price="p">
                <q-td :props="p" class="text-right">{{ formatAmount(p.row.price) }}</q-td>
              </template>
              <template #body-cell-total="p">
                <q-td :props="p" class="text-right">
                  <span class="text-weight-bold">{{ formatAmount(p.row.total) }}</span>
                </q-td>
              </template>
            </q-table>

            <div class="total-row q-mt-md">
              <span class="total-label">Итого:</span>
              <span class="total-val">{{ formatAmount(detailOrder.totalAmount) }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <VdsBtn variant="danger-ghost" icon="delete" label="Удалить заказ" @click="confirmDeleteFromDetail" />
          <VdsBtn variant="ghost" label="Закрыть" @click="detailOpen = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete confirm -->
    <q-dialog v-model="deleteOpen">
      <q-card style="min-width:320px">
        <q-card-section class="row items-center gap-sm">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <div class="q-ml-md">
            <div class="text-weight-bold">Удалить заказ #{{ deleteTarget?.id }}?</div>
            <div class="text-grey-6 text-sm q-mt-xs">
              {{ deleteTarget?.lastName }} {{ deleteTarget?.firstName }} — {{ formatAmount(deleteTarget?.totalAmount ?? 0) }}
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <VdsBtn variant="ghost" label="Отмена" @click="deleteOpen = false" />
          <VdsBtn variant="danger" label="Удалить" :loading="deleteLoading" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar, type QTableProps } from 'quasar';
import VdsBtn from 'src/components/VdsBtn.vue';
import { useApi } from 'src/api/useApi';
import type { AdminOrder } from 'src/types/api';

const $q = useQuasar();
const api = useApi();

/* ── State ── */
const rows = ref<AdminOrder[]>([]);
const loading = ref(false);
const pagination = ref({ page: 1, rowsPerPage: 20, rowsNumber: 0 });

const search = ref('');
const deliveryFilter = ref<boolean | null>(null);
const sortBy = ref<'createdAt' | 'totalAmount' | 'lastName'>('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');

/* ── Columns ── */
const columns: QTableProps['columns'] = [
  { name: 'id',          label: '#',        field: 'id',          align: 'left',  sortable: false, style: 'width:60px' },
  { name: 'name',        label: 'Клиент',   field: 'lastName',    align: 'left',  sortable: false },
  { name: 'phone',       label: 'Телефон',  field: 'phone',       align: 'left',  sortable: false },
  { name: 'delivery',    label: 'Тип',      field: 'delivery',    align: 'center',sortable: false },
  { name: 'address',     label: 'Адрес',    field: 'address',     align: 'left',  sortable: false },
  { name: 'totalAmount', label: 'Сумма',    field: 'totalAmount', align: 'right', sortable: false },
  { name: 'createdAt',   label: 'Дата',     field: 'createdAt',   align: 'left',  sortable: false },
  { name: 'actions',     label: '',         field: 'id',          align: 'right', sortable: false },
];

const itemColumns: QTableProps['columns'] = [
  { name: 'name',     label: 'Товар',     field: 'name',     align: 'left'  },
  { name: 'unit',     label: 'Ед.',       field: 'unit',     align: 'center'},
  { name: 'quantity', label: 'Кол-во',    field: 'quantity', align: 'right' },
  { name: 'price',    label: 'Цена',      field: 'price',    align: 'right' },
  { name: 'total',    label: 'Итого',     field: 'total',    align: 'right' },
];

/* ── Options ── */
const deliveryOptions = [
  { label: 'Все',        value: null  },
  { label: 'Доставка',   value: true  },
  { label: 'Самовывоз',  value: false },
];

const sortByOptions = [
  { label: 'По дате',    value: 'createdAt'   },
  { label: 'По сумме',   value: 'totalAmount' },
  { label: 'По фамилии', value: 'lastName'    },
];

/* ── Load ── */
async function loadOrders(page: number, rowsPerPage: number) {
  loading.value = true;
  try {
    const query: Record<string, unknown> = {
      page,
      limit: rowsPerPage,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
    };
    if (search.value) query.search = search.value;
    if (deliveryFilter.value !== null) query.delivery = deliveryFilter.value;

    const res = await api.adminOrdersList(query);
    rows.value = res.data;
    pagination.value.rowsNumber = res.meta.total;
    pagination.value.page = res.meta.page;
  } finally {
    loading.value = false;
  }
}

function reload() {
  void loadOrders(pagination.value.page, pagination.value.rowsPerPage);
}

function onFilterChange() {
  pagination.value.page = 1;
  reload();
}

function onRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page;
  pagination.value.rowsPerPage = props.pagination.rowsPerPage;
  reload();
}

onMounted(reload);

/* ── Detail ── */
const detailOpen = ref(false);
const detailOrder = ref<AdminOrder | null>(null);
const detailLoading = ref(false);

async function openDetail(row: AdminOrder) {
  detailOpen.value = true;
  if (row.items) {
    detailOrder.value = row;
    return;
  }
  detailLoading.value = true;
  detailOrder.value = row;
  try {
    detailOrder.value = await api.adminOrderById(row.id);
  } finally {
    detailLoading.value = false;
  }
}

/* ── Delete ── */
const deleteOpen = ref(false);
const deleteTarget = ref<AdminOrder | null>(null);
const deleteLoading = ref(false);

function confirmDelete(row: AdminOrder) {
  deleteTarget.value = row;
  deleteOpen.value = true;
}

function confirmDeleteFromDetail() {
  if (!detailOrder.value) return;
  deleteTarget.value = detailOrder.value;
  detailOpen.value = false;
  deleteOpen.value = true;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  deleteLoading.value = true;
  try {
    await api.adminDeleteOrder(deleteTarget.value.id);
    $q.notify({ type: 'positive', message: `Заказ #${deleteTarget.value.id} удалён` });
    deleteOpen.value = false;
    deleteTarget.value = null;
    reload();
  } finally {
    deleteLoading.value = false;
  }
}

/* ── Formatters ── */
function formatAmount(val: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('7')) return `8${digits.slice(1)}`;
  if (digits.length === 10) return `8${digits}`;
  return phone;
}
</script>

<style scoped>
.orders-page { background: #f6f8fd; min-height: 100vh; }

.orders-header {
  display: flex; flex-wrap: wrap;
  align-items: flex-start; justify-content: space-between; gap: 12px;
}
.orders-title { font-size: 26px; font-weight: 800; color: #0e1430; letter-spacing: -0.4px; }
.orders-sub { font-size: 14px; color: #6b7596; margin-top: 2px; }

.filters-card {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  background: #fff;
  border: 1px solid #e8edf8;
  border-radius: 14px;
  padding: 10px 16px;
  gap: 4px;
}

.filters-search {
  flex: 1;
  min-width: 200px;
}
:deep(.filters-search .q-field__control) {
  background: #f6f8fd;
  border-radius: 8px;
}
:deep(.filters-search .q-field__control::before) {
  border-color: transparent !important;
}
:deep(.filters-search .q-field__control:hover::before) {
  border-color: #d0d7ee !important;
}

.filters-divider {
  width: 1px;
  height: 32px;
  background: #e8edf8;
  margin: 0 12px;
  flex-shrink: 0;
}

.filters-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.filters-group__label {
  font-size: 12px;
  font-weight: 600;
  color: #8a94b8;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filters-seg {
  display: flex;
  gap: 6px;
}
.filters-seg__btn {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid #d8dfef;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #6b7596;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  white-space: nowrap;
  line-height: 1.4;
}
.filters-seg__btn:hover {
  border-color: #a0aece;
  color: #0e1430;
}
.filters-seg__btn--active {
  border-color: #2557e6 !important;
  background: #eff4ff !important;
  color: #2557e6 !important;
  font-weight: 600;
}

.filters-sort {
  display: flex;
  align-items: center;
  background: #f6f8fd;
  border-radius: 8px;
  padding: 0 4px 0 8px;
  gap: 2px;
}
.filters-sort__select {
  min-width: 130px;
  font-size: 13px;
}
:deep(.filters-sort__select .q-field__native) {
  font-size: 13px;
  font-weight: 500;
  color: #2b3460;
  padding: 0;
}
:deep(.filters-sort__select .q-field__control) {
  min-height: 32px;
  padding: 0;
}
:deep(.filters-sort__select .q-field__append) {
  padding: 0;
}
.filters-sort__dir {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #5a6284;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.filters-sort__dir:hover {
  background: #e8edf8;
  color: #2557e6;
}

.orders-table-wrap {
  background: #fff;
  border: 1px solid #e8edf8;
  border-radius: 16px;
  overflow: hidden;
}

.phone-link { color: #2557e6; text-decoration: none; }
.phone-link:hover { text-decoration: underline; }

.delivery-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid;
  white-space: nowrap;
}
.delivery-chip--yes {
  color: #2557e6;
  background: #eff4ff;
  border-color: #c5d5fb;
}
.delivery-chip--no {
  color: #5a6284;
  background: #f4f5f8;
  border-color: #d8dfef;
}

.address-cell {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 200px;
  font-size: 12px;
  color: #5a6284;
}

.amount-val { font-weight: 700; color: #0e1430; white-space: nowrap; }
.date-val { font-size: 12px; color: #6b7596; white-space: nowrap; }
.actions-cell { white-space: nowrap; }

/* Detail dialog */
.detail-card { max-width: 900px; width: 100%; margin: auto; max-height: 90vh; display: flex; flex-direction: column; }
.detail-header { padding: 20px 24px; }
.detail-title { font-size: 20px; font-weight: 800; color: #0e1430; }
.detail-sub { font-size: 13px; color: #6b7596; margin-top: 2px; }
.detail-body { flex: 1; overflow-y: auto; padding: 24px; }

.info-block {
  background: #f8faff;
  border: 1px solid #e8edf8;
  border-radius: 12px;
  padding: 16px;
  height: 100%;
}
.info-block__title {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 700; color: #344066;
  margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;
}
.info-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 14px; }
.info-label { color: #6b7596; min-width: 72px; flex-shrink: 0; }
.info-val { color: #0e1430; font-weight: 500; }

.total-row {
  display: flex; justify-content: flex-end; align-items: center; gap: 16px;
  padding: 12px 16px;
  background: #eff5ff; border-radius: 8px;
}
.total-label { font-size: 15px; font-weight: 600; color: #344066; }
.total-val { font-size: 20px; font-weight: 900; color: #2557e6; }
</style>
