<template>
  <q-page class="brand-page">
    <div class="wrap">

      <!-- Breadcrumbs -->
      <div class="crumbs">
        <router-link to="/">Главная</router-link>
        <span class="sep">/</span>
        <router-link to="/brands">Бренды</router-link>
        <span class="sep">/</span>
        <span>{{ brand?.name ?? '…' }}</span>
      </div>

      <!-- Brand header skeleton -->
      <div v-if="brandLoading" class="brand-hero brand-hero--skeleton" />

      <!-- Brand hero -->
      <div v-else-if="brand" class="brand-hero">
        <div class="brand-hero-logo">
          <img v-if="logoSrc" :src="logoSrc" :alt="brand.name" class="hero-logo-img" />
          <span v-else class="hero-logo-letter">{{ brand.name.charAt(0).toUpperCase() }}</span>
        </div>

        <div class="brand-hero-body">
          <div class="brand-hero-top">
            <h1>{{ brand.name }}</h1>
            <a
              v-if="brand.website"
              :href="normalizeUrl(brand.website)"
              target="_blank"
              rel="noopener noreferrer"
              class="site-btn"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2h10v10M12 2 2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              Сайт бренда
            </a>
          </div>

          <div v-if="brand.description" class="brand-desc-wrap" :class="{ collapsed: isLong && !descExpanded }">
            <p ref="descEl" class="brand-desc">{{ brand.description }}</p>
            <div v-if="isLong && !descExpanded" class="brand-desc-fade" />
          </div>
          <button v-if="isLong" class="desc-toggle" type="button" @click="descExpanded = !descExpanded">
            {{ descExpanded ? 'Свернуть ↑' : 'Читать полностью ↓' }}
          </button>

          <div class="brand-stats">
            <div v-if="brand.productCount != null" class="bstat">
              <span class="bstat-v">{{ brand.productCount }}</span>
              <span class="bstat-l">{{ plural(brand.productCount, 'товар', 'товара', 'товаров') }}</span>
            </div>
            <div v-if="brand.categoryCount != null" class="bstat bstat--sep">
              <span class="bstat-v">{{ brand.categoryCount }}</span>
              <span class="bstat-l">{{ plural(brand.categoryCount, 'категория', 'категории', 'категорий') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div v-if="brand" class="section-sep" />

      <!-- Filters bar -->
      <div v-if="brand" class="filterbar">
        <!-- Search -->
        <div class="filter-search-wrap">
          <input
            v-model="filters.q"
            type="text"
            class="filter-search"
            placeholder="Поиск в бренде…"
          />
        </div>

        <!-- Category chips -->
        <button
          class="chip"
          :class="{ on: filters.categoryId == null }"
          type="button"
          @click="filters.categoryId = undefined"
        >
          Все
          <span class="c">{{ brand.productCount ?? '—' }}</span>
        </button>

        <button
          v-for="cat in categories"
          :key="cat.id"
          class="chip"
          :class="{ on: filters.categoryId === cat.id }"
          type="button"
          @click="filters.categoryId = cat.id"
        >
          {{ cat.name }}
          <span class="c">{{ cat.productCount }}</span>
        </button>

        <div class="right">
          <!-- Stock toggle -->
          <button
            class="filter-btn"
            :class="{ on: filters.inStock }"
            type="button"
            @click="filters.inStock = filters.inStock === true ? undefined : true"
          >
            В наличии
          </button>

          <!-- Sort -->
          <select v-model="filters.sort" class="sort-select">
            <option value="">По умолчанию</option>
            <option value="price_asc">Дешевле</option>
            <option value="price_desc">Дороже</option>
            <option value="newest">Новинки</option>
          </select>

          <!-- View toggle -->
          <div class="view-toggle" role="group">
            <button type="button" :class="{ on: viewMode === 'grid' }" @click="viewMode = 'grid'" aria-label="Сетка">▦</button>
            <button type="button" :class="{ on: viewMode === 'list' }" @click="viewMode = 'list'" aria-label="Список">≡</button>
          </div>
        </div>
      </div>

      <!-- Products loading -->
      <div v-if="productsLoading" class="pgrid" :class="{ list: viewMode === 'list' }">
        <div v-for="i in 8" :key="i" class="pcard-skeleton" />
      </div>

      <!-- Products error -->
      <q-banner v-else-if="productsError" class="bg-red-1 text-red-10 q-mb-md" rounded>
        {{ productsError }}
      </q-banner>

      <!-- Products empty -->
      <div v-else-if="!products.length && !productsLoading" class="no-products">
        <div class="empty-card">
          <div class="empty-title">Товаров не найдено</div>
          <div class="empty-sub">Попробуйте изменить фильтры или сбросить поиск.</div>
          <button class="btn ghost" type="button" @click="resetFilters">Сбросить фильтры</button>
        </div>
      </div>

      <!-- Products grid -->
      <template v-else>
        <div class="pgrid" :class="{ list: viewMode === 'list' }">
          <ProductCard v-for="p in products" :key="p.id" :product="p" />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            class="page-btn"
            :class="{ disabled: page === 1 }"
            type="button"
            :disabled="page === 1"
            @click="page--"
          >
            ←
          </button>

          <button
            v-for="p in pageButtons"
            :key="p"
            class="page-btn"
            :class="{ on: p === page, ellipsis: p === '…' }"
            type="button"
            :disabled="p === '…'"
            @click="typeof p === 'number' && (page = p)"
          >
            {{ p }}
          </button>

          <button
            class="page-btn"
            :class="{ disabled: page === totalPages }"
            type="button"
            :disabled="page === totalPages"
            @click="page++"
          >
            →
          </button>
        </div>

        <div class="results-count">
          Показано {{ products.length }} из {{ totalProducts }}
          {{ plural(totalProducts, 'товара', 'товаров', 'товаров') }}
        </div>
      </template>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from 'src/api/useApi';
import type { Brand, BrandCategory, Product, ProductSort } from 'src/types/api';
import ProductCard from 'src/components/ProductCard.vue';

const api = useApi();
const route = useRoute();

const slug = computed(() => route.params.slug as string);

/* ── Brand ── */
const brandLoading = ref(false);
const brand = ref<Brand | null>(null);

async function loadBrand() {
  brandLoading.value = true;
  try {
    brand.value = await api.brandBySlug(slug.value);
    void checkDescHeight();
  } catch {
    brand.value = null;
  } finally {
    brandLoading.value = false;
  }
}

/* ── Categories ── */
const categories = ref<BrandCategory[]>([]);

async function loadCategories() {
  try {
    categories.value = await api.brandCategories(slug.value);
  } catch {
    categories.value = [];
  }
}

/* ── Products ── */
const productsLoading = ref(false);
const productsError = ref<string | null>(null);
const products = ref<Product[]>([]);
const totalProducts = ref(0);
const PAGE_SIZE = 20;
const page = ref(1);
const viewMode = ref<'grid' | 'list'>('grid');

type Filters = {
  q: string;
  categoryId: number | undefined;
  inStock: true | undefined;
  sort: ProductSort | '';
};
const filters = ref<Filters>({ q: '', categoryId: undefined, inStock: undefined, sort: '' });

async function loadProducts() {
  productsError.value = null;
  productsLoading.value = true;
  try {
    const { q, categoryId, inStock, sort } = filters.value;
    const query: Parameters<typeof api.brandProducts>[1] = {
      page: page.value,
      pageSize: PAGE_SIZE,
    };
    if (q) query.q = q;
    if (categoryId != null) query.categoryId = categoryId;
    if (inStock) query.inStock = inStock;
    if (sort) query.sort = sort;
    const res = await api.brandProducts(slug.value, query);
    products.value = res.items;
    totalProducts.value = res.total;
  } catch (e) {
    productsError.value = e instanceof Error ? e.message : 'Ошибка загрузки товаров';
  } finally {
    productsLoading.value = false;
  }
}

function resetFilters() {
  filters.value = { q: '', categoryId: undefined, inStock: undefined, sort: '' };
  page.value = 1;
}

/* ── Description accordion ── */
const descEl = ref<HTMLElement | null>(null);
const isLong = ref(false);
const descExpanded = ref(false);

async function checkDescHeight() {
  descExpanded.value = false;
  isLong.value = false;
  await nextTick();
  if (descEl.value) {
    isLong.value = descEl.value.scrollHeight > 100;
  }
}

/* ── Logo ── */
const logoSrc = computed(() => {
  if (!brand.value?.logo) return undefined;
  return brand.value.logo.startsWith('http')
    ? brand.value.logo
    : api.toAbsoluteUploadUrl(brand.value.logo);
});

/* ── Pagination ── */
const totalPages = computed(() => Math.max(1, Math.ceil(totalProducts.value / PAGE_SIZE)));

const pageButtons = computed<(number | '…')[]>(() => {
  const total = totalPages.value;
  const cur = page.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (cur > 3) pages.push('…');
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
  if (cur < total - 2) pages.push('…');
  pages.push(total);
  return pages;
});

/* ── Helpers ── */
function normalizeUrl(url: string | null | undefined): string {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function plural(n: number, a: string, b: string, c: string) {
  const m = n % 10, k = n % 100;
  if (k >= 11 && k <= 14) return c;
  if (m === 1) return a;
  if (m >= 2 && m <= 4) return b;
  return c;
}

/* ── Watchers ── */
let searchTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => filters.value.q,
  () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { page.value = 1; void loadProducts(); }, 350);
  },
);

