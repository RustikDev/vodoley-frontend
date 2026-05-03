<template>
  <q-card class="full-height">
    <q-img v-if="imageUrl" :src="imageUrl" :ratio="4 / 3" spinner-color="primary" />
    <div v-else class="bg-grey-2" style="height: 180px" />

    <q-card-section class="q-pb-none">
      <div class="text-subtitle1 text-weight-medium ellipsis-2-lines">
        {{ product.name }}
      </div>
      <div class="text-body2 text-grey-7 ellipsis-2-lines" v-if="product.description">
        {{ product.description }}
      </div>
    </q-card-section>

    <q-card-section class="q-pt-sm">
      <div class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">{{ formatPriceRub(product.price) }}</div>
        <q-badge v-if="stockLabel" :color="stockColor" outline>{{ stockLabel }}</q-badge>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn flat color="primary" :to="`/product/${product.id}`" label="Подробнее" />
      <q-btn flat color="primary" icon="add" label="В смету" @click="addToEstimate" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Notify } from 'quasar';
import type { Product } from 'src/types/api';
import { useApi } from 'src/api/useApi';
import { formatPriceRub } from 'src/utils/format';
import { useEstimateStore } from 'src/stores/estimate';

const props = defineProps<{ product: Product }>();
const api = useApi();
const estimate = useEstimateStore();

const imageUrl = computed(() => {
  const first = props.product.images?.[0];
  if (!first?.url) return null;
  return first.url.startsWith('http') ? first.url : api.toAbsoluteUploadUrl(first.url);
});

const stockLabel = computed(() => {
  const inv = props.product.inventory;
  if (!inv) return null;
  if (inv.status === 'IN_STOCK') return 'В наличии';
  if (inv.status === 'OUT_OF_STOCK') return 'Нет в наличии';
  if (inv.status === 'ON_ORDER') return 'Под заказ';
  return null;
});

const stockColor = computed(() => {
  const inv = props.product.inventory;
  if (!inv) return 'grey-7';
  if (inv.status === 'IN_STOCK') return 'positive';
  if (inv.status === 'OUT_OF_STOCK') return 'negative';
  return 'warning';
});

function addToEstimate() {
  estimate.addProduct(props.product, 1);
  Notify.create({ type: 'positive', message: 'Добавлено в смету' });
}
</script>

<style scoped lang="scss">
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
