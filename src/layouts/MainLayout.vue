<template>
  <q-layout view="hHh lpR lpr">

    <q-header class="vds-header-wrap">

      <div class="util-bar">
        <div class="vds-container">
          <div class="util-inner">
            <div class="util-left">
              <q-icon name="place" size="14px" class="util-pin" />
              <span class="util-city">Бахчисарай</span>
            </div>
            <div class="util-right">
              <span class="util-status">
  <span
    class="util-dot"
    :class="{ 'util-dot--closed': !isOpenNow }"
  />
  {{ workStatusText }}
</span>
              <span class="util-sep-pipe" />
              <router-link to="/about" class="util-link">О нас</router-link>
              <span class="util-sep-pipe" />
              <span>Магазины&thinsp;·&thinsp;3</span>
              <span class="util-sep-pipe" />
              <a href="tel:+78001000000" class="util-phone">+7 (800) 100-00-00</a>
            </div>
          </div>
        </div>
      </div>

      <!-- ② Main header -->
      <div class="site-header">
        <div class="vds-container">
          <div class="header-grid">

            <!-- Logo -->
            <router-link to="/" class="brand-mark">
              <div class="brand-icon">В</div>
              <div class="brand-text">
                <div class="brand-name">Водолей</div>
                <div class="brand-sub">Строительный магазин<br>с&nbsp;2009 года</div>
              </div>
            </router-link>

            <!-- Search bar -->
            <div class="search-bar" :class="{ 'search-bar--focused': searchFocused }">
              <button class="search-cat" @click.stop="catOpen = !catOpen">
                <q-icon name="view_headline" size="15px" />
                <span>Все категории</span>
                <q-icon name="expand_more" size="15px" class="search-cat-arrow" />

                <q-menu
                  v-model="catOpen"
                  anchor="bottom left"
                  self="top left"
                  :offset="[0, 4]"
                  class="search-cat-menu"
                >
                  <q-list dense style="min-width: 220px;">
                    <q-item clickable v-close-popup @click="goCategory(null)">
                      <q-item-section>Все категории</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                      v-for="cat in categories"
                      :key="cat.id"
                      clickable v-close-popup
                      @click="goCategory(cat.id)"
                    >
                      <q-item-section>{{ cat.name }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </button>

              <div class="search-divider" />

              <input
                ref="searchInputEl"
                v-model="searchText"
                type="text"
                class="search-input"
                placeholder="Цемент М500, грунтовка, перфоратор..."
                @focus="searchFocused = true"
                @blur="searchFocused = false"
                @keyup.enter="applySearch"
              />

              <button class="search-btn" @click="applySearch">
                <q-icon name="search" size="18px" />
                <span>Найти</span>
              </button>
            </div>

            <!-- Actions -->
            <div class="header-actions">
              <router-link :to="auth.token ? '/admin' : '/admin/login'" class="hdr-action-btn">
                <q-icon name="person_outline" size="22px" />
                <span>{{ auth.token ? 'Кабинет' : 'Войти' }}</span>
              </router-link>

              <router-link to="/estimate" class="hdr-action-btn">
                <q-icon name="bookmark_border" size="22px" />
                <span>Избранное</span>
              </router-link>

              <router-link to="/estimate" class="hdr-smeta-btn">
                <q-icon name="description" size="18px" />
                <span>Смета</span>
                <span v-if="estimate.count" class="smeta-badge">{{ estimate.count }}</span>
              </router-link>
            </div>

          </div>
        </div>
      </div>

      <!-- ③ Catalog nav bar -->
      <nav class="catalog-nav">
        <div class="vds-container">
          <div class="catalog-nav-inner">

            <router-link to="/categories" class="catalog-main-btn">
              <q-icon name="view_headline" size="20px" class="catalog-main-btn__icon" />
              <span class="catalog-main-btn__text">Каталог<br>товаров</span>
            </router-link>

            <q-btn flat no-caps to="/catalog?sale=true"    class="cnav-link">Акции</q-btn>
            <q-btn flat no-caps to="/about"                class="cnav-link">Доставка</q-btn>
            <q-btn flat no-caps to="/about"                class="cnav-link">Оплата</q-btn>
            <q-btn flat no-caps to="/about"                class="cnav-link">Профи-клиентам</q-btn>
            <q-btn flat no-caps to="/catalog?inStock=true" class="cnav-link">В наличии</q-btn>
            <q-btn flat no-caps to="/about"                class="cnav-link">Возврат</q-btn>
            <q-btn flat no-caps to="/about"                class="cnav-link">О магазине</q-btn>

            <div class="cnav-spacer" />

            <div class="cnav-delivery">
              <q-icon name="schedule" size="15px" class="cnav-delivery__icon" />
              <span>Доставка завтра, если заказать до&nbsp;<strong>18:00</strong></span>
            </div>

            <template v-if="auth.token">
              <div class="cnav-sep" />
              <q-btn flat dense no-caps to="/admin" class="cnav-admin-btn">
                <q-icon name="admin_panel_settings" size="16px" class="q-mr-xs" />
                Админ
              </q-btn>
            </template>

          </div>
        </div>
      </nav>

    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer -->
    <div class="site-footer">
      <div class="vds-container">
        <div class="footer-grid">

          <div class="footer-brand">
            <div class="footer-logo">Водолей</div>
            <div class="footer-tagline">Строительный магазин.<br>Инструменты и материалы.</div>
          </div>

          <div class="footer-col">
            <h4>Покупателям</h4>
            <ul>
              <li><router-link to="/catalog">Каталог товаров</router-link></li>
              <li><router-link to="/categories">Категории</router-link></li>
              <li><router-link to="/estimate">Смета</router-link></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Компания</h4>
            <ul>
              <li><router-link to="/about">О нас</router-link></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Контакты</h4>
            <ul>
              <li><a href="tel:+78001000000">+7 (800) 100-00-00</a></li>
              <li><span>Пн–Вс 8:00–18:00</span></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Доставка</h4>
            <ul>
              <li><span>Доставка по городу</span></li>
              <li><span>Самовывоз</span></li>
            </ul>
          </div>

        </div>

        <div class="footer-bottom">
          <span>© {{ new Date().getFullYear() }} Водолей. Все права защищены.</span>
          <span>Оплата при получении</span>
        </div>
      </div>
    </div>

  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEstimateStore } from 'src/stores/estimate';
