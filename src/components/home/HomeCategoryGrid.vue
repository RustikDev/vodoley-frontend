<template>
  <section class="cat-section">
    <div class="vds-container">

      <div class="cat-section__head">
        <div>
          <h2 class="cat-section__title">Категории</h2>
          <div class="cat-section__sub">28&thinsp;040 товаров в 26 разделах</div>
        </div>
        <router-link to="/categories" class="cat-section__all">Все категории →</router-link>
      </div>

      <div class="cat-grid">
        <div
          v-for="cat in categories"
          :key="cat.name"
          class="cat-card"
          :class="{ 'cat-card--featured': cat.featured }"
          @click="router.push(cat.to)"
        >
          <div class="cat-card__arrow">
            <q-icon name="north_east" size="13px" />
          </div>

          <div class="cat-card__deco" :style="decoStyle(cat.color)" />

          <div class="cat-card__bottom">
            <div class="cat-card__name">{{ cat.name }}</div>
            <div class="cat-card__count">{{ cat.count }} товаров</div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const categories = [
  { name: 'Сухие смеси и цемент',  count: '1 820', color: '#f9a8a8', featured: false, to: '/catalog?q=сухие+смеси' },
  { name: 'Кровля и водосток',      count: '942',   color: '#f8b89a', featured: false, to: '/catalog?q=кровля' },
  { name: 'Электроинструмент',      count: '2 640', color: '#6ec6c4', featured: true,  to: '/catalog?q=электроинструмент' },
  { name: 'Крепёж и метизы',        count: '4 280', color: '#a8c87a', featured: false, to: '/catalog?q=крепёж' },
  { name: 'Сантехника',             count: '1 860', color: '#7ecfb8', featured: false, to: '/catalog?q=сантехника' },
  { name: 'Электрика и кабель',     count: '2 120', color: '#9fa8d4', featured: false, to: '/catalog?q=электрика' },
  { name: 'Краски и грунты',        count: '1 180', color: '#f0a0b8', featured: false, to: '/catalog?q=краска' },
  { name: 'Напольные покрытия',     count: '760',   color: '#96cc96', featured: false, to: '/catalog?q=напольные' },
  { name: 'Сад и участок',          count: '540',   color: '#bdd87a', featured: false, to: '/catalog?q=сад' },
  { name: 'Спецодежда и СИЗ',       count: '690',   color: '#f5b896', featured: false, to: '/catalog?q=спецодежда' },
];

function decoStyle(color: string) {
  return {
    background: `repeating-linear-gradient(-45deg, ${color} 0px, ${color} 5px, transparent 5px, transparent 12px)`,
    opacity: '0.8',
  };
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

.cat-section__all {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--vds-color-primary);
  text-decoration: none;
  white-space: nowrap;
  &:hover { opacity: 0.75; }
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

@media (max-width: 767px) {
  .cat-section { padding: 32px 0 24px; }
  .cat-grid { grid-template-columns: repeat(2, 1fr); }
  .cat-card--featured { grid-column: span 2; }
  .cat-card { height: 130px; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .cat-grid { grid-template-columns: repeat(3, 1fr); }
  .cat-card--featured { grid-column: span 2; }
}
</style>
