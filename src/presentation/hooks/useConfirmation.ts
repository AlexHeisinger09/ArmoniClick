import { useState, useCallback } from 'react';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'warning' | 'info' | 'success';
  isLoading: boolean;
  details: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  details?: string[];
}

const initialState: ConfirmationState = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  variant: 'info',
  isLoading: false,
  details: [],
  onConfirm: () => {},
  onCancel: () => {}
};

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>(initialState);
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState(prev => ({
        ...prev,
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Aceptar',
        cancelText: options.cancelText || 'Cancelar',
        variant: options.variant || 'info',
        details: options.details || [],
        isLoading: false,
        onConfirm: () => {
          setState(prev => ({ ...prev, isLoading: true }));
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        }
      }));
      setResolveCallback(() => resolve);
    });
  }, []);

  const close = useCallback(() => {
    setState(initialState);
    setResolveCallback(null);
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  return {
    ...state,
    confirm,
    close,
    setLoading
  };
}
