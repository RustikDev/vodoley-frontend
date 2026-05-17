<template>
  <q-page class="fav-page">
    <div class="wrap">
      <div class="crumbs">
        <router-link to="/">Главная</router-link><span class="sep">/</span>
        <span>Избранное</span>
      </div>

      <div class="pagehead">
        <div>
          <h1>
            Избранное
            <span class="count">{{ totalCountText }}</span>
          </h1>
          <p>
            Сохранённые товары распределены по категориям. Добавляйте сразу в смету или
            формируйте подборку для заказа.
          </p>
        </div>

        <div class="head-actions">
          <VdsBtn v-if="fav.count" variant="primary" icon="add" label="Всё в смету" @click="addAllToEstimate" />
          <VdsBtn v-if="fav.count" variant="danger-ghost" label="Очистить" @click="fav.clear" />
        </div>
      </div>

      <div v-if="!fav.count" class="empty">
        <div class="empty-card">
          <div class="empty-title">В избранном пока пусто</div>
          <div class="empty-sub">Открой товар в каталоге и нажми на сердечко.</div>
          <VdsBtn variant="primary" label="Перейти в каталог" to="/catalog" />
        </div>
      </div>

      <template v-else>
        <div class="summary">
          <div class="scard">
            <div class="sl">Товаров</div>
            <div class="sv">{{ total }}</div>
            <div class="sb">В {{ categoriesCount }} категориях</div>
          </div>
          <div class="scard">
            <div class="sl">В наличии</div>
            <div class="sv">
              <span class="green">{{ inStock }}</span>
              <span class="u">из {{ total }}</span>
            </div>
            <div class="sb">Можно заказать сейчас</div>
          </div>
          <div class="scard">
            <div class="sl">Нет в наличии</div>
            <div class="sv" style="color:var(--red-600)">{{ outOfStock }}</div>
            <div class="sb">Можно подписаться на наличие</div>
          </div>
          <div class="scard accent">
            <div class="sl">Сумма всей подборки</div>
            <div class="sv">{{ sumRub }} <span class="u">₽</span></div>
            <div class="sb">С учётом текущих цен</div>
          </div>
        </div>

        <div class="filterbar">
          <span class="fbl">Категории:</span>

          <button
            class="chip"
            :class="{ on: filterKey === 'all' }"
            type="button"
            @click="filterKey = 'all'"
          >
            Все <span class="c">{{ total }}</span>
          </button>

          <button
            v-for="c in categoryChips"
            :key="c.key"
            class="chip"
            :class="{ on: filterKey === c.key }"
            type="button"
            @click="filterKey = c.key"
          >
            {{ c.title }} <span class="c">{{ c.count }}</span>
          </button>

          <div class="right">
            <button class="sort" type="button">
              Цена <span class="sort-arrow">↕</span>
            </button>
          </div>
        </div>

        <div v-if="loading" class="loading">
          <q-spinner color="primary" size="22px" />
          <span>Загружаем товары…</span>
        </div>

        <q-banner v-else-if="loadError" class="bg-red-1 text-red-10" rounded>
          {{ loadError }}
        </q-banner>

        <div v-else>
          <section v-for="group in visibleGroups" :key="group.key" class="catsec">
            <div class="catsec-head">
              <div class="catsec-title">
                <div class="catsec-icn">#</div>
                <div>
                  <h2>{{ group.title }}</h2>
                </div>
                <span class="ccount">{{ group.items.length }} шт.</span>
              </div>

              <div class="catsec-actions">
                <button class="ica" type="button" @click="addCategoryToEstimate(group)">В смету</button>
                <button class="ica danger" type="button" @click="clearCategory(group)">Очистить</button>
              </div>
            </div>

            <div class="pgrid">
              <ProductCard
                v-for="p in group.items"
                :key="p.id"
                :product="p"
              />
            </div>
          </section>
        </div>

        <!-- Sticky selection actionbar -->
        <div class="actionbar" :class="{ on: selectedIds.size > 0 }">
          <span class="selcount">{{ selectedIds.size }} выбрано</span>
          <span class="actsep" />
          <VdsBtn variant="ghost" size="sm" label="Снять выбор" @click="clearSelection" />
          <VdsBtn variant="ghost" size="sm" label="Убрать" @click="removeSelected" />
          <VdsBtn variant="primary" size="sm" label="+ В смету" @click="addSelectedToEstimate" />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import { computed, onMounted, ref, watch } from 'vue';
