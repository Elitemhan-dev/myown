import { useState } from 'react';

export interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
  visible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<Toast>({
    type: 'info',
    message: '',
    visible: false,
  });

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message, visible: true });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      hideToast();
    }, 3000);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return { toast, showToast, hideToast };
}