import api from './axios';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  permissions?: Permission[];
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

export const getRoles = async (page = 1, limit = 50): Promise<PaginatedResponse<Role>> => {
  const { data } = await api.get('/roles', { params: { page, limit } });
  return data;
};

export const createRole = async (role: Partial<Role> & { permissionIds?: string[] }): Promise<Role> => {
  const { data } = await api.post('/roles', role);
  return data;
};

export const updateRole = async (id: string, role: Partial<Role> & { permissionIds?: string[] }): Promise<Role> => {
  const { data } = await api.put(`/roles/${id}`, role);
  return data;
};

export const getPermissions = async (): Promise<Permission[]> => {
  const { data } = await api.get('/permissions');
  return data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await api.delete(`/roles/${id}`);
};
