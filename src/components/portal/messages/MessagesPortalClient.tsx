"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  MoreVertical,
  ShieldAlert,
  UserX,
  Check,
  CheckCheck,
  Smile,
  MessageSquare,
  Sparkles,
  User,
  ArrowLeft,
  X,
  AlertCircle,
} from "lucide-react";
import {
  ConversationContact,
  DirectMessageItem,
} from "@/lib/messages/message-types";
import {
  sendMessageAction,
  markMessagesAsReadAction,
  reportOrBlockUserAction,
} from "@/lib/messages/message-actions";
import { soundEffects } from "@/lib/audio/sound-effects";
import DiscordProfileCard, { ProfileCardData } from "@/components/shared/DiscordProfileCard";
import { createClient } from "@/lib/supabase/client";

interface MessagesPortalClientProps {
  initialContacts: ConversationContact[];
  initialMessages: Record<string, DirectMessageItem[]>;
  currentUserId?: string;
}

export default function MessagesPortalClient({
  initialContacts,
  initialMessages,
  currentUserId = "usr-current",
}: MessagesPortalClientProps) {
  const [contacts, setContacts] = useState<ConversationContact[]>(initialContacts);
  const [activeContactId, setActiveContactId] = useState<string>(
    initialContacts.length > 0 ? initialContacts[0].id : ""
  );
  const [messagesMap, setMessagesMap] =
    useState<Record<string, DirectMessageItem[]>>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfileCard, setSelectedProfileCard] = useState<ProfileCardData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeContact = contacts.find((c) => c.id === activeContactId);
  const currentMessages = activeContactId ? messagesMap[activeContactId] || [] : [];

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, activeContactId]);

  // Mark as read when switching active contact
  useEffect(() => {
    if (activeContactId) {
      markMessagesAsReadAction(activeContactId);
      setContacts((prev) =>
        prev.map((c) => (c.id === activeContactId ? { ...c, unreadCount: 0 } : c))
      );
    }
  }, [activeContactId]);

  // Supabase Realtime Listener
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-direct-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload: any) => {
          const newMsg = payload.new;
          if (!newMsg) return;

          const otherId =
            newMsg.sender_id === currentUserId ? newMsg.receiver_id : newMsg.sender_id;

          const formattedMsg: DirectMessageItem = {
            id: newMsg.id,
            senderId: newMsg.sender_id,
            receiverId: newMsg.receiver_id,
            content: newMsg.content,
            isRead: newMsg.is_read,
            createdAt: newMsg.created_at,
          };

          setMessagesMap((prev) => ({
            ...prev,
            [otherId]: [...(prev[otherId] || []), formattedMsg],
          }));

          if (newMsg.sender_id !== currentUserId) {
            soundEffects.playMessageSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeContactId || isSending) return;

    const text = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Optimistic UI update
    const optimisticMsg: DirectMessageItem = {
      id: `opt-${Date.now()}`,
      senderId: currentUserId,
      receiverId: activeContactId,
      content: text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), optimisticMsg],
    }));

    // Play message chime
    soundEffects.playMessageSound();

    const res = await sendMessageAction(activeContactId, text);
    setIsSending(false);

    if (res.success && res.message) {
      // Replace optimistic message with server message
      setMessagesMap((prev) => ({
        ...prev,
        [activeContactId]: prev[activeContactId].map((m) =>
          m.id === optimisticMsg.id ? res.message! : m
        ),
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReportOrBlock = async (actionType: "report" | "block") => {
    if (!activeContactId) return;
    const res = await reportOrBlockUserAction(
      activeContactId,
      reportReason || "Kullanıcı talebi",
      actionType
    );
    setReportFeedback(res.message);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setReportFeedback(null);
      setReportReason("");
      if (actionType === "block") {
        setContacts((prev) => prev.filter((c) => c.id !== activeContactId));
        setActiveContactId("");
      }
    }, 2000);
  };

  const openProfileCard = () => {
    if (!activeContact) return;
    setSelectedProfileCard({
      id: activeContact.id,
      fullName: activeContact.name,
      email: activeContact.email,
      department: activeContact.department,
      classYear: "FENS Öğrencisi",
      bio: `${activeContact.role} olarak kulüp teknik ve organizasyon faaliyetlerinde yer almaktadır.`,
      roles: ["member"],
      projects: [{ name: "IUS Mühendislik Projeleri", role: activeContact.role, accentColor: "#4f46e5" }],
    });
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-140px)] min-h-[580px]">
      {/* Left Column: Contacts & Conversations */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col shrink-0">
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>Birebir Mesajlar (DM)</span>
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              {contacts.length} Kişi
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Üye veya unvan ara..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Kullanıcı bulunamadı.
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = contact.id === activeContactId;

              return (
                <button
                  key={contact.id}
                  onClick={() => setActiveContactId(contact.id)}
                  className={`w-full p-3.5 flex items-start gap-3 transition-colors text-left ${
                    isSelected
                      ? "bg-brand-50/50 border-r-2 border-brand-600"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {/* Avatar + Online Indicator */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-700">
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        contact.name.charAt(0)
                      )}
                    </div>
                    {contact.isOnline && (
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0 shadow-2xs" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`font-semibold text-xs truncate ${
                          isSelected ? "text-brand-950 font-bold" : "text-slate-900"
                        }`}
                      >
                        {contact.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {contact.lastMessageTime}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 truncate">
                      {contact.role}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {contact.lastMessage || "Sohbet başlatın..."}
                      </p>
                      {contact.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-brand-600 text-white font-mono text-[9px] flex items-center justify-center font-bold shrink-0">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Chat Stream */}
      {activeContact ? (
        <div className="flex-1 flex flex-col bg-slate-50/30">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-700">
                  {activeContact.avatar ? (
                    <img
                      src={activeContact.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    activeContact.name.charAt(0)
                  )}
                </div>
                {activeContact.isOnline && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                )}
              </div>

              <div className="truncate">
                <div className="font-bold text-sm text-slate-900 truncate">
                  {activeContact.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                  <span>{activeContact.role}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium">Çevrimiçi</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={openProfileCard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Profili Gör</span>
              </button>

              <button
                onClick={() => setIsReportModalOpen(true)}
                title="Şikayet Et veya Engelle"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Bubble Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="text-center my-2">
              <span className="px-3 py-1 rounded-full bg-slate-200/60 text-slate-600 text-[10px] font-mono">
                Uçtan Uca Şifreli Kulüp İçi Güvenli Sohbet
              </span>
            </div>

            {currentMessages.map((msg) => {
              const isMine = msg.senderId === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isMine && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center font-bold text-[9px] text-slate-700 shrink-0 mb-1">
                      {activeContact.avatar ? (
                        <img
                          src={activeContact.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        activeContact.name.charAt(0)
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] sm:max-w-md rounded-2xl px-4 py-2.5 shadow-2xs space-y-1 ${
                      isMine
                        ? "bg-brand-600 text-white rounded-br-xs"
                        : "bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs"
                    }`}
                  >
                    <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] font-mono ${
                        isMine ? "text-brand-200" : "text-slate-400"
                      }`}
                    >
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMine && (
                        <span>
                          {msg.isRead ? (
                            <CheckCheck className="w-3 h-3 text-brand-300" />
                          ) : (
                            <Check className="w-3 h-3 text-brand-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reaction Emojis & Input Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {["👍 Harika!", "🚀 Test Edelim", "💻 Repoya Baktım", "🔥 Süper Olmuş", "🙌 Teşekkürler"].map(
                (quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setInputText(quick)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap transition-colors"
                  >
                    {quick}
                  </button>
                )
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mesajınızı yazın... (Enter ile gönder)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all bg-slate-50 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors disabled:opacity-40 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <MessageSquare className="w-12 h-12 opacity-30 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Sohbet Seçilmedi</h3>
          <p className="text-xs text-slate-500 mt-1">
            Sol listeden bir üye seçerek anlık birebir mesajlaşmaya başlayın.
          </p>
        </div>
      )}

      {/* Discord Profile Card Drawer / Modal */}
      {selectedProfileCard && (
        <DiscordProfileCard
          user={selectedProfileCard}
          isOpen={Boolean(selectedProfileCard)}
          onClose={() => setSelectedProfileCard(null)}
        />
      )}

      {/* Report / Block Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>Kullanıcı Güvenlik Menüsü</span>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportFeedback ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center font-medium">
                {reportFeedback}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  <strong>{activeContact?.name}</strong> adlı üyeyi şikayet etmek veya engellemek üzeresiniz.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gerekçe / Açıklama
                  </label>
                  <textarea
                    rows={3}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Örn: Uygunsuz mesaj, spam veya rahatsız edici içerik..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleReportOrBlock("block")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Engelle</span>
                  </button>
                  <button
                    onClick={() => handleReportOrBlock("report")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Şikayet Et</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
