<template>
  <section class="hero-section">
    <div class="vds-container">
      <div class="hero-grid">
        <aside class="cat-sidebar">
          <ul class="cat-list">
            <li
              v-for="(cat, idx) in sidebarCats"
              :key="cat.id"
              class="cat-list__item"
              :class="{ 'cat-list__item--active': idx === activeIdx }"
              @mouseenter="activeIdx = idx"
              @mouseleave="activeIdx = 0"
            >
              <router-link :to="cat.to" class="cat-list__link">
                <q-icon :name="cat.icon" size="17px" class="cat-list__icon" />
                <span class="cat-list__name">{{ cat.name }}</span>
                <q-icon name="chevron_right" size="15px" class="cat-list__arrow" />
              </router-link>
            </li>
          </ul>
        </aside>

        <div class="hero-banner">
          <q-carousel
            v-model="slide"
            animated
            swipeable
            infinite
            :autoplay="6000"
            class="hero-carousel"
            control-color="white"
          >
            <q-carousel-slide :name="1" class="hero-slide hero-slide--blue">
              <div class="hero-slide__content">
                <div class="hero-badge">
                  <q-icon name="star" size="11px" />
                  СКИДКИ ДО −30%
                </div>
                <h1 class="hero-slide__title">Инструменты и материалы для большой стройки</h1>
                <p class="hero-slide__desc">
                  Более 28&nbsp;000 наименований. Самовывоз за 30&nbsp;минут, доставка по Бахчисараю и
                  области от&nbsp;800&nbsp;₽.
                </p>
                <div class="hero-slide__actions">
                  <router-link to="/catalog" class="hero-btn-primary">
                    Перейти в каталог &nbsp;→
                  </router-link>
                </div>
              </div>
              <div class="hero-slide__deco">
                <div class="deco-circle" />
                <q-icon name="warning" size="140px" class="deco-triangle" />
              </div>
            </q-carousel-slide>

            <q-carousel-slide :name="2" class="hero-slide hero-slide--dark">
              <div class="hero-slide__content">
                <div class="hero-badge">
                  <q-icon name="local_shipping" size="11px" />
                  БЫСТРАЯ ДОСТАВКА
                </div>
                <h1 class="hero-slide__title">Доставка по Бахчисараю от&nbsp;800&nbsp;₽</h1>
                <p class="hero-slide__desc">
                  Привезём на следующий день, если заказать до&nbsp;18:00. Работаем без выходных.
                </p>
                <div class="hero-slide__actions">
                  <router-link to="/about" class="hero-btn-primary">
                    Подробнее &nbsp;→
                  </router-link>
                </div>
              </div>
              <div class="hero-slide__deco">
                <div class="deco-circle" />
                <q-icon name="local_shipping" size="140px" class="deco-triangle" />
              </div>
            </q-carousel-slide>
          </q-carousel>

          <div class="hero-dots">
            <button
              v-for="n in 2"
              :key="n"
              class="hero-dot"
              :class="{ 'hero-dot--active': slide === n }"
              @click="slide = n"
            />
          </div>
        </div>

        <div class="hero-side">
          <div class="side-card side-card--yellow" @click="router.push('/delivery')">
            <div class="side-card__tag">
              <q-icon name="bolt" size="13px" />
              Быстро
            </div>
            <div class="side-card__title">Самовывоз за 30&nbsp;минут</div>
            <div class="side-card__desc">Соберём заказ к вашему приезду</div>
            <div class="side-card__spacer" />
            <div class="side-card__link">Как это работает →</div>
          </div>

          <div class="side-card side-card--dark" @click="router.push('/estimate')">
            <div class="side-card__tag">
              <q-icon name="receipt_long" size="13px" />
              Профи
            </div>
            <div class="side-card__title">Смета и закупки</div>
            <div class="side-card__desc">Собирайте лист и выгружайте в Excel или счёт</div>
            <div class="side-card__spacer" />
            <div class="side-card__link side-card__link--yellow">Открыть смету →</div>
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
import type { CategoryNode } from 'src/types/api';

const router = useRouter();
const api = useApi();

const slide = ref(1);
const activeIdx = ref(0);

