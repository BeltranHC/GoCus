import api from './axios';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  roleId: string;
  companyId: string;
  branchId?: string | null;
  role?: { id: string; name: string };
  company?: { id: string; name: string };
  branch?: { id: string; name: string };
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

export const getUsers = async (
  page = 1,
  limit = 50,
  filters?: { companyId?: string; branchId?: string }
): Promise<PaginatedResponse<User>> => {
  const { data } = await api.get('/users', { params: { page, limit, ...filters } });
  return data;
};

export const getUserById = async (id: string): Promise<User> => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const createUser = async (user: Partial<User>): Promise<User> => {
  const { data } = await api.post('/users', user);
  return data;
};

export const updateUser = async (id: string, user: Partial<User>): Promise<User> => {
  const { data } = await api.put(`/users/${id}`, user);
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};
