"use server";

import { randomUUID } from "node:crypto";
import { guardedAction, requirePermission, type ActionResult } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { getServerLocale } from "@/lib/i18n/server";
import { blogWriterText } from "@/lib/i18n/portal/blog-writer";
import { RATE_LIMITS, consumeRateLimit } from "@/lib/security/rate-limit";
import { adminText } from "@/lib/i18n/portal/admin";
import { privilegedClient, writeAuditLog } from "@/lib/admin/server-utils";
import { BLOG_IMAGE_MAX_BYTES } from "./blog-image-rules";
import { BLOG_IMAGE_BUCKET, sweepUnusedBlogImages } from "./blog-image-cleanup";

/**
 * Photos for blog posts. They go to the public blog-images bucket under the author's own folder.
 * The caller needs blog.write, the file is identified by its first bytes (not its name or the type
 * the browser reports), and uploads are rate limited per member.
 */

const BUCKET = BLOG_IMAGE_BUCKET;
const EXTENSIONS = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif" } as const;
type ImageType = keyof typeof EXTENSIONS;

function detectImageType(bytes: Uint8Array): ImageType | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (bytes.length >= 6 && (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a")) return "image/gif";
  return null;
}

type AdminClient = ReturnType<typeof createAdminClient>;

/** Creates the bucket on first use when the migration has not been run yet. */
async function ensureBucket(admin: AdminClient) {
  const { data } = await admin.storage.getBucket(BUCKET);
  if (data) return;
  const { error } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: BLOG_IMAGE_MAX_BYTES,
    allowedMimeTypes: Object.keys(EXTENSIONS),
  });
  if (error && !/already exists/i.test(error.message)) throw error;
}

/**
 * Moderators' sweep: deletes photos that no post uses and that are older than a day (younger ones
 * may belong to a draft the editor has not saved yet).
 */
export async function sweepUnusedBlogImagesAction(): Promise<ActionResult<{ checked: number; removed: number }>> {
  return guardedAction<{ checked: number; removed: number }>(async () => {
    const actor = await requirePermission("blog.moderate");
    const t = adminText[await getServerLocale()];
    const admin = await privilegedClient();

    const result = await sweepUnusedBlogImages(admin);
    if (result.removed > 0) {
      try {
        await writeAuditLog(admin, {
          actorId: actor.id,
          action: "blog.images.sweep",
          targetType: "blog_post",
          targetId: null,
          details: { checked: result.checked, removed: result.removed },
        });
      } catch (auditError) {
        console.error("[blog] audit log for photo sweep failed", auditError);
      }
    }
    return { success: true, data: result, message: t.blogList.cleanupDone(result.removed, result.checked) };
  });
}

export async function uploadBlogImageAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return guardedAction<{ url: string }>(async () => {
    const actor = await requirePermission("blog.write");
    const t = blogWriterText[await getServerLocale()].upload;
    if (!isSupabaseAdminConfigured()) return { success: false, error: t.notConfigured };

    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) return { success: false, error: t.invalidType };
    if (file.size > BLOG_IMAGE_MAX_BYTES) return { success: false, error: t.tooLarge };
    if (!(await consumeRateLimit(RATE_LIMITS.blogImageUpload, actor.id))) {
      return { success: false, error: t.rateLimited };
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = detectImageType(bytes);
    if (!type) return { success: false, error: t.invalidType };

    const admin = createAdminClient();
    await ensureBucket(admin);

    const path = `${actor.id}/${randomUUID()}.${EXTENSIONS[type]}`;
    const { error } = await admin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: type, cacheControl: "31536000", upsert: false });
    if (error) throw error;

    return { success: true, data: { url: admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl } };
  });
}
