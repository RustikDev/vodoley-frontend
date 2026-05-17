<template>
  <section class="bs-section">
    <div class="vds-container">

      <div class="bs-head">
        <div>
          <h2 class="bs-title">{{ title }}</h2>
          <div class="bs-sub">Что чаще всего берут профи и частные мастера</div>
        </div>
        <div class="bs-controls">
          <div class="bs-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="bs-tab"
              :class="{ 'bs-tab--active': activeTab === tab.key }"
              @click="setTab(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
          <router-link :to="to" class="bs-catalog-link">В каталог →</router-link>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bs-grid">
        <div v-for="i in 8" :key="i" class="pcard-skeleton">
          <q-skeleton height="200px" square style="border-radius:10px" />
          <div style="padding: 14px 0 0">
            <q-skeleton type="text" width="60%" />
            <q-skeleton type="text" />
            <q-skeleton type="text" width="40%" />
          </div>
        </div>
      </div>

      <VdsErrorState v-else-if="error" title="Ошибка" :description="error" :on-retry="load" />

      <div v-else class="bs-grid">
        <ProductCard v-for="p in items" :key="p.id" :product="p" />
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useApi } from 'src/api/useApi';
import type { Product, ProductListQuery } from 'src/types/api';
import ProductCard from 'src/components/ProductCard.vue';
import VdsErrorState from 'src/components/VdsErrorState.vue';

const props = defineProps<{
  title: string;
  query: ProductListQuery;
  to: string;
}>();

const api = useApi();
const items = ref<Product[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref<string>('all');

const tabs = [
  { key: 'all',      label: 'Все',        extra: {} },
  { key: 'instock',  label: 'В наличии',  extra: { status: 'IN_STOCK' } },
  { key: 'order',    label: 'Под заказ',  extra: { status: 'ON_ORDER' } },
];

async function load(extra: Record<string, unknown> = {}) {
  error.value = null;
  loading.value = true;
  try {
    const res = await api.productsList({ ...props.query, ...extra, page: 1, pageSize: 8 });
    items.value = res.items;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }
}

function setTab(key: string) {
  activeTab.value = key;
  const tab = tabs.find((t) => t.key === key);
  void load(tab?.extra ?? {});
}

onMounted(() => { void load(); });
</script>

<style scoped lang="scss">
.bs-section {
  padding: 48px 0;
  background: var(--vds-color-bg);
}

/* Head */
.bs-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.bs-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--vds-color-ink);
  margin: 0 0 4px;
  letter-spacing: -0.4px;
}

.bs-sub {
  font-size: 14px;
  color: var(--vds-color-ink-3);
  font-weight: 500;
}

.bs-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Tabs */
.bs-tabs {
  display: flex;
  background: #fff;
  border: 1px solid #e8edf8;
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.bs-tab {
  padding: 7px 16px;
  border: none;
  border-radius: 8px;
  font-family: 'Manrope', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  color: #5a6284;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;

  &:hover:not(&--active) { background: #f0f4ff; color: #2557e6; }

  &--active {
    background: #2557e6;
    color: #fff;
  }
}

/* Catalog link */
.bs-catalog-link {
  font-size: 14px;
  font-weight: 700;
  color: #2557e6;
  text-decoration: none;
  white-space: nowrap;
  border: 1.5px solid #d4daf0;
  border-radius: 8px;
  padding: 7px 16px;
  transition: border-color 0.15s, background 0.15s;

  &:hover { border-color: #2557e6; background: #f0f4ff; }
}

/* Grid */
.bs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

/* Skeleton card */
.pcard-skeleton {
  background: #fff;
  border: 1px solid #e8edf8;
  border-radius: 16px;
  overflow: hidden;
  padding: 12px 12px 18px;
}

@media (max-width: 767px) {
  .bs-section { padding: 32px 0; }
  .bs-head { flex-direction: column; align-items: flex-start; gap: 12px; }
  .bs-controls { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .bs-tabs { flex-shrink: 0; }
  .bs-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .bs-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
