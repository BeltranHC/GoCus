import api from './axios';

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  companyId: string;
  company?: { id: string; name: string };
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

export const getBranches = async (
  page = 1,
  limit = 50,
  companyId?: string
): Promise<PaginatedResponse<Branch>> => {
  const { data } = await api.get('/branches', { params: { page, limit, companyId } });
  return data;
};

export const getBranchById = async (id: string): Promise<Branch> => {
  const { data } = await api.get(`/branches/${id}`);
  return data;
};

export const createBranch = async (branch: Partial<Branch>): Promise<Branch> => {
  const { data } = await api.post('/branches', branch);
  return data;
};

export const updateBranch = async (id: string, branch: Partial<Branch>): Promise<Branch> => {
  const { data } = await api.put(`/branches/${id}`, branch);
  return data;
};

export const deleteBranch = async (id: string): Promise<void> => {
  await api.delete(`/branches/${id}`);
};
