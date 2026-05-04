<template>
  <q-page class="q-pa-md vds-container">
    <q-breadcrumbs class="q-mb-md" active-color="primary">
      <q-breadcrumbs-el label="Каталог" to="/catalog" />
      <q-breadcrumbs-el :label="product?.name ?? 'Товар'" />
    </q-breadcrumbs>

    <div v-if="loading" class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-skeleton type="rect" height="320px" />
      </div>
      <div class="col-12 col-md-7">
        <q-skeleton type="text" width="60%" />
        <q-skeleton type="text" />
        <q-skeleton type="text" width="80%" />
        <q-skeleton type="rect" height="120px" class="q-mt-md" />
      </div>
    </div>

    <div v-else-if="product" class="row items-start q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card flat bordered class="vds-card">
          <q-img
            v-if="activeImageUrl"
            :src="activeImageUrl"
            :ratio="4 / 3"
            spinner-color="primary"
          />
          <div v-else class="bg-grey-2" style="height: 320px" />

          <q-separator />

          <q-card-section v-if="imageUrls.length > 1" class="q-pa-sm">
            <div class="row q-col-gutter-sm">
              <div v-for="(u, idx) in imageUrls" :key="u" class="col-auto">
                <q-img
                  :src="u"
                  :ratio="1"
                  style="width: 64px; height: 64px; border-radius: 6px; cursor: pointer"
                  :class="idx === activeImageIndex ? 'thumb--active' : 'thumb'"
                  @click="activeImageIndex = idx"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <div class="text-h5 text-weight-bold q-mb-xs">{{ product.name }}</div>
        <div class="text-body2 text-grey-7 q-mb-md" v-if="product.description">
          {{ product.description }}
        </div>

        <q-card flat bordered class="q-mb-md vds-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold">{{ formatPriceRub(product.price) }}</div>
              <q-badge v-if="stockLabel" :color="stockColor" outline>{{ stockLabel }}</q-badge>
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">Ед. изм.: {{ unitLabel }}</div>

            <div class="row items-center q-gutter-sm q-mt-md">
              <q-input
                v-model.number="qty"
                dense
                outlined
                type="number"
                min="1"
                label="Кол-во"
                style="max-width: 140px"
              />
              <q-btn color="primary" icon="add" label="В смету" @click="addToEstimate" />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="vds-card">
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Характеристики</div>
            <q-list dense>
              <q-item>
                <q-item-section>Категория</q-item-section>
                <q-item-section side>{{ categoryLabel }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Наличие</q-item-section>
                <q-item-section side>{{ stockLabel ?? '—' }}</q-item-section>
              </q-item>
              <q-item v-if="product.inventory">
                <q-item-section>Кол-во</q-item-section>
                <q-item-section side>{{ product.inventory.quantity }}</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 q-mt-lg">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-h6">Похожие товары</div>
          <q-btn flat dense icon="refresh" :loading="recoLoading" @click="reloadRecommendations" />
        </div>

        <div v-if="recoLoading" class="row q-col-gutter-md">
          <div v-for="i in 3" :key="i" class="col-12 col-sm-6 col-md-4">
            <q-card>
              <q-skeleton height="180px" square />
              <q-card-section>
                <q-skeleton type="text" />
                <q-skeleton type="text" width="70%" />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-else-if="recommendations.length === 0" class="q-pa-md text-grey-7">
          Пока нет рекомендаций.
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="p in recommendations" :key="p.id" class="col-12 col-sm-6 col-md-4">
            <ProductCard :product="p" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="q-pa-md text-grey-7">Товар не найден.</div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Notify } from 'quasar';
import { useApi } from 'src/api/useApi';
import { useEstimateStore } from 'src/stores/estimate';
import { formatPriceRub } from 'src/utils/format';
import type { Product } from 'src/types/api';
import ProductCard from 'src/components/ProductCard.vue';

const route = useRoute();
const api = useApi();
const estimate = useEstimateStore();

const loading = ref(false);
const recoLoading = ref(false);

const product = ref<Product | null>(null);
const recommendations = ref<Product[]>([]);

const activeImageIndex = ref(0);
const qty = ref(1);

const productId = computed(() => {
  const raw = route.params.id;
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
});

const imageUrls = computed(() => {
  const imgs = product.value?.images ?? [];
  return imgs
    .map((i) => i.url)
    .filter((u): u is string => typeof u === 'string' && u.length > 0)
    .map((u) => (u.startsWith('http') ? u : api.toAbsoluteUploadUrl(u)));
});

const activeImageUrl = computed(() => imageUrls.value[activeImageIndex.value] ?? null);

const stockLabel = computed(() => {
  const inv = product.value?.inventory;
  if (!inv) return null;
  if (inv.status === 'IN_STOCK') return 'В наличии';
  if (inv.status === 'OUT_OF_STOCK') return 'Нет в наличии';
  if (inv.status === 'ON_ORDER') return 'Под заказ';
  return null;
});

const stockColor = computed(() => {
  const inv = product.value?.inventory;
  if (!inv) return 'grey-7';
  if (inv.status === 'IN_STOCK') return 'positive';
  if (inv.status === 'OUT_OF_STOCK') return 'negative';
  return 'warning';
});

const unitLabel = computed(() => {
  const u = product.value?.unit;
  if (!u) return '—';
  return u.shortName || u.name;
});

const categoryLabel = computed(() => {
  const c = product.value?.category;
  return c?.name ?? String(product.value?.categoryId ?? '—');
});

function addToEstimate() {
  if (!product.value) return;
  estimate.addProduct(product.value, qty.value);
  Notify.create({ type: 'positive', message: 'Добавлено в смету' });
}

async function reload() {
  const id = productId.value;
  if (!id) {
    product.value = null;
    return;
  }

  loading.value = true;
  try {
    product.value = await api.productById(id);
    activeImageIndex.value = 0;
    qty.value = 1;
  } finally {
    loading.value = false;
  }
}

async function reloadRecommendations() {
  const id = productId.value;
  if (!id) {
    recommendations.value = [];
    return;
  }

  recoLoading.value = true;
  try {
    recommendations.value = await api.productRecommendations(id);
  } finally {
    recoLoading.value = false;
  }
}

watch(
  () => productId.value,
  async () => {
    await reload();
    await reloadRecommendations();
  },
);

onMounted(async () => {
  await reload();
  await reloadRecommendations();
});
</script>

<style scoped lang="scss">
.thumb {
  opacity: 0.75;
}

.thumb--active {
  opacity: 1;
  outline: 2px solid var(--q-primary);
  outline-offset: 2px;
}
</style>


