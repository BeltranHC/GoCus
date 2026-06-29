import api from './axios';

export interface Company {
  id: string;
  name: string;
  taxId: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  isActive: boolean;
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

export const getCompanies = async (page = 1, limit = 50): Promise<PaginatedResponse<Company>> => {
  const { data } = await api.get('/companies', { params: { page, limit } });
  return data;
};

export const getCompanyById = async (id: string): Promise<Company> => {
  const { data } = await api.get(`/companies/${id}`);
  return data;
};

export const createCompany = async (company: Partial<Company>): Promise<Company> => {
  const { data } = await api.post('/companies', company);
  return data;
};

export const updateCompany = async (id: string, company: Partial<Company>): Promise<Company> => {
  const { data } = await api.put(`/companies/${id}`, company);
  return data;
};

export const deleteCompany = async (id: string): Promise<void> => {
  await api.delete(`/companies/${id}`);
};