const allCategories = ref<CategoryNode[]>([]);

const ICON_MAP: Record<string, string> = {
  'Строительные материалы': 'home_repair_service',
  'Кровля и фасад':         'roofing',
  'Стены и перегородки':    'layers',
  'Полы':                   'grid_on',
  'Двери и окна':           'sensor_door',
  'Инженерные системы':     'plumbing',
  'Электрика':              'electrical_services',
  'Инструмент':             'handyman',
  'Крепёж и метизы':        'hardware',
  'Лакокрасочные материалы':'format_paint',
};

const sidebarCats = computed(() =>
  allCategories.value.slice(0, 10).map((c) => ({
    id: c.id,
    name: c.name,
    icon: ICON_MAP[c.name] ?? 'category',
    to: { path: '/catalog', query: { categoryId: String(c.id), includeChildren: 'true' } },
  }))
);

onMounted(async () => {
  try {
    allCategories.value = await api.categoriesTree();
  } catch {
    // sidebar remains empty — non-critical
  }
});
</script>

<style scoped lang="scss">
.hero-section {
  background: var(--vds-color-bg);
  padding: 24px 0 8px;
}

.hero-grid {
  display: grid;
  grid-template-columns: 264px 1fr 280px;
  gap: 16px;
  border-radius: var(--vds-radius-lg);
  overflow: hidden;
  min-height: 420px;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr 260px;
    .cat-sidebar {
      display: none;
    }
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    min-height: unset;
    .hero-side {
      flex-direction: row;
    }
  }
}

.cat-sidebar {
  background: #fff;
  border: 1px solid #edf0f9;
  border-radius: 16px;
}

.cat-list {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 10px;
  height: 430px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0;
}

.cat-list__item {
  &--active .cat-list__link {
    background: #f0f4ff;
    color: #2557e6;
    border-left: 3px solid #2557e6;
    padding-left: calc(16px - 3px);

    .cat-list__icon {
      color: #2557e6;
    }
    .cat-list__arrow {
      opacity: 1;
      color: #2557e6;
    }
  }
}

.cat-list__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 500;
  color: #2b3460;
  text-decoration: none;
  border-left: 3px solid transparent;
  transition:
    background 0.12s,
    color 0.12s;
  cursor: pointer;

  &:hover {
    background: #f5f7ff;
    color: #2557e6;
    .cat-list__icon {
      color: #2557e6;
    }
    .cat-list__arrow {
      opacity: 1;
    }
  }
}

.cat-list__icon {
  color: #8c94b3;
  flex-shrink: 0;
  transition: color 0.12s;
}
.cat-list__name {
  flex: 1;
  line-height: 1.3;
}
.cat-list__arrow {
  color: #c0c7e0;
  opacity: 0;
  transition: opacity 0.12s;
  flex-shrink: 0;
}

