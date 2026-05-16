<template>
  <section class="brands-section">
    <div class="vds-container">

      <div class="brands-head">
        <div>
          <h2 class="brands-title">Бренды</h2>
          <div class="brands-sub">Только оригинальное оборудование от производителей</div>
        </div>
        <router-link to="/brands" class="brands-all-link">
          Все{{ totalCount > 0 ? ` ${totalCount}` : '' }} брендов →
        </router-link>
      </div>

      <div v-if="loading" class="brands-grid">
        <div v-for="i in DISPLAY_COUNT + 1" :key="i" class="brand-card brand-card--skeleton" />
      </div>

      <div v-else class="brands-grid">
        <router-link
          v-for="brand in brands"
          :key="brand.id"
          :to="`/brands/${brand.slug}`"
          class="brand-card"
        >
          <div v-if="brand.productCount != null" class="brand-card__count">
            {{ brand.productCount }}&thinsp;тов.
          </div>
          <div class="brand-card__name">{{ brand.name }}</div>
        </router-link>

        <!-- Last cell: "Все бренды →" -->
        <router-link to="/brands" class="brand-card brand-card--all">
          <div class="brand-card__all-link">Все бренды →</div>
        </router-link>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useApi } from 'src/api/useApi';
import type { Brand } from 'src/types/api';

const api = useApi();

const DISPLAY_COUNT = 11;

const loading = ref(false);
const allBrands = ref<Brand[]>([]);

const brands = computed(() => allBrands.value.slice(0, DISPLAY_COUNT));

const totalCount = computed(() => allBrands.value.length);

onMounted(async () => {
  loading.value = true;
  try {
    allBrands.value = await api.brandsList();
  } finally {
    loading.value = false;
  }
});

</script>

<style scoped lang="scss">
.brands-section {
  padding: 48px 0 56px;
  background: var(--vds-color-bg);
}

.brands-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
}

.brands-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--vds-color-ink);
  margin: 0 0 4px;
  letter-spacing: -0.4px;
}

.brands-sub {
  font-size: 14px;
  color: var(--vds-color-ink-3);
  font-weight: 500;
}

.brands-all-link {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--vds-color-primary);
  cursor: pointer;
  white-space: nowrap;
  &:hover { opacity: 0.75; }
}

/* Grid — 6 columns */
.brands-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

/* Card */
.brand-card {
  background: #fff;
  border: 1px solid #e8edf8;
  border-radius: 12px;
  padding: 12px 14px 16px;
  cursor: pointer;
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  position: relative;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  &:hover {
    border-color: #c8d4f5;
    box-shadow: 0 4px 16px rgba(37, 87, 230, 0.08);
  }

  &--all {
    cursor: default;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f4ff;
    border-color: #d4dff8;

    &:hover {
      background: #e6ecff;
      border-color: #2557e6;
    }
  }
}

.brand-card__count {
  position: absolute;
  top: 12px;
  right: 14px;
  font-size: 11.5px;
  color: #8c94b3;
  font-weight: 500;
}

.brand-card__name {
  font-size: 20px;
  font-weight: 800;
  color: #0e1430;
  letter-spacing: -0.3px;
  line-height: 1;
}

.brand-card__all-link {
  font-size: 15px;
  font-weight: 700;
  color: #2557e6;
}

.brand-card--skeleton {
  background: #f0f4ff;
  border-color: #e4eaff;
  cursor: default;
  animation: pulse 1.4s ease-in-out infinite;
  &:hover { box-shadow: none; border-color: #e4eaff; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 767px) {
  .brands-section { padding: 32px 0 36px; }
  .brands-grid { grid-template-columns: repeat(3, 1fr); }
  .brand-card { min-height: 68px; }
  .brand-card__name { font-size: 16px; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .brands-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
