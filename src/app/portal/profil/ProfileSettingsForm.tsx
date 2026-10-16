"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Github, IdCard, Linkedin, LoaderCircle, Phone, Shield } from "lucide-react";
import { updateProfileAction } from "@/lib/auth/auth-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { localizeClassYear, messagesProfileText } from "@/lib/i18n/portal/messages-profile";
import { ROLE_LABELS, type UserRole } from "@/lib/rbac/permissions";
import type { OwnProfile } from "@/lib/messages/member-profiles";
import type { ProfileCardData } from "@/lib/messages/message-types";
import { safeHttpUrl } from "@/lib/messages/utils";
import DiscordProfileCard from "@/components/shared/DiscordProfileCard";
import MemberAvatar from "@/components/portal/messages/MemberAvatar";

const BIO_MAX = 500;
const LEGACY_CLASS_YEARS: Record<string, string> = { "Hazırlık": "Hazırlık (ELS)" };

interface ProfileSettingsFormProps {
  profile: OwnProfile;
  roles: UserRole[];
  projects: NonNullable<ProfileCardData["projects"]>;
  memberSince: string | null;
}

interface FormState {
  fullName: string;
  department: string;
  classYear: string;
  bio: string;
  linkedinUrl: string;
  githubUrl: string;
  phone: string;
  hidePhone: boolean;
  hideEmail: boolean;
}

type FieldName = "fullName" | "linkedinUrl" | "githubUrl" | "phone";
type FieldErrors = Partial<Record<FieldName, string>>;

const inputBase =
  "w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-2";
const inputOk = "border-slate-200 focus:border-brand-500 focus:ring-brand-500/20";
const inputError = "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20";

function isValidLink(value: string): boolean {
  const url = safeHttpUrl(value);
  if (!url) return false;
  try {
    return new URL(url).hostname.includes(".");
  } catch {
    return false;
  }
}

function isValidPhone(value: string): boolean {
  return /^\+?[0-9 ()-]{6,40}$/.test(value) && value.replace(/[^0-9]/g, "").length >= 6;
}