watch(
  () => [filters.value.categoryId, filters.value.inStock, filters.value.sort],
  () => { page.value = 1; void loadProducts(); },
);

watch(page, () => { void loadProducts(); });

watch(slug, () => {
  page.value = 1;
  filters.value = { q: '', categoryId: undefined, inStock: undefined, sort: '' };
  void Promise.all([loadBrand(), loadCategories(), loadProducts()]);
});

onMounted(() => {
  void Promise.all([loadBrand(), loadCategories(), loadProducts()]);
});
</script>

<style scoped>
:root {
  --blue-50:#eff5ff; --blue-100:#dde9ff; --blue-200:#bcd2ff;
  --blue-600:#2557e6; --blue-700:#1c44c2;
  --ink:#0e1430; --ink-2:#344066; --ink-3:#6b7596;
  --line:#e6ebf5; --bg:#f6f8fd; --red-600:#d63a3a;
}

.brand-page { background:var(--bg); color:var(--ink); padding:0 0 60px; }
.wrap { max-width:1280px; margin:0 auto; padding:0 28px; }

.crumbs { display:flex; gap:8px; font-size:13px; color:var(--ink-3); padding:18px 0 0; }
.crumbs a:hover { color:var(--blue-700); }
.crumbs .sep { opacity:0.5; }

