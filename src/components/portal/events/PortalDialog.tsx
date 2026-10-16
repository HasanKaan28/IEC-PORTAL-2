"use client";

import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

interface PortalDialogProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  closeLabel: string;
  onClose: () => void;
  size?: "md" | "lg" | "4xl";
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

const SIZE_CLASS: Record<NonNullable<PortalDialogProps["size"]>, string> = {
  md: "max-w-md",
  lg: "max-w-lg",
  "4xl": "max-w-4xl",
};

/**
 * Modal dialog shell used by the events, certificates and hackathons screens. Mount it only while open
 * (so form state resets every time); Escape closes it and focus returns to the opener afterwards.
 */
export default function PortalDialog({
  title,
  description,
  icon,
  closeLabel,
  onClose,
  size = "lg",
  headerActions,
  children,
}: PortalDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    // Inputs with autoFocus already hold focus; otherwise move focus into the dialog.
    if (panel && !panel.contains(document.activeElement)) panel.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`my-8 w-full ${SIZE_CLASS[size]} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 focus:outline-none`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-600"
                aria-hidden="true"
              >
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h2 id={titleId} className="font-display text-base font-bold text-slate-900">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-0.5 line-clamp-2 text-sm text-slate-500">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
