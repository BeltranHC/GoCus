// ============================================
// GOCus — Utils: Storage
// ============================================

export const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage is full or unavailable
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch {
      // Storage unavailable
    }
  },
};
