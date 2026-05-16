<template>
  <q-page class="dashboard q-pa-lg">

    <!-- Header -->
    <div class="dash-header q-mb-lg">
      <div>
        <div class="dash-title">Дашборд</div>
        <div class="dash-sub">Сводная статистика магазина</div>
      </div>
      <q-btn outline icon="refresh" label="Обновить" :loading="loading" @click="load" />
    </div>

    <div v-if="loading" class="row q-col-gutter-md q-mb-lg">
      <div v-for="i in 5" :key="i" class="col-12 col-sm-6 col-md">
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
      <div class="row q-col-gutter-md">
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
import type { Brand, Category, Product } from 'src/types/api';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const api = useApi();
const loading = ref(false);

const products = ref<Product[]>([]);
const brands = ref<Brand[]>([]);
const categories = ref<Category[]>([]);

async function load() {
  loading.value = true;
  try {
    [products.value, brands.value, categories.value] = await Promise.all([
      api.adminProductsList(),
      api.adminBrandsList(),
      api.adminCategoriesList(),
    ]);
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

.dash-header { display: flex; align-items: flex-start; justify-content: space-between; }
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
</style>
