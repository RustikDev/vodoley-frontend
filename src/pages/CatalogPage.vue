<template>
  <q-page class="q-pa-md vds-container">
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="ui.q"
          dense
          outlined
          clearable
          label="Поиск по названию"
        />
      </div>

      <div class="col-12 col-md-2">
        <q-input dense outlined type="number" label="Цена от" :model-value="ui.minPrice" @update:model-value="(v) => (ui.minPrice = normalizeNumberInput(v))" />
      </div>

      <div class="col-12 col-md-2">
        <q-input dense outlined type="number" label="Цена до" :model-value="ui.maxPrice" @update:model-value="(v) => (ui.maxPrice = normalizeNumberInput(v))" />
      </div>

      <div class="col-12 col-md-2">
        <q-select
          v-model="ui.unitId"
          dense
          outlined
          emit-value
          map-options
          clearable
          label="Ед. изм."
          :options="unitOptions"
        />
      </div>

      <div class="col-12 col-md-2">
        <q-select
          v-model="ui.sort"
          dense
          outlined
          emit-value
          map-options
          label="Сортировка"
          :options="sortOptions"
        />
      </div>

      <div class="col-12 col-md-4">
        <q-toggle v-model="ui.inStock" label="Только в наличии" />
        <q-toggle v-model="ui.isHit" label="Хиты продаж" />
      </div>

      <div class="col-12 col-md-8 text-right">
        <q-btn flat color="primary" icon="filter_alt_off" label="Сбросить" @click="reset" />
      </div>
    </div>

    <div class="row items-start q-col-gutter-md">
      <div class="col-12 col-md-3">
        <div class="cat-sidebar">
          <div class="cat-sidebar__head">
            <span class="cat-sidebar__title">Категории</span>
            <button v-if="ui.categoryId" class="cat-sidebar__clear" @click="ui.categoryId = null">
              <q-icon name="close" size="13px" />
              Сбросить
            </button>
          </div>

          <VdsErrorState
            v-if="store.categoriesError"
            title="Ошибка категорий"
            :description="store.categoriesError"
            :on-retry="() => store.fetchCategories(api)"
          />
          <div v-else-if="store.categoriesLoading" class="cat-sidebar__body">
            <q-skeleton v-for="i in 6" :key="i" type="text" class="q-mb-xs" />
          </div>
          <div v-else class="cat-sidebar__body">
            <button
              class="cat-item cat-item--all-root"
              :class="{ 'cat-item--active': !ui.categoryId }"
              @click="ui.categoryId = null"
            >
              <q-icon name="grid_view" size="15px" class="cat-item__icon" />
              <span>Все категории</span>
            </button>
            <CategoryTree
              :nodes="store.categories"
              :active-id="ui.categoryId"
              @select="(id) => (ui.categoryId = id)"
            />
          </div>
        </div>
      </div>

      <div class="col-12 col-md-9">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-h5">Каталог</div>
          <div class="text-body2 text-grey-7" v-if="store.products">
            Найдено: {{ store.products.total }}
          </div>
        </div>

        <VdsErrorState
          v-if="store.productsError"
          title="Ошибка загрузки каталога"
          :description="store.productsError"
          :on-retry="fetchFromRoute"
        />

        <div v-else-if="store.productsLoading" class="row q-col-gutter-md">
          <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-lg-4">
            <q-card>
              <q-skeleton height="180px" square />
              <q-card-section>
                <q-skeleton type="text" />
                <q-skeleton type="text" width="70%" />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <template v-else>
          <VdsEmptyState
            v-if="(store.products?.items?.length ?? 0) === 0"
            icon="search_off"
            title="Ничего не найдено"
            description="Попробуй изменить фильтры или очистить поиск"
          />

          <div v-else class="row q-col-gutter-md">
            <div v-for="p in store.products?.items" :key="p.id" class="col-12 col-sm-6 col-lg-4">
              <ProductCard :product="p" />
            </div>
          </div>

          <div v-if="store.products" class="row justify-center q-mt-lg">
            <q-pagination
              v-model="ui.page"
              :max="maxPage"
              :max-pages="7"
              direction-links
              boundary-links
            />
          </div>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CategoryTree from 'src/components/CategoryTree.vue';
import ProductCard from 'src/components/ProductCard.vue';
import VdsEmptyState from 'src/components/VdsEmptyState.vue';
import VdsErrorState from 'src/components/VdsErrorState.vue';
import { useApi } from 'src/api/useApi';
import { useCatalogStore } from 'src/stores/catalog';
import { debounce } from 'src/utils/debounce';
import type { ProductListQuery, ProductSort, Unit } from 'src/types/api';

const api = useApi();
const store = useCatalogStore();
const route = useRoute();
const router = useRouter();

const units = ref<Unit[]>([]);
const unitOptions = computed(() => [
  { label: 'Все', value: null },
  ...units.value.map((u) => ({ label: `${u.name} (${u.shortName})`, value: u.id })),
]);

const sortOptions: Array<{ label: string; value: ProductSort }> = [
  { label: 'Новизна', value: 'newest' },
  { label: 'Цена ↑', value: 'price_asc' },
  { label: 'Цена ↓', value: 'price_desc' },
];

function readNumber(v: unknown): number | null {
  const raw = Array.isArray(v) ? v[0] : v;
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function normalizeNumberInput(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v.replace(',', '.')) : null;
  return Number.isFinite(n) ? n : null;
}
function readBool(v: unknown): boolean {
  const raw = Array.isArray(v) ? v[0] : v;
  return raw === 'true' || raw === '1' || raw === true;
}
function readSort(v: unknown): ProductSort {
  const raw = Array.isArray(v) ? v[0] : v;
  return raw === 'price_asc' || raw === 'price_desc' || raw === 'newest' ? raw : 'newest';
}

