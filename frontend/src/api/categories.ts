import api from './axios';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  parentId?: string | null;
  parent?: { id: string; name: string };
  children?: Category[];
}

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/categories');
  return data;
};

export const getCategoryTree = async (): Promise<Category[]> => {
  const { data } = await api.get('/categories/tree');
  return data;
};

export const createCategory = async (category: Partial<Category>): Promise<Category> => {
  const { data } = await api.post('/categories', category);
  return data;
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
  const { data } = await api.patch(`/categories/${id}`, category);
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
