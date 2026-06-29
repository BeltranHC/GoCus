// ============================================
// GOCus — Utils: Constants
// ============================================

export const APP_NAME = 'GOCus';
export const APP_DESCRIPTION = 'ERP/POS Multisucursal';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'gocus_access_token',
  REFRESH_TOKEN: 'gocus_refresh_token',
  THEME: 'gocus_theme',
} as const;
