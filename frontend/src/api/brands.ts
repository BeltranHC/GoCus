import api from './axios';

export interface Brand {
  id: string;
  name: string;
  isActive: boolean;
}

export const getBrands = async (): Promise<Brand[]> => {
  const { data } = await api.get('/brands');
  return data;
};

export const createBrand = async (brand: Partial<Brand>): Promise<Brand> => {
  const { data } = await api.post('/brands', brand);
  return data;
};

export const updateBrand = async (id: string, brand: Partial<Brand>): Promise<Brand> => {
  const { data } = await api.patch(`/brands/${id}`, brand);
  return data;
};

export const deleteBrand = async (id: string): Promise<void> => {
  await api.delete(`/brands/${id}`);
};
