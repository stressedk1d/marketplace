"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  action?: ToastAction;
  durationMs?: number;
}

interface ToastState {
  message: string;
  type: ToastType;
  id: number;
  action?: ToastAction;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", options?: ToastOptions) => {
      if (!message) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      const id = Date.now();
      const duration = options?.durationMs ?? (options?.action ? 5500 : 3500);
      setToast({ message, type, id, action: options?.action });
      timerRef.current = setTimeout(() => setToast(null), duration);
    },
    []
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="toast-host" role="status" aria-live="polite">
          <div key={toast.id} className={`toast-banner toast-${toast.type}`}>
            <span>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  setToast(null);
                  if (timerRef.current) clearTimeout(timerRef.current);
                }}
                className="ml-3 font-semibold underline underline-offset-2 hover:no-underline"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