import { useApi } from 'src/api/useApi';
import type { Product } from 'src/types/api';
import { useEstimateStore } from 'src/stores/estimate';
import { useFavoritesStore } from 'src/stores/favorites';
import VdsBtn from 'src/components/VdsBtn.vue';
import ProductCard from 'src/components/ProductCard.vue';

const api = useApi();
const fav = useFavoritesStore();
const estimate = useEstimateStore();

const loading = ref(false);
const loadError = ref<string | null>(null);
const products = ref<Product[]>([]);

type GroupKey = `cat:${number}` | 'cat:none';
type FilterKey = 'all' | GroupKey;

const filterKey = ref<FilterKey>('all');
const selectedIds = ref(new Set<number>());

function isOutOfStock(p: Product) {
  const status = p.inventory?.status;
  if (status === 'OUT_OF_STOCK') return true;
  const qty = p.inventory?.quantity;
  return typeof qty === 'number' && qty <= 0;
}

function clearSelection() {
  selectedIds.value = new Set();
}

function addCategoryToEstimate(group: Group) {
  const can = group.items.filter((p) => !isOutOfStock(p));
  can.forEach((p) => estimate.addProduct(p, 1));
  Notify.create({ type: 'positive', message: `Добавлено в смету: ${can.length}` });
}

function addAllToEstimate() {
  const can = products.value.filter((p) => !isOutOfStock(p));
  can.forEach((p) => estimate.addProduct(p, 1));
  Notify.create({ type: 'positive', message: `Добавлено в смету: ${can.length}` });
}

function addSelectedToEstimate() {
  const sel = products.value.filter((p) => selectedIds.value.has(p.id) && !isOutOfStock(p));
  sel.forEach((p) => estimate.addProduct(p, 1));
  Notify.create({ type: 'positive', message: `Добавлено в смету: ${sel.length}` });
  clearSelection();
}

function removeSelected() {
  selectedIds.value.forEach((id) => fav.remove(id));
  Notify.create({ type: 'positive', message: 'Удалено из избранного' });
  clearSelection();
}

function clearCategory(group: Group) {
  group.items.forEach((p) => fav.remove(p.id));
  Notify.create({ type: 'positive', message: 'Категория очищена' });
}

async function load() {
  loadError.value = null;
  loading.value = true;

  try {
    const ids = [...fav.ids];
    const out = await Promise.all(
      ids.map(async (id) => {
        try {
          return await api.productById(id);
        } catch {
          return null;
        }
      }),
    );

    products.value = out.filter((p): p is Product => !!p);

    const okIds = new Set(products.value.map((p) => p.id));
    const missing = fav.ids.filter((id) => !okIds.has(id));
    missing.forEach((id) => fav.remove(id));
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Ошибка загрузки избранного';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (fav.count) void load();
});

watch(
  () => fav.ids.slice().join(','),
  () => {
    if (!fav.count) {
      products.value = [];
      filterKey.value = 'all';
      selectedIds.value = new Set();
      return;
    }
    void load();
  },
);

type Group = { key: GroupKey; title: string; items: Product[] };

