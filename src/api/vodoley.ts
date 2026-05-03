import type { AxiosInstance } from 'axios';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  Category,
  CategoryNode,
  CreateCategoryRequest,
  CreateProductRequest,
  CreateUnitRequest,
  EstimatePreviewRequest,
  EstimatePreviewResponse,
  Inventory,
  Product,
  ProductImage,
  ProductListQuery,
  Paginated,
  Unit,
  UpdateCategoryRequest,
  UpdateInventoryRequest,
  UpdateProductRequest,
  UpdateUnitRequest,
} from 'src/types/api';

function joinUrl(baseURL: string, path: string) {
  const base = baseURL.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function createVodoleyApi(axios: AxiosInstance) {
  return {
    axios,

    getBaseURL() {
      return (axios.defaults.baseURL ?? '');
    },

    toAbsoluteUploadUrl(uploadPath: string) {
      return joinUrl(this.getBaseURL(), uploadPath);
    },

    // Public
    async categoriesTree() {
      const { data } = await axios.get<CategoryNode[]>('/categories/tree');
      return data;
    },

    async productsList(query: ProductListQuery = {}) {
      const { data } = await axios.get<Paginated<Product>>('/products', { params: query });
      return data;
    },

    async productById(id: number) {
      const { data } = await axios.get<Product>(`/products/${id}`);
      return data;
    },

    async productRecommendations(id: number) {
      const { data } = await axios.get<Product[]>(`/products/${id}/recommendations`);
      return data;
    },

    async estimatePreview(payload: EstimatePreviewRequest) {
      const { data } = await axios.post<EstimatePreviewResponse>('/estimate/preview', payload);
      return data;
    },

    // Admin auth
    async adminLogin(payload: AdminLoginRequest) {
      const { data } = await axios.post<AdminLoginResponse>('/admin/auth/login', payload);
      return data;
    },

    // Admin / Products
    async adminProductsList(query: ProductListQuery = {}) {
      const { data } = await axios.get<Paginated<Product>>('/admin/products', { params: query });
      return data;
    },

    async adminProductById(id: number) {
      const { data } = await axios.get<Product>(`/admin/products/${id}`);
      return data;
    },

    async adminCreateProduct(payload: CreateProductRequest) {
      const { data } = await axios.post<Product>('/admin/products', payload);
      return data;
    },

    async adminCreateProductMultipart(payload: {
      name: string;
      slug: string;
      description?: string;
      price: number;
      categoryId: number;
      unitId: number;
      isActive?: boolean;
      inventoryQuantity?: number;
      inventoryStatus?: Inventory['status'];
      images?: File[];
    }) {
      const form = new FormData();
      form.set('name', payload.name);
      form.set('slug', payload.slug);
      if (payload.description != null) form.set('description', payload.description);
      form.set('price', String(payload.price));
      form.set('categoryId', String(payload.categoryId));
      form.set('unitId', String(payload.unitId));
      if (payload.isActive != null) form.set('isActive', String(payload.isActive));
      if (payload.inventoryQuantity != null) form.set('inventoryQuantity', String(payload.inventoryQuantity));
      if (payload.inventoryStatus != null) form.set('inventoryStatus', payload.inventoryStatus);
      (payload.images ?? []).forEach((f) => form.append('images', f));

      const { data } = await axios.post<Product>('/admin/products', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },

    async adminUpdateProduct(id: number, payload: UpdateProductRequest) {
      const { data } = await axios.patch<Product>(`/admin/products/${id}`, payload);
      return data;
    },

    async adminDeleteProduct(id: number) {
      const { data } = await axios.delete<Product>(`/admin/products/${id}`);
      return data;
    },

    async adminGetInventory(productId: number) {
      const { data } = await axios.get<Inventory | null>(`/admin/products/${productId}/inventory`);
      return data;
    },

    async adminUpdateInventory(productId: number, payload: UpdateInventoryRequest) {
      const { data } = await axios.patch<Inventory>(`/admin/products/${productId}/inventory`, payload);
      return data;
    },

    async adminUploadProductImage(productId: number, file: File) {
      const form = new FormData();
      form.append('file', file);
      const { data } = await axios.post<ProductImage>(`/admin/products/${productId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },

    // Admin / Categories
    async adminCategoriesList() {
      const { data } = await axios.get<Category[]>('/admin/categories');
      return data;
    },

    async adminCategoryById(id: number) {
      const { data } = await axios.get<Category>(`/admin/categories/${id}`);
      return data;
    },

    async adminCreateCategory(payload: CreateCategoryRequest) {
      const { data } = await axios.post<Category>('/admin/categories', payload);
      return data;
    },

    async adminUpdateCategory(id: number, payload: UpdateCategoryRequest) {
      const { data } = await axios.patch<Category>(`/admin/categories/${id}`, payload);
      return data;
    },

    async adminDeleteCategory(id: number) {
      const { data } = await axios.delete<Category>(`/admin/categories/${id}`);
      return data;
    },

    // Admin / Units
    async adminUnitsList() {
      const { data } = await axios.get<Unit[]>('/admin/units');
      return data;
    },

    async adminUnitById(id: number) {
      const { data } = await axios.get<Unit>(`/admin/units/${id}`);
      return data;
    },

    async adminCreateUnit(payload: CreateUnitRequest) {
      const { data } = await axios.post<Unit>('/admin/units', payload);
      return data;
    },

    async adminUpdateUnit(id: number, payload: UpdateUnitRequest) {
      const { data } = await axios.patch<Unit>(`/admin/units/${id}`, payload);
      return data;
    },

    async adminDeleteUnit(id: number) {
      const { data } = await axios.delete<Unit>(`/admin/units/${id}`);
      return data;
    },
  };
}

