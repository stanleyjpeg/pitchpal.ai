"use client";
import React from "react";

type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (opts: ToastOptions) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Required<ToastOptions>[]>([]);

  const showToast = React.useCallback((opts: ToastOptions) => {
    const id = opts.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast: Required<ToastOptions> = {
      id,
      title: opts.title ?? "",
      message: opts.message,
      type: opts.type ?? "info",
      durationMs: opts.durationMs ?? 4000,
    };
    setToasts((prev) => [...prev, toast]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), toast.durationMs);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Viewport */}
      <div aria-live="polite" aria-atomic className="fixed top-4 right-4 z-[200] flex flex-col gap-3 w-[min(92vw,380px)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={
              `rounded-xl border px-4 py-3 shadow-lg backdrop-blur bg-white/90 dark:bg-zinc-900/90 ` +
              (t.type === "success"
                ? "border-emerald-300/40 text-emerald-900 dark:text-emerald-200"
                : t.type === "error"
                ? "border-rose-300/40 text-rose-900 dark:text-rose-200"
                : "border-zinc-300/40 text-zinc-900 dark:text-zinc-200")
            }
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 text-lg">
                {t.type === "success" ? "✅" : t.type === "error" ? "⚠️" : "ℹ️"}
              </div>
              <div className="flex-1">
                {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
                <div>{t.message}</div>
              </div>
              <button
                aria-label="Dismiss notification"
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                onClick={() => remove(t.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


