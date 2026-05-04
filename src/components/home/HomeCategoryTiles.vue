<template>
  <div class="vds-card q-pa-md">
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-subtitle1 text-weight-bold">Категории</div>
      <q-btn flat dense no-caps color="primary" label="Все" to="/categories" />
    </div>

    <div v-if="loading" class="row q-col-gutter-md">
      <div v-for="i in 8" :key="i" class="col-6 col-sm-3">
        <q-skeleton type="rect" height="74px" class="rounded-borders" />
      </div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="c in top" :key="c.id" class="col-6 col-sm-3">
        <q-card flat bordered class="tile" @click="go(c.id)">
          <q-card-section class="q-pa-sm">
            <div class="text-body2 text-weight-medium ellipsis">{{ c.name }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from 'src/api/useApi';
import type { CategoryNode } from 'src/types/api';

const router = useRouter();
const api = useApi();

const loading = ref(false);
const categories = ref<CategoryNode[]>([]);

const top = computed(() => categories.value.slice(0, 8));

function go(categoryId: number) {
  void router.push({ path: '/catalog', query: { categoryId: String(categoryId), includeChildren: 'true' } });
}

onMounted(async () => {
  loading.value = true;
  try {
    categories.value = await api.categoriesTree();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.tile {
  cursor: pointer;
  border-radius: var(--vds-radius-sm);
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.tile:hover {
  transform: translateY(-1px);
  box-shadow: var(--vds-shadow-md);
}
</style>