import { useAuthStore } from 'src/stores/auth';
import { useApi } from 'src/api/useApi';
import type { CategoryNode } from 'src/types/api';

const route = useRoute();
const router = useRouter();
const estimate = useEstimateStore();
const auth = useAuthStore();
const api = useApi();

const searchText = ref('');
const searchFocused = ref(false);
const catOpen = ref(false);
const categories = ref<CategoryNode[]>([]);

onMounted(async () => {
  const q = route.query.q;
  searchText.value = typeof q === 'string' ? q : '';
  try { categories.value = (await api.categoriesTree()).slice(0, 12); } catch (e) { void e; }
});

function applySearch() {
  const v = searchText.value.trim();
  const cur = typeof route.query.q === 'string' ? route.query.q : '';
  if (v === cur && route.path === '/catalog') return;
  const query: Record<string, string> = {};
  if (v) query.q = v;
  void router.push({ path: '/catalog', query });
}

function goCategory(id: number | null) {
  if (id) {
    void router.push({ path: '/catalog', query: { categoryId: String(id), includeChildren: 'true' } });
  } else {
    void router.push('/catalog');
  }
}

const isOpenNow = computed(() => {
  const now = new Date();

  // время по Москве
  const moscowHour = Number(
    new Intl.DateTimeFormat('ru-RU', {
      timeZone: 'Europe/Moscow',
      hour: 'numeric',
      hour12: false,
    }).format(now),
  );

  return moscowHour >= 8 && moscowHour < 18;
});

const workStatusText = computed(() => {
  return isOpenNow.value
    ? 'Открыто до 18:00'
    : 'Закрыто до 8:00';
});
</script>

<style scoped lang="scss">
.vds-header-wrap {
  background: transparent !important;
  box-shadow: none !important;
}

@media (max-width: 767px) {
  .util-bar    { display: none; }
  .popular-strip { display: none; }

  .header-grid {
    grid-template-columns: 1fr auto !important;
    gap: 0 !important;
    flex-wrap: wrap;
  }

  .search-bar { display: none; }

  .site-header {
    height: auto !important;
    padding: 10px 0;
  }

  .brand-sub { display: none; }

  .header-actions { gap: 4px; }

  .hdr-action-btn span { display: none; }
  .hdr-action-btn { padding: 6px 8px !important; }

  .catalog-nav { display: none; }

  .footer-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 24px !important;
    padding: 32px 0 24px !important;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .util-bar { display: none; }

  .header-grid {
    grid-template-columns: 180px 1fr auto !important;
    gap: 12px !important;
  }

  .brand-sub { display: none; }

  .catalog-nav-inner {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  .footer-grid {
    grid-template-columns: 1fr 1fr 1fr !important;
    gap: 24px !important;
  }
}

.util-bar {
  background: #0e1430;
  height: 36px;
  display: flex;
  align-items: center;
  font-size: 12.5px;
  color: #7a82a8;
}

.util-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  width: 100%;
}

