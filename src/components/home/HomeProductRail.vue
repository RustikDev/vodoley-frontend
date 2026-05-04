<template>
  <div class="vds-card q-pa-md">
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
      <q-btn flat dense no-caps color="primary" label="В каталог" :to="to" />
    </div>

    <div v-if="loading" class="row q-col-gutter-md no-wrap" style="overflow-x:auto">
      <div v-for="i in 6" :key="i" style="width: 220px; flex: 0 0 auto">
        <q-card class="vds-card">
          <q-skeleton height="140px" square />
          <q-card-section>
            <q-skeleton type="text" />
            <q-skeleton type="text" width="70%" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <VdsErrorState
      v-else-if="error"
      title="Ошибка"
      :description="error"
      :on-retry="reload"
    />

    <VdsEmptyState
      v-else-if="items.length === 0"
      icon="inbox"
      title="Пока пусто"
      description="Нет товаров по выбранной подборке"
    />

    <div v-else class="row q-col-gutter-md no-wrap" style="overflow-x:auto; padding-bottom: 6px">
      <div v-for="p in items" :key="p.id" style="width: 240px; flex: 0 0 auto">
        <ProductCard :product="p" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useApi } from 'src/api/useApi';
import type { Product, ProductListQuery } from 'src/types/api';
import ProductCard from 'src/components/ProductCard.vue';
import VdsEmptyState from 'src/components/VdsEmptyState.vue';
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

async function reload() {
  error.value = null;
  loading.value = true;
  try {
    const res = await api.productsList({ ...props.query, page: 1, pageSize: 10 });
    items.value = res.items;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void reload();
});
</script>
