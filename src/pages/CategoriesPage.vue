<template>
  <q-page class="q-pa-md vds-container">
    <div class="row items-start q-col-gutter-md">
      <div class="col-12 col-md-4">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-h5">Категории</div>
          <q-btn
            flat
            dense
            icon="refresh"
            :loading="store.categoriesLoading"
            @click="reload"
          />
        </div>

        <VdsErrorState
          v-if="store.categoriesError"
          title="Ошибка загрузки категорий"
          :description="store.categoriesError"
          :on-retry="reload"
        />

        <q-skeleton v-else-if="store.categoriesLoading" type="rect" height="220px" />

        <CategoryTree
          v-else
          :nodes="store.categories"
          :active-id="activeId"
          @select="onSelect"
        />
      </div>

      <div class="col-12 col-md-8">
        <div class="text-h6 q-mb-sm">Быстрый переход</div>
        <q-card flat bordered>
          <q-card-section>
            <div class="text-body2 text-grey-7">
              Выбери категорию слева — открою каталог с фильтром по категории.
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn color="primary" to="/catalog" label="Открыть каталог" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import CategoryTree from 'src/components/CategoryTree.vue';
import VdsErrorState from 'src/components/VdsErrorState.vue';
import { useCatalogStore } from 'src/stores/catalog';
import { useApi } from 'src/api/useApi';

const api = useApi();
const store = useCatalogStore();
const router = useRouter();
const route = useRoute();

const activeId = computed(() => {
  const q = route.query.categoryId;
  const v = Array.isArray(q) ? q[0] : q;
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
});

async function reload() {
  await store.fetchCategories(api);
}

function onSelect(categoryId: number | null) {
  const query: Record<string, string> = {};
  if (categoryId != null) query.categoryId = String(categoryId);
  void router.push({ path: '/catalog', query });
}

onMounted(async () => {
  if (store.categories.length === 0) await store.fetchCategories(api);
});
</script>



