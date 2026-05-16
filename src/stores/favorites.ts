import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const STORAGE_KEY = 'vds_favorites_v1';
const MAX_ITEMS = 200;

function loadIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0);
  } catch {
    return [];
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref<number[]>(loadIds());

  const count = computed(() => ids.value.length);

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.value));
    } catch {
      /* ignore */
    }
  }

  function has(productId: number) {
    return ids.value.includes(productId);
  }

  function add(productId: number) {
    if (!Number.isFinite(productId) || productId <= 0) return;
    if (ids.value.includes(productId)) return;
    ids.value = [productId, ...ids.value].slice(0, MAX_ITEMS);
    save();
  }

  function remove(productId: number) {
    ids.value = ids.value.filter((id) => id !== productId);
    save();
  }

  function toggle(productId: number) {
    if (has(productId)) remove(productId);
    else add(productId);
  }

  function clear() {
    ids.value = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  return { ids, count, has, add, remove, toggle, clear };
});