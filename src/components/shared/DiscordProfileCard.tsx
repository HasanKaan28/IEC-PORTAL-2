"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Shield,
  FolderGit2,
  Lock,
  X,
  ExternalLink,
} from "lucide-react";
import { UserRole, ROLE_LABELS } from "@/lib/rbac/permissions";

export interface ProfileCardData {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  department?: string | null;
  classYear?: string | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  phone?: string | null;
  hidePhone?: boolean;
  hideEmail?: boolean;
  roles?: UserRole[];
  projects?: Array<{
    name: string;
    role?: string;
    accentColor?: string;
  }>;
}

interface DiscordProfileCardProps {
  user: ProfileCardData;
  isOpen: boolean;
  onClose: () => void;
}

export default function DiscordProfileCard({
  user,
  isOpen,
  onClose,
}: DiscordProfileCardProps) {
  if (!isOpen) return null;

  const roles = user.roles && user.roles.length > 0 ? user.roles : ["member"];
  const sanitizedPhone = user.phone ? user.phone.replace(/[^0-9]/g, "") : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-[#111827] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner (Discord Style) */}
        <div className="h-24 w-full bg-gradient-to-r from-brand-700 via-brand-600 to-accent-500 relative">
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-slate-200 transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar with Status Ring */}
        <div className="relative px-5 pb-5 pt-0">
          <div className="relative -mt-12 mb-3 inline-block">
            <div className="w-20 h-20 rounded-full border-4 border-[#111827] bg-slate-800 overflow-hidden relative shadow-lg">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-gradient-to-tr from-brand-600 to-accent-500 text-white">
                  {user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              )}
            </div>
            {/* Online Activity Status Indicator */}
            <span
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#111827]"
              title="Aktif"
            />
          </div>

          {/* User Name & Department */}
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <span>{user.fullName}</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {user.department || "Mühendislik Öğrencisi"} • {user.classYear || "FENS"}
            </p>
          </div>

          {/* Roles Badges */}
          <div className="mt-3.5 pt-3 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 font-semibold">
              Roller
            </span>
            <div className="flex flex-wrap gap-1.5">
              {roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-500/15 text-brand-300 border border-brand-500/30"
                >
                  <Shield className="w-3 h-3 text-accent-400" />
                  <span>{ROLE_LABELS[role as UserRole]?.tr || role}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Bio / About */}
          {user.bio && (
            <div className="mt-3.5 pt-3 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
                Hakkında
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}

          {/* Projects List */}
          {user.projects && user.projects.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 font-semibold">
                Aktif Projeler
              </span>
              <div className="space-y-1.5">
                {user.projects.map((proj, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FolderGit2
                        className="w-3.5 h-3.5"
                        style={{ color: proj.accentColor || "#b8237f" }}
                      />
                      <span className="font-medium text-slate-200">{proj.name}</span>
                    </div>
                    {proj.role && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {proj.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact & Social Action Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              {/* WhatsApp direct button (respects privacy) */}
              {!user.hidePhone && sanitizedPhone ? (
                <a
                  href={`https://wa.me/${sanitizedPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              ) : (
                <div className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-[11px]">
                  <Lock className="w-3 h-3" />
                  <span>Telefon Gizli</span>
                </div>
              )}

              {/* Direct email button (respects privacy) */}
              {!user.hideEmail && user.email ? (
                <a
                  href={`mailto:${user.email}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>E-posta</span>
                </a>
              ) : (
                <div className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-[11px]">
                  <Lock className="w-3 h-3" />
                  <span>E-posta Gizli</span>
                </div>
              )}
            </div>

            {/* Social links */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {user.githubUrl && (
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="GitHub Profili"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {user.linkedinUrl && (
                <a
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-brand-400 hover:text-brand-300 transition-colors"
                  title="LinkedIn Profili"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
