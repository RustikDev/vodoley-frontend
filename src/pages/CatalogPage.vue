<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="ui.q"
          dense
          outlined
          clearable
          label="Поиск"
          hint="Название / описание"
        />
      </div>

      <div class="col-12 col-md-2">
        <q-input v-model.number="ui.minPrice" dense outlined type="number" label="Цена от" />
      </div>

      <div class="col-12 col-md-2">
        <q-input v-model.number="ui.maxPrice" dense outlined type="number" label="Цена до" />
      </div>

      <div class="col-12 col-md-2">
        <q-input v-model.number="ui.unitId" dense outlined type="number" label="Ед. изм. (unitId)" />
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
        <q-toggle v-model="ui.includeChildren" label="С подкатегориями" :disable="ui.categoryId == null" />
      </div>

      <div class="col-12 col-md-8 text-right">
        <q-btn flat color="primary" icon="filter_alt_off" label="Сбросить" @click="reset" />
      </div>
    </div>

    <div class="row items-start q-col-gutter-md">
      <div class="col-12 col-md-3">
        <div class="text-subtitle2 q-mb-sm">Категории</div>
        <q-skeleton v-if="store.categoriesLoading" type="rect" height="260px" />
        <CategoryTree
          v-else
          :nodes="store.categories"
          :active-id="ui.categoryId"
          @select="(id) => (ui.categoryId = id)"
        />
      </div>

      <div class="col-12 col-md-9">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-h5">Каталог</div>
          <div class="text-body2 text-grey-7" v-if="store.products">
            Найдено: {{ store.products.total }}
          </div>
        </div>

        <div v-if="store.productsLoading" class="row q-col-gutter-md">
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
          <div v-if="(store.products?.items?.length ?? 0) === 0" class="q-pa-md text-grey-7">
            Ничего не найдено.
          </div>

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
import { computed, onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CategoryTree from 'src/components/CategoryTree.vue';
import ProductCard from 'src/components/ProductCard.vue';
import { useApi } from 'src/api/useApi';
import { useCatalogStore } from 'src/stores/catalog';
import type { ProductListQuery, ProductSort } from 'src/types/api';

const api = useApi();
const store = useCatalogStore();
const route = useRoute();
const router = useRouter();

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

function readBool(v: unknown): boolean {
  const raw = Array.isArray(v) ? v[0] : v;
  return raw === 'true' || raw === '1' || raw === true;
}

type UiState = {
  q: string;
  categoryId: number | null;
  includeChildren: boolean;
  unitId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
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

  return query;
}

let debounceTimer: number | null = null;
let applyingRoute = false;

function scheduleRouteSync() {
  if (applyingRoute) return;
  if (debounceTimer) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    void router.replace({ path: '/catalog', query: buildRouteQuery() });
  }, 350);
}

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
    ui.sort = 'newest';
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
  ui.sort = 'newest';
  ui.page = 1;
  ui.pageSize = 12;
}

// When filters change -> reset to page 1 and sync URL (fetch happens from route watcher)
watch(
  () => [ui.q, ui.categoryId, ui.includeChildren, ui.unitId, ui.minPrice, ui.maxPrice, ui.inStock, ui.sort, ui.pageSize],
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
  if (store.categories.length === 0) await store.fetchCategories(api);
});
</script>






