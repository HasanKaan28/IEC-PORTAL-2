"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import AuthFrame, { PortalNotConfiguredNotice, inputClass } from "@/components/portal/auth/AuthFrame";
import { signUpAction } from "@/lib/auth/auth-actions";
import { isAllowedStudentEmail } from "@/lib/auth/email-policy";
import { useLocale } from "@/lib/i18n/locale-context";
import { portalShellText } from "@/lib/i18n/portal/shell";
import {
  DEPARTMENTS,
  OTHER_DEPARTMENT_OPTION,
  OTHER_DEPARTMENT_TEXT,
  isEnglishDepartmentName,
} from "@/lib/profile/departments";
import { FILL_TIME_FIELD, HONEYPOT_FIELD } from "@/lib/security/spam-guard";

/** Stored values match the profile form (messages-profile classYears keys); labels follow the UI language. */
const CLASS_YEARS = [
  { value: "Hazırlık (ELS)", key: "prep" },
  { value: "1. Sınıf", key: "y1" },
  { value: "2. Sınıf", key: "y2" },
  { value: "3. Sınıf", key: "y3" },
  { value: "4. Sınıf", key: "y4" },
  { value: "Yüksek Lisans", key: "grad" },
] as const;

export default function SignUpForm({ configured }: { configured: boolean }) {
  const { locale } = useLocale();
  const t = portalShellText[locale].auth;
  const s = t.signUp;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [departmentChoice, setDepartmentChoice] = useState("");
  const [otherDepartment, setOtherDepartment] = useState("");
  const [otherDepartmentError, setOtherDepartmentError] = useState(false);
  const other = OTHER_DEPARTMENT_TEXT[locale];
  const isOtherDepartment = departmentChoice === OTHER_DEPARTMENT_OPTION;
  const shownAt = useRef(0);

  useEffect(() => {
    shownAt.current = performance.now();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    formData.set(FILL_TIME_FIELD, String(Math.round(performance.now() - shownAt.current)));
    const email = String(formData.get("email") ?? "");
    if (!isAllowedStudentEmail(email)) {
      setEmailError(true);
      document.getElementById("signup-email")?.focus();
      return;
    }
    setEmailError(false);
    if (isOtherDepartment && !isEnglishDepartmentName(otherDepartment)) {
      setOtherDepartmentError(true);
      document.getElementById("signup-department-other")?.focus();
      return;
    }
    setOtherDepartmentError(false);
    setLoading(true);
    try {
      const result = await signUpAction(formData);
      if (result.success) {
        setDone(result.message ?? "");
      } else {
        setError(result.error || s.failed);
      }
    } catch {
      setError(s.failed);
    }
    setLoading(false);
  };

  const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

  return (
    <AuthFrame
      title={s.title}
      subtitle={s.subtitle}
      wide
      footer={
        configured && (
          <p>
            {s.haveAccount}{" "}
            <Link href="/portal/giris" className="font-semibold text-brand-700 hover:text-brand-800">
              {s.signIn}
            </Link>
          </p>
        )
      }
    >
      {!configured ? (
        <PortalNotConfiguredNotice />
      ) : done !== null ? (
        <div className="space-y-4 text-center" role="status">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <MailCheck className="w-6 h-6" aria-hidden="true" />
          </span>
          <h2 className="font-display text-lg font-semibold text-slate-900">{s.successTitle}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{done}</p>
          <Link
            href="/portal/giris"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {s.signIn}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700" role="alert">
              <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="signup-name" className={labelClass}>
              {s.fullName}
            </label>
            <input
              id="signup-name"
              type="text"
              name="fullName"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              placeholder={s.fullNamePlaceholder}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="signup-email" className={labelClass}>
              {t.emailLabel}
            </label>
            <input
              id="signup-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder={t.emailPlaceholder}
              aria-invalid={emailError}
              aria-describedby="signup-email-hint"
              onChange={() => emailError && setEmailError(false)}
              className={inputClass}
            />
            <p id="signup-email-hint" className={`mt-1.5 text-xs ${emailError ? "font-medium text-rose-600" : "text-slate-500"}`}>
              {emailError ? t.emailDomainError : t.emailHint}
            </p>
          </div>

          <div>
            <label htmlFor="signup-password" className={labelClass}>
              {t.passwordLabel}
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                aria-describedby="signup-password-hint"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                aria-pressed={showPassword}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
              >
                {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
            <p id="signup-password-hint" className="mt-1.5 text-xs text-slate-500">
              {s.passwordHint}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="signup-department" className={labelClass}>
                {s.department}
              </label>
              <select
                id="signup-department"
                name="department"
                required
                value={departmentChoice}
                onChange={(event) => {
                  setDepartmentChoice(event.target.value);
                  setOtherDepartmentError(false);
                }}
                className={inputClass}
              >
                <option value="" disabled>
                  {s.departmentPlaceholder}
                </option>
                {DEPARTMENTS.map((department) => (
                  <option key={department.value} value={department.value}>
                    {department[locale]}
                  </option>
                ))}
                <option value={OTHER_DEPARTMENT_OPTION}>{other.option}</option>
              </select>
            </div>
            <div>
              <label htmlFor="signup-year" className={labelClass}>
                {s.classYear}
              </label>
              <select id="signup-year" name="classYear" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  {s.classYearPlaceholder}
                </option>
                {CLASS_YEARS.map((year) => (
                  <option key={year.key} value={year.value}>
                    {s.years[year.key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isOtherDepartment && (
            <div>
              <label htmlFor="signup-department-other" className={labelClass}>
                {other.label}
              </label>
              <input
                id="signup-department-other"
                type="text"
                name="departmentOther"
                required
                maxLength={80}
                lang="en"
                autoComplete="off"
                spellCheck={false}
                value={otherDepartment}
                onChange={(event) => {
                  setOtherDepartment(event.target.value);
                  if (otherDepartmentError) setOtherDepartmentError(false);
                }}
                placeholder={other.placeholder}
                aria-invalid={otherDepartmentError}
                aria-describedby="signup-department-other-hint"
                className={inputClass}
              />
              <p
                id="signup-department-other-hint"
                className={`mt-1.5 text-xs ${otherDepartmentError ? "font-medium text-rose-600" : "text-slate-500"}`}
              >
                {otherDepartmentError ? other.error : other.hint}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="signup-phone" className={labelClass}>
              {s.phone} <span className="font-normal text-slate-400">({s.optional})</span>
            </label>
            <input
              id="signup-phone"
              type="tel"
              name="phone"
              maxLength={40}
              autoComplete="tel"
              placeholder="+387 6x xxx xxx"
              className={inputClass}
            />
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <input
              id="signup-kvkk"
              type="checkbox"
              name="kvkkConsent"
              required
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-brand-500/40"
            />
            <label htmlFor="signup-kvkk" className="cursor-pointer text-sm leading-relaxed text-slate-600">
              {s.kvkkBefore}
              <Link href="/kvkk" target="_blank" className="font-semibold text-brand-700 hover:underline">
                {s.kvkkLink}
              </Link>
              {s.kvkkAfter}
            </label>
          </div>

          {/* Spam trap: off screen and hidden from screen readers, so only bots fill it in. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="signup-hp">Leave this field empty</label>
            <input id="signup-hp" type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{s.submitting}</span>
              </>
            ) : (
              <>
                <span>{s.submit}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthFrame>
  );
}
