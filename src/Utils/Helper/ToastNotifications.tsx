import { useCallback } from 'react';
import { toast, ToastOptions } from 'react-toastify';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const useToast = () => {
  const showToast = useCallback((type: ToastType, message: string, options?: ToastOptions) => {
    if (!message?.trim()) return;

    const config: ToastOptions = {
      position: "bottom-center",
      autoClose: 3000,
      hideProgressBar: false,
      style : {backgroundColor : "black", color : "white"},
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options, // allow override
    };

    switch (type) {
      case 'success':
        toast.success(message, config);
        break;
      case 'error':
        toast.error(message, config);
        break;
      case 'info':
        toast.info(message, config);
        break;
      case 'warning':
        toast.warning(message, config);
        break;
      default:
        toast(message, config);
    }
  }, []);

  return { showToast };
};
