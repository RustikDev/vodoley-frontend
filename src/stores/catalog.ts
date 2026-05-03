import { defineStore } from 'pinia';
import type { CategoryNode, Paginated, Product, ProductListQuery } from 'src/types/api';
import type { VodoleyApi } from 'src/api/vodoley';

type CatalogState = {
  categories: CategoryNode[];
  categoriesLoading: boolean;
  products: Paginated<Product> | null;
  productsLoading: boolean;
  lastQuery: ProductListQuery;
};

export const useCatalogStore = defineStore('catalog', {
  state: (): CatalogState => ({
    categories: [],
    categoriesLoading: false,

    products: null,
    productsLoading: false,

    lastQuery: {},
  }),
  actions: {
    async fetchCategories(api: VodoleyApi) {
      this.categoriesLoading = true;
      try {
        this.categories = await api.categoriesTree();
      } finally {
        this.categoriesLoading = false;
      }
    },

    async fetchProducts(api: VodoleyApi, query: ProductListQuery) {
      this.productsLoading = true;
      this.lastQuery = { ...query };
      try {
        this.products = await api.productsList(query);
      } finally {
        this.productsLoading = false;
      }
    },
  },
});
