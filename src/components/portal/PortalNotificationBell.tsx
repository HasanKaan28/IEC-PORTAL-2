"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  Bell,
  Calendar,
  CheckCheck,
  CheckSquare,
  Info,
  MessageSquare,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatRelative } from "@/lib/i18n/format";
import { messagesProfileText } from "@/lib/i18n/portal/messages-profile";
import type { InAppNotificationItem, NotificationType } from "@/lib/messages/message-types";
import { markNotificationsAsReadAction } from "@/lib/messages/message-actions";
import { isSoundEnabled, playNotificationPreviewSound, setSoundEnabled } from "@/lib/messages/sound";

interface PortalNotificationBellProps {
  initialNotifications?: InAppNotificationItem[];
}

const TYPE_ICON: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  cert: { icon: Award, tone: "bg-accent-100 text-accent-700" },
  task: { icon: CheckSquare, tone: "bg-brand-50 text-brand-600" },
  event: { icon: Calendar, tone: "bg-brand-50 text-brand-600" },
  team: { icon: Trophy, tone: "bg-accent-100 text-accent-700" },
  message: { icon: MessageSquare, tone: "bg-emerald-50 text-emerald-600" },
  general: { icon: Info, tone: "bg-slate-100 text-slate-600" },
};

export default function PortalNotificationBell({ initialNotifications = [] }: PortalNotificationBellProps) {
  const { locale } = useLocale();
  const t = messagesProfileText[locale].notifications;
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Server data changes (navigation, revalidation) replace the local copy.
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    let active = true;
    void isSoundEnabled().then((enabled) => {
      if (active) setSoundOn(enabled);
    });
    return () => {
      active = false;
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const markRead = async (ids?: string[]) => {
    const previous = notifications;
    setError(null);
    setNotifications((current) =>
      current.map((item) => (!ids || ids.includes(item.id) ? { ...item, isRead: true } : item))
    );
    const result = await markNotificationsAsReadAction(ids);
    if (!result.success) {
      setNotifications(previous);
      setError(result.error || t.updateFailed);
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playNotificationPreviewSound();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={unreadCount > 0 ? t.bellLabelUnread(unreadCount) : t.bellLabel}
        className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-bold leading-none text-white ring-2 ring-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-label={t.title}
          className="fixed inset-x-4 top-16 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-bold text-slate-900">{t.title}</h2>
              {unreadCount > 0 && (
                <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                  {t.newCount(unreadCount)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={soundOn}
                aria-label={soundOn ? t.soundTurnOff : t.soundTurnOn}
                title={soundOn ? t.soundTurnOff : t.soundTurnOn}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {soundOn ? (
                  <Volume2 className="h-4 w-4 text-brand-600" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void markRead()}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <CheckCheck className="h-4 w-4" aria-hidden="true" />
                  <span>{t.markAllRead}</span>
                </button>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-700">
              {error}
            </p>
          )}

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Bell className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm text-slate-500">{t.empty}</p>
            </div>
          ) : (
            <ul className="max-h-[min(24rem,70dvh)] divide-y divide-slate-100 overflow-y-auto">
              {notifications.map((item) => {
                const { icon: Icon, tone } = TYPE_ICON[item.type] ?? TYPE_ICON.general;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.link}
                      onClick={() => {
                        setIsOpen(false);
                        if (!item.isRead) void markRead([item.id]);
                      }}
                      className={`flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${
                        item.isRead ? "" : "bg-brand-50/40"
                      }`}
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-sm ${item.isRead ? "font-medium text-slate-700" : "font-semibold text-slate-900"}`}
                          >
                            {item.title}
                          </span>
                          {!item.isRead && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600">
                              <span className="sr-only">{t.unread}</span>
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-slate-600">{item.message}</span>
                        <time dateTime={item.createdAt} className="mt-1 block text-xs text-slate-400">
                          {formatRelative(item.createdAt, locale)}
                        </time>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
