"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export interface ToastState {
  kind: "success" | "error";
  message: string;
}

/** Toast state with auto-dismiss (errors stay a little longer). */
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const show = useCallback((next: ToastState) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(next);
    timerRef.current = setTimeout(() => setToast(null), next.kind === "error" ? 7000 : 4000);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { toast, show, dismiss };
}

export default function PortalToast({
  toast,
  onDismiss,
  dismissLabel,
}: {
  toast: ToastState | null;
  onDismiss: () => void;
  dismissLabel: string;
}) {
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed bottom-6 right-6 z-[60] max-w-sm">
      {toast && (
        <div
          className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-3 ${
            toast.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {toast.kind === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={dismissLabel}
            className="rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
