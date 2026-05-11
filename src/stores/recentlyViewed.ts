import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Product } from 'src/types/api';

const STORAGE_KEY = 'vds_recently_viewed';
const MAX_ITEMS = 12;

export const useRecentlyViewedStore = defineStore('recentlyViewed', () => {
  const items = ref<Product[]>(load());

  function load(): Product[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Product[]) : [];
    } catch {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value));
    } catch { /* ignore */ }
  }

  function add(product: Product) {
    items.value = items.value.filter((p) => p.id !== product.id);
    items.value.unshift(product);
    if (items.value.length > MAX_ITEMS) items.value = items.value.slice(0, MAX_ITEMS);
    save();
  }

  function clear() {
    items.value = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  return { items, add, clear };
});