/* ── Banner carousel ── */
.hero-banner {
  border-radius: 16px;
  background: radial-gradient(
    120% 100% at 0% 0%,
    #3162e8 0%,
    var(--blue-600) 40%,
    var(--blue-700) 90%
  );
  color: #fff;
  position: relative;
  overflow: hidden;
  height: 430px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hero-carousel {
  height: 100% !important;
  min-height: 420px;
}

.hero-slide {
  color: #fff;
  display: flex;
  align-items: stretch;
  padding: 0 !important;
  position: relative;
  overflow: hidden;

  &--blue {
    background: linear-gradient(125deg, #1a3eb5 0%, #2557e6 55%, #3b6ef0 100%);
  }
  &--dark {
    background: linear-gradient(125deg, #0e1430 0%, #1a2d6b 60%, #2557e6 100%);
  }
}

.hero-slide__content {
  position: relative;
  z-index: 2;
  padding: 40px 40px 60px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #fff;
  width: fit-content;
  margin-bottom: 20px;
}

.hero-slide__title {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.13;
  letter-spacing: -0.5px;
  color: #fff;
  margin: 0 0 16px;
}

.hero-slide__desc {
  font-size: 14.5px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 28px;
  max-width: 420px;
}

.hero-slide__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn-primary {
  display: inline-flex;
  align-items: center;
  background: #ffc83d;
  color: #0e1430;
  font-size: 15px;
  font-weight: 800;
  padding: 14px 28px;
  border-radius: 10px;
  text-decoration: none;
  transition:
    background 0.15s,
    transform 0.12s;
  white-space: nowrap;
  &:hover {
    background: #e5a800;
    transform: translateY(-1px);
  }
}

.hero-btn-ghost {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 14.5px;
  font-weight: 600;
  padding: 13px 24px;
  border-radius: 10px;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }
}

/* Decorative element */
.hero-slide__deco {
  position: absolute;
  right: -2px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
}

.deco-circle {
  position: absolute;
  width: 280px;
  height: 280px;
  border: 50px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.deco-triangle {
  color: #ffc83d !important;
  opacity: 0.9;
  filter: drop-shadow(0 8px 24px rgba(255, 200, 61, 0.35));
}

/* Custom dots */
.hero-dots {
  position: absolute;
  bottom: 18px;
  left: 40px;
  display: flex;
  gap: 6px;
  z-index: 10;
}

.hero-dot {
  width: 28px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.35);
  border: none;
  cursor: pointer;
  transition:
    background 0.2s,
    width 0.2s;
  padding: 0;

  &--active {
    background: #fff;
    width: 40px;
  }
}

/* ── Side cards ── */
.hero-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 430px;
}

.side-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid var(--line);
  padding: 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &:hover {
    filter: brightness(0.97);
  }
  & + & {
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  &--yellow {
    background: linear-gradient(160deg, #ffd66b);
    color: #221700;
    border-color: transparent;
  }
  &--dark {
    background: linear-gradient(160deg, #131a3d, #0e1430);
    color: #fff;
    border-color: transparent;
  }
}

.side-card__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 12px;

  .side-card--yellow & {
    color: rgba(14, 20, 48, 0.55);
  }
  .side-card--dark & {
    color: rgba(255, 255, 255, 0.5);
  }
}

.side-card__title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.3px;
  margin-bottom: 8px;

  .side-card--yellow & {
    color: #0e1430;
  }
  .side-card--dark & {
    color: #fff;
  }
}

.side-card__desc {
  font-size: 13px;
  line-height: 1.5;
  font-weight: 500;

  .side-card--yellow & {
    color: rgba(14, 20, 48, 0.6);
  }
  .side-card--dark & {
    color: rgba(255, 255, 255, 0.55);
  }
}

.side-card__spacer {
  flex: 1;
}

.side-card__link {
  font-size: 13.5px;
  font-weight: 700;
  margin-top: 16px;
  transition: opacity 0.12s;
  cursor: pointer;

  .side-card--yellow & {
    color: #1a45c9;
  }
  .side-card--dark & {
    color: rgba(255, 255, 255, 0.6);
  }

  &--yellow {
    color: #ffc83d !important;
  }

  &:hover {
    opacity: 0.8;
  }
}

/* ── Responsive ── */
@media (max-width: 767px) {
  .hero-section {
    padding: 12px 0 0;
  }

  .hero-carousel {
    min-height: 280px !important;
  }

  .hero-slide__content {
    padding: 24px 20px 40px;
  }

  .hero-slide__title {
    font-size: 24px;
  }
  .hero-slide__desc {
    font-size: 13px;
  }

  .hero-btn-primary {
    font-size: 13px !important;
    padding: 11px 20px !important;
  }
  .hero-btn-ghost {
    font-size: 13px !important;
    padding: 10px 16px !important;
  }

  .hero-badges {
    gap: 14px;
  }

  .hero-side {
    flex-direction: row;
    padding: 10px;
    gap: 10px;
  }

  .side-card {
    padding: 16px 14px;
  }
  .side-card__title {
    font-size: 15px;
  }
  .side-card__spacer {
    display: none;
  }
  .side-card__link {
    margin-top: 8px;
    font-size: 12px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .hero-carousel {
    min-height: 340px !important;
  }
  .hero-slide__title {
    font-size: 28px;
  }
  .hero-slide__content {
    padding: 30px 32px 48px;
  }
}
</style>