const groups = computed<Group[]>(() => {
  const map = new Map<GroupKey, Group>();

  for (const p of products.value) {
    const title = p.category?.name ?? 'Без категории';
    const key: GroupKey = p.category ? `cat:${p.category.id}` : 'cat:none';

    let cur = map.get(key);
    if (!cur) {
      cur = { key, title, items: [] as Product[] };
      map.set(key, cur);
    }

    cur.items.push(p);
  }

  return [...map.values()]
    .map((g) => ({
      ...g,
      items: g.items.slice().sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, 'ru'));
});

const visibleGroups = computed(() => {
  if (filterKey.value === 'all') return groups.value;
  return groups.value.filter((g) => g.key === filterKey.value);
});

const total = computed(() => fav.count);
const categoriesCount = computed(() => groups.value.length);
const inStock = computed(() => products.value.filter((p) => !isOutOfStock(p)).length);
const outOfStock = computed(() => Math.max(0, total.value - inStock.value));
const sumRub = computed(() =>
  products.value
    .filter((p) => !isOutOfStock(p))
    .reduce((s, p) => s + Number(p.price || 0), 0)
    .toLocaleString('ru-RU'),
);

function plural(n: number, a: string, b: string, c: string) {
  const m = n % 10;
  const k = n % 100;
  if (k >= 11 && k <= 14) return c;
  if (m === 1) return a;
  if (m >= 2 && m <= 4) return b;
  return c;
}

const totalCountText = computed(() => `${total.value} ${plural(total.value, 'товар', 'товара', 'товаров')}`);

const categoryChips = computed(() =>
  groups.value.map((g) => ({
    key: g.key,
    title: g.title,
    count: g.items.length,
  })),
);
</script>

<style scoped>
:root {
  --blue-50:#eff5ff; --blue-100:#dde9ff; --blue-200:#bcd2ff;
  --blue-500:#3b6bf5; --blue-600:#2557e6; --blue-700:#1c44c2; --blue-900:#0f2674;
  --yellow:#ffc83d; --yellow-700:#e0a30b;
  --ink:#0e1430; --ink-2:#344066; --ink-3:#6b7596;
  --line:#e6ebf5; --line-2:#d5deef;
  --bg:#f6f8fd; --bg-card:#fff;
  --green-50:#e6f8ee; --green-700:#117a3d; --red-600:#d63a3a;
}

.fav-page {
  background: var(--bg);
  color: var(--ink);
  padding: 0 0 40px;
}

.wrap { max-width: 1280px; margin: 0 auto; padding: 0 28px; }

.crumbs { display:flex; gap:8px; font-size:13px; color:var(--ink-3); padding:18px 0 0; }
.crumbs a:hover { color:var(--blue-700); }
.crumbs .sep { opacity:0.5; }

.pagehead { padding:22px 0 28px; display:grid; grid-template-columns:1fr auto; gap:32px; align-items:end; }
.pagehead h1 { font-size:44px; line-height:1.04; font-weight:800; letter-spacing:-0.02em; margin:8px 0 10px; }
.pagehead h1 .count { font-family:"JetBrains Mono",ui-monospace,monospace; font-weight:600; color:var(--ink-3); font-size:22px; margin-left:12px; letter-spacing:-0.01em; }
.pagehead p { font-size:15px; color:var(--ink-2); max-width:680px; line-height:1.55; margin:0; }
.head-actions { display:flex; gap:10px; align-items:center; justify-content:flex-end; flex-wrap:wrap; }

.btn { display:inline-flex; align-items:center; gap:8px; padding:11px 16px; border-radius:11px; font-weight:600; font-size:14px; border:none; cursor:pointer; transition:background .12s, color .12s, border-color .12s; }
.btn.primary { background:#2557e6; color:#fff; }
.btn.primary:hover { background:#1a45c9; }
.btn.danger { background:#fff; color:var(--red-600); border:1px solid #f4d3d3; }
.btn.danger:hover { background:#fde8e8; }
.btn.ghost { background:#fff; color:var(--ink-2); border:1px solid var(--line); }
.btn.ghost:hover { border-color:var(--blue-200); color:var(--blue-700); }

.ico { font-weight:900; font-size:16px; line-height:1; }

.summary { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:14px; margin-bottom:24px; }
.scard { background:#fff; border:1px solid var(--line); border-radius:14px; padding:18px; }
.scard .sl { font-size:12px; font-weight:600; color:var(--ink-3); letter-spacing:0.04em; text-transform:uppercase; }
.scard .sv { font-size:26px; font-weight:800; margin-top:8px; letter-spacing:-0.01em; }
.scard .sv .u { font-size:14px; color:var(--ink-3); font-weight:600; margin-left:2px; }
.scard .sb { font-size:12.5px; color:var(--ink-3); margin-top:6px; }
.scard.accent { background:linear-gradient(160deg,#f1f6ff,#e2ecff); border-color:var(--blue-100); }
.scard.accent .sv { color:var(--blue-700); }
.green { color:var(--green-700); }

.filterbar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; background:#fff; border:1px solid var(--line); border-radius:14px; padding:10px 14px; margin-bottom:24px; }
.filterbar .fbl { font-size:13px; color:var(--ink-3); font-weight:600; margin-right:4px; }
.chip { display:inline-flex; align-items:center; gap:7px; padding:7px 13px; border-radius:999px; background:#f4f7fd; color:var(--ink-2); font-size:13px; font-weight:600; cursor:pointer; transition:background .12s, color .12s; border:1px solid transparent; }
.chip:hover { background:var(--blue-50); color:var(--blue-700); }
.chip.on { background:var(--blue-600); color:#fff; }
.chip .c { background:rgba(255,255,255,0.18); font-size:11px; padding:1px 7px; border-radius:999px; font-family:"JetBrains Mono",ui-monospace,monospace; font-weight:600; }
.chip:not(.on) .c { background:#fff; color:var(--ink-3); border:1px solid var(--line); }
.filterbar .right { margin-left:auto; display:flex; gap:10px; align-items:center; }
.sort { display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:var(--ink-2); padding:7px 12px; border-radius:8px; border:1px solid var(--line); background:#fff; cursor:pointer; }
.sort:hover { border-color:var(--blue-200); }
.sort-arrow { color:var(--ink-3); }
.catsec { margin-bottom:36px; scroll-margin-top:160px; }
.catsec-head { display:flex; align-items:center; justify-content:space-between; padding:0 4px 14px; gap:16px; flex-wrap:wrap; }
.catsec-title { display:inline-flex; align-items:center; gap:14px; flex-wrap:wrap; }
.catsec-icn { width:42px; height:42px; border-radius:11px; background:var(--blue-50); color:var(--blue-700); display:grid; place-items:center; font-weight:800; }
.catsec-title h2 { font-size:24px; font-weight:800; letter-spacing:-0.02em; margin:0; }
.catsec-title .ccount { font-family:"JetBrains Mono",ui-monospace,monospace; font-size:13px; color:var(--ink-3); font-weight:600; background:#fff; padding:3px 10px; border-radius:999px; border:1px solid var(--line); }
.catsec-actions { display:flex; gap:8px; align-items:center; }
.ica { display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:600; padding:7px 12px; border-radius:8px; background:#2557e6; color:#fff; border:none; cursor:pointer; transition:background .12s; }
.ica:hover { background:#1a45c9; }
.ica.danger { background:#fff0f0; color:#d63a3a; border:1px solid #f4d3d3; }
.ica.danger:hover { background:#fde8e8; border-color:#f0b8b8; }

.pgrid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }

/* Actionbar */
.actionbar {
  position:sticky; bottom:14px; z-index:40;
  background:#0e1430; color:#fff;
  border-radius:14px; padding:14px 18px;
  display:flex; align-items:center; gap:14px;
  box-shadow:0 18px 30px -16px rgba(14,20,48,0.5);
  margin-top:20px;
  opacity:0; transform:translateY(8px); pointer-events:none;
  transition:opacity .15s, transform .15s;
}
.actionbar.on { opacity:1; transform:translateY(0); pointer-events:auto; }
.selcount { font-family:"JetBrains Mono",ui-monospace,monospace; font-size:13px; color:#c0c9e8; background:rgba(255,255,255,0.08); padding:5px 10px; border-radius:8px; }
.actsep { flex:1; }
.a-btn { background:rgba(255,255,255,0.1); color:#fff; font-weight:600; font-size:13.5px; padding:10px 14px; border-radius:9px; display:inline-flex; align-items:center; gap:8px; }
.a-btn:hover { background:rgba(255,255,255,0.18); }
.a-btn.primary { background:var(--yellow); color:#0e1430; }
.a-btn.primary:hover { background:#ffd66b; }

.loading { display:flex; align-items:center; gap:10px; color:var(--ink-3); padding:10px 0 14px; }

.empty { padding:24px 0 10px; }
.empty-card { background:#fff; border:1px solid var(--line); border-radius:16px; padding:26px; max-width:620px; }
.empty-title { font-size:22px; font-weight:800; letter-spacing:-0.01em; }
.empty-sub { margin-top:8px; color:var(--ink-3); font-size:14px; line-height:1.5; margin-bottom:14px; }

@media (max-width: 1200px) {
  .summary { grid-template-columns:1fr 1fr; }
  .pgrid { grid-template-columns:repeat(3,1fr); }
}

@media (max-width: 900px) {
  .pagehead { grid-template-columns:1fr; }
  .summary { grid-template-columns:1fr 1fr; }
  .pgrid { grid-template-columns:repeat(2,1fr); }
}

@media (max-width: 600px) {
  .wrap { padding:0 14px; }
  .pagehead h1 { font-size:32px; }
  .summary { grid-template-columns:1fr; }
  .pgrid { grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px; }
}
</style>
