import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast({ message, type });
    timeoutRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const showConfirm = useCallback(
    (
      message,
      {
        onConfirm,
        onCancel,
        confirmLabel = "Confirm",
        cancelLabel = "Cancel",
        timeoutMs = 8000,
      } = {},
    ) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      const handleClose = () => {
        setToast(null);
      };
      const actions = {
        confirmLabel,
        cancelLabel,
        onConfirm: () => {
          handleClose();
          onConfirm?.();
        },
        onCancel: () => {
          handleClose();
          onCancel?.();
        },
      };
      setToast({ message, type: "confirm", actions });
      timeoutRef.current = setTimeout(() => setToast(null), timeoutMs);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          {toast.type === "confirm" ? (
            <div className="bg-slate-900 text-slate-100 border border-slate-700 px-5 py-4 rounded-xl shadow-xl min-w-[280px]">
              <div className="mb-3 text-sm text-slate-200">{toast.message}</div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={toast.actions.onCancel}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                >
                  {toast.actions.cancelLabel}
                </button>
                <button
                  onClick={toast.actions.onConfirm}
                  className="px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-400"
                >
                  {toast.actions.confirmLabel}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`px-6 py-3 rounded-lg text-white font-medium shadow-lg ${
                toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            >
              {toast.message}
            </div>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
