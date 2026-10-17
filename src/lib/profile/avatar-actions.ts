"use server";

import { revalidatePath } from "next/cache";
import { guardedAction, requireUser, type ActionResult } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { getServerLocale } from "@/lib/i18n/server";
import type { SupportedLocale } from "@/lib/i18n/translations";

/**
 * Profile photos live in a public Supabase Storage bucket, one folder per member. Uploads go
 * through the server: the caller must be signed in, the file is checked by its actual bytes (not
 * the name or the browser-reported type), and the member can only ever write their own folder.
 */

const BUCKET = "avatars";
const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" } as const;
type ImageType = keyof typeof EXTENSIONS;

const TEXT = {
  tr: {
    notConfigured: "Fotoğraf yükleme şu an kullanılamıyor.",
    invalid: "Lütfen JPG, PNG veya WebP biçiminde bir fotoğraf seç.",
    tooLarge: "Fotoğraf en fazla 2 MB olabilir.",
    saved: "Profil fotoğrafın güncellendi.",
    removed: "Profil fotoğrafın kaldırıldı.",
  },
  en: {
    notConfigured: "Photo upload is not available right now.",
    invalid: "Choose a JPG, PNG or WebP photo.",
    tooLarge: "The photo can be at most 2 MB.",
    saved: "Your profile photo has been updated.",
    removed: "Your profile photo has been removed.",
  },
  bs: {
    notConfigured: "Postavljanje fotografija trenutno nije dostupno.",
    invalid: "Odaberi fotografiju u formatu JPG, PNG ili WebP.",
    tooLarge: "Fotografija može imati najviše 2 MB.",
    saved: "Tvoja profilna fotografija je ažurirana.",
    removed: "Tvoja profilna fotografija je uklonjena.",
  },
} satisfies Record<SupportedLocale, Record<string, string>>;

type AdminClient = ReturnType<typeof createAdminClient>;

/** Identifies the image type from the file's first bytes. */
function detectImageType(bytes: Uint8Array): ImageType | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  return null;
}

async function ensureBucket(admin: AdminClient) {
  const { data } = await admin.storage.getBucket(BUCKET);
  if (data) return;
  const { error } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: Object.keys(EXTENSIONS),
  });
  if (error && !/already exists/i.test(error.message)) throw error;
}

/** Deletes every file in the member's folder except keepPath. */
async function removeOldPhotos(admin: AdminClient, userId: string, keepPath?: string) {
  const { data, error } = await admin.storage.from(BUCKET).list(userId, { limit: 100 });
  if (error || !data) return;
  const stale = data.map((file) => `${userId}/${file.name}`).filter((path) => path !== keepPath);
  if (stale.length > 0) await admin.storage.from(BUCKET).remove(stale);
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult<{ avatarUrl: string }>> {
  return guardedAction<{ avatarUrl: string }>(async () => {
    const user = await requireUser();
    const t = TEXT[await getServerLocale()];
    if (!isSupabaseAdminConfigured()) return { success: false, error: t.notConfigured };

    const file = formData.get("avatar");
    if (!(file instanceof File) || file.size === 0) return { success: false, error: t.invalid };
    if (file.size > MAX_BYTES) return { success: false, error: t.tooLarge };
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = detectImageType(bytes);
    if (!type) return { success: false, error: t.invalid };

    const admin = createAdminClient();
    await ensureBucket(admin);

    const path = `${user.id}/${Date.now()}.${EXTENSIONS[type]}`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: type, cacheControl: "31536000", upsert: false });
    if (uploadError) throw uploadError;

    const avatarUrl = admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const { error: updateError } = await (admin.from("profiles") as any)
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (updateError) {
      await admin.storage.from(BUCKET).remove([path]);
      throw updateError;
    }

    await removeOldPhotos(admin, user.id, path);
    revalidatePath("/portal", "layout");
    return { success: true, data: { avatarUrl }, message: t.saved };
  });
}

export async function removeAvatarAction(): Promise<ActionResult> {
  return guardedAction(async () => {
    const user = await requireUser();
    const t = TEXT[await getServerLocale()];
    if (!isSupabaseAdminConfigured()) return { success: false, error: t.notConfigured };

    const admin = createAdminClient();
    const { error } = await (admin.from("profiles") as any)
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) throw error;

    await removeOldPhotos(admin, user.id);
    revalidatePath("/portal", "layout");
    return { success: true, message: t.removed };
  });
}