.util-left,
.util-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.util-pin { color: #7a82a8; }

.util-city {
  color: #c5cadf;
  font-weight: 600;
}

.util-sep-dot { color: #4a5270; }

.util-change {
  color: #7a82a8;
  cursor: pointer;
  transition: color 0.15s;
  &:hover { color: #fff; }
}

.util-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.util-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
}

.util-sep-pipe {
  width: 1px;
  height: 14px;
  background: #2b3460;
}

.util-link {
  color: #7a82a8;
  transition: color 0.15s;
  &:hover { color: #c5cadf; }
}

.util-phone {
  color: #c5cadf;
  font-weight: 700;
  letter-spacing: 0.2px;
  &:hover { color: #fff; }
}

/* ── ② Main header ── */
.site-header {
  background: #fff;
  border-bottom: 1px solid #e8edf8;
  height: 76px;
  display: flex;
  align-items: center;
}

.header-grid {
  display: grid;
  grid-template-columns: 210px 1fr auto;
  align-items: center;
  gap: 20px;
  width: 100%;
}

/* Brand */
.brand-mark {
  display: flex;
  align-items: center;
  gap: 11px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: #2557e6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 900;
  font-size: 20px;
  letter-spacing: -1px;
  flex-shrink: 0;
}

.brand-text { display: flex; flex-direction: column; gap: 1px; }

.brand-name {
  font-size: 22px;
  font-weight: 800;
  color: #0e1430;
  letter-spacing: -0.4px;
  line-height: 1;
}

.brand-sub {
  font-size: 10.5px;
  color: #8c94b3;
  font-weight: 500;
  line-height: 1.3;
}

/* Search bar */
.search-bar {
  display: flex;
  align-items: center;
  border: 1.5px solid #d4daf0;
  border-radius: 10px;
  height: 48px;
  background: #fff;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;

  &--focused {
    border-color: #2557e6;
    box-shadow: 0 0 0 3px rgba(37, 87, 230, 0.12);
  }
}

.search-cat {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px 0 16px;
  height: 100%;
  background: none;
  border: none;
  font-family: 'Manrope', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  color: #2b3460;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 0.12s;
  position: relative;

  &:hover { color: #2557e6; }
}

.search-cat-arrow { color: #8c94b3; margin-left: -2px; }

.search-divider {
  width: 1px;
  height: 24px;
  background: #d4daf0;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  padding: 0 14px;
  font-size: 14.5px;
  font-family: 'Manrope', sans-serif;
  color: #0e1430;
  background: transparent;

  &::placeholder {
    color: #8c94b3;
    font-weight: 400;
  }
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 22px;
  height: 100%;
  background: #2557e6;
  border: none;
  color: #fff;
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover { background: #1a45c9; }
}

/* Header actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.hdr-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 8px;
  color: #2b3460;
  text-decoration: none;
  font-size: 11.5px;
  font-weight: 600;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
  line-height: 1;

  &:hover {
    background: #f0f4ff;
    color: #2557e6;
  }
}

.hdr-smeta-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  border-radius: 8px;
  background: #2557e6;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  transition: background 0.15s;
  position: relative;
  margin-left: 4px;

  &:hover { background: #1a45c9; }
}

.smeta-badge {
  background: #ffc83d;
  color: #0e1430;
  font-size: 11px;
  font-weight: 800;
  border-radius: 10px;
  padding: 1px 7px;
  min-width: 20px;
  text-align: center;
}

/* ── ③ Catalog nav ── */
.catalog-nav {
  background: #2557e6;
  height: 52px;
  display: flex;
  align-items: center;
}

.catalog-nav-inner {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
}

.catalog-main-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  height: 52px;
  background: rgba(0, 0, 0, 0.18);
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  transition: background 0.15s;
  white-space: nowrap;

  &:hover { background: rgba(0, 0, 0, 0.28); }

  &__icon { flex-shrink: 0; }
  &__text { line-height: 1.3; }
}

.cnav-link {
  color: rgba(255, 255, 255, 0.88) !important;
  font-weight: 500 !important;
  font-size: 13.5px !important;
  border-radius: 6px !important;
  padding: 4px 12px !important;
  white-space: nowrap;
  transition: background 0.12s, color 0.12s;

  &:hover,
  &.router-link-active {
    background: rgba(255, 255, 255, 0.15) !important;
    color: #fff !important;
  }
}

.cnav-spacer { flex: 1; }

.cnav-delivery {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;
  padding: 0 8px;
  flex-shrink: 0;

  strong { color: #fff; font-weight: 700; }
}

.cnav-delivery__icon { color: rgba(255, 255, 255, 0.7); flex-shrink: 0; }

.cnav-sep {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.25);
  margin: 0 4px;
}

.cnav-admin-btn {
  color: rgba(255, 255, 255, 0.75) !important;
  font-size: 12px !important;
  border-radius: 6px !important;
}

.util-dot--closed {
  background: #ef4444;
}
</style>
