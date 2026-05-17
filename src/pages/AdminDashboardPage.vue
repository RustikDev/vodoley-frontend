<template>
  <q-page class="dashboard q-pa-lg">

    <!-- Header -->
    <div class="dash-header q-mb-lg">
      <div>
        <div class="dash-title">Дашборд</div>
        <div class="dash-sub">Сводная статистика магазина</div>
      </div>
      <VdsBtn variant="secondary" icon="refresh" label="Обновить" :loading="loading" @click="load" />
    </div>

    <div v-if="loading" class="row q-col-gutter-md q-mb-lg">
      <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-md">
        <q-skeleton height="100px" class="rounded-borders" />
      </div>
    </div>

    <template v-else>
      <!-- Stat cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md">
          <div class="stat-card">
            <div class="stat-card__icon" style="background:#eff5ff">
              <q-icon name="inventory_2" color="primary" size="24px" />
            </div>
            <div class="stat-card__val">{{ stats.totalProducts }}</div>
            <div class="stat-card__label">Всего товаров</div>
            <div class="stat-card__sub">{{ stats.activeProducts }} активных</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md">
          <div class="stat-card">
            <div class="stat-card__icon" style="background:#fff7e6">
              <q-icon name="star" color="orange" size="24px" />
            </div>
            <div class="stat-card__val">{{ stats.hitProducts }}</div>
            <div class="stat-card__label">Хиты продаж</div>
            <div class="stat-card__sub">{{ hitPercent }}% от каталога</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md">
          <div class="stat-card">
            <div class="stat-card__icon" style="background:#f0fff4">
              <q-icon name="check_circle" color="positive" size="24px" />
            </div>
            <div class="stat-card__val">{{ stats.inStock }}</div>
            <div class="stat-card__label">В наличии</div>
            <div class="stat-card__sub">{{ stats.onOrder }} под заказ</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md">
          <div class="stat-card">
            <div class="stat-card__icon" style="background:#fff0f5">
              <q-icon name="label" color="pink" size="24px" />
            </div>
            <div class="stat-card__val">{{ stats.totalBrands }}</div>
            <div class="stat-card__label">Бренды</div>
            <div class="stat-card__sub">{{ stats.activeBrands }} активных</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md">
          <div class="stat-card">
            <div class="stat-card__icon" style="background:#f5f0ff">
              <q-icon name="category" color="deep-purple" size="24px" />
            </div>
            <div class="stat-card__val">{{ stats.totalCategories }}</div>
            <div class="stat-card__label">Категории</div>
            <div class="stat-card__sub">{{ stats.activeCategories }} активных</div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md">
          <div class="stat-card stat-card--clickable" @click="router.push('/admin/orders')">
            <div class="stat-card__icon" style="background:#fff0e6">
              <q-icon name="receipt_long" color="deep-orange" size="24px" />
            </div>
            <div class="stat-card__val">{{ ordersTotal }}</div>
            <div class="stat-card__label">Заказы</div>
            <div class="stat-card__sub">Всего заказов</div>
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="row q-col-gutter-md q-mb-lg">

        <!-- Inventory doughnut -->
        <div class="col-12 col-md-4">
          <div class="chart-card">
            <div class="chart-card__title">Статус склада</div>
            <div class="chart-wrap chart-wrap--sm">
              <Doughnut :data="inventoryChartData" :options="doughnutOptions" />
            </div>
            <div class="legend">
              <div class="legend-item" v-for="item in inventoryLegend" :key="item.label">
                <span class="legend-dot" :style="{ background: item.color }" />
                <span class="legend-label">{{ item.label }}</span>
                <span class="legend-val">{{ item.val }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Active vs Inactive products doughnut -->
        <div class="col-12 col-md-4">
          <div class="chart-card">
            <div class="chart-card__title">Активность товаров</div>
            <div class="chart-wrap chart-wrap--sm">
              <Doughnut :data="activeChartData" :options="doughnutOptions" />
            </div>
            <div class="legend">
              <div class="legend-item" v-for="item in activeLegend" :key="item.label">
                <span class="legend-dot" :style="{ background: item.color }" />
                <span class="legend-label">{{ item.label }}</span>
                <span class="legend-val">{{ item.val }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Hits vs non-hits -->
        <div class="col-12 col-md-4">
          <div class="chart-card">
            <div class="chart-card__title">Хиты продаж</div>
            <div class="chart-wrap chart-wrap--sm">
              <Doughnut :data="hitsChartData" :options="doughnutOptions" />
            </div>
            <div class="legend">
              <div class="legend-item" v-for="item in hitsLegend" :key="item.label">
                <span class="legend-dot" :style="{ background: item.color }" />
                <span class="legend-label">{{ item.label }}</span>
                <span class="legend-val">{{ item.val }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top categories & brands -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <div class="chart-card">
            <div class="chart-card__title">Топ категорий по товарам</div>
            <div class="chart-wrap">
              <Bar :data="topCategoriesChart" :options="barOptions" />
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="chart-card">
            <div class="chart-card__title">Топ брендов по товарам</div>
            <div class="chart-wrap">
              <Bar :data="topBrandsChart" :options="barOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Recent orders -->
      <div class="chart-card">
        <div class="chart-card__title row items-center justify-between">
          <span>Последние заказы</span>
          <VdsBtn variant="ghost" color="primary" size="sm" label="Все заказы" icon-right="arrow_forward" @click="router.push('/admin/orders')" />
        </div>
        <q-table
          flat
          :rows="recentOrders"
          :columns="recentOrdersColumns"
          row-key="id"
          hide-pagination
          :rows-per-page-options="[0]"
          :loading="loading"
          class="orders-table-clickable"
          @row-click="(_e, row) => openOrderDetail(row)"
        >
          <template #body-cell-name="p">
            <q-td :props="p">{{ p.row.lastName }} {{ p.row.firstName }}</q-td>
          </template>
          <template #body-cell-phone="p">
            <q-td :props="p">{{ formatPhone(p.row.phone) }}</q-td>
          </template>
          <template #body-cell-delivery="p">
            <q-td :props="p">
              <span class="delivery-chip" :class="p.row.delivery ? 'delivery-chip--yes' : 'delivery-chip--no'">
                <q-icon :name="p.row.delivery ? 'local_shipping' : 'storefront'" size="13px" />
                {{ p.row.delivery ? 'Доставка' : 'Самовывоз' }}
              </span>
            </q-td>
          </template>
          <template #body-cell-totalAmount="p">
            <q-td :props="p" class="text-right text-weight-bold">
              {{ formatRub(p.row.totalAmount) }}
            </q-td>
          </template>
          <template #body-cell-createdAt="p">
            <q-td :props="p" class="text-grey-6" style="font-size:12px">
              {{ formatShortDate(p.row.createdAt) }}
            </q-td>
          </template>
          <template #no-data>
            <div class="q-pa-md text-grey-5">Заказов пока нет</div>
          </template>
        </q-table>
      </div>

      <!-- Order detail dialog -->
      <q-dialog v-model="orderDetailOpen" maximized>
        <q-card style="max-width:860px;width:100%;margin:auto;max-height:90vh;display:flex;flex-direction:column">
          <q-card-section class="row items-center" style="padding:20px 24px">
            <div>
              <div style="font-size:20px;font-weight:800;color:#0e1430">Заказ #{{ orderDetail?.id }}</div>
              <div style="font-size:13px;color:#6b7596;margin-top:2px">{{ formatShortDate(orderDetail?.createdAt ?? '') }}</div>
            </div>
            <q-space />
            <VdsBtn variant="ghost" color="primary" icon="open_in_new" @click="router.push('/admin/orders')">
              <q-tooltip>Открыть в разделе заказов</q-tooltip>
            </VdsBtn>
            <VdsBtn variant="ghost" icon="close" @click="orderDetailOpen = false" />
          </q-card-section>

          <q-separator />

          <q-card-section v-if="orderDetailLoading" class="q-pa-xl text-center">
            <q-spinner size="40px" color="primary" />
          </q-card-section>

          <q-card-section v-else-if="orderDetail" style="flex:1;overflow-y:auto;padding:24px">
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-sm-6">
                <div class="dash-info-block">
                  <div class="dash-info-block__title"><q-icon name="person" size="15px" /> Покупатель</div>
                  <div class="dash-info-row"><span class="dash-info-lbl">Имя</span><span>{{ orderDetail.firstName }} {{ orderDetail.lastName }}</span></div>
                  <div class="dash-info-row"><span class="dash-info-lbl">Телефон</span><span>{{ formatPhone(orderDetail.phone) }}</span></div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="dash-info-block">
                  <div class="dash-info-block__title"><q-icon name="local_shipping" size="15px" /> Доставка</div>
                  <div class="dash-info-row">
                    <span class="dash-info-lbl">Тип</span>
                    <span class="delivery-chip" :class="orderDetail.delivery ? 'delivery-chip--yes' : 'delivery-chip--no'">
                      <q-icon :name="orderDetail.delivery ? 'local_shipping' : 'storefront'" size="13px" />
                      {{ orderDetail.delivery ? 'Доставка' : 'Самовывоз' }}
                    </span>
                  </div>
                  <div v-if="orderDetail.delivery && orderDetail.address" class="dash-info-row">
                    <span class="dash-info-lbl">Адрес</span><span>{{ orderDetail.address }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="dash-info-block">
              <div class="dash-info-block__title"><q-icon name="shopping_cart" size="15px" /> Позиции</div>
              <q-table
                flat
                :rows="orderDetail.items ?? []"
                :columns="orderItemColumns"
                row-key="productId"
                hide-pagination
                :rows-per-page-options="[0]"
              >
                <template #body-cell-price="p">
                  <q-td :props="p" class="text-right">{{ formatRub(p.row.price) }}</q-td>
                </template>
                <template #body-cell-total="p">
                  <q-td :props="p" class="text-right text-weight-bold">{{ formatRub(p.row.total) }}</q-td>
                </template>
              </q-table>
              <div style="display:flex;justify-content:flex-end;align-items:center;gap:16px;margin-top:12px;padding:12px 16px;background:#eff5ff;border-radius:8px">
                <span style="font-size:15px;font-weight:600;color:#344066">Итого:</span>
                <span style="font-size:20px;font-weight:900;color:#2557e6">{{ formatRub(orderDetail.totalAmount) }}</span>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <VdsBtn variant="ghost" label="Закрыть" @click="orderDetailOpen = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </template>

  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { useApi } from 'src/api/useApi';
import { useRouter } from 'vue-router';
import VdsBtn from 'src/components/VdsBtn.vue';
import type { AdminOrder, Brand, Category, Product } from 'src/types/api';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const api = useApi();
const router = useRouter();
const loading = ref(false);

const products = ref<Product[]>([]);
const brands = ref<Brand[]>([]);
const categories = ref<Category[]>([]);
const ordersTotal = ref(0);
const recentOrders = ref<AdminOrder[]>([]);

async function load() {
  loading.value = true;
  try {
    const [p, b, c, ordersRes] = await Promise.all([
      api.adminProductsList(),
      api.adminBrandsList(),
      api.adminCategoriesList(),
      api.adminOrdersList({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    ]);
    products.value = p;
    brands.value = b;
    categories.value = c;
    ordersTotal.value = ordersRes.meta.total;
    recentOrders.value = ordersRes.data;
  } finally {
    loading.value = false;
  }
}

onMounted(() => { void load(); });

/* ── Stats ── */
const stats = computed(() => ({
  totalProducts:    products.value.length,
  activeProducts:   products.value.filter((p) => p.isActive).length,
  hitProducts:      products.value.filter((p) => p.isHit).length,
  inStock:          products.value.filter((p) => p.inventory?.status === 'IN_STOCK').length,
  onOrder:          products.value.filter((p) => p.inventory?.status === 'ON_ORDER').length,
  outOfStock:       products.value.filter((p) => p.inventory?.status === 'OUT_OF_STOCK').length,
  totalBrands:      brands.value.length,
  activeBrands:     brands.value.filter((b) => b.isActive).length,
  totalCategories:  categories.value.length,
  activeCategories: categories.value.filter((c) => c.isActive).length,
}));

const hitPercent = computed(() => {
  const t = stats.value.totalProducts;
  return t ? Math.round((stats.value.hitProducts / t) * 100) : 0;
});

/* ── Palette ── */
const BLUE   = '#2557e6';
const TEAL   = '#16a34a';
const ORANGE = '#f59e0b';
const RED    = '#dc2626';
const GRAY   = '#e2e8f0';
const PURPLE = '#7c3aed';

/* ── Doughnut options ── */
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: { legend: { display: false }, tooltip: { boxPadding: 4 } },
};

/* ── Inventory chart ── */
const inventoryChartData = computed(() => ({
  labels: ['В наличии', 'Под заказ', 'Нет в наличии'],
  datasets: [{
    data: [stats.value.inStock, stats.value.onOrder, stats.value.outOfStock],
    backgroundColor: [TEAL, ORANGE, RED],
    borderWidth: 0,
    hoverOffset: 6,
  }],
}));

const inventoryLegend = computed(() => [
  { label: 'В наличии',    val: stats.value.inStock,    color: TEAL },
  { label: 'Под заказ',    val: stats.value.onOrder,    color: ORANGE },
  { label: 'Нет в наличии',val: stats.value.outOfStock, color: RED },
]);

/* ── Active chart ── */
const activeChartData = computed(() => ({
  labels: ['Активные', 'Неактивные'],
  datasets: [{
    data: [stats.value.activeProducts, stats.value.totalProducts - stats.value.activeProducts],
    backgroundColor: [BLUE, GRAY],
    borderWidth: 0,
    hoverOffset: 6,
  }],
}));

const activeLegend = computed(() => [
  { label: 'Активные',   val: stats.value.activeProducts, color: BLUE },
  { label: 'Скрытые',    val: stats.value.totalProducts - stats.value.activeProducts, color: GRAY },
]);

/* ── Hits chart ── */
const hitsChartData = computed(() => ({
  labels: ['Хиты', 'Обычные'],
  datasets: [{
    data: [stats.value.hitProducts, stats.value.totalProducts - stats.value.hitProducts],
    backgroundColor: [ORANGE, GRAY],
    borderWidth: 0,
    hoverOffset: 6,
  }],
}));

const hitsLegend = computed(() => [
  { label: 'Хиты',    val: stats.value.hitProducts, color: ORANGE },
  { label: 'Обычные', val: stats.value.totalProducts - stats.value.hitProducts, color: GRAY },
]);

/* ── Bar options ── */
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 12 } } },
    y: { grid: { display: false }, ticks: { font: { size: 12 } } },
  },
};

