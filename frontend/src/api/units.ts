import api from './axios';

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
}

export const getUnits = async (): Promise<Unit[]> => {
  const { data } = await api.get('/units');
  return data;
};

export const createUnit = async (unit: Partial<Unit>): Promise<Unit> => {
  const { data } = await api.post('/units', unit);
  return data;
};

export const updateUnit = async (id: string, unit: Partial<Unit>): Promise<Unit> => {
  const { data } = await api.patch(`/units/${id}`, unit);
  return data;
};

export const deleteUnit = async (id: string): Promise<void> => {
  await api.delete(`/units/${id}`);
};
