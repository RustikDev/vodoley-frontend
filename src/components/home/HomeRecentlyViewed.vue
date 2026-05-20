<template>
  <section class="rv-section">
    <div class="vds-container">

      <div class="rv-head">
        <div>
          <h2 class="rv-title">Вы недавно смотрели</h2>
          <div class="rv-sub">Не потеряли&nbsp;— продолжите выбор там, где остановились</div>
        </div>
        <button v-if="store.items.length > 0" class="rv-clear" @click="store.clear()">
          Очистить историю
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="store.items.length === 0" class="rv-empty">
        <q-icon name="history" size="36px" class="rv-empty__icon" />
        <div class="rv-empty__text">История просмотров пуста</div>
        <div class="rv-empty__sub">Здесь появятся товары, которые вы открывали</div>
        <HomeSectionLink to="/catalog" label="Перейти в каталог" />
      </div>

      <div v-else class="rv-grid">
        <div
          v-for="product in store.items.slice(0, 6)"
          :key="product.id"
          class="rv-card"
          @click="router.push(`/product/${product.id}`)"
        >
          <!-- Image / placeholder -->
          <div class="rv-card__img-wrap">
            <q-img
              v-if="imageUrl(product)"
              :src="imageUrl(product)!"
              :ratio="1"
              class="rv-card__img"
              spinner-color="primary"
            />
            <div v-else class="rv-card__placeholder" :style="placeholderStyle(product.id)">
              <span class="rv-card__placeholder-text">product_shot</span>
            </div>
          </div>

          <!-- Info -->
          <div class="rv-card__name">{{ product.name }}</div>
          <div class="rv-card__price">
            {{ formatPriceRub(product.price) }}
            <span v-if="product.unit" class="rv-card__unit">Р&nbsp;/&nbsp;{{ product.unit.shortName }}</span>
          </div>
        </div>
      </div>

    </div>
  </section>

</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useRecentlyViewedStore } from 'src/stores/recentlyViewed';
import { useApi } from 'src/api/useApi';
import { formatPriceRub } from 'src/utils/format';
import type { Product } from 'src/types/api';
import HomeSectionLink from 'src/components/home/HomeSectionLink.vue';

const router = useRouter();
const store = useRecentlyViewedStore();
const api = useApi();

const PALETTES = [
  { bg: '#d6eeeb', stripe: 'rgba(80,180,168,0.40)' },
  { bg: '#f5dede', stripe: 'rgba(210,120,120,0.35)' },
  { bg: '#dce8f5', stripe: 'rgba(100,140,210,0.35)' },
  { bg: '#dcecd8', stripe: 'rgba(90,170,110,0.35)' },
  { bg: '#f5e6d8', stripe: 'rgba(210,140,80,0.32)' },
  { bg: '#ecdcf0', stripe: 'rgba(160,100,200,0.32)' },
];

function placeholderStyle(id: number) {
  const p = PALETTES[id % PALETTES.length] ?? { bg: '#d6eeeb', stripe: 'rgba(80,180,168,0.40)' };
  return {
    backgroundColor: p.bg,
    backgroundImage: `repeating-linear-gradient(-45deg, ${p.stripe} 0px, ${p.stripe} 4px, transparent 4px, transparent 11px)`,
  };
}

function imageUrl(product: Product): string | null {
  const imgs = product.images ?? [];
  const img = imgs.find((i) => i.isMain) ?? imgs[0];
  if (!img?.url) return null;
  return img.url.startsWith('http') ? img.url : api.toAbsoluteUploadUrl(img.url);
}
</script>

<style scoped lang="scss">
.rv-section {
  padding: 48px 0 56px;
  background: var(--vds-color-bg);
}

.rv-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
}

.rv-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--vds-color-ink);
  margin: 0 0 4px;
  letter-spacing: -0.4px;
}

.rv-sub {
  font-size: 14px;
  color: var(--vds-color-ink-3);
  font-weight: 500;
}

.rv-clear {
  font-family: 'Manrope', sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  color: #d94040;
  background: transparent;
  border: 1.5px solid #f5c5c5;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.18s, border-color 0.18s;
}

.rv-clear:hover {
  background: #fff0f0;
  border-color: #d94040;
}

/* Empty state */
.rv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: #fff;
  border: 1px dashed #d4daf0;
  border-radius: 16px;
  text-align: center;
  gap: 8px;
}

.rv-empty__icon { color: #c0c8e8; }

.rv-empty__text {
  font-size: 16px;
  font-weight: 700;
  color: var(--vds-color-ink-2);
}

.rv-empty__sub {
  font-size: 13.5px;
  color: var(--vds-color-ink-4);
  font-weight: 500;
}


/* Grid */
.rv-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

/* Card */
.rv-card {
  background: #fff;
  border: 1px solid #e8edf8;
  border-radius: 14px;
  padding: 10px 10px 14px;
  cursor: pointer;
  transition: box-shadow 0.18s, transform 0.18s, border-color 0.18s;

  &:hover {
    box-shadow: 0 6px 20px rgba(37, 87, 230, 0.09);
    transform: translateY(-2px);
    border-color: #c8d4f5;

    .rv-card__name { color: var(--vds-color-primary); }
  }
}

/* Image */
.rv-card__img-wrap {
  margin-bottom: 10px;
}

.rv-card__img {
  border-radius: 8px;
  overflow: hidden;
}

.rv-card__placeholder {
  border-radius: 8px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rv-card__placeholder-text {
  font-size: 11px;
  color: rgba(0,0,0,0.2);
  font-weight: 500;
  letter-spacing: 0.3px;
  user-select: none;
}

/* Info */
.rv-card__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--vds-color-ink);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
  transition: color 0.15s;
}

.rv-card__price {
  font-size: 15px;
  font-weight: 800;
  color: var(--vds-color-ink);
  letter-spacing: -0.2px;
}

.rv-card__unit {
  font-size: 12px;
  font-weight: 500;
  color: var(--vds-color-ink-3);
}

@media (max-width: 767px) {
  .rv-section { padding: 32px 0 40px; }
  .rv-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .rv-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
