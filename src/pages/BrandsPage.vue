<template>
  <q-page class="brands-page">
    <div class="wrap">

      <!-- Breadcrumbs -->
      <div class="crumbs">
        <router-link to="/">Главная</router-link>
        <span class="sep">/</span>
        <span>Бренды</span>
      </div>

      <!-- Page header -->
      <div class="pagehead">
        <div>
          <h1>Бренды <span class="count">{{ countText }}</span></h1>
          <p>Все производители, представленные в нашем каталоге. Нажмите на бренд — перейдёте к его товарам.</p>
        </div>

        <div class="head-right">
          <div class="search-wrap">
            <input
              v-model="searchQ"
              type="text"
              class="brand-search"
              placeholder="Поиск бренда…"
            />
            <span class="search-ico">⌕</span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="brands-loading">
        <div v-for="i in 12" :key="i" class="brand-tile brand-tile--skeleton" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="brands-error">
        <div class="error-card">
          <div class="error-ico">⚠</div>
          <div class="error-title">Не удалось загрузить бренды</div>
          <div class="error-sub">{{ error }}</div>
          <button class="btn primary" type="button" @click="load">Попробовать снова</button>
        </div>
      </div>

      <!-- Empty search result -->
      <div v-else-if="!filtered.length && searchQ" class="brands-empty">
        <div class="empty-card">
          <div class="empty-title">Ничего не найдено</div>
          <div class="empty-sub">По запросу «{{ searchQ }}» брендов не найдено.</div>
          <button class="btn ghost" type="button" @click="searchQ = ''">Сбросить поиск</button>
        </div>
      </div>

      <!-- No brands yet -->
      <div v-else-if="!filtered.length" class="brands-empty">
        <div class="empty-card">
          <div class="empty-title">Бренды ещё не добавлены</div>
          <div class="empty-sub">Скоро здесь появятся производители из нашего каталога.</div>
          <router-link class="btn primary" to="/catalog">Перейти в каталог</router-link>
        </div>
      </div>

      <!-- Alphabet groups -->
      <template v-else>
        <!-- Letter quick-nav -->
        <div v-if="letterGroups.length > 2" class="letter-nav">
          <button
            v-for="g in letterGroups"
            :key="g.letter"
            class="letter-btn"
            type="button"
            @click="scrollToLetter(g.letter)"
          >
            {{ g.letter }}
          </button>
        </div>

        <div
          v-for="g in letterGroups"
          :key="g.letter"
          :id="`letter-${g.letter}`"
          class="letter-section"
        >
          <div class="letter-label">{{ g.letter }}</div>

          <div class="brands-grid">
            <button
              v-for="brand in g.brands"
              :key="brand.id"
              class="brand-tile"
              type="button"
              @click="gotoBrand(brand)"
            >
              <!-- Logo -->
              <div class="brand-logo">
                <img
                  v-if="brand.logo"
                  :src="logoUrl(brand)"
                  :alt="brand.name"
                  class="brand-logo-img"
                />
                <span v-else class="brand-logo-letter">
                  {{ brand.name.charAt(0).toUpperCase() }}
                </span>
              </div>

              <!-- Info -->
              <div class="brand-info">
                <div class="brand-name">{{ brand.name }}</div>
                <div class="brand-meta">
                  <span v-if="brand.productCount != null" class="brand-count">
                    {{ brand.productCount }} {{ plural(brand.productCount, 'товар', 'товара', 'товаров') }}
                  </span>
                  <span v-if="brand.productCount != null && brand.categoryCount != null" class="brand-meta-sep">·</span>
                  <span v-if="brand.categoryCount != null" class="brand-cats">
                    {{ brand.categoryCount }} {{ plural(brand.categoryCount, 'категория', 'категории', 'категорий') }}
                  </span>
                </div>
              </div>

              <div class="brand-arrow">→</div>
            </button>
          </div>
        </div>
      </template>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from 'src/api/useApi';
import type { Brand } from 'src/types/api';

const api = useApi();
const router = useRouter();

const loading = ref(false);
const error = ref<string | null>(null);
const brands = ref<Brand[]>([]);
const searchQ = ref('');

async function load() {
  error.value = null;
  loading.value = true;
  try {
    brands.value = await api.brandsList();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки брендов';
  } finally {
    loading.value = false;
  }
}

onMounted(() => { void load(); });

function logoUrl(brand: Brand): string | undefined {
  if (!brand.logo) return undefined;
  return brand.logo.startsWith('http')
    ? brand.logo
    : api.toAbsoluteUploadUrl(brand.logo);
}

function gotoBrand(brand: Brand) {
  void router.push(`/brands/${brand.slug}`);
}

