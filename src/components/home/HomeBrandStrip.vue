<template>
  <section class="brands-section">
    <div class="vds-container">

      <div class="brands-head">
        <div>
          <div class="brands-eyebrow">Партнёры</div>
          <h2 class="brands-title">Бренды</h2>
          <div class="brands-sub">Только оригинальное оборудование от производителей</div>
        </div>
        <HomeSectionLink to="/brands" :label="totalCount > 0 ? `Все ${totalCount} брендов` : 'Все бренды'" />
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="brands-grid">
        <div v-for="i in DISPLAY_COUNT + 1" :key="i" class="brand-card brand-card--skeleton">
          <div class="skeleton-logo" />
          <div class="skeleton-line" />
          <div class="skeleton-line skeleton-line--sm" />
        </div>
      </div>

      <!-- Cards -->
      <div v-else class="brands-grid">
        <router-link
          v-for="brand in brands"
          :key="brand.id"
          :to="`/brands/${brand.slug}`"
          class="brand-card"
        >
          <!-- Logo / Letter -->
          <div class="brand-card__logo">
            <img
              v-if="brand.logo"
              :src="api.toAbsoluteUploadUrl(brand.logo)"
              :alt="brand.name"
              class="brand-card__logo-img"
            />
            <span v-else class="brand-card__logo-letter">
              {{ brand.name.charAt(0).toUpperCase() }}
            </span>
          </div>

          <!-- Info -->
          <div class="brand-card__info">
            <div class="brand-card__name">{{ brand.name }}</div>
            <div v-if="brand.productCount != null" class="brand-card__count">
              {{ brand.productCount }}&thinsp;тов.
            </div>
          </div>

          <q-icon name="chevron_right" class="brand-card__chevron" size="16px" />
        </router-link>

        <!-- "Все бренды" cell -->
        <router-link to="/brands" class="brand-card brand-card--all">
          <q-icon name="grid_view" size="28px" class="brand-card__all-icon" />
          <div class="brand-card__all-label">Все бренды</div>
          <div class="brand-card__all-count">{{ totalCount }} позиций</div>
        </router-link>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useApi } from 'src/api/useApi';
import type { Brand } from 'src/types/api';
import HomeSectionLink from 'src/components/home/HomeSectionLink.vue';

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
/* ── Section ─────────────────────────────────────────────── */
.brands-section {
  padding: 56px 0 64px;
  background: linear-gradient(180deg, #f6f8fd 0%, #fff 100%);
}

/* ── Header ──────────────────────────────────────────────── */
.brands-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
}

.brands-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #2557e6;
  margin-bottom: 6px;
}

.brands-title {
  font-size: 30px;
  font-weight: 900;
  color: #0e1430;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}

.brands-sub {
  font-size: 14px;
  color: #6b7596;
  font-weight: 500;
}


/* ── Grid ────────────────────────────────────────────────── */
.brands-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

/* ── Card ────────────────────────────────────────────────── */
.brand-card {
  background: #fff;
  border: 1px solid #e8edf8;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  text-decoration: none;
  transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 120px;

  &:hover {
    border-color: #b8ccf8;
    box-shadow: 0 6px 24px rgba(37, 87, 230, 0.1);
    transform: translateY(-2px);

    .brand-card__chevron { opacity: 1; transform: translateX(2px); }
    .brand-card__logo-letter { background: #2557e6; color: #fff; }
  }
}

/* Logo */
.brand-card__logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.brand-card__logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.brand-card__logo-letter {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff4ff;
  color: #2557e6;
  font-size: 18px;
  font-weight: 900;
  transition: background 0.18s, color 0.18s;
}

/* Info */
.brand-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 3px;
}

.brand-card__name {
  font-size: 15px;
  font-weight: 800;
  color: #0e1430;
  letter-spacing: -0.2px;
  line-height: 1.2;
}

.brand-card__count {
  font-size: 12px;
  font-weight: 500;
  color: #8c94b3;
}

/* Chevron */
.brand-card__chevron {
  position: absolute;
  top: 14px;
  right: 12px;
  color: #b8c4e0;
  opacity: 0;
  transition: opacity 0.18s, transform 0.18s;
}

/* "Все бренды" card */
.brand-card--all {
  background: linear-gradient(135deg, #eef3ff 0%, #e5edff 100%);
  border-color: #d0dcf8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;

  &:hover {
    background: linear-gradient(135deg, #e5edff 0%, #dce7ff 100%);
    border-color: #2557e6;
    transform: translateY(-2px);
  }
}

.brand-card__all-icon { color: #2557e6; }

.brand-card__all-label {
  font-size: 14px;
  font-weight: 800;
  color: #2557e6;
}

.brand-card__all-count {
  font-size: 12px;
  font-weight: 500;
  color: #5a78c5;
}

/* ── Skeleton ────────────────────────────────────────────── */
.brand-card--skeleton {
  background: #f4f7fd;
  border-color: #e8edf8;
  cursor: default;
  gap: 10px;
  animation: pulse 1.4s ease-in-out infinite;

  &:hover { box-shadow: none; border-color: #e8edf8; transform: none; }
}

.skeleton-logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #e2e8f5;
}

.skeleton-line {
  height: 14px;
  border-radius: 6px;
  background: #e2e8f5;
  width: 80%;

  &--sm { width: 50%; height: 11px; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 767px) {
  .brands-section { padding: 36px 0 40px; }
  .brands-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .brand-card { min-height: 100px; }
  .brands-title { font-size: 24px; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .brands-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .brands-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