type UiState = {
  q: string;
  categoryId: number | null;
  includeChildren: boolean;
  unitId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  isHit: boolean;
  sort: ProductSort;
  page: number;
  pageSize: number;
};

const ui = reactive<UiState>({
  q: '',
  categoryId: null,
  includeChildren: false,
  unitId: null,
  minPrice: null,
  maxPrice: null,
  inStock: false,
  isHit: false,
  sort: 'newest',
  page: 1,
  pageSize: 12,
});

const maxPage = computed(() => {
  const total = store.products?.total ?? 0;
  const pageSize = ui.pageSize || 12;
  return Math.max(1, Math.ceil(total / pageSize));
});

function buildRouteQuery(): Record<string, string> {
  const q: Record<string, string> = {};
  if (ui.q) q.q = ui.q;
  if (ui.categoryId != null) q.categoryId = String(ui.categoryId);
  if (ui.categoryId != null && ui.includeChildren) q.includeChildren = 'true';
  if (ui.unitId != null) q.unitId = String(ui.unitId);
  if (ui.minPrice != null) q.minPrice = String(ui.minPrice);
  if (ui.maxPrice != null) q.maxPrice = String(ui.maxPrice);
  if (ui.inStock) q.inStock = 'true';
  if (ui.isHit) q.isHit = 'true';
  if (ui.sort) q.sort = String(ui.sort);
  if (ui.page && ui.page !== 1) q.page = String(ui.page);
  if (ui.pageSize && ui.pageSize !== 12) q.pageSize = String(ui.pageSize);
  return q;
}

function buildApiQuery(): ProductListQuery {
  const query: ProductListQuery = {
    sort: ui.sort,
    page: ui.page,
    pageSize: ui.pageSize,
  };

  if (ui.q) query.q = ui.q;
  if (ui.categoryId != null) query.categoryId = ui.categoryId;
  if (ui.categoryId != null && ui.includeChildren) query.includeChildren = true;
  if (ui.unitId != null) query.unitId = ui.unitId;
  if (ui.minPrice != null) query.minPrice = ui.minPrice;
  if (ui.maxPrice != null) query.maxPrice = ui.maxPrice;
  if (ui.inStock) query.inStock = true;
  if (ui.isHit) query.isHit = true;

  return query;
}

let applyingRoute = false;

const scheduleRouteSync = debounce(() => {
  void router.replace({ path: '/catalog', query: buildRouteQuery() });
}, 350);

function applyRoute() {
  applyingRoute = true;
  try {
    ui.q = (Array.isArray(route.query.q) ? route.query.q[0] : route.query.q) ?? '';
    ui.categoryId = readNumber(route.query.categoryId);
    ui.includeChildren = readBool(route.query.includeChildren);
    ui.unitId = readNumber(route.query.unitId);
    ui.minPrice = readNumber(route.query.minPrice);
    ui.maxPrice = readNumber(route.query.maxPrice);
    ui.inStock = readBool(route.query.inStock);
    ui.isHit = readBool(route.query.isHit);
    ui.sort = readSort(route.query.sort);
    ui.page = readNumber(route.query.page) ?? 1;
    ui.pageSize = readNumber(route.query.pageSize) ?? 12;

    if (ui.categoryId == null) ui.includeChildren = false;
  } finally {
    applyingRoute = false;
  }
}

async function fetchFromRoute() {
  await store.fetchProducts(api, buildApiQuery());
}

function reset() {
  ui.q = '';
  ui.categoryId = null;
  ui.includeChildren = false;
  ui.unitId = null;
  ui.minPrice = null;
  ui.maxPrice = null;
  ui.inStock = false;
  ui.isHit = false;
  ui.sort = readSort(route.query.sort);
  ui.page = 1;
  ui.pageSize = 12;
}

// When filters change -> reset to page 1 and sync URL (fetch happens from route watcher)
watch(
  () => [ui.q, ui.categoryId, ui.includeChildren, ui.unitId, ui.minPrice, ui.maxPrice, ui.inStock, ui.isHit, ui.sort, ui.pageSize],
  () => {
    if (applyingRoute) return;
    ui.page = 1;
    scheduleRouteSync();
  },
);

// When page changes -> sync URL
watch(
  () => ui.page,
  () => {
    if (applyingRoute) return;
    scheduleRouteSync();
  },
);

// Route is the source of truth for fetching
watch(
  () => route.query,
  () => {
    applyRoute();
    void fetchFromRoute();
  },
  { immediate: true },
);

onMounted(async () => {
  await Promise.all([
    store.categories.length === 0 ? store.fetchCategories(api) : Promise.resolve(),
    api.unitsList().then((data) => { units.value = data; }).catch(() => {}),
  ]);
});
</script>

<style scoped lang="scss">
.cat-sidebar {
  background: #fff;
  border: 1px solid #e2e8f5;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(14, 20, 48, 0.05);
}

.cat-sidebar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #f0f4ff;
}

.cat-sidebar__title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #8c94b3;
}

.cat-sidebar__clear {
  display: flex;
  align-items: center;
  gap: 3px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #2557e6;
  padding: 2px 6px;
  border-radius: 6px;
  transition: background 0.13s;

  &:hover { background: #f0f4ff; }
}

.cat-sidebar__body {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.cat-item--all-root {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 13.5px;
  font-weight: 600;
  color: #0e1430;
  transition: background 0.13s, color 0.13s;
  margin-bottom: 4px;

  &:hover { background: #f0f4ff; color: #2557e6; }

  &.cat-item--active {
    background: #2557e6;
    color: #fff;
  }
}

.cat-item__icon {
  opacity: 0.6;
  flex-shrink: 0;
}

.cat-item--active .cat-item__icon { opacity: 1; }
</style>