function scrollToLetter(letter: string) {
  const el = document.getElementById(`letter-${letter}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function plural(n: number, a: string, b: string, c: string) {
  const m = n % 10;
  const k = n % 100;
  if (k >= 11 && k <= 14) return c;
  if (m === 1) return a;
  if (m >= 2 && m <= 4) return b;
  return c;
}

const filtered = computed(() => {
  if (!searchQ.value.trim()) return brands.value;
  const q = searchQ.value.trim().toLowerCase();
  return brands.value.filter((b) => b.name.toLowerCase().includes(q));
});

const letterGroups = computed(() => {
  const map = new Map<string, Brand[]>();

  for (const b of filtered.value) {
    const letter = b.name.charAt(0).toUpperCase();
    let arr = map.get(letter);
    if (!arr) { arr = []; map.set(letter, arr); }
    arr.push(b);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'ru'))
    .map(([letter, list]) => ({
      letter,
      brands: list.slice().sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    }));
});

const countText = computed(() => {
  const n = brands.value.length;
  if (!n) return '';
  return `${n} ${plural(n, 'бренд', 'бренда', 'брендов')}`;
});
</script>

<style scoped>
:root {
  --blue-50:#eff5ff; --blue-100:#dde9ff; --blue-200:#bcd2ff;
  --blue-600:#2557e6; --blue-700:#1c44c2;
  --ink:#0e1430; --ink-2:#344066; --ink-3:#6b7596;
  --line:#e6ebf5; --bg:#f6f8fd;
  --red-600:#d63a3a;
}

.brands-page {
  background: var(--bg);
  color: var(--ink);
  padding: 0 0 60px;
}

.wrap { max-width: 1280px; margin: 0 auto; padding: 0 28px; }

/* Breadcrumbs */
.crumbs { display:flex; gap:8px; font-size:13px; color:var(--ink-3); padding:18px 0 0; }
.crumbs a:hover { color:var(--blue-700); }
.crumbs .sep { opacity:0.5; }

/* Page head */
.pagehead {
  padding: 22px 0 28px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  align-items: end;
}
.pagehead h1 {
  font-size: 44px;
  line-height: 1.04;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 8px 0 10px;
}
.pagehead h1 .count {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-weight: 600;
  color: var(--ink-3);
  font-size: 22px;
  margin-left: 12px;
  letter-spacing: -0.01em;
}
.pagehead p { font-size:15px; color:var(--ink-2); max-width:680px; line-height:1.55; margin:0; }

.head-right { display:flex; align-items:flex-end; }

/* Search */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.brand-search {
  width: 260px;
  height: 44px;
  padding: 0 40px 0 16px;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink);
  background: #fff;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.brand-search:focus {
  border-color: var(--blue-600);
  box-shadow: 0 0 0 4px rgba(37,87,230,0.1);
}
.brand-search::placeholder { color: var(--ink-3); }
.search-ico {
  position: absolute;
  right: 13px;
  font-size: 18px;
  color: var(--ink-3);
  pointer-events: none;
}

/* Buttons */
.btn { display:inline-flex; align-items:center; gap:8px; padding:11px 18px; border-radius:11px; font-weight:600; font-size:14px; font-family:inherit; cursor:pointer; transition:background .12s, border-color .12s; }
.btn.primary { background:var(--blue-600); color:#fff; border:0; }
.btn.primary:hover { background:var(--blue-700); }
.btn.ghost { background:#fff; color:var(--ink-2); border:1px solid var(--line); }
.btn.ghost:hover { border-color:var(--blue-200); color:var(--blue-700); }

/* Letter nav */
.letter-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 10px 14px;
  margin-bottom: 28px;
}
.letter-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink-2);
  background: #f4f7fd;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background .12s, color .12s;
  display: grid;
  place-items: center;
}
.letter-btn:hover {
  background: var(--blue-50);
  color: var(--blue-700);
}

/* Letter section */
.letter-section {
  margin-bottom: 36px;
  scroll-margin-top: 170px;
}
.letter-label {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-3);
  padding: 0 4px 14px;
  border-bottom: 2px solid var(--line);
  margin-bottom: 18px;
}

/* Brand grid */
.brands-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

/* Brand tile */
.brand-tile {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color .15s, box-shadow .15s, transform .15s;
}
.brand-tile:hover {
  border-color: var(--blue-200);
  box-shadow: 0 12px 28px -16px rgba(28, 68, 194, 0.28);
  transform: translateY(-2px);
}
.brand-tile:hover .brand-arrow {
  color: var(--blue-700);
  transform: translateX(3px);
}

/* Logo */
.brand-logo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: var(--blue-50);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.brand-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}
.brand-logo-letter {
  font-size: 28px;
  font-weight: 800;
  color: var(--blue-700);
  line-height: 1;
}

/* Info */
.brand-info { flex: 1; min-width: 0; }
.brand-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.brand-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.brand-count,
.brand-cats {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 500;
}
.brand-meta-sep {
  font-size: 11px;
  color: var(--line);
}

/* Arrow */
.brand-arrow {
  font-size: 18px;
  color: var(--ink-3);
  flex-shrink: 0;
  transition: color .15s, transform .15s;
}

/* Skeleton */
.brand-tile--skeleton {
  pointer-events: none;
  border-color: var(--line);
  box-shadow: none;
  transform: none;
  height: 104px;
  background: linear-gradient(90deg, #f4f7fd 25%, #eaeffa 50%, #f4f7fd 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Loading grid */
.brands-loading {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

/* Empty / error */
.brands-empty,
.brands-error { padding: 24px 0 10px; }
.empty-card,
.error-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 32px;
  max-width: 560px;
}
.empty-title,
.error-title { font-size: 22px; font-weight: 800; letter-spacing: -0.01em; }
.empty-sub,
.error-sub { margin-top: 8px; color: var(--ink-3); font-size: 14px; line-height: 1.5; margin-bottom: 18px; }
.error-ico { font-size: 32px; margin-bottom: 12px; }
.error-card .error-title { color: var(--red-600); }

/* Responsive */
@media (max-width: 1100px) {
  .brands-grid,
  .brands-loading { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .pagehead { grid-template-columns: 1fr; }
  .brands-grid,
  .brands-loading { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .wrap { padding: 0 14px; }
  .pagehead h1 { font-size: 32px; }
  .brand-search { width: 100%; }
  .head-right { width: 100%; }
  .brands-grid,
  .brands-loading { grid-template-columns: 1fr 1fr; gap: 10px; }
  .brand-tile { padding: 14px; gap: 12px; }
  .brand-logo { width: 48px; height: 48px; }
  .brand-logo-letter { font-size: 22px; }
  .brand-name { font-size: 14px; }
}
</style>
