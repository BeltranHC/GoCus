import api from './axios';

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
  branchId: string;
  branch?: { id: string; name: string; company?: { id: string; name: string } };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getWarehouses = async (
  page = 1,
  limit = 50,
  branchId?: string
): Promise<PaginatedResponse<Warehouse>> => {
  const { data } = await api.get('/warehouses', { params: { page, limit, branchId } });
  return data;
};

export const getWarehouseById = async (id: string): Promise<Warehouse> => {
  const { data } = await api.get(`/warehouses/${id}`);
  return data;
};

export const createWarehouse = async (warehouse: Partial<Warehouse>): Promise<Warehouse> => {
  const { data } = await api.post('/warehouses', warehouse);
  return data;
};

export const updateWarehouse = async (id: string, warehouse: Partial<Warehouse>): Promise<Warehouse> => {
  const { data } = await api.put(`/warehouses/${id}`, warehouse);
  return data;
};

export const deleteWarehouse = async (id: string): Promise<void> => {
  await api.delete(`/warehouses/${id}`);
};
