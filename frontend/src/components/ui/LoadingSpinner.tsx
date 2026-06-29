// ============================================
// GOCus — Component: Loading Spinner
// ============================================

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

export function LoadingSpinner({ size = 40, message }: LoadingSpinnerProps) {
  return (
    <div className="loading-container">
      <Loader2 size={size} className="loading-spinner" />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}
