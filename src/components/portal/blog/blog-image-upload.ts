import { uploadBlogImageAction } from "@/lib/blog/blog-image-actions";
import { BLOG_IMAGE_MAX_BYTES, BLOG_IMAGE_TYPES } from "@/lib/blog/blog-image-rules";

/**
 * Browser side of photo uploads: checks the type, shrinks big photos so phone pictures fit the
 * server limit, then sends the file to the server action.
 */

const MAX_EDGE = 2400;
const SHRINK_ABOVE_BYTES = 1.5 * 1024 * 1024;

export type UploadProblem = "invalidType" | "tooLarge" | "failed";

export interface PreparedImage {
  file: File;
  width: number;
  height: number;
}

export function isImageFile(file: File): boolean {
  return (BLOG_IMAGE_TYPES as readonly string[]).includes(file.type);
}

export function imageFilesFrom(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter(isImageFile);
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Reads the photo's size and re-encodes it as WebP when it is very large. GIFs stay as they are. */
export async function prepareImage(file: File): Promise<PreparedImage | UploadProblem> {
  if (!isImageFile(file)) return "invalidType";
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return "invalidType";
  }
  const { width, height } = bitmap;
  const needsShrink =
    file.type !== "image/gif" && (file.size > SHRINK_ABOVE_BYTES || Math.max(width, height) > MAX_EDGE);
  if (!needsShrink) {
    bitmap.close();
    return file.size > BLOG_IMAGE_MAX_BYTES ? "tooLarge" : { file, width, height };
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = (await canvasToBlob(canvas, "image/webp", 0.85)) ?? (await canvasToBlob(canvas, "image/jpeg", 0.85));
  if (!blob) return "failed";
  if (blob.size > BLOG_IMAGE_MAX_BYTES) return "tooLarge";
  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  const name = `${file.name.replace(/\.[^.]+$/, "") || "photo"}.${extension}`;
  return { file: new File([blob], name, { type: blob.type }), width: canvas.width, height: canvas.height };
}

/** Sends the prepared photo. Returns its public address or the server's message. */
export async function uploadPreparedImage(image: PreparedImage): Promise<{ url: string } | { error: string | null }> {
  const formData = new FormData();
  formData.append("image", image.file);
  try {
    const result = await uploadBlogImageAction(formData);
    if (result.success && result.data) return { url: result.data.url };
    return { error: result.success ? null : result.error };
  } catch {
    return { error: null };
  }
}
