<template>
  <div class="pcard" @click="router.push(`/product/${product.id}`)">

    <!-- Image / placeholder -->
    <div class="pcard__img-wrap">
      <!-- Badge -->
      <div v-if="badge" class="pcard__badge" :class="`pcard__badge--${badge.type}`">
        {{ badge.label }}
      </div>

      <!-- Favourite -->
      <button class="pcard__fav" :class="{ 'pcard__fav--active': isFav }" @click.stop="fav.toggle(product.id)">
        <q-icon :name="isFav ? 'favorite' : 'favorite_border'" size="18px" />
      </button>

      <!-- Real image -->
      <q-img
        v-if="imageUrl"
        :src="imageUrl"
        :ratio="1"
        class="pcard__real-img"
        spinner-color="primary"
      />

      <!-- Striped placeholder -->
      <div v-else class="pcard__placeholder" :style="placeholderStyle">
        <span class="pcard__placeholder-text">{{ placeholderText }}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="pcard__body">
      <div v-if="brandText" class="pcard__brand">{{ brandText }}</div>

      <div class="pcard__name">{{ product.name }}</div>

      <!-- Stock -->
      <div class="pcard__stock" :class="`pcard__stock--${stockType}`">
        <span class="pcard__stock-dot" />
        {{ stockLabel }}
        <span v-if="stockQty" class="pcard__stock-qty">&nbsp;·&nbsp;{{ stockQty }}</span>
      </div>

      <!-- Price -->
      <div class="pcard__price-row">
        <span class="pcard__price">{{ formatPriceRub(product.price) }}</span>
        <span v-if="product.unit" class="pcard__unit">р&nbsp;/&nbsp;{{ product.unit.shortName }}</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Product } from 'src/types/api';
import { useApi } from 'src/api/useApi';
import { formatPriceRub } from 'src/utils/format';
import { useFavoritesStore } from 'src/stores/favorites';

const props = defineProps<{ product: Product }>();
const router = useRouter();
const api = useApi();
const fav = useFavoritesStore();

const isFav = computed(() => fav.has(props.product.id));

/* ── Image ── */
const imageUrl = computed(() => {
  const imgs = props.product.images ?? [];
  const img = imgs.find((i) => i.isMain) ?? imgs[0];
  if (!img?.url) return null;
  return img.url.startsWith('http') ? img.url : api.toAbsoluteUploadUrl(img.url);
});

/* ── Placeholder ── */
const PLACEHOLDER_PALETTES = [
  { bg: '#d6eeeb', stripe: 'rgba(80,180,168,0.45)' },
  { bg: '#f5dede', stripe: 'rgba(210,120,120,0.38)' },
  { bg: '#dce8f5', stripe: 'rgba(100,140,210,0.38)' },
  { bg: '#dcecd8', stripe: 'rgba(90,170,110,0.38)' },
  { bg: '#f5e6d8', stripe: 'rgba(210,140,80,0.35)' },
  { bg: '#ecdcf0', stripe: 'rgba(160,100,200,0.35)' },
];

const placeholderStyle = computed(() => {
  const p = PLACEHOLDER_PALETTES[props.product.id % PLACEHOLDER_PALETTES.length] ?? PLACEHOLDER_PALETTES[0]!;
  return {
    backgroundColor: p.bg,
    backgroundImage: `repeating-linear-gradient(-45deg, ${p.stripe} 0px, ${p.stripe} 4px, transparent 4px, transparent 11px)`,
  };
});

const placeholderText = computed(() =>
  props.product.category?.name ?? props.product.name.split(' ')[0] ?? '',
);

/* ── Brand ── */
const brandText = computed(() =>
  props.product.category?.name?.toUpperCase() ?? null,
);

/* ── Badge ── */
const badge = computed<{ label: string; type: string } | null>(() => {
  if (props.product.isHit) return { label: 'ХИТ', type: 'hit' };
  if (props.product.inventory?.status === 'ON_ORDER') return { label: 'НОВИНКА', type: 'new' };
  return null;
});

/* ── Stock ── */
const stockType = computed(() => {
  const s = props.product.inventory?.status;
  if (s === 'IN_STOCK') return 'green';
  if (s === 'OUT_OF_STOCK') return 'red';
  return 'orange';
});

const stockLabel = computed(() => {
  const s = props.product.inventory?.status;
  if (s === 'IN_STOCK') return 'В наличии';
  if (s === 'OUT_OF_STOCK') return 'Нет в наличии';
  if (s === 'ON_ORDER') return 'Под заказ';
  return 'Уточняйте';
});

const stockQty = computed(() => {
  const qty = props.product.inventory?.quantity;
  if (!qty) return null;
  const unit = props.product.unit?.shortName ?? 'шт';
  return `${qty} ${unit}`;
});
</script>

<style scoped lang="scss">
.pcard {
  background: #fff;
  border: 1px solid #e8edf8;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.18s, transform 0.18s, border-color 0.18s;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 8px 28px rgba(37, 87, 230, 0.10);
    transform: translateY(-2px);
    border-color: #c8d4f5;
  }
}

/* Image wrap */
.pcard__img-wrap {
  position: relative;
  padding: 12px 12px 0;
}

/* Badge */
.pcard__badge {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 2;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 4px 9px;
  border-radius: 6px;

  &--hit  { background: #ffc83d; color: #0e1430; }
  &--new  { background: #2557e6; color: #fff; }
  &--sale { background: #e53935; color: #fff; }
}

/* Favourite */
.pcard__fav {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c94b3;
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
  transition: color 0.15s;

  &:hover { color: #e53935; }
}

/* Real image */
.pcard__real-img {
  border-radius: 10px;
  overflow: hidden;
}

/* Placeholder */
.pcard__placeholder {
  border-radius: 10px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.pcard__placeholder-text {
  font-size: 15px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.18);
  letter-spacing: 0.5px;
  user-select: none;
}

/* Body */
.pcard__body {
  padding: 14px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.pcard__brand {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #2557e6;
}

.pcard__name {
  font-size: 14.5px;
  font-weight: 700;
  color: #0e1430;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Stock */
.pcard__stock {
  display: flex;
  align-items: center;
  font-size: 12.5px;
  font-weight: 600;
  margin-top: 2px;

  &--green { color: #16a34a; .pcard__stock-dot { background: #16a34a; } }
  &--red   { color: #dc2626; .pcard__stock-dot { background: #dc2626; } }
  &--orange{ color: #d97706; .pcard__stock-dot { background: #d97706; } }
}

.pcard__stock-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
  flex-shrink: 0;
}

.pcard__stock-qty {
  color: #8c94b3;
  font-weight: 500;
}

/* Price */
.pcard__price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 4px;
}

.pcard__price {
  font-size: 22px;
  font-weight: 800;
  color: #0e1430;
  letter-spacing: -0.4px;
}

.pcard__unit {
  font-size: 12.5px;
  color: #8c94b3;
  font-weight: 500;
}
</style>
