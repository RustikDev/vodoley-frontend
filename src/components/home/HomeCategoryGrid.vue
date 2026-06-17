<template>
  <section class="cat-section">
    <div class="vds-container">

      <div class="cat-section__head">
        <div>
          <h2 class="cat-section__title">Категории</h2>
          <div v-if="!loading && totalCount > 0" class="cat-section__sub">{{ totalCount }} разделов</div>
        </div>
        <HomeSectionLink to="/categories" label="Все категории" />
      </div>

      <div v-if="loading" class="cat-grid">
        <div v-for="i in 10" :key="i" class="cat-card cat-card--skeleton" />
      </div>

      <div v-else class="cat-grid">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="cat-card"
          :class="{ 'cat-card--featured': cat.featured }"
          @click="go(cat)"
        >
          <div class="cat-card__arrow">
            <q-icon name="north_east" size="13px" />
          </div>

          <div class="cat-card__deco" :style="decoStyle(cat.color)" />

          <div class="cat-card__bottom">
            <div class="cat-card__name">{{ cat.name }}</div>
            <div v-if="cat.childCount > 0" class="cat-card__count">{{ cat.childCount }} подкатегорий</div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from 'src/api/useApi';
import HomeSectionLink from 'src/components/home/HomeSectionLink.vue';
import type { CategoryNode } from 'src/types/api';

const router = useRouter();
const api = useApi();

const COLORS = [
  '#f9a8a8', '#f8b89a', '#6ec6c4', '#a8c87a', '#7ecfb8',
  '#9fa8d4', '#f0a0b8', '#96cc96', '#bdd87a', '#f5b896',
];

const loading = ref(false);
const allCategories = ref<CategoryNode[]>([]);

const categories = computed(() =>
  allCategories.value
    .slice(0, 10)
    .map((c, i) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      color: COLORS[i % COLORS.length] ?? '#a8c87a',
      featured: i === 0,
      childCount: c.children?.length ?? 0,
    }))
);

const totalCount = computed(() => allCategories.value.length);

onMounted(async () => {
  loading.value = true;
  try {
    allCategories.value = await api.categoriesTree();
  } finally {
    loading.value = false;
  }
});

function decoStyle(color: string) {
  return {
    background: `repeating-linear-gradient(-45deg, ${color} 0px, ${color} 5px, transparent 5px, transparent 12px)`,
    opacity: '0.8',
  };
}

function go(cat: { id: number; slug: string }) {
  void router.push({ path: '/catalog', query: { categoryId: String(cat.id), includeChildren: 'true' } });
}
</script>

<style scoped lang="scss">
.cat-section {
  padding: 48px 0 40px;
  background: var(--vds-color-bg);
}

.cat-section__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.cat-section__title {
  font-size: 28px;
  font-weight: 800;
  color: var(--vds-color-ink);
  margin: 0 0 4px;
  letter-spacing: -0.4px;
}

.cat-section__sub {
  font-size: 14px;
  color: var(--vds-color-ink-3);
  font-weight: 500;
}


/* Grid */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

/* Card */
.cat-card {
  position: relative;
  background: #fff;
  border: 1px solid #e8edf8;
  border-radius: 16px;
  padding: 16px;
  height: 160px;
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.18s, transform 0.18s, border-color 0.18s;

  &:hover {
    box-shadow: 0 6px 24px rgba(37, 87, 230, 0.10);
    transform: translateY(-2px);
    border-color: #c8d4f5;

    .cat-card__arrow {
      background: #2557e6;
      color: #fff;
    }
  }

  &--featured {
    grid-column: span 2;
    background: #edf2ff;
    border-color: #d4e0ff;

    .cat-card__name { font-size: 20px; }

    .cat-card__arrow {
      background: rgba(37, 87, 230, 0.15);
      color: #2557e6;
    }
  }
}

/* Arrow */
.cat-card__arrow {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f4ff;
  color: #2557e6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

/* Decorative circle */
.cat-card__deco {
  position: absolute;
  right: -18px;
  bottom: -18px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  pointer-events: none;
}

/* Bottom text */
.cat-card__bottom {
  position: absolute;
  left: 16px;
  bottom: 16px;
  right: 108px;
}

.cat-card__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--vds-color-ink);
  line-height: 1.3;
  margin-bottom: 4px;
}

.cat-card__count {
  font-size: 12.5px;
  color: var(--vds-color-primary);
  font-weight: 600;
}

.cat-card--skeleton {
  background: #f0f4ff;
  border-color: #e4eaff;
  animation: pulse 1.4s ease-in-out infinite;
  cursor: default;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 767px) {
  .cat-section { padding: 28px 0 20px; }
  .cat-section__title { font-size: 22px; }
  .cat-section__head { margin-bottom: 16px; }
  .cat-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .cat-card--featured { grid-column: span 2; }
  .cat-card { height: 120px; }

  /* Убираем декор — на узких карточках только мешает */
  .cat-card__deco { display: none; }

  /* Стрелка — в правый верхний угол, не в поток */
  .cat-card__arrow {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
  }

  /* Текст теперь занимает всю ширину карточки */
  .cat-card__bottom {
    right: 8px;
  }

  .cat-card__name { font-size: 13px; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .cat-grid { grid-template-columns: repeat(3, 1fr); }
  .cat-card--featured { grid-column: span 2; }
}
</style>