function describedBy(...ids: Array<string | false | null | undefined>): string | undefined {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

export default function ProfileSettingsForm({ profile, roles, projects, memberSince }: ProfileSettingsFormProps) {
  const { locale } = useLocale();
  const text = messagesProfileText[locale];
  const t = text.profile;
  const router = useRouter();

  const [form, setForm] = useState<FormState>(() => ({
    fullName: profile.fullName ?? "",
    department: profile.department ?? "",
    classYear: profile.classYear ? LEGACY_CLASS_YEARS[profile.classYear] ?? profile.classYear : "",
    bio: profile.bio ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    githubUrl: profile.githubUrl ?? "",
    phone: profile.phone ?? "",
    hidePhone: profile.hidePhone,
    hideEmail: profile.hideEmail,
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
    setFeedback(null);
  };

  const validate = (state: FormState): FieldErrors => {
    const result: FieldErrors = {};
    if (state.fullName.trim().length < 2) result.fullName = t.errorFullName;
    if (state.linkedinUrl.trim() && !isValidLink(state.linkedinUrl.trim())) result.linkedinUrl = t.errorUrl;
    if (state.githubUrl.trim() && !isValidLink(state.githubUrl.trim())) result.githubUrl = t.errorUrl;
    if (state.phone.trim() && !isValidPhone(state.phone.trim())) result.phone = t.errorPhone;
    return result;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    const firstInvalid = (Object.keys(fieldErrors) as FieldName[]).find((key) => fieldErrors[key]);
    if (firstInvalid) {
      setFeedback({ kind: "error", text: t.errorSummary });
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setSaving(true);
    setFeedback(null);
    const result = await updateProfileAction({
      fullName: form.fullName.trim(),
      bio: form.bio.trim(),
      department: form.department,
      classYear: form.classYear,
      linkedinUrl: form.linkedinUrl.trim(),
      githubUrl: form.githubUrl.trim(),
      phone: form.phone.trim(),
      hidePhone: form.hidePhone,
      hideEmail: form.hideEmail,
    });
    setSaving(false);

    if (result.success) {
      setFeedback({ kind: "success", text: result.message || t.saved });
      router.refresh();
    } else {
      setFeedback({ kind: "error", text: result.error || t.saveFailed });
    }
  };

  const departmentOptions = Object.entries(text.departments);
  if (form.department && !text.departments[form.department]) departmentOptions.push([form.department, form.department]);
  const classYearOptions = Object.entries(text.classYears);
  if (form.classYear && !text.classYears[form.classYear]) {
    classYearOptions.push([form.classYear, localizeClassYear(form.classYear, locale) ?? form.classYear]);
  }

  const displayName = form.fullName.trim() || profile.fullName;
  const previewCard: ProfileCardData = {
    id: profile.id,
    fullName: displayName,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    department: form.department || null,
    classYear: form.classYear || null,
    bio: form.bio.trim() || null,
    linkedinUrl: safeHttpUrl(form.linkedinUrl.trim()),
    githubUrl: safeHttpUrl(form.githubUrl.trim()),
    phone: form.phone.trim() || null,
    hidePhone: form.hidePhone,
    hideEmail: form.hideEmail,
    roles,
    projects,
  };

  const errorText = (field: FieldName) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-1 flex items-center gap-1 text-xs text-rose-600">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{errors[field]}</span>
      </p>
    ) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900">{t.heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.subheading}</p>
        </div>
        <button
          type="button"
          onClick={() => setCardOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <IdCard className="h-4 w-4 text-brand-600" aria-hidden="true" />
          <span>{t.previewCard}</span>
        </button>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <MemberAvatar name={displayName} src={profile.avatarUrl} size="lg" locale={locale} />
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-slate-900">{displayName}</p>
          <p className="truncate text-sm text-slate-500">{profile.email}</p>
          {memberSince && <p className="mt-0.5 text-xs text-slate-400">{t.memberSince(memberSince)}</p>}
          <ul aria-label={t.rolesLabel} className="mt-2 flex flex-wrap gap-1.5">
            {roles.map((role) => (
              <li
                key={role}
                className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700"
              >
                <Shield className="h-3 w-3" aria-hidden="true" />
                <span>{ROLE_LABELS[role]?.[locale] ?? role}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <form ref={formRef} noValidate onSubmit={handleSubmit} className="space-y-6">
        <section aria-labelledby="profile-basics" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 id="profile-basics" className="text-sm font-bold text-slate-900">
            {t.sectionBasics}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t.fullName}
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                value={form.fullName}
                onChange={(event) => update("fullName", event.target.value)}
                aria-invalid={errors.fullName ? true : undefined}
                aria-describedby={describedBy(errors.fullName && "fullName-error")}
                className={`${inputBase} ${errors.fullName ? inputError : inputOk}`}
              />
              {errorText("fullName")}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t.email}
              </label>
              <input
                id="email"
                type="email"
                readOnly
                value={profile.email}
                aria-describedby="email-hint"
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <p id="email-hint" className="mt-1 text-xs text-slate-500">
                {t.emailHint}
              </p>
            </div>

            <div>
              <label htmlFor="department" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t.department}
              </label>
              <select
                id="department"
                name="department"
                value={form.department}
                onChange={(event) => update("department", event.target.value)}
                className={`${inputBase} ${inputOk}`}
              >
                <option value="">{t.selectPlaceholder}</option>
                {departmentOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="classYear" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t.classYear}
              </label>
              <select
                id="classYear"
                name="classYear"
                value={form.classYear}
                onChange={(event) => update("classYear", event.target.value)}
                className={`${inputBase} ${inputOk}`}
              >
                <option value="">{t.selectPlaceholder}</option>
                {classYearOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <label htmlFor="bio" className="block text-sm font-semibold text-slate-700">
                  {t.bio}
                </label>
                <span className={`text-xs ${form.bio.length > BIO_MAX - 50 ? "text-rose-600" : "text-slate-400"}`}>
                  {t.bioCount(form.bio.length, BIO_MAX)}
                </span>
              </div>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                maxLength={BIO_MAX}
                value={form.bio}
                onChange={(event) => update("bio", event.target.value)}
                placeholder={t.bioPlaceholder}
                aria-describedby="bio-hint"
                className={`${inputBase} ${inputOk} resize-y leading-relaxed`}
              />
              <p id="bio-hint" className="mt-1 text-xs text-slate-500">
                {t.bioHint}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="profile-links" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 id="profile-links" className="text-sm font-bold text-slate-900">
            {t.sectionLinks}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="linkedinUrl" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t.linkedin}
              </label>
              <div className="relative">
                <Linkedin
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  maxLength={300}
                  placeholder="https://www.linkedin.com/in/..."
                  value={form.linkedinUrl}
                  onChange={(event) => update("linkedinUrl", event.target.value)}
                  aria-invalid={errors.linkedinUrl ? true : undefined}
                  aria-describedby={describedBy(errors.linkedinUrl && "linkedinUrl-error")}
                  className={`${inputBase} pl-10 ${errors.linkedinUrl ? inputError : inputOk}`}
                />
              </div>
              {errorText("linkedinUrl")}
            </div>

            <div>
              <label htmlFor="githubUrl" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t.github}
              </label>
              <div className="relative">
                <Github
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  inputMode="url"
                  maxLength={300}
                  placeholder="https://github.com/..."
                  value={form.githubUrl}
                  onChange={(event) => update("githubUrl", event.target.value)}
                  aria-invalid={errors.githubUrl ? true : undefined}
                  aria-describedby={describedBy(errors.githubUrl && "githubUrl-error")}
                  className={`${inputBase} pl-10 ${errors.githubUrl ? inputError : inputOk}`}
                />
              </div>
              {errorText("githubUrl")}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t.phone}
              </label>
              <div className="relative sm:max-w-sm">
                <Phone
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={40}
                  placeholder="+387 61 234 567"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={describedBy("phone-hint", errors.phone && "phone-error")}
                  className={`${inputBase} pl-10 ${errors.phone ? inputError : inputOk}`}
                />
              </div>
              <p id="phone-hint" className="mt-1 text-xs text-slate-500">
                {t.phoneHint}
              </p>
              {errorText("phone")}
            </div>
          </div>
        </section>

        <section aria-labelledby="profile-privacy" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 id="profile-privacy" className="text-sm font-bold text-slate-900">
            {t.sectionPrivacy}
          </h2>
          {(
            [
              { key: "hidePhone", label: t.hidePhone, hint: t.hidePhoneHint },
              { key: "hideEmail", label: t.hideEmail, hint: t.hideEmailHint },
            ] as const
          ).map(({ key, label, hint }) => (
            <div key={key} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="min-w-0">
                <label htmlFor={key} className="block cursor-pointer text-sm font-semibold text-slate-800">
                  {label}
                </label>
                <p id={`${key}-hint`} className="mt-0.5 text-xs text-slate-500">
                  {hint}
                </p>
              </div>
              <input
                id={key}
                name={key}
                type="checkbox"
                role="switch"
                checked={form[key]}
                onChange={(event) => update(key, event.target.checked)}
                aria-describedby={`${key}-hint`}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              />
            </div>
          ))}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {feedback && (
            <p
              role={feedback.kind === "error" ? "alert" : "status"}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                feedback.kind === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {feedback.kind === "error" ? (
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>{feedback.text}</span>
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            <span>{saving ? t.saving : t.save}</span>
          </button>
        </div>
      </form>

      <DiscordProfileCard user={previewCard} isOpen={cardOpen} onClose={() => setCardOpen(false)} />
    </div>
  );
}