/* ── Top categories ── */
const topCategoriesChart = computed(() => {
  const catMap = new Map<number, string>();
  categories.value.forEach((c) => catMap.set(c.id, c.name));

  const counts = new Map<number, number>();
  products.value.forEach((p) => {
    counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
  });

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return {
    labels: sorted.map(([id]) => catMap.get(id) ?? `#${id}`),
    datasets: [{
      data: sorted.map(([, n]) => n),
      backgroundColor: BLUE,
      borderRadius: 6,
    }],
  };
});

/* ── Recent orders columns ── */
const recentOrdersColumns = [
  { name: 'id',          label: '#',       field: 'id',          align: 'left'  as const, sortable: false },
  { name: 'name',        label: 'Клиент',  field: 'lastName',    align: 'left'  as const, sortable: false },
  { name: 'phone',       label: 'Телефон', field: 'phone',       align: 'left'  as const, sortable: false },
  { name: 'delivery',    label: 'Тип',     field: 'delivery',    align: 'center'as const, sortable: false },
  { name: 'totalAmount', label: 'Сумма',   field: 'totalAmount', align: 'right' as const, sortable: false },
  { name: 'createdAt',   label: 'Дата',    field: 'createdAt',   align: 'left'  as const, sortable: false },
];

const orderItemColumns = [
  { name: 'name',     label: 'Товар',  field: 'name',     align: 'left'  as const },
  { name: 'unit',     label: 'Ед.',    field: 'unit',     align: 'center'as const },
  { name: 'quantity', label: 'Кол-во', field: 'quantity', align: 'right' as const },
  { name: 'price',    label: 'Цена',   field: 'price',    align: 'right' as const },
  { name: 'total',    label: 'Итого',  field: 'total',    align: 'right' as const },
];

