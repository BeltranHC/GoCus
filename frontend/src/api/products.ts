import api from './axios';

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  igvType: 'GRAVADO' | 'EXONERADO' | 'INAFECTO';
  purchasePrice: number;
  salePrice: number;
  minStock?: number;
  maxStock?: number;
  image?: string;
  isActive: boolean;
  categoryId?: string;
  brandId?: string;
  unitId?: string;
  category?: { id: string, name: string };
  brand?: { id: string, name: string };
  unit?: { id: string, name: string, abbreviation: string };
}

export const getProducts = async (search?: string): Promise<Product[]> => {
  const params = search ? { search } : {};
  const { data } = await api.get('/products', { params });
  return data;
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const { data } = await api.post('/products', productData);
  return data;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  const { data } = await api.patch(`/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};