/* ── Hero ── */
.brand-hero {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 36px 40px;
  margin: 20px 0 0;
  box-shadow: 0 4px 24px rgba(37, 87, 230, 0.06);
}
.brand-hero--skeleton {
  height: 180px;
  border-radius: 24px;
  background: linear-gradient(90deg, #f4f7fd 25%, #eaeffa 50%, #f4f7fd 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  margin: 20px 0 0;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

.brand-hero-logo {
  width: 140px;
  height: 140px;
  border-radius: 20px;
  background: var(--blue-50);
  border: 1.5px solid var(--blue-100);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.hero-logo-img { width: 100%; height: 100%; object-fit: contain; padding: 16px; }
.hero-logo-letter {
  font-size: 64px;
  font-weight: 900;
  color: var(--blue-700);
  line-height: 1;
  letter-spacing: -0.03em;
}

.brand-hero-body { flex: 1; min-width: 0; padding-top: 4px; }

.brand-hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}
.brand-hero-top h1 {
  font-size: 42px;
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 0;
  line-height: 1.05;
  color: var(--ink);
}

.site-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  border-radius: 11px;
  background: var(--blue-50);
  color: var(--blue-700);
  border: 1.5px solid var(--blue-100);
  font-size: 13.5px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.13s, border-color 0.13s;
}
.site-btn:hover {
  background: var(--blue-100);
  border-color: var(--blue-200);
}

.brand-desc-wrap {
  position: relative;
  margin-bottom: 12px;
}
.brand-desc-wrap.collapsed {
  max-height: 100px;
  overflow: hidden;
}
.brand-desc-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: linear-gradient(to bottom, transparent, #fff);
  pointer-events: none;
}
.brand-desc {
  font-size: 14.5px;
  color: var(--ink-2);
  line-height: 1.6;
  margin: 0;
  max-width: 640px;
}
.desc-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0 0 16px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--blue-600);
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.12s;
}
.desc-toggle:hover { opacity: 0.75; }

.brand-stats {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
}
.bstat {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 10px 20px 10px 0;
}
.bstat--sep {
  padding-left: 20px;
  border-left: 1.5px solid var(--line);
}
.bstat-v { font-size: 26px; font-weight: 900; color: var(--blue-700); letter-spacing: -0.02em; }
.bstat-l { font-size: 13px; color: var(--ink-3); font-weight: 500; }