/* ── Order detail dialog (dashboard) ── */
const orderDetailOpen = ref(false);
const orderDetail = ref<AdminOrder | null>(null);
const orderDetailLoading = ref(false);

async function openOrderDetail(row: AdminOrder) {
  orderDetailOpen.value = true;
  orderDetailLoading.value = true;
  orderDetail.value = row;
  try {
    orderDetail.value = await api.adminOrderById(row.id);
  } finally {
    orderDetailLoading.value = false;
  }
}

function formatRub(val: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);
}

function formatShortDate(iso: string) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('7')) return `8${digits.slice(1)}`;
  if (digits.length === 10) return `8${digits}`;
  return phone;
}

/* ── Top brands ── */
const topBrandsChart = computed(() => {
  const brandMap = new Map<number, string>();
  brands.value.forEach((b) => brandMap.set(b.id, b.name));

  const counts = new Map<number, number>();
  products.value.forEach((p) => {
    if (p.brandId) counts.set(p.brandId, (counts.get(p.brandId) ?? 0) + 1);
  });

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return {
    labels: sorted.map(([id]) => brandMap.get(id) ?? `#${id}`),
    datasets: [{
      data: sorted.map(([, n]) => n),
      backgroundColor: PURPLE,
      borderRadius: 6,
    }],
  };
});
</script>

