import type { AxiosInstance } from 'axios';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  Brand,
  BrandCategory,
  Category,
  CategoryNode,
  CreateBrandRequest,
  CreateCategoryRequest,
  CreateProductRequest,
  CreateUnitRequest,
  EstimatePreviewRequest,
  EstimatePreviewResponse,
  Inventory,
  InventoryStatusOption,
  Product,
  ProductImage,
  ProductListQuery,
  Paginated,
  Unit,
  UpdateBrandRequest,
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
      const { data } = await axios.get<CategoryNode[]>('/categories');
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

    async brandsList() {
      const { data } = await axios.get<Brand[]>('/brands');
      return data;
    },

    async brandBySlug(slug: string) {
      const { data } = await axios.get<Brand>(`/brands/${slug}`);
      return data;
    },

    async brandProducts(slug: string, query: ProductListQuery = {}) {
      const { data } = await axios.get<Paginated<Product>>(`/brands/${slug}/products`, { params: query });
      return data;
    },

    async brandCategories(slug: string) {
      const { data } = await axios.get<BrandCategory[]>(`/brands/${slug}/categories`);
      return data;
    },

    async estimatePreview(payload: EstimatePreviewRequest) {
      const { data } = await axios.post<EstimatePreviewResponse>('/estimate/preview', payload);
      return data;
    },

    async unitsList() {
      const { data } = await axios.get<Unit[]>('/units');
      return data;
    },

    async inventoryStatuses() {
      const { data } = await axios.get<InventoryStatusOption[]>('/inventory-statuses');
      return data;
    },

    // Admin auth
    async adminLogin(payload: AdminLoginRequest) {
      const { data } = await axios.post<AdminLoginResponse>('/admin/auth/login', payload);
      return data;
    },

    // Admin / Products
    async adminProductsList() {
      const { data } = await axios.get<Product[]>('/admin/products');
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
      brandId?: number;
      isActive?: boolean;
      inventoryQuantity?: number;
      inventoryStatus?: Inventory['status'];
      images?: File[];
    }) {
      const form = new FormData();
      form.set('name', payload.name);
      form.set('slug', payload.slug);
      if (payload.description !== null && payload.description !== undefined) form.set('description', payload.description);
      form.set('price', String(payload.price));
      form.set('categoryId', String(payload.categoryId));
      form.set('unitId', String(payload.unitId));
      if (payload.brandId !== null && payload.brandId !== undefined) form.set('brandId', String(payload.brandId));
      if (payload.isActive !== null && payload.isActive !== undefined) form.set('isActive', String(payload.isActive));
      if (payload.inventoryQuantity !== null && payload.inventoryQuantity !== undefined) form.set('inventoryQuantity', String(payload.inventoryQuantity));
      if (payload.inventoryStatus !== null && payload.inventoryStatus !== undefined) form.set('inventoryStatus', payload.inventoryStatus);
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

    async adminSetProductHit(id: number, isHit: boolean) {
      const { data } = await axios.patch<Product>(`/admin/products/${id}/hit`, { isHit });
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

    async adminDeleteProductImage(productId: number, imageId: number) {
      const { data } = await axios.delete<{ deleted: number }>(`/admin/products/${productId}/images/${imageId}`);
      return data;
    },

    // Admin / Brands
    async adminBrandsList() {
      const { data } = await axios.get<Brand[]>('/admin/brands');
      return data;
    },

    async adminCreateBrand(payload: CreateBrandRequest) {
      const { data } = await axios.post<Brand>('/admin/brands', payload);
      return data;
    },

    async adminUpdateBrand(id: number, payload: UpdateBrandRequest) {
      const { data } = await axios.patch<Brand>(`/admin/brands/${id}`, payload);
      return data;
    },

    async adminDeleteBrand(id: number) {
      const { data } = await axios.delete<Brand>(`/admin/brands/${id}`);
      return data;
    },

    async adminUploadBrandLogo(id: number, file: File) {
      const form = new FormData();
      form.append('file', file);
      const { data } = await axios.post<Brand>(`/admin/brands/${id}/logo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },

    async adminDeleteBrandLogo(id: number) {
      const { data } = await axios.delete<Brand>(`/admin/brands/${id}/logo`);
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

export type VodoleyApi = ReturnType<typeof createVodoleyApi>;