.btn { display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:11px; font-weight:600; font-size:14px; font-family:inherit; cursor:pointer; transition:background .12s, border-color .12s; }
.btn.ghost { background:#fff; color:var(--ink-2); border:1px solid var(--line); }
.btn.ghost:hover { border-color:var(--blue-200); color:var(--blue-700); }

.section-sep { height: 1px; background: var(--line); margin: 28px 0; }

/* ── Filter bar ── */
.filterbar {
  display:flex; align-items:center; gap:10px; flex-wrap:wrap;
  background:#fff; border:1px solid var(--line); border-radius:14px;
  padding:10px 14px; margin-bottom:24px;
}
.filter-search-wrap { position:relative; }
.filter-search {
  height: 36px;
  width: 200px;
  padding: 0 12px;
  border: 1.5px solid var(--line);
  border-radius: 9px;
  font-family: inherit;
  font-size: 13px;
  color: var(--ink);
  background: #f4f7fd;
  outline: none;
  transition: border-color .15s;
}
.filter-search:focus { border-color:var(--blue-600); background:#fff; }
.filter-search::placeholder { color:var(--ink-3); }
.chip { display:inline-flex; align-items:center; gap:7px; padding:7px 13px; border-radius:999px; background:#f4f7fd; color:var(--ink-2); font-size:13px; font-weight:600; cursor:pointer; transition:background .12s, color .12s; border:1px solid transparent; font-family:inherit; }
.chip:hover { background:var(--blue-50); color:var(--blue-700); }
.chip.on { background:var(--blue-600); color:#fff; }
.chip .c { background:rgba(255,255,255,0.18); font-size:11px; padding:1px 7px; border-radius:999px; font-family:"JetBrains Mono",ui-monospace,monospace; font-weight:600; }
.chip:not(.on) .c { background:#fff; color:var(--ink-3); border:1px solid var(--line); }
.right { margin-left:auto; display:flex; gap:8px; align-items:center; }
.filter-btn { display:inline-flex; align-items:center; padding:7px 12px; border-radius:8px; background:#f4f7fd; color:var(--ink-2); font-size:13px; font-weight:600; border:1px solid transparent; cursor:pointer; font-family:inherit; transition:background .12s, color .12s; }
.filter-btn:hover { background:var(--blue-50); color:var(--blue-700); }
.filter-btn.on { background:var(--blue-600); color:#fff; }
.sort-select { height:36px; padding:0 10px; border:1.5px solid var(--line); border-radius:9px; font-family:inherit; font-size:13px; font-weight:600; color:var(--ink-2); background:#fff; cursor:pointer; outline:none; }
.sort-select:focus { border-color:var(--blue-600); }
.view-toggle { display:inline-flex; gap:2px; background:#f4f7fd; padding:3px; border-radius:9px; }
.view-toggle button { padding:6px 10px; border-radius:6px; color:var(--ink-3); font-family:inherit; cursor:pointer; border:0; background:none; }
.view-toggle button.on { background:#fff; color:var(--blue-700); box-shadow:0 1px 3px rgba(0,0,0,0.06); }

/* ── Product grid ── */
.pgrid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
.pgrid.list { grid-template-columns:1fr; }

/* skeleton cards */
.pcard-skeleton {
  height: 340px;
  border-radius: 16px;
  background: linear-gradient(90deg, #f4f7fd 25%, #eaeffa 50%, #f4f7fd 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.pgrid.list .pcard-skeleton { height: 120px; }

/* ── Empty ── */
.no-products { padding:10px 0; }
.empty-card { background:#fff; border:1px solid var(--line); border-radius:16px; padding:28px; max-width:560px; }
.empty-title { font-size:20px; font-weight:800; letter-spacing:-0.01em; }
.empty-sub { margin:8px 0 16px; color:var(--ink-3); font-size:14px; line-height:1.5; }

/* ── Pagination ── */
.pagination { display:flex; justify-content:center; align-items:center; gap:6px; margin:28px 0 10px; }
.page-btn {
  min-width: 38px; height: 38px; border-radius: 9px;
  font-size: 14px; font-weight: 600; font-family: inherit;
  border: 1px solid var(--line); background: #fff; color: var(--ink-2);
  cursor: pointer; display: grid; place-items: center;
  transition: background .12s, border-color .12s, color .12s;
}
.page-btn:hover:not(:disabled) { border-color:var(--blue-200); color:var(--blue-700); }
.page-btn.on { background:var(--blue-600); color:#fff; border-color:var(--blue-600); }
.page-btn.disabled, .page-btn:disabled { opacity:0.4; cursor:default; }
.page-btn.ellipsis { border:0; background:none; cursor:default; }

.results-count { text-align:center; font-size:13px; color:var(--ink-3); margin-top:8px; }

/* Responsive */
@media (max-width: 1100px) { .pgrid:not(.list) { grid-template-columns:repeat(3,1fr); } }
@media (max-width: 900px) {
  .brand-hero { padding: 24px; gap: 24px; }
  .brand-hero-logo { width: 100px; height: 100px; }
  .hero-logo-letter { font-size: 46px; }
  .brand-hero-top h1 { font-size: 30px; }
  .pgrid:not(.list) { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 600px) {
  .wrap { padding: 0 14px; }
  .brand-hero { flex-direction: column; align-items: center; text-align: center; padding: 24px 20px; gap: 20px; }
  .brand-hero-logo { width: 96px; height: 96px; }
  .hero-logo-letter { font-size: 44px; }
  .brand-hero-top { flex-direction: column; align-items: center; gap: 12px; }
  .brand-hero-top h1 { font-size: 28px; }
  .brand-desc { text-align: left; }
  .brand-stats { justify-content: center; }
  .pgrid:not(.list) { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
  .filter-search { width: 140px; }
}
</style>
