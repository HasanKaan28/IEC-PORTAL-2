"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Flame,
  Minus,
  X,
  type LucideIcon,
} from "lucide-react";
import type { TaskPriority, TaskStatus } from "@/lib/tasks/task-types";

/** Shared, dependency-free UI pieces for the portal task board and projects pages. */

export const focusRing =
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1";

export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export const primaryButtonClass = `inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

export const secondaryButtonClass = `inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

export const iconButtonClass = `inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 ${focusRing}`;

/* ------------------------------------------------------------------------------------------ */
/* Toast                                                                                      */
/* ------------------------------------------------------------------------------------------ */

export type ToastTone = "success" | "error";
export interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

export function useToast(durationMs = 4000) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ id: Date.now(), message, tone });
      timer.current = setTimeout(() => setToast(null), tone === "error" ? durationMs + 2000 : durationMs);
    },
    [durationMs]
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return { toast, showToast, dismiss };
}

export function ToastRegion({
  toast,
  onDismiss,
  dismissLabel,
}: {
  toast: ToastState | null;
  onDismiss: () => void;
  dismissLabel: string;
}) {
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed bottom-6 right-6 z-60 max-w-sm">
      {toast && (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-3 ${
            toast.tone === "error"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-white text-slate-800"
          }`}
        >
          {toast.tone === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button type="button" onClick={onDismiss} aria-label={dismissLabel} className={`-m-1 ${iconButtonClass}`}>
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Dialog frame (modal or right-side drawer) with Escape, focus trap and scroll lock          */
/* ------------------------------------------------------------------------------------------ */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function DialogFrame({
  onClose,
  labelledBy,
  variant = "modal",
  children,
}: {
  onClose: () => void;
  labelledBy: string;
  variant?: "modal" | "drawer";
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const firstField = panel?.querySelector<HTMLElement>("[data-autofocus]:not(:disabled)") ?? panel;
    firstField?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  const isDrawer = variant === "drawer";

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-slate-900/40 backdrop-blur-xs animate-in fade-in ${
        isDrawer ? "justify-end" : "items-center justify-center overflow-y-auto p-4"
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={
          isDrawer
            ? "flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl outline-hidden animate-in slide-in-from-right duration-200"
            : "my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-hidden animate-in fade-in zoom-in-95 duration-150"
        }
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Small display pieces                                                                       */
/* ------------------------------------------------------------------------------------------ */

export function UserAvatar({
  name,
  src,
  size = "sm",
}: {
  name: string | null | undefined;
  src?: string | null;
  size?: "sm" | "md";
}) {
  const dimension = size === "md" ? "h-8 w-8 text-xs" : "h-6 w-6 text-xs";
  const initial = (name || "?").trim().charAt(0).toLocaleUpperCase() || "?";
  const safeSrc = safeExternalUrl(src);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-200 bg-brand-50 font-semibold text-brand-700 ${dimension}`}
    >
      {safeSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={safeSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        initial
      )}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center ${
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-16"
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {text && <p className="mx-auto max-w-sm text-sm text-slate-500">{text}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

/** Returns the URL only when it is an absolute http(s) link, so stored data cannot inject javascript: links. */
export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------------------------------ */
/* Task status and priority styling                                                           */
/* ------------------------------------------------------------------------------------------ */

export const TASK_STATUS_STYLES: Record<TaskStatus, { dot: string; badge: string }> = {
  todo: { dot: "bg-slate-400", badge: "border-slate-200 bg-slate-50 text-slate-700" },
  in_progress: { dot: "bg-accent-500", badge: "border-accent-200 bg-accent-50 text-accent-800" },
  in_review: { dot: "bg-brand-500", badge: "border-brand-200 bg-brand-50 text-brand-700" },
  done: { dot: "bg-emerald-500", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

const PRIORITY_STYLES: Record<TaskPriority, { className: string; icon: LucideIcon }> = {
  urgent: { className: "border-rose-200 bg-rose-50 text-rose-700", icon: Flame },
  high: { className: "border-orange-200 bg-orange-50 text-orange-700", icon: ArrowUp },
  medium: { className: "border-accent-200 bg-accent-50 text-accent-800", icon: Minus },
  low: { className: "border-slate-200 bg-slate-50 text-slate-600", icon: ArrowDown },
};

export function PriorityBadge({ priority, label }: { priority: TaskPriority; label: string }) {
  const style = PRIORITY_STYLES[priority];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${style.className}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}

export function StatusBadge({ status, label }: { status: TaskStatus; label: string }) {
  const style = TASK_STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
