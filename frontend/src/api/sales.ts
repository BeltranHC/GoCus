import api from './axios';
import { API_URL, STORAGE_KEYS } from '../utils/constants';
import { storage } from '../utils/storage';

export type SaleDocumentType =
  | 'FACTURA'
  | 'BOLETA'
  | 'NOTA_DE_VENTA'
  | 'NOTA_DE_CREDITO'
  | 'NOTA_DE_DEBITO';

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT' | 'MIXED';

export interface CreateSaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalePayload {
  customerId?: string;
  documentType: SaleDocumentType;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: CreateSaleItem[];
}

export interface Sale {
  id: string;
  documentType: SaleDocumentType;
  series: string | null;
  correlative: number | null;
  status: string;
  subtotal: number | string;
  igvAmount: number | string;
  total: number | string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export const createSale = async (payload: CreateSalePayload): Promise<Sale> => {
  const { data } = await api.post<Sale>('/sales', payload);
  return data;
};

export const fetchSalePdfBlob = async (saleId: string): Promise<Blob> => {
  const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  const response = await fetch(`${API_URL}/sales/${saleId}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error('No se pudo generar el comprobante PDF');
  }

  return response.blob();
};
