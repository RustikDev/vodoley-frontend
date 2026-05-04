import { defineStore } from 'pinia';
import type { VodoleyApi } from 'src/api/vodoley';
import type { CategoryNode, Paginated, Product, ProductListQuery } from 'src/types/api';

type CatalogState = {
  categories: CategoryNode[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  products: Paginated<Product> | null;
  productsLoading: boolean;
  productsError: string | null;

  lastQuery: ProductListQuery;
};

function toErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : 'Ошибка загрузки';
}

export const useCatalogStore = defineStore('catalog', {
  state: (): CatalogState => ({
    categories: [],
    categoriesLoading: false,
    categoriesError: null,

    products: null,
    productsLoading: false,
    productsError: null,

    lastQuery: {},
  }),
  actions: {
    async fetchCategories(api: VodoleyApi) {
      this.categoriesError = null;
      this.categoriesLoading = true;
      try {
        this.categories = await api.categoriesTree();
      } catch (e) {
        this.categoriesError = toErrorMessage(e);
        throw e;
      } finally {
        this.categoriesLoading = false;
      }
    },

    async fetchProducts(api: VodoleyApi, query: ProductListQuery) {
      this.productsError = null;
      this.productsLoading = true;
      this.lastQuery = { ...query };
      try {
        this.products = await api.productsList(query);
      } catch (e) {
        this.productsError = toErrorMessage(e);
        throw e;
      } finally {
        this.productsLoading = false;
      }
    },
  },
});
