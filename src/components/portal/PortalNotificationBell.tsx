"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Award,
  CheckSquare,
  Calendar,
  Trophy,
  MessageSquare,
  CheckCheck,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import { InAppNotificationItem } from "@/lib/messages/message-types";
import { markNotificationsAsReadAction } from "@/lib/messages/message-actions";
import { soundEffects } from "@/lib/audio/sound-effects";

interface PortalNotificationBellProps {
  initialNotifications?: InAppNotificationItem[];
}

export default function PortalNotificationBell({
  initialNotifications = [],
}: PortalNotificationBellProps) {
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSoundOn(soundEffects.isEnabled());
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markNotificationsAsReadAction();
    soundEffects.playNotificationSound();
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundEffects.setEnabled(next);
    if (next) soundEffects.playNotificationSound();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "cert":
        return <Award className="w-4 h-4 text-amber-500" />;
      case "task":
        return <CheckSquare className="w-4 h-4 text-brand-500" />;
      case "event":
        return <Calendar className="w-4 h-4 text-brand-500" />;
      case "team":
        return <Trophy className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
        aria-label="Bildirimler"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-rose-600 text-white font-mono text-[9px] flex items-center justify-center font-bold absolute -top-0.5 -right-0.5 shadow-xs animate-in zoom-in-50">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 font-display">
                Bildirimler
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold text-[10px]">
                  {unreadCount} Yeni
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                title={soundOn ? "Bildirim Sesini Kapat" : "Bildirim Sesini Aç"}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {soundOn ? (
                  <Volume2 className="w-3.5 h-3.5 text-brand-600" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:text-brand-800"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Tümünü Oku</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <Bell className="w-6 h-6 mx-auto opacity-30" />
                <p>Henüz bildiriminiz yok.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => setIsOpen(false)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors block text-left ${
                    !item.isRead ? "bg-brand-50/20" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-900 truncate">
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {new Date(item.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
            <span className="text-[10px] text-slate-400 font-mono">
              IUS Engineering Club • Anlık Bildirim Merkezi
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
