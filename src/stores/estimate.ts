import { defineStore } from 'pinia';
import type { Product } from 'src/types/api';

export type EstimateItem = {
  productId: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
};

export type EstimateState = {
  items: EstimateItem[];
};

const STORAGE_KEY = 'vodoley_estimate_v1';

function safeLoad(): EstimateItem[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === 'object')
      .map((x) => x as Partial<EstimateItem>)
      .filter((x) => typeof x.productId === 'number' && typeof x.quantity === 'number')
      .map((x) => ({
        productId: x.productId!,
        name: String(x.name ?? ''),
        unit: String(x.unit ?? ''),
        price: Number(x.price ?? 0),
        quantity: Number(x.quantity ?? 0),
      }))
      .filter((x) => Number.isFinite(x.productId) && Number.isFinite(x.quantity) && x.quantity > 0);
  } catch {
    return [];
  }
}

function safeSave(items: EstimateItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const useEstimateStore = defineStore('estimate', {
  state: (): EstimateState => ({
    items: safeLoad(),
  }),
  getters: {
    total(state): number {
      return state.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    },
    count(state): number {
      return state.items.reduce((sum, it) => sum + it.quantity, 0);
    },
  },
  actions: {
    persist() {
      safeSave(this.items);
    },
    clear() {
      this.items = [];
      this.persist();
    },
    remove(productId: number) {
      this.items = this.items.filter((x) => x.productId !== productId);
      this.persist();
    },
    setQuantity(productId: number, quantity: number) {
      const q = Number(quantity);
      if (!Number.isFinite(q) || q <= 0) {
        this.remove(productId);
        return;
      }
      const item = this.items.find((x) => x.productId === productId);
      if (!item) return;
      item.quantity = q;
      this.persist();
    },
    addProduct(product: Product, quantity = 1) {
      const q = Math.max(1, Math.floor(Number(quantity) || 1));
      const unit = product.unit?.shortName || product.unit?.name || String(product.unitId);
      const existing = this.items.find((x) => x.productId === product.id);
      if (existing) {
        existing.quantity += q;
      } else {
        this.items.push({
          productId: product.id,
          name: product.name,
          unit,
          price: parseFloat(product.price),
          quantity: q,
        });
      }
      this.persist();
    },
    setItems(items: EstimateItem[]) {
      this.items = items;
      this.persist();
    },
  },
});