<style scoped>
.dashboard { background: #f6f8fd; min-height: 100vh; }

.dash-header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dash-title { font-size: 26px; font-weight: 800; color: #0e1430; letter-spacing: -0.4px; }
.dash-sub { font-size: 14px; color: #6b7596; margin-top: 2px; }

/* Stat cards */
.stat-card {
  background: #fff;
  border: 1px solid #e8edf8;
  border-radius: 16px;
  padding: 20px;
  height: 100%;
}
.stat-card__icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.stat-card__val {
  font-size: 32px; font-weight: 900;
  color: #0e1430; letter-spacing: -0.5px; line-height: 1;
  margin-bottom: 4px;
}
.stat-card__label { font-size: 13px; font-weight: 600; color: #344066; }
.stat-card__sub { font-size: 12px; color: #6b7596; margin-top: 4px; }
.stat-card--clickable { cursor: pointer; transition: box-shadow 0.15s, border-color 0.15s; }
.stat-card--clickable:hover { border-color: #2557e6; box-shadow: 0 4px 16px rgba(37,87,230,0.12); }

.orders-table-clickable :deep(tbody tr) { cursor: pointer; transition: background 0.12s; }
.orders-table-clickable :deep(tbody tr:hover td) { background: #f0f5ff; }

.dash-info-block {
  background: #f8faff; border: 1px solid #e8edf8; border-radius: 12px; padding: 16px; height: 100%;
}
.dash-info-block__title {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 700; color: #344066;
  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;
}
.dash-info-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 14px; color: #0e1430; }
.dash-info-lbl { color: #6b7596; min-width: 72px; flex-shrink: 0; font-size: 13px; }

/* Chart cards */
.chart-card {
  background: #fff;
  border: 1px solid #e8edf8;
  border-radius: 16px;
  padding: 20px;
  height: 100%;
}
.chart-card__title {
  font-size: 15px; font-weight: 700;
  color: #0e1430; margin-bottom: 16px;
}
.chart-wrap { position: relative; height: 220px; }
.chart-wrap--sm { height: 160px; }

/* Legend */
.legend { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-label { flex: 1; color: #344066; }
.legend-val { font-weight: 700; color: #0e1430; }

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
.delivery-chip--yes { color: #2557e6; background: #eff4ff; border-color: #c5d5fb; }
.delivery-chip--no  { color: #5a6284; background: #f4f5f8; border-color: #d8dfef; }
</style>
