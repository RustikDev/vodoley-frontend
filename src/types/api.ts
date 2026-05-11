export type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  path: string;
  requestId: string;
  timestamp: string;
};

export type InventoryStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_ORDER';

export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
  children: CategoryNode[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Unit = {
  id: number;
  name: string;
  shortName: string;
  isActive: boolean;
  sortOrder: number;
};

export type ProductImage = {
  id: number;
  productId: number;
  url: string;
  alt: string | null;
  isMain: boolean;
  sortOrder: number;
};

export type Inventory = {
  productId?: number;
  quantity: number;
  status: InventoryStatus;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  isActive: boolean;
  categoryId: number;
  unitId: number;
  images: ProductImage[];
  inventory: Inventory | null;
  unit?: Unit;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductSort = 'price_asc' | 'price_desc' | 'newest';

export type ProductListQuery = {
  q?: string;
  categoryId?: number;
  includeChildren?: boolean;
  unitId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export type EstimatePreviewRequest = {
  items: Array<{ productId: number; quantity: number }>;
};

export type EstimatePreviewResponse = {
  items: Array<{
    productId: number;
    name: string;
    unit: string;
    price: number;
    quantity: number;
    lineTotal: number;
  }>;
  total: number;
};

export type AdminLoginRequest = { email: string; password: string };
export type AdminLoginResponse = { access_token: string };

export type CreateCategoryRequest = {
  name: string;
  slug: string;
  parentId?: number;
  isActive?: boolean;
  sortOrder?: number;
};
export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export type CreateUnitRequest = {
  name: string;
  shortName: string;
  isActive?: boolean;
  sortOrder?: number;
};
export type UpdateUnitRequest = Partial<CreateUnitRequest>;

export type CreateProductRequest = {
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId: number;
  unitId: number;
  isActive?: boolean;
  inventory?: Partial<Pick<Inventory, 'quantity' | 'status'>>;
};
export type UpdateProductRequest = Partial<CreateProductRequest>;
export type UpdateInventoryRequest = Partial<Pick<Inventory, 'quantity' | 'status'>>;
