import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = "info", duration = 5000 }) => {
    const id = Date.now() + Math.random();
    const toast = { id, title, message, type, duration };
    setToasts((prev) => [...prev, toast]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const value = { addToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-3 w-full max-w-sm">
        {toasts.map((toast) => {
          const colorClasses =
            toast.type === "error"
              ? "border-red-500/40 bg-red-500/10 text-red-100"
              : toast.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
              : toast.type === "warning"
              ? "border-amber-500/40 bg-amber-500/10 text-amber-50"
              : "border-sky-500/40 bg-sky-500/10 text-sky-50";

          return (
            <div
              key={toast.id}
              className={`backdrop-blur-xl border rounded-2xl px-4 py-3 shadow-xl shadow-black/40 flex items-start gap-3 ${colorClasses}`}
            >
              <div className="mt-1">
                {toast.type === "error" && <span>🚨</span>}
                {toast.type === "success" && <span>✅</span>}
                {toast.type === "warning" && <span>⚠️</span>}
                {toast.type === "info" && <span>ℹ️</span>}
              </div>
              <div className="flex-1">
                {toast.title && <div className="text-xs font-black uppercase tracking-widest mb-0.5">{toast.title}</div>}
                {toast.message && <div className="text-sm">{toast.message}</div>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-1 text-xs uppercase tracking-widest font-bold opacity-60 hover:opacity-100"
              >
                Close
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx || { addToast: () => {} };
}

