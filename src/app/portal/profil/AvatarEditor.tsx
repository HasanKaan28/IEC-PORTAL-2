"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, LoaderCircle, Trash2 } from "lucide-react";
import MemberAvatar from "@/components/portal/messages/MemberAvatar";
import { removeAvatarAction, uploadAvatarAction } from "@/lib/profile/avatar-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { messagesProfileText } from "@/lib/i18n/portal/messages-profile";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const OUTPUT_SIZE = 512;

/** Crops the photo to a centred square and scales it to 512px, so uploads stay small. */
async function toSquareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas unavailable");
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE
  );
  bitmap.close();
  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob((blob) => resolve(blob), type, 0.86));
  // Browsers without WebP encoding fall back to PNG for toBlob; prefer JPEG in that case.
  const webp = await encode("image/webp");
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await encode("image/jpeg");
  if (jpeg) return jpeg;
  throw new Error("encoding failed");
}

interface AvatarEditorProps {
  name: string;
  avatarUrl: string | null;
  onChange: (avatarUrl: string | null) => void;
  onMessage: (message: { kind: "success" | "error"; text: string }) => void;
}

export default function AvatarEditor({ name, avatarUrl, onChange, onMessage }: AvatarEditorProps) {
  const { locale } = useLocale();
  const t = messagesProfileText[locale].profile;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return onMessage({ kind: "error", text: t.photoInvalid });
    if (file.size > MAX_SOURCE_BYTES) return onMessage({ kind: "error", text: t.photoTooLarge });

    setBusy(true);
    try {
      const image = await toSquareImage(file);
      const formData = new FormData();
      formData.append("avatar", image, image.type === "image/webp" ? "avatar.webp" : "avatar.jpg");
      const result = await uploadAvatarAction(formData);
      if (result.success && result.data) {
        onChange(result.data.avatarUrl);
        onMessage({ kind: "success", text: result.message ?? "" });
        router.refresh();
      } else {
        onMessage({ kind: "error", text: result.success ? t.photoFailed : result.error });
      }
    } catch {
      onMessage({ kind: "error", text: t.photoFailed });
    }
    setBusy(false);
  };

  const handleRemove = async () => {
    setBusy(true);
    const result = await removeAvatarAction();
    setBusy(false);
    if (result.success) {
      onChange(null);
      onMessage({ kind: "success", text: result.message ?? "" });
      router.refresh();
    } else {
      onMessage({ kind: "error", text: result.error });
    }
  };

  const buttonClass =
    "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <div className="relative">
        <MemberAvatar name={name} src={avatarUrl} size="lg" locale={locale} />
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
            <LoaderCircle className="h-5 w-5 animate-spin text-brand-600" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className={buttonClass}>
            <Camera className="h-4 w-4 text-brand-600" aria-hidden="true" />
            {busy ? t.photoUploading : avatarUrl ? t.photoChange : t.photoUpload}
          </button>
          {avatarUrl && (
            <button type="button" onClick={handleRemove} disabled={busy} className={buttonClass}>
              <Trash2 className="h-4 w-4 text-rose-500" aria-hidden="true" />
              {t.photoRemove}
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">{t.photoHint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          onChange={handleFile}
          className="sr-only"
          tabIndex={-1}
          aria-label={t.photoUpload}
        />
      </div>
    </div>
  );
}
